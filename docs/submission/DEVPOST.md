# Limnora

## One-line summary

Limnora turns uncertain freshwater citizen observations into traceable, human-reviewed evidence and targeted revisit questions.

## Tagline

From observation to evidence: AI-supported freshwater citizen science that knows when to ask humans to look again.

## Primary track

Track 3 - AI-Supported Assessment.

## Supporting tracks

Track 1 - Citizen Science UX.
Track 2 - Data-to-Insight.
Track 7 is represented only as an interoperability prototype, not validated FHIR conformance.

## Problem

Citizen observations can help monitor urban freshwater ecosystems, but a photo and a quick category choice can be ambiguous. Reports may be inconsistent, and it is risky to turn a single image into a water-health conclusion.

## Solution

Limnora is an evidence-assurance layer for freshwater citizen science. A resident selects a mapped or declared freshwater body, submits a permissioned photo and structured field context, and the app saves the observation before AI screening. The AI examines the image without receiving the observer category, explains visible evidence, alternatives and uncertainty, then the app compares that interpretation against the immutable observer label. If evidence is unclear or disputed, Limnora keeps the disagreement visible, opens human review, and generates a focused revisit question.

## Why this matters

OneAquaHealth connects ecosystem health, biodiversity and human well-being. Limnora supports that mission by improving the reliability and traceability of citizen-generated freshwater evidence before downstream dashboards, researchers or community stewards act on it.

## How we used AI

The AI is used for independent image-first evidence screening. It does not receive the observer category, does not certify water safety, and does not replace human judgment. The output is constrained to visible evidence, alternative explanations, relevance, uncertainty and one safe follow-up question. Failed AI calls preserve the saved observation and any prior successful screening.

## How we used Codex

Codex helped design the evidence-assurance workflow, implement the Next.js/Supabase/OpenRouter prototype, harden privacy boundaries, build tests, document limitations and prepare judge-facing submission materials.

## Key features

- No-signup freshwater reporting.
- OpenStreetMap-backed water-body selection with observer-declared fallback.
- Permissioned photo upload with EXIF stripping.
- Structured field context with Unknown as a valid answer.
- Image-first AI screening without observer-label leakage.
- Immutable original observations and additive human reviews.
- Disagreement and uncertainty surfaced as a product moment.
- Focused revisit task and linked revisit comparison.
- Per-water-body evidence timeline and export.
- Limnora JSON export and FHIR interoperability prototype.

## Architecture

Next.js App Router provides the user interface and server routes. Supabase stores water bodies, observations, public photo derivatives, confirmations and review history. OpenStreetMap/Overpass resolves inland water-body provenance. OpenRouter provides image-capable AI screening through a server-side route. Evidence exports are generated from loaded water-body observations.

## Responsible AI

Limnora does not ask AI to decide whether water is healthy. It asks AI to independently examine what is visible, expose uncertainty, preserve the citizen's original observation, and identify what evidence humans should collect next.

## Limitations

Limnora is not a laboratory test, photo-authenticity detector, water-safety certificate, pathogen/toxicity assessment, official OneAquaHealth integration or validated FHIR implementation. Anonymous browser confirmations are not unique-person verification. A real permissioned photo evaluation is still required before any model agreement metric is claimed.

## Built with

Next.js, React, TypeScript, Supabase, OpenRouter, Sharp, MapLibre, OpenFreeMap/OpenStreetMap data and Lucide icons.

## Public demo link

https://limnora.vercel.app

## Public repository link

https://github.com/SumitRaikwar18/Limnora

## Demo video

Pending owner recording and public upload.

## Screenshot shot list

- Main map and report form.
- Freshwater field context form.
- AI evidence screening with uncertainty.
- Disagreement and human review card.
- Linked revisit comparison.
- Water-body evidence brief export.

## Submission readiness notes

The repository and local prototype are being prepared. Final Devpost submission still needs a deployed demo URL, permissioned field case if available, and a 3-5 minute video.
