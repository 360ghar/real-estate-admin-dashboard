import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Card, CardContent } from '@/components/ui/card'
import { skipToken } from '@reduxjs/toolkit/query'
import { useToast } from '@/hooks/use-toast'
import { useCreateBookingMutation, useCheckAvailabilityQuery, useCalculatePricingQuery } from '@/features/bookings/api/bookingsApi'
import { useGetPropertyQuery, useSearchPropertiesQuery } from '@/features/properties/api/propertiesApi'
import { Plus } from 'lucide-react'
import type { BookingPricing, AvailabilityInfo } from '@/types/api'
import { createBookingSchema, type CreateBookingFormValues } from '@/features/bookings/validations'
import BookingDateSelection from './parts/BookingDateSelection'

const CreateBookingDialog: React.FC<{ propertyId?: number; onSuccess?: () => void }> = ({ propertyId: externalPropertyId, onSuccess }) => {
  const { toast } = useToast()
  const [isOpen, setIsOpen] = useState(false)
  const [selectedPropertyId, setSelectedPropertyId] = useState<number | undefined>(externalPropertyId)
  const [propertySearch, setPropertySearch] = useState('')
  const [selectedDates, setSelectedDates] = useState<{ from: Date | undefined; to: Date | undefined }>({ from: undefined, to: undefined })
  const [pricingInfo, setPricingInfo] = useState<BookingPricing | null>(null)
  const [availabilityInfo, setAvailabilityInfo] = useState<AvailabilityInfo | null>(null)

  const propertyId = selectedPropertyId
  const { data: searchResults } = useSearchPropertiesQuery({ q: propertySearch, limit: 10 }, { skip: !isOpen || !!externalPropertyId || propertySearch.length < 2 })
  const { data: property } = useGetPropertyQuery(propertyId || 0, { skip: !propertyId || !isOpen })

  const form = useForm<CreateBookingFormValues>({ resolver: zodResolver(createBookingSchema), defaultValues: { guests: 1 } })
  const guestsCount = Math.max(form.watch('guests') || 1, 1)

  const checkAvailability = useCheckAvailabilityQuery(
    propertyId && selectedDates.from && selectedDates.to ? { property_id: propertyId, check_in_date: selectedDates.from.toISOString(), check_out_date: selectedDates.to.toISOString(), guests: guestsCount } : skipToken
  )
  const calculatePricing = useCalculatePricingQuery(
    propertyId && selectedDates.from && selectedDates.to ? { property_id: propertyId, check_in_date: selectedDates.from.toISOString(), check_out_date: selectedDates.to.toISOString(), guests: guestsCount } : skipToken
  )
  const [createBooking] = useCreateBookingMutation()

  useEffect(() => { if (checkAvailability.data) setAvailabilityInfo(checkAvailability.data) }, [checkAvailability.data])
  useEffect(() => { if (calculatePricing.data) setPricingInfo(calculatePricing.data) }, [calculatePricing.data])

  const onSubmit = async (data: CreateBookingFormValues) => {
    try {
      await createBooking({ ...data, property_id: propertyId!, check_in_date: selectedDates.from!.toISOString(), check_out_date: selectedDates.to!.toISOString() }).unwrap()
      toast({ title: 'Booking Created', description: 'Your booking has been created successfully.' })
      setIsOpen(false); form.reset(); setSelectedDates({ from: undefined, to: undefined }); onSuccess?.()
    } catch { toast({ title: 'Booking Failed', description: 'Failed to create booking. Please try again.', variant: 'destructive' }) }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-2" />New Booking</Button></DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader><DialogTitle>Create New Booking</DialogTitle><DialogDescription>Select dates and enter guest details for your booking</DialogDescription></DialogHeader>
        {!externalPropertyId && (
          <div className="space-y-2 mb-4">
            <Label>Search Property</Label>
            <Input placeholder="Search by title or location..." value={propertySearch} onChange={(e) => setPropertySearch(e.target.value)} />
            {searchResults?.properties && searchResults.properties.length > 0 && !propertyId && (
              <div className="border rounded-md max-h-40 overflow-y-auto">{searchResults.properties.map((p) => (
                <button key={p.id} type="button" className="w-full text-left px-3 py-2 hover:bg-muted text-sm border-b last:border-b-0" onClick={() => { setSelectedPropertyId(p.id); setPropertySearch(p.title) }}>
                  <span className="font-medium">{p.title}</span><span className="text-muted-foreground ml-2">{p.city}</span>
                </button>
              ))}</div>
            )}
          </div>
        )}
        {property && (
          <Card className="mb-4"><CardContent className="pt-4"><div className="flex gap-4">
            <img src={property.main_image_url || '/placeholder-property.jpg'} alt={property.title} className="w-20 h-20 object-cover rounded" />
            <div><h3 className="font-semibold">{property.title}</h3><p className="text-sm text-muted-foreground">{property.city}, {property.locality}</p><p className="text-sm font-medium">₹{property.base_price.toLocaleString()}/night</p></div>
          </div></CardContent></Card>
        )}
        <form onSubmit={(e) => void form.handleSubmit(onSubmit)(e)} className="space-y-6">
          <BookingDateSelection selectedDates={selectedDates} setSelectedDates={setSelectedDates} pricingInfo={pricingInfo} availabilityInfo={availabilityInfo} />
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2"><Label htmlFor="guests">Number of Guests</Label><Input id="guests" type="number" min={1} max={property?.max_occupancy || 10} {...form.register('guests', { valueAsNumber: true })} /></div>
            <div className="space-y-2"><Label htmlFor="primary_guest_name">Primary Guest Name</Label><Input id="primary_guest_name" {...form.register('primary_guest_name')} placeholder="John Doe" /></div>
            <div className="space-y-2"><Label htmlFor="primary_guest_phone">Phone Number</Label><Input id="primary_guest_phone" {...form.register('primary_guest_phone')} placeholder="+1234567890" /></div>
            <div className="space-y-2"><Label htmlFor="primary_guest_email">Email Address</Label><Input id="primary_guest_email" type="email" {...form.register('primary_guest_email')} placeholder="john@example.com" /></div>
          </div>
          <div className="space-y-2"><Label htmlFor="special_requests">Special Requests (Optional)</Label><Textarea id="special_requests" {...form.register('special_requests')} placeholder="Any special requirements or requests..." rows={3} /></div>
          <div className="flex gap-2">
            <Button type="submit" disabled={!propertyId || !selectedDates.from || !selectedDates.to || !availabilityInfo?.available} className="flex-1">Create Booking</Button>
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export { CreateBookingDialog }
