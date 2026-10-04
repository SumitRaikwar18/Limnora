import { NextResponse } from 'next/server'
import { supabaseRest,supabaseFetch,url } from '@/lib/supabase-rest'
import { preparePhoto } from '@/lib/photo'
import { categories, identity, protect, uuid, withIdentity } from '@/lib/request-safety'
import { observation, publicObservation } from '@/lib/evidence-store'
import {bodyKinds,parseContext} from '@/lib/freshwater'
import {readSource} from '@/lib/water-source'
import {observationQuery} from '@/lib/observation-query'
export async function GET(request:Request){
 let query;try{query=observationQuery(new URL(request.url).searchParams)}catch(e){return NextResponse.json({error:(e as Error).message},{status:400})}
 try{
 const r=await supabaseRest(query.path)
 if(!r.ok)throw Error('Database tables unavailable')
 const rows=await r.json(),hasMore=rows.length>query.limit
 return NextResponse.json({observations:rows.slice(0,query.limit).map((row:any)=>{const {confirmations,water_bodies,...rest}=row;return {...publicObservation(rest),water_body:water_bodies,confirmation_count:confirmations?.[0]?.count??0}}),limit:query.limit,offset:query.offset,hasMore,nextOffset:hasMore?query.offset+query.limit:null},{headers:{'Cache-Control':'no-store'}})
 }catch{return NextResponse.json({error:'Database connection unavailable. Please retry.'},{status:503})}}
export async function POST(request:Request){
 const denied=protect(request,'upload',6);if(denied)return denied
 if(Number(request.headers.get('content-length'))>6*1024*1024)return NextResponse.json({error:'Upload too large'},{status:413})
 let uploadedPath=''
 try{
 const form=await request.formData(),file=form.get('photo')
 const latitude=Number(form.get('latitude')),longitude=Number(form.get('longitude'))
 const category=String(form.get('category')||''),name=String(form.get('name')||'').trim().slice(0,120)||'Unnamed water body'
 if(!form.has('latitude')||!form.has('longitude')||!Number.isFinite(latitude)||Math.abs(latitude)>90||!Number.isFinite(longitude)||Math.abs(longitude)>180||!categories.includes(category))return NextResponse.json({error:'Invalid location or category'},{status:400})
 if(form.get('consent')!=='true')return NextResponse.json({error:'Please confirm photo rights and public/AI processing consent.'},{status:400})
 if(form.get('freshwaterAttested')!=='true')return NextResponse.json({error:'Confirm this is an inland freshwater observation, not sea or brackish water.'},{status:400})
 let fieldContext
 try{fieldContext=parseContext(JSON.parse(String(form.get('fieldContext')||'{}')))}catch{return NextResponse.json({error:'Choose valid field conditions, or Unknown.'},{status:400})}
 const kind=String(form.get('bodyKind')||'unknown')
 if(!(bodyKinds as readonly string[]).includes(kind))return NextResponse.json({error:'Choose a valid water-body kind.'},{status:400})
 const observed=new Date(String(form.get('observedAt')||''))
 if(!Number.isFinite(observed.getTime())||observed.getTime()>Date.now()+300000||observed.getFullYear()<2000)return NextResponse.json({error:'Choose a valid observation date, not in the future.'},{status:400})
 const coverage=String(form.get('coverage')||'Unknown')
 if(!['Unknown','Less than 25%','25–50%','More than 50%'].includes(coverage))return NextResponse.json({error:'Invalid coverage'},{status:400})
 if(!(file instanceof File))return NextResponse.json({error:'Photo evidence required'},{status:400})
 let photo;try{photo=await preparePhoto(file)}catch{return NextResponse.json({error:'Use a readable single JPEG, PNG or WebP photo (100px minimum, 25 megapixels maximum, under 5 MB).'},{status:400})}
 const duplicate=await supabaseRest('observations?ai_assessment->>photo_hash=eq.'+photo.hash+'&select=id&limit=1')
 if(!duplicate.ok)throw Error('Duplicate check unavailable')
 const same=(await duplicate.json())[0]
 if(same)return NextResponse.json({error:'This photo is already submitted. Add a new photo from your visit, or review the existing record.',existingId:same.id},{status:409})
 const parentId=String(form.get('parentId')||'')
 const parent=parentId&&uuid.test(parentId)?await observation(parentId):null
 if(parentId&&!parent)return NextResponse.json({error:'Follow-up observation not found'},{status:400})
 let bodyId=String(form.get('waterBodyId')||parent?.water_body_id||'')
 let waterBody
 if(bodyId){
  if(!uuid.test(bodyId))return NextResponse.json({error:'Invalid water body'},{status:400})
  const response=await supabaseRest('water_bodies?id=eq.'+bodyId+'&select=*');if(!response.ok)throw Error('Water-body lookup unavailable')
  waterBody=(await response.json())[0];if(!waterBody)return NextResponse.json({error:'Water body not found'},{status:400})
  if(parent?.water_body_id&&parent.water_body_id!==bodyId)return NextResponse.json({error:'Follow-up must reference the same water body'},{status:400})
 }else{
  const token=String(form.get('sourceToken')||'')
  const source=token?readSource(token,latitude,longitude):null
  if(token&&!source)return NextResponse.json({error:'Map selection expired. Select the water body again.'},{status:400})
  if(!source&&form.get('declaredBody')!=='true')return NextResponse.json({error:'Select mapped water or explicitly declare an unmapped freshwater body.'},{status:400})
  const metadata=source?{source:'osm',source_url:source.source_url,map_name:source.name,name_source:source.name===name?'osm':'observer',freshwater_status:'observer_declared',retrieved_at:source.retrieved_at}:{source:'observer',name_source:'observer',freshwater_status:'observer_declared'}
  const response=await supabaseRest('water_bodies'+(source?'?on_conflict=source_key':''),{method:'POST',headers:{Prefer:'return=representation'+(source?',resolution=ignore-duplicates':'')},body:JSON.stringify({name:source?.name||name,type:source?.kind!=='unknown'&&source?.kind?source.kind:kind,latitude,longitude,source_key:source?.source_key||null,source_metadata:metadata,place_label:source?'OSM inland water geometry; freshwater declared by observer':'Unmapped freshwater body declared by observer'})})
  if(!response.ok)throw Error('Water-body record could not be created')
  waterBody=(await response.json())[0]
  if(!waterBody&&source){const existing=await supabaseRest('water_bodies?source_key=eq.'+encodeURIComponent(source.source_key)+'&select=*');if(!existing.ok)throw Error('Water-body lookup unavailable');waterBody=(await existing.json())[0]}
  if(!waterBody)throw Error('Water-body record unavailable');bodyId=waterBody.id
 }
 uploadedPath=crypto.randomUUID()+'.jpg'
 const upload=await supabaseFetch('/storage/v1/object/observation-photos/'+uploadedPath,{method:'POST',headers:{'Content-Type':'image/jpeg'},body:new Uint8Array(photo.bytes)})
 if(!upload.ok)throw Error('Photo storage unavailable')
 const {token,hash}=identity(request)
 const r=await supabaseRest('observations',{method:'POST',headers:{Prefer:'return=representation'},body:JSON.stringify({water_body_id:bodyId,latitude,longitude,category,description:(waterBody.name+': '+String(form.get('description')||'')).slice(0,2000),photo_url:url+'/storage/v1/object/public/observation-photos/'+uploadedPath,coverage_level:coverage,water_color:fieldContext.colour,smell_level:fieldContext.odour,field_context:fieldContext,freshwater_attested:true,observed_at:observed.toISOString(),ai_assessment:{status:'pending',owner_hash:hash,photo_hash:photo.hash,parent_id:parentId||null,review_history:[],assessment_history:[],photo_processing:'Re-encoded JPEG; EXIF removed'},privacy_precision:'public_water_body',verification_status:'community_review'})})
 if(!r.ok)throw Error('Report could not be saved')
 const row=(await r.json())[0];uploadedPath=''
 return withIdentity({observation:{...publicObservation(row),water_body:waterBody}},token)
 }catch{
 if(uploadedPath){
  // An insert timeout is ambiguous: never delete evidence already referenced by a saved report.
  const linked=await supabaseRest('observations?photo_url=eq.'+encodeURIComponent(url+'/storage/v1/object/public/observation-photos/'+uploadedPath)+'&select=id&limit=1').catch(()=>null)
  if(linked?.ok&&!(await linked.json()).length)await supabaseFetch('/storage/v1/object/observation-photos/'+uploadedPath,{method:'DELETE'}).catch(()=>undefined)
 }
 return NextResponse.json({error:'Report could not be saved. Check connectivity and retry.'},{status:503})
 }
}
