export function publicOrigin(value: string | undefined): string | null {
  if (!value?.trim()) return null
  let normalized = value.trim()
  if (!normalized.startsWith('http://') && !normalized.startsWith('https://')) {
    normalized = `https://${normalized}`
  }
  try {
    const url = new URL(normalized)
    if (url.protocol !== 'https:' || url.username || url.password || (url.pathname !== '/' && url.pathname !== '') || url.search || url.hash) return null
    if (url.hostname === 'localhost' || url.hostname.endsWith('.local') || url.hostname === '127.0.0.1' || url.hostname === '[::1]') return null
    return url.origin
  } catch { return null }
}
const detectedOrigin =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL}` : undefined) ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : undefined) ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined)

export const siteOrigin = publicOrigin(detectedOrigin)
export const indexable = Boolean(siteOrigin) && process.env.VERCEL_ENV !== 'preview'
export const siteDescription = 'Record freshwater observations, compare independent image-first AI with human interpretation, and turn uncertainty into traceable reviews and targeted revisits.'
export const socialImage = {url:'/Limnora.png',width:1731,height:909,alt:'Limnora — freshwater evidence, independent AI screening and human review',type:'image/png'}
export function jsonLd(value: unknown): string { return JSON.stringify(value).replace(/</g,'\\u003c') }
