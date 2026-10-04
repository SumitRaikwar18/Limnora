# Limnora — Hackathon execution blueprint
Reviewed: 3 October 2026. This is a build strategy, not a promise of winning or a claim of worldwide uniqueness. Existing PRD is preserved. The newer user decisions override its demo seeding and optional-location assumptions.

## 1. Strongest product direction
**Limnora: from a pond photo to a traceable freshwater evidence record.**
Residents select an actual nearby water body, document a visible change, and receive an AI evidence check. The system keeps the original observation, model interpretation, uncertainty, review history and subsequent visits together.

The distinctive feature to implement is **Evidence Loop**:
1. Observer says what they think they saw.
2. Vision AI describes visible evidence and alternative explanations.
3. If evidence is weak or contradicts the selected category, ask one concrete follow-up: photograph a leaf close-up from a safe bank, show a wider water surface, or state whether the material floats.
4. Observer supplies evidence or accepts an uncertain category.
5. The water-body timeline preserves both versions and the reason for the change.

Example: user chooses algae; image has floating broad-leaf plants. Result: possible aquatic vegetation, algae not supported by this image; request a safe close-up to distinguish hyacinth from other plants. Do not force species identification.

This is a proposed differentiator, not a proven unique invention. The strongest judging proof is a real contradictory example where AI improves an observation rather than merely agreeing.

## 2. Verified event facts and inconsistencies
Live Devpost connector returned:
- Submission closes 2026-10-05T04:00:00Z = **5 October 2026, 09:30 IST**.
- Submission starts 14 September; judging 5–16 October (UTC timestamps); winner announcement 24 October.
- Rules prose still lists September 16–30 and August 31 registration closure. Updated event dates and announcements differ. Preserve accurate commit history and disclose development dates; ask the organizer about the extended build period if necessary.
- Eligibility summary says "Above legal age of majority in country of residence", "Students only", and "Team required".
- Rules body says "Open to individuals or teams (each participant can join only one team)".
- Recent announcement also permits individual participation. These are conflicting official texts; do not silently resolve them. A student team avoids the team ambiguity; confirm individual eligibility with organizers if submitting alone.
- Geographic exclusions returned: Brazil, Crimea, Cuba, Iran, North Korea, Quebec, Russia. India is not listed as excluded. Student status and legal age still matter.
- Rules: "Projects must be original and developed during the hackathon period".
- Rules: "Submissions must not violate any copyright, licensing, or third-party IP rights".
- Public repository with source and documentation is required; organizers/judges cannot compete.

Contact: oneaquahealth@ieee.org. No messages sent.
This guide is a helper. If it differs from the Devpost website, the website prevails.
No rules agreement has been inferred or recorded.

Sources:
- [Rules](https://oneaquahealth-ieee-hackathon.devpost.com/rules)
- [Overview and requirements](https://oneaquahealth-ieee-hackathon.devpost.com/)
- [Updated announcements](https://oneaquahealth-ieee-hackathon.devpost.com/updates)
- [OneAquaHealth tracks](https://www.oneaquahealth.eu/oneaquahealth-ieee-global-hackathon/)

## 3. Tracks and actual scope
| Track | Official direction | Limnora proof |
|---|---|---|
| 1 Citizen Science UX | Guided assessment, simpler terms, better accuracy and engagement | One-minute report, Hindi/English category labels, safe follow-up |
| 2 Data-to-Insight | Maps, dashboards, trends, One Health summaries | Real water-body counts, timeline, explicit evidence-based concern reasons |
| 3 AI-Supported Assessment | Responsible AI, validation, explainability, human judgment | PRIMARY: Evidence Loop, disagreement, abstention, correction and review |
| 4 Awareness & Storytelling | Educational modules, stories and personalized insights | Short evidence-specific ecosystem context; supporting only |
| 5 Community & Gamification | Sustained participation | Revisit request and confirmation; no leaderboard rewarding report spam |
| 6 Resilience Informatics | Predictive dashboards, alerts, planning | Descriptive emerging-concern signals; do not claim validated prediction |
| 7 Digital Health Standards | FHIR models, agents and integration | Documented environmental export; FHIR only after validation against a real profile |

Select one primary track: Track 3. Supporting capabilities do not imply entry or prizes in every track. A particular AI provider, custom training, hardware or official government integration is not required by the fetched track requirements.

## 4. Judging plan
The rules table gives weights below; the criteria endpoint labels them Architecture, UX and Scale and returns a different scale. Use the rules weighting for planning, not a fabricated scoring claim.

| Criterion | Weight | Demonstration |
|---|---:|---|
| Mission impact | 30% | Real Sagar pond evidence; explain who can act on repeated observations |
| Innovation | 20% | AI disagreement → targeted follow-up → corrected record |
| Technical implementation | 20% | Working upload, persistence, actual model call, failure recovery, traceable records |
| Usability | 15% | No login; clear selection, camera preview, usable mobile controls |
| Feasibility and scalability | 15% | Free-tier limits, indexed water-body history, export, privacy and moderation design |

One Health explanation must connect visible environmental changes to habitat/biodiversity and potential community relevance without diagnosing illness or claiming measured dissolved oxygen, contamination or pathogen levels.

## 5. Free vision API options
These APIs interpret an uploaded photo; they are not image-generation APIs.

### Recommended initial candidate: NVIDIA through existing OpenRouter key
Model ID: `nvidia/nemotron-nano-12b-v2-vl:free`.
The provider page lists image/text/video input, text output and zero token pricing. It is designed largely for document/video understanding; pond accuracy MUST be evaluated, not assumed.
OpenRouter's free plan currently lists 50 requests/day; availability and upstream throttling apply. Run a real key-backed image test before locking the model.
The endpoint notice specifies trial use, prompt/output logging and no sensitive content. This is suitable to evaluate the hackathon prototype; do not promise a production service on those trial terms.

### Alternative: Google Gemini Developer API
Selected models support image input with free input/output tiers. Select an available vision model from the account dashboard and verify its actual quota before implementation; do not retain an obsolete Gemini 2.0 default.
Free-tier submitted content may be used to improve Google's products. Compress images, remove EXIF, avoid people/private information, and explain external AI processing to users.

### NVIDIA direct hosted API
Trial service credits may be provided under NVIDIA trial terms. Do not describe this as unlimited free hosting or guarantee a fixed credit amount. Check the account entitlement and exact vision model before adding another provider.

Decision: use one provider first, evaluate 10–20 relevant photos, support a configured alternative only if necessary. Free models are not necessarily reliable enough for uninterrupted public usage.

Sources:
- [Nemotron VL free model](https://openrouter.ai/nvidia/nemotron-nano-12b-v2-vl:free)
- [OpenRouter pricing](https://openrouter.ai/pricing/)
- [Gemini pricing and data treatment](https://ai.google.dev/gemini-api/docs/pricing)
- [NVIDIA trial terms](https://assets.ngc.nvidia.com/products/api-catalog/legal/NVIDIA%20API%20Trial%20Terms%20of%20Service.pdf)

## 6. Real map and water-body selection
OpenFreeMap Liberty + one MapLibre instance in a React-owned card container. No competing iframe, raster, Leaflet or global absolute-position hacks.

Flow:
1. User requests location; show locating/denied/timed-out/unavailable states and accuracy.
2. Center at device position; display user-location dot separately from selected-water marker.
3. Query rendered water polygons and water labels on click. Identify geometry/property names by inspecting the active style; do not assume every tile carries a name or stable OSM ID.
4. Resolve the exact selected water body using OSM geometry lookup where needed. Cache lookup, debounce requests, handle service downtime and respect provider policies.
5. Attach stable OSM identity where available; otherwise use a local water-body UUID. Nearest arbitrary reverse-geocoded address is not proof of pond identity.
6. Named lake/pond: auto-fill name and source. Unnamed feature: "Unnamed water body", allow optional local name, keep source distinction.
7. Highlight selected geometry, show a water icon and a real "Report here" action.
8. Existing report icons show actual coordinates/category and open their records. No sample markers.

Location policy: require a recent position for new on-site reports as requested by user. Permit a bank-side proximity allowance that accounts for GPS accuracy and large polygons; do not require the observer to stand in water. A fixed radius is a product setting, not a hackathon rule. Reject stale/poor positions with actionable guidance. Server validates coordinates, timestamps and distance; client-only gates can be bypassed. Browser GPS can be spoofed and is never proof of presence. Only the public water-body point is published; do not store or expose precise home position.

## 7. Real photo and AI workflow
- Actual camera/upload input with preview of the selected image; no stock screenshot or demo-photo button.
- Validate MIME/signature, size, decode and pixel dimensions server-side.
- Compress/re-encode, strip EXIF before external processing/public storage.
- Save report and private evidence first; run assessment with pending/completed/unavailable states. AI failure must not lose a saved report.
- Only fields validated by the server can be persisted; no browser-supplied AI conclusions.
- Vision request uses submitted image plus observer context, treated as untrusted data.
- JSON schema: likely category, visible evidence, alternatives, image relevance, uncertainty, observer agreement, suggested follow-up and review requirement.
- Model self-reported numeric confidence is not calibrated probability. Prefer qualitative uncertainty; if displaying a number, label it as an uncalibrated model estimate.
- Save model ID, prompt version, assessed time and human correction.
- SHA-256 detects exact duplicate files; perceptual comparison can flag resized duplicates, not prove fraud.
- Camera capture, EXIF and GPS do not prove authenticity. Do not market AI-generated-image detection as reliable.
- No unsupported disease, drinking safety, pollutant concentration or species certainty.

## 8. Product sections
Explore: real map, category/date filters, optional layer legend with real categories, empty-state guidance, actual nearby counts.
Report: selected water-body name/source, privacy-safe location, photo, category, observed date, description, color, smell, coverage; loading and validation.
Water-body detail: real reports, photos, category totals, confirmations, history, status reason; no assessment before evidence.
AI evidence panel: actual prediction/evidence, disagreement, alternatives, follow-up, human correction.
Insights: trends from saved records; count of reports, not prevalence; no percentages without comparable denominators and periods.
Trust block: no signup, AI limitations, public point privacy, safe bank observation, external image processing.
Review: "I observed this too" stored with a random device token and deduplication; same device clearing storage is not an independent observer guarantee.
Export: documented JSON with provenance; validated FHIR profile as a stretch feature.

Remove fake Bhopal labels, 297 count, 81% confidence, 38% growth, hardcoded Watch, canned success assessment, seeded reports and stock screenshots. Never turn failed cloud writes into a false "saved publicly" message. Local drafts must explicitly say draft.

## 9. Backend and data model
Entities: water_bodies, observations, photo_assets, assessments, confirmations, review_events.
Separate immutable raw observation and editable review/assessment history.
Server API routes: water-body lookup, reports read/create, upload, assessment, confirmation, export.
Supabase Postgres + Storage. RLS on all exposed tables; narrow reads/writes. Private originals; public compressed image only when permitted. Never expose device tokens in public queries.
Rate-limit anonymous writes, limit upload sizes, and use atomic confirmation deduplication. Prefer server-mediated writes; privileged secret if used belongs exclusively on the server. Current broad anon insert SQL is not the final security model.
Indexes: water_body_id + observed_at, category + created_at. Pagination and bounded map queries.

## 10. Priorities before deadline
P0: eliminate all fake data; real map selection and names; real upload; persistent report; actual AI evidence + unavailable fallback; real category marker; detail/timeline; README and deployment.
P1: Evidence Loop follow-up and correction; confirmations; actual insights and JSON export.
P2: paired-photo qualitative change, Hindi labels, interoperable validated FHIR profile, activity zones.
Cut P2 before risking P0. No custom training, government API, IoT, hospital integration or elaborate gamification.

## 11. Evaluation and demo
Use original safe-bank photos with permission. Test floating plants, algae-like surface, aquatic grass, litter, biodiversity, unrelated image, blurry image and ambiguous image.
Record expected coarse category/relevance, model output, disagreement, abstention, latency and failure. Keep uncertain labels; do not call volunteer labels expert ground truth.
Revisit the same pond only when genuinely possible. Different viewpoint/lighting means change cannot be quantified from two ordinary photos. Show qualitative differences, not fabricated coverage growth.

3–5 minute demo:
- 0:00 local problem and One Health relevance.
- 0:25 location and actual pond selection/name.
- 0:55 capture/upload, preview and submit.
- 1:30 AI checks an intentionally misclassified observation; show evidence and correction.
- 2:15 marker, saved record, refresh persistence and timeline.
- 2:50 follow-up/confirmation and transparent concern summary.
- 3:30 export, architecture, limitations and next user.
Use recorded real output only if clearly labeled; never substitute fixed responses as live inference.

## 12. Submission checklist
- Explicit primary Track 3 and supporting scope.
- Problem, users, solution, innovation and expected impact.
- Public code repository, source, licenses and setup documentation.
- Working prototype URL with no user login requirement.
- 3–5 minute demo video.
- Architecture diagram and real test results.
- Provider/API and location/photo limitations.
- Working links and fresh-browser smoke test.
- Accurate attribution for MapLibre/OpenFreeMap/OpenMapTiles/OpenStreetMap and other dependencies.
Do not imply OneAquaHealth endorsement or display sponsor logos as Limnora partners.
Official app, City Dashboard, Resilience Map, GEOSSIP and OAH-FHIR session resources are relevant references, not integrations already implemented. Review resources at https://www.oneaquahealth.eu/project-events/ and document only what was actually inspected.

## 13. What the user needs to configure
Required: Supabase project URL, publishable/anon key, and existing OpenRouter key. Put secrets in local .env.local; never paste them into chat or commit them.
Initial candidate OPENROUTER_MODEL=nvidia/nemotron-nano-12b-v2-vl:free.
Optional alternative: Google AI Studio API key after validating free model access.
Map needs no key. No government, Google Maps, payment, login or hardware credentials.
Real testing requires 2–3 original nearby pond photos and browser/device location permission. Supabase schema/storage setup must use the revised secure schema before launch.

## 14. Completion criteria
Fresh browser works; map remains within card; named pond click selects actual body; unnamed fallback works; location errors are clear; report/image persist; refresh retrieves record; real marker opens it; AI calls process the uploaded image; AI outage still preserves report; corrections are traceable; zero records show empty states; insights contain only saved data; export corresponds to selected record; no secrets in browser bundle.

