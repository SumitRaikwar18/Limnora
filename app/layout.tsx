import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import './globals.css'
import {siteOrigin,indexable,siteDescription,socialImage,jsonLd} from '@/lib/site'

export const metadata: Metadata = {
  metadataBase: new URL(siteOrigin || 'http://localhost:3000'),
  title: {default:'Limnora — Freshwater Evidence & Responsible AI',template:'%s | Limnora'},
  description: siteDescription,
  applicationName: 'Limnora',
  category: 'Citizen science',
  alternates: siteOrigin ? {canonical:siteOrigin} : undefined,
  robots: {index:indexable,follow:indexable},
  openGraph: {type:'website',siteName:'Limnora',title:'Limnora — From Observation to Evidence',description:siteDescription,locale:'en_US',...(siteOrigin ? {url:siteOrigin} : {}),images:[socialImage]},
  twitter: {card:'summary_large_image',title:'Limnora — From Observation to Evidence',description:siteDescription,images:[socialImage]},
  icons: {
    icon: [{url:'/limnora-mark.svg',type:'image/svg+xml'}],
  },
}

export const viewport: Viewport = {
  colorScheme: 'light',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'white' },
    { media: '(prefers-color-scheme: dark)', color: 'black' },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">
        {siteOrigin && <script type="application/ld+json" dangerouslySetInnerHTML={{__html:jsonLd({'@context':'https://schema.org','@type':'WebApplication',name:'Limnora',url:siteOrigin,image:siteOrigin+'/Limnora.png',description:siteDescription,applicationCategory:'EducationalApplication',operatingSystem:'Web browser',inLanguage:'en',featureList:['Freshwater citizen observations','Independent image-first AI screening','Additive human review','Targeted revisits','Researcher evidence briefs'],isAccessibleForFree:true})}} />}
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
