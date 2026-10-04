import {readFileSync,writeFileSync} from 'node:fs'
import assert from 'node:assert/strict'
const manifestPath=process.argv[2]
if(!manifestPath)throw Error('Usage: node scripts/evaluate-freshwater.mjs evaluation/manifest.json [output.json]')
const manifest=JSON.parse(readFileSync(manifestPath,'utf8'))
assert(typeof manifest.label_source==='string'&&manifest.label_source.trim(),'Record who supplied the reference labels')
assert(Array.isArray(manifest.cases)&&manifest.cases.length,'Add permissioned original field-photo cases; empty evaluation is not a result')
const base=process.env.LIMNORA_BASE_URL||'http://localhost:3000'
const results=[]
const categories=['hyacinth','algae','grass','litter','fish','wildlife','flooding','unusual','needs_review']
for(const entry of manifest.cases){
 assert(entry.permissioned_original===true,'Only permissioned original photos belong in field evaluation')
 assert(categories.includes(entry.reference_category),'Invalid reference category')
 assert(typeof entry.ambiguous==='boolean','Record whether this case is ambiguous')
 assert(typeof entry.expected_relevance==='boolean','Record expected image relevance')
 assert(/^[0-9a-f-]{36}$/i.test(entry.observation_id),'Invalid observation ID')
 const response=await fetch(base+'/api/observations?id='+encodeURIComponent(entry.observation_id));assert(response.ok,'Report unavailable')
 const {observations}=await response.json(),row=observations[0];assert(row,'Saved report not found')
 const ai=row.ai_assessment||{},completed=ai.status==='completed'&&!ai.unavailable
 const outcome=!completed?'failed':ai.predicted_category==='needs_review'||ai.uncertainty==='high'?'uncertain':ai.predicted_category===entry.reference_category?'correct':'incorrect'
 results.push({observation_id:row.id,permissioned_original:true,reference_category:entry.reference_category,label_source:manifest.label_source,ambiguous:entry.ambiguous,expected_relevance:entry.expected_relevance,observer_category:row.category,predicted_category:ai.predicted_category||null,image_relevant:ai.image_relevant??null,uncertainty:ai.uncertainty||null,outcome,observer_reference_agreement:row.category===entry.reference_category,ai_reference_agreement:outcome==='correct',requires_review:outcome==='uncertain'||outcome==='incorrect'||!completed,model:ai.model||null,prompt_version:ai.prompt_version||null,assessed_at:ai.assessed_at||null,latency_ms:ai.latency_ms||null,latest_retry_error:ai.last_error?.code||null,notes:entry.notes||''})
}
const counts=Object.fromEntries(['correct','incorrect','uncertain','failed'].map(k=>[k,results.filter(r=>r.outcome===k).length]))
const uncertainty_distribution=results.reduce((acc,r)=>{const key=r.uncertainty||'none';acc[key]=(acc[key]||0)+1;return acc},{})
const relevant_handling={expected_relevant:results.filter(r=>r.expected_relevance).length,expected_irrelevant:results.filter(r=>!r.expected_relevance).length,ai_marked_relevant:results.filter(r=>r.image_relevant===true).length,ai_marked_irrelevant:results.filter(r=>r.image_relevant===false).length}
const observer_reference_agreement=results.filter(r=>r.observer_reference_agreement).length
const ai_reference_agreement=results.filter(r=>r.ai_reference_agreement).length
const output={evaluated_at:new Date().toISOString(),label_source:manifest.label_source,method:'Comparison of saved image-first screenings with supplied reference labels. Abstentions and failures reported separately. Not ecological, laboratory or expert validation.',sample_size:results.length,counts,screened_successfully:results.length-counts.failed,unavailable_or_failed:counts.failed,relevant_handling,observer_reference_agreement:{count:observer_reference_agreement,total:results.length},ai_reference_agreement:{count:ai_reference_agreement,total:results.length,meaning:'Coarse-category agreement on this permissioned convenience sample, excluding no uncertainty from the denominator.'},uncertainty_distribution,disagreements_requiring_review:results.filter(r=>r.requires_review).length,models:[...new Set(results.map(r=>r.model).filter(Boolean))],prompt_versions:[...new Set(results.map(r=>r.prompt_version).filter(Boolean))],limitations:['Team labels are not expert ground truth unless separately documented','Small convenience samples do not establish deployment accuracy','Photos cannot establish pathogens, toxicity, potability or ecosystem health','Failures and uncertain outputs are counted, not hidden'],results}
writeFileSync(process.argv[3]||'evaluation/results.json',JSON.stringify(output,null,2)+'\n')
console.log(JSON.stringify({sample_size:results.length,counts}))
