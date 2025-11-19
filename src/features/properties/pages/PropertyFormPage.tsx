import React, { useState, useEffect } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate, useParams } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { useToast } from '@/hooks/use-toast'
import { useGetPropertyQuery, useCreatePropertyMutation, useUpdatePropertyMutation } from '@/features/properties/api/propertiesApi'
import { useGetAmenitiesQuery } from '@/features/core/api/amenitiesApi'
import { useUploadFileMutation } from '@/features/core/api/uploadApi'
import ImageUpload from '@/components/common/media/ImageUpload'
import LocationPicker from '@/components/common/map/LocationPicker'
import { useAuth } from '@/hooks/useAuth'
import { Loader2, Plus, X, MapPin, Camera } from 'lucide-react'

const propertySchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  property_type: z.enum(['house', 'apartment', 'builder_floor', 'room']),
  purpose: z.enum(['buy', 'rent', 'short_stay']),
  base_price: z.number().min(1, 'Price must be greater than 0'),
  city: z.string().min(1, 'City is required'),
  locality: z.string().min(1, 'Locality is required'),
  pincode: z.string().min(1, 'Pincode is required'),
  area_sqft: z.number().min(1, 'Area must be greater than 0'),
  bedrooms: z.number().min(0),
  bathrooms: z.number().min(0),
  balconies: z.number().min(0).optional(),
  parking_spaces: z.number().min(0).optional(),
  floor_number: z.number().min(0).optional(),
  total_floors: z.number().min(0).optional(),
  age_of_property: z.number().min(0).optional(),
  max_occupancy: z.number().min(1).optional(),
  minimum_stay_days: z.number().min(1).optional(),
  amenity_ids: z.array(z.number()),
  features: z.array(z.string()),
  owner_name: z.string().min(1, 'Owner name is required'),
  owner_contact: z.string().min(1, 'Owner contact is required'),
})

type PropertyFormData = z.infer<typeof propertySchema>

interface Location {
  latitude: number
  longitude: number
}

const PropertyFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { toast } = useToast()
  const { user } = useAuth()
  const isEditing = !!id

  const [location, setLocation] = useState<Location | null>(null)
  const [uploadedImages, setUploadedImages] = useState<string[]>([])
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([])
  const [ownerId, setOwnerId] = useState<number | undefined>()

  // Fetch property data if editing
  const { data: property, isLoading: propertyLoading } = useGetPropertyQuery(Number(id), {
    skip: !isEditing,
  })

  // Fetch amenities
  const { data: amenities } = useGetAmenitiesQuery()

  // Mutations
  const [createProperty, { isLoading: creating }] = useCreatePropertyMutation()
  const [updateProperty, { isLoading: updating }] = useUpdatePropertyMutation()
  const [uploadFile, { isLoading: uploading }] = useUploadFileMutation()

  const form = useForm<PropertyFormData>({
    resolver: zodResolver(propertySchema),
    defaultValues: {
      title: '',
      description: '',
      property_type: 'apartment',
      purpose: 'rent',
      base_price: 0,
      city: '',
      locality: '',
      pincode: '',
      area_sqft: 0,
      bedrooms: 0,
      bathrooms: 0,
      balconies: 0,
      parking_spaces: 0,
      floor_number: 0,
      total_floors: 0,
      age_of_property: 0,
      max_occupancy: 0,
      minimum_stay_days: 1,
      amenity_ids: [],
      features: [],
      owner_name: '',
      owner_contact: '',
    },
  })

  useEffect(() => {
    if (property && isEditing) {
      form.reset({
        title: property.title,
        description: property.description,
        property_type: property.property_type,
        purpose: property.purpose,
        base_price: property.base_price,
        city: property.city,
        locality: property.locality,
        pincode: property.pincode,
        area_sqft: property.area_sqft,
        bedrooms: property.bedrooms,
        bathrooms: property.bathrooms,
        balconies: property.balconies || 0,
        parking_spaces: property.parking_spaces || 0,
        floor_number: property.floor_number || 0,
        total_floors: property.total_floors || 0,
        age_of_property: property.age_of_property || 0,
        max_occupancy: property.max_occupancy || 0,
        minimum_stay_days: property.minimum_stay_days || 1,
        amenity_ids: [],
        features: property.features || [],
        owner_name: property.owner_name || '',
        owner_contact: property.owner_contact || '',
      })
      setLocation({
        latitude: property.location.latitude,
        longitude: property.location.longitude,
      })
      setUploadedImages(property.images || [])
      setSelectedFeatures(property.features || [])
    }
  }, [property, isEditing, form])

  const handleImageUpload = async (files: File[]) => {
    try {
      const uploadPromises = files.map(file => uploadFile(file).unwrap())
      const results = await Promise.all(uploadPromises)
      const newImages = results.map(result => result.public_url)
      setUploadedImages(prev => [...prev, ...newImages])
      toast({
        title: 'Images Uploaded',
        description: `${files.length} image(s) uploaded successfully.`,
      })
    } catch (error) {
      toast({
        title: 'Upload Failed',
        description: 'Failed to upload images. Please try again.',
        variant: 'destructive',
      })
    }
  }

  const removeImage = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index))
  }

  const toggleFeature = (feature: string) => {
    setSelectedFeatures(prev =>
      prev.includes(feature)
        ? prev.filter(f => f !== feature)
        : [...prev, feature]
    )
    form.setValue('features', selectedFeatures)
  }

  const toggleAmenity = (amenityId: number) => {
    const currentAmenities = form.getValues('amenity_ids')
    const newAmenities = currentAmenities.includes(amenityId)
      ? currentAmenities.filter(id => id !== amenityId)
      : [...currentAmenities, amenityId]
    form.setValue('amenity_ids', newAmenities)
  }

  const onSubmit = async (data: PropertyFormData) => {
    if (!location) {
      toast({
        title: 'Location Required',
        description: 'Please select a location on the map.',
        variant: 'destructive',
      })
      return
    }

    try {
      const propertyData = {
        ...data,
        latitude: location.latitude,
        longitude: location.longitude,
        features: selectedFeatures,
        main_image_url: uploadedImages[0] || '',
      }

      if (isEditing) {
        await updateProperty({ id: Number(id), data: propertyData }).unwrap()
        toast({
          title: 'Property Updated',
          description: 'Property has been updated successfully.',
        })
      } else {
        await createProperty({
          data: propertyData,
          ownerId: user?.role === 'admin' ? ownerId : undefined,
        }).unwrap()
        toast({
          title: 'Property Created',
          description: 'Property has been created successfully.',
        })
      }
      navigate('/properties')
    } catch (error) {
      toast({
        title: 'Operation Failed',
        description: isEditing
          ? 'Failed to update property. Please try again.'
          : 'Failed to create property. Please try again.',
        variant: 'destructive',
      })
    }
  }

  const availableFeatures = [
    'gym', 'pool', 'parking', 'security', 'lift', 'power_backup',
    'garden', 'play_area', 'club_house', 'jogging_track', 'rainwater_harvesting',
    'solar_panels', 'intercom', 'cctv', 'fire_safety', 'waste_disposal'
  ]

  if (propertyLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {isEditing ? 'Edit Property' : 'Create New Property'}
          </h1>
          <p className="text-muted-foreground">
            {isEditing
              ? 'Update property information and details'
              : 'Add a new property to the platform'}
          </p>
        </div>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left Column - Basic Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>Enter the basic details of the property</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="title">Property Title</Label>
                    <Input
                      id="title"
                      {...form.register('title')}
                      placeholder="Modern 3BHK Apartment"
                    />
                    {form.formState.errors.title && (
                      <p className="text-sm text-red-500">
                        {form.formState.errors.title.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="property_type">Property Type</Label>
                    <Select
                      value={form.watch('property_type')}
                      onValueChange={(value) => form.setValue('property_type', value as any)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="house">House</SelectItem>
                        <SelectItem value="apartment">Apartment</SelectItem>
                        <SelectItem value="builder_floor">Builder Floor</SelectItem>
                        <SelectItem value="room">Room</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="purpose">Purpose</Label>
                    <Select
                      value={form.watch('purpose')}
                      onValueChange={(value) => form.setValue('purpose', value as any)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="buy">Buy</SelectItem>
                        <SelectItem value="rent">Rent</SelectItem>
                        <SelectItem value="short_stay">Short Stay</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="base_price">Base Price (₹)</Label>
                    <Input
                      id="base_price"
                      type="number"
                      {...form.register('base_price', { valueAsNumber: true })}
                      placeholder="25000"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    {...form.register('description')}
                    placeholder="Describe the property..."
                    rows={4}
                  />
                  {form.formState.errors.description && (
                    <p className="text-sm text-red-500">
                      {form.formState.errors.description.message}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Location */}
            <Card>
              <CardHeader>
                <CardTitle>Location</CardTitle>
                <CardDescription>Property location details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      {...form.register('city')}
                      placeholder="Mumbai"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="locality">Locality</Label>
                    <Input
                      id="locality"
                      {...form.register('locality')}
                      placeholder="Andheri"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pincode">Pincode</Label>
                    <Input
                      id="pincode"
                      {...form.register('pincode')}
                      placeholder="400053"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-base">Select Location on Map</Label>
                  <p className="text-sm text-muted-foreground mb-2">
                    Click on the map to set the property location
                  </p>
                  <div className="h-96 border rounded-lg overflow-hidden">
                    <LocationPicker
                      value={location ? { lat: location.latitude, lng: location.longitude } : null}
                      onChange={(loc) => setLocation({ latitude: loc.lat, longitude: loc.lng })}
                    />
                  </div>
                  {location && (
                    <div className="mt-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4 inline mr-1" />
                      {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Property Details */}
            <Card>
              <CardHeader>
                <CardTitle>Property Details</CardTitle>
                <CardDescription>Specifications and features</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="area_sqft">Area (sqft)</Label>
                    <Input
                      id="area_sqft"
                      type="number"
                      {...form.register('area_sqft', { valueAsNumber: true })}
                      placeholder="1200"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bedrooms">Bedrooms</Label>
                    <Input
                      id="bedrooms"
                      type="number"
                      {...form.register('bedrooms', { valueAsNumber: true })}
                      placeholder="3"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bathrooms">Bathrooms</Label>
                    <Input
                      id="bathrooms"
                      type="number"
                      {...form.register('bathrooms', { valueAsNumber: true })}
                      placeholder="2"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="balconies">Balconies</Label>
                    <Input
                      id="balconies"
                      type="number"
                      {...form.register('balconies', { valueAsNumber: true })}
                      placeholder="2"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="parking_spaces">Parking Spaces</Label>
                    <Input
                      id="parking_spaces"
                      type="number"
                      {...form.register('parking_spaces', { valueAsNumber: true })}
                      placeholder="1"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="floor_number">Floor Number</Label>
                    <Input
                      id="floor_number"
                      type="number"
                      {...form.register('floor_number', { valueAsNumber: true })}
                      placeholder="5"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="total_floors">Total Floors</Label>
                    <Input
                      id="total_floors"
                      type="number"
                      {...form.register('total_floors', { valueAsNumber: true })}
                      placeholder="10"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="age_of_property">Age (years)</Label>
                    <Input
                      id="age_of_property"
                      type="number"
                      {...form.register('age_of_property', { valueAsNumber: true })}
                      placeholder="5"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="max_occupancy">Max Occupancy</Label>
                    <Input
                      id="max_occupancy"
                      type="number"
                      {...form.register('max_occupancy', { valueAsNumber: true })}
                      placeholder="6"
                    />
                  </div>
                </div>

                {form.watch('purpose') === 'short_stay' && (
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="minimum_stay_days">Minimum Stay (days)</Label>
                      <Input
                        id="minimum_stay_days"
                        type="number"
                        {...form.register('minimum_stay_days', { valueAsNumber: true })}
                        placeholder="1"
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Amenities & Features */}
            <Card>
              <CardHeader>
                <CardTitle>Amenities & Features</CardTitle>
                <CardDescription>Select available amenities and features</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label className="text-base">Amenities</Label>
                  <div className="grid gap-2 md:grid-cols-3 mt-2">
                    {amenities?.map((amenity) => (
                      <div key={amenity.id} className="flex items-center space-x-2">
                        <Switch
                          id={`amenity-${amenity.id}`}
                          checked={form.getValues('amenity_ids').includes(amenity.id)}
                          onCheckedChange={() => toggleAmenity(amenity.id)}
                        />
                        <Label htmlFor={`amenity-${amenity.id}`} className="text-sm">
                          {amenity.name}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                <div>
                  <Label className="text-base">Features</Label>
                  <p className="text-sm text-muted-foreground">Select property features</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {availableFeatures.map((feature) => (
                      <Badge
                        key={feature}
                        variant={selectedFeatures.includes(feature) ? "default" : "outline"}
                        className="cursor-pointer capitalize"
                        onClick={() => toggleFeature(feature)}
                      >
                        {feature.replace('_', ' ')}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Owner Information */}
            <Card>
              <CardHeader>
                <CardTitle>Owner Information</CardTitle>
                <CardDescription>Property owner details</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="owner_name">Owner Name</Label>
                    <Input
                      id="owner_name"
                      {...form.register('owner_name')}
                      placeholder="John Doe"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="owner_contact">Owner Contact</Label>
                    <Input
                      id="owner_contact"
                      {...form.register('owner_contact')}
                      placeholder="+1234567890"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Images & Actions */}
          <div className="space-y-6">
            {/* Images */}
            <Card>
              <CardHeader>
                <CardTitle>Property Images</CardTitle>
                <CardDescription>Upload property photos</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ImageUpload
                  value={uploadedImages}
                  onChange={(urls) => setUploadedImages(urls)}
                />

                {uploadedImages.length > 0 && (
                  <div className="space-y-2">
                    <Label>Uploaded Images</Label>
                    <div className="grid gap-2">
                      {uploadedImages.map((image, index) => (
                        <div key={index} className="flex items-center gap-2 p-2 border rounded">
                          <img
                            src={image}
                            alt={`Property ${index + 1}`}
                            className="w-16 h-16 object-cover rounded"
                          />
                          <span className="text-sm flex-1 truncate">Image {index + 1}</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeImage(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button
                  type="submit"
                  className="w-full"
                  disabled={creating || updating || uploading}
                >
                  {(creating || updating || uploading) && (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  )}
                  {isEditing ? 'Update Property' : 'Create Property'}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => navigate('/properties')}
                >
                  Cancel
                </Button>
              </CardContent>
            </Card>

            {/* Status (Edit Mode Only) */}
            {isEditing && property && (
              <Card>
                <CardHeader>
                  <CardTitle>Property Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Status</span>
                      <Badge variant={property.status === 'available' ? 'default' : 'secondary'}>
                        {property.status}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Created</span>
                      <span className="text-sm">
                        {new Date(property.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Owner ID</span>
                      <span className="text-sm">{property.owner_id}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </form>
    </div>
  )
}

export default PropertyFormPage
