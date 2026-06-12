import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { getErrorMessage } from '@/lib/errors'
import { useCreateAppUpdateMutation, useUpdateAppUpdateMutation } from '@/features/core/api/coreApi'
import { useToast } from '@/hooks/use-toast'
import type { AppUpdate } from '@/types/api'

interface AppUpdateFormData {
  platform: 'ios' | 'android' | 'web'; version: string; build_number: string
  release_notes: string; download_url: string; is_mandatory: boolean; is_active: boolean; min_supported_version: string
}

interface AppUpdateFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  editingUpdate: AppUpdate | null
  formData: AppUpdateFormData
  setFormData: React.Dispatch<React.SetStateAction<AppUpdateFormData>>
  onSuccess: () => void
}

const defaultFormData: AppUpdateFormData = { platform: 'ios', version: '', build_number: '', release_notes: '', download_url: '', is_mandatory: false, is_active: true, min_supported_version: '' }

const AppUpdateFormDialog: React.FC<AppUpdateFormDialogProps> = ({ open, onOpenChange, editingUpdate, formData, setFormData, onSuccess }) => {
  const { toast } = useToast()
  const [createUpdate, { isLoading: isCreating }] = useCreateAppUpdateMutation()
  const [updateUpdate, { isLoading: isUpdating }] = useUpdateAppUpdateMutation()

  const handleInputChange = (field: keyof AppUpdateFormData, value: string | boolean) => setFormData(prev => ({ ...prev, [field]: value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingUpdate) {
        await updateUpdate({ id: editingUpdate.id, data: { version: formData.version, build_number: Number(formData.build_number), release_notes: formData.release_notes, download_url: formData.download_url, is_mandatory: formData.is_mandatory, is_active: formData.is_active, min_supported_version: formData.min_supported_version } }).unwrap()
        toast({ title: 'Success', description: 'App update updated successfully' })
      } else {
        await createUpdate({ platform: formData.platform, version: formData.version, build_number: Number(formData.build_number), release_notes: formData.release_notes, download_url: formData.download_url, is_mandatory: formData.is_mandatory, is_active: formData.is_active, min_supported_version: formData.min_supported_version || undefined }).unwrap()
        toast({ title: 'Success', description: 'App update created successfully' })
      }
      onOpenChange(false)
      onSuccess()
    } catch (error: unknown) { toast({ title: 'Error', description: getErrorMessage(error, 'Failed to save app update'), variant: 'destructive' }) }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editingUpdate ? 'Edit Update' : 'Create New Update'}</DialogTitle>
          <DialogDescription>{editingUpdate ? 'Update the application version information' : 'Create a new application update for users'}</DialogDescription>
        </DialogHeader>
        <form onSubmit={(e) => { void handleSubmit(e) }} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2"><Label htmlFor="version">Version *</Label><Input id="version" value={formData.version} onChange={(e) => handleInputChange('version', e.target.value)} placeholder="1.0.0" required /></div>
            <div className="space-y-2"><Label htmlFor="build_number">Build Number *</Label><Input id="build_number" value={formData.build_number} onChange={(e) => handleInputChange('build_number', e.target.value)} placeholder="100" required /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2"><Label htmlFor="platform">Platform</Label><Select value={formData.platform} onValueChange={(value) => handleInputChange('platform', value)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="android">Android</SelectItem><SelectItem value="ios">iOS</SelectItem><SelectItem value="web">Web</SelectItem></SelectContent></Select></div>
            <div className="space-y-2"><Label htmlFor="min_supported_version">Min Supported Version</Label><Input id="min_supported_version" value={formData.min_supported_version} onChange={(e) => handleInputChange('min_supported_version', e.target.value)} placeholder="1.0.0" /></div>
          </div>
          <div className="grid grid-cols-2 gap-4"><div className="space-y-2"><Label htmlFor="download_url">Download URL *</Label><Input id="download_url" value={formData.download_url} onChange={(e) => handleInputChange('download_url', e.target.value)} placeholder="https://example.com/app.apk" required /></div><div className="space-y-2" /></div>
          <div className="space-y-2"><Label htmlFor="release_notes">Release Notes</Label><Textarea id="release_notes" value={formData.release_notes} onChange={(e) => handleInputChange('release_notes', e.target.value)} placeholder="Detailed release notes..." rows={6} /></div>
          <div className="flex items-center justify-between space-y-2">
            <div className="flex items-center space-x-2"><Switch id="is_active" checked={formData.is_active} onCheckedChange={(checked) => handleInputChange('is_active', checked)} /><Label htmlFor="is_active">Active Update</Label></div>
            <div className="flex items-center space-x-2"><Switch id="is_mandatory" checked={formData.is_mandatory} onCheckedChange={(checked) => handleInputChange('is_mandatory', checked)} /><Label htmlFor="is_mandatory">Mandatory</Label></div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={isCreating || isUpdating}>{isCreating || isUpdating ? 'Saving...' : (editingUpdate ? 'Update' : 'Create')}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default AppUpdateFormDialog
export type { AppUpdateFormData }
export { defaultFormData }
