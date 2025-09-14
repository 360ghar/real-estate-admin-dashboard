import React, { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Download, Smartphone, Monitor, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { EmptyState } from '@/components/ui/empty-state'
import { Switch } from '@/components/ui/switch'
import { useToast } from '@/hooks/use-toast'
import {
  useGetAppUpdatesQuery,
  useCreateAppUpdateMutation,
  useUpdateAppUpdateMutation,
  useDeleteAppUpdateMutation
} from '@/store/services/coreApi'
import type { AppUpdate } from '@/types/api'

interface AppUpdateFormData {
  platform: 'ios' | 'android' | 'web'
  version: string
  build_number: string
  release_notes: string
  download_url: string
  is_mandatory: boolean
  is_active: boolean
  min_supported_version: string
}

const AppUpdatesPage: React.FC = () => {
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState('')
  const [filterPlatform, setFilterPlatform] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingUpdate, setEditingUpdate] = useState<AppUpdate | null>(null)
  const [formData, setFormData] = useState<AppUpdateFormData>({
    platform: 'ios',
    version: '',
    build_number: '',
    release_notes: '',
    download_url: '',
    is_mandatory: false,
    is_active: true,
    min_supported_version: ''
  })

  // API hooks
  const { data: updatesData, isLoading, refetch } = useGetAppUpdatesQuery()
  const [createUpdate, { isLoading: isCreating }] = useCreateAppUpdateMutation()
  const [updateUpdate, { isLoading: isUpdating }] = useUpdateAppUpdateMutation()
  const [deleteUpdate, { isLoading: isDeleting }] = useDeleteAppUpdateMutation()

  // Filter updates
  const filteredUpdates = updatesData?.items?.filter((update) => {
    const matchesSearch = update.version.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (update.release_notes || '').toLowerCase().includes(searchTerm.toLowerCase())
    const matchesPlatform = filterPlatform === 'all' || update.platform === filterPlatform
    const matchesStatus = filterStatus === 'all' ||
                         (filterStatus === 'active' && update.is_active) ||
                         (filterStatus === 'inactive' && !update.is_active)
    return matchesSearch && matchesPlatform && matchesStatus
  }) || []

  const handleInputChange = (field: keyof AppUpdateFormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      if (editingUpdate) {
        await updateUpdate({ id: editingUpdate.id, data: {
          version: formData.version,
          build_number: Number(formData.build_number),
          release_notes: formData.release_notes,
          download_url: formData.download_url,
          is_mandatory: formData.is_mandatory,
          is_active: formData.is_active,
          min_supported_version: formData.min_supported_version,
        }}).unwrap()
        toast({ title: 'Success', description: 'App update updated successfully' })
      } else {
        await createUpdate({
          platform: formData.platform,
          version: formData.version,
          build_number: Number(formData.build_number),
          release_notes: formData.release_notes,
          download_url: formData.download_url,
          is_mandatory: formData.is_mandatory,
          is_active: formData.is_active,
          min_supported_version: formData.min_supported_version || undefined,
        }).unwrap()
        toast({ title: 'Success', description: 'App update created successfully' })
      }

      setIsDialogOpen(false)
      setEditingUpdate(null)
      setFormData({
        platform: 'ios',
        version: '',
        build_number: '',
        release_notes: '',
        download_url: '',
        is_mandatory: false,
        is_active: true,
        min_supported_version: ''
      })
      refetch()
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.data?.message || 'Failed to save app update',
        variant: 'destructive'
      })
    }
  }

  const handleEdit = (update: AppUpdate) => {
    setEditingUpdate(update)
    setFormData({
      platform: update.platform,
      version: update.version,
      build_number: String(update.build_number),
      release_notes: update.release_notes,
      download_url: update.download_url,
      is_mandatory: update.is_mandatory,
      is_active: update.is_active,
      min_supported_version: update.min_supported_version || ''
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (updateId: number) => {
    if (!confirm('Are you sure you want to delete this update?')) return

    try {
      await deleteUpdate(updateId).unwrap()
      toast({ title: 'Success', description: 'App update deleted successfully' })
      refetch()
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.data?.message || 'Failed to delete update',
        variant: 'destructive'
      })
    }
  }

  const resetForm = () => {
    setEditingUpdate(null)
    setFormData({
      platform: 'ios',
      version: '',
      build_number: '',
      release_notes: '',
      download_url: '',
      is_mandatory: false,
      is_active: true,
      min_supported_version: ''
    })
  }

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'android': return <Smartphone className="h-4 w-4" />
      case 'ios': return <Smartphone className="h-4 w-4 rotate-90" />
      case 'web': return <Monitor className="h-4 w-4" />
      default: return <Monitor className="h-4 w-4" />
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">App Updates Management</h1>
          <p className="text-muted-foreground mt-2">Manage application updates and versions</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              New Update
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingUpdate ? 'Edit Update' : 'Create New Update'}</DialogTitle>
              <DialogDescription>
                {editingUpdate
                  ? 'Update the application version information'
                  : 'Create a new application update for users'
                }
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="version">Version *</Label>
                  <Input
                    id="version"
                    value={formData.version}
                    onChange={(e) => handleInputChange('version', e.target.value)}
                    placeholder="1.0.0"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="build_number">Build Number *</Label>
                  <Input
                    id="build_number"
                    value={formData.build_number}
                    onChange={(e) => handleInputChange('build_number', e.target.value)}
                    placeholder="100"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="platform">Platform</Label>
                  <Select
                    value={formData.platform}
                    onValueChange={(value) => handleInputChange('platform', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="android">Android</SelectItem>
                      <SelectItem value="ios">iOS</SelectItem>
                      <SelectItem value="web">Web</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="min_supported_version">Min Supported Version</Label>
                  <Input
                    id="min_supported_version"
                    value={formData.min_supported_version}
                    onChange={(e) => handleInputChange('min_supported_version', e.target.value)}
                    placeholder="1.0.0"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="download_url">Download URL *</Label>
                  <Input
                    id="download_url"
                    value={formData.download_url}
                    onChange={(e) => handleInputChange('download_url', e.target.value)}
                    placeholder="https://example.com/app.apk"
                    required
                  />
                </div>
                <div className="space-y-2" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="release_notes">Release Notes</Label>
                <Textarea
                  id="release_notes"
                  value={formData.release_notes}
                  onChange={(e) => handleInputChange('release_notes', e.target.value)}
                  placeholder="Detailed release notes..."
                  rows={6}
                />
              </div>

              <div className="flex items-center justify-between space-y-2">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) => handleInputChange('is_active', checked)}
                  />
                  <Label htmlFor="is_active">Active Update</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_mandatory"
                    checked={formData.is_mandatory}
                    onCheckedChange={(checked) => handleInputChange('is_mandatory', checked)}
                  />
                  <Label htmlFor="is_mandatory">Mandatory</Label>
                </div>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isCreating || isUpdating}>
                  {isCreating || isUpdating ? 'Saving...' : (editingUpdate ? 'Update' : 'Create')}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4 flex-wrap">
            <Input
              placeholder="Search updates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
            <Select value={filterPlatform} onValueChange={setFilterPlatform}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by platform" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Platforms</SelectItem>
                <SelectItem value="android">Android</SelectItem>
                <SelectItem value="ios">iOS</SelectItem>
                <SelectItem value="web">Web</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Updates List */}
      {isLoading ? (
        <div className="text-center py-8">Loading updates...</div>
      ) : !filteredUpdates.length ? (
        <EmptyState
          icon={<Monitor className="h-10 w-10" />}
          title="No updates found"
          description="Create your first app update entry."
          action={{
            label: 'New Update',
            onClick: () => { resetForm(); setIsDialogOpen(true) },
          }}
        />
      ) : (
        <div className="grid gap-4">
          {filteredUpdates.map((update) => (
            <Card key={update.id}>
              <CardContent className="pt-6">
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">v{update.version}</Badge>
                      <Badge variant="outline">Build {update.build_number}</Badge>
                      {update.is_active ? (
                        <Badge variant="default"><CheckCircle className="h-3 w-3 mr-1" />Active</Badge>
                      ) : (
                        <Badge variant="secondary">Inactive</Badge>
                      )}
                      {update.is_mandatory && (
                        <Badge variant="destructive">Mandatory</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        {getPlatformIcon(update.platform)}
                        <span className="capitalize">{update.platform}</span>
                      </span>
                      {update.min_supported_version && (
                        <span>Min Version: {update.min_supported_version}</span>
                      )}
                      <span>Created: {new Date(update.created_at).toLocaleDateString()}</span>
                    </div>
                    {update.release_notes && (
                      <details className="mt-2">
                        <summary className="text-sm font-medium cursor-pointer hover:text-primary">
                          View release notes
                        </summary>
                        <div className="mt-2 p-3 bg-muted rounded-md text-sm">
                          <pre className="whitespace-pre-wrap">{update.release_notes}</pre>
                        </div>
                      </details>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(update.download_url, '_blank')}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(update)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(update.id)}
                      disabled={isDeleting}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

export default AppUpdatesPage
