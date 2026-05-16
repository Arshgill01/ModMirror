# Wave 2 Execution Notes

## Wave 2 Theme

Mirror Scan + Attribution.

This wave creates the first real ModMirror product surface:

- load live/demo moderation sources,
- normalize actions/rules/removal reasons,
- infer likely rule attribution with confidence,
- show drift candidates in the dashboard.

## Branches

Recommended:

```txt
feat/wave2-attribution-engine
feat/wave2-demo-seed
feat/wave2-live-sources
feat/wave2-dashboard-scan
test/wave2-docs
integration/wave2-mirror-scan
```

## Do Not Build in Wave 2

- Policy Agreement Flow
- Apply Policy Action
- Override audit workflow
- AI/LLM classification
- automatic enforcement actions

## Wave 2 Completion Definition

Wave 2 is done when:

- Demo scan works and shows Rule 2 drift.
- Live scan is attempted with graceful warnings/fallbacks.
- Attribution returns high/medium/low/unmatched confidence labels.
- Dashboard renders scan summary and drift candidates.
- Tests or verification cover attribution and demo scan.
- Docs/TODO are updated for Wave 3.
