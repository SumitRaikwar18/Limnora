# Original-photo evaluation

No ecological accuracy result has been measured yet. Synthetic integration fixtures are excluded.

1. Upload permissioned original freshwater photographs through Limnora and screen them.
2. Copy `manifest.example.json` to `manifest.json`. Add cases with `observation_id`, `reference_category`, and `permissioned_original: true`. Record who assigned the reference labels in `label_source`.
3. Run `node scripts/evaluate-freshwater.mjs evaluation/manifest.json` while the app is running.
4. Review and publish results with sample size, model, prompt version, failure/uncertain counts and label limitations. The script compares stored results; it does not call the provider again.

Include ordinary vegetation, surface scum, litter, ordinary water and ambiguous/unrelated photos. Compare observer labels and independent image interpretations separately. Team labels are not expert ground truth. Small convenience samples cannot establish deployment accuracy.

The tool deliberately fails on an empty manifest instead of producing an invented accuracy claim. It reads the current 200-record API window; larger datasets need pagination before evaluation.
