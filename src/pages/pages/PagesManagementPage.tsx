import React, { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Eye, Save, X, FileText } from 'lucide-react'
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
} from '@/store/services/coreApi'

interface PageFormData {
  title: string
  slug: string
  content: string
  page_type: 'information' | 'faq' | 'terms' | 'privacy' | 'about' | 'contact' | 'custom'
  is_published: boolean
  meta_title?: string
  meta_description?: string
  order: number
}

const PagesManagementPage: React.FC = () => {
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<string>('all')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingPage, setEditingPage] = useState<Page | null>(null)
  const [previewMode, setPreviewMode] = useState(false)
  const [formData, setFormData] = useState<PageFormData>({
    title: '',
    slug: '',
    content: '',
    page_type: 'information',
    is_published: false,
    meta_title: '',
    meta_description: '',
    order: 0
  })

  // API hooks
  const { data: pagesData, isLoading, refetch } = useGetPagesQuery()
  const [createPage, { isLoading: isCreating }] = useCreatePageMutation()
  const [updatePage, { isLoading: isUpdating }] = useUpdatePageMutation()
  const [deletePage, { isLoading: isDeleting }] = useDeletePageMutation()

  // Filter pages
  const filteredPages = pagesData?.results?.filter(page => {
    const matchesSearch = page.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         page.slug.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = filterType === 'all' || page.page_type === filterType
    return matchesSearch && matchesType
  }) || []

  // Generate slug from title
  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
  }

  const handleInputChange = (field: keyof PageFormData, value: string | boolean | number) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value }

      // Auto-generate slug when title changes
      if (field === 'title' && !editingPage) {
        newData.slug = generateSlug(value as string)
      }

      // Auto-generate meta title if not set
      if (field === 'title' && !newData.meta_title) {
        newData.meta_title = value as string
      }

      return newData
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      if (editingPage) {
        await updatePage({ id: editingPage.id, ...formData }).unwrap()
        toast({ title: 'Success', description: 'Page updated successfully' })
      } else {
        await createPage(formData).unwrap()
        toast({ title: 'Success', description: 'Page created successfully' })
      }

      setIsDialogOpen(false)
      setEditingPage(null)
      setFormData({
        title: '',
        slug: '',
        content: '',
        page_type: 'information',
        is_published: false,
        meta_title: '',
        meta_description: '',
        order: 0
      })
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
      title: page.title,
      slug: page.slug,
      content: page.content,
      page_type: page.page_type,
      is_published: page.is_published,
      meta_title: page.meta_title || '',
      meta_description: page.meta_description || '',
      order: page.order
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (pageId: number) => {
    if (!confirm('Are you sure you want to delete this page?')) return

    try {
      await deletePage(pageId).unwrap()
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
      title: page.title,
      slug: page.slug,
      content: page.content,
      page_type: page.page_type,
      is_published: page.is_published,
      meta_title: page.meta_title || '',
      meta_description: page.meta_description || '',
      order: page.order
    })
    setPreviewMode(true)
  }

  const resetForm = () => {
    setEditingPage(null)
    setFormData({
      title: '',
      slug: '',
      content: '',
      page_type: 'information',
      is_published: false,
      meta_title: '',
      meta_description: '',
      order: 0
    })
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
                  <Label htmlFor="slug">Slug *</Label>
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) => handleInputChange('slug', e.target.value)}
                    placeholder="page-url-slug"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="page_type">Page Type</Label>
                  <Select
                    value={formData.page_type}
                    onValueChange={(value) => handleInputChange('page_type', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="information">Information</SelectItem>
                      <SelectItem value="faq">FAQ</SelectItem>
                      <SelectItem value="terms">Terms & Conditions</SelectItem>
                      <SelectItem value="privacy">Privacy Policy</SelectItem>
                      <SelectItem value="about">About Us</SelectItem>
                      <SelectItem value="contact">Contact</SelectItem>
                      <SelectItem value="custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="order">Display Order</Label>
                  <Input
                    id="order"
                    type="number"
                    value={formData.order}
                    onChange={(e) => handleInputChange('order', parseInt(e.target.value) || 0)}
                    min="0"
                  />
                </div>
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

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="meta_title">Meta Title</Label>
                  <Input
                    id="meta_title"
                    value={formData.meta_title}
                    onChange={(e) => handleInputChange('meta_title', e.target.value)}
                    placeholder="SEO title (optional)"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="meta_description">Meta Description</Label>
                  <Textarea
                    id="meta_description"
                    value={formData.meta_description}
                    onChange={(e) => handleInputChange('meta_description', e.target.value)}
                    placeholder="SEO description (optional)"
                    rows={2}
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="is_published"
                  checked={formData.is_published}
                  onChange={(e) => handleInputChange('is_published', e.target.checked)}
                  className="h-4 w-4"
                />
                <Label htmlFor="is_published">Publish this page</Label>
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
            <Card key={page.id}>
              <CardContent className="pt-6">
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{page.title}</h3>
                      <Badge className={getPageTypeColor(page.page_type)}>
                        {page.page_type}
                      </Badge>
                      {!page.is_published && (
                        <Badge variant="secondary">Draft</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      /{page.slug}
                    </p>
                    <p className="text-sm line-clamp-2">
                      {page.content.replace(/<[^>]*>/g, '').substring(0, 150)}...
                    </p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>Order: {page.order}</span>
                      {page.meta_title && (
                        <span>Meta: {page.meta_title}</span>
                      )}
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
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(page.id)}
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
                  <strong>Meta Information:</strong><br />
                  Title: {formData.meta_title || formData.title}<br />
                  Description: {formData.meta_description || 'No meta description set'}
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
