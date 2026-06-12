import type { AuthMethod } from '@/lib/auth'

const STORAGE_KEY = '360ghar:lastAuthMethod'

export interface LastAuthMethod {
  method: AuthMethod
  /** Masked identifier hint (never the full phone/email) shown on the login screen. */
  identifierHint: string
  /** Epoch milliseconds of the last successful auth with this method. */
  ts: number
}

const VALID_METHODS: ReadonlySet<string> = new Set<AuthMethod>([
  'google',
  'email_password',
  'phone_password',
  'phone_otp',
  'email_otp',
])

/**
 * Mask an identifier for display: keep a little context, hide the rest.
 * - phone "+919876543210" -> "+91••••3210"
 * - email "alice@360ghar.com" -> "a•••@360ghar.com"
 */
export function maskIdentifier(identifier: string): string {
  const value = identifier.trim()
  if (!value) return ''

  if (value.includes('@')) {
    const [local, domain] = value.split('@')
    const head = local.slice(0, 1)
    return `${head}${'•'.repeat(Math.max(local.length - 1, 1))}@${domain}`
  }

  // Phone-like: keep last 4 digits.
  const last4 = value.slice(-4)
  const prefix = value.startsWith('+') ? value.slice(0, 3) : ''
  return `${prefix}${'•'.repeat(4)}${last4}`
}

export function getLastAuthMethod(): LastAuthMethod | null {
  try {
    if (typeof localStorage === 'undefined') return null
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Partial<LastAuthMethod>
    if (!parsed?.method || !VALID_METHODS.has(parsed.method)) return null
    return {
      method: parsed.method,
      identifierHint: typeof parsed.identifierHint === 'string' ? parsed.identifierHint : '',
      ts: typeof parsed.ts === 'number' ? parsed.ts : 0,
    }
  } catch {
    return null
  }
}

export function setLastAuthMethod(method: AuthMethod, identifier?: string): void {
  try {
    if (typeof localStorage === 'undefined') return
    const payload: LastAuthMethod = {
      method,
      identifierHint: identifier ? maskIdentifier(identifier) : '',
      ts: Date.now(),
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
  } catch {
    // ignore storage failures (private mode / quota)
  }
}

export function clearLastAuthMethod(): void {
  try {
    if (typeof localStorage !== 'undefined') localStorage.removeItem(STORAGE_KEY)
  } catch {
    // ignore
  }
}
