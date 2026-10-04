import 'server-only'

export type Readiness = 'configured' | 'missing' | 'invalid'

function looksLikeSupabaseUrl(value: string | undefined) {
  return Boolean(value && /^https:\/\/[a-z0-9-]+\.supabase\.co$/i.test(value))
}

function looksLikeSecret(value: string | undefined) {
  return Boolean(value && value.length >= 24)
}

function looksLikeOpenRouterModel(value: string | undefined) {
  return Boolean(value && /^[a-z0-9._-]+\/[a-z0-9._:-]+$/i.test(value))
}

export function runtimeReadiness() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseSecret = process.env.SUPABASE_SECRET_KEY
  const openRouterKey = process.env.OPENROUTER_API_KEY
  const openRouterModel = process.env.OPENROUTER_MODEL || 'qwen/qwen3.8-27b:free'
  const mapTileOverride = process.env.NEXT_PUBLIC_OSM_TILE_URL

  const checks = {
    supabase_url: looksLikeSupabaseUrl(supabaseUrl) ? 'configured' : supabaseUrl ? 'invalid' : 'missing',
    supabase_server_secret: looksLikeSecret(supabaseSecret) ? 'configured' : supabaseSecret ? 'invalid' : 'missing',
    openrouter_key: looksLikeSecret(openRouterKey) ? 'configured' : openRouterKey ? 'invalid' : 'missing',
    openrouter_model: looksLikeOpenRouterModel(openRouterModel) ? 'configured' : 'invalid',
    map_tile_override: mapTileOverride ? 'configured' : 'missing',
  } satisfies Record<string, Readiness>

  const required = [checks.supabase_url, checks.supabase_server_secret, checks.openrouter_key, checks.openrouter_model]
  return {
    status: required.every(value => value === 'configured') ? 'ok' : 'degraded',
    database: checks.supabase_url === 'configured' && checks.supabase_server_secret === 'configured' ? 'configured' : 'missing_or_invalid',
    ai: checks.openrouter_key === 'configured' && checks.openrouter_model === 'configured' ? 'configured' : 'missing_or_invalid',
    map_tiles: checks.map_tile_override === 'configured' ? 'override_configured' : 'default_open_tiles',
    version: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 12) || process.env.npm_package_version || 'local',
    checks,
  }
}
