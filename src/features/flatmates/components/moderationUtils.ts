import type { FlatmatesListing } from '../types'

export type PrescreenFlag = NonNullable<FlatmatesListing['ai_prescreen_flags']>[number]

export const getPrescreenFlags = (listing: FlatmatesListing): PrescreenFlag[] => {
  if (Array.isArray(listing.ai_prescreen_flags)) return listing.ai_prescreen_flags
  const rawFlags = listing.listing_preferences?.ai_prescreen_flags
  return Array.isArray(rawFlags) ? (rawFlags as PrescreenFlag[]) : []
}

export const getPrescreenReason = (listing: FlatmatesListing): string | null => {
  const reason = listing.ai_flag_reason ?? listing.listing_preferences?.ai_prescreen_reason
  return typeof reason === 'string' && reason.trim().length > 0 ? reason : null
}

export const getPrescreenResult = (listing: FlatmatesListing): string | null => {
  const result = listing.ai_prescreen_result ?? listing.listing_preferences?.ai_prescreen_result
  return typeof result === 'string' && result.trim().length > 0 ? result : null
}

export const getListingImageUrls = (listing: FlatmatesListing): string[] => {
  const urls = listing.image_urls?.length
    ? listing.image_urls
    : listing.main_image_url
      ? [listing.main_image_url]
      : []
  return Array.from(new Set(urls.filter(Boolean)))
}

export const maskPhone = (phone?: string): string => {
  if (!phone) return 'N/A'
  const trimmed = phone.trim()
  if (trimmed.length <= 4) return '****'
  return `${trimmed.slice(0, 2)}****${trimmed.slice(-2)}`
}
