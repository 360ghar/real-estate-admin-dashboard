import { UseFormReturn } from 'react-hook-form'
import { FormLabel } from '@/components/ui/form'
import { PropertyFormValues } from '@/features/properties/schemas'
import ImageUpload from '@/components/common/media/ImageUpload'
import { useState } from 'react'

interface PropertyMediaProps {
  form: UseFormReturn<PropertyFormValues>
  // We pass images state separately or we can manage it via form context but ImageUpload might need array of strings
  // The schema has `main_image_url`, but we also need to handle the full gallery which is likely uploaded separately or handled by parent
  // For now I will replicate existing logic where state is local in the form component, but passed down
  images: string[]
  setImages: (images: string[]) => void
  primaryImage: string | null
  setPrimaryImage: (url: string | null) => void
}

export function PropertyMedia({ images, setImages, primaryImage, setPrimaryImage }: PropertyMediaProps) {
  return (
    <div className="space-y-4">
      <FormLabel>Property Images</FormLabel>
      <div className="text-sm text-muted-foreground mb-2">
        Upload high-quality images. The first image will be used as the cover.
      </div>
      <ImageUpload
        value={images}
        onChange={setImages}
        primary={primaryImage}
        onPrimaryChange={setPrimaryImage}
      />
    </div>
  )
}
