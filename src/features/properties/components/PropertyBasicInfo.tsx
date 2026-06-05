import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import AddressAutocomplete from './parts/AddressAutocomplete'
import MapPreview from './parts/MapPreview'
import LocationPicker from '@/components/common/map/LocationPicker'
import ImageUpload from '@/components/common/media/ImageUpload'
import { PROPERTY_TYPES, PROPERTY_PURPOSES, PROPERTY_STATUSES } from '@/features/properties/constants'
import type { UseFormReturn } from 'react-hook-form'
import type { PropertyFormValues } from '@/features/properties/validations'

interface PropertyBasicInfoProps {
  form: UseFormReturn<PropertyFormValues>
  images: string[]
  setImages: (urls: string[]) => void
  primaryImage: string | null
  setPrimaryImage: (url: string | null) => void
}

const PropertyBasicInfo: React.FC<PropertyBasicInfoProps> = ({ form, images, setImages, primaryImage, setPrimaryImage }) => {
  const { setValue, watch } = form

  return (
    <>
      <FormField control={form.control} name="title" render={({ field }) => (
        <FormItem><FormLabel>Title</FormLabel><FormControl><Input placeholder="Spacious 2BHK in Gurgaon" {...field} /></FormControl><FormMessage /></FormItem>
      )} />
      <FormField control={form.control} name="description" render={({ field }) => (
        <FormItem><FormLabel>Description</FormLabel><FormControl><Textarea rows={4} placeholder="Spacious 3BHK with modern amenities and excellent location" {...field} /></FormControl><FormMessage /></FormItem>
      )} />
      <div className="grid gap-4 md:grid-cols-2">
        <FormField control={form.control} name="property_type" render={({ field }) => (
          <FormItem><FormLabel>Type</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl><SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger></FormControl>
              <SelectContent>{PROPERTY_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
            </Select><FormMessage /></FormItem>
        )} />
        <FormField control={form.control} name="purpose" render={({ field }) => (
          <FormItem><FormLabel>Purpose</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger></FormControl>
              <SelectContent>{PROPERTY_PURPOSES.map(p => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}</SelectContent>
            </Select><FormMessage /></FormItem>
        )} />
        <FormField control={form.control} name="status" render={({ field }) => (
          <FormItem><FormLabel>Status</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger></FormControl>
              <SelectContent>{PROPERTY_STATUSES.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}</SelectContent>
            </Select><FormMessage /></FormItem>
        )} />
        <FormField control={form.control} name="base_price" render={({ field }) => (
          <FormItem><FormLabel>Price</FormLabel><FormControl><Input type="number" step="0.01" placeholder="50000" {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <FormField control={form.control} name="city" render={({ field }) => (
          <FormItem><FormLabel>City</FormLabel><FormControl><Input placeholder="Gurgaon" {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <FormField control={form.control} name="locality" render={({ field }) => (
          <FormItem><FormLabel>Locality</FormLabel><FormControl><Input placeholder="DLF Phase 2" {...field} /></FormControl><FormMessage /></FormItem>
        )} />
      </div>
      <div className="md:col-span-2">
        <FormLabel>Address</FormLabel>
        <AddressAutocomplete value="" onSelect={(addr: { display_name: string; lat: string; lon: string; address?: Record<string, string | undefined> }) => {
          setValue('address', addr.display_name); setValue('latitude', Number(addr.lat)); setValue('longitude', Number(addr.lon))
          if (addr.address) {
            setValue('city', addr.address.city || addr.address.town || addr.address.village || addr.address.municipality || addr.address.city_district || '')
            setValue('locality', addr.address.suburb || addr.address.neighbourhood || addr.address.quarter || addr.address.hamlet || addr.address.state_district || '')
          }
        }} />
        {(() => { const lat = watch('latitude'); const lng = watch('longitude'); if (!lat || !lng) return null; return <div className="mt-2"><MapPreview lat={Number(lat)} lng={Number(lng)} /></div> })()}
      </div>
      <div className="md:col-span-2">
        <FormLabel>Location</FormLabel>
        <LocationPicker value={null} onChange={(p) => { setValue('latitude', p.lat); setValue('longitude', p.lng) }} />
      </div>
      <div className="md:col-span-2">
        <FormLabel>Media</FormLabel>
        <ImageUpload value={images} onChange={setImages} primary={primaryImage} onPrimaryChange={setPrimaryImage} />
      </div>
      <FormField control={form.control} name="latitude" render={({ field }) => (
        <FormItem><FormLabel>Latitude</FormLabel><FormControl><Input type="number" step="0.000001" {...field} /></FormControl><FormMessage /></FormItem>
      )} />
      <FormField control={form.control} name="longitude" render={({ field }) => (
        <FormItem><FormLabel>Longitude</FormLabel><FormControl><Input type="number" step="0.000001" {...field} /></FormControl><FormMessage /></FormItem>
      )} />
    </>
  )
}

export default PropertyBasicInfo
