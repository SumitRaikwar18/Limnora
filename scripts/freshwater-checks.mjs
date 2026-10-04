import assert from 'node:assert/strict'
import {readFileSync} from 'node:fs'
import ts from 'typescript'
async function moduleAt(path){const source=ts.transpileModule(readFileSync(new URL(path,import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText;return import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'))}
const geo=await moduleAt('../lib/water-geometry.ts'),fresh=await moduleAt('../lib/freshwater.ts')
const ring=[{lat:0,lon:0},{lat:0,lon:2},{lat:2,lon:2},{lat:2,lon:0},{lat:0,lon:0}]
assert(geo.matchesWater({type:'way',tags:{natural:'water',water:'pond'},geometry:ring},1,1))
assert(!geo.matchesWater({type:'way',tags:{natural:'water',salt:'yes'},geometry:ring},1,1))
assert(!geo.matchesWater({type:'way',tags:{natural:'water',water:'ocean'},geometry:ring},1,1))
const split=[ring.slice(0,3),ring.slice(2)]
assert(geo.matchesWater({type:'relation',tags:{natural:'water'},members:split.map(geometry=>({role:'outer',geometry}))},1,1))
assert(!geo.matchesWater({type:'relation',tags:{natural:'water'},members:[{role:'outer',geometry:ring},{role:'inner',geometry:[{lat:.5,lon:.5},{lat:.5,lon:1.5},{lat:1.5,lon:1.5},{lat:1.5,lon:.5},{lat:.5,lon:.5}]}]},1,1))
assert(geo.matchesWater({type:'way',tags:{waterway:'stream'},geometry:[{lat:1,lon:0},{lat:1,lon:2}]},1.0001,1))
assert(!geo.matchesWater({type:'way',tags:{waterway:'stream'},geometry:[{lat:1,lon:0},{lat:1,lon:2}]},1.01,1))
assert.throws(()=>fresh.parseContext({flow:'poisoned'}))
assert.equal(fresh.parseContext({}).flow,'Unknown')
const report={id:'test',observed_at:'2026-10-01',category:'algae',field_context:fresh.emptyContext,ai_assessment:{status:'completed',predicted_category:'hyacinth',observation_supported:false,uncertainty:'low'}}
assert.equal(fresh.evidenceState(report),'Disputed interpretation')
assert.equal(fresh.evidenceState({...report,ai_assessment:{...report.ai_assessment,parent_id:'original'}}),'Disputed interpretation')
assert.equal(fresh.evidenceState({...report,ai_assessment:{status:'pending',parent_id:'original'}}),'Awaiting screening / review')
assert.deepEqual(fresh.compareVisits(report,{...report,field_context:{...fresh.emptyContext,flow:'Still'}}).added,['Water movement'])
assert.equal(fresh.bodySummary([report]).reasons[0].report.id,'test')
assert.equal(fresh.reviewerQueue([report,{...report,id:'fish',category:'fish'}])[0].report.id,'fish')
assert.equal(fresh.reviewerQueue([report])[0].priority,'Interpretation review')
assert(!fresh.researcherBrief({name:'Pond'},[privateReportPlaceholder()]).includes('PRIVATE'))
function privateReportPlaceholder(){return {...report,ai_assessment:{...report.ai_assessment,owner_hash:'PRIVATE',photo_hash:'PRIVATE'}}}
assert.equal(fresh.bodySummary([{...report,id:'older',observed_at:'2026-09-01'},report]).last.id,'test')
assert.equal(fresh.revisitTask(report).reason,'Interpretations differ')
const privateReport={...report,ai_assessment:{...report.ai_assessment,owner_hash:'PRIVATE',photo_hash:'PRIVATE',attempt_history:['PRIVATE']}}
const brief=JSON.stringify(fresh.evidenceBrief({id:'body'},[privateReport]))
assert(!brief.includes('PRIVATE'))
assert(brief.includes('next_observation'))
assert.equal(fresh.revisitTask({...report,ai_assessment:{image_relevant:false}}).reason,'Image relevance is uncertain')
const fhir=JSON.stringify(fresh.fhirPrototypeBundle({id:'body',name:'Test pond',latitude:1,longitude:2},[report]))
assert(fhir.includes('"resourceType":"Bundle"'))
assert(fhir.includes('FHIR interoperability prototype'))
assert(!fhir.includes('PRIVATE'))
const bundle=JSON.parse(fhir)
assert(!('note' in bundle.entry[0].resource))
assert(!('location' in bundle.entry[1].resource))
assert.equal(bundle.entry[1].resource.focus[0].reference,bundle.entry[0].fullUrl)
console.log('PASS geometry, field validation, observation-time summaries, revisit tasks, public brief privacy and FHIR prototype shape')
