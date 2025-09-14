import { useEffect } from 'react'
import { useGetUserQuery, useUpdateUserMutation } from '@/store/services/usersApi'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useToast } from '@/hooks/use-toast'
import { useAppSelector } from '@/hooks/redux'
import { selectCurrentUser } from '@/store/slices/authSlice'
import AssignAgent from './assign/AssignAgent'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'

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
    } catch (e: any) {
      toast({ title: 'Failed', description: e?.data?.detail || 'Please try again', variant: 'destructive' })
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
    </div>
  )
}

export default UserDetail
