export const API_BASE_URL =
  (import.meta.env.VITE_API_BASE_URL as string | undefined) ??
  'http://localhost:3600/api/v1'

/**
 * Optional email-domain allowlist for Google sign-in into the admin/agent
 * portal. When non-empty, a Google sign-in whose email domain is not in this
 * list is signed out at the callback with a clear message (defence-in-depth on
 * top of the role guard, which already bounces non-staff). Leave empty to rely
 * solely on the role guard.
 */
export const ALLOWED_GOOGLE_EMAIL_DOMAINS: readonly string[] = ['360ghar.com']
