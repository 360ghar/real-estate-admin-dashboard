import { api } from '@/store/api'

export interface UserNotificationLogEntry {
  id: string
  title: string
  body: string
  data?: Record<string, any>
  audience_type?: string
  target_user_id?: string
  topic?: string
  created_at?: string
}

export interface MarketingNotificationPayload {
  typeKey: string
  title: string
  body: string
  data?: Record<string, string>
  deep_link?: string
}

export interface MarketingSegmentFilter {
  role?: 'user' | 'agent' | 'admin'
  agent_id?: number
  is_active?: boolean
}

export interface MarketingSegmentRequest extends MarketingNotificationPayload {
  filter: MarketingSegmentFilter
}

export const notificationsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getUserNotifications: builder.query<UserNotificationLogEntry[], number>({
      query: (userId) => `/notifications/users/${userId}/`,
    }),

    sendMarketingBroadcast: builder.mutation<
      { requested: number; processed: number },
      MarketingNotificationPayload
    >({
      query: ({ typeKey, title, body, data, deep_link }) => ({
        url: '/notifications/marketing/broadcast',
        method: 'POST',
        body: {
          type_key: typeKey,
          title,
          body,
          data,
          deep_link,
        },
      }),
    }),

    sendMarketingToSegment: builder.mutation<
      { requested: number; processed: number },
      MarketingSegmentRequest
    >({
      query: ({ typeKey, title, body, data, deep_link, filter }) => ({
        url: '/notifications/marketing/segment',
        method: 'POST',
        body: {
          type_key: typeKey,
          title,
          body,
          data,
          deep_link,
          filter,
        },
      }),
    }),
  }),
})

export const {
  useGetUserNotificationsQuery,
  useSendMarketingBroadcastMutation,
  useSendMarketingToSegmentMutation,
} = notificationsApi

