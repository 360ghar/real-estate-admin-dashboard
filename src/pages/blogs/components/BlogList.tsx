import { useMemo, useState } from 'react'
import { Card } from '@/components/ui/card'
import { DataTable } from '@/components/ui/data-table'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Pagination from '@/components/ui/pagination'
import { LoadingState } from '@/components/ui/loading-state'
import { Link } from 'react-router-dom'
import { useDebounce } from '@/hooks/useDebounce'
import { useGetBlogPostsQuery, useDeleteBlogPostMutation } from '@/store/services/blogsApi'
import { toast } from '@/hooks/use-toast'
import type { BlogPost } from '@/types/blog'
import { Search, RotateCcw, Edit2, Trash2, Eye } from 'lucide-react'
import type { ColumnDef } from '@tanstack/react-table'

const BlogList = () => {
  const [q, setQ] = useState('')
  const dq = useDebounce(q, 300)
  const [categoriesText, setCategoriesText] = useState('')
  const [tagsText, setTagsText] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)

  const params = useMemo(() => {
    const p: any = { page, limit: pageSize }
    if (dq) p.q = dq
    const cats = categoriesText.split(',').map((s) => s.trim()).filter(Boolean)
    const tags = tagsText.split(',').map((s) => s.trim()).filter(Boolean)
    if (cats.length) p.categories = cats
    if (tags.length) p.tags = tags
    return p
  }, [dq, categoriesText, tagsText, page, pageSize])

  const { data, isFetching, error, refetch } = useGetBlogPostsQuery(params)
  const [deleteBlogPost, { isLoading: isDeleting }] = useDeleteBlogPostMutation()

  const handleDeletePost = async (post: BlogPost) => {
    if (!confirm(`Are you sure you want to delete "${post.title}"? This action cannot be undone.`)) {
      return
    }

    try {
      await deleteBlogPost(post.id).unwrap()
      toast({
        title: 'Success',
        description: 'Blog post deleted successfully',
      })
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.data?.detail || 'Failed to delete blog post',
        variant: 'destructive',
      })
    }
  }

  const columns: ColumnDef<BlogPost>[] = [
    {
      accessorKey: 'id',
      header: 'ID',
      cell: ({ row }) => <span className="text-muted-foreground">#{row.original.id}</span>,
    },
    {
      accessorKey: 'title',
      header: 'Title',
      cell: ({ row }) => (
        <div className="space-y-1">
          <Link to={`/blogs/${row.original.slug}`} className="font-medium hover:underline">
            {row.original.title}
          </Link>
          <div className="text-xs text-muted-foreground">{new Date(row.original.created_at).toLocaleString()}</div>
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
      accessorKey: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            asChild
          >
            <Link to={`/blogs/${row.original.slug}`}>
              <Eye className="h-4 w-4" />
            </Link>
          </Button>
          <Button
            variant="outline"
            size="sm"
            asChild
          >
            <Link to={`/blogs/${row.original.slug}/edit`}>
              <Edit2 className="h-4 w-4" />
            </Link>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleDeletePost(row.original)}
            disabled={isDeleting}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ]

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
      </Card>

      <Card className="p-6">
        {isFetching ? (
          <LoadingState type="card" rows={5} />
        ) : error ? (
          <div className="text-center py-8">
            <div className="text-lg font-medium mb-2">Failed to load posts</div>
            <div className="text-muted-foreground mb-4">Please check your connection and try again</div>
            <Button onClick={() => refetch()}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </div>
        ) : !data?.items?.length ? (
          <div className="text-center py-8">
            <div className="text-lg font-medium mb-2">No posts found</div>
            <div className="text-muted-foreground mb-4">Create your first blog post to get started.</div>
            <Link to="/blogs/new">
              <Button>New Post</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground">
              Showing {((page - 1) * pageSize) + 1} to {Math.min(page * pageSize, data.total || 0)} of {data.total || 0} posts
            </div>
            <DataTable columns={columns} data={data.items} />
            {data.total > pageSize && (
              <Pagination page={page} pageSize={pageSize} total={data.total} onChange={setPage} />
            )}
          </div>
        )}
      </Card>
    </div>
  )
}

export default BlogList
