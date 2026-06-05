/**
 * Locale-aware display formatting (India / INR defaults).
 *
 * Centralizes currency, number, percent, compact and date/relative-time
 * formatting so every screen renders values consistently. Parsing of server
 * timestamps is delegated to `dateTime.ts` (which normalizes naive UTC stamps).
 *
 * These helpers are display-only — never use them to build API payloads
 * (use the `localInputToServerTimestamp` / `formatDateOnlyForApi` helpers in
 * `dateTime.ts` for that).
 */
import { parseServerTimestamp } from '@/lib/dateTime'

const LOCALE = 'en-IN'
const DEFAULT_FALLBACK = '—'

const currencyFormatter = new Intl.NumberFormat(LOCALE, {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
})

const currencyFormatterPaise = new Intl.NumberFormat(LOCALE, {
  style: 'currency',
  currency: 'INR',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

const numberFormatter = new Intl.NumberFormat(LOCALE)

const compactFormatter = new Intl.NumberFormat(LOCALE, {
  notation: 'compact',
  maximumFractionDigits: 1,
})

const dateFormatter = new Intl.DateTimeFormat(LOCALE, {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
})

const dateTimeFormatter = new Intl.DateTimeFormat(LOCALE, {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
})

const relativeFormatter = new Intl.RelativeTimeFormat(LOCALE, { numeric: 'auto' })

const RELATIVE_DIVISIONS: { amount: number; unit: Intl.RelativeTimeFormatUnit }[] = [
  { amount: 60, unit: 'second' },
  { amount: 60, unit: 'minute' },
  { amount: 24, unit: 'hour' },
  { amount: 7, unit: 'day' },
  { amount: 4.34524, unit: 'week' },
  { amount: 12, unit: 'month' },
  { amount: Number.POSITIVE_INFINITY, unit: 'year' },
]

function toFiniteNumber(value: number | string | null | undefined): number | null {
  if (value === null || value === undefined || value === '') return null
  const n = typeof value === 'string' ? Number(value) : value
  return Number.isFinite(n) ? n : null
}

/** Format an amount as INR currency (e.g. `₹1,20,000`). Pass `fractionDigits: 2` for paise. */
export function formatCurrency(
  value: number | string | null | undefined,
  options?: { fractionDigits?: 0 | 2; fallback?: string },
): string {
  const n = toFiniteNumber(value)
  if (n === null) return options?.fallback ?? DEFAULT_FALLBACK
  return (options?.fractionDigits === 2 ? currencyFormatterPaise : currencyFormatter).format(n)
}

/** Group-separated integer/decimal (e.g. `1,20,000`). */
export function formatNumber(value: number | string | null | undefined, fallback = DEFAULT_FALLBACK): string {
  const n = toFiniteNumber(value)
  return n === null ? fallback : numberFormatter.format(n)
}

/** Compact notation for large counts (e.g. `1.2L`, `12K`). */
export function formatCompact(value: number | string | null | undefined, fallback = DEFAULT_FALLBACK): string {
  const n = toFiniteNumber(value)
  return n === null ? fallback : compactFormatter.format(n)
}

/**
 * Format a value that is already expressed as a percentage (0–100), e.g. an
 * occupancy rate of `87.5` → `87.5%`. Defaults to no decimals for integers.
 */
export function formatPercent(
  value: number | string | null | undefined,
  options?: { fractionDigits?: number; fallback?: string },
): string {
  const n = toFiniteNumber(value)
  if (n === null) return options?.fallback ?? DEFAULT_FALLBACK
  const digits = options?.fractionDigits ?? (Number.isInteger(n) ? 0 : 1)
  return `${n.toFixed(digits)}%`
}

/** Absolute date (e.g. `04 Jun 2026`). */
export function formatDate(value: string | Date | null | undefined, fallback = DEFAULT_FALLBACK): string {
  const date = parseServerTimestamp(value)
  return date ? dateFormatter.format(date) : fallback
}

/** Absolute date + time (e.g. `04 Jun 2026, 14:30`). */
export function formatDateTime(value: string | Date | null | undefined, fallback = DEFAULT_FALLBACK): string {
  const date = parseServerTimestamp(value)
  return date ? dateTimeFormatter.format(date) : fallback
}

/** Human relative time (e.g. `2 hours ago`, `in 3 days`). */
export function formatRelativeTime(value: string | Date | null | undefined, fallback = ''): string {
  const date = parseServerTimestamp(value)
  if (!date) return fallback
  let duration = (date.getTime() - Date.now()) / 1000
  for (const division of RELATIVE_DIVISIONS) {
    if (Math.abs(duration) < division.amount) {
      return relativeFormatter.format(Math.round(duration), division.unit)
    }
    duration /= division.amount
  }
  return fallback
}
