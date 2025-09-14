import { api } from './api'
import type {
  BugReport,
  BugReportCreate,
  BugReportUpdate,
  BugReportsQuery,
  Page,
  PageCreate,
  PageUpdate,
  PagesQuery,
  PagePublicResponse,
  AppUpdate,
  AppUpdateCreate,
  AppUpdateUpdate,
  AppUpdatesQuery,
  AppUpdateCheckRequest,
  AppUpdateCheckResponse,
  HealthResponse,
  PaginatedResponse
} from '@/types/api'

export const coreApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // Bug Reports
    createBugReport: builder.mutation<BugReport, BugReportCreate>({
      query: (data) => ({
        url: '/bugs/',
        method: 'POST',
        body: data
      }),
      invalidatesTags: ['BugReport']
    }),

    createBugReportWithMedia: builder.mutation<BugReport, FormData>({
      query: (formData) => ({
        url: '/bugs/with-media/',
        method: 'POST',
        body: formData,
        formData: true
      }),
      invalidatesTags: ['BugReport']
    }),

    getBugReports: builder.query<PaginatedResponse<BugReport>, BugReportsQuery>({
      query: (params) => ({
        url: '/bugs/',
        params: { page: 1, limit: 20, ...params }
      }),
      providesTags: (res) =>
        res?.items
          ? [
              ...res.items.map((b) => ({ type: 'BugReport' as const, id: b.id })),
              { type: 'BugReport' as const, id: 'LIST' },
            ]
          : [{ type: 'BugReport' as const, id: 'LIST' }],
    }),

    getBugReport: builder.query<BugReport, number>({
      query: (id) => `/bugs/${id}`,
      providesTags: (res, _e, id) => [{ type: 'BugReport', id }]
    }),

    updateBugReport: builder.mutation<BugReport, { id: number; data: BugReportUpdate }>({
      query: ({ id, data }) => ({
        url: `/bugs/${id}`,
        method: 'PUT',
        body: data
      }),
      invalidatesTags: (res, _e, { id }) => [{ type: 'BugReport', id }]
    }),

    // Pages Management
    createPage: builder.mutation<Page, PageCreate>({
      query: (data) => ({
        url: '/pages/',
        method: 'POST',
        body: data
      }),
      invalidatesTags: ['Page']
    }),

    getPages: builder.query<PaginatedResponse<Page>, PagesQuery>({
      query: (params) => ({
        url: '/pages/',
        params: { page: 1, limit: 20, ...params }
      }),
      providesTags: (res) =>
        res?.items
          ? [
              ...res.items.map((p) => ({ type: 'Page' as const, id: p.unique_name })),
              { type: 'Page' as const, id: 'LIST' },
            ]
          : [{ type: 'Page' as const, id: 'LIST' }],
    }),

    getPage: builder.query<Page, string>({
      query: (uniqueName) => `/pages/${uniqueName}`,
      providesTags: (res, _e, uniqueName) => [{ type: 'Page', id: uniqueName }]
    }),

    getPagePublic: builder.query<PagePublicResponse, string>({
      query: (uniqueName) => `/pages/${uniqueName}/public`
    }),

    updatePage: builder.mutation<Page, { uniqueName: string; data: PageUpdate }>({
      query: ({ uniqueName, data }) => ({
        url: `/pages/${uniqueName}`,
        method: 'PUT',
        body: data
      }),
      invalidatesTags: (res, _e, { uniqueName }) => [{ type: 'Page', id: uniqueName }]
    }),

    deletePage: builder.mutation<void, string>({
      query: (uniqueName) => ({
        url: `/pages/${uniqueName}`,
        method: 'DELETE'
      }),
      invalidatesTags: (res, _e, uniqueName) => [{ type: 'Page', id: uniqueName }, { type: 'Page', id: 'LIST' }],
    }),

    // App Updates
    createAppUpdate: builder.mutation<AppUpdate, AppUpdateCreate>({
      query: (data) => ({
        url: '/updates/',
        method: 'POST',
        body: data
      }),
      invalidatesTags: ['AppUpdate']
    }),

    checkForUpdates: builder.query<AppUpdateCheckResponse, AppUpdateCheckRequest>({
      query: (data) => ({
        url: '/updates/check',
        method: 'POST',
        body: data
      })
    }),

    getAppUpdates: builder.query<PaginatedResponse<AppUpdate>, AppUpdatesQuery | void>({
      query: (params) => ({
        url: '/updates/',
        params: { page: 1, limit: 10, ...(params || {}) }
      }),
      providesTags: (res) =>
        res?.items
          ? [
              ...res.items.map((u) => ({ type: 'AppUpdate' as const, id: u.id })),
              { type: 'AppUpdate' as const, id: 'LIST' },
            ]
          : [{ type: 'AppUpdate' as const, id: 'LIST' }],
    }),

    updateAppUpdate: builder.mutation<AppUpdate, { id: number; data: AppUpdateUpdate }>({
      query: ({ id, data }) => ({
        url: `/updates/${id}`,
        method: 'PUT',
        body: data
      }),
      invalidatesTags: (res, _e, { id }) => [{ type: 'AppUpdate', id }]
    }),

    deleteAppUpdate: builder.mutation<void, number>({
      query: (id) => ({
        url: `/updates/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (res, _e, id) => [{ type: 'AppUpdate', id }, { type: 'AppUpdate', id: 'LIST' }],
    }),

    // Health Check
    healthCheck: builder.query<HealthResponse, void>({
      query: () => '/health'
    }),
  }),
})

export const {
  useCreateBugReportMutation,
  useCreateBugReportWithMediaMutation,
  useGetBugReportsQuery,
  useGetBugReportQuery,
  useUpdateBugReportMutation,
  useCreatePageMutation,
  useGetPagesQuery,
  useGetPageQuery,
  useGetPagePublicQuery,
  useUpdatePageMutation,
  useDeletePageMutation,
  useCreateAppUpdateMutation,
  useCheckForUpdatesQuery,
  useGetAppUpdatesQuery,
  useUpdateAppUpdateMutation,
  useDeleteAppUpdateMutation,
  useHealthCheckQuery,
} = coreApi
