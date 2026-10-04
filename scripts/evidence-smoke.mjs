import assert from 'node:assert/strict'
import sharp from 'sharp'
const base='http://localhost:3000'
const db=process.env.NEXT_PUBLIC_SUPABASE_URL
const key=process.env.SUPABASE_SECRET_KEY
const headers={apikey:key,...(key?.startsWith('eyJ')?{Authorization:'Bearer '+key}:{})}
const ids=[],photos=[];let bodyId,cookie=''
async function rest(path,options={}){const r=await fetch(db+'/rest/v1/'+path,{...options,headers:{...headers,...options.headers}});if(!r.ok)throw Error('Database operation '+r.status);return r}
async function post(path,payload){const r=await fetch(base+path,{method:'POST',headers:{Cookie:cookie,...(payload instanceof FormData?{}:{'Content-Type':'application/json'})},body:payload instanceof FormData?payload:JSON.stringify(payload),signal:AbortSignal.timeout(95000)});cookie=r.headers.get('set-cookie')?.split(';')[0]||cookie;return {status:r.status,data:await r.json()}}
try{
 const existing=(await (await fetch(base+'/api/observations')).json()).observations
 assert(existing.length,'Need an existing public photo for an explicitly labeled synthetic test')
 const source=Buffer.from(await (await fetch(existing[0].photo_url)).arrayBuffer())
 // Different encoding from the public source. No new field evidence is invented.
 const fixture=await sharp(source).resize(1000).jpeg({quality:79}).toBuffer()
 function form(bytes,parent){const f=new FormData();f.set('photo',new Blob([bytes],{type:'image/jpeg'}),'synthetic-integration-fixture.jpg');f.set('latitude','23.83');f.set('longitude','78.75');f.set('category','algae');f.set('name','Integration test — synthetic fixture, NOT field evidence');f.set('description','Temporary integration test. Synthetic source; do not interpret as a real observation.');f.set('coverage','Unknown');f.set('observedAt',new Date(Date.now()-86400000).toISOString());f.set('consent','true');if(parent){f.set('parentId',parent);f.set('waterBodyId',bodyId)}return f}
 const saved=await post('/api/observations',form(fixture));assert.equal(saved.status,200,JSON.stringify(saved.data));const row=saved.data.observation;ids.push(row.id);photos.push(row.photo_url.split('/').at(-1));bodyId=row.water_body_id
 assert(bodyId);assert(!row.ai_assessment.owner_hash);assert(Date.now()-new Date(row.observed_at)>80000000)
 console.log('PASS upload, persisted water-body ID, actual observation date, private identity hidden')
 const metadata=await sharp(Buffer.from(await (await fetch(row.photo_url)).arrayBuffer())).metadata();assert(!metadata.exif);console.log('PASS public derivative has no EXIF')
 const duplicate=await post('/api/observations',form(fixture));assert.equal(duplicate.status,409);console.log('PASS duplicate photo rejected')
 const invalid=await post('/api/reviews',{observationId:row.id,type:'correction',category:'algae',note:'bad'});assert.equal(invalid.status,400)
 const review=await post('/api/reviews',{observationId:row.id,type:'correction',category:'hyacinth',note:'Synthetic integration test: broad floating leaves are visible; preserve original algae label.'});assert.equal(review.status,200,JSON.stringify(review.data));assert.equal(review.data.observation.category,'algae');assert.equal(review.data.observation.ai_assessment.review_history[0].role,'original_observer');assert(!review.data.observation.ai_assessment.review_history[0].reviewer_hash)
 console.log('PASS human correction suggestion persists without overwriting original category')
 const assessed=await post('/api/assess-observation',{observationId:row.id});assert.equal(assessed.status,200,JSON.stringify(assessed.data));assert.equal(assessed.data.unavailable,false,JSON.stringify(assessed.data));assert.equal(assessed.data.status,'completed');assert(assessed.data.evidence.length);assert.equal(assessed.data.review_history.length,1)
 console.log('PASS actual image AI '+assessed.data.model+'; result '+assessed.data.predicted_category+'; review history preserved')
 const secondFixture=await sharp(source).resize(900).jpeg({quality:76}).toBuffer();const follow=await post('/api/observations',form(secondFixture,row.id));assert.equal(follow.status,200,JSON.stringify(follow.data));ids.push(follow.data.observation.id);photos.push(follow.data.observation.photo_url.split('/').at(-1));assert.equal(follow.data.observation.water_body_id,bodyId);assert.equal(follow.data.observation.ai_assessment.parent_id,row.id)
 const refreshed=(await (await fetch(base+'/api/observations')).json()).observations;assert.equal(refreshed.filter(r=>r.water_body_id===bodyId).length,2);assert.equal(refreshed.find(r=>r.id===row.id).ai_assessment.review_history.length,1)
 console.log('PASS linked follow-up and timeline survive refresh')
}finally{
 for(const id of ids)await rest('observations?id=eq.'+id,{method:'DELETE'})
 for(const path of photos){const r=await fetch(db+'/storage/v1/object/observation-photos/'+path,{method:'DELETE',headers});assert(r.ok,'Test photo cleanup failed')}
 if(bodyId)await rest('water_bodies?id=eq.'+bodyId,{method:'DELETE'})
 console.log('CLEANUP: only temporary test observations, photos and water-body record removed')
}
