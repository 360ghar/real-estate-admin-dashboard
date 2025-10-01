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
  categories?: BlogCategory[]
  tags?: BlogTag[]
  author_id?: number
  created_at: string
  updated_at?: string | null
}

// List Response Types
export interface BlogPostListResponse {
  items: BlogPost[]
  total: number
  page: number
  limit: number
  total_pages: number
  has_next: boolean
  has_prev: boolean
}

export interface BlogCategoryListResponse {
  items: BlogCategory[]
  total: number
  page: number
  limit: number
  total_pages: number
  has_next: boolean
  has_prev: boolean
}

export interface BlogTagListResponse {
  items: BlogTag[]
  total: number
  page: number
  limit: number
  total_pages: number
  has_next: boolean
  has_prev: boolean
}

// Filter Types
export interface BlogPostFilters {
  q?: string
  categories?: string[]
  tags?: string[]
  keywords?: string[]
  page?: number
  limit?: number
}

export interface BlogCategoryFilters {
  page?: number
  limit?: number
}

export interface BlogTagFilters {
  page?: number
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
}

export interface BlogPostUpdate {
  title?: string
  content?: string
  excerpt?: string
  cover_image_url?: string
  categories?: string[]
  tags?: string[]
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
