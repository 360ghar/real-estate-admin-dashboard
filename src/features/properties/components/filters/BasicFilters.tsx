import React from 'react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { PROPERTY_TYPES, PROPERTY_PURPOSES } from '@/features/properties/constants'
import type { UseFormReturn } from 'react-hook-form'
import type { PropertySearchFormValues } from '@/features/properties/validations'

interface BasicFiltersProps {
  form: UseFormReturn<PropertySearchFormValues>
  togglePropertyType: (type: string) => void
}

const BasicFilters: React.FC<BasicFiltersProps> = ({ form, togglePropertyType }) => (
  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
    <div className="space-y-2">
      <Label>Purpose</Label>
      <Select value={form.watch('purpose') || ''} onValueChange={(value) => form.setValue('purpose', value)}>
        <SelectTrigger><SelectValue placeholder="Any purpose" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="">Any Purpose</SelectItem>
          {PROPERTY_PURPOSES.map(purpose => <SelectItem key={purpose.value} value={purpose.value}>{purpose.label}</SelectItem>)}
        </SelectContent>
      </Select>
    </div>
    <div className="space-y-2">
      <Label>Property Types</Label>
      <div className="flex flex-wrap gap-2">
        {PROPERTY_TYPES.map(type => (
          <Badge key={type.value} variant={form.getValues('property_type')?.includes(type.value) ? "default" : "outline"}
            className="cursor-pointer capitalize" onClick={() => togglePropertyType(type.value)}>
            {type.label}
          </Badge>
        ))}
      </div>
    </div>
    <div className="space-y-2">
      <Label>Price Range (₹)</Label>
      <div className="flex items-center gap-2">
        <Input type="number" placeholder="Min" {...form.register('price_min', { valueAsNumber: true })} />
        <span>-</span>
        <Input type="number" placeholder="Max" {...form.register('price_max', { valueAsNumber: true })} />
      </div>
    </div>
    <div className="space-y-2">
      <Label>Bedrooms</Label>
      <div className="flex items-center gap-2">
        <Input type="number" placeholder="Min" {...form.register('bedrooms_min', { valueAsNumber: true })} />
        <span>-</span>
        <Input type="number" placeholder="Max" {...form.register('bedrooms_max', { valueAsNumber: true })} />
      </div>
    </div>
    <div className="space-y-2">
      <Label>Bathrooms</Label>
      <div className="flex items-center gap-2">
        <Input type="number" placeholder="Min" {...form.register('bathrooms_min', { valueAsNumber: true })} />
        <span>-</span>
        <Input type="number" placeholder="Max" {...form.register('bathrooms_max', { valueAsNumber: true })} />
      </div>
    </div>
    <div className="space-y-2">
      <Label>Area (sqft)</Label>
      <div className="flex items-center gap-2">
        <Input type="number" placeholder="Min" {...form.register('area_min', { valueAsNumber: true })} />
        <span>-</span>
        <Input type="number" placeholder="Max" {...form.register('area_max', { valueAsNumber: true })} />
      </div>
    </div>
  </div>
)

export default BasicFilters
