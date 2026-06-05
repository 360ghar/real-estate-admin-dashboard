import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ShieldCheck } from 'lucide-react'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

import { supabase } from '@/lib/supabase'
import { mapSupabaseAuthError } from '@/lib/authErrors'
import { resetPasswordSchema, type ResetPasswordFormValues } from '@/features/auth/validations'

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { LoadingState } from '@/components/ui/loading-state'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'

export default function ResetPasswordPage() {
  const navigate = useNavigate()
  const [isReady, setIsReady] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const form = useForm<ResetPasswordFormValues>({ resolver: zodResolver(resetPasswordSchema) })

  useEffect(() => {
    if (!supabase) return

    const client = supabase

    const init = async () => {
      try {
        // If redirected from email link, session may already be present.
        const { data: sessionRes } = await client.auth.getSession()
        if (sessionRes.session) {
          setIsReady(true)
          return
        }

        // Fallback: set session from URL hash (access_token & refresh_token)
        const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''))
        const access_token = hashParams.get('access_token') || ''
        const refresh_token = hashParams.get('refresh_token') || ''
        if (access_token && refresh_token) {
          const { error } = await client.auth.setSession({ access_token, refresh_token })
          if (error) throw error
          setIsReady(true)
          return
        }

        // OAuth-style code flow fallback
        const urlParams = new URLSearchParams(window.location.search)
        const code = urlParams.get('code')
        if (code) {
          const { error } = await client.auth.exchangeCodeForSession(code)
          if (error) throw error
          setIsReady(true)
          return
        }

        // If we reach here, we don't have a valid recovery context
        setErrorMessage('Invalid or expired password reset link.')
      } catch (err) {
        setErrorMessage(mapSupabaseAuthError(err))
      }
    }

    void init()
  }, [])

  const onSubmit = async (values: ResetPasswordFormValues) => {
    if (!supabase) return
    setErrorMessage(null)
    setSuccessMessage(null)
    setIsSubmitting(true)
    try {
      const { error } = await supabase.auth.updateUser({ password: values.password })
      if (error) throw error
      setSuccessMessage('Your password has been updated. You can now sign in.')
      setTimeout(() => navigate('/login', { replace: true }), 1200)
    } catch (err) {
      setErrorMessage(mapSupabaseAuthError(err))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background to-muted/20">
      <Card className="w-full max-w-md shadow-xl border bg-card/80 backdrop-blur-sm">
        <CardHeader className="space-y-1 text-center pb-6">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-primary/10 rounded-full">
              <ShieldCheck className="h-8 w-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">Reset Password</CardTitle>
          <p className="text-muted-foreground">Enter your new password</p>
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

          {!isReady ? (
            <div className="flex items-center justify-center py-6 text-muted-foreground">
              <LoadingState type="spinner" text="Preparing reset form..." />
            </div>
          ) : (
            <Form {...form}>
              <form onSubmit={(e) => void form.handleSubmit(onSubmit)(e)} className="space-y-5">
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">New Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="Enter new password" className="h-11" {...field} />
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
                        <Input type="password" placeholder="Re-enter new password" className="h-11" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="pt-2">
                  <Button type="submit" className="w-full h-11 text-base font-medium" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <LoadingSpinner size="sm" className="mr-2" />
                        Updating password...
                      </>
                    ) : (
                      'Update Password'
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          )}

          <div className="text-center pt-2 text-sm text-muted-foreground">
            <Link to="/login" className="text-primary hover:underline">
              Back to login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

