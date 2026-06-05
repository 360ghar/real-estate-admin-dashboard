import { z } from 'zod'

// User detail form validation schema (used in UserDetail.tsx)
export const userDetailSchema = z.object({
  full_name: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  is_active: z.boolean().optional(),
})

// User profile form validation schema (used in UserProfilePage.tsx)
export const userProfileSchema = z.object({
  full_name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  date_of_birth: z.string().optional(),
  bio: z.string().optional(),
})

// User preferences form validation schema (used in UserProfilePage.tsx)
export const userPreferencesSchema = z.object({
  property_type: z.array(z.string()).min(1, 'Select at least one property type'),
  purpose: z.enum(['buy', 'rent', 'short_stay']),
  budget_min: z.number().min(0),
  budget_max: z.number().min(0),
  bedrooms_min: z.number().min(0),
  bedrooms_max: z.number().min(0),
  area_min: z.number().min(0),
  area_max: z.number().min(0),
  location_preference: z.array(z.string()),
  max_distance_km: z.number().min(0),
})

// Export inferred types
export type UserDetailFormValues = z.infer<typeof userDetailSchema>
export type UserProfileFormValues = z.infer<typeof userProfileSchema>
export type UserPreferencesFormValues = z.infer<typeof userPreferencesSchema>
