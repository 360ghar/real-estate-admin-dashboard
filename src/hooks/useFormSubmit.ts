import { useCallback, useState } from 'react'
import { useToast } from '@/hooks/use-toast'
import { getErrorMessage } from '@/lib/errors'

type ToastConfig = {
  title: string
  description?: string
}

interface UseFormSubmitOptions<TValues, TResult> {
  submit: (values: TValues) => Promise<TResult>
  onSuccess?: (result: TResult) => void
  successToast?: ToastConfig
  errorToast?: { title?: string; description?: string }
}

export const useFormSubmit = <TValues, TResult>({
  submit,
  onSuccess,
  successToast,
  errorToast,
}: UseFormSubmitOptions<TValues, TResult>) => {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = useCallback(
    async (values: TValues) => {
      setIsSubmitting(true)
      try {
        const result = await submit(values)
        if (successToast) {
          toast({ title: successToast.title, description: successToast.description })
        }
        onSuccess?.(result)
        return result
      } catch (error: unknown) {
        const message = getErrorMessage(error, errorToast?.description || 'Please try again.')
        toast({
          title: errorToast?.title || 'Save failed',
          description: message,
          variant: 'destructive',
        })
        return undefined
      } finally {
        setIsSubmitting(false)
      }
    },
    [submit, onSuccess, successToast, errorToast, toast]
  )

  return { handleSubmit, isSubmitting }
}
