import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Eye, EyeOff, Shield, Building2 } from 'lucide-react'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

import { supabase } from '@/lib/supabase'
import { mapSupabaseAuthError } from '@/lib/authErrors'
import { fetchUserProfileWithToken } from '@/lib/auth'
import { useAppDispatch } from '@/hooks/redux'
import { setCredentials } from '@/features/auth/slices/authSlice'
import { signupSchema, type SignupFormValues } from '@/features/auth/validations'

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'

export default function SignupPage() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: { terms_accepted: false },
  })

  const onSubmit = async (values: SignupFormValues) => {
    if (!supabase) {
      setErrorMessage('Supabase is not configured. Please set environment variables.')
      return
    }

    setErrorMessage(null)
    setSuccessMessage(null)
    setIsSubmitting(true)

    try {
      const redirectTo = `${window.location.origin}/reset-password`
      const result = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: {
          emailRedirectTo: redirectTo,
          data: {
            full_name: values.full_name,
            phone: values.phone,
          },
        },
      })

      if (result.error) throw result.error

      // If email confirmation is enabled, there will be no session.
      if (!result.data.session) {
        setSuccessMessage(
          'Account created. Please check your email to verify your account before signing in.'
        )
        form.reset()
        return
      }

      const accessToken = result.data.session.access_token
      const profile = await fetchUserProfileWithToken(accessToken)

      if (profile) {
        dispatch(setCredentials({ token: accessToken, user: profile }))
        navigate('/dashboard', { replace: true })
      } else {
        setSuccessMessage(
          'Account created and signed in. Your profile is being provisioned — please try accessing the dashboard shortly.'
        )
      }
    } catch (err) {
      setErrorMessage(mapSupabaseAuthError(err))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary via-primary/90 to-primary/80 flex-col justify-center items-center p-12 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10 text-center">
          <div className="flex justify-center mb-8">
            <div className="p-4 bg-primary-foreground/10 rounded-full backdrop-blur-sm">
              <Building2 className="h-16 w-16" />
            </div>
          </div>
          <h1 className="text-4xl font-bold mb-4">Become a 360Ghar Agent</h1>
          <p className="text-xl mb-8 opacity-90">Join the agent portal</p>
          <div className="space-y-4 text-sm opacity-75">
            <p>✓ Manage assigned users and properties</p>
            <p>✓ Seamless coordination with admins</p>
            <p>✓ Real-time bookings and visits</p>
          </div>
        </div>
        <div className="absolute bottom-8 left-8">
          <Shield className="h-8 w-8 opacity-50" />
        </div>
      </div>

      {/* Right Side - Signup Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 bg-gradient-to-br from-background to-muted/20">
        <Card className="w-full max-w-md shadow-xl border bg-card/80 backdrop-blur-sm">
          <CardHeader className="space-y-1 text-center pb-8">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-primary/10 rounded-full">
                <Shield className="h-8 w-8 text-primary" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold">Agent Sign Up</CardTitle>
            <p className="text-muted-foreground">Create your agent account</p>
          </CardHeader>
          <CardContent className="space-y-6">
            {errorMessage && (
              <Alert variant="destructive">
                <AlertDescription>{errorMessage}</AlertDescription>
              </Alert>
            )}
            {successMessage && (
              <Alert>
                <AlertDescription>{successMessage}</AlertDescription>
              </Alert>
            )}

            <Form {...form}>
              <form onSubmit={(e) => void form.handleSubmit(onSubmit)(e)} className="space-y-5">
                <FormField
                  control={form.control}
                  name="full_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John Doe" className="h-11" {...field} />
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
                      <FormLabel className="text-sm font-medium">Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="you@example.com" className="h-11" {...field} />
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
                      <FormLabel className="text-sm font-medium">Phone</FormLabel>
                      <FormControl>
                        <Input type="tel" placeholder="+91XXXXXXXXXX" className="h-11" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Create a password"
                            className="h-11 pr-12"
                            {...field}
                          />
                          <button
                            type="button"
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                            onClick={() => setShowPassword((s) => !s)}
                          >
                            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="confirm_password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">Confirm Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="Re-enter password" className="h-11" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="terms_accepted"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <div className="flex items-start gap-2">
                        <FormControl>
                          <Checkbox
                            id="terms_accepted"
                            className="mt-0.5"
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormLabel htmlFor="terms_accepted" className="text-sm font-normal text-muted-foreground leading-snug">
                          I agree to the{' '}
                          <a
                            href="https://360ghar.com/policies/terms-of-service"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline"
                          >
                            Terms &amp; Conditions
                          </a>{' '}
                          and{' '}
                          <a
                            href="https://360ghar.com/policies/privacy-policy"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline"
                          >
                            Privacy Policy
                          </a>
                        </FormLabel>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="pt-2">
                  <Button type="submit" className="w-full h-11 text-base font-medium" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <LoadingSpinner size="sm" className="mr-2" />
                        Creating account...
                      </>
                    ) : (
                      'Create Account'
                    )}
                  </Button>
                </div>
              </form>
            </Form>

            <div className="text-center pt-2 text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link to="/login" className="text-primary hover:underline">
                Sign in
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
