import React from 'react'
import { Calendar } from '@/components/ui/calendar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { CalendarDays } from 'lucide-react'
import { isAfter, isBefore, differenceInDays } from 'date-fns'
import type { BookingPricing, AvailabilityInfo } from '@/types/api'

interface BookingDateSelectionProps {
  selectedDates: { from: Date | undefined; to: Date | undefined }
  setSelectedDates: React.Dispatch<React.SetStateAction<{ from: Date | undefined; to: Date | undefined }>>
  pricingInfo: BookingPricing | null
  availabilityInfo: AvailabilityInfo | null
}

const BookingDateSelection: React.FC<BookingDateSelectionProps> = ({ selectedDates, setSelectedDates, pricingInfo, availabilityInfo }) => (
  <div className="space-y-4">
    <Label className="text-base">Select Dates</Label>
    <div className="grid gap-4 md:grid-cols-2">
      <div className="space-y-2">
        <Label>Check-in Date</Label>
        <Calendar mode="single" selected={selectedDates.from}
          onSelect={(date) => { setSelectedDates(prev => ({ ...prev, from: date })); if (date && selectedDates.to && isAfter(date, selectedDates.to)) setSelectedDates(prev => ({ ...prev, to: undefined })) }}
          disabled={(date) => isBefore(date, new Date())} />
      </div>
      <div className="space-y-2">
        <Label>Check-out Date</Label>
        <Calendar mode="single" selected={selectedDates.to}
          onSelect={(date) => setSelectedDates(prev => ({ ...prev, to: date }))}
          disabled={(date) => !selectedDates.from || isBefore(date, selectedDates.from)} />
      </div>
    </div>
    {selectedDates.from && selectedDates.to && (
      <div className="text-sm text-muted-foreground"><CalendarDays className="h-4 w-4 inline mr-1" />{differenceInDays(selectedDates.to, selectedDates.from)} nights</div>
    )}
    {availabilityInfo && !availabilityInfo.available && (
      <div className="p-3 bg-red-50 border border-red-200 rounded-lg"><p className="text-sm text-red-800">{availabilityInfo.reason || 'Property is not available for selected dates'}</p></div>
    )}
    {pricingInfo && (
      <Card>
        <CardHeader><CardTitle className="text-sm">Pricing Details</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between text-sm"><span>Base Price (₹{pricingInfo.base_amount.toLocaleString()} / {pricingInfo.nights} nights)</span><span>₹{pricingInfo.base_amount.toLocaleString()}</span></div>
          <div className="flex justify-between text-sm"><span>Taxes</span><span>₹{pricingInfo.taxes_amount.toLocaleString()}</span></div>
          <div className="flex justify-between text-sm"><span>Service Fee</span><span>₹{pricingInfo.service_charges.toLocaleString()}</span></div>
          <Separator />
          <div className="flex justify-between font-medium"><span>Total Amount</span><span>₹{pricingInfo.total_amount.toLocaleString()}</span></div>
        </CardContent>
      </Card>
    )}
  </div>
)

export default BookingDateSelection
