import type { AuthError } from '@supabase/supabase-js'

// Maps Supabase Auth error codes/messages to user-friendly text
export function mapSupabaseAuthError(error: unknown): string {
  const fallback = 'Something went wrong. Please try again.'
  if (!error) return fallback

  const err = error as Partial<AuthError> & { status?: number; code?: string; message?: string }
  const code = (err.code || '').toLowerCase()
  const message = (err.message || '').toLowerCase()
  const status = err.status

  // Common explicit codes from Supabase
  switch (code) {
    case 'invalid_credentials':
    case 'invalid_grant':
      return 'Invalid email or password.'
    case 'user_not_found':
      return 'No account found for this email.'
    case 'email_exists':
    case 'user_already_exists':
      return 'An account with this email already exists.'
    case 'over_email_send_rate_limit':
      return 'Too many requests. Please wait before trying again.'
    case 'otp_expired':
    case 'otp_disabled':
      return 'The verification code has expired or is invalid.'
    case 'weak_password':
      return 'Password is too weak. Try a longer password.'
    case 'validation_failed':
      return 'Validation failed. Please check your input.'
  }

  // Infer from HTTP status
  if (status === 400) return 'Invalid request. Please check your input.'
  if (status === 401) return 'Unauthorized. Please sign in again.'
  if (status === 403) return 'Action not allowed.'
  if (status === 404) return 'Requested resource was not found.'
  if (status === 429) return 'Too many attempts. Please try again later.'
  if (status && status >= 500) return 'Server error. Please try again later.'

  // Fallback heuristics based on message text
  if (message.includes('invalid login') || message.includes('invalid credentials')) {
    return 'Invalid email or password.'
  }
  if (message.includes('rate limit')) {
    return 'Too many requests. Please wait and try again.'
  }
  if (message.includes('password')) {
    return 'Password error. Please try a different password.'
  }
  if (message.includes('network')) {
    return 'Network error. Check your connection and try again.'
  }

  return err.message || fallback
}

