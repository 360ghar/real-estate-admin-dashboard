import type { FieldValues, UseFormReturn } from 'react-hook-form'
import { AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface FormRootErrorProps<TFieldValues extends FieldValues> {
  form: UseFormReturn<TFieldValues>
  className?: string
}

/**
 * Renders the react-hook-form `root` error (set by `applyServerValidation`)
 * as an inline alert at the top of a form. Returns nothing when there is no
 * root error.
 */
export function FormRootError<TFieldValues extends FieldValues>({
  form,
  className,
}: FormRootErrorProps<TFieldValues>) {
  const message = form.formState.errors.root?.message
  if (!message) return null
  return (
    <div
      role="alert"
      className={cn(
        'flex items-start gap-2 rounded-cohere-sm border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive',
        className,
      )}
    >
      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
      <span>{String(message)}</span>
    </div>
  )
}
