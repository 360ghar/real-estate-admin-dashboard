import React, { useState } from 'react'
import { Plus, Edit, Eye, Save, X, FileText } from 'lucide-react'
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
import { useToast } from '@/hooks/use-toast'
import {
  useGetPagesQuery,
  useCreatePageMutation,
  useUpdatePageMutation,
  useDeletePageMutation
} from '@/features/core/api/coreApi'
import type { Page } from '@/types/api'

interface PageFormData {
  unique_name: string
  title: string
  content: string
  format: 'html' | 'markdown'
  custom_config_text?: string
  is_active: boolean
  is_draft: boolean
}

const PagesManagementPage: React.FC = () => {
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<string>('all')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingPage, setEditingPage] = useState<Page | null>(null)
  const [previewMode, setPreviewMode] = useState(false)
  const [formData, setFormData] = useState<PageFormData>({
    unique_name: '',
    title: '',
    content: '',
    format: 'html',
    custom_config_text: '',
    is_active: true,
    is_draft: false,
  })

  // API hooks
  const { data: pagesData, isLoading, refetch } = useGetPagesQuery()
  const [createPage, { isLoading: isCreating }] = useCreatePageMutation()
  const [updatePage, { isLoading: isUpdating }] = useUpdatePageMutation()
  const [deletePage, { isLoading: isDeleting }] = useDeletePageMutation()

  // Filter pages
  const pages = pagesData || []
  const filteredPages = pages.filter((page) => {
    const matchesSearch = page.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      page.unique_name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = filterType === 'all' || page.format === filterType
    return matchesSearch && matchesType
  })

  // Generate slug from title
  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
  }

  const handleInputChange = (field: keyof PageFormData, value: string | boolean) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value }

      // Auto-generate unique_name when title changes (if not editing)
      if (field === 'title' && !editingPage) {
        newData.unique_name = generateSlug(value as string)
      }

      return newData
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      if (editingPage) {
        // Parse custom_config if provided
        const updateData: any = {
          title: formData.title,
          content: formData.content,
          format: formData.format,
          is_active: formData.is_active,
          is_draft: formData.is_draft,
        }
        if (formData.custom_config_text) {
          try { updateData.custom_config = JSON.parse(formData.custom_config_text) } catch {}
        }
        await updatePage({ uniqueName: editingPage.unique_name, data: updateData }).unwrap()
        toast({ title: 'Success', description: 'Page updated successfully' })
      } else {
        const createData: any = {
          unique_name: formData.unique_name,
          title: formData.title,
          content: formData.content,
          format: formData.format,
          is_active: formData.is_active,
          is_draft: formData.is_draft,
        }
        if (formData.custom_config_text) {
          try { createData.custom_config = JSON.parse(formData.custom_config_text) } catch {}
        }
        await createPage(createData).unwrap()
        toast({ title: 'Success', description: 'Page created successfully' })
      }

      setIsDialogOpen(false)
      setEditingPage(null)
      setFormData({ unique_name: '', title: '', content: '', format: 'html', custom_config_text: '', is_active: true, is_draft: false })
      refetch()
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.data?.message || 'Failed to save page',
        variant: 'destructive'
      })
    }
  }

  const handleEdit = (page: Page) => {
    setEditingPage(page)
    setFormData({
      unique_name: page.unique_name,
      title: page.title,
      content: page.content,
      format: page.format,
      custom_config_text: page.custom_config ? JSON.stringify(page.custom_config, null, 2) : '',
      is_active: page.is_active,
      is_draft: page.is_draft,
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (uniqueName: string) => {
    if (!confirm('Are you sure you want to delete this page?')) return

    try {
      await deletePage(uniqueName).unwrap()
      toast({ title: 'Success', description: 'Page deleted successfully' })
      refetch()
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.data?.message || 'Failed to delete page',
        variant: 'destructive'
      })
    }
  }

  const handlePreview = (page: Page) => {
    setEditingPage(page)
    setFormData({
      unique_name: page.unique_name,
      title: page.title,
      content: page.content,
      format: page.format,
      custom_config_text: page.custom_config ? JSON.stringify(page.custom_config, null, 2) : '',
      is_active: page.is_active,
      is_draft: page.is_draft,
    })
    setPreviewMode(true)
  }

  const resetForm = () => {
    setEditingPage(null)
    setFormData({ unique_name: '', title: '', content: '', format: 'html', custom_config_text: '', is_active: true, is_draft: false })
    setPreviewMode(false)
  }

  const getPageTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      information: 'bg-blue-100 text-blue-800',
      faq: 'bg-green-100 text-green-800',
      terms: 'bg-yellow-100 text-yellow-800',
      privacy: 'bg-purple-100 text-purple-800',
      about: 'bg-pink-100 text-pink-800',
      contact: 'bg-indigo-100 text-indigo-800',
      custom: 'bg-muted text-foreground'
    }
    return colors[type] || 'bg-muted text-foreground'
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Pages Management</h1>
          <p className="text-muted-foreground mt-2">Manage dynamic content pages</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              New Page
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingPage ? 'Edit Page' : 'Create New Page'}</DialogTitle>
              <DialogDescription>
                {editingPage
                  ? 'Update the page content and metadata'
                  : 'Create a new content page for the application'
                }
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="Enter page title"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="unique_name">Unique Name *</Label>
                  <Input
                    id="unique_name"
                    value={formData.unique_name}
                    onChange={(e) => handleInputChange('unique_name', e.target.value)}
                    placeholder="privacy-policy"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="format">Format</Label>
                  <Select value={formData.format} onValueChange={(value) => handleInputChange('format', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="html">HTML</SelectItem>
                      <SelectItem value="markdown">Markdown</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">Content *</Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => handleInputChange('content', e.target.value)}
                  placeholder="Enter page content (supports HTML)"
                  rows={10}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="custom_config">Custom Config (JSON)</Label>
                <Textarea
                  id="custom_config"
                  value={formData.custom_config_text}
                  onChange={(e) => handleInputChange('custom_config_text', e.target.value)}
                  placeholder={'{ "show_footer": true }'}
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="is_active">Active</Label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="is_active"
                      checked={formData.is_active}
                      onChange={(e) => handleInputChange('is_active', e.target.checked)}
                      className="h-4 w-4"
                    />
                    <Label htmlFor="is_active">This page is active</Label>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="is_draft">Draft</Label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="is_draft"
                      checked={formData.is_draft}
                      onChange={(e) => handleInputChange('is_draft', e.target.checked)}
                      className="h-4 w-4"
                    />
                    <Label htmlFor="is_draft">Save as draft</Label>
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isCreating || isUpdating}>
                  {isCreating || isUpdating ? 'Saving...' : (editingPage ? 'Update' : 'Create')}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <Input
              placeholder="Search pages..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="information">Information</SelectItem>
                <SelectItem value="faq">FAQ</SelectItem>
                <SelectItem value="terms">Terms</SelectItem>
                <SelectItem value="privacy">Privacy</SelectItem>
                <SelectItem value="about">About</SelectItem>
                <SelectItem value="contact">Contact</SelectItem>
                <SelectItem value="custom">Custom</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Pages List */}
      {isLoading ? (
        <div className="text-center py-8">Loading pages...</div>
      ) : !filteredPages.length ? (
        <EmptyState
          icon={<FileText className="h-10 w-10" />}
          title="No pages found"
          description="Create your first page to get started."
          action={{
            label: 'New Page',
            onClick: () => { resetForm(); setIsDialogOpen(true) },
          }}
        />
      ) : (
        <div className="grid gap-4">
          {filteredPages.map((page) => (
            <Card key={page.unique_name}>
              <CardContent className="pt-6">
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{page.title}</h3>
                      <Badge variant="outline">{page.format}</Badge>
                      {page.is_draft && (
                        <Badge variant="secondary">Draft</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      /{page.unique_name}
                    </p>
                    <p className="text-sm line-clamp-2">
                      {page.content.replace(/<[^>]*>/g, '').substring(0, 150)}...
                    </p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>Status: {page.is_active ? 'Active' : 'Inactive'}</span>
                      <span>Updated: {new Date(page.updated_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePreview(page)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(page)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleDelete(page.unique_name)} disabled={isDeleting}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Preview Dialog */}
      {previewMode && editingPage && (
        <Dialog open={previewMode} onOpenChange={setPreviewMode}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Preview: {formData.title}</DialogTitle>
              <DialogDescription>
                This is how your page will appear to users
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="prose max-w-none">
                <h1>{formData.title}</h1>
                <div
                  dangerouslySetInnerHTML={{
                    __html: formData.content.replace(/\n/g, '<br>')
                  }}
                />
              </div>
              <Alert>
                <AlertDescription>
                  <strong>Details:</strong><br />
                  Unique Name: {formData.unique_name}<br />
                  Format: {formData.format}
                </AlertDescription>
              </Alert>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setPreviewMode(false)}>
                Close Preview
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}

export default PagesManagementPage
