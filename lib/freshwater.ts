export const bodyKinds = ['pond', 'lake', 'stream', 'river', 'reservoir', 'wetland', 'unknown'] as const
export const fieldOptions = {
  flow: ['Unknown', 'Still', 'Flowing', 'Dry'],
  colour: ['Unknown', 'Clear / colourless', 'Green', 'Brown / muddy', 'Other'],
  clarity: ['Unknown', 'Bottom visible', 'Cloudy', 'Opaque'],
  bankLitter: ['Unknown', 'None seen', 'Some', 'Widespread'],
  aquaticLife: ['Unknown', 'Living aquatic life seen', 'None seen', 'Dead fish seen'],
  odour: ['Unknown', 'None noticed', 'Unusual odour noticed from bank'],
} as const
export type FieldContext = {[K in keyof typeof fieldOptions]: string}
export const emptyContext: FieldContext = {flow:'Unknown',colour:'Unknown',clarity:'Unknown',bankLitter:'Unknown',aquaticLife:'Unknown',odour:'Unknown'}
export function parseContext(value: unknown): FieldContext {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw Error('Invalid field context')
  const result = {...emptyContext}
  for (const key of Object.keys(fieldOptions) as (keyof FieldContext)[]) {
    const selected = (value as Record<string, unknown>)[key] ?? 'Unknown'
    if (!(fieldOptions[key] as readonly unknown[]).includes(selected)) throw Error('Invalid field context: '+key)
    result[key] = selected as string
  }
  return result
}
export const fieldLabels: Record<keyof FieldContext,string> = {flow:'Water movement',colour:'Visible water colour',clarity:'Visible clarity',bankLitter:'Litter on the bank',aquaticLife:'Aquatic life',odour:'Odour noticed naturally'}
export const guidance: Record<string,{meaning:string;next:string;source:string}> = {
  hyacinth:{meaning:'Floating vegetation is relevant to habitat and access to open water. Species and ecological effects need field review.',next:'From the same safe bank, photograph the floating plants and open water again. Record the visible coverage.',source:'https://www.oneaquahealth.eu/'},
  algae:{meaning:'A surface film or green appearance is a reason to document change. A photograph cannot establish toxicity or the cause.',next:'Record whether the surface looks like a film or separate floating leaves; take a closer photo from the bank without touching water.',source:'https://www.oneaquahealth.eu/'},
  grass:{meaning:'Aquatic vegetation can be part of a functioning habitat. Its presence alone does not establish degradation.',next:'Document whether plants are rooted at the bank or floating, and whether their visible coverage changes.',source:'https://www.oneaquahealth.eu/'},
  litter:{meaning:'Bank and water litter is relevant to stewardship of shared freshwater habitats and public spaces.',next:'Document the type and extent of litter from public land. Seek a local maintenance review if appropriate.',source:'https://www.oneaquahealth.eu/'},
  fish:{meaning:'Reported dead fish need field verification. A photograph does not establish the cause or water safety.',next:'Record the approximate number and location from the bank and seek review by a local environmental authority.',source:'https://www.oneaquahealth.eu/'},
  wildlife:{meaning:'Aquatic life observations add biodiversity context. Not seeing an animal in one visit is not evidence of its absence.',next:'Record what was visible and the observation conditions without disturbing animals.',source:'https://www.oneaquahealth.eu/'},
  flooding:{meaning:'Water extent can affect habitats, access and shared community spaces. This report is not a flood forecast.',next:'Record visible water extent from a safe accessible place; do not approach moving floodwater.',source:'https://www.oneaquahealth.eu/'},
  unusual:{meaning:'An unusual appearance is an observation to investigate, not a pollution diagnosis.',next:'Add a safe-bank photo, colour/clarity observations, and the time of your visit.',source:'https://www.oneaquahealth.eu/'},
}
export function evidenceState(report:any) {
  const ai=report.ai_assessment||{}, reviews=ai.review_history||[]
  if(reviews.some((r:any)=>r.type==='correction'||r.type==='disagreement') || (ai.status==='completed'&&(!ai.observation_supported||ai.uncertainty==='high'))) return 'Disputed interpretation'
  if(ai.status!=='completed'||ai.unavailable)return 'Awaiting screening / review'
  if(reviews.some((r:any)=>r.type==='follow_up'))return 'Field context added'
  return 'Screened · human review open'
}
export function bodySummary(reports:any[]) {
  const ordered=[...reports].sort((a,b)=>Date.parse(b.observed_at||b.created_at)-Date.parse(a.observed_at||a.created_at))
  const reasons=ordered.flatMap(r=>{
    const ai=r.ai_assessment||{}, result:{report:any;reason:string}[]=[]
    if(evidenceState(r)==='Disputed interpretation')result.push({report:r,reason:'Observer, AI or community interpretations differ.'})
    else if(ai.status!=='completed'||ai.unavailable)result.push({report:r,reason:'Photo still needs screening or human review.'})
    else if(!r.field_context||Object.values(r.field_context).every(v=>v==='Unknown'))result.push({report:r,reason:'Field conditions are unknown; a revisit would add context.'})
    return result
  })
  return {ordered,reasons,last:ordered[0],disputed:ordered.filter(r=>evidenceState(r)==='Disputed interpretation').length,screened:ordered.filter(r=>r.ai_assessment?.status==='completed').length}
}

export function revisitTask(report:any) {
  const ai=report.ai_assessment||{}
  if(ai.image_relevant===false)return {reason:'Image relevance is uncertain',question:'Photograph the actual water surface and adjacent bank from a safe public place.',checklist:['Include water and shoreline','Use an original field photograph','Record the actual visit time']}
  const disputed=evidenceState(report)==='Disputed interpretation'
  return {reason:disputed?'Interpretations differ':'Add comparable field evidence',question:ai.follow_up||guidance[report.category]?.next||guidance.unusual.next,checklist:['Use the same safe bank and a similar view when possible','Record Unknown rather than guessing','Describe differences in angle, lighting or water level; never enter the water']}
}

// Public handoff uses an allowlist rather than exporting internal assessment state.
export function evidenceBrief(body:any,reports:any[]) {
  const summary=bodySummary(reports)
  return {schema:'limnora-evidence-brief-v1',generated_at:new Date().toISOString(),scope:'Loaded observations only; not a complete environmental survey',water_body:{id:body?.id,name:body?.name,type:body?.type,source_key:body?.source_key,source_metadata:body?.source_metadata},limitations:['Citizen statements and AI interpretations are not laboratory measurements','Browser corroboration does not verify unique people or photo authenticity','Photographs do not establish toxicity, pathogens or water safety'],observations:summary.ordered.map(r=>({id:r.id,observed_at:r.observed_at||r.created_at,latitude:r.latitude,longitude:r.longitude,photo_url:r.photo_url,observer_category:r.category,description:r.description,coverage_level:r.coverage_level,field_context:r.field_context,state:evidenceState(r),parent_id:r.ai_assessment?.parent_id,screening:r.ai_assessment?.status==='completed'?{model:r.ai_assessment.model,prompt_version:r.ai_assessment.prompt_version,assessed_at:r.ai_assessment.assessed_at,predicted_category:r.ai_assessment.predicted_category,evidence:r.ai_assessment.evidence,uncertainty:r.ai_assessment.uncertainty}:null,next_observation:revisitTask(r)}))}
}
