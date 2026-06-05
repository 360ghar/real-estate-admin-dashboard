import { z } from 'zod'

// Visit form validation schema (used in VisitForm.tsx)
export const visitFormSchema = z.object({
  // user_id kept for UI selection but not sent to API
  user_id: z.coerce.number().optional(),
  property_id: z.coerce.number().min(1, 'Property is required'),
  scheduled_date: z.string().min(1, 'Date is required'),
})

// Schedule visit form validation schema (used in VisitManagementPage.tsx)
export const scheduleVisitSchema = z.object({
  property_id: z.number().min(1, 'Property is required'),
  scheduled_date: z.string().min(1, 'Date and time are required'),
  special_requirements: z.string().optional(),
})

// Complete visit form validation schema (used in VisitManagementPage.tsx)
export const completeVisitSchema = z.object({
  notes: z.string().min(1, 'Notes are required'),
  feedback: z.string().optional(),
})

// Export inferred types
export type VisitFormValues = z.infer<typeof visitFormSchema>
export type ScheduleVisitFormValues = z.infer<typeof scheduleVisitSchema>
export type CompleteVisitFormValues = z.infer<typeof completeVisitSchema>
