import { useEffect, useState } from 'react'
import { useGetUserQuery, useUpdateUserMutation, useSendTypedNotificationMutation } from '@/features/users/api/usersApi'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useToast } from '@/hooks/use-toast'
import { useAppSelector } from '@/hooks/redux'
import { selectCurrentUser } from '@/features/auth/slices/authSlice'
import AssignAgent from './assign/AssignAgent'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { useGetUserNotificationsQuery } from '@/features/core/api/notificationsApi'
import { Label } from '@/components/ui/label'

const schema = z.object({
  full_name: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  is_active: z.boolean().optional(),
})
type FormValues = z.infer<typeof schema>

const UserDetail = ({ id }: { id: number }) => {
  const { data, isFetching } = useGetUserQuery(id)
  const [update, updateState] = useUpdateUserMutation()
  const { toast } = useToast()
  const me = useAppSelector(selectCurrentUser)
  const role = (me?.role as 'admin' | 'agent' | 'user') || (me?.agent_id ? 'agent' : 'admin')
  const [sendNotification, sendState] = useSendTypedNotificationMutation()

  const {
    data: notifications,
    isFetching: notificationsLoading,
    refetch: refetchNotifications,
  } = useGetUserNotificationsQuery(id)

  const [notifType, setNotifType] = useState<string>('promotion_generic')
  const [notifTitle, setNotifTitle] = useState<string>('Message from 360 Ghar')
  const [notifBody, setNotifBody] = useState<string>('')

  const form = useForm<FormValues>({ resolver: zodResolver(schema) })
  const { reset } = form

  useEffect(() => {
    if (data) {
      reset({ full_name: data.full_name || '', phone: data.phone || '', email: data.email || '', is_active: data.is_active ?? true })
    }
  }, [data, reset])

  const onSubmit = async (values: FormValues) => {
    try {
      await update({ id, data: values }).unwrap()
      toast({ title: 'Saved', description: 'User updated' })
    } catch (e: unknown) {
      toast({ title: 'Failed', description: (e as any)?.data?.detail || 'Please try again', variant: 'destructive' })
    }
  }

  const handleSendNotification = async () => {
    if (!notifBody.trim()) {
      toast({ title: 'Message required', description: 'Please enter a message to send.', variant: 'destructive' })
      return
    }
    try {
      await sendNotification({
        userId: id,
        typeKey: notifType,
        title: notifTitle,
        body: notifBody,
      }).unwrap()
      toast({ title: 'Notification sent', description: 'The user will receive this notification shortly.' })
      setNotifBody('')
    } catch (e: unknown) {
      toast({
        title: 'Failed to send',
        description: (e as any)?.data?.detail || 'Unable to send notification. Please try again.',
        variant: 'destructive',
      })
    }
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">User Details</h1>
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 md:grid-cols-2">
            <div>
              <FormField
                control={form.control}
                name="full_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div>
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div>
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="md:col-span-2 flex justify-end">
              <Button type="submit" disabled={updateState.isLoading || isFetching}>{updateState.isLoading ? 'Saving…' : 'Save'}</Button>
            </div>
          </form>
          </Form>
        </CardContent>
      </Card>

      {role === 'admin' && (
        <Card>
          <CardHeader>
            <CardTitle>Assign Agent</CardTitle>
          </CardHeader>
          <CardContent>
            <AssignAgent userId={id} />
          </CardContent>
        </Card>
      )}

      {role === 'admin' && (
        <Card>
          <CardHeader>
            <CardTitle>Send Notification</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label>Notification type</Label>
                <Select value={notifType} onValueChange={setNotifType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="booking_confirmed">Booking confirmed</SelectItem>
                    <SelectItem value="payment_failed">Payment failed</SelectItem>
                    <SelectItem value="promotion_generic">Promotion</SelectItem>
                    <SelectItem value="discount_offer">Discount offer</SelectItem>
                    <SelectItem value="visit_reminder">Visit reminder</SelectItem>
                    <SelectItem value="property_recommendation">Property recommendation</SelectItem>
                    <SelectItem value="admin_broadcast">Admin broadcast</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Title</Label>
                <Input value={notifTitle} onChange={(e) => setNotifTitle(e.target.value)} />
              </div>
            </div>
            <div>
              <Label>Message</Label>
              <Textarea
                rows={4}
                value={notifBody}
                onChange={(e) => setNotifBody(e.target.value)}
                placeholder="Write the message to send to this user…"
              />
            </div>
            <div className="flex justify-end">
              <Button
                type="button"
                onClick={handleSendNotification}
                disabled={sendState.isLoading}
              >
                {sendState.isLoading ? 'Sending…' : 'Send notification'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {role === 'admin' && (
        <Card>
          <CardHeader>
            <CardTitle>Notification History</CardTitle>
          </CardHeader>
          <CardContent>
            {notificationsLoading && <p className="text-sm text-muted-foreground">Loading notifications…</p>}
            {!notificationsLoading && (!notifications || notifications.length === 0) && (
              <p className="text-sm text-muted-foreground">No notifications have been sent to this user yet.</p>
            )}
            {!notificationsLoading && notifications && notifications.length > 0 && (
              <div className="space-y-3">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="ml-auto mb-2"
                  onClick={() => refetchNotifications()}
                >
                  Refresh
                </Button>
                <div className="space-y-2 max-h-80 overflow-y-auto">
                  {notifications.map((n) => (
                    <div
                      key={n.id}
                      className="rounded-md border bg-muted/40 px-3 py-2 text-sm"
                    >
                      <div className="flex items-center justify-between">
                        <div className="font-medium">{n.title}</div>
                        {n.created_at && (
                          <span className="text-xs text-muted-foreground">
                            {new Date(n.created_at).toLocaleString()}
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground line-clamp-3">
                        {n.body}
                      </p>
                      {n.audience_type && (
                        <p className="mt-1 text-xs text-muted-foreground">
                          Audience: {n.audience_type}
                          {n.topic ? ` • topic: ${n.topic}` : ''}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default UserDetail
