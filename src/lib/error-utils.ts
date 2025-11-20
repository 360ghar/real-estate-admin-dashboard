import { FetchBaseQueryError } from '@reduxjs/toolkit/query'
import { SerializedError } from '@reduxjs/toolkit'

interface ValidationError {
  loc: (string | number)[]
  msg: string
  type: string
}

interface HTTPValidationError {
  detail: ValidationError[] | string
}

export function getErrorMessage(error: FetchBaseQueryError | SerializedError | undefined): string {
  if (!error) return 'An unknown error occurred'

  if ('status' in error) {
    // FetchBaseQueryError
    const data = error.data as HTTPValidationError | { detail?: string } | undefined

    if (data && typeof data === 'object') {
      if (Array.isArray(data.detail)) {
        // Handle validation errors array
        return data.detail.map(e => `${e.loc.join('.')}: ${e.msg}`).join(', ')
      }
      if (typeof data.detail === 'string') {
        return data.detail
      }
    }

    return 'Server error'
  } else {
    // SerializedError
    return error.message || 'An unexpected error occurred'
  }
}
