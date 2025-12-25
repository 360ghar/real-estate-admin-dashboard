 /**
  * API Error types and utilities for consistent error handling
  */
 
 export interface ApiErrorResponse {
   detail?: string
   message?: string
   errors?: Record<string, string[]>
   status?: number
 }
 
 export interface ApiError {
   status: number
   data?: ApiErrorResponse
   message: string
 }
 
 /**
  * Type guard to check if an error is an RTK Query error
  */
 export function isApiError(error: unknown): error is { status: number; data?: ApiErrorResponse } {
   return (
     typeof error === 'object' &&
     error !== null &&
     'status' in error &&
     typeof (error as { status: unknown }).status === 'number'
   )
 }
 
 /**
  * Extract a user-friendly error message from an API error
  */
 export function getErrorMessage(error: unknown, fallback = 'An unexpected error occurred'): string {
   if (isApiError(error)) {
     if (error.data?.detail) return error.data.detail
     if (error.data?.message) return error.data.message
     if (error.status === 401) return 'Please log in to continue'
     if (error.status === 403) return 'You do not have permission to perform this action'
     if (error.status === 404) return 'The requested resource was not found'
     if (error.status === 500) return 'Server error. Please try again later'
   }
   
   if (error instanceof Error) {
     return error.message
   }
   
   if (typeof error === 'string') {
     return error
   }
   
   return fallback
 }
 
 /**
  * Parse validation errors from API response
  */
 export function getValidationErrors(error: unknown): Record<string, string> | null {
   if (isApiError(error) && error.data?.errors) {
     const result: Record<string, string> = {}
     for (const [field, messages] of Object.entries(error.data.errors)) {
       result[field] = Array.isArray(messages) ? messages[0] : String(messages)
     }
     return result
   }
   return null
 }
