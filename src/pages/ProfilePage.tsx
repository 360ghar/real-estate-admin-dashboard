import React from 'react'
import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import { selectCurrentUser, setCredentials } from '@/store/slices/authSlice'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useUpdateUserMutation } from '@/store/services/usersApi'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { User, Mail, Phone, Calendar, MapPin, Shield, CheckCircle, Loader2, Camera } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

const schema = z.object({
  full_name: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
})
type FormValues = z.infer<typeof schema>

const ProfilePage = () => {
  const me = useAppSelector(selectCurrentUser)
  const dispatch = useAppDispatch()
  const { toast } = useToast()
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
    try {
      const user = await updateUser({ id: me!.id, data: values }).unwrap()
      const token = localStorage.getItem('token') || ''
      dispatch(setCredentials({ token, user }))

      toast({
        title: "Profile Updated",
        description: "Your profile information has been successfully updated.",
      })
    } catch (error: any) {
      toast({
        title: "Update Failed",
        description: error?.data?.detail || "Failed to update profile. Please try again.",
        variant: "destructive",
      })
    }
  }

  const role = (me?.role as 'admin' | 'agent' | 'user') || (me?.agent_id ? 'agent' : 'admin')
  const isFormDirty = form.formState.isDirty

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">My Profile</h1>
        <p className="text-muted-foreground">
          Manage your account information, security settings, and preferences.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Profile Overview */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Profile Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Avatar Section */}
            <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                <Avatar className="h-24 w-24">
                  <AvatarFallback className="text-2xl font-semibold bg-primary/10 text-primary">
                    {me?.full_name ? me.full_name.split(' ').map(n => n[0]).join('').toUpperCase() : 'U'}
                  </AvatarFallback>
                </Avatar>
                <Button className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full p-0 shadow-lg">
                  <Camera className="h-4 w-4" />
                </Button>
              </div>
              <div className="text-center">
                <h3 className="text-xl font-semibold">{me?.full_name || 'N/A'}</h3>
                <div className="flex items-center justify-center gap-2 mt-2">
                  <Badge variant={role === 'admin' ? 'default' : 'secondary'} className="px-3 py-1">
                    {role === 'admin' ? (
                      <>
                        <Shield className="h-3 w-3 mr-1" />
                        Administrator
                      </>
                    ) : (
                      <>
                        <User className="h-3 w-3 mr-1" />
                        Agent
                      </>
                    )}
                  </Badge>
                </div>
              </div>
            </div>

            <Separator />

            {/* Contact Information */}
            <div className="space-y-4">
              <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wider">Contact Information</h4>

              <div className="space-y-3">
                <div className="flex items-center space-x-3 p-3 rounded-lg bg-muted/30">
                  <div className="p-2 bg-primary/10 rounded-full">
                    <Mail className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-muted-foreground">Email</p>
                    <p className="text-sm font-medium truncate">{me?.email || 'Not provided'}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-3 rounded-lg bg-muted/30">
                  <div className="p-2 bg-primary/10 rounded-full">
                    <Phone className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-muted-foreground">Phone</p>
                    <p className="text-sm font-medium">{me?.phone || 'Not provided'}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-3 rounded-lg bg-muted/30">
                  <div className="p-2 bg-primary/10 rounded-full">
                    <Calendar className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-muted-foreground">User ID</p>
                    <p className="text-sm font-medium font-mono">#{me?.id}</p>
                  </div>
                </div>

                {role === 'agent' && (
                  <div className="flex items-center space-x-3 p-3 rounded-lg bg-muted/30">
                    <div className="p-2 bg-primary/10 rounded-full">
                      <MapPin className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-muted-foreground">Agent ID</p>
                      <p className="text-sm font-medium font-mono">#{me?.agent_id}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Edit Profile Form */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Edit Profile Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="full_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">Full Name</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter your full name"
                            className="h-11"
                            {...field}
                          />
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
                        <FormLabel className="text-sm font-medium">Phone Number</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter your phone number"
                            className="h-11"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel className="text-sm font-medium">Email Address</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="Enter your email address"
                            className="h-11"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="text-sm text-muted-foreground">
                    {isFormDirty && "You have unsaved changes"}
                  </div>
                  <div className="flex gap-3">
                    {isFormDirty && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => form.reset()}
                      >
                        Cancel
                      </Button>
                    )}
                    <Button
                      type="submit"
                      disabled={updateState.isLoading || !isFormDirty}
                      className="min-w-[120px]"
                    >
                      {updateState.isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Save Changes
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>

      {/* Additional Information for Admin */}
      {role === 'admin' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Administrator Privileges
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <div className="p-4 rounded-lg border bg-muted/30">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-primary/10 rounded-full">
                    <User className="h-4 w-4 text-primary" />
                  </div>
                  <h4 className="font-medium">User Management</h4>
                </div>
                <p className="text-sm text-muted-foreground">Full access to manage all users and their accounts</p>
              </div>

              <div className="p-4 rounded-lg border bg-muted/30">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-primary/10 rounded-full">
                    <User className="h-4 w-4 text-primary" />
                  </div>
                  <h4 className="font-medium">Agent Oversight</h4>
                </div>
                <p className="text-sm text-muted-foreground">Manage agents and their property assignments</p>
              </div>

              <div className="p-4 rounded-lg border bg-muted/30">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-primary/10 rounded-full">
                    <MapPin className="h-4 w-4 text-primary" />
                  </div>
                  <h4 className="font-medium">Property Control</h4>
                </div>
                <p className="text-sm text-muted-foreground">Complete control over all properties in the system</p>
              </div>

              <div className="p-4 rounded-lg border bg-muted/30">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-primary/10 rounded-full">
                    <Calendar className="h-4 w-4 text-primary" />
                  </div>
                  <h4 className="font-medium">Visit Management</h4>
                </div>
                <p className="text-sm text-muted-foreground">Oversee all scheduled visits and bookings</p>
              </div>

              <div className="p-4 rounded-lg border bg-muted/30">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-primary/10 rounded-full">
                    <CheckCircle className="h-4 w-4 text-primary" />
                  </div>
                  <h4 className="font-medium">Booking System</h4>
                </div>
                <p className="text-sm text-muted-foreground">Manage all property bookings and confirmations</p>
              </div>

              <div className="p-4 rounded-lg border bg-muted/30">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-primary/10 rounded-full">
                    <Shield className="h-4 w-4 text-primary" />
                  </div>
                  <h4 className="font-medium">Analytics Access</h4>
                </div>
                <p className="text-sm text-muted-foreground">View comprehensive system analytics and reports</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default ProfilePage
