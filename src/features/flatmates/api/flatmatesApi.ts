import { api } from '@/store/api'
import type {
  ModerationAction,
  ModerationQueueResponse,
  ReportModerationAction,
  ReportsQueueResponse,
} from '../types'

interface QueueParams {
  status?: string
  limit?: number
  cursor?: string | null
}

export const flatmatesApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getPendingListings: builder.query<ModerationQueueResponse, QueueParams | void>({
      query: (params) => ({
        url: '/flatmates/moderation/listings',
        params: {
          status: params?.status ?? 'pending_review',
          limit: params?.limit ?? 50,
          cursor: params?.cursor ?? undefined,
        },
      }),
      providesTags: (result) =>
        result?.items
          ? [
              ...result.items.map((listing) => ({
                type: 'FlatmatesListing' as const,
                id: listing.id,
              })),
              { type: 'FlatmatesListing' as const, id: 'LIST' },
            ]
          : [{ type: 'FlatmatesListing' as const, id: 'LIST' }],
    }),
    moderateListing: builder.mutation<
      { listing_id: number; action: string; status: string; reason?: string },
      { listingId: number; payload: ModerationAction }
    >({
      query: ({ listingId, payload }) => ({
        url: `/flatmates/moderation/listings/${listingId}`,
        method: 'PUT',
        body: payload,
      }),
      invalidatesTags: (_result, _error, { listingId }) => [
        { type: 'FlatmatesListing', id: listingId },
        { type: 'FlatmatesListing', id: 'LIST' },
      ],
    }),
    getPendingReports: builder.query<ReportsQueueResponse, QueueParams | void>({
      query: (params) => ({
        url: '/flatmates/moderation/reports',
        params: {
          status: params?.status ?? 'open',
          limit: params?.limit ?? 50,
          cursor: params?.cursor ?? undefined,
        },
      }),
      providesTags: (result) =>
        result?.items
          ? [
              ...result.items.map((report) => ({
                type: 'FlatmatesReport' as const,
                id: report.id,
              })),
              { type: 'FlatmatesReport' as const, id: 'LIST' },
            ]
          : [{ type: 'FlatmatesReport' as const, id: 'LIST' }],
    }),
    moderateReport: builder.mutation<
      { report_id: number; action: string; status: string; notes?: string },
      { reportId: number; payload: ReportModerationAction }
    >({
      query: ({ reportId, payload }) => ({
        url: `/flatmates/moderation/reports/${reportId}`,
        method: 'PUT',
        body: payload,
      }),
      invalidatesTags: (_result, _error, { reportId }) => [
        { type: 'FlatmatesReport', id: reportId },
        { type: 'FlatmatesReport', id: 'LIST' },
      ],
    }),
  }),
})

export const {
  useGetPendingListingsQuery,
  useModerateListingMutation,
  useGetPendingReportsQuery,
  useModerateReportMutation,
} = flatmatesApi
