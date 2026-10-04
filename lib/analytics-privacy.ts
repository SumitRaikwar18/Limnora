const publicPages = new Set(['/', '/about', '/how-it-works', '/faq', '/privacy'])

// Only count public page views. Do not transmit report IDs, search terms or GPS
// query parameters, and do not allow custom events containing field evidence.
export function safeAnalyticsEvent<T extends {type:string;url:string}>(event:T):T|null {
  if (event.type !== 'pageview') return null
  try {
    const url = new URL(event.url)
    if (!publicPages.has(url.pathname)) return null
    url.search = ''
    url.hash = ''
    return {...event,url:url.toString()}
  } catch { return null }
}
