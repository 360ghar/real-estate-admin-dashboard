import React, { useState, useEffect } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Separator } from '@/components/ui/separator'
import LocationPicker from '@/components/map/LocationPicker'
import { useDebounce } from '@/hooks/useDebounce'
import { Search, Filter, X, MapPin, Home, DollarSign, Bath, Bed, Square } from 'lucide-react'

const searchSchema = z.object({
  q: z.string().optional(),
  property_type: z.array(z.string()).optional(),
  purpose: z.string().optional(),
  price_min: z.number().optional(),
  price_max: z.number().optional(),
  bedrooms_min: z.number().optional(),
  bedrooms_max: z.number().optional(),
  bathrooms_min: z.number().optional(),
  bathrooms_max: z.number().optional(),
  area_min: z.number().optional(),
  area_max: z.number().optional(),
  city: z.string().optional(),
  locality: z.string().optional(),
  pincode: z.string().optional(),
  amenities: z.array(z.number()).optional(),
  features: z.array(z.string()).optional(),
  parking_spaces_min: z.number().optional(),
  floor_number_min: z.number().optional(),
  floor_number_max: z.number().optional(),
  age_max: z.number().optional(),
  check_in: z.string().optional(),
  check_out: z.string().optional(),
  guests: z.number().optional(),
  sort_by: z.string().optional(),
  lat: z.number().optional(),
  lng: z.number().optional(),
  radius: z.number().optional(),
})

type SearchFormData = z.infer<typeof searchSchema>

interface AdvancedPropertySearchProps {
  onSearch: (filters: SearchFormData) => void
  initialFilters?: Partial<SearchFormData>
  availableAmenities?: Array<{ id: number; name: string; category: string }>
}

const AdvancedPropertySearch: React.FC<AdvancedPropertySearchProps> = ({
  onSearch,
  initialFilters,
  availableAmenities = [],
}) => {
  const [showFilters, setShowFilters] = useState(false)
  const [selectedLocation, setSelectedLocation] = useState<{
    latitude: number
    longitude: number
  } | null>(null)

  const form = useForm<SearchFormData>({
    resolver: zodResolver(searchSchema),
    defaultValues: {
      q: '',
      property_type: [],
      purpose: '',
      price_min: undefined,
      price_max: undefined,
      bedrooms_min: undefined,
      bedrooms_max: undefined,
      bathrooms_min: undefined,
      bathrooms_max: undefined,
      area_min: undefined,
      area_max: undefined,
      city: '',
      locality: '',
      pincode: '',
      amenities: [],
      features: [],
      parking_spaces_min: undefined,
      floor_number_min: undefined,
      floor_number_max: undefined,
      age_max: undefined,
      check_in: '',
      check_out: '',
      guests: undefined,
      sort_by: 'relevance',
      lat: undefined,
      lng: undefined,
      radius: 5,
      ...initialFilters,
    },
  })

  const watchedValues = form.watch()
  const debouncedSearch = useDebounce(watchedValues, 500)

  useEffect(() => {
    if (Object.keys(debouncedSearch).length > 0) {
      onSearch(debouncedSearch)
    }
  }, [debouncedSearch, onSearch])

  const propertyTypes = [
    { value: 'house', label: 'House' },
    { value: 'apartment', label: 'Apartment' },
    { value: 'builder_floor', label: 'Builder Floor' },
    { value: 'room', label: 'Room' },
  ]

  const purposes = [
    { value: 'buy', label: 'Buy' },
    { value: 'rent', label: 'Rent' },
    { value: 'short_stay', label: 'Short Stay' },
  ]

  const sortOptions = [
    { value: 'relevance', label: 'Most Relevant' },
    { value: 'newest', label: 'Newest First' },
    { value: 'price_low', label: 'Price: Low to High' },
    { value: 'price_high', label: 'Price: High to Low' },
    { value: 'distance', label: 'Distance' },
    { value: 'popular', label: 'Most Popular' },
  ]

  const availableFeatures = [
    'gym', 'pool', 'parking', 'security', 'lift', 'power_backup',
    'garden', 'play_area', 'club_house', 'jogging_track', 'rainwater_harvesting',
    'solar_panels', 'intercom', 'cctv', 'fire_safety', 'waste_disposal'
  ]

  const togglePropertyType = (type: string) => {
    const currentTypes = form.getValues('property_type') || []
    const newTypes = currentTypes.includes(type)
      ? currentTypes.filter(t => t !== type)
      : [...currentTypes, type]
    form.setValue('property_type', newTypes)
  }

  const toggleFeature = (feature: string) => {
    const currentFeatures = form.getValues('features') || []
    const newFeatures = currentFeatures.includes(feature)
      ? currentFeatures.filter(f => f !== feature)
      : [...currentFeatures, feature]
    form.setValue('features', newFeatures)
  }

  const toggleAmenity = (amenityId: number) => {
    const currentAmenities = form.getValues('amenities') || []
    const newAmenities = currentAmenities.includes(amenityId)
      ? currentAmenities.filter(id => id !== amenityId)
      : [...currentAmenities, amenityId]
    form.setValue('amenities', newAmenities)
  }

  const clearFilters = () => {
    form.reset({
      q: '',
      property_type: [],
      purpose: '',
      price_min: undefined,
      price_max: undefined,
      bedrooms_min: undefined,
      bedrooms_max: undefined,
      bathrooms_min: undefined,
      bathrooms_max: undefined,
      area_min: undefined,
      area_max: undefined,
      city: '',
      locality: '',
      pincode: '',
      amenities: [],
      features: [],
      parking_spaces_min: undefined,
      floor_number_min: undefined,
      floor_number_max: undefined,
      age_max: undefined,
      check_in: '',
      check_out: '',
      guests: undefined,
      sort_by: 'relevance',
      lat: undefined,
      lng: undefined,
      radius: 5,
    })
    setSelectedLocation(null)
  }

  const activeFiltersCount = Object.entries(watchedValues).filter(([key, value]) => {
    if (key === 'sort_by' || key === 'radius') return false
    if (Array.isArray(value)) return value.length > 0
    if (typeof value === 'number') return value !== undefined && value !== 0
    return value !== undefined && value !== ''
  }).length

  return (
    <div className="space-y-4">
      {/* Quick Search Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                {...form.register('q')}
                placeholder="Search properties by title, description, or location..."
                className="pl-10"
              />
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="gap-2"
            >
              <Filter className="h-4 w-4" />
              Filters
              {activeFiltersCount > 0 && (
                <Badge variant="secondary">{activeFiltersCount}</Badge>
              )}
            </Button>
            <Select
              value={form.watch('sort_by')}
              onValueChange={(value) => form.setValue('sort_by', value)}
            >
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {sortOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Advanced Filters */}
      {showFilters && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Advanced Filters</CardTitle>
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                <X className="h-4 w-4 mr-2" />
                Clear All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Accordion type="multiple" defaultValue={['basic', 'location', 'property', 'amenities']} className="w-full">
              {/* Basic Filters */}
              <AccordionItem value="basic">
                <AccordionTrigger className="text-left">Basic Details</AccordionTrigger>
                <AccordionContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    <div className="space-y-2">
                      <Label>Purpose</Label>
                      <Select
                        value={form.watch('purpose')}
                        onValueChange={(value) => form.setValue('purpose', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Any purpose" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">Any Purpose</SelectItem>
                          {purposes.map(purpose => (
                            <SelectItem key={purpose.value} value={purpose.value}>
                              {purpose.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Property Types</Label>
                      <div className="flex flex-wrap gap-2">
                        {propertyTypes.map(type => (
                          <Badge
                            key={type.value}
                            variant={form.getValues('property_type')?.includes(type.value) ? "default" : "outline"}
                            className="cursor-pointer capitalize"
                            onClick={() => togglePropertyType(type.value)}
                          >
                            {type.label}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Price Range (₹)</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          placeholder="Min"
                          {...form.register('price_min', { valueAsNumber: true })}
                        />
                        <span>-</span>
                        <Input
                          type="number"
                          placeholder="Max"
                          {...form.register('price_max', { valueAsNumber: true })}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Bedrooms</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          placeholder="Min"
                          {...form.register('bedrooms_min', { valueAsNumber: true })}
                        />
                        <span>-</span>
                        <Input
                          type="number"
                          placeholder="Max"
                          {...form.register('bedrooms_max', { valueAsNumber: true })}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Bathrooms</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          placeholder="Min"
                          {...form.register('bathrooms_min', { valueAsNumber: true })}
                        />
                        <span>-</span>
                        <Input
                          type="number"
                          placeholder="Max"
                          {...form.register('bathrooms_max', { valueAsNumber: true })}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Area (sqft)</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          placeholder="Min"
                          {...form.register('area_min', { valueAsNumber: true })}
                        />
                        <span>-</span>
                        <Input
                          type="number"
                          placeholder="Max"
                          {...form.register('area_max', { valueAsNumber: true })}
                        />
                      </div>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* Location Filters */}
              <AccordionItem value="location">
                <AccordionTrigger className="text-left">Location</AccordionTrigger>
                <AccordionContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="space-y-2">
                      <Label>City</Label>
                      <Input
                        {...form.register('city')}
                        placeholder="e.g., Mumbai"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Locality</Label>
                      <Input
                        {...form.register('locality')}
                        placeholder="e.g., Andheri"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Pincode</Label>
                      <Input
                        {...form.register('pincode')}
                        placeholder="e.g., 400053"
                      />
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <Label className="text-base">Search on Map</Label>
                    <p className="text-sm text-muted-foreground mb-2">
                      Click on the map to search around a specific location
                    </p>
                    <div className="h-64 border rounded-lg overflow-hidden">
                      <LocationPicker
                        value={selectedLocation ? { lat: selectedLocation.latitude, lng: selectedLocation.longitude } : null}
                        onChange={(location) => {
                          setSelectedLocation({ latitude: location.lat, longitude: location.lng })
                          form.setValue('lat', location.lat)
                          form.setValue('lng', location.lng)
                        }}
                      />
                    </div>
                    {selectedLocation && (
                      <div className="mt-2 flex items-center gap-4">
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <MapPin className="h-4 w-4" />
                          {selectedLocation.latitude.toFixed(4)}, {selectedLocation.longitude.toFixed(4)}
                        </div>
                        <div className="flex items-center gap-2">
                          <Label>Radius (km):</Label>
                          <Input
                            type="number"
                            {...form.register('radius', { valueAsNumber: true })}
                            className="w-20"
                            min={1}
                            max={100}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* Additional Property Filters */}
              <AccordionItem value="property">
                <AccordionTrigger className="text-left">Additional Features</AccordionTrigger>
                <AccordionContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <div className="space-y-2">
                      <Label>Parking Spaces (Min)</Label>
                      <Input
                        type="number"
                        {...form.register('parking_spaces_min', { valueAsNumber: true })}
                        placeholder="0"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Floor Number</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          placeholder="Min"
                          {...form.register('floor_number_min', { valueAsNumber: true })}
                        />
                        <span>-</span>
                        <Input
                          type="number"
                          placeholder="Max"
                          {...form.register('floor_number_max', { valueAsNumber: true })}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Max Property Age (years)</Label>
                      <Input
                        type="number"
                        {...form.register('age_max', { valueAsNumber: true })}
                        placeholder="e.g., 5"
                      />
                    </div>
                  </div>

                  <div>
                    <Label className="text-base">Features</Label>
                    <div className="grid gap-2 md:grid-cols-3 lg:grid-cols-4 mt-2">
                      {availableFeatures.map(feature => (
                        <div key={feature} className="flex items-center space-x-2">
                          <Checkbox
                            id={`feature-${feature}`}
                            checked={form.getValues('features')?.includes(feature) || false}
                            onCheckedChange={() => toggleFeature(feature)}
                          />
                          <Label htmlFor={`feature-${feature}`} className="text-sm capitalize">
                            {feature.replace('_', ' ')}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {form.watch('purpose') === 'short_stay' && (
                    <>
                      <Separator />
                      <div className="grid gap-4 md:grid-cols-3">
                        <div className="space-y-2">
                          <Label>Check-in Date</Label>
                          <Input
                            type="date"
                            {...form.register('check_in')}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Check-out Date</Label>
                          <Input
                            type="date"
                            {...form.register('check_out')}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Guests</Label>
                          <Input
                            type="number"
                            {...form.register('guests', { valueAsNumber: true })}
                            placeholder="2"
                            min={1}
                          />
                        </div>
                      </div>
                    </>
                  )}
                </AccordionContent>
              </AccordionItem>

              {/* Amenities */}
              {availableAmenities.length > 0 && (
                <AccordionItem value="amenities">
                  <AccordionTrigger className="text-left">Amenities</AccordionTrigger>
                  <AccordionContent>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {availableAmenities.map(amenity => (
                        <div key={amenity.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`amenity-${amenity.id}`}
                            checked={form.getValues('amenities')?.includes(amenity.id) || false}
                            onCheckedChange={() => toggleAmenity(amenity.id)}
                          />
                          <Label htmlFor={`amenity-${amenity.id}`} className="text-sm">
                            {amenity.name}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              )}
            </Accordion>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default AdvancedPropertySearch