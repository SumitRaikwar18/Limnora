'use client'
import {bodyKinds,fieldLabels,fieldOptions,FieldContext} from '@/lib/freshwater'
export function FreshwaterFields({kind,onKind,context,onContext,attested,onAttested}:{kind:string;onKind:(v:string)=>void;context:FieldContext;onContext:(v:FieldContext)=>void;attested:boolean;onAttested:(v:boolean)=>void}){
 return <fieldset className="field-survey"><legend>Freshwater field notes</legend><p>Record only what you noticed from a safe bank. Unknown is a useful answer.</p><label>Water-body kind<select value={kind} onChange={e=>onKind(e.target.value)}>{bodyKinds.map(k=><option key={k} value={k}>{k==='unknown'?'Unknown':k[0].toUpperCase()+k.slice(1)}</option>)}</select></label>
 <div className="field-grid">{(Object.keys(fieldOptions) as (keyof FieldContext)[]).map(key=><label key={key}>{key==='flow'&&['river','stream'].includes(kind)?'Stream flow':fieldLabels[key]}<select value={context[key]} onChange={e=>onContext({...context,[key]:e.target.value})}>{fieldOptions[key].map(v=><option key={v}>{v}</option>)}</select></label>)}</div>
 <small>Floating leaves are plants; surface film may be scum. Rooted vegetation can be normal habitat. Do not approach water to test its smell.</small>
 <label className="attestation"><input type="checkbox" checked={attested} onChange={e=>onAttested(e.target.checked)}/>I am reporting an inland freshwater body, not sea or known brackish water. This is my declaration, not a salinity measurement.</label></fieldset>
}
