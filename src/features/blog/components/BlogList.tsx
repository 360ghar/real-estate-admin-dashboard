import { useMemo, useState, useCallback, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { DataTable, SortableHeader } from '@/components/ui/data-table'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import CursorPager from '@/components/ui/cursor-pager'
import { useCursorPagination } from '@/hooks/useCursorPagination'
import { LoadingState } from '@/components/ui/loading-state'
import { EmptyState } from '@/components/ui/empty-state'
import { Link } from 'react-router-dom'
import { useDebounce } from '@/hooks/useDebounce'
import { useGetBlogPostsQuery, useDeleteBlogPostMutation, useUpdateBlogPostMutation } from '@/features/blog/api/blogsApi'
import { toast } from '@/hooks/use-toast'
import type { BlogPost, BlogPostFilters } from '@/types/blog'
import { Search, Edit2, Trash2, Eye, CheckCircle, EyeOff, Download } from 'lucide-react'
import type { ColumnDef } from '@tanstack/react-table'
import { getErrorMessage } from '@/lib/errors'
import { formatDateTime } from '@/lib/format'
import { ConfirmAlertDialog } from '@/components/ui/confirm-alert-dialog'
import { downloadCsv, csvFilename } from '@/lib/csv'

const BlogList = () => {
  const [q, setQ] = useState('')
  const dq = useDebounce(q, 300)
  const [categoriesText, setCategoriesText] = useState('')
  const [tagsText, setTagsText] = useState('')
  const pageSize = 20
  const pager = useCursorPagination()

  const params = useMemo(() => {
    const p: BlogPostFilters = { cursor: pager.cursor, limit: pageSize }
    if (dq) p.q = dq
    const cats = categoriesText.split(',').map((s) => s.trim()).filter(Boolean)
    const tags = tagsText.split(',').map((s) => s.trim()).filter(Boolean)
    if (cats.length) p.categories = cats
    if (tags.length) p.tags = tags
    return p
  }, [dq, categoriesText, tagsText, pager.cursor, pageSize])

  const { data, isFetching, error, refetch } = useGetBlogPostsQuery(params)

  const handleExport = () => {
    const rows = (data?.items ?? []).map((p) => ({
      id: p.id,
      title: p.title,
      slug: p.slug,
      active: p.active,
      created_at: p.created_at,
      categories: (p.categories ?? []).map((c) => c.slug).join('|'),
      tags: (p.tags ?? []).map((t) => t.slug).join('|'),
    }))
    downloadCsv(csvFilename('blog-posts'), rows)
  }

  useEffect(() => { pager.reset() }, [pager, dq, categoriesText, tagsText])
  const [deleteBlogPost, { isLoading: isDeleting }] = useDeleteBlogPostMutation()
  const [updateBlogPost, { isLoading: isTogglingStatus }] = useUpdateBlogPostMutation()

  const handleDeletePost = useCallback(async (post: BlogPost) => {
    try {
      await deleteBlogPost(post.id).unwrap()
      toast({ title: 'Success', description: 'Blog post deleted successfully' })
    } catch (error: unknown) { toast({ title: 'Error', description: getErrorMessage(error, 'Failed to delete blog post'), variant: 'destructive' }) }
  }, [deleteBlogPost])

  const handleToggleStatus = useCallback(async (post: BlogPost) => {
    const nextActive = !post.active
    try {
      await updateBlogPost({ identifier: post.id, data: { active: nextActive } }).unwrap()
      toast({
        title: nextActive ? 'Post published' : 'Post unpublished',
        description: nextActive
          ? 'The blog post is now visible to users.'
          : 'The blog post has been moved back to drafts.',
      })
    } catch (error: unknown) {
      toast({
        title: 'Update failed',
        description: getErrorMessage(error, 'Failed to update publish status'),
        variant: 'destructive',
      })
    }
  }, [updateBlogPost])

  const columns = useMemo<ColumnDef<BlogPost>[]>(() => [
    {
      accessorKey: 'id',
      header: 'ID',
      cell: ({ row }) => <span className="text-muted-foreground">#{row.original.id}</span>,
    },
    {
      accessorKey: 'title',
      header: ({ column }) => <SortableHeader column={column}>Title</SortableHeader>,
      cell: ({ row }) => (
        <div className="space-y-1">
          <Link to={`/blogs/${row.original.slug}`} className="font-medium hover:underline">
            {row.original.title}
          </Link>
          <div className="text-xs text-muted-foreground">{formatDateTime(row.original.created_at)}</div>
        </div>
      ),
    },
    {
      accessorKey: 'categories',
      header: 'Categories',
      cell: ({ row }) => (
        <div className="flex flex-wrap gap-1">
          {(row.original.categories || []).map((c) => (
            <Badge key={c.slug} variant="secondary">{c.name}</Badge>
          ))}
        </div>
      ),
    },
    {
      accessorKey: 'tags',
      header: 'Tags',
      cell: ({ row }) => (
        <div className="flex flex-wrap gap-1">
          {(row.original.tags || []).map((t) => (
            <Badge key={t.slug} variant="outline">{t.name}</Badge>
          ))}
        </div>
      ),
    },
    {
      accessorKey: 'active',
      header: ({ column }) => <SortableHeader column={column}>Status</SortableHeader>,
      cell: ({ row }) => (
        <Badge variant={row.original.active ? 'default' : 'outline'}>
          {row.original.active ? 'Published' : 'Draft'}
        </Badge>
      ),
    },
    {
      accessorKey: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            asChild
            aria-label="View"
          >
            <Link to={`/blogs/${row.original.slug}`}>
              <Eye className="h-4 w-4" />
            </Link>
          </Button>
          <Button
            variant="outline"
            size="sm"
            asChild
            aria-label="Edit"
          >
            <Link to={`/blogs/${row.original.slug}/edit`}>
              <Edit2 className="h-4 w-4" />
            </Link>
          </Button>
          <Button
            variant={row.original.active ? 'outline' : 'default'}
            size="sm"
            onClick={() => { void handleToggleStatus(row.original) }}
            disabled={isTogglingStatus}
          >
            {row.original.active ? (
              <>
                <EyeOff className="h-4 w-4 mr-1" />
                Unpublish
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4 mr-1" />
                Publish
              </>
            )}
          </Button>
          <ConfirmAlertDialog
            title="Delete Blog Post"
            description={`Are you sure you want to delete "${row.original.title}"? This action cannot be undone.`}
            confirmLabel="Delete"
            variant="destructive"
            onConfirm={() => handleDeletePost(row.original)}
          >
            {(openDialog) => (
              <Button variant="outline" size="sm" onClick={openDialog} disabled={isDeleting} aria-label="Delete">
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </ConfirmAlertDialog>
        </div>
      ),
    },
  ], [handleDeletePost, handleToggleStatus, isDeleting, isTogglingStatus])

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="grid gap-3 md:grid-cols-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search posts..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="pl-10"
            />
          </div>
          <Input
            placeholder="Filter by categories (comma separated)"
            value={categoriesText}
            onChange={(e) => setCategoriesText(e.target.value)}
          />
          <Input
            placeholder="Filter by tags (comma separated)"
            value={tagsText}
            onChange={(e) => setTagsText(e.target.value)}
          />
        </div>
        <div className="mt-3 flex justify-end">
          <Button variant="outline" size="sm" onClick={handleExport} disabled={isFetching} className="gap-2">
            <Download className="h-4 w-4" />Export
          </Button>
        </div>
      </Card>

      <Card className="p-6">
        {isFetching ? (
          <LoadingState type="card" rows={5} />
        ) : error ? (
          <EmptyState
            title="Failed to load posts"
            description="Please check your connection and try again"
            action={{
              label: 'Retry',
              onClick: () => { void refetch() },
              variant: 'outline',
            }}
          />
        ) : !data?.items?.length ? (
          <EmptyState
            title="No posts found"
            description="Create your first blog post to get started."
          />
        ) : (
          <div className="space-y-4">
            <DataTable columns={columns} data={data.items} enableSorting />
            <CursorPager
              canPrev={pager.canPrev}
              hasMore={data.has_more}
              loading={isFetching}
              onPrev={pager.prev}
              onNext={() => pager.next(data.next_cursor)}
            />
          </div>
        )}
      </Card>
    </div>
  )
}

export default BlogList
