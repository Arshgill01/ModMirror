# PRODUCT.md — ModMirror Product Spec

## One-liner

ModMirror helps Reddit mod teams find enforcement drift, agree on rule policies, and apply consistent moderation actions.

## Tagline

Find enforcement drift before your users do.

## Problem

Moderator teams often enforce the same rule differently over time or across moderators.

Examples:

- One mod warns first-time low-effort posts.
- Another mod removes without explanation.
- Another mod gives a temporary ban.
- A user appeals by pointing out inconsistency.
- The team has no clean shared memory of how similar cases were handled.

This creates:

- user distrust,
- appeal friction,
- mod team confusion,
- inconsistent onboarding for new mods,
- policy drift.

## Product Thesis

The winning moderation tool is not just faster.

It makes moderation more consistent, explainable, and team-aligned while preserving human discretion.

## Target Users

- Large subreddits with many moderators.
- Medium-sized communities with strong culture norms.
- Learning/help communities where strictness must be consistent.
- Communities onboarding new moderators.
- Communities with repeated rule violations and appeal friction.

## MVP Features

### 1. Mirror Scan

Shows how the team has actually enforced rules recently.

Inputs:

- mod log actions,
- removal reasons,
- subreddit rules,
- ModMirror-created actions,
- demo seed data if enabled.

Outputs:

- action volume,
- likely rule buckets,
- confidence levels,
- drift candidates,
- unmatched actions.

### 2. Policy Agreement Flow

Lets moderators create explicit policy ladders.

Example:

Rule 2: Low-effort questions

| Offense | Recommended action |
|---:|---|
| 1 | Remove + warning |
| 2 | Remove + formal note |
| 3 | Suggest 3-day ban |
| Severe | Manual escalation |

### 3. Apply Policy Action

A moderator can apply a policy to a post/comment.

Flow:

- choose rule,
- see recommendation,
- preview message,
- confirm action,
- log result.

Wave 3/4 implementation uses a dashboard simulator for this flow while Reddit
post/comment menu UX remains browser-unverified. Confirmed actions are stored
as `log_only` records.

### 4. Consistency Nudge + Override Audit

If a moderator deviates from policy:

> This action is stricter than the team policy. Continue with override?

The mod chooses a reason and can add a note.

Wave 3/4 stores action events and override events, and exposes aggregate
override summaries without per-mod blame.

## Primary Demo

A fake/test community has Rule 2 enforcement drift.

ModMirror shows:

- 12 warnings,
- 5 removal-only actions,
- 4 temporary bans,
- all for likely first-time low-effort violations.

The lead mod creates a policy.

A new violation appears.

ModMirror recommends remove + warning.

The moderator tries a 3-day ban.

ModMirror nudges:

> This is stricter than policy for a first offense. Continue with override?

The moderator either follows policy or records an override.

## Why It Wins

Most tools optimize individual moderator speed.

ModMirror optimizes team consistency.

That is:

- broader than one queue,
- more novel than removal templates,
- safer than AI enforcement,
- more memorable than a dashboard,
- directly tied to mod trust and community fairness.

## Out of Scope

- AI rule classification.
- Automatic ban execution as primary behavior.
- Queue dashboard.
- Toolbox replacement.
- Full appeal packet generation.
- Cross-subreddit comparisons.
- External analytics.
- LLM summaries.
- Payments/premium features.

## Submission Claim Boundaries

Safe claims:

- ModMirror helps reveal enforcement drift.
- ModMirror helps teams define rule policies.
- ModMirror provides consistency nudges.
- ModMirror is human-in-the-loop.
- ModMirror uses deterministic attribution and confidence scoring.

Avoid claims:

- First ever mod notes tool.
- First ever removal reason tool.
- First ever strike system.
- Fully solves moderation fairness.
- Automatically detects all rules correctly.
- Replaces moderators.
