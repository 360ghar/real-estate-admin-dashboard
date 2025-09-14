import { api } from './api'

// Updated Property interface to match API documentation
export interface PropertyResponse {
  id: number
  title: string
  description: string
  property_type: 'house' | 'apartment' | 'builder_floor' | 'room'
  purpose: 'buy' | 'rent' | 'short_stay'
  base_price: number
  location: {
    latitude: number
    longitude: number
  }
  city: string
  locality: string
  pincode: string
  area_sqft: number
  bedrooms: number
  bathrooms: number
  balconies: number
  parking_spaces: number
  floor_number: number
  total_floors: number
  age_of_property: number
  max_occupancy: number
  minimum_stay_days: number
  amenities: string[]
  features: string[]
  images: string[]
  main_image_url: string
  owner_id: number
  owner_name: string
  owner_contact: string
  status: string
  liked: boolean
  user_has_scheduled_visit: boolean
  user_scheduled_visit_count: number
  user_next_visit_date?: string
  distance?: number
  created_at: string
}

export interface PaginatedPropertyResponse {
  properties: PropertyResponse[]
  total: number
  page: number
  limit: number
  total_pages: number
  filters_applied?: any
  search_center?: {
    latitude: number
    longitude: number
  }
}

export interface PropertySearchParams {
  // Location
  lat?: number
  lng?: number
  radius?: number
  // Search
  q?: string
  // Property filters
  property_type?: string[]
  purpose?: string
  price_min?: number
  price_max?: number
  bedrooms_min?: number
  bedrooms_max?: number
  bathrooms_min?: number
  bathrooms_max?: number
  area_min?: number
  area_max?: number
  // Location filters
  city?: string
  locality?: string
  pincode?: string
  // Amenities
  amenities?: string[]
  features?: string[]
  // Additional
  parking_spaces_min?: number
  floor_number_min?: number
  floor_number_max?: number
  age_max?: number
  // Short stay
  check_in?: string
  check_out?: string
  guests?: number
  // Sorting
  sort_by?: string
  // Pagination
  page?: number
  limit?: number
  // Auth-aware
  exclude_swiped?: boolean
}

export interface PropertyCreate {
  title: string
  description: string
  property_type: string
  purpose: string
  base_price: number
  latitude: number
  longitude: number
  city: string
  locality: string
  pincode: string
  area_sqft: number
  bedrooms: number
  bathrooms: number
  balconies?: number
  parking_spaces?: number
  floor_number?: number
  total_floors?: number
  age_of_property?: number
  max_occupancy?: number
  minimum_stay_days?: number
  amenity_ids?: number[]
  features?: string[]
  main_image_url?: string
  owner_name?: string
  owner_contact?: string
}

export interface PropertyUpdate extends Partial<PropertyCreate> {}

export const propertiesApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // Search properties with comprehensive filtering
    searchProperties: builder.query<PaginatedPropertyResponse, PropertySearchParams>({
      query: (params) => ({
        url: '/properties/',
        params: params as Record<string, any>
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
    listProperties: builder.query<{ results: PropertyResponse[]; count?: number; total_pages?: number }, PropertySearchParams>({
      query: (params) => ({
        url: '/properties/',
        params: { ...params, page: params.page || 1, limit: params.limit || 20 } as Record<string, any>
      }),
      transformResponse: (response: PaginatedPropertyResponse) => ({
        results: response.properties,
        count: response.total,
        total_pages: response.total_pages
      }),
      providesTags: (res) =>
        res?.results
          ? [
              ...res.results.map((p) => ({ type: 'Property' as const, id: p.id })),
              { type: 'Property' as const, id: 'LIST' },
            ]
          : [{ type: 'Property' as const, id: 'LIST' }],
    }),

    getProperty: builder.query<PropertyResponse, number>({
      query: (id) => `/properties/${id}`,
      providesTags: (res, _e, id) => [{ type: 'Property', id }],
    }),

    createProperty: builder.mutation<PropertyResponse, { data: PropertyCreate; ownerId?: number }>({
      query: ({ data, ownerId }) => ({
        url: '/properties/',
        method: 'POST',
        params: ownerId ? { owner_id: ownerId } : undefined,
        body: data
      }),
      invalidatesTags: [{ type: 'Property', id: 'LIST' }],
    }),

    updateProperty: builder.mutation<PropertyResponse, { id: number; data: PropertyUpdate }>({
      query: ({ id, data }) => ({
        url: `/properties/${id}`,
        method: 'PUT',
        body: data
      }),
      invalidatesTags: (_res, _e, { id }) => [{ type: 'Property', id }, { type: 'Property', id: 'LIST' }],
    }),

    deleteProperty: builder.mutation<void, number>({
      query: (id) => ({
        url: `/properties/${id}/`,
        method: 'DELETE'
      }),
      invalidatesTags: (_res, _e, id) => [{ type: 'Property', id }, { type: 'Property', id: 'LIST' }],
    }),

    // Get property recommendations
    getRecommendations: builder.query<PropertyResponse[], { limit?: number }>({
      query: (params) => ({
        url: '/properties/recommendations/',
        params: { limit: 10, ...params }
      }),
      providesTags: [{ type: 'Property', id: 'RECOMMENDATIONS' }],
    }),
  }),
})

export const {
  useListPropertiesQuery,
  useSearchPropertiesQuery,
  useGetPropertyQuery,
  useCreatePropertyMutation,
  useUpdatePropertyMutation,
  useDeletePropertyMutation,
  useGetRecommendationsQuery,
} = propertiesApi
