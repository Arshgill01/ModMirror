# AGENT_B_POLICY_DASHBOARD_UI.md

## Role

You own the Policy Agreement Flow UI in the ModMirror dashboard.

## Read First

- `AGENTS.md`
- `PLAN.md`
- `RESEARCH.md`
- `docs/PRODUCT.md`
- `docs/DECISIONS.md`
- `docs/WAVE3_4_EXECUTION_NOTES.md`

## Goal

Build dashboard UI that lets moderators turn drift candidates into policies and manage policies.

## Required UX

### 1. Policy Overview

Add a dashboard section/page showing:

- existing policies,
- rules covered,
- active/inactive state,
- default message delivery mode,
- created/updated metadata if available.

### 2. Create Policy From Drift Candidate

From a Wave 2 drift candidate, allow:

- click/select drift candidate,
- prefill rule name/id where possible,
- show what drift was found,
- create recommended policy ladder.

Example ladder:
- first offense: remove + warning
- second offense: remove + formal note
- third offense: suggest temporary ban
- severe case: manual review

### 3. Manual Policy Creation

If no drift exists or no policy exists:

- allow manual policy creation,
- choose rule,
- enter policy steps,
- choose default message mode.

### 4. Empty Policy Fallback

If a rule has no policy, UI should say:

> No team policy exists for this rule yet. Create one now.

Do not show dead empty state.

### 5. Small Subreddit Mode

If scan data is weak/low volume:

> Not enough history for reliable drift detection yet. Set your team policy now; ModMirror will start measuring consistency from today.

### 6. Demo Mode Support

Ensure seeded demo data supports creating a policy.

## Design Constraints

- Clean, clear, not overdesigned.
- Avoid huge dependency additions.
- Reuse existing styling/components.
- Show confidence labels from Wave 2.
- Make it obvious that historical attribution is inferred.

## API Integration

Call policy endpoints/services implemented by Agent A if available. If not, create frontend placeholders with TODOs, but prefer actual integration.

## Do Not Build

- Apply Policy post/comment menu flow.
- Override audit logic.
- Reddit moderation execution.
- Appeal packets.

## Tests

Add UI tests if existing setup supports them. Otherwise add pure/render-safe tests where easy and document manual QA steps.

## Completion Report

Update `TODO.md` with:
- UI routes/components added,
- API endpoints used,
- manual QA steps,
- known gaps.
