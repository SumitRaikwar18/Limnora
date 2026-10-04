import { NextResponse } from 'next/server'
import { observation, publicObservation, updateEvidence } from '@/lib/evidence-store'
import { categories, identity, protect, uuid, withIdentity } from '@/lib/request-safety'
export async function POST(request:Request){
 const denied=protect(request,'review',8);if(denied)return denied
 try{
  const body=await request.json()
  if(!uuid.test(String(body.observationId))||!['correction','disagreement','follow_up'].includes(body.type)||typeof body.note!=='string'||body.note.trim().length<10||body.note.length>1000||(body.type==='correction'&&!categories.includes(body.category)))return NextResponse.json({error:'Choose a review type and explain your evidence in 10–1000 characters.'},{status:400})
  const row=await observation(body.observationId);if(!row)return NextResponse.json({error:'Observation not found'},{status:404})
  const {token,hash}=identity(request)
  const event={id:crypto.randomUUID(),type:body.type,note:body.note.trim(),proposed_category:body.type==='correction'?body.category:null,reviewer_hash:hash,created_at:new Date().toISOString(),role:row.ai_assessment?.owner_hash===hash?'original_observer':'community_reviewer'}
  const updated=await updateEvidence(row.id,current=>{
   if((current.review_history||[]).length>=100)throw Error('Review limit reached')
   return {...current,review_history:[...(current.review_history||[]),event]}
  })
  return withIdentity({observation:publicObservation(updated)},token)
 }catch{return NextResponse.json({error:'Review could not be saved. Please retry.'},{status:503})}
}
