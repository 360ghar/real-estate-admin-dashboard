import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import MultiSelect from '@/components/ui/multi-select'
import ImageUpload from '@/components/common/media/ImageUpload'
import { useGetBlogPostQuery, useUpdateBlogPostMutation, useGetBlogCategoriesQuery, useGetBlogTagsQuery } from '@/features/blog/api/blogsApi'
import { useToast } from '@/hooks/use-toast'
import { blogPostSchema, type BlogPostForm } from '@/lib/blogValidation'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Save } from 'lucide-react'

interface BlogEditProps {
  identifier: string
  onSuccess?: (slug: string) => void
}

const BlogEdit: React.FC<BlogEditProps> = ({ identifier, onSuccess }) => {
  const { toast } = useToast()
  const navigate = useNavigate()
  const { data: post, isFetching: isFetchingPost } = useGetBlogPostQuery(identifier)
  const [updateBlogPost, { isLoading: isUpdating }] = useUpdateBlogPostMutation()

  // Fetch categories and tags
  const { data: categoriesData } = useGetBlogCategoriesQuery({ limit: 100 })
  const { data: tagsData } = useGetBlogTagsQuery({ limit: 100 })

  const form = useForm<BlogPostForm>({
    resolver: zodResolver(blogPostSchema),
    defaultValues: {
      title: '',
      content: '',
      excerpt: '',
      cover_image_url: '',
      categories: [],
      tags: [],
      active: false,
    },
  })

  const { setValue } = form
  const [images, setImages] = useState<string[]>([])

  // Initialize form with post data
  useEffect(() => {
    if (post) {
      setValue('title', post.title)
      setValue('content', post.content)
      setValue('excerpt', post.excerpt || '')
      setValue('cover_image_url', post.cover_image_url || '')
      setValue('categories', post.categories?.map((cat: any) => cat.slug) || [])
      setValue('tags', post.tags?.map((tag: any) => tag.slug) || [])
      setValue('active', !!post.active)
      if (post.cover_image_url) {
        setImages([post.cover_image_url])
      }
    }
  }, [post, setValue])

  useEffect(() => {
    if (images.length) setValue('cover_image_url', images[0] || '')
  }, [images, setValue])

  const onSubmit = async (values: BlogPostForm) => {
    if (!post) return

    try {
      const payload = {
        title: values.title,
        content: values.content,
        excerpt: values.excerpt || undefined,
        cover_image_url: values.cover_image_url || undefined,
        categories: values.categories?.length ? values.categories : undefined,
        tags: values.tags?.length ? values.tags : undefined,
        active: values.active ?? post.active,
      }

      const res = await updateBlogPost({ identifier: post.id, data: payload }).unwrap()
      toast({ title: 'Updated', description: 'Blog post updated successfully' })
      onSuccess?.(res.slug)
    } catch (e: unknown) {
      toast({ title: 'Update failed', description: (e as any)?.data?.detail || 'Please check inputs', variant: 'destructive' })
    }
  }

  // Prepare category and tag options for multi-select
  const categoryOptions = categoriesData?.items.map((cat: any) => ({
    value: cat.slug,
    label: cat.name,
  })) || []

  const tagOptions = tagsData?.items.map((tag: any) => ({
    value: tag.slug,
    label: tag.name,
  })) || []

  if (isFetchingPost) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => navigate('/blogs')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Blog Posts
          </Button>
        </div>
        <Card>
          <CardContent className="p-6">
            <div>Loading post...</div>
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
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Blog Posts
          </Button>
        </div>
        <Card>
          <CardContent className="p-6">
            <div>Post not found</div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => navigate('/blogs')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Blog Posts
          </Button>
          <h1 className="text-xl font-semibold">Edit Blog Post</h1>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Edit Post Details</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Finding Your Dream Home in Mumbai" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="md:col-span-2">
                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Content (HTML or Markdown)</FormLabel>
                      <FormControl>
                        <Textarea rows={12} placeholder="<h1>Introduction</h1>..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="md:col-span-2">
                <FormField
                  control={form.control}
                  name="excerpt"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Excerpt</FormLabel>
                      <FormControl>
                        <Textarea rows={3} placeholder="Short summary (optional)" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="md:col-span-2">
                <FormLabel>Cover Image</FormLabel>
                <ImageUpload
                  value={images}
                  onChange={setImages}
                  multiple={false}
                  primary={images[0] || null}
                  onPrimaryChange={(u) => { setImages(u ? [u] : []) }}
                />
                <div className="mt-2">
                  <FormField
                    control={form.control}
                    name="cover_image_url"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs text-muted-foreground">Cover Image URL</FormLabel>
                        <FormControl>
                          <Input placeholder="https://..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              <div>
                <FormField
                  control={form.control}
                  name="categories"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Categories</FormLabel>
                      <FormControl>
                        <MultiSelect
                          options={categoryOptions}
                          selected={field.value || []}
                          onChange={field.onChange}
                          placeholder="Select categories..."
                          emptyMessage="No categories found. Create some first!"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="md:col-span-2">
                <FormField
                  control={form.control}
                  name="active"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-md border p-4">
                      <div className="space-y-1">
                        <FormLabel>Publish status</FormLabel>
                        <p className="text-sm text-muted-foreground">
                          Turn this on to make the post visible on the site. Turn it off to keep it as a draft.
                        </p>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value ?? false}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
              <div>
                <FormField
                  control={form.control}
                  name="tags"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tags</FormLabel>
                      <FormControl>
                        <MultiSelect
                          options={tagOptions}
                          selected={field.value || []}
                          onChange={field.onChange}
                          placeholder="Select tags..."
                          emptyMessage="No tags found. Create some first!"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="md:col-span-2 flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/blogs')}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isUpdating}>
                  <Save className="h-4 w-4 mr-2" />
                  {isUpdating ? 'Updating…' : 'Update Post'}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}

export default BlogEdit
