import { Link, useNavigate, useParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { FileText, Plus, Folder, Tag } from 'lucide-react'
import ErrorBoundary from '@/components/ErrorBoundary'
import BlogList from './components/BlogList'
import BlogEditor from './components/BlogEditor'
import BlogEdit from './components/BlogEdit'
import BlogDetail from './components/BlogDetail'

type Props = { mode?: 'create' | 'detail' | 'edit' }

const BlogsPage = ({ mode }: Props) => {
  const params = useParams()
  const navigate = useNavigate()

  if (mode === 'create') {
    return <BlogEditor onSuccess={(slug) => navigate(`/blogs/${slug}`)} />
  }
  if (mode === 'detail') {
    const identifier = params.identifier as string
    return <BlogDetail identifier={identifier} />
  }
  if (mode === 'edit') {
    const identifier = params.identifier as string
    return <BlogEdit identifier={identifier} onSuccess={(slug) => navigate(`/blogs/${slug}`)} />
  }

  return (
    <ErrorBoundary>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              Blog Posts
            </h1>
            <p className="text-muted-foreground">
              Manage and publish blog content for the 360Ghar platform
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="secondary" className="px-3 py-1">Admin View</Badge>
            <Button asChild className="gap-2">
              <Link to="/blogs/new">
                <Plus className="h-4 w-4" />
                New Post
              </Link>
            </Button>
          </div>
        </div>

        {/* Quick Management Cards */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="p-6 hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate('/blogs/categories')}>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Folder className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-semibold">Categories</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Organize blog content with categories
                </p>
              </div>
              <div className="text-primary">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-right">
                  <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
              </div>
            </div>
          </Card>

          <Card className="p-6 hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate('/blogs/tags')}>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Tag className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-semibold">Tags</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Label content with descriptive tags
                </p>
              </div>
              <div className="text-primary">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-right">
                  <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
              </div>
            </div>
          </Card>
        </div>

        <BlogList />
      </div>
    </ErrorBoundary>
  )
}

export default BlogsPage
