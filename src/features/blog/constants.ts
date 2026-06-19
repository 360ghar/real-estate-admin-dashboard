import type { BlogPost, BlogPostStatus } from '@/types/blog'

/**
 * Display metadata for each blog lifecycle status.
 * - className: Tailwind classes for a colored Badge variant (overlays the shadcn outline variant).
 * - label: Human-readable label shown in selects, badges, and toasts.
 */
export const BLOG_STATUS_META: Record<
  BlogPostStatus,
  { label: string; className: string }
> = {
  draft: {
    label: 'Draft',
    className:
      'bg-gray-500/10 text-gray-700 border-gray-500/20 dark:text-gray-300 dark:border-gray-400/20',
  },
  published: {
    label: 'Published',
    className:
      'bg-green-500/10 text-green-700 border-green-500/20 dark:text-green-300 dark:border-green-400/20',
  },
  archived: {
    label: 'Archived',
    className:
      'bg-red-500/10 text-red-700 border-red-500/20 dark:text-red-300 dark:border-red-400/20',
  },
  scheduled: {
    label: 'Scheduled',
    className:
      'bg-blue-500/10 text-blue-700 border-blue-500/20 dark:text-blue-300 dark:border-blue-400/20',
  },
}

/**
 * Resolve a post's effective status. Newer posts carry `status`; legacy posts
 * only have the boolean `active` flag, in which case we map it to the closest
 * lifecycle status (published / draft).
 */
export function resolveBlogStatus(post: Pick<BlogPost, 'status' | 'active'>): BlogPostStatus {
  if (post.status && BLOG_STATUS_META[post.status as BlogPostStatus]) {
    return post.status as BlogPostStatus
  }
  return post.active ? 'published' : 'draft'
}

/**
 * Tailwind classes for a status badge. Falls back to the "draft" styling
 * when the status string is unknown to keep the UI defensive.
 */
export function blogStatusBadgeClass(status: string): string {
  return (
    BLOG_STATUS_META[status as BlogPostStatus]?.className ?? BLOG_STATUS_META.draft.className
  )
}

/** Human-readable label for a status. Falls back to a capitalized version of the raw value. */
export function blogStatusLabel(status: string): string {
  const meta = BLOG_STATUS_META[status as BlogPostStatus]
  if (meta) return meta.label
  return status.charAt(0).toUpperCase() + status.slice(1)
}
