import { describe, it, expect } from 'vitest'
import {
  formatCompact,
  formatCurrency,
  formatDate,
  formatNumber,
  formatPercent,
  formatRelativeTime,
} from '@/lib/format'

describe('format', () => {
  describe('formatCurrency', () => {
    it('formats INR with the rupee symbol and no fraction by default', () => {
      const result = formatCurrency(120000)
      expect(result).toContain('₹')
      expect(result).toContain('1,20,000')
    })

    it('returns the fallback for null/undefined/non-numeric input', () => {
      expect(formatCurrency(null)).toBe('—')
      expect(formatCurrency(undefined)).toBe('—')
      expect(formatCurrency('abc')).toBe('—')
      expect(formatCurrency(null, { fallback: 'N/A' })).toBe('N/A')
    })

    it('accepts numeric strings', () => {
      expect(formatCurrency('5000')).toContain('5,000')
    })
  })

  describe('formatNumber', () => {
    it('group-separates integers (en-IN)', () => {
      expect(formatNumber(1234567)).toBe('12,34,567')
    })
    it('falls back for invalid input', () => {
      expect(formatNumber(undefined)).toBe('—')
    })
  })

  describe('formatPercent', () => {
    it('treats the value as an already-computed percentage', () => {
      expect(formatPercent(87)).toBe('87%')
      expect(formatPercent(87.5)).toBe('87.5%')
    })
    it('falls back for invalid input', () => {
      expect(formatPercent(null)).toBe('—')
    })
  })

  describe('formatCompact', () => {
    it('compacts large numbers', () => {
      expect(formatCompact(1500)).toMatch(/1\.5\s?K/i)
    })
  })

  describe('formatDate', () => {
    it('formats a date and falls back on invalid input', () => {
      expect(formatDate('2026-06-04T10:00:00Z')).toContain('2026')
      expect(formatDate(null)).toBe('—')
      expect(formatDate('not-a-date')).toBe('—')
    })
  })

  describe('formatRelativeTime', () => {
    it('produces relative phrases for recent timestamps', () => {
      const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
      expect(formatRelativeTime(twoHoursAgo)).toMatch(/hour/i)
    })
    it('returns the fallback for empty input', () => {
      expect(formatRelativeTime(null)).toBe('')
      expect(formatRelativeTime(undefined, 'n/a')).toBe('n/a')
    })
  })
})
