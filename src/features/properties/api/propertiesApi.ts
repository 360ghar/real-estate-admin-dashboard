import { api } from '@/store/api'
import type {
  Property,
  PropertyCreate,
  PropertyUpdate,
  PropertySearchParams,
  UnifiedPropertyResponse,
  MessageResponse,
} from '@/types'

export const propertiesApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // Upload a single file via backend (Supabase handled server-side)
    uploadFile: builder.mutation<
      { public_url: string; file_path: string; file_type?: string; file_size?: number; content_type?: string; original_filename?: string },
      FormData
    >({
      query: (form) => ({
        url: '/upload/',
        method: 'POST',
        body: form,
      }),
    }),

    // Search properties with comprehensive filtering
    searchProperties: builder.query<UnifiedPropertyResponse, PropertySearchParams>({
      query: (params) => ({
        url: '/properties/',
        params: params as Record<string, any>,
      }),
      providesTags: (res) =>
        res?.properties
          ? [
              ...res.properties.map((p) => ({ type: 'Property' as const, id: p.id })),
              { type: 'Property' as const, id: 'LIST' },
            ]
          : [{ type: 'Property' as const, id: 'LIST' }],
    }),

    // Legacy list properties (for backward compatibility)
    listProperties: builder.query<
      { results: Property[]; count?: number; total_pages?: number },
      PropertySearchParams
    >({
      query: (params) => ({
        url: '/properties/',
        params: { ...params, page: params.page || 1, limit: params.limit || 20 } as Record<string, any>,
      }),
      transformResponse: (response: UnifiedPropertyResponse) => ({
        results: response.properties,
        count: response.total,
        total_pages: response.total_pages,
      }),
      providesTags: (res) =>
        res?.results
          ? [
              ...res.results.map((p) => ({ type: 'Property' as const, id: p.id })),
              { type: 'Property' as const, id: 'LIST' },
            ]
          : [{ type: 'Property' as const, id: 'LIST' }],
    }),

    getProperty: builder.query<Property, number>({
      query: (id) => `/properties/${id}`,
      providesTags: (res, _e, id) => [{ type: 'Property', id }],
    }),

    createProperty: builder.mutation<Property, { data: PropertyCreate; ownerId?: number }>({
      query: ({ data, ownerId }) => ({
        url: '/properties/',
        method: 'POST',
        params: ownerId ? { owner_id: ownerId } : undefined,
        body: data,
      }),
      invalidatesTags: [{ type: 'Property', id: 'LIST' }],
    }),

    updateProperty: builder.mutation<Property, { id: number; data: PropertyUpdate }>({
      query: ({ id, data }) => ({
        url: `/properties/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (_res, _e, { id }) => [{ type: 'Property', id }, { type: 'Property', id: 'LIST' }],
    }),

    deleteProperty: builder.mutation<MessageResponse | void, number>({
      query: (id) => ({
        url: `/properties/${id}/`,
        method: 'DELETE',
      }),
      invalidatesTags: (_res, _e, id) => [{ type: 'Property', id }, { type: 'Property', id: 'LIST' }],
    }),

    // Get property recommendations
    getRecommendations: builder.query<Property[], { limit?: number }>({
      query: (params) => ({
        url: '/properties/recommendations/',
        params: { limit: 10, ...params },
      }),
      providesTags: [{ type: 'Property', id: 'RECOMMENDATIONS' }],
    }),
  }),
})

export const {
  useUploadFileMutation,
  useListPropertiesQuery,
  useSearchPropertiesQuery,
  useGetPropertyQuery,
  useCreatePropertyMutation,
  useUpdatePropertyMutation,
  useDeletePropertyMutation,
  useGetRecommendationsQuery,
} = propertiesApi
