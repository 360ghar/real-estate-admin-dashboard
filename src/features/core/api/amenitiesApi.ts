import { api } from '@/store/api'
import type { Amenity } from '@/types/api'

export const amenitiesApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // Get all amenities
    getAmenities: builder.query<Amenity[], void>({
      query: () => '/amenities/',
      providesTags: ['Amenity']
    }),
  }),
})

export const {
  useGetAmenitiesQuery,
} = amenitiesApi