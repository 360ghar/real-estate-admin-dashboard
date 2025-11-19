import { useEffect } from 'react'
import { useToast } from '@/hooks/use-toast'
import { AlertCircle } from 'lucide-react'

interface ApiErrorHandlerProps {
  error?: {
    status?: number
    data?: {
      detail?: string
      message?: string
      [key: string]: any
    }
    message?: string
  }
  showToast?: boolean
  children?: React.ReactNode
}

export function ApiErrorHandler({ error, showToast = true, children }: ApiErrorHandlerProps) {
  const { toast } = useToast()

  useEffect(() => {
    if (error && showToast) {
      let title = 'Error'
      let description = 'An unexpected error occurred'

      if (error.status) {
        switch (error.status) {
          case 400:
            title = 'Validation Error'
            description = error.data?.detail || 'Please check your input and try again'
            break
          case 401:
            title = 'Unauthorized'
            description = 'Please log in to continue'
            break
          case 403:
            title = 'Access Denied'
            description = "You don't have permission to perform this action"
            break
          case 404:
            title = 'Not Found'
            description = 'The requested resource was not found'
            break
          case 422:
            title = 'Validation Error'
            description = typeof error.data?.detail === 'string'
              ? error.data.detail
              : 'Please check your input and try again'
            break
          case 500:
            title = 'Server Error'
            description = 'Something went wrong on our end. Please try again later'
            break
          case 502:
          case 503:
          case 504:
            title = 'Service Unavailable'
            description = 'The service is temporarily unavailable. Please try again later'
            break
          default:
            description = error.data?.detail || error.message || 'An unexpected error occurred'
        }
      } else if (error.message) {
        description = error.message
      }

      toast({
        title,
        description,
        variant: 'destructive'
      })
    }
  }, [error, showToast, toast])

  if (!error) {
    return <>{children}</>
  }

  if (!showToast) {
    return (
      <div className="p-4 border border-red-200 rounded-lg bg-red-50">
        <div className="flex items-center gap-2 text-red-800">
          <AlertCircle className="h-5 w-5" />
          <span className="font-medium">
            {error.status === 400 || error.status === 422 ? 'Validation Error' : 'Error'}
          </span>
        </div>
        <p className="mt-2 text-sm text-red-700">
          {error.data?.detail || error.data?.message || error.message || 'An error occurred'}
        </p>
      </div>
    )
  }

  return <>{children}</>
}

export default ApiErrorHandler