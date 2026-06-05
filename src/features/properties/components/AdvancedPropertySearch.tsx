import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Search, Filter, X } from 'lucide-react'
import { useDebounce } from '@/hooks/useDebounce'
import { SORT_OPTIONS } from '@/features/properties/constants'
import { propertySearchSchema, type PropertySearchFormValues } from '@/features/properties/validations'
import BasicFilters from './filters/BasicFilters'
import LocationFilters from './filters/LocationFilters'
import PropertyFeatureFilters from './filters/PropertyFeatureFilters'
import AmenityFilters from './filters/AmenityFilters'

interface AdvancedPropertySearchProps {
  onSearch: (filters: PropertySearchFormValues) => void
  initialFilters?: Partial<PropertySearchFormValues>
  availableAmenities?: Array<{ id: number; name: string; category: string }>
}

const AdvancedPropertySearch: React.FC<AdvancedPropertySearchProps> = ({ onSearch, initialFilters, availableAmenities = [] }) => {
  const [showFilters, setShowFilters] = useState(false)
  const [selectedLocation, setSelectedLocation] = useState<{ latitude: number; longitude: number } | null>(null)

  const form = useForm<PropertySearchFormValues>({
    resolver: zodResolver(propertySearchSchema),
    defaultValues: {
      q: '', property_type: [], purpose: '', price_min: undefined, price_max: undefined,
      bedrooms_min: undefined, bedrooms_max: undefined, bathrooms_min: undefined, bathrooms_max: undefined,
      area_min: undefined, area_max: undefined, city: '', locality: '', pincode: '',
      amenities: [], features: [], parking_spaces_min: undefined, floor_number_min: undefined,
      floor_number_max: undefined, age_max: undefined, check_in: '', check_out: '',
      guests: undefined, sort_by: 'relevance', lat: undefined, lng: undefined, radius: 5,
      ...initialFilters,
    },
  })

  const watchedValues = form.watch()
  const debouncedSearch = useDebounce(watchedValues, 500)

  useEffect(() => {
    if (Object.keys(debouncedSearch).length > 0) onSearch(debouncedSearch)
  }, [debouncedSearch, onSearch])

  const togglePropertyType = (type: string) => {
    const currentTypes = form.getValues('property_type') || []
    form.setValue('property_type', currentTypes.includes(type) ? currentTypes.filter(t => t !== type) : [...currentTypes, type])
  }

  const toggleFeature = (feature: string) => {
    const currentFeatures = form.getValues('features') || []
    form.setValue('features', currentFeatures.includes(feature) ? currentFeatures.filter(f => f !== feature) : [...currentFeatures, feature])
  }

  const toggleAmenity = (amenityId: number) => {
    const currentAmenities = form.getValues('amenities') || []
    form.setValue('amenities', currentAmenities.includes(amenityId) ? currentAmenities.filter(id => id !== amenityId) : [...currentAmenities, amenityId])
  }

  const clearFilters = () => {
    form.reset({
      q: '', property_type: [], purpose: '', price_min: undefined, price_max: undefined,
      bedrooms_min: undefined, bedrooms_max: undefined, bathrooms_min: undefined, bathrooms_max: undefined,
      area_min: undefined, area_max: undefined, city: '', locality: '', pincode: '',
      amenities: [], features: [], parking_spaces_min: undefined, floor_number_min: undefined,
      floor_number_max: undefined, age_max: undefined, check_in: '', check_out: '',
      guests: undefined, sort_by: 'relevance', lat: undefined, lng: undefined, radius: 5,
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
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input {...form.register('q')} placeholder="Search properties by title, description, or location..." className="pl-10" />
            </div>
            <Button type="button" variant="outline" onClick={() => setShowFilters(!showFilters)} className="gap-2">
              <Filter className="h-4 w-4" />Filters
              {activeFiltersCount > 0 && <Badge variant="secondary">{activeFiltersCount}</Badge>}
            </Button>
            <Select value={form.watch('sort_by')} onValueChange={(value) => form.setValue('sort_by', value)}>
              <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
              <SelectContent>
                {SORT_OPTIONS.map(option => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
      {showFilters && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Advanced Filters</CardTitle>
              <Button variant="ghost" size="sm" onClick={clearFilters}><X className="h-4 w-4 mr-2" />Clear All</Button>
            </div>
          </CardHeader>
          <CardContent>
            <Accordion type="multiple" defaultValue={['basic', 'location', 'property', 'amenities']} className="w-full">
              <AccordionItem value="basic">
                <AccordionTrigger className="text-left">Basic Details</AccordionTrigger>
                <AccordionContent className="space-y-4"><BasicFilters form={form} togglePropertyType={togglePropertyType} /></AccordionContent>
              </AccordionItem>
              <AccordionItem value="location">
                <AccordionTrigger className="text-left">Location</AccordionTrigger>
                <AccordionContent className="space-y-4"><LocationFilters form={form} selectedLocation={selectedLocation} setSelectedLocation={setSelectedLocation} /></AccordionContent>
              </AccordionItem>
              <AccordionItem value="property">
                <AccordionTrigger className="text-left">Additional Features</AccordionTrigger>
                <AccordionContent className="space-y-4"><PropertyFeatureFilters form={form} toggleFeature={toggleFeature} /></AccordionContent>
              </AccordionItem>
              {availableAmenities.length > 0 && (
                <AccordionItem value="amenities">
                  <AccordionTrigger className="text-left">Amenities</AccordionTrigger>
                  <AccordionContent><AmenityFilters form={form} availableAmenities={availableAmenities} toggleAmenity={toggleAmenity} /></AccordionContent>
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
