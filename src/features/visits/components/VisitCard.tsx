import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { format } from 'date-fns'
import { MapPin, Clock, User, Check, Edit } from 'lucide-react'
import type { Visit } from '@/types/api'
import { parseServerTimestamp, serverTimestampToLocalInput } from '@/lib/dateTime'
import { getVisitStatusColor } from '@/lib/statusColors'
import { ConfirmAlertDialog } from '@/components/ui/confirm-alert-dialog'

interface VisitCardProps {
  visit: Visit
  isAdmin: boolean
  isUser: boolean
  onComplete: (visit: Visit) => void
  onReschedule: (visitId: number, newDate: string) => void
  onCancel: (visitId: number) => void
}

const VisitCard = ({
  visit,
  isAdmin: _isAdmin,
  isUser,
  onComplete,
  onReschedule,
  onCancel,
}: VisitCardProps) => {
  const [rescheduleDate, setRescheduleDate] = useState(serverTimestampToLocalInput(visit.scheduled_date) || '')

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-lg">{visit.property?.title}</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  <MapPin className="h-4 w-4 inline mr-1" />
                  {visit.property?.city}, {visit.property?.locality}
                </p>
                <p className="text-sm text-muted-foreground">
                  <Clock className="h-4 w-4 inline mr-1" />
                  {(() => {
                    const visitDate = parseServerTimestamp(visit.scheduled_date)
                    return visitDate ? format(visitDate, 'MMM dd, yyyy - HH:mm') : 'Invalid date'
                  })()}
                </p>
                {!isUser && visit.user && (
                  <p className="text-sm text-muted-foreground">
                    <User className="h-4 w-4 inline mr-1" />
                    {visit.user.full_name}
                  </p>
                )}
                {visit.agent && (
                  <p className="text-sm text-muted-foreground">
                    Agent: {visit.agent.user?.full_name}
                  </p>
                )}
                {visit.special_requirements && (
                  <p className="text-sm mt-2 p-2 bg-muted rounded">
                    <strong>Special Requirements:</strong> {visit.special_requirements}
                  </p>
                )}
              </div>
              <Badge variant={getVisitStatusColor(visit.status)} className="capitalize">
                {visit.status}
              </Badge>
            </div>
          </div>
          <div className="flex gap-2">
            {(visit.status === 'scheduled' || visit.status === 'confirmed') && (
              <>
                {!isUser && (
                  <Button
                    size="sm"
                    onClick={() => onComplete(visit)}
                    aria-label="Complete visit"
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                )}
                <Sheet>
                  <SheetTrigger asChild>
                    <Button size="sm" variant="outline">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent>
                    <SheetHeader>
                      <SheetTitle>Reschedule Visit</SheetTitle>
                      <SheetDescription>
                        Select a new date and time for the visit
                      </SheetDescription>
                    </SheetHeader>
                    <div className="space-y-4 mt-6">
                      <div className="space-y-2">
                        <Label>New Date & Time</Label>
                        <Input
                          type="datetime-local"
                          value={rescheduleDate}
                          onChange={(e) => setRescheduleDate(e.target.value)}
                        />
                      </div>
                      <Button
                        onClick={() => { if (rescheduleDate) onReschedule(visit.id, rescheduleDate) }}
                        className="w-full"
                      >
                        Confirm Reschedule
                      </Button>
                      <ConfirmAlertDialog
                        title="Cancel Visit"
                        description="Are you sure you want to cancel this visit?"
                        confirmLabel="Cancel Visit"
                        variant="destructive"
                        onConfirm={() => onCancel(visit.id)}
                      >
                        {(openDialog) => (
                          <Button onClick={openDialog} variant="destructive" className="w-full">
                            Cancel Visit
                          </Button>
                        )}
                      </ConfirmAlertDialog>
                    </div>
                  </SheetContent>
                </Sheet>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export { VisitCard }
export type { VisitCardProps }
