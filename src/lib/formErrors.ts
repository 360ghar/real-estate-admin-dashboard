/**
 * Map server / RTK Query errors onto react-hook-form fields.
 *
 * The FastAPI backend returns validation errors as
 *   422 → { detail: [{ loc: ["body", "field", ...], msg, type }] }
 * and other failures as
 *   400/4xx → { detail: "message" }  (or a network error with no body).
 *
 * `applyServerValidation` turns the former into per-field `setError` calls and
 * routes anything it can't map (plus generic failures) to the form `root`
 * error, which `<FormRootError>` renders at the top of the form.
 */
import type { FieldValues, Path, UseFormSetError } from 'react-hook-form'
import { getErrorMessage, isApiError } from '@/lib/errors'

interface FastApiValidationItem {
  loc?: (string | number)[]
  msg?: string
  type?: string
}

const LOC_PREFIXES = new Set(['body', 'query', 'path', 'header', 'cookie'])

function capitalize(value: string): string {
  return value.length ? value.charAt(0).toUpperCase() + value.slice(1) : value
}

/** Pull `{ field: message }` pairs out of a FastAPI/RTK Query error, if any. */
export function extractFieldErrors(error: unknown): Record<string, string> {
  const result: Record<string, string> = {}
  if (!isApiError(error) || !error.data) return result

  const detail = (error.data as { detail?: unknown }).detail
  if (Array.isArray(detail)) {
    for (const item of detail as FastApiValidationItem[]) {
      if (!item || !Array.isArray(item.loc) || !item.msg) continue
      const segments = item.loc
        .filter((part, index) => !(index === 0 && typeof part === 'string' && LOC_PREFIXES.has(part)))
        .map((part) => String(part))
      const field = segments.join('.')
      if (field && !(field in result)) {
        result[field] = capitalize(item.msg)
      }
    }
  }

  // Alternative shape used by some endpoints: { errors: { field: [msg] } }.
  const errors = (error.data as { errors?: Record<string, string[] | string> }).errors
  if (errors && typeof errors === 'object') {
    for (const [field, messages] of Object.entries(errors)) {
      if (field in result) continue
      result[field] = Array.isArray(messages) ? String(messages[0]) : String(messages)
    }
  }

  return result
}

interface ApplyServerValidationOptions {
  /**
   * If provided, only these field names are set as inline field errors; any
   * server field outside the list is folded into the root error instead. Use
   * it to avoid setting errors on fields the form doesn't render.
   */
  knownFields?: readonly string[]
  /** Fallback root message when nothing maps to a field. */
  fallback?: string
}

/**
 * Apply a server error to a form. Returns `true` if at least one field-level
 * error was set (useful to decide whether to also surface a toast).
 *
 * Call `form.clearErrors()` at the start of your submit handler so stale
 * server errors don't linger across attempts.
 */
export function applyServerValidation<TFieldValues extends FieldValues>(
  error: unknown,
  setError: UseFormSetError<TFieldValues>,
  options?: ApplyServerValidationOptions,
): boolean {
  const fieldErrors = extractFieldErrors(error)
  const unmapped: string[] = []
  let appliedField = false

  for (const [field, message] of Object.entries(fieldErrors)) {
    if (options?.knownFields && !options.knownFields.includes(field)) {
      unmapped.push(message)
      continue
    }
    setError(field as Path<TFieldValues>, { type: 'server', message })
    appliedField = true
  }

  let rootMessage: string | undefined
  if (unmapped.length > 0) {
    rootMessage = unmapped.join(' ')
  } else if (!appliedField) {
    rootMessage = getErrorMessage(error, options?.fallback ?? 'Something went wrong. Please try again.')
  }

  if (rootMessage) {
    setError('root', { type: 'server', message: rootMessage })
  }

  return appliedField
}
