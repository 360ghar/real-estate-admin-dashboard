import { api } from './api'

export interface Amenity { id: string; name: string }

export const amenitiesApi = api.injectEndpoints({
  endpoints: (builder) => ({
    listAmenities: builder.query<{ results: Amenity[] }, void>({
      query: () => '/amenities/',
    }),
  }),
})

export const { useListAmenitiesQuery } = amenitiesApi

