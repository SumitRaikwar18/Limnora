# Interoperability notes

Status: prototype only.

Limnora now offers two exports from a water-body evidence record:

- Limnora JSON evidence brief.
- FHIR interoperability prototype Bundle.

## FHIR status

- FHIR version target: R4 (4.0.1). Full R4 validator and profile validation have not been run. Resource references use illustrative absolute URLs; these are not live FHIR endpoints.
- Profile validation: not performed.
- OneAquaHealth profile validation: not performed.
- Claim level: experimental FHIR interoperability prototype.

## Mapping

- `Location` represents the community freshwater body.
- `Observation` represents each citizen-submitted observation.
- `effectiveDateTime` uses the actual observation time when available.
- Components carry visible field context such as observer category, coverage, water movement, colour, clarity, bank litter, aquatic life, and odour.
- Notes carry limitations, AI screening summary, model provenance, and next observation question.

## Limitations

The export is designed for handoff and discussion, not official clinical or environmental compliance. AI screening remains an interpretation of visible evidence and is not laboratory measurement, pathogen detection, toxicity analysis, potability assessment, or official OneAquaHealth integration.
