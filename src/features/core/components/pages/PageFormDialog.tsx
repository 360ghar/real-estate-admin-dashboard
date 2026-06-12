import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { getErrorMessage } from '@/lib/errors'
import { useCreatePageMutation, useUpdatePageMutation } from '@/features/core/api/coreApi'
import { useToast } from '@/hooks/use-toast'
import type { Page, PageCreate, PageUpdate } from '@/types/api'

interface PageFormData {
  unique_name: string; title: string; content: string; format: 'html' | 'markdown'
  custom_config_text?: string; is_active: boolean; is_draft: boolean
}

interface PageFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  editingPage: Page | null
  formData: PageFormData
  setFormData: React.Dispatch<React.SetStateAction<PageFormData>>
  onSuccess: () => void
}

const generateSlug = (title: string) => title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

const parseCustomConfig = (value?: string) => {
  if (!value) return undefined
  try { const parsed: unknown = JSON.parse(value); if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) return parsed as Record<string, unknown> } catch { return undefined }
  return undefined
}

const PageFormDialog: React.FC<PageFormDialogProps> = ({ open, onOpenChange, editingPage, formData, setFormData, onSuccess }) => {
  const { toast } = useToast()
  const [createPage, { isLoading: isCreating }] = useCreatePageMutation()
  const [updatePage, { isLoading: isUpdating }] = useUpdatePageMutation()

  const handleInputChange = (field: keyof PageFormData, value: string | boolean) => {
    setFormData(prev => { const newData = { ...prev, [field]: value }; if (field === 'title' && !editingPage) newData.unique_name = generateSlug(value as string); return newData })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingPage) {
        const updateData: PageUpdate = { title: formData.title, content: formData.content, format: formData.format, is_active: formData.is_active, is_draft: formData.is_draft }
        const updateConfig = parseCustomConfig(formData.custom_config_text)
        if (updateConfig) updateData.custom_config = updateConfig
        await updatePage({ uniqueName: editingPage.unique_name, data: updateData }).unwrap()
        toast({ title: 'Success', description: 'Page updated successfully' })
      } else {
        const createData: PageCreate = { unique_name: formData.unique_name, title: formData.title, content: formData.content, format: formData.format, is_active: formData.is_active, is_draft: formData.is_draft }
        const createConfig = parseCustomConfig(formData.custom_config_text)
        if (createConfig) createData.custom_config = createConfig
        await createPage(createData).unwrap()
        toast({ title: 'Success', description: 'Page created successfully' })
      }
      onOpenChange(false)
      onSuccess()
    } catch (error: unknown) { toast({ title: 'Error', description: getErrorMessage(error, 'Failed to save page'), variant: 'destructive' }) }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editingPage ? 'Edit Page' : 'Create New Page'}</DialogTitle>
          <DialogDescription>{editingPage ? 'Update the page content and metadata' : 'Create a new content page for the application'}</DialogDescription>
        </DialogHeader>
        <form onSubmit={(e) => { void handleSubmit(e) }} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2"><Label htmlFor="title">Title *</Label><Input id="title" value={formData.title} onChange={(e) => handleInputChange('title', e.target.value)} placeholder="Enter page title" required /></div>
            <div className="space-y-2"><Label htmlFor="unique_name">Unique Name *</Label><Input id="unique_name" value={formData.unique_name} onChange={(e) => handleInputChange('unique_name', e.target.value)} placeholder="privacy-policy" required /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2"><Label htmlFor="format">Format</Label>
              <Select value={formData.format} onValueChange={(value) => handleInputChange('format', value)}>
                <SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="html">HTML</SelectItem><SelectItem value="markdown">Markdown</SelectItem></SelectContent>
              </Select>
            </div>
            <div className="space-y-2" />
          </div>
          <div className="space-y-2"><Label htmlFor="content">Content *</Label><Textarea id="content" value={formData.content} onChange={(e) => handleInputChange('content', e.target.value)} placeholder="Enter page content (supports HTML)" rows={10} required /></div>
          <div className="space-y-2"><Label htmlFor="custom_config">Custom Config (JSON)</Label><Textarea id="custom_config" value={formData.custom_config_text} onChange={(e) => handleInputChange('custom_config_text', e.target.value)} placeholder='{ "show_footer": true }' rows={4} /></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2"><Label htmlFor="is_active">Active</Label><div className="flex items-center space-x-2"><input type="checkbox" id="is_active" checked={formData.is_active} onChange={(e) => handleInputChange('is_active', e.target.checked)} className="h-4 w-4" /><Label htmlFor="is_active">This page is active</Label></div></div>
            <div className="space-y-2"><Label htmlFor="is_draft">Draft</Label><div className="flex items-center space-x-2"><input type="checkbox" id="is_draft" checked={formData.is_draft} onChange={(e) => handleInputChange('is_draft', e.target.checked)} className="h-4 w-4" /><Label htmlFor="is_draft">Save as draft</Label></div></div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={isCreating || isUpdating}>{isCreating || isUpdating ? 'Saving...' : (editingPage ? 'Update' : 'Create')}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default PageFormDialog
export type { PageFormData }
