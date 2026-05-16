# AGENT_D_GOVERNANCE_DASHBOARD_UI.md — Governance Dashboard UI

## Mission

Make Wave 5 visible and demoable.

Build the dashboard surfaces for:

- Policy Health
- Override Review Inbox
- Policy Version History

## Read First

- AGENTS.md
- docs/PRODUCT.md
- prompts/wave5/WAVE5_ORCHESTRATOR.md
- current dashboard implementation

## UX Principles

- Clarity over density.
- Team-level language, not blame.
- Show insufficient-data states gracefully.
- Make the governance loop obvious.
- Preserve the tagline: "Find enforcement drift before your users do."

## Required UI Sections

### 1. Governance Overview

Show high-level cards:

- total active policies
- stable policies
- policies needing review
- unresolved overrides
- last scan date if available

### 2. Policy Health Cards

For each active policy/rule:

Show:

- rule name
- health status
- total actions
- adherence rate
- override count
- unresolved override count
- top issue/reason
- recommendation
- link/button to review overrides
- link/button to edit policy if existing UI supports it

Statuses should be visually distinct, but avoid needing custom design perfection.

### 3. Override Review Inbox

Show unresolved overrides first.

Each row/card:

- rule name
- recommended action
- selected action
- override reason
- createdAt
- review status
- optional note
- actions:
  - Accept exception
  - Mark policy needs update
  - Needs team discussion
  - No action needed

Include optional review note if feasible.

### 4. Policy Version History

For a selected policy or policy card:

Show:

- current version number
- createdAt
- createdBy if available
- change reason/summary
- previous versions list

This can be simple. Do not overbuild.

### 5. Empty States

Handle:

- no policies
- no overrides
- no health data
- demo mode active
- sparse data

Good copy examples:

```txt
Not enough tracked actions yet.
Create a policy now; ModMirror will start measuring consistency from future actions.
```

```txt
No unresolved overrides.
Your team has no policy exceptions waiting for review.
```

## API Integration

Use endpoints created by other Wave 5 agents where available.

If working before endpoints exist, create typed placeholders/mocks but remove hardcoded fake production behavior before integration.

Demo data mode may remain if clearly labeled.

## Tests

Add UI tests only if existing setup supports them.

At minimum:
- build/typecheck must pass,
- no runtime undefined crashes for empty states.

## Acceptance Criteria

- Dashboard clearly shows Wave 5 value.
- Override review actions work through API.
- Policy health status is visible.
- Policy version info is visible.
- Empty states do not feel broken.
