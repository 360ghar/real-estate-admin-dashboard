export const PROPERTY_TYPES = [
  { value: 'house', label: 'House' },
  { value: 'apartment', label: 'Apartment' },
  { value: 'builder_floor', label: 'Builder Floor' },
  { value: 'room', label: 'Room' },
] as const

export const PROPERTY_PURPOSES = [
  { value: 'buy', label: 'Buy' },
  { value: 'rent', label: 'Rent' },
  { value: 'short_stay', label: 'Short Stay' },
] as const

export const PROPERTY_STATUSES = [
  { value: 'available', label: 'Available' },
  { value: 'rented', label: 'Rented' },
  { value: 'inactive', label: 'Inactive' },
] as const

export const PROPERTY_FEATURES = [
  'gym', 'pool', 'parking', 'security', 'lift', 'power_backup',
  'garden', 'play_area', 'club_house', 'jogging_track', 'rainwater_harvesting',
  'solar_panels', 'intercom', 'cctv', 'fire_safety', 'waste_disposal',
] as const

export const SORT_OPTIONS = [
  { value: 'relevance', label: 'Most Relevant' },
  { value: 'newest', label: 'Newest First' },
  { value: 'price_low', label: 'Price: Low to High' },
  { value: 'price_high', label: 'Price: High to Low' },
  { value: 'distance', label: 'Distance' },
  { value: 'popular', label: 'Most Popular' },
] as const
