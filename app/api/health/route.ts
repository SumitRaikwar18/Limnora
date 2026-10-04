import { NextResponse } from 'next/server'
import { runtimeReadiness } from '@/lib/config'

export async function GET() {
  const readiness = runtimeReadiness()
  return NextResponse.json(readiness, {
    status: readiness.status === 'ok' ? 200 : 503,
    headers: { 'Cache-Control': 'no-store' },
  })
}
