/**
 * Shared CSV export utilities.
 *
 * `downloadCsv` moved here from `features/pm/utils.ts` so every feature can
 * reuse it without importing from the PM module. The PM module re-exports it
 * for backward compatibility.
 */

const escapeCsv = (v: unknown) => {
  const s = v === null || v === undefined ? '' : String(v)
  return `"${s.replaceAll('"', '""')}"`
}

export const downloadCsv = (filename: string, rows: Record<string, unknown>[]) => {
  if (!rows.length) {
    // Still emit a headerless file so the download triggers.
    const blob = new Blob([''], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
    return
  }
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

/** Build a timestamped filename, e.g. `properties_2026-06-18.csv`. */
export const csvFilename = (prefix: string) => `${prefix}_${new Date().toISOString().slice(0, 10)}.csv`
