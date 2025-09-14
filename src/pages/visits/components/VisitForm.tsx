import { useState } from 'react'
import { useCreateVisitMutation } from '@/store/services/visitsApi'
import { useListUsersQuery } from '@/store/services/usersApi'
import { useListPropertiesQuery } from '@/store/services/propertiesApi'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'

const schema = z.object({
  user_id: z.coerce.number().min(1, 'User is required'),
  property_id: z.coerce.number().min(1, 'Property is required'),
  scheduled_date: z.string().min(1, 'Date is required'),
  status: z.enum(['scheduled', 'completed', 'cancelled']).default('scheduled'),
})

type FormValues = z.infer<typeof schema>

const VisitForm = () => {
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      user_id: 0,
      property_id: 0,
      scheduled_date: '',
      status: 'scheduled',
    },
  })
  const { toast } = useToast()
  const [create, createState] = useCreateVisitMutation()
  const users = useListUsersQuery({})
  const properties = useListPropertiesQuery({})
  const { control, handleSubmit, formState: { errors } } = form

  const onSubmit = async (values: FormValues) => {
    try {
      await create({
        user_id: values.user_id,
        property_id: values.property_id,
        scheduled_date: new Date(values.scheduled_date).toISOString(),
        status: values.status,
        agent_id: undefined,
      }).unwrap()
      toast({ title: 'Scheduled', description: 'Visit scheduled' })
      form.reset()
    } catch (e: any) {
      toast({ title: 'Failed', description: e?.data?.detail || 'Please try again', variant: 'destructive' })
    }
  }

  const error = createState.error as any

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Schedule Visit</h1>
      <Card>
        <CardHeader>
          <CardTitle>Details</CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertTitle>Failed to schedule visit</AlertTitle>
              <AlertDescription>{error?.data?.detail || 'Something went wrong'}</AlertDescription>
            </Alert>
          )}
          <Form {...form}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={control}
                name="user_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>User</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value ? String(field.value) : ''} disabled={users.isFetching}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={users.isFetching ? "Loading users..." : "Select user"} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {users.data?.results?.map((u) => (
                          <SelectItem key={u.id} value={String(u.id)}>
                            {u.full_name || u.phone || `User ${u.id}`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name="property_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Property</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value ? String(field.value) : ''} disabled={properties.isFetching}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={properties.isFetching ? "Loading properties..." : "Select property"} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {properties.data?.results?.map((p) => (
                          <SelectItem key={p.id} value={String(p.id)}>
                            {p.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name="scheduled_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date & Time</FormLabel>
                    <FormControl>
                      <Input type="datetime-local" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {['scheduled', 'completed', 'cancelled'].map((status) => (
                          <SelectItem key={status} value={status}>
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={createState.isLoading}>
                {createState.isLoading ? 'Scheduling...' : 'Schedule Visit'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}

export default VisitForm
