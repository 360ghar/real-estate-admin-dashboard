import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { LoadingState } from '@/components/ui/loading-state'
import { toast } from '@/hooks/use-toast'
import { useGetBlogCategoriesQuery, useCreateBlogCategoryMutation, useUpdateBlogCategoryMutation, useDeleteBlogCategoryMutation } from '@/features/blog/api/blogsApi'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { blogCategorySchema, type BlogCategoryForm } from '@/lib/blogValidation'
import { Plus, Edit2, Trash2, RotateCcw, Folder, FileText } from 'lucide-react'

const CategoriesPage = () => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<any>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const navigate = useNavigate()

  const { data: categoriesData, isFetching, error, refetch } = useGetBlogCategoriesQuery({ limit: 100 })
  const [createCategory, { isLoading: isCreating }] = useCreateBlogCategoryMutation()
  const [updateCategory, { isLoading: isUpdating }] = useUpdateBlogCategoryMutation()
  const [deleteCategory, { isLoading: isDeleting }] = useDeleteBlogCategoryMutation()

  const createForm = useForm<BlogCategoryForm>({
    resolver: zodResolver(blogCategorySchema),
    defaultValues: {
      name: '',
      description: '',
    },
  })

  const editForm = useForm<BlogCategoryForm>({
    resolver: zodResolver(blogCategorySchema),
  })

  const handleCreateCategory = async (data: BlogCategoryForm) => {
    try {
      await createCategory(data).unwrap()
      toast({
        title: 'Success',
        description: 'Category created successfully',
      })
      createForm.reset()
      setIsCreateDialogOpen(false)
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.data?.detail || 'Failed to create category',
        variant: 'destructive',
      })
    }
  }

  const handleEditCategory = async (data: BlogCategoryForm) => {
    if (!editingCategory) return

    try {
      await updateCategory({ identifier: editingCategory.id, data }).unwrap()
      toast({
        title: 'Success',
        description: 'Category updated successfully',
      })
      editForm.reset()
      setEditingCategory(null)
      setIsEditDialogOpen(false)
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.data?.detail || 'Failed to update category',
        variant: 'destructive',
      })
    }
  }

  const handleDeleteCategory = async (category: any) => {
    if (!confirm(`Are you sure you want to delete "${category.name}"? This will remove the category from all posts.`)) {
      return
    }

    try {
      await deleteCategory(category.id).unwrap()
      toast({
        title: 'Success',
        description: 'Category deleted successfully',
      })
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.data?.detail || 'Failed to delete category',
        variant: 'destructive',
      })
    }
  }

  const openEditDialog = (category: any) => {
    setEditingCategory(category)
    editForm.reset({
      name: category.name,
      description: category.description || '',
    })
    setIsEditDialogOpen(true)
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Folder className="h-6 w-6 text-primary" />
            </div>
            Blog Categories
          </h1>
          <p className="text-muted-foreground">
            Manage blog categories for organizing content
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
                New Category
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Category</DialogTitle>
              </DialogHeader>
              <Form {...createForm}>
                <form onSubmit={createForm.handleSubmit(handleCreateCategory)} className="space-y-4">
                  <FormField
                    control={createForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Category name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={createForm.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description (Optional)</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Category description" {...field} />
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
                      {isCreating ? 'Creating...' : 'Create Category'}
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
            <div className="text-lg font-medium mb-2">Failed to load categories</div>
            <div className="text-muted-foreground mb-4">Please check your connection and try again</div>
            <Button onClick={() => refetch()}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </div>
        ) : !categoriesData?.items?.length ? (
          <div className="text-center py-8">
            <div className="text-lg font-medium mb-2">No categories found</div>
            <div className="text-muted-foreground mb-4">Create your first category to organize blog posts.</div>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              New Category
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground">
              {categoriesData.total} categories total
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categoriesData.items.map((category: any) => (
                  <TableRow key={category.id}>
                    <TableCell className="font-medium">{category.name}</TableCell>
                    <TableCell>
                      <code className="px-2 py-1 bg-muted rounded text-sm">{category.slug}</code>
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      {category.description || <span className="text-muted-foreground">No description</span>}
                    </TableCell>
                    <TableCell>
                      {new Date(category.created_at || '').toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditDialog(category)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteCategory(category)}
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
            <DialogTitle>Edit Category</DialogTitle>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(handleEditCategory)} className="space-y-4">
              <FormField
                control={editForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Category name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (Optional)</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Category description" {...field} />
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
                  {isUpdating ? 'Updating...' : 'Update Category'}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default CategoriesPage