import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import { ArrowLeft, CheckCircle, Clock, Edit2, EyeOff, RotateCcw, Trash2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { LoadingState } from '@/components/ui/loading-state'
import { useToast } from '@/hooks/use-toast'
import { useDeleteBlogPostMutation, useGetBlogPostQuery, useUpdateBlogPostMutation } from '@/store/services/blogsApi'

const isProbablyHtml = (content: string) => {
  const value = content.trim()
  if (!value) return false
  // Treat the content as HTML when it starts with a tag.
  // This keeps Markdown (which typically starts with text or #, *, etc.)
  // rendered via the Markdown renderer, while full HTML snippets like
  // <p>...</p><h2>...</h2> are injected as HTML.
  return value.startsWith('<')
}

const estimateReadingTimeMinutes = (content: string) => {
  const plainText = content
    .replace(/<[^>]+>/g, ' ')
    .replace(/[`*_>#\-]/g, ' ')
  const words = plainText.trim().split(/\s+/).filter(Boolean).length
  if (!words) return null
  return Math.max(1, Math.round(words / 200))
}

const BlogDetail = ({ identifier }: { identifier: string }) => {
  const navigate = useNavigate()
  const { toast } = useToast()
  const { data: post, isFetching, error, refetch } = useGetBlogPostQuery(identifier)
  const [updateBlogPost, { isLoading: isTogglingStatus }] = useUpdateBlogPostMutation()
  const [deleteBlogPost, { isLoading: isDeleting }] = useDeleteBlogPostMutation()

  const readingTime = useMemo(
    () => (post?.content ? estimateReadingTimeMinutes(post.content) : null),
    [post?.content]
  )

  const handleToggleStatus = async () => {
    if (!post) return
    const nextActive = !post.active
    try {
      await updateBlogPost({ identifier: post.id, data: { active: nextActive } }).unwrap()
      toast({
        title: nextActive ? 'Post published' : 'Post unpublished',
        description: nextActive
          ? 'The blog post is now visible to users.'
          : 'The blog post has been moved back to drafts.',
      })
    } catch (e: any) {
      toast({
        title: 'Update failed',
        description: e?.data?.detail || 'Failed to update publish status',
        variant: 'destructive',
      })
    }
  }

  const handleDelete = async () => {
    if (!post) return
    if (!confirm(`Are you sure you want to delete "${post.title}"? This action cannot be undone.`)) {
      return
    }

    try {
      await deleteBlogPost(post.id).unwrap()
      toast({
        title: 'Deleted',
        description: 'Blog post deleted successfully',
      })
      navigate('/blogs')
    } catch (e: any) {
      toast({
        title: 'Delete failed',
        description: e?.data?.detail || 'Failed to delete blog post',
        variant: 'destructive',
      })
    }
  }

  if (isFetching) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => navigate('/blogs')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Blog Posts
          </Button>
        </div>
        <Card>
          <LoadingState type="card" rows={4} />
        </Card>
      </div>
    )
  }

  if (error) {
    const status = (error as any)?.status
    const isNotFound = status === 404

    return (
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => navigate('/blogs')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Blog Posts
          </Button>
        </div>
        <Card>
          <CardContent className="p-6 space-y-4">
            <Alert variant="destructive">
              <AlertTitle>{isNotFound ? 'Post not found' : 'Failed to load post'}</AlertTitle>
              <AlertDescription>
                {isNotFound
                  ? 'The blog post you are looking for does not exist or may have been removed.'
                  : 'There was a problem loading this blog post. Please try again.'}
              </AlertDescription>
            </Alert>
            {!isNotFound && (
              <Button size="sm" variant="outline" onClick={() => refetch()}>
                <RotateCcw className="mr-2 h-4 w-4" />
                Retry
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!post) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => navigate('/blogs')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Blog Posts
          </Button>
        </div>
        <Card>
          <CardContent className="p-6">
            <Alert>
              <AlertTitle>Post not found</AlertTitle>
              <AlertDescription>
                We couldn&apos;t find this blog post. It may have been deleted or the link is incorrect.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    )
  }

  const contentIsHtml = isProbablyHtml(post.content)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => navigate('/blogs')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Blog Posts
          </Button>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>Post ID: #{post.id}</span>
            <span className="h-1 w-1 rounded-full bg-muted-foreground/40" />
            <span>Slug: {post.slug}</span>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={post.active ? 'default' : 'outline'}>
            {post.active ? 'Published' : 'Draft'}
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/blogs/${post.slug}/edit`)}
          >
            <Edit2 className="mr-2 h-4 w-4" />
            Edit
          </Button>
          <Button
            variant={post.active ? 'outline' : 'default'}
            size="sm"
            onClick={handleToggleStatus}
            disabled={isTogglingStatus}
          >
            {post.active ? (
              <>
                <EyeOff className="mr-2 h-4 w-4" />
                Unpublish
              </>
            ) : (
              <>
                <CheckCircle className="mr-2 h-4 w-4" />
                Publish
              </>
            )}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      {!post.active && (
        <Alert>
          <AlertTitle>This post is a draft</AlertTitle>
          <AlertDescription>
            Draft posts are only visible to admins. Publish the post when you&apos;re ready for it to appear on the
            site.
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{post.title}</CardTitle>
          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <span>Created {new Date(post.created_at).toLocaleString()}</span>
            {post.updated_at && (
              <>
                <span className="h-1 w-1 rounded-full bg-muted-foreground/40" />
                <span>Updated {new Date(post.updated_at).toLocaleString()}</span>
              </>
            )}
            {readingTime && (
              <>
                <span className="h-1 w-1 rounded-full bg-muted-foreground/40" />
                <span className="inline-flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  ~{readingTime} min read
                </span>
              </>
            )}
          </div>
          {post.excerpt && (
            <p className="mt-2 text-sm text-muted-foreground">
              {post.excerpt}
            </p>
          )}
        </CardHeader>
        <CardContent className="space-y-6">
          {post.cover_image_url && (
            <img
              src={post.cover_image_url}
              alt={post.title}
              className="w-full max-h-80 rounded object-cover"
            />
          )}
          <div className="flex flex-wrap gap-2">
            {(post.categories || []).map((c: any) => (
              <Badge key={c.slug} variant="secondary">{c.name}</Badge>
            ))}
            {(post.tags || []).map((t: any) => (
              <Badge key={t.slug} variant="outline">#{t.name}</Badge>
            ))}
          </div>
          {contentIsHtml ? (
            <div
              className="prose max-w-none"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
          ) : (
            <ReactMarkdown className="prose max-w-none">
              {post.content}
            </ReactMarkdown>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default BlogDetail
