import {readFileSync,writeFileSync} from 'node:fs'
import assert from 'node:assert/strict'
const manifestPath=process.argv[2]
if(!manifestPath)throw Error('Usage: node scripts/evaluate-freshwater.mjs evaluation/manifest.json [output.json]')
const manifest=JSON.parse(readFileSync(manifestPath,'utf8'))
assert(typeof manifest.label_source==='string'&&manifest.label_source.trim(),'Record who supplied the reference labels')
assert(Array.isArray(manifest.cases)&&manifest.cases.length,'Add permissioned original field-photo cases; empty evaluation is not a result')
const base=process.env.LIMNORA_BASE_URL||'http://localhost:3000'
const response=await fetch(base+'/api/observations');assert(response.ok,'Reports unavailable')
const {observations}=await response.json(),results=[]
const categories=['hyacinth','algae','grass','litter','fish','wildlife','flooding','unusual','needs_review']
for(const entry of manifest.cases){
 assert(entry.permissioned_original===true,'Only permissioned original photos belong in field evaluation')
 assert(categories.includes(entry.reference_category),'Invalid reference category')
 const row=observations.find(r=>r.id===entry.observation_id);assert(row,'Report absent from current 200-record window')
 const ai=row.ai_assessment||{},completed=ai.status==='completed'&&!ai.unavailable
 const outcome=!completed?'failed':ai.predicted_category==='needs_review'||ai.uncertainty==='high'?'uncertain':ai.predicted_category===entry.reference_category?'correct':'incorrect'
 results.push({observation_id:row.id,reference_category:entry.reference_category,predicted_category:ai.predicted_category||null,outcome,model:ai.model||null,prompt_version:ai.prompt_version||null,assessed_at:ai.assessed_at||null,latency_ms:ai.latency_ms||null,latest_retry_error:ai.last_error?.code||null})
}
const counts=Object.fromEntries(['correct','incorrect','uncertain','failed'].map(k=>[k,results.filter(r=>r.outcome===k).length]))
const output={evaluated_at:new Date().toISOString(),label_source:manifest.label_source,method:'Comparison of saved image-first screenings with supplied reference labels. Abstentions and failures reported separately. Not ecological or expert validation.',sample_size:results.length,counts,results}
writeFileSync(process.argv[3]||'evaluation/results.json',JSON.stringify(output,null,2)+'\n')
console.log(JSON.stringify({sample_size:results.length,counts}))
