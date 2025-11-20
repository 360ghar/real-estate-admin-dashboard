import { api } from '@/store/api'
import type { MessageResponse, PropertySearchParams, SwipeHistoryResponse } from '@/types'

// UI-facing swipe request (used by SwipePage)
export interface SwipeRequest {
  property_id: number
  action: 'like' | 'dislike'
}

// Backend swipe payload as per OpenAPI (PropertySwipe)
export interface PropertySwipePayload {
  property_id: number
  is_liked: boolean
}

// Extend generic message response with optional match flag for future use
export type SwipeResponse = MessageResponse & { match?: boolean }

export interface SwipeHistoryQuery extends PropertySearchParams {
  is_liked?: boolean
}

export const swipesApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // Record a property swipe (like/dislike)
    swipeProperty: builder.mutation<SwipeResponse, SwipeRequest>({
      query: ({ property_id, action }): { url: string; method: 'POST'; body: PropertySwipePayload } => ({
        url: '/swipes/',
        method: 'POST',
        body: {
          property_id,
          is_liked: action === 'like',
        },
      }),
      invalidatesTags: ['Property', 'Swipe'],
    }),

    // Get user's swipe history with filtering and property details
    getSwipeHistory: builder.query<SwipeHistoryResponse, SwipeHistoryQuery | void>({
      query: (params) => ({
        url: '/swipes/',
        params: params as Record<string, any> | undefined,
      }),
    }),

    // Undo the last swipe for the current user
    undoLastSwipe: builder.mutation<MessageResponse, void>({
      query: () => ({
        url: '/swipes/undo/',
        method: 'DELETE',
      }),
      invalidatesTags: ['Property', 'Swipe'],
    }),

    // Toggle like status for a specific swipe
    toggleSwipeLike: builder.mutation<MessageResponse, number>({
      query: (swipeId) => ({
        url: `/swipes/${swipeId}/toggle/`,
        method: 'PUT',
      }),
      invalidatesTags: ['Property', 'Swipe'],
    }),

    // Basic swipe statistics for the current user
    getSwipeStats: builder.query<Record<string, any>, void>({
      query: () => '/swipes/stats/',
    }),
  }),
})

export const {
  useSwipePropertyMutation,
  useGetSwipeHistoryQuery,
  useUndoLastSwipeMutation,
  useToggleSwipeLikeMutation,
  useGetSwipeStatsQuery,
} = swipesApi
