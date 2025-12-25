import { api } from '@/store/api'

export interface SwipeRequest {
    property_id: number
    is_liked: boolean
}

export interface SwipeResponse {
    success: boolean
    match?: boolean
}

export interface SwipeListParams {
    page?: number
    limit?: number
    is_liked?: boolean
    q?: string
    city?: string
    property_type?: string
    purpose?: string
    price_min?: number
    price_max?: number
}

export interface SwipeStatsResponse {
    total?: number
    liked?: number
    disliked?: number
    [key: string]: number | undefined
}

export const swipesApi = api.injectEndpoints({
    endpoints: (builder) => ({
        swipeProperty: builder.mutation<SwipeResponse, SwipeRequest>({
            query: (data) => ({
                url: '/swipes/',
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['Property', 'Swipe'],
        }),
        listSwipes: builder.query<Record<string, unknown>, SwipeListParams | void>({
            query: (params) => ({
                url: '/swipes/',
                params: { page: 1, limit: 20, ...(params || {}) },
            }),
            providesTags: ['Swipe'],
        }),
        undoLastSwipe: builder.mutation<void, void>({
            query: () => ({
                url: '/swipes/undo/',
                method: 'DELETE',
            }),
            invalidatesTags: ['Swipe'],
        }),
        toggleSwipeLike: builder.mutation<void, { swipeId: number | string }>({
            query: ({ swipeId }) => ({
                url: `/swipes/${swipeId}/toggle/`,
                method: 'PUT',
            }),
            invalidatesTags: ['Swipe'],
        }),
        getSwipeStats: builder.query<SwipeStatsResponse, void>({
            query: () => '/swipes/stats/',
            providesTags: ['Swipe'],
        }),
        getMatches: builder.query<Record<string, unknown>[], void>({
            query: () => '/swipes/matches/',
            providesTags: ['Swipe'],
        }),
    }),
})

export const {
    useSwipePropertyMutation,
    useListSwipesQuery,
    useUndoLastSwipeMutation,
    useToggleSwipeLikeMutation,
    useGetSwipeStatsQuery,
    useGetMatchesQuery,
} = swipesApi
