import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useGetBlogPostQuery } from '@/store/services/blogsApi'

const BlogDetail = ({ identifier }: { identifier: string }) => {
  const { data, isFetching } = useGetBlogPostQuery(identifier)

  if (isFetching) return <div className="p-6">Loading…</div>
  if (!data) return <div className="p-6">Post not found</div>

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{data.title}</CardTitle>
          <div className="text-sm text-muted-foreground">{new Date(data.created_at).toLocaleString()}</div>
        </CardHeader>
        <CardContent className="space-y-4">
          {data.cover_image_url && (
            <img src={data.cover_image_url} alt={data.title} className="w-full max-h-80 object-cover rounded" />
          )}
          <div className="flex flex-wrap gap-2">
            {(data.categories || []).map((c: any) => (
              <Badge key={c.slug} variant="secondary">{c.name}</Badge>
            ))}
            {(data.tags || []).map((t: any) => (
              <Badge key={t.slug} variant="outline">#{t.name}</Badge>
            ))}
          </div>
          <div className="prose max-w-none">
            <div dangerouslySetInnerHTML={{ __html: data.content }} />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default BlogDetail
