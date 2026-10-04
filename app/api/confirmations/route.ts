import { NextResponse } from 'next/server'
import { createHash,randomUUID } from 'node:crypto'
import { supabaseRest } from '@/lib/supabase-rest'
import { protect } from '@/lib/request-safety'

const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
function identity(request:Request){
 const value=request.headers.get('cookie')?.split(';').map(v=>v.trim()).find(v=>v.startsWith('limnora-reviewer='))?.slice('limnora-reviewer='.length)
 const token=value&&uuid.test(value)?value:randomUUID()
 return {token,hash:createHash('sha256').update(token).digest('hex')}
}
async function count(id:string,hash:string){
 const [total,mine]=await Promise.all([
 supabaseRest('confirmations?observation_id=eq.'+id+'&select=id',{method:'HEAD',headers:{Prefer:'count=exact'}}),
 supabaseRest('confirmations?observation_id=eq.'+id+'&device_id=eq.'+hash+'&select=id&limit=1')])
 if(!total.ok||!mine.ok)throw Error('Community confirmations unavailable')
 const count=Number(total.headers.get('content-range')?.split('/')[1]);if(!Number.isFinite(count))throw Error('Count unavailable')
 return {count,confirmed:(await mine.json()).length>0}
}
function response(data:object,token:string){const r=NextResponse.json(data);r.cookies.set('limnora-reviewer',token,{httpOnly:true,sameSite:'lax',secure:process.env.NODE_ENV==='production',path:'/',maxAge:31536000});return r}
export async function GET(request:Request){
 const id=new URL(request.url).searchParams.get('id')||''
 if(!uuid.test(id))return NextResponse.json({error:'Valid observation ID required'},{status:400})
 try{const {token,hash}=identity(request);return response(await count(id,hash),token)}catch{return NextResponse.json({error:'Could not load confirmations. Try again.'},{status:503})}
}
export async function POST(request:Request){
 const denied=protect(request,'confirmation',12);if(denied)return denied
 const origin=request.headers.get('origin')
 if(origin&&origin!==new URL(request.url).origin)return NextResponse.json({error:'Invalid request origin'},{status:403})
 try{
 const {observationId:id}=await request.json()
 if(typeof id!=='string'||!uuid.test(id))return NextResponse.json({error:'Valid observation ID required'},{status:400})
 const existing=await supabaseRest('observations?id=eq.'+id+'&select=id');if(!existing.ok)throw Error('Database unavailable');if(!(await existing.json()).length)return NextResponse.json({error:'Observation not found'},{status:404})
 const {token,hash}=identity(request)
 const inserted=await supabaseRest('confirmations',{method:'POST',body:JSON.stringify({observation_id:id,device_id:hash})})
 if(!inserted.ok&&inserted.status!==409)throw Error('Confirmation could not be saved')
 return response(await count(id,hash),token)
 }catch{return NextResponse.json({error:'Could not save confirmation. Please retry.'},{status:503})}
}
