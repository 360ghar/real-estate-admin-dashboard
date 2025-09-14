import { api } from './api'
import type { Property } from '@/types'

export interface ListParams {
  q?: string
  type?: string
  purpose?: string
  city?: string
  locality?: string
  status?: string
  owner_id?: number
  agent_id?: number
  include_inactive?: boolean
  page?: number
  page_size?: number
}

export const propertiesApi = api.injectEndpoints({
  endpoints: (builder) => ({
    listProperties: builder.query<{ results: Property[]; count?: number }, ListParams | void>({
      query: (params) => ({ url: '/properties/', params: params as unknown as Record<string, any> | undefined }),
      providesTags: (res) =>
        res?.results
          ? [
              ...res.results.map((p) => ({ type: 'Property' as const, id: p.id })),
              { type: 'Property' as const, id: 'LIST' },
            ]
          : [{ type: 'Property' as const, id: 'LIST' }],
    }),
    getProperty: builder.query<Property, number>({
      query: (id) => `/properties/${id}/`,
      providesTags: (res, _e, id) => [{ type: 'Property', id }],
    }),
    createProperty: builder.mutation<Property, Partial<Property>>({
      query: (body) => ({ url: '/properties/', method: 'POST', body }),
      invalidatesTags: [{ type: 'Property', id: 'LIST' }],
    }),
    updateProperty: builder.mutation<Property, { id: number; data: Partial<Property> }>({
      query: ({ id, data }) => ({ url: `/properties/${id}/`, method: 'PUT', body: data }),
      invalidatesTags: (_res, _e, { id }) => [{ type: 'Property', id }],
    }),
    deleteProperty: builder.mutation<{ success: boolean }, number>({
      query: (id) => ({ url: `/properties/${id}/`, method: 'DELETE' }),
      invalidatesTags: (_res, _e, id) => [{ type: 'Property', id }, { type: 'Property', id: 'LIST' }],
    }),
  }),
})

export const {
  useListPropertiesQuery,
  useGetPropertyQuery,
  useCreatePropertyMutation,
  useUpdatePropertyMutation,
  useDeletePropertyMutation,
} = propertiesApi
