'use client'
import { useEffect, useRef, useState } from 'react'
import { LocateFixed } from 'lucide-react'
import { observationPaths } from '@/components/observation-icons'
import { observationEmojis } from '@/lib/observation-emojis'
type Point = { latitude: number; longitude: number; name?: string; id?:string; category?:string;created_at?:string;description?:string;confirmation_count?:number|null }
let loader: Promise<any> | undefined
function load() {
 if (!loader) loader = new Promise((resolve,reject)=>{
  if ((window as any).maplibregl) return resolve((window as any).maplibregl)
  const css=document.createElement('link');css.rel='stylesheet';css.href='https://unpkg.com/maplibre-gl@4.7.1/dist/maplibre-gl.css';document.head.append(css)
  const script=document.createElement('script');script.src='https://unpkg.com/maplibre-gl@4.7.1/dist/maplibre-gl.js';script.onload=()=>resolve((window as any).maplibregl);script.onerror=()=>{loader=undefined;reject(Error('Map could not load. Check your connection.'))};document.head.append(script)
 })
 return loader
}
export function RealMap({location,onSelect,onLocate,reports=[],onReportClick,selected}:{location:Point|null;onSelect:(p:Point)=>void;onLocate?:()=>void;reports?:Point[];onReportClick?:(p:Point)=>void;selected?:Point|null}){
 const host=useRef<HTMLDivElement>(null),map=useRef<any>(null),callback=useRef(onSelect),marker=useRef<any>(null)
 const reportCallback=useRef(onReportClick)
 reportCallback.current=onReportClick
 const [ready,setReady]=useState(false),[error,setError]=useState(''),[basemap,setBasemap]=useState('osm')
 callback.current=onSelect
 useEffect(()=>{
  let cancelled=false;let observer:ResizeObserver
  load().then(L=>{
   if(cancelled||!host.current)return
   const instance=new L.Map({container:host.current,style:'https://tiles.openfreemap.org/styles/liberty',center:[78.96,20.59],zoom:5,attributionControl:false})
   map.current=instance;instance.addControl(new L.NavigationControl(),'top-right')
   instance.addControl(new L.AttributionControl({compact:false}),'bottom-right')
   instance.on('load',()=>{
    instance.addSource('osm-carto',{type:'raster',tiles:[process.env.NEXT_PUBLIC_OSM_TILE_URL||'https://tile.openstreetmap.org/{z}/{x}/{y}.png'],tileSize:256,maxzoom:19,attribution:'© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'})
    instance.addLayer({id:'osm-detail',type:'raster',source:'osm-carto',paint:{'raster-fade-duration':0}})
    setReady(true);instance.resize()
   })
   instance.on('error',(e:any)=>{if(e.sourceId==='osm-carto'){setBasemap('vector');setError('OSM tiles unavailable. Showing the vector map instead.')}})
   instance.on('click',(e:any)=>{
    if(instance.getZoom()<11){setError('Zoom closer to select a pond, lake or stream.');return}
    const layers=instance.getStyle().layers.filter((l:any)=>l.id!=='osm-detail').map((l:any)=>l.id)
    const features=instance.queryRenderedFeatures(e.point,{layers})
    const water=features.find((f:any)=>/water|lake|river/.test(f.layer?.id||'')&&['fill','line'].includes(f.layer?.type))
    if(!water){setError('Click the blue water surface of a pond or lake.');return}
    setError('')
    const label=features.find((f:any)=>/water|lake|river/.test(f.layer?.id||'')&&f.properties?.name)
    const name=water.properties?.name || water.properties?.['name:en'] || label?.properties?.name || ''
    callback.current({latitude:e.lngLat.lat,longitude:e.lngLat.lng,name})
   })
   observer=new ResizeObserver(()=>instance.resize());observer.observe(host.current)
  }).catch(e=>setError(e.message))
  return()=>{cancelled=true;observer?.disconnect();map.current?.remove();map.current=null}
 },[])
 useEffect(()=>{if(ready&&map.current?.getLayer('osm-detail'))map.current.setLayoutProperty('osm-detail','visibility',basemap==='osm'?'visible':'none')},[ready,basemap])
 useEffect(()=>{if(!ready||!location)return;map.current.flyTo({center:[location.longitude,location.latitude],zoom:14});load().then(L=>{marker.current?.remove();marker.current=new L.Marker({color:'#087c69'}).setLngLat([location.longitude,location.latitude]).addTo(map.current)})},[location,ready])
 useEffect(()=>{if(!ready)return;let cancelled=false;const markers:any[]=[];load().then(L=>{if(cancelled)return;reports.forEach(p=>{const el=document.createElement('button');el.className='observation-pin';el.setAttribute('aria-label','Open '+(p.category||'water')+' observation');el.textContent=observationEmojis[p.category||'unusual']||'💧';el.addEventListener('click',e=>{e.stopPropagation();const card=document.createElement('div');card.className='map-report-popup';const title=document.createElement('strong');title.textContent=(observationEmojis[p.category||'unusual']||'💧')+' '+(p.description?.split(':')[0]||'Water observation');const date=document.createElement('p');date.textContent=p.created_at?'Reported: '+new Date(p.created_at).toLocaleString():'Community observation';const tally=document.createElement('p');tally.textContent='👀 '+(p.confirmation_count??0)+' saw this too';const open=document.createElement('button');open.textContent='View evidence & confirm';open.onclick=()=>{popup.remove();reportCallback.current?.(p)};card.append(title,date,tally,open);const popup=new L.Popup({offset:24,maxWidth:'290px'}).setLngLat([p.longitude,p.latitude]).setDOMContent(card).addTo(map.current)});markers.push(new L.Marker({element:el}).setLngLat([p.longitude,p.latitude]).addTo(map.current))})});return()=>{cancelled=true;markers.forEach(m=>m.remove())}},[reports,ready])
 useEffect(()=>{if(!ready||!selected)return;let pin:any,cancelled=false;load().then(L=>{if(cancelled)return;pin=new L.Marker({color:'#d69b32'}).setLngLat([selected.longitude,selected.latitude]).addTo(map.current)});return()=>{cancelled=true;pin?.remove()}},[selected,ready])
 return <div className="limnora-map-frame"><div ref={host} className="limnora-map-host"/><div className="basemap-switch" aria-label="Map appearance"><button type="button" aria-pressed={basemap==='osm'} className={basemap==='osm'?'active':''} onClick={()=>setBasemap('osm')}>Detailed OSM</button><button type="button" aria-pressed={basemap==='vector'} className={basemap==='vector'?'active':''} onClick={()=>setBasemap('vector')}>Vector</button></div>{!ready&&<div className="limnora-map-message">{error||'Loading OpenFreeMap…'}</div>}{ready&&error&&<div role="status" className="map-error">{error}</div>}<button type="button" className="map-location-action" onClick={onLocate} aria-label="Find my current location"><LocateFixed/> {location?'Recenter on me':'Find my location'}</button></div>
}
