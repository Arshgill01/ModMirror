# Wave 5 Prompt Pack — Governance Core

Use this pack after Wave 3/4 has landed on `master`.

## Recommended usage

Start from a clean default branch:

```bash
git checkout master
git pull --ff-only
git status
```

If your repo uses `main`, replace `master` with `main`.

Then feed Codex:

```txt
prompts/wave5/WAVE5_MASTER_GOAL.md
```

## Included prompts

- `WAVE5_MASTER_GOAL.md` — one-agent end-to-end wave execution
- `WAVE5_ORCHESTRATOR.md` — wave objective and acceptance criteria
- `AGENT_A_POLICY_VERSIONING.md`
- `AGENT_B_POLICY_HEALTH_ENGINE.md`
- `AGENT_C_OVERRIDE_REVIEW_INBOX.md`
- `AGENT_D_GOVERNANCE_DASHBOARD_UI.md`
- `AGENT_E_TESTS_DOCS_RUNTIME.md`
- `MERGE_CHECKLIST.md`

## Branch split

Suggested worktrees/branches:

- `feat/wave5-policy-versioning`
- `feat/wave5-policy-health-engine`
- `feat/wave5-override-review`
- `feat/wave5-governance-dashboard`
- `test/wave5-docs-runtime`
- `integration/wave5-governance-core`

## Wave 5 must leave the app in a polished intermediate state

The app should be demoable after Wave 5 even before Wave 6.

A judge should be able to understand:

> This app does not just record actions. It helps a moderation team improve policy over time.
