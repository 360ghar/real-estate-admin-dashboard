import { z } from 'zod'

export const propertySchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().optional(),
  property_type: z.enum(['apartment', 'house', 'builder_floor', 'room'], {
    required_error: 'Property type is required',
    invalid_type_error: 'Select a valid property type'
  }),
  purpose: z.enum(['buy', 'rent', 'short_stay'], {
    required_error: 'Purpose is required',
    invalid_type_error: 'Select a valid purpose'
  }),
  status: z.enum(['available', 'sold', 'rented', 'under_offer', 'maintenance']).optional(),
  base_price: z.coerce.number().min(1, "Price is required"),

  // Location
  city: z.string().min(1, "City is required"),
  locality: z.string().min(1, "Locality is required"),
  address: z.string().optional(), // This maps to full_address or used for autocomplete
  latitude: z.coerce.number().optional(),
  longitude: z.coerce.number().optional(),
  pincode: z.string().optional(),

  // Details
  area_sqft: z.coerce.number().min(1, "Area is required"),
  bedrooms: z.coerce.number().min(0).default(0),
  bathrooms: z.coerce.number().min(0).default(0),
  balconies: z.coerce.number().min(0).default(0),
  parking_spaces: z.coerce.number().min(0).default(0),
  floor_number: z.coerce.number().min(0).default(0),
  total_floors: z.coerce.number().min(1).default(1),
  age_of_property: z.coerce.number().min(0).default(0),
  max_occupancy: z.coerce.number().min(1).default(1),
  minimum_stay_days: z.coerce.number().min(1).default(1),

  // Features & Amenities
  amenity_ids: z.array(z.number()).default([]),
  features: z.array(z.string()).default([]),

  // Availability
  is_available: z.boolean().default(true),
  available_from: z.string().optional(), // YYYY-MM-DD

  // Owner (Admin/Agent only)
  owner_id: z.coerce.number().optional(),
  owner_name: z.string().optional(),
  owner_contact: z.string().optional(),

  // Media (Handled separately mostly, but we keep track of main image)
  main_image_url: z.string().optional(),
})

export type PropertyFormValues = z.infer<typeof propertySchema>
