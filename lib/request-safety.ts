import 'server-only'
import { createHash, randomUUID } from 'node:crypto'
import { NextResponse } from 'next/server'

export const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
export const categories = ['algae','hyacinth','grass','litter','fish','wildlife','flooding','unusual']
export function identity(request: Request) {
 const candidate = request.headers.get('cookie')?.split(';').map(v=>v.trim()).find(v=>v.startsWith('limnora-reviewer='))?.slice(17)
 const token = candidate && uuid.test(candidate) ? candidate : randomUUID()
 return { token, hash: createHash('sha256').update(token).digest('hex') }
}
export function withIdentity(data: unknown, token: string, status=200) {
 const response=NextResponse.json(data,{status})
 response.cookies.set('limnora-reviewer',token,{httpOnly:true,sameSite:'lax',secure:process.env.NODE_ENV==='production',path:'/',maxAge:31536000})
 return response
}
const requests = new Map<string,{count:number;until:number}>()
export function protect(request:Request, action:string, limit=10) {
 const origin=request.headers.get('origin')
 if(origin && origin!==new URL(request.url).origin) return NextResponse.json({error:'Invalid request origin'},{status:403})
 // Per-process abuse protection. Multi-instance deployments need a shared limiter.
 const key=action+':'+(request.headers.get('x-forwarded-for')?.split(',')[0]||'local')
 const now=Date.now(); const item=requests.get(key)
 if(!item||item.until<now){requests.set(key,{count:1,until:now+60000});return null}
 if(item.count++>=limit)return NextResponse.json({error:'Too many requests. Wait a minute and retry.'},{status:429,headers:{'Retry-After':'60'}})
 if(requests.size>5000)for(const [k,v] of requests)if(v.until<now)requests.delete(k)
 return null
}
