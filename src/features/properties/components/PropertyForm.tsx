import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Input } from '@/components/ui/input'
// using native select controls for simplicity
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { useCreatePropertyMutation, useGetPropertyQuery, useUpdatePropertyMutation, PropertyCreate, type PropertyResponse } from '@/features/properties/api/propertiesApi'
import { useToast } from '@/hooks/use-toast'
import ImageUpload from '@/components/common/media/ImageUpload'
import LocationPicker from '@/components/common/map/LocationPicker'
import { useGetUsersQuery } from '@/features/users/api/usersApi'
import { useUserRole } from '@/hooks/useUserRole'
import { useGetAmenitiesQuery } from '@/features/core/api/amenitiesApi'
import { getErrorMessage } from '@/lib/errors'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import Combobox from '@/components/ui/combobox'
import AddressAutocomplete from './parts/AddressAutocomplete'
import MapPreview from './parts/MapPreview'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Textarea } from '@/components/ui/textarea'
import { useDebounce } from '@/hooks/useDebounce'

const numPreprocess = (v: unknown) => (v === '' || v === null || v === undefined ? undefined : Number(v))

const schema = z.object({
  title: z.string().min(3),
  description: z.string().optional(),
  property_type: z.enum(['apartment', 'house', 'builder_floor', 'room'], { required_error: 'Property type is required' }),
  purpose: z.enum(['buy', 'rent', 'short_stay'], { required_error: 'Purpose is required' }),
  status: z.string().optional(),
  base_price: z.preprocess(numPreprocess, z.number().min(1, "Price is required")),
  city: z.string().min(1, "City is required"),
  locality: z.string().min(1, "Locality is required"),
  address: z.string().optional(),
  latitude: z.preprocess(numPreprocess, z.number().optional()),
  longitude: z.preprocess(numPreprocess, z.number().optional()),
  owner_id: z.preprocess((v) => (v === '' ? undefined : Number(v)), z.number().optional()),
  is_available: z.preprocess((v) => (v === 'true' ? true : v === 'false' ? false : v), z.boolean().optional()),
  available_from: z.string().optional(),
  amenity_ids: z.array(z.number()).optional(),
  pincode: z.string().optional(),
  area_sqft: z.preprocess(numPreprocess, z.number().min(1, "Area is required")),
  bedrooms: z.preprocess(numPreprocess, z.number().min(0)),
  bathrooms: z.preprocess(numPreprocess, z.number().min(0)),
  balconies: z.preprocess(numPreprocess, z.number().min(0)),
  parking_spaces: z.preprocess(numPreprocess, z.number().min(0)),
  floor_number: z.preprocess(numPreprocess, z.number().min(0)),
  total_floors: z.preprocess(numPreprocess, z.number().min(1)),
  age_of_property: z.preprocess(numPreprocess, z.number().min(0)),
  max_occupancy: z.preprocess(numPreprocess, z.number().min(1)),
  minimum_stay_days: z.preprocess(numPreprocess, z.number().min(1)),
  features: z.array(z.string()).optional(),
  owner_name: z.string().optional(),
  owner_contact: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

const PropertyForm = ({ id, onSuccess }: { id?: number; onSuccess?: (id: number) => void }) => {
  const { toast } = useToast()
  const [images, setImages] = useState<string[]>([])
  const [primaryImage, setPrimaryImage] = useState<string | null>(null)
  const { user: me, role } = useUserRole()
  // Owner selection mode: search or direct ID
  const [ownerMode, setOwnerMode] = useState<'search' | 'id'>('search')
  const [ownerSearch, setOwnerSearch] = useState('')
  const dq = useDebounce(ownerSearch, 300)
  const users = useGetUsersQuery(
    {
      page: 1,
      limit: 20,
      q: dq || undefined,
      ...(role === 'agent' && me?.agent_id ? { agent_id: me.agent_id } : {}),
    },
    { skip: ownerMode !== 'search' }
  )
  const amenities = useGetAmenitiesQuery()
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: '',
      description: '',
      property_type: '' as 'house' | 'apartment' | 'builder_floor' | 'room',
      purpose: '' as 'buy' | 'rent' | 'short_stay',
      status: 'available',
      base_price: undefined,
      city: '',
      locality: '',
      address: '',
      latitude: undefined,
      longitude: undefined,
      owner_id: undefined,
      is_available: true,
      available_from: '',
      amenity_ids: [],
      pincode: '',
      area_sqft: undefined,
      bedrooms: 0,
      bathrooms: 0,
      balconies: 0,
      parking_spaces: 0,
      floor_number: 0,
      total_floors: 1,
      age_of_property: 0,
      max_occupancy: 1,
      minimum_stay_days: 1,
      features: [],
      owner_name: '',
      owner_contact: '',
    }
  })
  const { reset, setValue, watch } = form

  const isEdit = !!id
  const { data, isLoading } = useGetPropertyQuery(id!, { skip: !isEdit })
  const [createProperty, createState] = useCreatePropertyMutation()
  const [updateProperty, updateState] = useUpdatePropertyMutation()

  useEffect(() => {
    if (data) {
      const extras = data as PropertyResponse & {
        is_available?: boolean
        available_from?: string
        amenities?: Array<{ id: number }>
        thumbnail_url?: string
      }
      const amenityIds = Array.isArray(extras.amenities)
        ? extras.amenities.map((amenity) => Number(amenity.id)).filter((value) => !Number.isNaN(value))
        : []
      reset({
        title: data.title,
        description: data.description,
        property_type: data.property_type,
        purpose: data.purpose,
        base_price: data.base_price,
        city: data.city,
        locality: data.locality,
        pincode: data.pincode,
        area_sqft: data.area_sqft,
        bedrooms: data.bedrooms,
        bathrooms: data.bathrooms,
        balconies: data.balconies,
        parking_spaces: data.parking_spaces,
        floor_number: data.floor_number,
        total_floors: data.total_floors,
        age_of_property: data.age_of_property,
        max_occupancy: data.max_occupancy,
        minimum_stay_days: data.minimum_stay_days,
        status: data.status,
        owner_id: data.owner_id,
        is_available: extras.is_available,
        available_from: extras.available_from,
        amenity_ids: amenityIds,
        features: data.features || [],
        owner_name: data.owner_name,
        owner_contact: data.owner_contact,
        latitude: data.latitude,
        longitude: data.longitude,
      })
      setImages((data.images || []).map((image) => image.image_url))
      setPrimaryImage(extras.thumbnail_url ?? data.main_image_url ?? null)
    }
  }, [data, reset])

  /**
   * Handles form submission for creating or updating a property.
   * For admins/agents, includes owner_id if selected; for users, creates for self.
   * Uploads images separately if needed, but here uses pre-uploaded URLs.
   * @param values - Form values from react-hook-form
   */
  const onSubmit = async (values: FormValues) => {
    try {
      const payload: PropertyCreate = {
        title: values.title,
        description: values.description,
        property_type: values.property_type,
        purpose: values.purpose,
        base_price: values.base_price,
        latitude: values.latitude,
        longitude: values.longitude,
        city: values.city,
        locality: values.locality,
        pincode: values.pincode,
        area_sqft: values.area_sqft,
        bedrooms: values.bedrooms,
        bathrooms: values.bathrooms,
        balconies: values.balconies,
        parking_spaces: values.parking_spaces,
        floor_number: values.floor_number,
        total_floors: values.total_floors,
        age_of_property: values.age_of_property,
        max_occupancy: values.max_occupancy,
        minimum_stay_days: values.minimum_stay_days,
        amenity_ids: values.amenity_ids || [],
        features: values.features || [],
        main_image_url: primaryImage || '',
        owner_name: values.owner_name,
        owner_contact: values.owner_contact
      }
      if (isEdit && id) {
        const res = await updateProperty({ id, data: payload }).unwrap()
        toast({ title: 'Updated', description: 'Property updated successfully' })
        onSuccess?.(res.id)
      } else {
        // Pass ownerId only when admin/agent and owner selected
        const ownerIdParam = (role === 'admin' || role === 'agent') && values.owner_id ? values.owner_id : undefined
        const res = await createProperty({ data: payload, ownerId: ownerIdParam }).unwrap()
        toast({ title: 'Created', description: 'Property created successfully' })
        onSuccess?.(res.id)
      }
    } catch (err: unknown) {
      toast({ title: 'Save failed', description: getErrorMessage(err, 'Please check inputs'), variant: 'destructive' })
    }
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">{isEdit ? 'Edit Property' : 'Create Property'}</h1>
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={(e) => void form.handleSubmit(onSubmit)(e)} className="grid gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Spacious 2BHK in Gurgaon" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="md:col-span-2">
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea rows={4} placeholder="Spacious 3BHK with modern amenities and excellent location" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div>
                <FormField
                  control={form.control}
                  name="property_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="apartment">Apartment</SelectItem>
                          <SelectItem value="house">House</SelectItem>
                          <SelectItem value="builder_floor">Builder Floor</SelectItem>
                          <SelectItem value="room">Room</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div>
                <FormField
                  control={form.control}
                  name="purpose"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Purpose</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="buy">Buy</SelectItem>
                          <SelectItem value="rent">Rent</SelectItem>
                          <SelectItem value="short_stay">Short Stay</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div>
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="available">Available</SelectItem>
                          <SelectItem value="rented">Rented</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div>
                <FormField
                  control={form.control}
                  name="base_price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="50000" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div>
                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City</FormLabel>
                      <FormControl>
                        <Input placeholder="Gurgaon" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div>
                <FormField
                  control={form.control}
                  name="locality"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Locality</FormLabel>
                      <FormControl>
                        <Input placeholder="DLF Phase 2" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="md:col-span-2">
                <FormLabel>Address</FormLabel>
                <AddressAutocomplete
                  value={''}
                  onSelect={(addr) => {
                    setValue('address', addr.display_name)
                    setValue('latitude', Number(addr.lat))
                    setValue('longitude', Number(addr.lon))
                    if (addr.address) {
                      setValue('city', addr.address.city || addr.address.town || addr.address.village || addr.address.municipality || addr.address.city_district || '')
                      setValue('locality', addr.address.suburb || addr.address.neighbourhood || addr.address.quarter || addr.address.hamlet || addr.address.state_district || '')
                    }
                  }}
                />
                {(() => {
                  const lat = watch('latitude')
                  const lng = watch('longitude')
                  if (!lat || !lng) return null
                  return <div className="mt-2"><MapPreview lat={Number(lat)} lng={Number(lng)} /></div>
                })()}
              </div>
              <div className="md:col-span-2">
                <FormLabel>Location</FormLabel>
                <LocationPicker
                  value={(() => {
                    const lat = data?.latitude
                    const lng = data?.longitude
                    return typeof lat === 'number' && typeof lng === 'number' ? { lat, lng } : null
                  })()}
                  onChange={(p) => {
                    setValue('latitude', p.lat)
                    setValue('longitude', p.lng)
                  }}
                />
              </div>
              <div className="md:col-span-2">
                <FormLabel>Media</FormLabel>
                <ImageUpload value={images} onChange={setImages} primary={primaryImage} onPrimaryChange={setPrimaryImage} />
              </div>
              <div>
                <FormField
                  control={form.control}
                  name="latitude"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Latitude</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.000001" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div>
                <FormField
                  control={form.control}
                  name="longitude"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Longitude</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.000001" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              {(role === 'admin' || role === 'agent') && (
                <div className="md:col-span-2 grid gap-2">
                  <FormLabel>Owner Selection</FormLabel>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    <div>
                      <FormLabel className="text-xs text-muted-foreground">Mode</FormLabel>
                      <Select value={ownerMode} onValueChange={(v) => setOwnerMode(v as 'id' | 'search')}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="search">Search Users</SelectItem>
                          <SelectItem value="id">Enter User ID</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {ownerMode === 'search' && (
                      <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-2">
                        <div>
                          <FormLabel className="text-xs text-muted-foreground">Search</FormLabel>
                          <Input placeholder="Search users by name or phone" value={ownerSearch} onChange={(e) => setOwnerSearch(e.target.value)} />
                        </div>
                        <FormField
                          control={form.control}
                          name="owner_id"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs text-muted-foreground">Select User</FormLabel>
                              <FormControl>
                                <Combobox
                                  items={(users.data?.items || []).map((u) => ({ value: String(u.id), label: `${u.full_name || 'User'} • ${u.phone || 'N/A'} • #${u.id}` }))}
                                  value={field.value ? String(field.value) : ''}
                                  onChange={(v) => field.onChange(v ? Number(v) : undefined)}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    )}
                    {ownerMode === 'id' && (
                      <FormField
                        control={form.control}
                        name="owner_id"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs text-muted-foreground">Owner ID</FormLabel>
                            <FormControl>
                              <Input type="number" placeholder="e.g. 123" value={field.value ? String(field.value) : ''} onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                  </div>
                </div>
              )}
              <div>
                <FormField
                  control={form.control}
                  name="is_available"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Available</FormLabel>
                      <Select onValueChange={(v) => field.onChange(v === 'true')} defaultValue={field.value ? 'true' : 'false'}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="true">Yes</SelectItem>
                          <SelectItem value="false">No</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div>
                <FormField
                  control={form.control}
                  name="available_from"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Available From</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="md:col-span-2">
                <FormField
                  control={form.control}
                  name="amenity_ids"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Amenities</FormLabel>
                      <FormControl>
                        <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
                          {amenities.data?.map((a) => (
                            <label key={a.id} className="flex items-center gap-2 text-sm">
                              <input
                                type="checkbox"
                                value={a.id}
                                checked={field.value?.includes(a.id) || false}
                                onChange={(e) => {
                                  const currentValues = field.value || []
                                  if (e.target.checked) {
                                    field.onChange([...currentValues, a.id])
                                  } else {
                                    field.onChange(currentValues.filter((v: number) => v !== a.id))
                                  }
                                }}
                              />
                              <span>{a.name}</span>
                            </label>
                          ))}
                          {!amenities.data && <div className="text-sm text-muted-foreground">No amenities</div>}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="md:col-span-2 flex justify-end gap-2">
                <Button type="submit" disabled={createState.isLoading || updateState.isLoading || isLoading}>
                  {isEdit ? (updateState.isLoading ? 'Saving…' : 'Save Changes') : createState.isLoading ? 'Creating…' : 'Create Property'}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}

export default PropertyForm
