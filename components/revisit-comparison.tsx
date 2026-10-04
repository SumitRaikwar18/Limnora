'use client'
import { useState } from 'react'
import { fieldLabels, compareVisits } from '@/lib/freshwater'

export function RevisitComparison({ report, timeline }: { report: any; timeline: any[] }) {
  const children = timeline.filter((r) => r.ai_assessment?.parent_id === report.id)
  const parent = timeline.find((r) => r.id === report.ai_assessment?.parent_id)
  const base = parent || report
  const candidates = parent ? [report] : children
  const [selected, setSelected] = useState('')
  const next = candidates.find((r) => r.id === selected) || candidates[0]
  const comparison = next ? compareVisits(base, next) : null

  return (
    <section className="revisit-section" aria-labelledby="revisit-section-heading">
      <div className="section-heading">
        <p className="eyebrow" id="revisit-section-heading">REVISIT EVIDENCE</p>
      </div>

      {!next ? (
        <div className="revisit-pending-box">
          <h4>Revisit pending</h4>
          <p className="small">This is a next-data request, not completed field work.</p>
        </div>
      ) : (
        <div className="revisit-completed-box">
          <h4>What did the second visit add?</h4>
          <p className="small">
            Linked visits are observer submissions, not verified photographs. Different views, lighting and seasons limit comparison. No automated recovery or water-health score is inferred.
          </p>
          {candidates.length > 1 && (
            <label className="revisit-selector">
              <span>Choose linked visit</span>
              <select value={next.id} onChange={(e) => setSelected(e.target.value)}>
                {candidates.map((r) => (
                  <option key={r.id} value={r.id}>
                    {new Date(r.observed_at || r.created_at).toLocaleString()}
                  </option>
                ))}
              </select>
            </label>
          )}
          <div className="revisit-comparison-summary">
            <div className="summary-field">
              <strong>New context:</strong>
              <span>{comparison!.added.length ? comparison!.added.join(', ') : 'No new structured context'}</span>
            </div>
            <div className="summary-field">
              <strong>Reported changes:</strong>
              <span>{comparison!.changed.length ? comparison!.changed.join(', ') : 'No field values differ'}</span>
            </div>
            <div className="summary-field">
              <strong>Evidence state:</strong>
              <span>Before: {comparison!.beforeState} → After: {comparison!.afterState}</span>
            </div>
            <div className="summary-field">
              <strong>AI interpretation:</strong>
              <span>
                {comparison!.interpretationChanged
                  ? 'Interpretation changed between visits. Compare framing and visible evidence.'
                  : 'Interpretation unchanged between visits.'}
              </span>
            </div>
            <div className="summary-field unresolved">
              <strong>Unresolved limitations:</strong>
              <span>Photo authenticity, comparable framing and laboratory conditions remain unverified.</span>
            </div>
            <p className="ecological-disclaimer">
              A changed observation does not establish ecological improvement or deterioration.
            </p>
          </div>

          <div className="revisit-pair">
            {[base, next].map((r, i) => (
              <article key={r.id}>
                <h5>{i ? 'Linked revisit' : 'Original observation'}</h5>
                <img src={r.photo_url} alt={i ? 'Submitted revisit photograph' : 'Submitted original photograph'} />
                <time>{new Date(r.observed_at || r.created_at).toLocaleString()}</time>
                <p><strong>Observer:</strong> {r.category}</p>
                <p><strong>Estimated cover:</strong> {r.coverage_level || 'Unknown'}</p>
                <dl className="field-notes">
                  {Object.entries(fieldLabels).map(([key, label]) => (
                    <div key={key}>
                      <dt>{label}</dt>
                      <dd>{r.field_context?.[key] || 'Unknown'}</dd>
                    </div>
                  ))}
                </dl>
                <p>
                  <strong>AI interpretation:</strong>{' '}
                  {r.ai_assessment?.status === 'completed' ? r.ai_assessment.predicted_category : 'Not screened'}
                </p>
                {r.description && <p className="revisit-desc">{r.description}</p>}
              </article>
            ))}
          </div>
        </div>
      )}
    </section>
  )
}
