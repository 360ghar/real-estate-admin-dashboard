import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Compass } from 'lucide-react'

const NotFoundPage = () => (
  <div className="flex min-h-screen flex-col items-center justify-center gap-6 p-6 text-center">
    <div className="space-y-2">
      <p className="text-6xl font-semibold tracking-tight text-muted-foreground">404</p>
      <h1 className="text-2xl font-semibold tracking-tight">Page not found</h1>
      <p className="max-w-md text-muted-foreground">
        The page you’re looking for doesn’t exist or may have moved.
      </p>
    </div>
    <Button asChild className="rounded-cohere-pill">
      <Link to="/dashboard">
        <Compass className="h-4 w-4" />
        Back to dashboard
      </Link>
    </Button>
  </div>
)

export default NotFoundPage
