type Coord={lat:number;lon:number}
export function insideRing(lat:number,lon:number,ring:Coord[]) {
 let inside=false
 for(let i=0,j=ring.length-1;i<ring.length;j=i++){
  const a=ring[i],b=ring[j]
  if((a.lat>lat)!==(b.lat>lat)&&lon<(b.lon-a.lon)*(lat-a.lat)/(b.lat-a.lat)+a.lon)inside=!inside
 }
 return inside
}
export function lineDistance(lat:number,lon:number,line:Coord[]) {
 const factor=111320*Math.cos(lat*Math.PI/180);let closest=Infinity
 for(let i=1;i<line.length;i++){
  const ax=(line[i-1].lon-lon)*factor,ay=(line[i-1].lat-lat)*111320,bx=(line[i].lon-lon)*factor,by=(line[i].lat-lat)*111320
  const dx=bx-ax,dy=by-ay,t=Math.max(0,Math.min(1,-(ax*dx+ay*dy)/(dx*dx+dy*dy||1)))
  closest=Math.min(closest,Math.hypot(ax+t*dx,ay+t*dy))
 }
 return closest
}
// Join split multipolygon member ways by matching their endpoints.
function rings(parts:Coord[][]) {
 const pending=parts.filter(p=>p.length>1).map(p=>[...p]),result:Coord[][]=[]
 const equal=(a:Coord,b:Coord)=>a.lat===b.lat&&a.lon===b.lon
 while(pending.length){const ring=pending.shift()!;let changed=true
  while(changed&&!equal(ring[0],ring.at(-1)!)){changed=false
   for(let i=0;i<pending.length;i++){const p=pending[i];if(equal(ring.at(-1)!,p[0])){ring.push(...p.slice(1));pending.splice(i,1);changed=true;break}if(equal(ring.at(-1)!,p.at(-1)!)){ring.push(...p.slice(0,-1).reverse());pending.splice(i,1);changed=true;break}}
  }
  if(equal(ring[0],ring.at(-1)!))result.push(ring)
 }
 return result
}
export function matchesWater(element:any,lat:number,lon:number) {
 const tags=element.tags||{}
 if(tags.salt==='yes'||tags.salt==='true'||['sea','ocean','lagoon'].includes(tags.water)||tags.natural==='coastline')return false
 if(element.type==='relation'){
  const outer=rings((element.members||[]).filter((m:any)=>m.role==='outer'||!m.role).map((m:any)=>m.geometry||[]))
  const inner=rings((element.members||[]).filter((m:any)=>m.role==='inner').map((m:any)=>m.geometry||[]))
  return outer.some(r=>insideRing(lat,lon,r))&&!inner.some(r=>insideRing(lat,lon,r))
 }
 const line=element.geometry||[]
 if(tags.waterway&&['river','stream','canal'].includes(tags.waterway)&&line.length>1)return lineDistance(lat,lon,line)<=40
 return line.length>3&&line[0].lat===line.at(-1).lat&&line[0].lon===line.at(-1).lon&&insideRing(lat,lon,line)
}
