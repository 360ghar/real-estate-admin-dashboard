import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useLoginMutation } from '@/store/api'
import { useAppDispatch } from '@/hooks/redux'
import { setCredentials, setError, setLoading } from '@/features/auth/slices/authSlice'
import { useNavigate, Link } from 'react-router-dom'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Shield, Eye, EyeOff, Building2 } from 'lucide-react'
import { useState } from 'react'

const schema = z.object({
  phone: z.string().min(8, 'Phone is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

type FormValues = z.infer<typeof schema>

const LoginPage = () => {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const [login, { isLoading }] = useLoginMutation()
  const [showPassword, setShowPassword] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const form = useForm<FormValues>({ resolver: zodResolver(schema) })

  const onSubmit = async (values: FormValues) => {
    dispatch(setLoading(true))
    setErrorMessage(null)
    try {
      const res = await login(values).unwrap()
      dispatch(setCredentials({ token: res.access_token, user: res.user }))
      navigate('/dashboard', { replace: true })
    } catch (err: any) {
      const error = err?.data?.detail || 'Login failed. Please check your credentials.'
      dispatch(setError(error))
      setErrorMessage(error)
    } finally {
      dispatch(setLoading(false))
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
          <h1 className="text-4xl font-bold mb-4">360Ghar</h1>
          <p className="text-xl mb-8 opacity-90">Real Estate Management Platform</p>
          <div className="space-y-4 text-sm opacity-75">
            <p>✓ Comprehensive property management</p>
            <p>✓ Advanced analytics & reporting</p>
            <p>✓ Seamless agent coordination</p>
            <p>✓ Real-time booking system</p>
          </div>
        </div>
        <div className="absolute bottom-8 left-8">
          <Shield className="h-8 w-8 opacity-50" />
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 bg-gradient-to-br from-background to-muted/20">
        <Card className="w-full max-w-md shadow-xl border bg-card/80 backdrop-blur-sm">
          <CardHeader className="space-y-1 text-center pb-8">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-primary/10 rounded-full">
                <Shield className="h-8 w-8 text-primary" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
            <p className="text-muted-foreground">
              Sign in to your admin dashboard
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            {errorMessage && (
              <Alert variant="destructive">
                <AlertDescription>{errorMessage}</AlertDescription>
              </Alert>
            )}

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">Phone Number</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type="tel"
                            placeholder="+91XXXXXXXXXX"
                            className="h-11 pl-4 pr-4 text-base"
                            {...field}
                          />
                        </div>
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
                            type={showPassword ? "text" : "password"}
                            placeholder="Enter your password"
                            className="h-11 pl-4 pr-12 text-base"
                            {...field}
                          />
                          <button
                            type="button"
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? (
                              <EyeOff className="h-5 w-5" />
                            ) : (
                              <Eye className="h-5 w-5" />
                            )}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="pt-2">
                  <Button
                    type="submit"
                    className="w-full h-11 text-base font-medium"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Signing in...
                      </>
                    ) : (
                      'Sign In'
                    )}
                  </Button>
                </div>
              </form>
            </Form>

            <div className="pt-2 flex items-center justify-between text-sm">
              <Link to="/forgot-password" className="text-primary hover:underline">Forgot password?</Link>
              <Link to="/signup" className="text-primary hover:underline">New agent? Sign up</Link>
            </div>

            <div className="text-center pt-4">
              <p className="text-sm text-muted-foreground">Secure access to 360Ghar Admin Portal</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default LoginPage
