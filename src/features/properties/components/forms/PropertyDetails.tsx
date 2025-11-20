import { UseFormReturn } from 'react-hook-form'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { PropertyFormValues } from '@/features/properties/schemas'

interface PropertyDetailsProps {
  form: UseFormReturn<PropertyFormValues>
}

export function PropertyDetails({ form }: PropertyDetailsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <FormField
        control={form.control}
        name="area_sqft"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Area (sqft) <span className="text-destructive">*</span></FormLabel>
            <FormControl>
              <Input type="number" {...field} onChange={e => field.onChange(Number(e.target.value))} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="bedrooms"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Bedrooms</FormLabel>
            <FormControl>
              <Input type="number" min={0} {...field} onChange={e => field.onChange(Number(e.target.value))} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="bathrooms"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Bathrooms</FormLabel>
            <FormControl>
              <Input type="number" min={0} {...field} onChange={e => field.onChange(Number(e.target.value))} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="balconies"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Balconies</FormLabel>
            <FormControl>
              <Input type="number" min={0} {...field} onChange={e => field.onChange(Number(e.target.value))} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="parking_spaces"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Parking Spaces</FormLabel>
            <FormControl>
              <Input type="number" min={0} {...field} onChange={e => field.onChange(Number(e.target.value))} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="floor_number"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Floor Number</FormLabel>
            <FormControl>
              <Input type="number" min={0} {...field} onChange={e => field.onChange(Number(e.target.value))} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="total_floors"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Total Floors</FormLabel>
            <FormControl>
              <Input type="number" min={1} {...field} onChange={e => field.onChange(Number(e.target.value))} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="age_of_property"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Property Age (Years)</FormLabel>
            <FormControl>
              <Input type="number" min={0} {...field} onChange={e => field.onChange(Number(e.target.value))} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="max_occupancy"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Max Occupancy</FormLabel>
            <FormControl>
              <Input type="number" min={1} {...field} onChange={e => field.onChange(Number(e.target.value))} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

       <FormField
        control={form.control}
        name="minimum_stay_days"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Min Stay (Days)</FormLabel>
            <FormControl>
              <Input type="number" min={1} {...field} onChange={e => field.onChange(Number(e.target.value))} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  )
}
