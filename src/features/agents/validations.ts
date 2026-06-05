import { z } from 'zod'

const toBool = (v: unknown) => (v === 'true' ? true : v === 'false' ? false : v)

// Agent form validation schema
export const agentFormSchema = z.object({
  name: z.string().min(2),
  contact_number: z.string().optional(),
  description: z.string().optional(),
  languages: z.string().optional(),
  agent_type: z.enum(['general', 'specialist', 'senior']),
  experience_level: z.enum(['beginner', 'intermediate', 'expert']),
  is_active: z.preprocess(toBool, z.boolean().optional()),
  is_available: z.preprocess(toBool, z.boolean().optional()),
})

// Export inferred types
export type AgentFormValues = z.infer<typeof agentFormSchema>
