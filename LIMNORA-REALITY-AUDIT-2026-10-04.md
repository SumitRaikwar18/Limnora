# Limnora: OneAquaHealth readiness audit

Reviewed 4 October 2026. Status: DONE_WITH_CONCERNS.

## Scope and evidence

This is an official-requirements and source-code audit, not a completed browser QA run or ecological validation. No production records were changed and no new AI inference was triggered. Current provider availability, deployed database permissions, deployment status, and Devpost submission status were not verified in this audit. Earlier successful smoke tests demonstrate integration, not ecological accuracy.

Live Devpost connector data was fetched for overview, rules, submission requirements, criteria, dates and announcements. The repository was clean at review start. Sources:

- https://oneaquahealth-ieee-hackathon.devpost.com/
- https://oneaquahealth-ieee-hackathon.devpost.com/rules
- https://oneaquahealth-ieee-hackathon.devpost.com/updates
- https://www.oneaquahealth.eu/
- https://www.oneaquahealth.eu/project-events/

The OneAquaHealth website connects urban freshwater integrity, biodiversity, human wellbeing, environmental surveillance and decision support. Learning-session recordings were listed but not watched; this audit does not claim to have reviewed their contents.

## Official requirements and inconsistencies

The build requirement is urban freshwater ecosystem monitoring supporting One Health. A project must align with at least one track; it does not need to implement all seven. The September 26 organizer announcement explicitly allows one or multiple tracks and individual or team participation.

Live submission endpoint: 2026-10-05 04:00 UTC, equivalent to 5 October 2026 at 09:30 IST. The organizer extension announcement says October 4 at 9 PM; the endpoint corresponds to October 4 at 9 PM PDT. Submit before the live endpoint and allow time for missing submission fields.

Required deliverables: explicit track alignment, description of problem/solution/users/impact, 3–5 minute video, public source repository with documentation, and prototype/mockup/proof of concept. A hosted website is not a mandatory field according to the connector, but a working hosted demo would help judges test this implementation.

Eligibility summary says students only, above local age of majority, team required, companies excluded. Formal rules say individuals or teams; the September 26 announcement also explicitly permits individuals. India is not in the connector exclusion list. Do not infer a mandatory minimum team size. Student status, age and registration must be checked for actual participants.

Formal rules retain September 16–30 build dates, while live dates start September 14 and end October 5. They also require originality and development during the hackathon period. Keep truthful development dates; request organizer clarification if post-September-30 development eligibility matters. Do not backdate commits.

Rules show 1–10 scoring with weights 30% impact, 20% innovation, 20% implementation, 15% UX and 15% scalability. The judging connector separately reports judging_scale=5. Treat the weights as published rules and flag this scoring inconsistency rather than inventing an official project score.

## Track alignment

| Track | Current evidence | Honest positioning |
| --- | --- | --- |
| 1: Citizen Science UX | Signup-free reporting, categories, photos, visit date, optional GPS | Supporting fit; add clearer ecological guidance and structured field questions |
| 2: Data-to-Insight | Map, category counts, body-linked timeline and disagreements | Partial; report counts are not stream-health trends or actionable One Health assessment |
| 3: AI-Supported Assessment | Actual image inference, explanations, alternatives, uncertainty, correction suggestions and revisits | Primary track; strongest implementation and demo story |
| 4: Awareness & Storytelling | About, field guide, limitations | Supporting educational content, not a developed storytelling product |
| 5: Community & Gamification | Browser-based corroboration and reviews | Supporting participation feature; no verified unique-person count or sustained-engagement evidence |
| 6: Resilience Informatics | No validated forecast, climate integration or predictive model | Do not claim predictive early warning; future work |
| 7: Digital Health Standards | Custom JSON export | No demonstrated FHIR conformance or integration; future work |

Recommended positioning: Limnora helps citizens turn uncertain urban freshwater photographs into traceable, human-reviewed observations and focused revisit questions. Supporting Track 1 and Track 2 capabilities strengthen the primary Track 3 submission.

## What the AI actually does

`app/api/assess-observation/route.ts` fetches a saved Supabase photo, bounds and resizes it with Sharp, sends the actual image and observer context to an OpenRouter vision model, parses structured output, and persists the result. It records model ID, prompt version, assessment time and history. It requests visible evidence, alternative explanations, uncertainty, a follow-up question and conditional possible impacts. Human corrections remain suggestions; original categories are preserved.

This is real inference. It is not a trained freshwater classifier, validated ecological index, calibrated confidence score, photo-authenticity detector, measured pollution assessment or FHIR implementation.

### AI findings

1. Free-model catalog dependence and quota failures can interrupt screening. The route excludes configured paid models because its catalog filter accepts only `:free` image models. It tries at most two candidates. A valid paid vision model in the environment would currently be ignored.
2. Prompt constraints are useful but not a complete safety layer. Output validation checks key shapes; conditional One Health impacts are still free text without a vetted ecological reference layer.
3. User category, description and coverage are supplied to the model, so results may be anchored to the observer's guess. A future evaluation should compare image-only interpretation with observer-context interpretation.
4. No labeled freshwater evaluation set or measured category-error/abstention results is present. Existing smoke tests establish plumbing, not scientific correctness.
5. Previous successful screening is preserved after a retry outage, which is good behavior. Public status should distinguish the retained result from the failed latest attempt.

## Prioritized source findings

### P0: Freshwater identity is a label, not established provenance

Evidence: `components/real-map.tsx` selects rendered layers using `/water|lake|river/` and returns only coordinates/name. It stores no authoritative feature ID or geometry. `app/api/observations/route.ts` creates a new record with `type:'freshwater'` from submitted coordinates. The API does not verify water geometry, salinity or urban context.

Impact: ocean/coastal water and arbitrary direct API points are not reliably excluded. Two clicks on one lake can create separate UUIDs and fragment the timeline. A label near a clicked feature can be mistaken for its name. Existing-body reports store the saved body's coordinates rather than retaining the new observation point.

Required update: persist water-body kind, map source/feature ID where available, local-name provenance, and a separate observation point. Reuse the existing body record. If a body is unmapped, explicitly allow an observer-declared freshwater body with unverified source status. Treat pond/lake/river/stream/reservoir as kinds, and freshwater confirmation as a separate provenance field. Map geometry alone does not certify salinity.

Acceptance: two points on the same named lake resolve to one body timeline; a stream can be selected; a small unmapped pond can be declared without claiming map verification; coastal/unknown waters are not silently labeled confirmed freshwater.

### P0: Scientific value needs structured field context

Evidence: reporting captures category, image, coverage, description and observation date. The schema contains `water_color` and `smell_level`, but the current form and POST payload do not populate them. All new body types are flattened to `freshwater`.

Required update: ask a few optional questions with explicit Unknown choices: water-body kind, flowing/still/dry, visible water colour/clarity, floating plant/scum cover, bank litter, and visible aquatic life. Ask odour only if noticed naturally from a safe bank. Keep observer statements separate from image-supported observations. Add simple distinctions between floating plants, surface scum and rooted vegetation. Do not equate ordinary vegetation with ecosystem degradation.

Acceptance: structured values persist after refresh and appear in export and detail view. Questions adapt to pond versus stream. Users can leave uncertain observations Unknown.

### P0: Evaluation and a real field case are missing

Required update: collect a small permissioned set of original freshwater images, ideally spanning vegetation, scum, litter, ordinary water and irrelevant/ambiguous images. Record human labels and who supplied them. Run the actual model and publish counts of correct, incorrect, uncertain and failed responses with latency/model/date. If labels are team judgments, say so; do not call them expert ground truth.

Use one real Sagar water body as a focused case. Show its name/provenance, original photo, observer label, AI explanation, human correction if needed, and a revisit. Never fabricate an earlier visit or environmental improvement. Generated images used for earlier testing must remain clearly labeled test fixtures and must not be presented as real field observations.

### P1: Insights describe activity rather than a useful next decision

Evidence: `app/page.tsx` displays original-category counts from at most 200 recent rows. Time filters use `created_at`, even though `observed_at` is collected. Some quality counters use all reports while category counters use the filtered set.

Required update: per-body summaries using observation time and a consistent filter: last observed date, report count, evidence available, disputed labels, and missing context. Add a transparent needs-follow-up queue, with the reason and supporting report IDs. Repeated reports may be a prompt to investigate; they are not proven worsening water quality.

Present three separate statements: what was observed, why it may matter to ecosystem/animal/human interactions, and which additional field observation or professional review is needed. Use curated, sourced explanations for ecological implications. Do not infer pathogens, toxicity or water safety from a photograph.

### P1: Map selection can disagree with the visible basemap

Evidence: the default raster OpenStreetMap layer overlays an OpenFreeMap vector style, but click detection reads the underlying vector features. A small pond visible in raster tiles may not have matching clickable geometry in the vector tiles.

Required update: resolve selection from the same map data or a separate body lookup and clearly explain missing coverage. Permit an explicitly unverified unmapped-body fallback. Show a radius for approximate GPS and keep manual reporting available as requested. No presence-verification claim.

### P1: Public export includes internal photo hash

Evidence: `lib/evidence-store.ts` removes `owner_hash` and reviewer hashes but leaves `photo_hash` in the public assessment spread. This is an internal duplicate-detection value with no field interpretation value.

Required update: use an explicit public evidence shape that omits internal hashes and provider diagnostics. Verify public APIs and exported JSON match privacy copy. Confirm database hardening is applied; merely having the SQL file does not prove deployment configuration.

### P1: Anonymous reviews need a trustworthy resolution model

Evidence: corrections are appended and original data remains unchanged. Browser identities can be reset; there is no qualified reviewer role or correction-resolution process.

Required update: show original observation, AI suggestion and community interpretation separately. Label pending/disputed/follow-up requested states. Never promote a popular label to scientific truth or identify a community browser as an expert. Add moderation/removal procedures for inappropriate public photos.

### P2: Scalability and resilience remain prototype-level

Evidence: GET retrieves 200 records; rate limits and AI locks are process-local; histories grow inside one JSON field; photo duplicate lookup and insertion are separate operations.

Update after core readiness: pagination/spatial queries, shared rate limiting, persistent AI job/idempotency handling, separate review/history records, and a unique or transactional duplicate constraint. Treat these as scale limitations, not evidence that the small MVP cannot work.

## Judging assessment without invented scores

| Criterion | Current strength | Gap with greatest judging impact |
| --- | --- | --- |
| Impact, 30% | Accessible urban water observation and review | Real local case, explicit One Health decision/use, responsible freshwater context |
| Innovation, 20% | Original evidence plus explainable disagreement and revisit loop | Demonstrate the loop improving evidence quality; mapping and image classification alone are common |
| Implementation, 20% | Real persistence, image inference, traceable histories | Provider reliability, water-body identity, evaluated output, deployed hardening |
| UX, 15% | No signup, map selection, understandable categories | Guided field questions, missing-pond path, recovery states, measured user walkthrough |
| Scale, 15% | Web prototype with exports | Stable identities, pagination, moderation and a credible researcher handoff |

Do not claim global novelty, winner readiness, IEEE certification or proven ecological impact. A distinctive, demonstrated evidence-review workflow is a defensible innovation claim.

## Minimum next build pass

1. Fix body identity/provenance and preserve observation coordinates.
2. Add the short freshwater field-context form with Unknown values.
3. Support a chosen working vision model with explicit provider errors and retained valid results.
4. Add one per-body evidence summary and needs-follow-up reason.
5. Evaluate original permissioned photos and document failures honestly.
6. Verify public API/export sanitization and applied database permissions.
7. Complete a hosted demo, 3–5 minute walkthrough, public-repo setup/license/architecture/evaluation notes and Devpost track-aligned description.

Avoid deadline expansion into predictive modelling, fabricated health scores, image-authenticity certification, full FHIR or extra gamification. These are not necessary to demonstrate the selected Track 3 workflow.

## Recommended demo

Open a real local pond or stream; explain the monitoring gap; select the body; submit a permissioned photo with actual observation time and field context; show model/evidence/uncertainty; demonstrate a disagreement or correction without changing the original; open a genuine revisit or clearly explain that one is pending; show the body evidence summary and export. Finish with evaluation results and explicit limitations. If AI is down, show the failure honestly and distinguish any previous recorded inference from a live request.

## GSTACK REVIEW REPORT

Status: DONE_WITH_CONCERNS. Review completed against live organizer data and actual source. No numeric readiness score, browser health score, ecological validity, current AI-provider availability, or submission status is asserted. The requested audit takes priority over optional skill setup, telemetry and consent-flow onboarding. The gstack router's evidence-first/report-only principles informed the audit; a full gstack browser QA workflow was not executed.
