import { api } from '@/store/api'
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
  AppConfig,
  FAQResponse,
  FAQCreate,
  FAQUpdate,
  FAQQuery,
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

    getBugReports: builder.query<BugReport[], BugReportsQuery | void>({
      query: (params) => ({
        url: '/bugs/',
        params: { limit: 20, offset: 0, ...(params || {}) }
      }),
      providesTags: (res) =>
        res && Array.isArray(res)
          ? [
              ...res.map((b) => ({ type: 'BugReport' as const, id: b.id })),
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

    getPages: builder.query<Page[], PagesQuery | void>({
      query: (params) => ({
        url: '/pages/',
        params: { limit: 20, offset: 0, ...(params || {}) }
      }),
      providesTags: (res) =>
        res && Array.isArray(res)
          ? [
              ...res.map((p) => ({ type: 'Page' as const, id: p.unique_name })),
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
        url: '/versions/',
        method: 'POST',
        body: data
      }),
      invalidatesTags: ['Version']
    }),

    checkForUpdates: builder.query<AppUpdateCheckResponse, AppUpdateCheckRequest>({
      query: (data) => ({
        url: '/versions/check',
        method: 'POST',
        body: data
      })
    }),

    getAppUpdates: builder.query<AppUpdate[], AppUpdatesQuery | void>({
      query: (params) => ({
        url: '/versions/',
        params: { limit: 10, offset: 0, ...(params || {}) }
      }),
      providesTags: (res) =>
        res && Array.isArray(res)
          ? [
              ...res.map((u) => ({ type: 'Version' as const, id: u.id })),
              { type: 'Version' as const, id: 'LIST' },
            ]
          : [{ type: 'Version' as const, id: 'LIST' }],
    }),

    updateAppUpdate: builder.mutation<AppUpdate, { id: number; data: AppUpdateUpdate }>({
      query: ({ id, data }) => ({
        url: `/versions/${id}`,
        method: 'PUT',
        body: data
      }),
      invalidatesTags: (res, _e, { id }) => [{ type: 'Version', id }]
    }),

    // FAQs
    createFaq: builder.mutation<FAQResponse, FAQCreate>({
      query: (data) => ({
        url: '/faqs/',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['FAQ'],
    }),

    getFaqs: builder.query<FAQResponse[], FAQQuery | void>({
      query: (params) => ({
        url: '/faqs/',
        params: { limit: 50, offset: 0, ...(params || {}) },
      }),
      providesTags: (res) =>
        res && Array.isArray(res)
          ? [
              ...res.map((f) => ({ type: 'FAQ' as const, id: f.id })),
              { type: 'FAQ' as const, id: 'LIST' },
            ]
          : [{ type: 'FAQ' as const, id: 'LIST' }],
    }),

    getFaq: builder.query<FAQResponse, number>({
      query: (faqId) => `/faqs/${faqId}`,
      providesTags: (res, _e, faqId) => [{ type: 'FAQ', id: faqId }],
    }),

    updateFaq: builder.mutation<FAQResponse, { faqId: number; data: FAQUpdate }>({
      query: ({ faqId, data }) => ({
        url: `/faqs/${faqId}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (res, _e, { faqId }) => [{ type: 'FAQ', id: faqId }],
    }),

    deleteFaq: builder.mutation<void, number>({
      query: (faqId) => ({
        url: `/faqs/${faqId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (res, _e, faqId) => [{ type: 'FAQ', id: faqId }, { type: 'FAQ', id: 'LIST' }],
    }),

    getFaqsPublic: builder.query<FAQResponse[], FAQQuery | void>({
      query: (params) => ({
        url: '/faqs/public',
        params: { limit: 50, offset: 0, ...(params || {}) },
      }),
    }),

    // Health Check
    healthCheck: builder.query<HealthResponse, void>({
      query: () => '/health'
    }),

    // Public Config
    getConfig: builder.query<AppConfig, void>({
      query: () => '/config'
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
  useCreateFaqMutation,
  useGetFaqsQuery,
  useGetFaqQuery,
  useUpdateFaqMutation,
  useDeleteFaqMutation,
  useGetFaqsPublicQuery,
  useHealthCheckQuery,
  useGetConfigQuery,
} = coreApi
