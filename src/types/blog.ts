export interface BlogCategory {
  id: number
  name: string
  slug: string
  description?: string | null
  created_at?: string | null
  updated_at?: string | null
}

export interface BlogTag {
  id: number
  name: string
  slug: string
  created_at?: string | null
  updated_at?: string | null
}

export interface BlogPost {
  id: number
  title: string
  slug: string
  content: string
  excerpt?: string | null
  cover_image_url?: string | null
  active: boolean
  categories?: BlogCategory[]
  tags?: BlogTag[]
  author_id?: number
  created_at: string
  updated_at?: string | null
}

// List Response Types — uniform cursor-paginated shape
export interface BlogPostListResponse {
  items: BlogPost[]
  next_cursor: string | null
  has_more: boolean
  limit: number
}

export interface BlogCategoryListResponse {
  items: BlogCategory[]
  next_cursor: string | null
  has_more: boolean
  limit: number
}

export interface BlogTagListResponse {
  items: BlogTag[]
  next_cursor: string | null
  has_more: boolean
  limit: number
}

// Filter Types
export interface BlogPostFilters {
  q?: string
  categories?: string[]
  tags?: string[]
  keywords?: string[]
  cursor?: string | null
  limit?: number
}

export interface BlogCategoryFilters {
  cursor?: string | null
  limit?: number
}

export interface BlogTagFilters {
  cursor?: string | null
  limit?: number
}

// Create/Update Types
export interface BlogPostCreate {
  title: string
  content: string
  excerpt?: string
  cover_image_url?: string
  categories?: string[]
  tags?: string[]
  active?: boolean
}

export interface BlogPostUpdate {
  title?: string
  content?: string
  excerpt?: string
  cover_image_url?: string
  categories?: string[]
  tags?: string[]
  active?: boolean
}

export interface BlogCategoryCreate {
  name: string
  description?: string
}

export interface BlogCategoryUpdate {
  name?: string
  description?: string
}

export interface BlogTagCreate {
  name: string
}

export interface BlogTagUpdate {
  name: string
}

export interface BlogGenerationResult {
  blog: BlogPost
  images: string[]
}
