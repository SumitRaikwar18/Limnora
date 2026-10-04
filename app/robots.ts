import type {MetadataRoute} from 'next'
import {siteOrigin,indexable} from '@/lib/site'
export default function robots(): MetadataRoute.Robots {
  return indexable && siteOrigin
    ? {rules:{userAgent:'*',allow:'/',disallow:'/api/'},sitemap:siteOrigin+'/sitemap.xml'}
    : {rules:{userAgent:'*',disallow:'/'}}
}
