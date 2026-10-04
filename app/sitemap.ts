import type {MetadataRoute} from 'next'
import {siteOrigin,indexable} from '@/lib/site'
export default function sitemap(): MetadataRoute.Sitemap {
  if (!siteOrigin || !indexable) return []
  return ['','/about','/how-it-works','/faq','/privacy'].map(path=>({url:siteOrigin+path,...(!path ? {images:[siteOrigin+'/Limnora.png']} : {})}))
}
