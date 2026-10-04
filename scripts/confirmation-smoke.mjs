// Run with: node --env-file=.env.local scripts/confirmation-smoke.mjs
// Creates and deletes only its own temporary observation, never user reports.
import assert from 'node:assert/strict'
import { randomUUID } from 'node:crypto'
const id=randomUUID(),base=process.env.NEXT_PUBLIC_SUPABASE_URL,key=process.env.SUPABASE_SECRET_KEY
if(!base||!key)throw Error('Server database configuration required')
const headers={apikey:key,'Content-Type':'application/json'}
if(key.startsWith('eyJ'))headers.Authorization='Bearer '+key
const rest=(path,init={})=>fetch(base+'/rest/v1/'+path,{...init,headers:{...headers,...init.headers},signal:AbortSignal.timeout(20000)})
let created=false
try{
 const insert=await rest('observations',{method:'POST',body:JSON.stringify({id,latitude:0,longitude:0,category:'unusual',description:'AUTOMATED TEST — temporary confirmation validation'})})
 assert.equal(insert.ok,true,'Test observation creation');created=true
 const initial=await fetch('http://localhost:3000/api/confirmations?id='+id)
 assert.equal(initial.ok,true);assert.equal((await initial.json()).count,0)
 const cookie=initial.headers.get('set-cookie')?.split(';')[0];assert.ok(cookie)
 const send=()=>fetch('http://localhost:3000/api/confirmations',{method:'POST',headers:{'Content-Type':'application/json',Cookie:cookie},body:JSON.stringify({observationId:id})})
 for(let n=0;n<2;n++){const r=await send();assert.equal(r.ok,true);const d=await r.json();assert.equal(d.count,1);assert.equal(d.confirmed,true)}
 const persisted=await rest('confirmations?observation_id=eq.'+id+'&select=id')
 assert.equal((await persisted.json()).length,1)
 console.log('PASS: confirmation persists; duplicate browser confirmation stays at one.')
}finally{
 if(created){const deleted=await rest('observations?id=eq.'+id,{method:'DELETE'});assert.equal(deleted.ok,true,'Temporary observation cleanup');const check=await rest('observations?id=eq.'+id+'&select=id');assert.equal((await check.json()).length,0);console.log('PASS: temporary test observation and confirmations removed.')}
}
