import 'server-only'
import { supabaseRest } from './supabase-rest'

export async function observation(id:string) {
 const response=await supabaseRest('observations?id=eq.'+id+'&select=*')
 if(!response.ok)throw Error('Database unavailable')
 return (await response.json())[0]
}
export function publicEvidence(value:any) {
 if(!value)return value
 const {owner_hash,photo_hash,attempt_history,...safe}=value
 return {...safe,review_history:(safe.review_history||[]).map(({reviewer_hash,...event}:any)=>event)}
}
export function publicObservation(row:any){
 const ai=publicEvidence(row.ai_assessment)
 // A different coarse category cannot count as agreement, even if a model says yes.
 return {...row,ai_assessment:ai?.status==='completed'?{...ai,observer_category:row.category,observation_supported:Boolean(ai.observation_supported&&ai.image_relevant&&ai.predicted_category===row.category)}:ai}
}
// Compare-and-swap prevents a concurrent AI retry from erasing a human review.
export async function updateEvidence(id:string, transform:(current:any)=>any) {
 for(let attempt=0;attempt<4;attempt++){
  const row=await observation(id);if(!row)throw Error('Observation not found')
  const current=row.ai_assessment
  const filter=current==null?'ai_assessment=is.null':'ai_assessment=eq.'+encodeURIComponent(JSON.stringify(current))
  const response=await supabaseRest('observations?id=eq.'+id+'&'+filter,{method:'PATCH',headers:{Prefer:'return=representation'},body:JSON.stringify({ai_assessment:transform(current||{})})})
  if(!response.ok)throw Error('Evidence history could not be saved')
  const rows=await response.json();if(rows.length)return rows[0]
 }
 throw Error('Another review changed this record. Please retry.')
}
