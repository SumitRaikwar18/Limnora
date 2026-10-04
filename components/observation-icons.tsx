import type { SVGProps } from 'react'

// One shared vector vocabulary for form controls and map markers.
export const observationPaths: Record<string,string[]> = {
 hyacinth:['M12 21V12','M12 15C5 15 3 10 5 7c5 0 7 4 7 8Z','M12 12c0-5 3-8 7-8 2 5-1 8-7 8Z','M3 21c3-2 5 2 9 0s6-2 9 0'],
 algae:['M3 18c3-2 5 2 9 0s6-2 9 0','M3 22c3-2 5 2 9 0s6-2 9 0','M7 16c-4-4 4-6 0-11','M12 16c-4-4 4-8 1-13','M18 16c-4-4 3-5 1-9'],
 grass:['M4 21h16','M8 21C8 13 7 7 3 5','M12 21V3','M15 21c0-7 2-12 6-15','M11 14 7 10','M13 10l4-4'],
 litter:['M4 6h16','M9 6V3h6v3','M6 6l1 15h10l1-15','M10 10v7','M14 10v7'],
 fish:['M3 12c4-7 12-7 16 0-4 7-12 7-16 0Z','M19 12l3-4v8Z','M7 9l3 6','M10 9l-3 6'],
 wildlife:['M3 12c4-6 11-6 15 0-4 6-11 6-15 0Z','M18 12l4-4v8Z','M7 11h.01','M2 21c3-2 5 2 9 0s6-2 11 0'],
 flooding:['M4 12a4 4 0 1 1 1-8 5 5 0 0 1 9-1 4 4 0 1 1 5 9','M6 14v3','M12 14v3','M18 14v3','M2 21c3-2 5 2 9 0s6-2 11 0'],
 unusual:['M12 3 2 21h20Z','M12 9v5','M12 17h.01']
}
function Icon({category,...props}:SVGProps<SVGSVGElement>&{category:string}){return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>{observationPaths[category].map((d,i)=><path key={i} d={d}/>)}</svg>}
export const HyacinthIcon=(p:SVGProps<SVGSVGElement>)=><Icon category="hyacinth" {...p}/>
export const AlgaeIcon=(p:SVGProps<SVGSVGElement>)=><Icon category="algae" {...p}/>
export const AquaticPlantsIcon=(p:SVGProps<SVGSVGElement>)=><Icon category="grass" {...p}/>
export const AquaticLifeIcon=(p:SVGProps<SVGSVGElement>)=><Icon category="wildlife" {...p}/>
