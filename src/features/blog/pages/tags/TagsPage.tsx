import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { LoadingState } from '@/components/ui/loading-state'
import { toast } from '@/hooks/use-toast'
import { useGetBlogTagsQuery, useCreateBlogTagMutation, useUpdateBlogTagMutation, useDeleteBlogTagMutation } from '@/features/blog/api/blogsApi'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { blogTagSchema, type BlogTagForm } from '@/lib/blogValidation'
import { Plus, Edit2, Trash2, RotateCcw, Tag, FileText } from 'lucide-react'

const TagsPage = () => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [editingTag, setEditingTag] = useState<any>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

  const { data: tagsData, isFetching, error, refetch } = useGetBlogTagsQuery({ limit: 100 })
  const [createTag, { isLoading: isCreating }] = useCreateBlogTagMutation()
  const [updateTag, { isLoading: isUpdating }] = useUpdateBlogTagMutation()
  const [deleteTag, { isLoading: isDeleting }] = useDeleteBlogTagMutation()

  const createForm = useForm<BlogTagForm>({
    resolver: zodResolver(blogTagSchema),
    defaultValues: {
      name: '',
    },
  })

  const editForm = useForm<BlogTagForm>({
    resolver: zodResolver(blogTagSchema),
  })

  const handleCreateTag = async (data: BlogTagForm) => {
    try {
      await createTag(data).unwrap()
      toast({
        title: 'Success',
        description: 'Tag created successfully',
      })
      createForm.reset()
      setIsCreateDialogOpen(false)
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.data?.detail || 'Failed to create tag',
        variant: 'destructive',
      })
    }
  }

  const handleEditTag = async (data: BlogTagForm) => {
    if (!editingTag) return

    try {
      await updateTag({ identifier: editingTag.id, data }).unwrap()
      toast({
        title: 'Success',
        description: 'Tag updated successfully',
      })
      editForm.reset()
      setEditingTag(null)
      setIsEditDialogOpen(false)
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.data?.detail || 'Failed to update tag',
        variant: 'destructive',
      })
    }
  }

  const handleDeleteTag = async (tag: any) => {
    if (!confirm(`Are you sure you want to delete "${tag.name}"? This will remove the tag from all posts.`)) {
      return
    }

    try {
      await deleteTag(tag.id).unwrap()
      toast({
        title: 'Success',
        description: 'Tag deleted successfully',
      })
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.data?.detail || 'Failed to delete tag',
        variant: 'destructive',
      })
    }
  }

  const openEditDialog = (tag: any) => {
    setEditingTag(tag)
    editForm.reset({
      name: tag.name,
    })
    setIsEditDialogOpen(true)
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Tag className="h-6 w-6 text-primary" />
            </div>
            Blog Tags
          </h1>
          <p className="text-muted-foreground">
            Manage blog tags for content labeling and organization
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" asChild>
            <Link to="/blogs">
              <FileText className="h-4 w-4 mr-2" />
              Blog Posts
            </Link>
          </Button>
          <Badge variant="secondary" className="px-3 py-1">Admin View</Badge>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                New Tag
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Tag</DialogTitle>
              </DialogHeader>
              <Form {...createForm}>
                <form onSubmit={createForm.handleSubmit(handleCreateTag)} className="space-y-4">
                  <FormField
                    control={createForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Tag name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsCreateDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isCreating}>
                      {isCreating ? 'Creating...' : 'Create Tag'}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card className="p-6">
        {isFetching ? (
          <LoadingState type="card" rows={5} />
        ) : error ? (
          <div className="text-center py-8">
            <div className="text-lg font-medium mb-2">Failed to load tags</div>
            <div className="text-muted-foreground mb-4">Please check your connection and try again</div>
            <Button onClick={() => refetch()}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </div>
        ) : !tagsData?.items?.length ? (
          <div className="text-center py-8">
            <div className="text-lg font-medium mb-2">No tags found</div>
            <div className="text-muted-foreground mb-4">Create your first tag to label blog posts.</div>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              New Tag
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground">
              {tagsData.total} tags total
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tagsData.items.map((tag: any) => (
                  <TableRow key={tag.id}>
                    <TableCell className="font-medium">{tag.name}</TableCell>
                    <TableCell>
                      <code className="px-2 py-1 bg-muted rounded text-sm">{tag.slug}</code>
                    </TableCell>
                    <TableCell>
                      {new Date(tag.created_at || '').toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditDialog(tag)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteTag(tag)}
                          disabled={isDeleting}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Tag</DialogTitle>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(handleEditTag)} className="space-y-4">
              <FormField
                control={editForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Tag name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isUpdating}>
                  {isUpdating ? 'Updating...' : 'Update Tag'}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default TagsPage