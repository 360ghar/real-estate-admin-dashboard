import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Input } from '@/components/ui/input'
// using native select controls for simplicity
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { useCreatePropertyMutation, useGetPropertyQuery, useUpdatePropertyMutation, PropertyCreate } from '@/store/services/propertiesApi'
import { useToast } from '@/hooks/use-toast'
import ImageUpload from '@/components/media/ImageUpload'
import LocationPicker from '@/components/map/LocationPicker'
import { useListUsersQuery } from '@/store/services/usersApi'
import { useAppSelector } from '@/hooks/redux'
import { selectCurrentUser } from '@/store/slices/authSlice'
import { useGetAmenitiesQuery } from '@/store/services/amenitiesApi'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import Combobox from '@/components/ui/combobox'
import AddressAutocomplete from './parts/AddressAutocomplete'
import MapPreview from './parts/MapPreview'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'

const schema = z.object({
  title: z.string().min(3),
  description: z.string().min(1, "Description is required"),
  type: z.string().min(1, "Property type is required"),
  purpose: z.string().min(1, "Purpose is required"),
  status: z.string().optional(),
  price: z.preprocess((v) => (v === '' || v === null || v === undefined ? undefined : Number(v)), z.number().min(1, "Price is required")),
  city: z.string().min(1, "City is required"),
  locality: z.string().min(1, "Locality is required"),
  address: z.string().optional(),
  latitude: z.preprocess((v) => (v === '' || v === null || v === undefined ? undefined : Number(v)), z.number()),
  longitude: z.preprocess((v) => (v === '' || v === null || v === undefined ? undefined : Number(v)), z.number()),
  owner_id: z.preprocess((v) => (v === '' ? undefined : Number(v)), z.number().optional()),
  is_available: z.preprocess((v) => (v === 'true' ? true : v === 'false' ? false : v), z.boolean().optional()),
  available_from: z.string().optional(),
  amenities: z.array(z.number()).optional(),
  pincode: z.string().min(1, "Pincode is required"),
  area_sqft: z.preprocess((v) => (v === '' || v === null || v === undefined ? undefined : Number(v)), z.number().min(1, "Area is required")),
  bedrooms: z.preprocess((v) => (v === '' || v === null || v === undefined ? undefined : Number(v)), z.number().min(0)),
  bathrooms: z.preprocess((v) => (v === '' || v === null || v === undefined ? undefined : Number(v)), z.number().min(0)),
  balconies: z.preprocess((v) => (v === '' || v === null || v === undefined ? undefined : Number(v)), z.number().min(0)),
  parking_spaces: z.preprocess((v) => (v === '' || v === null || v === undefined ? undefined : Number(v)), z.number().min(0)),
  floor_number: z.preprocess((v) => (v === '' || v === null || v === undefined ? undefined : Number(v)), z.number().min(0)),
  total_floors: z.preprocess((v) => (v === '' || v === null || v === undefined ? undefined : Number(v)), z.number().min(1)),
  age_of_property: z.preprocess((v) => (v === '' || v === null || v === undefined ? undefined : Number(v)), z.number().min(0)),
  max_occupancy: z.preprocess((v) => (v === '' || v === null || v === undefined ? undefined : Number(v)), z.number().min(1)),
  minimum_stay_days: z.preprocess((v) => (v === '' || v === null || v === undefined ? undefined : Number(v)), z.number().min(1)),
  features: z.array(z.string()).optional(),
  owner_name: z.string().min(1, "Owner name is required"),
  owner_contact: z.string().min(1, "Owner contact is required"),
})

type FormValues = z.infer<typeof schema>

const PropertyForm = ({ id, onSuccess }: { id?: number; onSuccess?: (id: number) => void }) => {
  const { toast } = useToast()
  const [images, setImages] = useState<string[]>([])
  const [primaryImage, setPrimaryImage] = useState<string | null>(null)
  const me = useAppSelector(selectCurrentUser)
  const role = (me?.role as 'admin' | 'agent' | 'user') || (me?.agent_id ? 'agent' : 'admin')
  const users = useListUsersQuery(role === 'agent' && me?.agent_id ? { agent_id: me.agent_id } : {})
  const amenities = useGetAmenitiesQuery()
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: '',
      description: '',
      type: '',
      purpose: '',
      status: 'available',
      price: undefined,
      city: '',
      locality: '',
      address: '',
      latitude: undefined,
      longitude: undefined,
      owner_id: undefined,
      is_available: true,
      available_from: '',
      amenities: [],
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
  const { data, isFetching } = useGetPropertyQuery(id!, { skip: !isEdit })
  const [createProperty, createState] = useCreatePropertyMutation()
  const [updateProperty, updateState] = useUpdatePropertyMutation()

  useEffect(() => {
    if (data) {
      reset({
        title: data.title,
        description: data.description,
        type: data.property_type,
        purpose: data.purpose,
        price: data.base_price,
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
        owner_id: (data as any).owner_id,
        is_available: (data as any).is_available,
        available_from: (data as any).available_from,
        amenities: (data as any).amenities || [],
        features: data.features || [],
        owner_name: data.owner_name,
        owner_contact: data.owner_contact,
        latitude: data.location.latitude,
        longitude: data.location.longitude,
      })
      setImages(data.images || [])
      setPrimaryImage((data as any)?.thumbnail_url || null)
    }
  }, [data, reset])

  const onSubmit = async (values: FormValues) => {
    try {
      const payload: PropertyCreate = {
        title: values.title,
        description: values.description,
        property_type: values.type,
        purpose: values.purpose,
        base_price: values.price,
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
        amenity_ids: values.amenities || [],
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
        const res = await createProperty({ data: payload }).unwrap()
        toast({ title: 'Created', description: 'Property created successfully' })
        onSuccess?.(res.id)
      }
    } catch (e: any) {
      toast({ title: 'Save failed', description: e?.data?.detail || 'Please check inputs', variant: 'destructive' })
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
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 md:grid-cols-2">
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
            <div>
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type</FormLabel>
                    <FormControl>
                      <Input placeholder="apartment" {...field} />
                    </FormControl>
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
                        <SelectItem value="rent">Rent</SelectItem>
                        <SelectItem value="sale">Sale</SelectItem>
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
                name="price"
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
                const lat = watch('latitude') as any
                const lng = watch('longitude') as any
                if (!lat || !lng) return null
                return <div className="mt-2"><MapPreview lat={Number(lat)} lng={Number(lng)} /></div>
              })()}
            </div>
            <div className="md:col-span-2">
              <FormLabel>Location</FormLabel>
              <LocationPicker
                value={(() => {
                  const lat = (data as any)?.latitude
                  const lng = (data as any)?.longitude
                  return lat && lng ? { lat, lng } : null
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
            <div>
              <FormField
                control={form.control}
                name="owner_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Owner</FormLabel>
                    <FormControl>
                      <Combobox
                        items={(users.data?.results || []).map((u) => ({ value: String(u.id), label: u.full_name || u.phone || `User ${u.id}` }))}
                        value={String((data as any)?.owner_id || '')}
                        onChange={(v) => field.onChange(v ? Number(v) : undefined)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
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
                name="amenities"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amenities</FormLabel>
                    <FormControl>
                      <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
                        {amenities.data?.results?.map((a) => (
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
                        {!amenities.data && <div className="text-sm text-slate-500">No amenities</div>}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="md:col-span-2 flex justify-end gap-2">
              <Button type="submit" disabled={createState.isLoading || updateState.isLoading || isFetching}>
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
