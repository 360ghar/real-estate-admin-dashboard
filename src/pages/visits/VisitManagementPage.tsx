import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Calendar } from '@/components/ui/calendar'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/hooks/useAuth'
import {
  useGetUserVisitsQuery,
  useGetUpcomingVisitsQuery,
  useGetPastVisitsQuery,
  useScheduleVisitMutation,
  useUpdateVisitMutation,
  useRescheduleVisitMutation,
  useCancelVisitMutation,
  useCompleteVisitMutation,
  useGetAllVisitsQuery
} from '@/store/services/visitsApi'
import { useSearchPropertiesQuery } from '@/store/services/propertiesApi'
import { format, addDays, isAfter, isBefore, parseISO } from 'date-fns'
import { Calendar as CalendarIcon, MapPin, Clock, User, Plus, Edit, X, Check, AlertCircle } from 'lucide-react'

const scheduleVisitSchema = z.object({
  property_id: z.number().min(1, 'Property is required'),
  scheduled_date: z.string().min(1, 'Date and time are required'),
  special_requirements: z.string().optional(),
})

const completeVisitSchema = z.object({
  notes: z.string().min(1, 'Notes are required'),
  feedback: z.string().optional(),
})

type ScheduleVisitFormData = z.infer<typeof scheduleVisitSchema>
type CompleteVisitFormData = z.infer<typeof completeVisitSchema>

interface VisitCalendarProps {
  visits: any[]
  onDateSelect: (date: Date) => void
  selectedDate?: Date
}

const VisitCalendar: React.FC<VisitCalendarProps> = ({ visits, onDateSelect, selectedDate }) => {
  const hasVisitOnDate = (date: Date) => {
    return visits.some(visit => {
      const visitDate = parseISO(visit.scheduled_date)
      return format(visitDate, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
    })
  }

  const getVisitsForDate = (date: Date) => {
    return visits.filter(visit => {
      const visitDate = parseISO(visit.scheduled_date)
      return format(visitDate, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
    })
  }

  return (
    <div className="space-y-4">
      <Calendar
        mode="single"
        selected={selectedDate}
        onSelect={(date) => date && onDateSelect(date)}
        className="rounded-md border"
        modifiers={{
          hasVisit: (date) => hasVisitOnDate(date)
        }}
        modifiersStyles={{
          hasVisit: {
            backgroundColor: '#3b82f6',
            color: 'white'
          }
        }}
      />
      {selectedDate && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">
              Visits for {format(selectedDate, 'MMM dd, yyyy')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {getVisitsForDate(selectedDate).length === 0 ? (
              <p className="text-sm text-muted-foreground">No visits scheduled</p>
            ) : (
              <div className="space-y-2">
                {getVisitsForDate(selectedDate).map((visit) => (
                  <div key={visit.id} className="flex items-center justify-between p-2 border rounded">
                    <div>
                      <p className="text-sm font-medium">{visit.property?.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {format(parseISO(visit.scheduled_date), 'HH:mm')}
                      </p>
                    </div>
                    <Badge variant={visit.status === 'scheduled' ? 'default' : 'secondary'}>
                      {visit.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

const VisitManagementPage: React.FC = () => {
  const { user } = useAuth()
  const { toast } = useToast()
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [selectedVisit, setSelectedVisit] = useState<any>(null)
  const [showScheduleDialog, setShowScheduleDialog] = useState(false)
  const [showCompleteDialog, setShowCompleteDialog] = useState(false)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')

  // Form setup
  const scheduleForm = useForm<ScheduleVisitFormData>({
    resolver: zodResolver(scheduleVisitSchema),
    defaultValues: {
      scheduled_date: format(selectedDate, "yyyy-MM-dd'T'HH:mm"),
    },
  })

  const completeForm = useForm<CompleteVisitFormData>({
    resolver: zodResolver(completeVisitSchema),
  })

  // API calls
  const { data: userVisits, refetch: refetchUserVisits } = useGetUserVisitsQuery()
  const { data: upcomingVisits } = useGetUpcomingVisitsQuery()
  const { data: pastVisits } = useGetPastVisitsQuery()

  // Admin/Agent view
  const { data: allVisits, refetch: refetchAllVisits } = useGetAllVisitsQuery(
    { status: statusFilter === 'all' ? undefined : statusFilter },
    { skip: user?.role === 'user' }
  )

  const { data: properties } = useSearchPropertiesQuery({ limit: 100 })

  // Mutations
  const [scheduleVisit, { isLoading: scheduling }] = useScheduleVisitMutation()
  const [updateVisit, { isLoading: updating }] = useUpdateVisitMutation()
  const [rescheduleVisit, { isLoading: rescheduling }] = useRescheduleVisitMutation()
  const [cancelVisit, { isLoading: cancelling }] = useCancelVisitMutation()
  const [completeVisit, { isLoading: completing }] = useCompleteVisitMutation()

  const visits = user?.role === 'user' ? userVisits?.visits || [] : allVisits?.items || []

  const filteredVisits = visits.filter(visit => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      return (
        visit.property?.title.toLowerCase().includes(query) ||
        visit.user?.full_name.toLowerCase().includes(query) ||
        visit.agent?.user?.full_name.toLowerCase().includes(query)
      )
    }
    return true
  })

  const handleScheduleVisit = async (data: ScheduleVisitFormData) => {
    try {
      await scheduleVisit(data).unwrap()
      toast({
        title: 'Visit Scheduled',
        description: 'Your visit has been scheduled successfully.',
      })
      setShowScheduleDialog(false)
      scheduleForm.reset()
      refetchUserVisits()
      refetchAllVisits()
    } catch (error) {
      toast({
        title: 'Scheduling Failed',
        description: 'Failed to schedule visit. Please try again.',
        variant: 'destructive',
      })
    }
  }

  const handleCompleteVisit = async (data: CompleteVisitFormData) => {
    if (!selectedVisit) return

    try {
      await completeVisit({
        visitId: selectedVisit.id,
        ...data,
      }).unwrap()
      toast({
        title: 'Visit Completed',
        description: 'Visit has been marked as completed.',
      })
      setShowCompleteDialog(false)
      completeForm.reset()
      setSelectedVisit(null)
      refetchUserVisits()
      refetchAllVisits()
    } catch (error) {
      toast({
        title: 'Update Failed',
        description: 'Failed to complete visit. Please try again.',
        variant: 'destructive',
      })
    }
  }

  const handleRescheduleVisit = async (visitId: number, newDate: string) => {
    try {
      await rescheduleVisit({
        visitId,
        newDate,
        reason: 'Rescheduled by user',
      }).unwrap()
      toast({
        title: 'Visit Rescheduled',
        description: 'Visit has been rescheduled successfully.',
      })
      refetchUserVisits()
      refetchAllVisits()
    } catch (error) {
      toast({
        title: 'Reschedule Failed',
        description: 'Failed to reschedule visit. Please try again.',
        variant: 'destructive',
      })
    }
  }

  const handleCancelVisit = async (visitId: number) => {
    if (!confirm('Are you sure you want to cancel this visit?')) return

    try {
      await cancelVisit({
        visitId,
        reason: 'Cancelled by user',
      }).unwrap()
      toast({
        title: 'Visit Cancelled',
        description: 'Visit has been cancelled successfully.',
      })
      refetchUserVisits()
      refetchAllVisits()
    } catch (error) {
      toast({
        title: 'Cancellation Failed',
        description: 'Failed to cancel visit. Please try again.',
        variant: 'destructive',
      })
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'default'
      case 'completed':
        return 'default'
      case 'cancelled':
        return 'destructive'
      case 'no_show':
        return 'secondary'
      default:
        return 'outline'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Visit Management</h1>
          <p className="text-muted-foreground">
            Schedule and manage property visits
          </p>
        </div>
        {user?.role !== 'admin' && (
          <Dialog open={showScheduleDialog} onOpenChange={setShowScheduleDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Schedule Visit
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Schedule New Visit</DialogTitle>
                <DialogDescription>
                  Select a property and schedule a visit
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={scheduleForm.handleSubmit(handleScheduleVisit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="property_id">Property</Label>
                  <Select
                    value={scheduleForm.watch('property_id')?.toString()}
                    onValueChange={(value) => scheduleForm.setValue('property_id', Number(value))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a property" />
                    </SelectTrigger>
                    <SelectContent>
                      {properties?.properties.map((property) => (
                        <SelectItem key={property.id} value={property.id.toString()}>
                          {property.title} - {property.city}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="scheduled_date">Date & Time</Label>
                  <Input
                    id="scheduled_date"
                    type="datetime-local"
                    {...scheduleForm.register('scheduled_date')}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="special_requirements">Special Requirements</Label>
                  <Textarea
                    id="special_requirements"
                    {...scheduleForm.register('special_requirements')}
                    placeholder="Any special requirements or notes..."
                    rows={3}
                  />
                </div>
                <div className="flex gap-2">
                  <Button type="submit" disabled={scheduling} className="flex-1">
                    {scheduling ? 'Scheduling...' : 'Schedule Visit'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowScheduleDialog(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Stats */}
      {user?.role === 'user' && userVisits && (
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Visits</CardTitle>
              <CalendarIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userVisits.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Upcoming</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userVisits.upcoming}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <Check className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userVisits.completed}</div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-4">
        {/* Calendar Sidebar */}
        <div className="lg:col-span-1">
          <VisitCalendar
            visits={visits}
            onDateSelect={setSelectedDate}
            selectedDate={selectedDate}
          />
        </div>

        {/* Visit List */}
        <div className="lg:col-span-3 space-y-4">
          {/* Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <Input
                    placeholder="Search visits..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                {user?.role !== 'user' && (
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full sm:w-48">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="scheduled">Scheduled</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                      <SelectItem value="no_show">No Show</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Visit List */}
          <div className="space-y-4">
            {filteredVisits.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-8">
                    <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No visits found</h3>
                    <p className="text-muted-foreground mb-4">
                      {searchQuery ? 'Try adjusting your search' : 'Schedule your first visit to get started'}
                    </p>
                    {user?.role !== 'admin' && (
                      <Button onClick={() => setShowScheduleDialog(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Schedule Visit
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ) : (
              filteredVisits.map((visit) => (
                <Card key={visit.id}>
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
                              {format(parseISO(visit.scheduled_date), 'MMM dd, yyyy - HH:mm')}
                            </p>
                            {user?.role !== 'user' && visit.user && (
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
                          <Badge variant={getStatusColor(visit.status)} className="capitalize">
                            {visit.status}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {visit.status === 'scheduled' && (
                          <>
                            {user?.role !== 'user' && (
                              <Button
                                size="sm"
                                onClick={() => {
                                  setSelectedVisit(visit)
                                  setShowCompleteDialog(true)
                                }}
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
                                      defaultValue={format(parseISO(visit.scheduled_date), "yyyy-MM-dd'T'HH:mm")}
                                      onChange={(e) => {
                                        if (e.target.value) {
                                          handleRescheduleVisit(visit.id, e.target.value)
                                        }
                                      }}
                                    />
                                  </div>
                                  <Button
                                    onClick={() => handleCancelVisit(visit.id)}
                                    variant="destructive"
                                    className="w-full"
                                  >
                                    Cancel Visit
                                  </Button>
                                </div>
                              </SheetContent>
                            </Sheet>
                          </>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Complete Visit Dialog */}
      <Dialog open={showCompleteDialog} onOpenChange={setShowCompleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Complete Visit</DialogTitle>
            <DialogDescription>
              Add notes and feedback for the completed visit
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={completeForm.handleSubmit(handleCompleteVisit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="notes">Visit Notes</Label>
              <Textarea
                id="notes"
                {...completeForm.register('notes')}
                placeholder="Describe how the visit went..."
                rows={4}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="feedback">Feedback (Optional)</Label>
              <Textarea
                id="feedback"
                {...completeForm.register('feedback')}
                placeholder="Any additional feedback..."
                rows={3}
              />
            </div>
            <div className="flex gap-2">
              <Button type="submit" disabled={completing} className="flex-1">
                {completing ? 'Completing...' : 'Complete Visit'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowCompleteDialog(false)}
              >
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default VisitManagementPage