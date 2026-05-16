# Agent D — Wave 2 Dashboard Mirror Scan UI

## Role

Implement the dashboard UI for running/viewing Mirror Scan results.

This is the first product-facing surface.

## Read First

- `AGENTS.md`
- `PLAN.md`
- `docs/PRODUCT.md`
- `docs/DEMO_SCRIPT.md`
- `docs/DATA_MODEL.md`
- `RESEARCH.md`
- `prompts/wave2/WAVE2_ORCHESTRATOR.md`
- `.codex/skills/modmirror-product-guardrails/SKILL.md`

## Goal

Build a clear dashboard section/page that shows:

- Run Mirror Scan button,
- Use Demo Data button/toggle,
- scan summary,
- confidence breakdown,
- drift candidates,
- unmatched count,
- warnings/fallback messages,
- small-subreddit state.

## Suggested Files

Adapt to scaffold:

```txt
src/client/App.tsx
src/client/pages/MirrorScanPage.tsx
src/client/components/ScanSummary.tsx
src/client/components/DriftCandidateCard.tsx
src/client/components/ConfidenceBreakdown.tsx
src/client/components/EmptyState.tsx
src/client/api.ts
```

Server endpoint if not already present:

```txt
src/server/routes/scan.ts
src/server/index.ts
```

## UI Requirements

### Empty State

If no scan has run:

> Run your first Mirror Scan to see how your team has been enforcing rules.

Also show:

> No rich history? Try demo mode to see what ModMirror looks like on an active team.

### Demo Mode State

Clearly label:

> Demo data — not real subreddit moderation history.

### Scan Summary

Show:

- source: live/demo,
- total actions scanned,
- attributed count,
- unmatched count,
- high/medium/low/unmatched confidence counts,
- generated timestamp.

### Drift Candidate Card

Each card should show:

- rule name,
- confidence,
- action distribution,
- short plain-English finding,
- recommendation like “Create a policy for this rule in Wave 3.”

Do not build the actual Policy Agreement Flow yet. Use disabled/placeholder CTA:

> Create policy — coming in Wave 3

### Small Subreddit Mode

If few actions:

> Not enough history for reliable drift detection yet. You can still use ModMirror to define policies and prevent future drift.

## API Requirements

Use existing server route conventions.

Suggested endpoint:

```txt
POST /api/scan
body: { mode: 'live' | 'demo' }
```

or whatever the scaffold uses.

Return a typed response shape from shared schema.

## Acceptance Criteria

- Dashboard can run demo scan.
- Dashboard can attempt live scan.
- UI handles loading/error/empty states.
- UI shows drift candidate from demo data.
- UI does not crash if live scan returns empty/warnings.
- No policy editor or enforcement action is built yet.

## Commit Guidance

```bash
git add src/client src/server/routes src/server/index.ts
git commit -m "feat: add Mirror Scan dashboard UI"
```
