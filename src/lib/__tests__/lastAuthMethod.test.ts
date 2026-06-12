import { describe, it, expect, beforeEach } from 'vitest'
import {
  maskIdentifier,
  getLastAuthMethod,
  setLastAuthMethod,
  clearLastAuthMethod,
} from '@/lib/lastAuthMethod'
import { isAllowedGoogleEmail } from '@/lib/auth'

describe('lastAuthMethod', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  describe('maskIdentifier', () => {
    it('masks an email keeping the first char and domain', () => {
      expect(maskIdentifier('alice@360ghar.com')).toBe('a••••@360ghar.com')
    })

    it('masks a phone keeping the country prefix and last 4', () => {
      expect(maskIdentifier('+919876543210')).toBe('+91••••3210')
    })

    it('returns empty string for blank input', () => {
      expect(maskIdentifier('   ')).toBe('')
    })
  })

  describe('get/set/clear round-trip', () => {
    it('persists and reads back a masked entry', () => {
      setLastAuthMethod('phone_otp', '+919876543210')
      const stored = getLastAuthMethod()
      expect(stored?.method).toBe('phone_otp')
      expect(stored?.identifierHint).toBe('+91••••3210')
      expect(typeof stored?.ts).toBe('number')
    })

    it('returns null when nothing is stored', () => {
      expect(getLastAuthMethod()).toBeNull()
    })

    it('ignores corrupt/invalid stored values', () => {
      localStorage.setItem('360ghar:lastAuthMethod', JSON.stringify({ method: 'bogus' }))
      expect(getLastAuthMethod()).toBeNull()
    })

    it('clears the stored entry', () => {
      setLastAuthMethod('google', 'a@360ghar.com')
      clearLastAuthMethod()
      expect(getLastAuthMethod()).toBeNull()
    })
  })
})

describe('isAllowedGoogleEmail', () => {
  it('allows the configured 360ghar.com domain (case-insensitive)', () => {
    expect(isAllowedGoogleEmail('staff@360ghar.com')).toBe(true)
    expect(isAllowedGoogleEmail('Staff@360GHAR.com')).toBe(true)
  })

  it('rejects other domains', () => {
    expect(isAllowedGoogleEmail('someone@gmail.com')).toBe(false)
  })

  it('rejects empty/missing email', () => {
    expect(isAllowedGoogleEmail(null)).toBe(false)
    expect(isAllowedGoogleEmail('')).toBe(false)
  })
})
