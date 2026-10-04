'use client'
import {useState} from 'react'
import {fieldLabels,revisitTask} from '@/lib/freshwater'
export function RevisitComparison({report,timeline,onRevisit}:{report:any;timeline:any[];onRevisit:()=>void}){
 const task=revisitTask(report),children=timeline.filter(r=>r.ai_assessment?.parent_id===report.id)
 const parent=timeline.find(r=>r.id===report.ai_assessment?.parent_id)
 const base=parent||report,candidates=parent?[report]:children
 const [selected,setSelected]=useState('')
 const next=candidates.find(r=>r.id===selected)||candidates[0]
 return <section className="panel revisit-plan"><p className="eyebrow">OBSERVATION → QUESTION → REVISIT</p><h3>Next useful observation</h3><span className="small-tag">{task.reason}</span><p>{task.question}</p><ul>{task.checklist.map(item=><li key={item}>{item}</li>)}</ul><button onClick={onRevisit}>📷 Record a linked revisit</button><h3>Compare genuine visits</h3><p className="small">Linked visits are observer submissions, not verified photographs. Different views, lighting and seasons limit comparison. No automated recovery or water-health score is inferred.</p>{!next?<p>No linked revisit yet. This question is pending—not completed field work.</p>:<>{candidates.length>1&&<label>Choose linked visit<select value={next.id} onChange={e=>setSelected(e.target.value)}>{candidates.map(r=><option key={r.id} value={r.id}>{new Date(r.observed_at||r.created_at).toLocaleString()}</option>)}</select></label>}<div className="revisit-pair">{[base,next].map((r,i)=><article key={r.id}><h4>{i?'Linked revisit':'Original observation'}</h4><img src={r.photo_url} alt={i?'Submitted revisit photograph':'Submitted original photograph'}/><p>{new Date(r.observed_at||r.created_at).toLocaleString()}</p><p>Observer category: {r.category}</p><p>Observer-estimated cover: {r.coverage_level||'Unknown'}</p><dl className="field-notes">{Object.entries(fieldLabels).map(([key,label])=><div key={key}><dt>{label}</dt><dd>{r.field_context?.[key]||'Unknown'}</dd></div>)}</dl><p>AI interpretation: {r.ai_assessment?.status==='completed'?r.ai_assessment.predicted_category:'Not screened'}</p><p>{r.description}</p></article>)}</div></>}</section>
}
