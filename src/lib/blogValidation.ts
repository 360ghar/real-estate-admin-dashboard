import { z } from 'zod'

// Blog Post validation schema
export const blogPostSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(500, 'Title must be less than 500 characters'),
  content: z
    .string()
    .min(10, 'Content must be at least 10 characters'),
  excerpt: z
    .string()
    .max(1000, 'Excerpt must be less than 1000 characters')
    .optional()
    .or(z.literal('')),
  cover_image_url: z
    .string()
    .url('Invalid URL format')
    .optional()
    .or(z.literal('')),
  active: z
    .boolean()
    .optional(),
  categories: z
    .array(z.string())
    .optional(),
  tags: z
    .array(z.string())
    .optional(),
})

// Blog Category validation schema
export const blogCategorySchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .max(200, 'Name must be less than 200 characters'),
  description: z
    .string()
    .max(1000, 'Description must be less than 1000 characters')
    .optional()
    .or(z.literal('')),
})

// Blog Tag validation schema
export const blogTagSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .max(100, 'Name must be less than 100 characters'),
})

// Export inferred types
export type BlogPostForm = z.infer<typeof blogPostSchema>
export type BlogCategoryForm = z.infer<typeof blogCategorySchema>
export type BlogTagForm = z.infer<typeof blogTagSchema>
