# Limnora freshwater implementation status

Implemented 4 October 2026 for primary Track 3, supporting Tracks 1 and 2. This is a working prototype, not an IEEE-certified or scientifically validated assessment tool.

## Implemented

- Server-side OpenStreetMap geometry lookup, signed selections, stable source IDs and unique water-body reuse. Unmapped bodies have explicit observer-declared provenance. Map geometry does not verify salinity.
- Separate observation coordinates, freshwater attestation and optional structured field context with Unknown choices.
- Image-first vision inference without the observer's category in the model prompt; configured vision models supported, failure recovery and retained successful results.
- Explainable disagreement, unchanged original observations, community interpretation and focused revisits.
- Per-body evidence summaries and transparent follow-up reasons, using observation time rather than submission time.
- Curated conditional One Health guidance instead of model-generated health claims. No toxicity, pathogen, safety or calibrated health-score claims.
- Public assessment sanitization, remote additive Supabase migration and server-only table access.
- Optional GPS with accuracy visualization; manual reporting stays available without presence-verification claims.
- Permissioned original-image evaluation harness and empty manifest template. No fabricated evaluation outcomes.

## Verification actually performed

- Production build and TypeScript passed.
- Pure geometry/context tests passed: polygons, split relation rings, islands, salt exclusions, stream proximity, invalid inputs and observation-time summaries.
- Live smoke workflow passed: temporary photo upload, persistence, context/provenance, independent observation coordinates, duplicate handling, human review, actual OpenRouter vision inference and follow-up. Only temporary fixtures created by the test were removed afterward.
- Remote migration applied and checked: zero browser-role grants on the protected tables; existing observation retained.
- Live map API resolved a Sagar water polygon to OSM way 114573473. Its returned map name was empty; no place name was invented.
- Git whitespace check passed.

## Remaining evidence and submission work

- Supply original permissioned freshwater photographs and human reference labels; run and publish the evaluation, including failures. Integration success is not ecological accuracy.
- Demonstrate a genuine local observation and revisit. Synthetic/test photographs are not real field evidence.
- Full visual/browser QA was not completed: available browser automation could not initialize, and the fallback browser runtime lacked Playwright. Do not interpret API tests as visual validation.
- Hosted deployment, production environment verification, public repository updates, 3–5 minute demo video and Devpost submission remain separate deliverables.
- Prototype limitations include recent-row limits, process-local throttling, manual moderation and unverified anonymous browser identities.

No project can guarantee a hackathon win. The defensible differentiator is a traceable image-evidence → disagreement → human review → revisit workflow.
