import React from 'react'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import type { UseFormReturn } from 'react-hook-form'
import type { PropertySearchFormValues } from '@/features/properties/validations'

interface AmenityFiltersProps {
  form: UseFormReturn<PropertySearchFormValues>
  availableAmenities: Array<{ id: number; name: string; category: string }>
  toggleAmenity: (amenityId: number) => void
}

const AmenityFilters: React.FC<AmenityFiltersProps> = ({ form, availableAmenities, toggleAmenity }) => {
  if (availableAmenities.length === 0) return null

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {availableAmenities.map(amenity => (
        <div key={amenity.id} className="flex items-center space-x-2">
          <Checkbox id={`amenity-${amenity.id}`}
            checked={form.getValues('amenities')?.includes(amenity.id) || false}
            onCheckedChange={() => toggleAmenity(amenity.id)} />
          <Label htmlFor={`amenity-${amenity.id}`} className="text-sm">{amenity.name}</Label>
        </div>
      ))}
    </div>
  )
}

export default AmenityFilters
