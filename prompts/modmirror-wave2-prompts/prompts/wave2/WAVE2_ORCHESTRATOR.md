# Wave 2 Orchestrator — Mirror Scan + Attribution

## Purpose

Coordinate Wave 2 implementation for ModMirror.

Wave 2 creates the first real product loop:

> Run Mirror Scan → normalize moderation history → attribute actions to rules/removal reasons → display drift candidates → support demo seed data.

## Required Reading

Before touching code, read:

- `AGENTS.md`
- `PLAN.md`
- `TODO.md`
- `RESEARCH.md`
- `docs/PRODUCT.md`
- `docs/DECISIONS.md`
- `docs/DATA_MODEL.md`
- `docs/DEVVIT_RESEARCH_QUESTIONS.md`
- any Wave 1 execution notes or completion reports
- `.codex/skills/devvit-research/SKILL.md`
- `.codex/skills/modmirror-product-guardrails/SKILL.md`
- `.codex/skills/wave-execution/SKILL.md`

If `RESEARCH.md` contradicts any prompt, `RESEARCH.md` wins.

## Wave 2 Scope

Build only:

1. Live source adapters for moderation log, removal reasons, and rules.
2. Normalization into ModMirror internal action/rule/removal-reason shapes.
3. Deterministic attribution engine with confidence scoring.
4. Demo seed data and demo scan.
5. Dashboard Mirror Scan UI.
6. Unit tests/pure-function tests where feasible.
7. Updated docs/TODO/RESEARCH notes.

Do not build:

- Policy Agreement Flow
- Apply Policy Action
- Override audit flow
- AI/LLM rule classifier
- full modqueue dashboard
- automatic bans
- external services

## Parallel Branch Split

Suggested branches/worktrees:

| Branch | Prompt | Purpose |
|---|---|---|
| `feat/wave2-live-sources` | `AGENT_A_LIVE_SOURCES.md` | Reddit/Devvit source adapters and normalization |
| `feat/wave2-attribution-engine` | `AGENT_B_ATTRIBUTION_ENGINE.md` | deterministic matching/scoring |
| `feat/wave2-demo-seed` | `AGENT_C_DEMO_SEED_DATA.md` | required demo dataset and demo scan |
| `feat/wave2-dashboard-scan` | `AGENT_D_DASHBOARD_SCAN_UI.md` | dashboard Mirror Scan display |
| `test/wave2-docs` | `AGENT_E_TESTS_DOCS.md` | tests, docs, TODO updates |

Integration branch:

```bash
git checkout master
git pull --ff-only
git checkout -b integration/wave2-mirror-scan
```

Use `main` instead of `master` if the repo uses `main`.

## Merge Order

Recommended merge order into `integration/wave2-mirror-scan`:

1. `feat/wave2-attribution-engine`
2. `feat/wave2-demo-seed`
3. `feat/wave2-live-sources`
4. `feat/wave2-dashboard-scan`
5. `test/wave2-docs`

Reason:
- Attribution and demo seed should be pure and easiest to stabilize first.
- Live sources can then plug into the same interfaces.
- Dashboard should consume stable scan result shapes.
- Tests/docs should finalize after paths stabilize.

## Acceptance Criteria

Wave 2 is complete only if:

- A user can run a Mirror Scan from the dashboard or an equivalent debug endpoint.
- Demo mode always returns meaningful drift data.
- Live scan attempts to use verified Devvit APIs and degrades gracefully if subreddit history is sparse.
- Attribution returns confidence labels: `high`, `medium`, `low`, `unmatched`.
- Dashboard shows confidence breakdown and unmatched counts.
- No inferred rule is displayed as certain unless confidence is high.
- Pure attribution functions have tests or at least an executable verification script.
- Build/typecheck/lint passes, or exact blockers are documented.
- TODO/RESEARCH/docs reflect Wave 2 status.
