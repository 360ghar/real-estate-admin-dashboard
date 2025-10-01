import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import MultiSelect from '@/components/ui/multi-select'
import ImageUpload from '@/components/media/ImageUpload'
import { useCreateBlogPostMutation, useGetBlogCategoriesQuery, useGetBlogTagsQuery } from '@/store/services/blogsApi'
import { useToast } from '@/hooks/use-toast'
import { blogPostSchema, type BlogPostForm } from '@/lib/blogValidation'

const BlogEditor = ({ onSuccess }: { onSuccess?: (slug: string) => void }) => {
  const { toast } = useToast()
  const [createBlogPost, createState] = useCreateBlogPostMutation()

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
    },
  })

  const { setValue, watch } = form
  const [images, setImages] = useState<string[]>([])

  useEffect(() => {
    if (images.length) setValue('cover_image_url', images[0] || '')
  }, [images, setValue])

  const onSubmit = async (values: BlogPostForm) => {
    try {
      const payload = {
        title: values.title,
        content: values.content,
        excerpt: values.excerpt || undefined,
        cover_image_url: values.cover_image_url || undefined,
        categories: values.categories?.length ? values.categories : undefined,
        tags: values.tags?.length ? values.tags : undefined,
      }

      const res = await createBlogPost(payload).unwrap()
      toast({ title: 'Created', description: 'Blog post created successfully' })
      onSuccess?.(res.slug)
    } catch (e: any) {
      toast({ title: 'Save failed', description: e?.data?.detail || 'Please check inputs', variant: 'destructive' })
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

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Create Blog Post</h1>
      <Card>
        <CardHeader>
          <CardTitle>Post Details</CardTitle>
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
                <ImageUpload value={images} onChange={setImages} multiple={false} primary={images[0] || null} onPrimaryChange={(u) => { setImages(u ? [u] : []) }} />
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
              <div className="md:col-span-2 flex justify-end">
                <Button type="submit" disabled={createState.isLoading}>
                  {createState.isLoading ? 'Creating…' : 'Create Post'}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}

export default BlogEditor
