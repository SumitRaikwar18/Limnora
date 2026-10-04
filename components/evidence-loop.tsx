'use client'
import { useState, useEffect } from 'react'
import { observationEmojis } from '@/lib/observation-emojis'
import { RevisitComparison } from '@/components/revisit-comparison'
import {
  evidenceState,
  fieldLabels,
  revisitTask,
  researcherBrief,
  evidenceBrief,
  fhirPrototypeBundle,
  aiAssessmentSupportLabel
} from '@/lib/freshwater'
import { AlertTriangle, RefreshCw, ChevronDown, Download, CheckCircle2, ShieldCheck, ArrowRight } from 'lucide-react'

const labels: Record<string, string> = {
  hyacinth: 'Water hyacinth',
  algae: 'Algae / scum',
  grass: 'Aquatic plants',
  litter: 'Litter',
  fish: 'Dead fish',
  wildlife: 'Aquatic life',
  flooding: 'Flooding',
  unusual: 'Unusual water',
  needs_review: 'Uncertain — needs human review'
}

function capitalize(s?: string) {
  if (!s) return 'Unknown'
  return s.charAt(0).toUpperCase() + s.slice(1)
}

export function EvidenceLoop({
  report,
  onChange,
  onFollowUp,
  timeline,
  onOpen,
  onOpenWorkbench
}: {
  report: any
  onChange: (r: any) => void
  onFollowUp: () => void
  timeline: any[]
  onOpen: (r: any) => void
  onOpenWorkbench?: () => void
}) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [type, setType] = useState('correction')
  const [note, setNote] = useState('')
  const [category, setCategory] = useState(report.category)

  // Corroboration state
  const [review, setReview] = useState<{ count: number; confirmed: boolean } | null>(null)
  const [reviewLoading, setReviewLoading] = useState(false)
  const [reviewError, setReviewError] = useState('')
  const [attested, setAttested] = useState(false)
  const [reviewSaving, setReviewSaving] = useState(false)

  const ai = report.ai_assessment || {}
  const status = evidenceState(report)
  const task = revisitTask(report)
  const isDisputed = status === 'Disputed interpretation' || (ai.status === 'completed' && !ai.observation_supported)

  // Load confirmations
  useEffect(() => {
    let cancelled = false
    setReview(null)
    setAttested(false)
    setReviewError('')
    setReviewLoading(true)
    fetch('/api/confirmations?id=' + encodeURIComponent(report.id))
      .then(async (r) => {
        const d = await r.json()
        if (!r.ok) throw Error(d.error)
        if (!cancelled) setReview(d)
      })
      .catch((e) => {
        if (!cancelled) setReviewError(e.message)
      })
      .finally(() => {
        if (!cancelled) setReviewLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [report.id])

  async function confirmObservation() {
    if (!attested || reviewSaving || review?.confirmed) return
    setReviewSaving(true)
    setReviewError('')
    try {
      const r = await fetch('/api/confirmations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ observationId: report.id })
      })
      const d = await r.json()
      if (!r.ok) throw Error(d.error)
      setReview(d)
      onChange({ ...report, confirmation_count: d.count })
    } catch (e) {
      setReviewError((e as Error).message)
    } finally {
      setReviewSaving(false)
    }
  }

  async function screen() {
    setBusy(true)
    setError('')
    try {
      const r = await fetch('/api/assess-observation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ observationId: report.id }),
        signal: AbortSignal.timeout(90000)
      })
      const d = await r.json()
      if (!r.ok) throw Error(d.error || 'Screening failed')
      onChange({ ...report, ai_assessment: d })
      if (d.last_error) setError(d.last_error.message)
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setBusy(false)
    }
  }

  async function reviewSubmit(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      const r = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ observationId: report.id, type, note, category })
      })
      const d = await r.json()
      if (!r.ok) throw Error(d.error)
      onChange({ ...report, ...d.observation })
      setNote('')
      setShowReviewForm(false)
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setBusy(false)
    }
  }

  // Exports
  function downloadBrief() {
    const briefText = researcherBrief(report.water_body, timeline.length ? timeline : [report])
    const url = URL.createObjectURL(new Blob([briefText], { type: 'text/markdown;charset=utf-8' }))
    const a = document.createElement('a')
    a.href = url
    a.download = `limnora-researcher-brief-${report.id}.md`
    a.click()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  }

  function downloadJson() {
    const data = evidenceBrief(report.water_body, timeline.length ? timeline : [report])
    const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }))
    const a = document.createElement('a')
    a.href = url
    a.download = `limnora-evidence-${report.id}.json`
    a.click()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  }

  function downloadFhir() {
    const bundle = fhirPrototypeBundle(report.water_body, timeline.length ? timeline : [report])
    const url = URL.createObjectURL(new Blob([JSON.stringify(bundle, null, 2)], { type: 'application/fhir+json' }))
    const a = document.createElement('a')
    a.href = url
    a.download = `limnora-fhir-prototype-${report.id}.json`
    a.click()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  }

  return (
    <div className="evidence-detail-container">
      {/* 1. Observation Header */}
      <header className="observation-detail-header">
        <div className="detail-media-container">
          <img
            src={report.photo_url}
            alt={`${labels[report.category] || report.category} observed in freshwater`}
            className="detail-main-photo"
          />
        </div>
        <div className="detail-header-meta">
          <div className="category-title-row">
            <span aria-hidden="true" className="detail-category-emoji">
              {observationEmojis[report.category] || '💧'}
            </span>
            <div>
              <h2 className="detail-category-name">{labels[report.category] || report.category}</h2>
              <p className="detail-water-body">{report.water_body?.name || report.description?.split(':')[0] || 'Unnamed water body'}</p>
            </div>
          </div>
          <div className="detail-time-loc">
            <time dateTime={report.observed_at || report.created_at}>
              Observed {new Date(report.observed_at || report.created_at).toLocaleString()}
            </time>
            {report.latitude !== undefined && report.longitude !== undefined && (
              <span className="coords">
                {report.latitude.toFixed(4)}, {report.longitude.toFixed(4)}
              </span>
            )}
          </div>
          {report.description && (
            <p className="detail-user-desc">
              {report.description.split(':').slice(1).join(':').trim() || report.description}
            </p>
          )}
          {report.field_context && (
            <dl className="compact-field-notes">
              {Object.entries(report.field_context)
                .filter(([_, v]) => v && v !== 'Unknown')
                .map(([k, v]) => (
                  <div key={k} className="field-note-chip">
                    <dt>{fieldLabels[k as keyof typeof fieldLabels] || k}:</dt>
                    <dd>{String(v)}</dd>
                  </div>
                ))}
            </dl>
          )}
        </div>
      </header>

      {/* 2. Evidence Verdict */}
      <section className="evidence-verdict-section" aria-labelledby="verdict-heading">
        <div className="evidence-badges">
          <span className={`badge-pill badge-state ${isDisputed ? 'badge-disputed' : 'badge-screened'}`}>
            Evidence: {status}
          </span>
          <span className="badge-pill badge-visit">
            Visit: {ai.parent_id ? 'Linked revisit' : 'Original observation'}
          </span>
        </div>

        {/* AI Retry Warning (compact) */}
        {ai.last_error && (
          <div className="compact-retry-warning" role="status">
            <span>
              ⚠ {ai.status === 'completed'
                ? 'Latest reassessment unavailable. Showing the last successful AI screening.'
                : 'AI screening is currently unavailable. Showing unverified observation.'}
            </span>
            <button className="subtle-retry-btn" onClick={screen} disabled={busy}>
              {busy ? 'Retrying…' : 'Retry screening'}
            </button>
          </div>
        )}

        {/* Observer vs AI Comparison Card */}
        <div className={`verdict-comparison-card ${isDisputed ? 'disputed-card' : 'concordant-card'}`}>
          <div className="verdict-grid">
            <div className="verdict-col observer-col">
              <span className="verdict-label">Observer</span>
              <strong className="verdict-value">{labels[report.category] || report.category}</strong>
            </div>
            <div className="verdict-col ai-col">
              <span className="verdict-label">Independent AI</span>
              <strong className="verdict-value">
                {ai.status === 'completed'
                  ? labels[ai.predicted_category] || ai.predicted_category
                  : ai.unavailable
                  ? 'Screening unavailable'
                  : 'Pending screening'}
              </strong>
            </div>
            <div className="verdict-col uncertainty-col">
              <span className="verdict-label">AI interpretation uncertainty</span>
              <strong className="verdict-value capitalize">{capitalize(ai.uncertainty || 'Unknown')}</strong>
            </div>
          </div>
          <p className="independent-screening-note">
            AI screened the photograph independently without receiving the observer category.
          </p>
        </div>

        {/* 3. Why the AI thinks this */}
        {ai.status === 'completed' && (
          <div className="ai-reasoning-block">
            <h4 id="verdict-heading" className="reasoning-title">Why the AI thinks this</h4>
            {ai.evidence && ai.evidence.length > 0 ? (
              <ul className="visible-evidence-list">
                {ai.evidence.map((item: string, idx: number) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            ) : (
              <p className="small">No specific visual features itemized by the screener.</p>
            )}

            {ai.alternatives && ai.alternatives.length > 0 && (
              <div className="alternative-interpretations">
                <span className="alt-label">Alternative interpretations:</span>
                <ul className="alt-list">
                  {ai.alternatives.map((alt: string, idx: number) => (
                    <li key={idx}>{alt}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </section>

      {/* 4. Next Action */}
      <section className="next-action-section" aria-label="Next action">
        <div className="next-action-card">
          <p className="eyebrow">NEXT BEST QUESTION</p>
          <p className="next-question-quote">
            “{ai.follow_up || task.question}”
          </p>
          <div className="primary-action-row">
            <button
              className="primary-action-btn"
              onClick={() => setShowReviewForm((prev) => !prev)}
            >
              {showReviewForm ? 'Close review form' : 'Add human review'}
            </button>
            <button className="secondary-action-btn" onClick={onFollowUp}>
              Plan revisit
            </button>
          </div>
        </div>

        {/* Expandable Human Review Form */}
        {showReviewForm && (
          <div className="human-review-drawer" id="human-review-form">
            <h4>Add your human review</h4>
            <p className="small">
              The original observer category remains unchanged. Your review adds a traceable perspective.
            </p>
            <form onSubmit={reviewSubmit} className="inline-review-form">
              <label>
                Review type
                <select value={type} onChange={(e) => setType(e.target.value)}>
                  <option value="correction">Suggest category correction</option>
                  <option value="disagreement">Different interpretation</option>
                  <option value="follow_up">Additional field context</option>
                </select>
              </label>

              {type === 'correction' && (
                <label>
                  Suggested category
                  <select value={category} onChange={(e) => setCategory(e.target.value)}>
                    {Object.entries(labels)
                      .filter(([id]) => id !== 'needs_review')
                      .map(([id, label]) => (
                        <option key={id} value={id}>
                          {label}
                        </option>
                      ))}
                  </select>
                </label>
              )}

              <label>
                What evidence supports your review?
                <textarea
                  required
                  minLength={10}
                  maxLength={1000}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Describe what you see in the photo or know from the site."
                />
              </label>

              <div className="form-action-row">
                <button
                  disabled={busy || note.trim().length < 10}
                  type="submit"
                  className="save-review-btn"
                >
                  {busy ? 'Saving review…' : 'Save human review'}
                </button>
                <button
                  type="button"
                  className="subtle-btn"
                  onClick={() => setShowReviewForm(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}
      </section>

      {/* 5. Mini Process Cue */}
      <div className="mini-process-cue" aria-label="Limnora evidence process">
        <span>Observation</span>
        <ArrowRight className="process-arrow" />
        <span>Review</span>
        <ArrowRight className="process-arrow" />
        <span>Revisit</span>
        <ArrowRight className="process-arrow" />
        <span>Better evidence</span>
      </div>

      {/* Reviewer Escalation Card (if interpretations differ or needs review) */}
      {isDisputed && (
        <section className="reviewer-escalation-card">
          <div className="escalation-content">
            <span className="escalation-tag">Needs interpretation review</span>
            <p className="escalation-reason">Reason: Observer and AI interpretations differ.</p>
          </div>
          {onOpenWorkbench && (
            <button className="escalation-cta" onClick={onOpenWorkbench}>
              Open in Reviewer Workbench →
            </button>
          )}
        </section>
      )}

      {/* 6. Revisit Section */}
      <RevisitComparison report={report} timeline={timeline} />

      {/* 7. Progressive Disclosure Sections */}
      <div className="accordion-group">
        {/* Why could this matter? */}
        <details className="evidence-accordion">
          <summary>
            <span>Why could this matter?</span>
            <ChevronDown className="accordion-chevron" />
          </summary>
          <div className="accordion-content">
            <div className="one-health-block">
              {ai.possible_impacts && ai.possible_impacts.length > 0 ? (
                ai.possible_impacts.map((impact: string, idx: number) => (
                  <p key={idx}>{impact}</p>
                ))
              ) : (
                <p>
                  Freshwater observations help document ecological changes, invasive growth, or bank litter.
                </p>
              )}
              <p className="safety-note">Possible consequences, not measured findings.</p>
              {ai.guidance_source && (
                <p className="guidance-link">
                  Reference: <a href={ai.guidance_source} target="_blank" rel="noreferrer">USGS/EPA field guidance ↗</a>
                </p>
              )}
            </div>
          </div>
        </details>

        {/* Review history */}
        <details className="evidence-accordion">
          <summary>
            <span>Review history ({((ai.assessment_history?.length || 0) + (ai.review_history?.length || 0)) || 0})</span>
            <ChevronDown className="accordion-chevron" />
          </summary>
          <div className="accordion-content">
            <p className="small history-baseline">
              Original observer category: <strong>{labels[report.category] || report.category}</strong>. Suggestions do not silently change it.
            </p>
            {!(ai.review_history?.length || ai.assessment_history?.length) && (
              <p className="small">No review events yet.</p>
            )}
            {ai.assessment_history?.map((event: any, index: number) => {
              const supportText = aiAssessmentSupportLabel(event, report.category)
              return (
                <article key={'ai' + index} className="history-item ai-event">
                  <strong>AI interpretation: {labels[event.predicted_category] || event.predicted_category}</strong>
                  <small>
                    {new Date(event.assessed_at).toLocaleString()} · {event.model}
                  </small>
                  <p>
                    {supportText} · AI interpretation uncertainty: {capitalize(event.uncertainty)}
                  </p>
                </article>
              )
            })}
            {ai.review_history?.map((event: any) => (
              <article key={event.id} className="history-item user-event">
                <strong>
                  {event.type === 'correction'
                    ? 'Suggested correction: ' + (labels[event.proposed_category] || event.proposed_category)
                    : event.type === 'disagreement'
                    ? 'Different interpretation'
                    : 'Additional context'}
                </strong>
                <small>
                  {new Date(event.created_at).toLocaleString()} ·{' '}
                  {event.role === 'original_observer' ? 'Original observer' : 'Community reviewer'}
                </small>
                <p>{event.note}</p>
              </article>
            ))}
          </div>
        </details>

        {/* AI provenance */}
        <details className="evidence-accordion">
          <summary>
            <span>AI provenance & diagnostics</span>
            <ChevronDown className="accordion-chevron" />
          </summary>
          <div className="accordion-content">
            <dl className="provenance-dl">
              <div>
                <dt>Model</dt>
                <dd>{ai.model || 'Pending'}</dd>
              </div>
              <div>
                <dt>Prompt version</dt>
                <dd>{ai.prompt_version || 'v3'}</dd>
              </div>
              <div>
                <dt>Assessed timestamp</dt>
                <dd>{ai.assessed_at ? new Date(ai.assessed_at).toLocaleString() : 'Not assessed'}</dd>
              </div>
              <div>
                <dt>Method</dt>
                <dd>{ai.interpretation_method || 'image_first'}</dd>
              </div>
              <div>
                <dt>Latency</dt>
                <dd>{ai.latency_ms ? `${ai.latency_ms} ms` : '—'}</dd>
              </div>
            </dl>
            {ai.last_error && (
              <div className="diagnostics-box">
                <strong>Diagnostics:</strong>
                <p className="small">{ai.last_error.code}: {ai.last_error.message}</p>
                <time className="small">{new Date(ai.last_error.at).toLocaleString()}</time>
              </div>
            )}
            <p className="assessment-disclaimer">
              Screening only. Not laboratory confirmation or photo-authenticity verification.
            </p>
            <button className="reassess-btn" onClick={screen} disabled={busy}>
              <RefreshCw className={busy ? 'spin' : ''} />
              {busy ? 'Screening…' : ai.status === 'completed' ? 'Reassess evidence' : 'Run AI screening'}
            </button>
          </div>
        </details>

        {/* Water-body timeline */}
        <details className="evidence-accordion">
          <summary>
            <span>Water-body timeline ({timeline.length})</span>
            <ChevronDown className="accordion-chevron" />
          </summary>
          <div className="accordion-content">
            <p className="small">
              {report.water_body_id
                ? 'Linked by saved community water-body ID.'
                : 'Legacy record without a linked water-body ID.'}{' '}
              Counts are observations, not water-quality tests.
            </p>
            {timeline.length ? (
              <div className="timeline-list">
                {timeline.map((r) => (
                  <button
                    className={`timeline-item ${r.id === report.id ? 'active-timeline' : ''}`}
                    key={r.id}
                    onClick={() => onOpen(r)}
                  >
                    <span className="timeline-emoji">{observationEmojis[r.category] || '💧'}</span>
                    <div className="timeline-meta">
                      <strong>
                        {labels[r.category] || r.category}
                        {r.id === report.id ? ' (current)' : ''}
                      </strong>
                      <time>
                        Observed {new Date(r.observed_at || r.created_at).toLocaleString()}
                        {r.ai_assessment?.parent_id ? ' · linked revisit' : ''}
                      </time>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <p className="small">This is the only linked observation for this location.</p>
            )}
          </div>
        </details>

        {/* Community corroboration */}
        <details className="evidence-accordion">
          <summary>
            <span>
              Community corroboration (
              {reviewLoading ? '…' : review?.count !== undefined ? review.count : '—'})
            </span>
            <ChevronDown className="accordion-chevron" />
          </summary>
          <div className="accordion-content">
            <p className="corroboration-count">
              <strong>
                {reviewLoading
                  ? 'Loading confirmations…'
                  : review
                  ? `${review.count} community confirmations`
                  : 'Confirmation count unavailable'}
              </strong>
            </p>
            <p className="small">
              Only confirm if you personally observed the same condition at this water body. This does not establish photo authenticity or water safety.
            </p>
            {review?.confirmed ? (
              <div role="status" className="confirmed-state">
                <CheckCircle2 /> Your confirmation is saved for this browser.
              </div>
            ) : (
              <div className="corroboration-form">
                <label className="attestation">
                  <input
                    type="checkbox"
                    checked={attested}
                    onChange={(e) => setAttested(e.target.checked)}
                  />
                  <span>I personally saw the same condition here.</span>
                </label>
                <button
                  className="confirm-button"
                  onClick={confirmObservation}
                  disabled={!attested || !review || reviewLoading || reviewSaving}
                >
                  {reviewSaving ? 'Saving confirmation…' : '👀 I saw this too'}
                  {review ? ` · ${review.count}` : ''}
                </button>
              </div>
            )}
            {reviewError && <p className="notice error">{reviewError}</p>}
            <small className="small-disclaimer">
              One per browser identity. Not unique-person verification.
            </small>
          </div>
        </details>

        {/* Export / Advanced */}
        <details className="evidence-accordion">
          <summary>
            <span>Export / Advanced</span>
            <ChevronDown className="accordion-chevron" />
          </summary>
          <div className="accordion-content">
            <div className="export-button-group">
              <button onClick={downloadBrief} className="export-btn">
                <Download /> Download researcher brief (.md)
              </button>
              <button onClick={downloadJson} className="export-btn">
                <Download /> Export Limnora JSON
              </button>
              <button onClick={downloadFhir} className="export-btn">
                <Download /> Export FHIR prototype
              </button>
            </div>
            <p className="small fhir-disclaimer">
              Includes loaded source observations, field notes, AI provenance, and next questions. FHIR export is an experimental prototype handoff, not profile-validated or an official OneAquaHealth integration.
            </p>
          </div>
        </details>
      </div>

      {error && <div role="alert" className="notice error">{error}</div>}
    </div>
  )
}
