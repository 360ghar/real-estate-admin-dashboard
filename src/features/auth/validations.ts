import { z } from 'zod'

// Login form validation schema
export const loginSchema = z.object({
  phone: z.string().min(8, 'Phone is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

// Signup form validation schema
export const signupSchema = z
  .object({
    full_name: z.string().min(2, 'Full name is required'),
    email: z.string().email('Please enter a valid email'),
    phone: z
      .string()
      .min(8, 'Phone number is required')
      .regex(/^[0-9+\-()\s]+$/, 'Enter a valid phone number'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirm_password: z.string().min(6, 'Please confirm your password'),
    terms_accepted: z.boolean().refine((val) => val === true, {
      message: 'You must accept the Terms & Conditions',
    }),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: 'Passwords do not match',
    path: ['confirm_password'],
  })

// Forgot password form validation schema
export const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email'),
})

// Reset password form validation schema
export const resetPasswordSchema = z
  .object({
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirm_password: z.string().min(6, 'Please confirm your password'),
  })
  .refine((d) => d.password === d.confirm_password, {
    message: 'Passwords do not match',
    path: ['confirm_password'],
  })

// Export inferred types
export type LoginFormValues = z.infer<typeof loginSchema>
export type SignupFormValues = z.infer<typeof signupSchema>
export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>
export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>
