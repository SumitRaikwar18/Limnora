'use client'

import dynamic from 'next/dynamic'
import {safeAnalyticsEvent} from '@/lib/analytics-privacy'

const Analytics = dynamic(() => import('@vercel/analytics/next').then(module => module.Analytics), {ssr:false})

export function PrivacyAnalytics() {
  return <Analytics beforeSend={safeAnalyticsEvent} />
}
