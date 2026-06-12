import { useState, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Eye, EyeOff, Shield, Building2, ArrowLeft } from 'lucide-react'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

import { supabase } from '@/lib/supabase'
import { mapSupabaseAuthError } from '@/lib/authErrors'
import { fetchUserProfileWithToken } from '@/lib/auth'
import { useAppDispatch } from '@/hooks/redux'
import { setCredentials } from '@/features/auth/slices/authSlice'
import { signupSchema, type SignupFormValues } from '@/features/auth/validations'
import { useResendTimer } from '@/hooks/useResendTimer'

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

  // OTP flow state
  const [step, setStep] = useState<'form' | 'otp' | 'setPassword'>('form')
  const [otp, setOtp] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmNewPassword, setConfirmNewPassword] = useState('')
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const signupDataRef = useRef<SignupFormValues | null>(null)

  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: { terms_accepted: false },
  })

  // 30s cooldown for the "Resend code" control on the OTP step.
  const resendTimer = useResendTimer()

  const isStrongPassword = (value: string) =>
    value.length >= 8 && /[A-Z]/.test(value) && /[0-9]/.test(value)

  const onSubmit = async (values: SignupFormValues) => {
    if (!supabase) {
      setErrorMessage('Supabase is not configured. Please set environment variables.')
      return
    }

    setErrorMessage(null)
    setSuccessMessage(null)
    setIsSubmitting(true)

    try {
      await sendSignupOtp(values)

      signupDataRef.current = values
      setStep('otp')
      setSuccessMessage(
        'We sent a 6-digit verification code to your email. Please enter it below.'
      )
    } catch (err) {
      setErrorMessage(mapSupabaseAuthError(err))
    } finally {
      setIsSubmitting(false)
    }
  }

  // Send (or resend) the 6-digit email OTP via signInWithOtp (creates user
  // without password). Starts the 30s resend cooldown on success.
  const sendSignupOtp = async (values: SignupFormValues) => {
    if (!supabase) throw new Error('Supabase is not configured.')
    const { error } = await supabase.auth.signInWithOtp({
      email: values.email,
      options: {
        shouldCreateUser: true,
        emailRedirectTo: `${window.location.origin}/auth/callback`,
        data: {
          full_name: values.full_name,
          phone: values.phone,
        },
      },
    })
    if (error) throw error
    resendTimer.start()
  }

  const handleResendOtp = async () => {
    if (!supabase || !signupDataRef.current || !resendTimer.canResend) return
    setErrorMessage(null)
    setIsSubmitting(true)
    try {
      await sendSignupOtp(signupDataRef.current)
      setSuccessMessage('We sent a new 6-digit verification code to your email.')
    } catch (err) {
      setErrorMessage(mapSupabaseAuthError(err))
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleOtpSubmit = async () => {
    if (!supabase || !signupDataRef.current) return

    const code = otp.replace(/\D/g, '')
    if (code.length !== 6) {
      setErrorMessage('Please enter the complete 6-digit code.')
      return
    }

    setErrorMessage(null)
    setIsSubmitting(true)

    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email: signupDataRef.current.email,
        token: code,
        type: 'email',
      })
      if (error) throw error
      if (!data.session) {
        setErrorMessage('Verification failed. Please try again.')
        return
      }

      // OTP verified — move to set-password step.
      setStep('setPassword')
      setOtp('')
    } catch (err) {
      setErrorMessage(mapSupabaseAuthError(err))
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSetPassword = async () => {
    if (!supabase || !signupDataRef.current) return

    if (!isStrongPassword(newPassword)) {
      setErrorMessage('Password must be at least 8 characters with 1 uppercase letter and 1 number.')
      return
    }
    if (newPassword !== confirmNewPassword) {
      setErrorMessage('Passwords do not match.')
      return
    }

    setErrorMessage(null)
    setIsSubmitting(true)

    try {
      // Set the password while the session is live.
      const { error } = await supabase.auth.updateUser({ password: newPassword })
      if (error) throw error

      const { data: sessionData } = await supabase.auth.getSession()
      const accessToken = sessionData.session?.access_token
      if (!accessToken) {
        setErrorMessage('Session expired. Please sign in.')
        return
      }

      const profile = await fetchUserProfileWithToken(accessToken)
      if (profile) {
        dispatch(setCredentials({ token: accessToken, user: profile }))
        navigate('/dashboard', { replace: true })
      } else {
        // Profile not yet provisioned — sign out the Supabase session so the
        // user doesn't land in a half-logged-in state. They can sign in once
        // provisioning completes.
        if (supabase) await supabase.auth.signOut()
        setSuccessMessage(
          'Account created! Your profile is being provisioned. Please try signing in shortly.'
        )
      }
    } catch (err) {
      setErrorMessage(mapSupabaseAuthError(err))
    } finally {
      setIsSubmitting(false)
    }
  }

  const backToForm = () => {
    setStep('form')
    setOtp('')
    setErrorMessage(null)
    setSuccessMessage(null)
    resendTimer.reset()
  }

  const backToOtp = () => {
    setStep('otp')
    setNewPassword('')
    setConfirmNewPassword('')
    setErrorMessage(null)
    setSuccessMessage(null)
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

      {/* Right Side - Signup Flow */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 bg-gradient-to-br from-background to-muted/20">
        <Card className="w-full max-w-md shadow-xl border bg-card/80 backdrop-blur-sm">
          <CardHeader className="space-y-1 text-center pb-8">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-primary/10 rounded-full">
                <Shield className="h-8 w-8 text-primary" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold">
              {step === 'form' ? 'Agent Sign Up' : step === 'otp' ? 'Verify Your Email' : 'Set Password'}
            </CardTitle>
            <p className="text-muted-foreground">
              {step === 'form' && 'Create your agent account'}
              {step === 'otp' && 'Enter the 6-digit code sent to your email'}
              {step === 'setPassword' && 'Choose a strong password for your account'}
            </p>
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

            {/* Step 1: Registration form */}
            {step === 'form' && (
              <Form {...form}>
                <form onSubmit={(e) => void form.handleSubmit(onSubmit)(e)} className="space-y-5">
                  <FormField
                    control={form.control}
                    name="full_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">Full Name</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="John Doe"
                            autoComplete="name"
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
                      <FormItem>
                        <FormLabel className="text-sm font-medium">Email</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            inputMode="email"
                            autoComplete="username"
                            placeholder="you@example.com"
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
                        <FormLabel className="text-sm font-medium">Phone</FormLabel>
                        <FormControl>
                          <Input
                            type="tel"
                            inputMode="tel"
                            autoComplete="tel"
                            placeholder="+91XXXXXXXXXX"
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
                          Sending code...
                        </>
                      ) : (
                        'Send Verification Code'
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            )}

            {/* Step 2: OTP verification */}
            {step === 'otp' && (
              <div className="space-y-5">
                <div>
                  <FormLabel className="text-sm font-medium">6-Digit Code</FormLabel>
                  <Input
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    placeholder="Enter the code"
                    className="h-11 text-center text-lg tracking-widest"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1 h-11"
                    onClick={backToForm}
                    disabled={isSubmitting}
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                  </Button>
                  <Button
                    type="button"
                    className="flex-1 h-11 text-base font-medium"
                    onClick={() => void handleOtpSubmit()}
                    disabled={isSubmitting || otp.length !== 6}
                  >
                    {isSubmitting ? (
                      <>
                        <LoadingSpinner size="sm" className="mr-2" />
                        Verifying...
                      </>
                    ) : (
                      'Verify Code'
                    )}
                  </Button>
                </div>

                <div className="text-center text-sm">
                  <button
                    type="button"
                    onClick={() => void handleResendOtp()}
                    disabled={isSubmitting || !resendTimer.canResend}
                    className="text-primary hover:underline disabled:no-underline disabled:opacity-50 disabled:text-muted-foreground"
                  >
                    {resendTimer.isActive ? `Resend code in ${resendTimer.secondsLeft}s` : 'Resend code'}
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Set password */}
            {step === 'setPassword' && (
              <div className="space-y-5">
                <div>
                  <FormLabel className="text-sm font-medium">Password</FormLabel>
                  <div className="relative">
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      placeholder="Create a password"
                      className="h-11 pr-12"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      onClick={() => setShowPassword((s) => !s)}
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <FormLabel className="text-sm font-medium">Confirm Password</FormLabel>
                  <div className="relative">
                    <Input
                      type={showConfirmPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      placeholder="Re-enter password"
                      className="h-11 pr-12"
                      value={confirmNewPassword}
                      onChange={(e) => setConfirmNewPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      onClick={() => setShowConfirmPassword((s) => !s)}
                    >
                      {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1 h-11"
                    onClick={backToOtp}
                    disabled={isSubmitting}
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                  </Button>
                  <Button
                    type="button"
                    className="flex-1 h-11 text-base font-medium"
                    onClick={() => void handleSetPassword()}
                    disabled={isSubmitting || !isStrongPassword(newPassword) || newPassword !== confirmNewPassword}
                  >
                    {isSubmitting ? (
                      <>
                        <LoadingSpinner size="sm" className="mr-2" />
                        Setting up...
                      </>
                    ) : (
                      'Create Account'
                    )}
                  </Button>
                </div>
              </div>
            )}

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
