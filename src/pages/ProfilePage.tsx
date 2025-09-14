import React from 'react'
import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import { selectCurrentUser, setCredentials } from '@/store/slices/authSlice'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useUpdateUserMutation } from '@/store/services/usersApi'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'

const schema = z.object({
  full_name: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
})
type FormValues = z.infer<typeof schema>

const ProfilePage = () => {
  const me = useAppSelector(selectCurrentUser)
  const dispatch = useAppDispatch()
  const form = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { full_name: '', phone: '', email: '' } })
  const [updateUser, updateState] = useUpdateUserMutation()

  // initialize values when user data is available
  React.useEffect(() => {
    if (me && 'id' in me) {
      form.reset({
        full_name: me.full_name || '',
        phone: me.phone || '',
        email: me.email || ''
      })
    }
  }, [me, form])

  const onSubmit = async (values: FormValues) => {
    const user = await updateUser({ id: me!.id, data: values }).unwrap()
    const token = localStorage.getItem('token') || ''
    dispatch(setCredentials({ token, user }))
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Profile</h1>
      <Card>
        <CardHeader>
          <CardTitle>My Details</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 md:grid-cols-2">
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
              <div className="md:col-span-2 flex justify-end">
                <Button type="submit" disabled={updateState.isLoading}>{updateState.isLoading ? 'Saving…' : 'Save'}</Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}

export default ProfilePage
