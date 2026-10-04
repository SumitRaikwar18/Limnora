import 'server-only'
export const url=process.env.NEXT_PUBLIC_SUPABASE_URL
export const key=process.env.SUPABASE_SECRET_KEY
export function supabaseConfigured(){return Boolean(url&&key)}
export async function supabaseFetch(path:string,init:RequestInit={}){
 if(!supabaseConfigured())throw Error('Database configuration missing')
 const headers=new Headers(init.headers);headers.set('apikey',key!);if(key!.startsWith('eyJ'))headers.set('Authorization','Bearer '+key)
 return fetch(url+path,{...init,headers,cache:'no-store',signal:AbortSignal.timeout(20000)})
}
export function supabaseRest(path:string,init:RequestInit={}){const headers=new Headers(init.headers);headers.set('Content-Type','application/json');return supabaseFetch('/rest/v1/'+path,{...init,headers})}
