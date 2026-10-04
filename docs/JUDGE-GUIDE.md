# Limnora judge walkthrough

Primary Track 3: AI-Supported Assessment. Supporting Tracks 1 and 2.

Limnora turns uncertain urban freshwater observations into explainable, human-reviewed evidence and targeted revisit questions. It does not diagnose water safety from photographs.

## Demonstrate the working loop

1. Select a mapped freshwater body or explicitly declare an unmapped one. Explain provenance and Unknown fields.
2. Submit an original permissioned field photo with its actual observation time and structured notes. Do not present generated integration fixtures as field work.
3. Open screening: show visible evidence, alternative interpretations, uncertainty, model and prompt version. Demonstrate disagreement if it actually occurs; do not invent it.
4. Save a human interpretation with supporting reasons. Original category remains unchanged.
5. Open the focused revisit task. Submit a genuine later visit if available; otherwise show the pending task honestly.
6. Compare linked original/revisit photographs and observer notes. Different viewpoints limit comparison; no health improvement score is inferred.
7. Export the water-body evidence brief: loaded observations, field context, model provenance, unresolved questions and next observations. It is a handoff for review, not an official scientific report.

## Explain limitations

Integration tests are not ecological validation. Publish permissioned-image evaluation outcomes using ../evaluation/README.md before claiming measured accuracy. Anonymous browser corroboration is not expert or unique-person verification. OneAquaHealth mission references are not species-specific ecological validation. Map/provider outages remain possible. Researchers or qualified local environmental staff must determine whether further sampling is warranted.

Submission materials still require a public repository, clear track alignment, project description and a 3–5 minute video. No hackathon win, IEEE endorsement or certification is claimed.
# Judge checklist

- Live URL works in a fresh browser.
- Public repository is accessible.
- Demo video is public and 3-5 minutes.
- Primary track is stated as Track 3 - AI-Supported Assessment.
- Supporting Tracks 1 and 2 are described honestly.
- Any Track 7 claim is labeled a prototype unless validated.
- Permissioned showcase evidence is available, or the demo honestly shows a pending real field case.
- No fake records are presented as real field data.
- AI screening works or safe fallback is shown.
- Prior successful screening survives a failed retry.
- Disagreement and uncertainty are visible.
- Human review preserves the original observation.
- Linked revisit workflow works.
- Evidence export works.
- Mobile path is usable.
- README matches implementation.
- Limitations are visible.
- Map and third-party data attribution is correct.

## Final local verification — 4 October 2026

- `npm test`, `npm run typecheck`, and `npm run build` passed.
- Configured evidence smoke passed upload, EXIF removal, duplicate rejection, original-label preservation, additive review, actual `qwen/qwen3.8-27b:free` inference, linked follow-up and refresh persistence. Confirmation smoke passed browser deduplication. Both cleaned only their temporary fixtures. This is software integration evidence, not ecological evaluation.
- Chrome local browser checks opened Explore, the top-level Review workbench and an evidence dialog. Disputed evidence and original/revisit relationship appeared independently; retained screening and failed-latest-retry messages appeared together. No real report was edited during browser QA.
- DOM layout bounds were checked at actual CSS widths 320, 360, 375, 390, 413, 430, 768, 820, 1024, 1280, 1367, 1440 and 1920; document width stayed within the viewport. Chrome zoom required compensation, so requested 412/1366 became 413/1367. ResizeObserver updates lag rapid viewport changes; the settled 320px map canvas matched its 275px frame. These checks do not establish exhaustive visual, keyboard, phone, offline, permission-denied or cross-browser coverage.
- Console warnings inspected came from a browser extension, not Limnora. A desktop reviewer screenshot was visually inspected; an earlier screenshot request timed out. Hosted deployment, a real phone walkthrough and full FHIR/profile validation remain unverified.
