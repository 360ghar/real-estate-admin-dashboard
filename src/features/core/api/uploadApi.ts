import { api } from '@/store/api'
import type { UploadResponse } from '@/types/api'

export const uploadApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // Upload file
    uploadFile: builder.mutation<UploadResponse, File>({
      query: (file) => {
        const formData = new FormData()
        formData.append('file', file)
        return {
          url: '/upload/',
          method: 'POST',
          body: formData,
          formData: true
        }
      }
    }),
  }),
})

export const {
  useUploadFileMutation,
} = uploadApi