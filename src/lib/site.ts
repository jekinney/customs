// Canonical public site URL, used for SEO (metadataBase, sitemap, JSON-LD).
// Set NEXT_PUBLIC_SITE_URL in prod (e.g. https://120customs.com).
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://120customs.com').replace(/\/$/, '')

/** Make a media/path URL absolute against the site URL (for OG images, JSON-LD). */
export const absoluteUrl = (path?: string | null): string | undefined => {
  if (!path) return undefined
  return path.startsWith('http') ? path : `${SITE_URL}${path}`
}
