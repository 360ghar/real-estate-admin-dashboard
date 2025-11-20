import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Form } from '@/components/ui/form'
import {
  useCreatePropertyMutation,
  useGetPropertyQuery,
  useUpdatePropertyMutation
} from '@/features/properties/api/propertiesApi'
import { PropertyCreate, PropertyUpdate } from '@/types'
import { useToast } from '@/hooks/use-toast'
import { useAppSelector } from '@/hooks/redux'
import { selectCurrentUser } from '@/features/auth/slices/authSlice'
import { propertySchema, PropertyFormValues } from '../schemas'
import { PropertyBasicInfo } from './forms/PropertyBasicInfo'
import { PropertyLocation } from './forms/PropertyLocation'
import { PropertyDetails } from './forms/PropertyDetails'
import { PropertyAvailability } from './forms/PropertyAvailability'
import { PropertyMedia } from './forms/PropertyMedia'
import { PropertyOwner } from './forms/PropertyOwner'
import { Loader2 } from 'lucide-react'
import { getErrorMessage } from '@/lib/error-utils'
import { cn } from '@/lib/utils'

const SimpleTabs = ({
  tabs,
  content
}: {
  tabs: { id: string; label: string }[],
  content: Record<string, React.ReactNode>
}) => {
  const [active, setActive] = useState(tabs[0].id)
  return (
    <div className="w-full">
      <div className="grid w-full grid-cols-5 bg-muted p-1 rounded-lg mb-6">
        {tabs.map(t => (
          <button
            key={t.id}
            type="button"
            onClick={() => setActive(t.id)}
            className={cn(
              "py-1.5 text-sm font-medium transition-all rounded-md",
              active === t.id ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:bg-background/50"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div>
        {content[active]}
      </div>
    </div>
  )
}

interface PropertyFormProps {
  id?: number
  onSuccess?: (id: number) => void
}

const PropertyForm = ({ id, onSuccess }: PropertyFormProps) => {
  const { toast } = useToast()
  const isEdit = !!id

  // Media state (separate from form for now to match existing image upload component)
  const [images, setImages] = useState<string[]>([])
  const [primaryImage, setPrimaryImage] = useState<string | null>(null)

  const user = useAppSelector(selectCurrentUser)
  const role = (user?.role as 'admin' | 'agent' | 'user') || (user?.agent_id ? 'agent' : 'admin')

  const { data: property, isLoading: isLoadingProperty } = useGetPropertyQuery(id!, { skip: !isEdit })
  const [createProperty, { isLoading: isCreating }] = useCreatePropertyMutation()
  const [updateProperty, { isLoading: isUpdating }] = useUpdatePropertyMutation()

  const form = useForm<PropertyFormValues>({
    resolver: zodResolver(propertySchema),
    defaultValues: {
      title: '',
      description: '',
      property_type: 'apartment',
      purpose: 'rent',
      status: 'available',
      base_price: 0,
      city: '',
      locality: '',
      address: '',
      pincode: '',
      latitude: undefined,
      longitude: undefined,

      area_sqft: 0,
      bedrooms: 0,
      bathrooms: 0,
      balconies: 0,
      parking_spaces: 0,
      floor_number: 0,
      total_floors: 1,
      age_of_property: 0,
      max_occupancy: 1,
      minimum_stay_days: 1,

      amenity_ids: [],
      features: [],
      is_available: true,
      available_from: new Date().toISOString().split('T')[0],

      owner_id: undefined,
      owner_name: '',
      owner_contact: '',
    }
  })

  useEffect(() => {
    if (property) {
      // Map API data to form values
      form.reset({
        title: property.title,
        description: property.description || '',
        property_type: property.property_type,
        purpose: property.purpose,
        status: property.status,
        base_price: property.base_price,
        city: property.city || '',
        locality: property.locality || '',
        address: property.full_address || '',
        pincode: property.pincode || '',
        latitude: property.latitude ?? property.location?.latitude,
        longitude: property.longitude ?? property.location?.longitude,

        area_sqft: property.area_sqft || 0,
        bedrooms: property.bedrooms || 0,
        bathrooms: property.bathrooms || 0,
        balconies: property.balconies || 0,
        parking_spaces: property.parking_spaces || 0,
        floor_number: property.floor_number || 0,
        total_floors: property.total_floors || 1,
        age_of_property: property.age_of_property || 0,
        max_occupancy: property.max_occupancy || 1,
        minimum_stay_days: property.minimum_stay_days || 1,

        amenity_ids: property.amenities?.map(a => a.id) || [],
        features: property.features || [],
        is_available: property.is_available,
        available_from: property.available_from ? property.available_from.split('T')[0] : '',

        owner_id: property.owner_id,
        owner_name: property.owner_name || '',
        owner_contact: property.owner_contact || '',
      })

      // Handle images
      if (property.images && property.images.length > 0) {
        setImages(property.images.map(img => img.image_url))
        // Find main image
        const main = property.images.find(img => img.is_main_image)
        setPrimaryImage(main ? main.image_url : property.main_image_url || null)
      } else {
        setImages([])
        setPrimaryImage(property.main_image_url || null)
      }
    }
  }, [property, form])

  const onSubmit = async (values: PropertyFormValues) => {
    try {
      const payload: PropertyCreate = {
        ...values,
        // Ensure we pass number for owner_id if set
        main_image_url: primaryImage || (images.length > 0 ? images[0] : null),
      }

      if (isEdit && id) {
        const updatePayload: PropertyUpdate = { ...payload }
        await updateProperty({ id, data: updatePayload }).unwrap()
        toast({ title: 'Success', description: 'Property updated successfully' })
        onSuccess?.(id)
      } else {
        // For create, we might need to pass ownerId separately if it's an admin action
        // But the API takes it in body too?
        // Checking propertiesApi.ts: createProperty uses params owner_id if provided
        const ownerIdParam = (role === 'admin' || role === 'agent') && values.owner_id ? values.owner_id : undefined
        const res = await createProperty({
          data: payload,
          ownerId: ownerIdParam
        }).unwrap()

        toast({ title: 'Success', description: 'Property created successfully' })
        onSuccess?.(res.id)
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: getErrorMessage(error as any),
        variant: 'destructive'
      })
    }
  }

  if (isLoadingProperty) {
    return <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{isEdit ? 'Edit Property' : 'Create New Property'}</h1>
        <Button variant="outline" onClick={() => window.history.back()}>Cancel</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Property Details</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <SimpleTabs
                tabs={[
                  { id: 'basic', label: 'Basic' },
                  { id: 'location', label: 'Location' },
                  { id: 'details', label: 'Details' },
                  { id: 'availability', label: 'Availability' },
                  { id: 'media', label: 'Media' },
                ]}
                content={{
                  basic: (
                    <div className="space-y-6">
                      <PropertyBasicInfo form={form} />
                      {(role === 'admin' || role === 'agent') && (
                        <PropertyOwner form={form} />
                      )}
                    </div>
                  ),
                  location: <PropertyLocation form={form} />,
                  details: <PropertyDetails form={form} />,
                  availability: <PropertyAvailability form={form} />,
                  media: (
                    <PropertyMedia
                      form={form}
                      images={images}
                      setImages={setImages}
                      primaryImage={primaryImage}
                      setPrimaryImage={setPrimaryImage}
                    />
                  ),
                }}
              />

              <div className="flex justify-end gap-4 pt-4 border-t">
                <Button type="button" variant="ghost" onClick={() => window.history.back()}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isCreating || isUpdating}>
                  {(isCreating || isUpdating) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isEdit ? 'Save Changes' : 'Create Property'}
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
