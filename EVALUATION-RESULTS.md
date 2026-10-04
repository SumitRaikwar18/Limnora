# Limnora evaluation results

Status: awaiting permissioned original field photographs. No ecological accuracy claim is available.

## What is ready

The evaluation workflow can compare saved, image-first AI screenings against a small permissioned manifest of original freshwater photos. It reports:

- sample size,
- successfully screened versus unavailable or failed cases,
- expected and model-marked image relevance,
- observer/reference agreement,
- AI/reference coarse-category agreement,
- uncertainty distribution,
- review-needed disagreements,
- model and prompt version,
- date and limitations.

## What is not available yet

No permissioned real-world field-photo manifest was supplied during this sprint, so no sample size, agreement rate, or model performance number is reported here.

Team field labels must not be described as expert ground truth unless an expert actually supplied them. Any percentage produced later should be described only as coarse-category agreement on that convenience sample.

## How to populate

1. Upload permissioned original freshwater photos through Limnora.
2. Copy `evaluation/manifest.example.json` to `evaluation/manifest.json`.
3. Replace the placeholder case IDs with real observation IDs.
4. Run `node scripts/evaluate-freshwater.mjs evaluation/manifest.json evaluation/results.json`.
5. Paste the factual summary from `evaluation/results.json` into this file.

Synthetic integration fixtures are excluded from field evaluation.
