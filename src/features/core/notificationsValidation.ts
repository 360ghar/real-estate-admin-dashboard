import { z } from 'zod'

export const NOTIFICATION_CHANNELS = ['broadcast', 'segment', 'topic'] as const
export type NotificationChannel = (typeof NOTIFICATION_CHANNELS)[number]

export const SEGMENT_ROLES = ['all', 'user', 'agent', 'admin'] as const
export type SegmentRole = (typeof SEGMENT_ROLES)[number]

export const MARKETING_TYPES = [
  { value: 'promotion_generic', label: 'Promotion (generic)' },
  { value: 'discount_offer', label: 'Discount offer' },
  { value: 'win_back', label: 'Win-back' },
  { value: 'upsell_suggestion', label: 'Upsell suggestion' },
  { value: 'onboarding_nudge', label: 'Onboarding nudge' },
  { value: 'property_recommendation', label: 'Property recommendation' },
  { value: 'daily_digest', label: 'Daily digest' },
] as const

export const notificationComposerSchema = z
  .object({
    channel: z.enum(NOTIFICATION_CHANNELS),
    typeKey: z.string().min(1, 'Select a notification type'),
    title: z.string().trim().min(1, 'Title is required').max(120, 'Keep the title under 120 characters'),
    body: z.string().trim().min(1, 'Message is required').max(1000, 'Keep the message under 1000 characters'),
    deepLink: z.string().trim().max(500).optional().or(z.literal('')),
    role: z.enum(SEGMENT_ROLES).optional(),
    agentId: z.string().optional(),
    topic: z.string().trim().optional(),
  })
  .superRefine((value, ctx) => {
    if (value.channel === 'topic' && !value.topic) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['topic'], message: 'Topic is required' })
    }
  })

export type NotificationComposerValues = z.infer<typeof notificationComposerSchema>

export const notificationComposerDefaults: NotificationComposerValues = {
  channel: 'broadcast',
  typeKey: 'promotion_generic',
  title: '',
  body: '',
  deepLink: '',
  role: 'all',
  agentId: 'all',
  topic: '',
}
