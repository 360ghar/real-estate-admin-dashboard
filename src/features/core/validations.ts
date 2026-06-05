import { z } from 'zod'

// Bug report form validation schema
export const bugReportSchema = z.object({
  source: z.enum(['web', 'mobile', 'api']),
  bug_type: z.enum(['ui_bug', 'functionality_bug', 'performance_issue', 'crash', 'feature_request', 'other']),
  severity: z.enum(['low', 'medium', 'high', 'critical']),
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  steps_to_reproduce: z.string().optional(),
  expected_behavior: z.string().optional(),
  actual_behavior: z.string().optional(),
  device_info: z.object({
    os: z.string().optional(),
    version: z.string().optional(),
    model: z.string().optional(),
    browser: z.string().optional(),
    screen_resolution: z.string().optional(),
  }).optional(),
  app_version: z.string().optional(),
  tags: z.array(z.string()).optional(),
})

// Profile form validation schema (used in ProfilePage.tsx)
export const profileSchema = z.object({
  full_name: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
})

// Export inferred types
export type BugReportFormData = z.infer<typeof bugReportSchema>
export type ProfileFormValues = z.infer<typeof profileSchema>
