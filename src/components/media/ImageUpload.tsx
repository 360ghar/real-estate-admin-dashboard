import { useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { GripVertical } from 'lucide-react'
import { useUploadFileMutation } from '@/store/services/propertiesApi'

type Props = {
  bucket?: string
  folder?: string
  value?: string[]
  onChange?: (urls: string[]) => void
  multiple?: boolean
  primary?: string | null
  onPrimaryChange?: (url: string) => void
}

const ImageUpload = ({ bucket = 'public', folder = 'properties', value = [], onChange, multiple = true, primary = null, onPrimaryChange }: Props) => {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadFile] = useUploadFileMutation()

  const allowedImageTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'image/gif',
  ] as const

  const pick = () => inputRef.current?.click()
  const remove = (url: string) => onChange?.(value.filter((u) => u !== url))

  const onFiles = async (files: FileList | null) => {
    if (!files) return
    setUploading(true)
    try {
      const urls: string[] = []
      for (const file of Array.from(files)) {
        if (!allowedImageTypes.includes(file.type as any)) {
          // eslint-disable-next-line no-alert
          alert(`Unsupported file type: ${file.type}. Allowed: ${allowedImageTypes.join(', ')}`)
          continue
        }
        const fd = new FormData()
        // folder hint (optional, backend may ignore)
        fd.append('file', file)
        if (folder) fd.append('folder', folder)
        if (bucket) fd.append('bucket', bucket)
        const res = await uploadFile(fd).unwrap()
        urls.push(res.public_url)
      }
      onChange?.([...(value || []), ...urls])
    } catch (e) {
      // eslint-disable-next-line no-alert
      alert('Upload failed. Please try again or check your connection.')
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  // Drag & drop reorder
  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const onDragStart = (idx: number) => setDragIndex(idx)
  const onDragOver = (e: React.DragEvent) => e.preventDefault()
  const onDrop = (idx: number) => {
    if (dragIndex === null || dragIndex === idx) return setDragIndex(null)
    const arr = [...(value || [])]
    const [moved] = arr.splice(dragIndex, 1)
    arr.splice(idx, 0, moved)
    onChange?.(arr)
    if (arr.length && onPrimaryChange) onPrimaryChange(arr[0])
    setDragIndex(null)
  }

  return (
    <div>
      <div className="mb-2 flex flex-wrap gap-3">
        {value?.map((url, idx) => (
          <div
            key={url}
            className={`relative h-24 w-24 overflow-hidden rounded-md border transition-transform ${dragIndex === idx ? 'ring-2 ring-blue-500 scale-105' : ''}`}
            onDragOver={onDragOver}
            onDrop={() => onDrop(idx)}
          >
            <img src={url} className="h-full w-full object-cover" />
            <div className="absolute left-1 top-1 flex gap-1">
              <Button
                type="button"
                size="sm"
                variant={primary === url ? "default" : "secondary"}
                className="h-6 px-2 text-xs"
                onClick={() => onPrimaryChange?.(url)}
              >
                {primary === url ? 'Primary' : 'Make Primary'}
              </Button>
            </div>
            <Button
              type="button"
              size="sm"
              variant="secondary"
              className="absolute bottom-1 left-1 h-6 w-6 p-0"
              draggable
              onDragStart={() => onDragStart(idx)}
              onDragEnd={() => setDragIndex(null)}
              title="Drag to reorder"
            >
              <GripVertical className="h-3 w-3" />
            </Button>
            <Button
              type="button"
              size="sm"
              variant="secondary"
              className="absolute right-1 top-1 h-6 w-6 p-0"
              onClick={() => remove(url)}
            >
              ×
            </Button>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-2">
        <Button type="button" onClick={pick} disabled={uploading}>{uploading ? 'Uploading…' : 'Upload Images'}</Button>
        <input
          ref={inputRef}
          type="file"
          accept={allowedImageTypes.join(',')}
          multiple={multiple}
          className="hidden"
          onChange={(e) => onFiles(e.target.files)}
        />
      </div>
    </div>
  )
}

export default ImageUpload
