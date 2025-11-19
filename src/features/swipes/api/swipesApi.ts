import { api } from '@/store/api'

export interface SwipeRequest {
    property_id: number
    action: 'like' | 'dislike'
}

export interface SwipeResponse {
    success: boolean
    match?: boolean
}

export const swipesApi = api.injectEndpoints({
    endpoints: (builder) => ({
        swipeProperty: builder.mutation<SwipeResponse, SwipeRequest>({
            query: (data) => ({
                url: '/swipes/',
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['Property'],
        }),
        getMatches: builder.query<any[], void>({
            query: () => '/swipes/matches/',
            providesTags: ['Property'],
        }),
    }),
})

export const {
    useSwipePropertyMutation,
    useGetMatchesQuery,
} = swipesApi
