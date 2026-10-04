const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
export function observationQuery(params:URLSearchParams){
 const integer=(key:string,fallback:number,max:number)=>{const raw=params.get(key);if(raw===null)return fallback;if(!/^\d+$/.test(raw))throw Error('Invalid '+key);const n=Number(raw);if(!Number.isSafeInteger(n)||n>max||(key==='limit'&&n<1))throw Error('Invalid '+key);return n}
 const limit=integer('limit',100,200),offset=integer('offset',0,100000)
 const query=new URLSearchParams({select:'*,confirmations(count),water_bodies(*)',order:'observed_at.desc,id.desc',limit:String(limit+1),offset:String(offset)})
 for(const [key,column] of [['id','id'],['waterBodyId','water_body_id']] as const){const value=params.get(key);if(value){if(!uuid.test(value))throw Error('Invalid '+key);query.set(column,'eq.'+value)}}
 const category=params.get('category');if(category){if(!['algae','hyacinth','grass','litter','fish','wildlife','flooding','unusual'].includes(category))throw Error('Invalid category');query.set('category','eq.'+category)}
 const since=params.get('since');if(since){const date=new Date(since);if(!Number.isFinite(date.getTime()))throw Error('Invalid date');query.set('observed_at','gte.'+date.toISOString())}
 const bbox=params.get('bbox');if(bbox){const values=bbox.split(',').map(Number);if(values.length!==4||bbox.split(',').some(v=>!v.trim())||values.some(v=>!Number.isFinite(v)))throw Error('Invalid map bounds');const [west,south,east,north]=values;if(west< -180||east>180||south< -90||north>90||west>east||south>north)throw Error('Invalid map bounds');query.set('and',`(longitude.gte.${west},longitude.lte.${east},latitude.gte.${south},latitude.lte.${north})`)}
 return {path:'observations?'+query,limit,offset}
}
