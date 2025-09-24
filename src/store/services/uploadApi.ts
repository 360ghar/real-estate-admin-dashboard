import { api } from './api'
import type { UploadResponse } from '@/types/api'

export const uploadApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // Upload file via multipart/form-data (supports additional fields like folder/bucket)
    uploadFile: builder.mutation<UploadResponse, FormData>({
      query: (formData) => ({
        url: '/upload/',
        method: 'POST',
        body: formData,
      }),
    }),
  }),
})

export const {
  useUploadFileMutation,
} = uploadApi