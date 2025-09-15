import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, ShieldCheck } from 'lucide-react'

import { supabase } from '@/lib/supabase'
import { mapSupabaseAuthError } from '@/lib/authErrors'

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'

const schema = z
  .object({
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirm_password: z.string().min(6, 'Please confirm your password'),
  })
  .refine((d) => d.password === d.confirm_password, {
    message: 'Passwords do not match',
    path: ['confirm_password'],
  })

type FormValues = z.infer<typeof schema>

export default function ResetPasswordPage() {
  const navigate = useNavigate()
  const [isReady, setIsReady] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const form = useForm<FormValues>({ resolver: zodResolver(schema) })

  useEffect(() => {
    if (!supabase) return

    const init = async () => {
      try {
        // If redirected from email link, session may already be present.
        const { data: sessionRes } = await supabase.auth.getSession()
        if (sessionRes.session) {
          setIsReady(true)
          return
        }

        // Fallback: set session from URL hash (access_token & refresh_token)
        const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''))
        const access_token = hashParams.get('access_token') || ''
        const refresh_token = hashParams.get('refresh_token') || ''
        if (access_token && refresh_token) {
          const { error } = await supabase.auth.setSession({ access_token, refresh_token })
          if (error) throw error
          setIsReady(true)
          return
        }

        // OAuth-style code flow fallback
        const urlParams = new URLSearchParams(window.location.search)
        const code = urlParams.get('code')
        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code)
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

  const onSubmit = async (values: FormValues) => {
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
              <Loader2 className="h-5 w-5 mr-2 animate-spin" /> Preparing reset form...
            </div>
          ) : (
            <Form {...(form as any)}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
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
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
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

