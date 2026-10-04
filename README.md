# Limnora

Zero-auth freshwater observation MVP for the OneAquaHealth hackathon.

## Real integrations

1. Create a Supabase project.
2. Run `supabase/schema.sql` in the Supabase SQL editor.
3. Copy `.env.example` to `.env.local` and add the Supabase URL, server-only secret key, and OpenRouter key. Never prefix server secrets with `NEXT_PUBLIC_` or commit `.env.local`.
4. Run `supabase/server-access-hardening.sql` in the SQL editor. This preserves data and restricts database access to the server role. This setup is necessary before public deployment.
5. Run `npm run dev`.

The server routes `/api/observations` and `/api/assess-observation` keep provider credentials out of browser code. The observation route persists public water-body reports in Supabase; the AI route calls OpenRouter server-side and returns a safe fallback when unavailable.

## Safety

Limnora is community screening, not laboratory testing. It must not certify water safety, diagnose illness, or replace professional inspection.

## Implemented Evidence Loop (primary Track 3)

- Actual free vision inference through OpenRouter, checked against its current image-capable model catalog. Structured JSON where supported, bounded model fallback, truncation/error checks and clear unavailable states. Free quota/availability is not guaranteed.
- Original category remains immutable. Human correction suggestions, disagreement and follow-up context are saved in the existing assessment JSON. Model history and human reviews use compare-and-swap updates to avoid overwriting concurrent changes.
- New reports reference a persistent community water-body UUID. Select an existing water-body record or start a new map-selected record. This is not an authoritative OSM identity resolver; different new map points can create separate records for the same physical lake.
- Revisit photos are new reports linked to the parent report and water-body ID. Observation date is separate from submission date. Legacy reports without a water-body ID remain accessible.
- Photos are decoded, bounded to 25 megapixels, resized, rotated and re-encoded as JPEG without EXIF. Hashes flag duplicate derivatives; this is not fraud or generated-image detection.
- Browser identity supports corroboration and original-browser review attribution; clearing cookies bypasses that identity. No signup required. Public API responses remove private identity hashes.
- Insights use original observer categories and at most 200 recent records. They are report counts, not measured water health or validated predictions.
- Per-process request limiting and assessment locks provide basic prototype protection. Public multi-instance deployment needs shared rate limits and stronger moderation.

## Verification

`npx tsc --noEmit`

`node --env-file=.env.local scripts/evidence-smoke.mjs`

The smoke test creates explicitly labeled temporary synthetic fixtures, tests upload/EXIF stripping/duplicates, human review, actual vision inference, linked follow-up and refresh persistence. It deletes only its own test records and photos. It is an integration test, NOT ecological accuracy validation. It requires a pre-existing public fixture photo and consumes free API quota.

Before submission: evaluate permissioned original freshwater photos, publish source with licenses/setup instructions, deploy a working prototype, and record a 3–5 minute honest demo. Do not present synthetic images or test records as real field evidence. No winner or worldwide-novelty claim is made.
