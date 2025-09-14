import { api } from './api'

export interface PropertyReview {
  id: number
  property_id: number
  user_id: number
  booking_id?: number
  rating: number
  title: string
  comment: string
  aspects?: {
    cleanliness?: number
    accuracy?: number
    communication?: number
    location?: number
    check_in?: number
    value?: number
  }
  tags?: string[]
  is_verified: boolean
  is_public: boolean
  created_at: string
  updated_at: string
  user: {
    id: number
    first_name: string
    last_name: string
    avatar_url?: string
  }
}

export interface ReviewReply {
  id: number
  review_id: number
  user_id: number
  comment: string
  created_at: string
  updated_at: string
  user: {
    id: number
    first_name: string
    last_name: string
    avatar_url?: string
  }
}

export interface ReviewStats {
  average_rating: number
  total_reviews: number
  rating_distribution: {
    5: number
    4: number
    3: number
    2: number
    1: number
  }
  aspect_averages?: {
    cleanliness?: number
    accuracy?: number
    communication?: number
    location?: number
    check_in?: number
    value?: number
  }
}

export const reviewsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // Property Reviews
    getPropertyReviews: builder.query<{
      results: PropertyReview[]
      count: number
    }, {
      propertyId: number
      page?: number
      page_size?: number
      rating?: number
      sort_by?: 'created_at' | 'rating' | 'helpful'
      sort_order?: 'asc' | 'desc'
    }>({
      query: ({ propertyId, ...params }) => ({
        url: `/properties/${propertyId}/reviews/`,
        params
      }),
      providesTags: (result, error, { propertyId }) => [
        { type: 'Review', id: `PROPERTY_${propertyId}` }
      ]
    }),

    createReview: builder.mutation<PropertyReview, {
      propertyId: number
      bookingId?: number
      rating: number
      title: string
      comment: string
      aspects?: PropertyReview['aspects']
      tags?: string[]
      is_public?: boolean
    }>({
      query: ({ propertyId, ...data }) => ({
        url: `/properties/${propertyId}/reviews/`,
        method: 'POST',
        body: data
      }),
      invalidatesTags: (result, error, { propertyId }) => [
        { type: 'Review', id: `PROPERTY_${propertyId}` },
        { type: 'Property', id: propertyId }
      ]
    }),

    updateReview: builder.mutation<PropertyReview, {
      reviewId: number
      rating?: number
      title?: string
      comment?: string
      aspects?: PropertyReview['aspects']
      tags?: string[]
      is_public?: boolean
    }>({
      query: ({ reviewId, ...data }) => ({
        url: `/reviews/${reviewId}/`,
        method: 'PATCH',
        body: data
      }),
      invalidatesTags: (result, error, { reviewId }) => [
        { type: 'Review', id: `REVIEW_${reviewId}` }
      ]
    }),

    deleteReview: builder.mutation<void, number>({
      query: (reviewId) => ({
        url: `/reviews/${reviewId}/`,
        method: 'DELETE'
      }),
      invalidatesTags: (result, error, reviewId) => [
        { type: 'Review', id: `REVIEW_${reviewId}` }
      ]
    }),

    // Review Replies
    getReviewReplies: builder.query<ReviewReply[], number>({
      query: (reviewId) => `/reviews/${reviewId}/replies/`,
      providesTags: (result, error, reviewId) => [
        { type: 'ReviewReply', id: `REVIEW_${reviewId}` }
      ]
    }),

    createReviewReply: builder.mutation<ReviewReply, {
      reviewId: number
      comment: string
    }>({
      query: ({ reviewId, ...data }) => ({
        url: `/reviews/${reviewId}/replies/`,
        method: 'POST',
        body: data
      }),
      invalidatesTags: (result, error, { reviewId }) => [
        { type: 'ReviewReply', id: `REVIEW_${reviewId}` },
        { type: 'Review', id: `REVIEW_${reviewId}` }
      ]
    }),

    // Review Stats
    getPropertyReviewStats: builder.query<ReviewStats, number>({
      query: (propertyId) => `/properties/${propertyId}/reviews/stats/`,
      providesTags: (result, error, propertyId) => [
        { type: 'ReviewStats', id: propertyId }
      ]
    }),

    // Admin endpoints
    getAllReviews: builder.query<{
      results: PropertyReview[]
      count: number
    }, {
      page?: number
      page_size?: number
      property_id?: number
      user_id?: number
      rating?: number
      is_verified?: boolean
      is_public?: boolean
      date_from?: string
      date_to?: string
      search?: string
    }>({
      query: (params) => ({
        url: '/reviews/',
        params
      }),
      providesTags: ['Review']
    }),

    moderateReview: builder.mutation<PropertyReview, {
      reviewId: number
      is_verified?: boolean
      is_public?: boolean
    }>({
      query: ({ reviewId, ...data }) => ({
        url: `/reviews/${reviewId}/moderate/`,
        method: 'POST',
        body: data
      }),
      invalidatesTags: (result, error, { reviewId }) => [
        { type: 'Review', id: `REVIEW_${reviewId}` }
      ]
    }),

    // Helpful votes
    markReviewHelpful: builder.mutation<void, number>({
      query: (reviewId) => ({
        url: `/reviews/${reviewId}/helpful/`,
        method: 'POST'
      }),
      invalidatesTags: (result, error, reviewId) => [
        { type: 'Review', id: `REVIEW_${reviewId}` }
      ]
    }),

    // Report review
    reportReview: builder.mutation<void, {
      reviewId: number
      reason: string
      description?: string
    }>({
      query: ({ reviewId, ...data }) => ({
        url: `/reviews/${reviewId}/report/`,
        method: 'POST',
        body: data
      })
    })
  })
})

export const {
  useGetPropertyReviewsQuery,
  useCreateReviewMutation,
  useUpdateReviewMutation,
  useDeleteReviewMutation,
  useGetReviewRepliesQuery,
  useCreateReviewReplyMutation,
  useGetPropertyReviewStatsQuery,
  useGetAllReviewsQuery,
  useModerateReviewMutation,
  useMarkReviewHelpfulMutation,
  useReportReviewMutation
} = reviewsApi