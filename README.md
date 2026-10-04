# Limnora

Signup-free urban freshwater evidence-to-action prototype for the [OneAquaHealth IEEE Global Hackathon](https://oneaquahealth-ieee-hackathon.devpost.com/).

Limnora helps citizens turn uncertain pond, lake and stream observations into explainable AI evidence, human-reviewed interpretations and focused revisit questions. It does not diagnose freshwater safety from photographs.

**Track alignment:** primary Track 3 — AI-Supported Assessment; supporting Track 1 — Citizen Science UX and Track 2 — Data-to-Insight. No IEEE endorsement or scientific validation is claimed.

## Quick start

Use Node.js 22 or newer and npm. The committed `package-lock.json` is used by these instructions.

```sh
npm ci
```

Configure Supabase and environment variables below, then:

```sh
npm run dev
# Open http://localhost:3000
```

For production: `npm run build`, then `npm run start`. Deployment needs the same environment variables on the server; never upload `.env.local`.

## Judge walkthrough

Select a mapped or explicitly observer-declared water body → submit a permissioned original photograph and field context → inspect independent image screening and uncertainty → save a reasoned human review → add a linked revisit → compare visits and export a water-body evidence brief.

Read [the walkthrough](JUDGE-WALKTHROUGH.md), [verification status](IMPLEMENTATION-STATUS-2026-10-04.md) and [evaluation instructions](evaluation/README.md). There is no fabricated field case or accuracy score. Visual/browser QA remains pending. Hosted demo and video URLs are not yet documented; the repository alone is not the complete hackathon entry.

## Real integrations

1. Create a Supabase project.
2. Run `supabase/schema.sql` in the Supabase SQL editor.
3. Copy `.env.example` to `.env.local` and add the Supabase URL, server-only secret key, and OpenRouter key. Never prefix server secrets with `NEXT_PUBLIC_` or commit `.env.local`.
4. Run `supabase/server-access-hardening.sql`, then `supabase/freshwater-readiness.sql` in the SQL editor. These preserve data and restrict database access to the server role. The readiness upgrade adds OSM identity/provenance and structured field context. The connected project was upgraded on 4 October 2026.
5. Run `npm run dev`.

Environment variables are documented in `.env.example`. `SUPABASE_SECRET_KEY` is the server-role credential. `OPENROUTER_MODEL` selects a vision-capable model; free availability and quotas vary. Explicit paid selection can consume credits. The anon key is not authorization to write protected tables. Manual reporting works without GPS; use HTTPS or localhost for browser location permissions.

The server routes `/api/observations` and `/api/assess-observation` keep provider credentials out of browser code. The observation route persists public water-body reports in Supabase; the AI route calls OpenRouter server-side and returns a safe fallback when unavailable.

## Safety

Limnora is community screening, not laboratory testing. It must not certify water safety, diagnose illness, or replace professional inspection.

## Implemented Evidence Loop (primary Track 3)

- Actual vision inference through OpenRouter, checked against its current image-capable model catalog. Structured JSON where supported, bounded free-model fallback, truncation/error checks and clear unavailable states. Free quota/availability is not guaranteed.
- Original category remains immutable. Human correction suggestions, disagreement and follow-up context are saved in the existing assessment JSON. Model history and human reviews use compare-and-swap updates to avoid overwriting concurrent changes.
- New mapped reports resolve inland geometry through OSM Overpass, receive a signed 30-minute selection token, and reuse a unique `osm:way:id` or `osm:relation:id` body key. Selection uses the same server lookup for either basemap. OSM coverage can be incomplete, and distinct mapped features may represent parts of one physical system. Unmapped bodies are explicitly observer-declared and can be reused through the saved-body selector. Neither mapping nor a declaration is a salinity measurement.
- Revisit photos are new reports linked to the parent report and water-body ID. Observation date is separate from submission date. Legacy reports without a water-body ID remain accessible.
- Photos are decoded, bounded to 25 megapixels, resized, rotated and re-encoded as JPEG without EXIF. Hashes flag duplicate derivatives; this is not fraud or generated-image detection.
- Browser identity supports corroboration and original-browser review attribution; clearing cookies bypasses that identity. No signup required. Public API responses remove private identity hashes.
- Field notes capture movement, colour, clarity, bank litter, aquatic life and naturally noticed odour with Unknown choices. Observation coordinates remain separate from the body's saved reference point. Insights and body timelines use visit date with consistent filters, and explain why evidence needs follow-up. They are not water-health scores or validated predictions.
- Image-first AI receives no observer category or descriptive guess. Its interpretation is compared to the immutable observer label on the server. The configured model may be paid only if explicitly selected; automatic fallback models remain free. One Health context is curated Limnora guidance linked to the project mission, not free-form model diagnosis. Prompt compliance is not a scientific safety guarantee.
- Public responses omit owner/reviewer hashes, image hashes and provider attempt diagnostics. Review suggestions remain attributed community suggestions, never expert adjudications. A prior completed screening remains visible after a failed latest retry.
- Per-process request limiting and assessment locks provide basic prototype protection. Public multi-instance deployment needs shared rate limits and stronger moderation.

## Verification

```sh
npm run test
npm run typecheck
npm run build
```

`npx tsc --noEmit`

`node scripts/freshwater-checks.mjs`

Original-photo evaluation instructions are in `evaluation/README.md`. No field-accuracy score is claimed until a permissioned labeled dataset is supplied and evaluated.

`node --env-file=.env.local scripts/evidence-smoke.mjs`

The smoke test creates explicitly labeled temporary synthetic fixtures, tests upload/EXIF stripping/duplicates, human review, actual vision inference, linked follow-up and refresh persistence. It deletes only its own test records and photos. It is an integration test, NOT ecological accuracy validation. It requires a pre-existing public fixture photo and consumes free API quota.

Before submission: evaluate permissioned original freshwater photos, publish source with licenses/setup instructions, deploy a working prototype, and record a 3–5 minute honest demo. Do not present synthetic images or test records as real field evidence. No winner or worldwide-novelty claim is made.

## Architecture and handoff

Browser → Next.js routes → Supabase REST / stripped public JPEG storage. Map selection → OSM Overpass geometry → signed selection token → unique water-body key. Saved photo → OpenRouter image inference → structured evidence → immutable observer comparison → community reviews and revisit timeline. Primary OneAquaHealth Track 3; supporting Track 1 and Track 2. No claim of IEEE certification, FHIR conformance, measured pollution, prediction, or verified physical presence.

OpenStreetMap data is ODbL; attribution appears on the map. MapLibre GL JS is BSD-3-Clause; other dependencies retain their package licenses. Submitted image rights remain with their owners; consent to public display is not a blanket reuse license.

Public photo moderation is operated by the project maintainer: review content concerns, identify the exact observation UUID and storage object, and remove inappropriate content through the Supabase dashboard. There is no staffed emergency response or automatic moderation service. Anonymous feedback remains susceptible to browser-identity resets.

## License and content rights

Original project code is released under the [MIT License](LICENSE), copyright Sumit Raikwar. Third-party packages, map data, tiles and submitted photographs retain their own rights; see [third-party notices](THIRD-PARTY-NOTICES.md). The code license does not license user photos or confer rights to hackathon/IEEE branding.
