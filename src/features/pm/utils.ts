import type { User } from '@/types'

export const formatINR = (value: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value)

export const getOwnerLabel = (u: Pick<User, 'full_name' | 'phone' | 'email'>) =>
  (u.full_name || u.phone || u.email || 'Unnamed owner').trim()

export const getKycStatus = (u: User): string => {
  const prefs = u.preferences as unknown as Record<string, unknown> | undefined
  const raw = prefs?.pm_kyc_status ?? prefs?.kyc_status
  return typeof raw === 'string' && raw.trim() ? raw : 'unknown'
}

const escapeCsv = (v: unknown) => {
  const s = v === null || v === undefined ? '' : String(v)
  return `"${s.replaceAll('"', '""')}"`
}

export const downloadCsv = (filename: string, rows: Record<string, unknown>[]) => {
  const headers = Array.from(new Set(rows.flatMap((r) => Object.keys(r))))
  const csv = [headers.join(','), ...rows.map((r) => headers.map((h) => escapeCsv(r[h])).join(','))].join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
