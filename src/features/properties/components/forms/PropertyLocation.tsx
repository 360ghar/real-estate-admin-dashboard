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
import AddressAutocomplete from '../parts/AddressAutocomplete'
import LocationPicker from '@/components/common/map/LocationPicker'
import MapPreview from '../parts/MapPreview'

interface PropertyLocationProps {
  form: UseFormReturn<PropertyFormValues>
}

export function PropertyLocation({ form }: PropertyLocationProps) {
  const { setValue, watch } = form
  const lat = watch('latitude')
  const lng = watch('longitude')

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <FormField
          control={form.control}
          name="city"
          render={({ field }) => (
            <FormItem>
              <FormLabel>City <span className="text-destructive">*</span></FormLabel>
              <FormControl>
                <Input placeholder="e.g. Gurgaon" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="locality"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Locality <span className="text-destructive">*</span></FormLabel>
              <FormControl>
                <Input placeholder="e.g. DLF Phase 2" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="space-y-2">
        <FormLabel>Search Address</FormLabel>
        <AddressAutocomplete
          value={form.getValues('address') || ''}
          onSelect={(place) => {
            setValue('address', place.display_name)
            setValue('latitude', Number(place.lat))
            setValue('longitude', Number(place.lon))
            if (place.address) {
              setValue('city',
                place.address.city ||
                place.address.town ||
                place.address.village ||
                place.address.municipality ||
                place.address.city_district ||
                ''
              )
              setValue('locality',
                place.address.suburb ||
                place.address.neighbourhood ||
                place.address.quarter ||
                place.address.hamlet ||
                place.address.state_district ||
                ''
              )
              setValue('pincode', place.address.postcode || '')
            }
          }}
        />
        {lat && lng && (
          <div className="mt-2 h-48 rounded-md overflow-hidden border">
            <MapPreview lat={lat} lng={lng} />
          </div>
        )}
      </div>

      <div className="space-y-2">
        <FormLabel>Pin on Map</FormLabel>
        <LocationPicker
          value={lat && lng ? { lat, lng } : null}
          onChange={(val) => {
            setValue('latitude', val.lat)
            setValue('longitude', val.lng)
          }}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <FormField
          control={form.control}
          name="latitude"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Latitude</FormLabel>
              <FormControl>
                <Input type="number" step="0.000001" {...field} onChange={e => field.onChange(e.target.valueAsNumber)} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="longitude"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Longitude</FormLabel>
              <FormControl>
                <Input type="number" step="0.000001" {...field} onChange={e => field.onChange(e.target.valueAsNumber)} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
         <FormField
          control={form.control}
          name="pincode"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Pincode</FormLabel>
              <FormControl>
                <Input placeholder="e.g. 122002" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  )
}
