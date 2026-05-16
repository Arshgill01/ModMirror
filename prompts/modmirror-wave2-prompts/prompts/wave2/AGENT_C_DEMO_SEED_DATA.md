# Agent C — Wave 2 Demo Seed Data

## Role

Build the mandatory demo data path for ModMirror.

Demo mode is non-negotiable. It ensures screenshots/video show value even if a test subreddit has no meaningful moderation history.

## Read First

- `AGENTS.md`
- `PLAN.md`
- `docs/PRODUCT.md`
- `docs/DEMO_SCRIPT.md`
- `docs/DATA_MODEL.md`
- `prompts/wave2/WAVE2_ORCHESTRATOR.md`
- `.codex/skills/modmirror-product-guardrails/SKILL.md`

## Goal

Create realistic seeded data for Mirror Scan:

- fake subreddit,
- rules,
- removal reasons,
- 50-80 historical actions,
- intentional Rule 2 enforcement drift,
- stable Rule 3 enforcement,
- severe Rule 1 cases.

## Suggested Files

```txt
src/server/services/demoData.ts
src/server/services/demoScan.ts
src/shared/demo.ts
```

Or place seed data wherever the repo conventions indicate.

## Required Demo Scenario

Fake subreddit:

```txt
r/ExampleLearning
```

Rules:

1. Be civil
2. Low-effort questions
3. Self-promotion

Removal reasons:

- Rule 1: Be civil
- Rule 2: Low-effort question
- Rule 3: Self-promotion

Seed actions:

- 60 total actions recommended.
- Rule 2 should clearly show drift:
  - around 12 remove + warning outcomes,
  - around 5 removal-only outcomes,
  - around 4 temporary ban suggestion/escalation outcomes,
  - all plausibly first-time or similar low-effort cases.
- Rule 3 should be mostly consistent removals.
- Rule 1 should include severe cases and escalation.
- Include some unmatched/noisy actions so confidence breakdown is realistic.

## Required Output

Demo mode should produce the same shape as live source loading, e.g. `MirrorScanSources`.

It should be possible for the Mirror Scan service to run the same attribution engine against demo data.

Do not hardcode final dashboard numbers separately from the scan logic. The demo should exercise the actual pipeline.

## Dashboard Copy

Demo mode must be clearly labeled:

> Demo data — not real subreddit moderation history.

## Acceptance Criteria

- Demo scan works without Reddit API data.
- Demo data creates a meaningful drift candidate for Rule 2.
- Demo output includes high/medium/low/unmatched confidence variety.
- The dashboard or endpoint can request demo mode explicitly.
- Demo data does not leak into live mode accidentally.

## Commit Guidance

```bash
git add src/server/services/demoData.ts src/server/services/demoScan.ts
git commit -m "feat: add Mirror Scan demo seed data"
```
