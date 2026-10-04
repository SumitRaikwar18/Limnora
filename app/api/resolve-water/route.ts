import {NextResponse} from 'next/server'
import {protect} from '@/lib/request-safety'
import {matchesWater} from '@/lib/water-geometry'
import {sourceToken,WaterSource} from '@/lib/water-source'
export const maxDuration=30
const cache=new Map<string,{expires:number;elements:any[]}>()
let unavailableUntil=0
export async function GET(request:Request){
 const denied=protect(request,'water-lookup',12);if(denied)return denied
 const params=new URL(request.url).searchParams,lat=Number(params.get('lat')),lon=Number(params.get('lon'))
 if(!params.has('lat')||!params.has('lon')||!Number.isFinite(lat)||!Number.isFinite(lon)||Math.abs(lat)>90||Math.abs(lon)>180)return NextResponse.json({error:'Valid coordinates required'},{status:400})
 try{
  const key=lat.toFixed(5)+','+lon.toFixed(5),cached=cache.get(key);let elements=cached&&cached.expires>Date.now()?cached.elements:null
  if(!elements){
   if(unavailableUntil>Date.now())return NextResponse.json({error:'Map lookup is cooling down. Retry in 30 seconds or declare an unmapped body.'},{status:503,headers:{'Retry-After':'30'}})
   const query=`[out:json][timeout:15];is_in(${lat},${lon})->.a;area.a["natural"="water"]->.w;(way(pivot.w);relation(pivot.w);way(around:350,${lat},${lon})["natural"="water"];relation(around:350,${lat},${lon})["natural"="water"];way(around:60,${lat},${lon})["waterway"~"^(river|stream|canal)$"];);out tags geom;`
   const response=await fetch('https://overpass-api.de/api/interpreter',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded','Accept':'application/json','User-Agent':'Limnora/1.0 (freshwater citizen science; https://github.com/SumitRaikwar18/Limnora)'},body:new URLSearchParams({data:query}),signal:AbortSignal.timeout(20000)})
   if(!response.ok){if([406,429,502,503,504].includes(response.status))unavailableUntil=Date.now()+30000;throw Error('Map lookup is busy. Retry, or declare an unmapped freshwater body.')}
   const data=await response.json();if(data.remark)throw Error('Map lookup was incomplete. Retry or declare an unmapped body.')
   elements=data.elements||[];if(cache.size>200)cache.clear();cache.set(key,{expires:Date.now()+300000,elements:elements!})
  }
  const matched=elements!.filter(e=>matchesWater(e,lat,lon)).sort((a,b)=>Number(b.type==='relation')-Number(a.type==='relation'))[0]
  if(!matched)return NextResponse.json({matched:false,message:'No inland water geometry matched. You can declare a small or unmapped freshwater body.'})
  const tags=matched.tags||{},kind=['pond','lake','river','stream','reservoir','wetland'].includes(tags.water||tags.waterway)?tags.water||tags.waterway:'unknown'
  const source:WaterSource={source_key:`osm:${matched.type}:${matched.id}`,name:tags['name:en']||tags.name||'',kind,latitude:lat,longitude:lon,source:'osm',freshwater_status:'observer_confirmation_required',source_url:`https://www.openstreetmap.org/${matched.type}/${matched.id}`,retrieved_at:new Date().toISOString()}
  return NextResponse.json({matched:true,...source,source_token:sourceToken(source)})
 }catch(e){return NextResponse.json({error:(e as Error).name==='TimeoutError'?'Map lookup timed out. Retry or declare an unmapped body.':'Map lookup unavailable. Retry or declare an unmapped body.'},{status:503})}
}
