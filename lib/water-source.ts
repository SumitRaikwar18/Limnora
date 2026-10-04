import 'server-only'
import {createHmac,timingSafeEqual} from 'node:crypto'
export type WaterSource={source_key:string;name:string;kind:string;latitude:number;longitude:number;source:'osm';freshwater_status:'observer_confirmation_required';source_url:string;retrieved_at:string}
function signature(data:string){return createHmac('sha256',process.env.SUPABASE_SECRET_KEY||'').update(data).digest('base64url')}
export function sourceToken(source:WaterSource){if(!process.env.SUPABASE_SECRET_KEY)throw Error('Database configuration missing');const data=Buffer.from(JSON.stringify({...source,expires:Date.now()+30*60000})).toString('base64url');return data+'.'+signature(data)}
export function readSource(token:string,latitude:number,longitude:number):WaterSource|null{
  try{
    if(!process.env.SUPABASE_SECRET_KEY||token.length>4000)return null
    const [data,sig,...extra]=token.split('.');if(extra.length||!sig)return null
    const a=Buffer.from(sig),b=Buffer.from(signature(data));if(a.length!==b.length||!timingSafeEqual(a,b))return null
    const source=JSON.parse(Buffer.from(data,'base64url').toString())
    if(source.expires<Date.now()||source.latitude!==latitude||source.longitude!==longitude)return null
    delete source.expires;return source
  }catch{return null}
}
