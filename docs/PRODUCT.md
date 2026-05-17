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

### 5. Governance Core

Wave 5 turns the audit trail into a team feedback loop.

It adds:

- immutable policy version history,
- policy snapshots on Apply Policy action logs,
- override review statuses,
- deterministic policy health scoring,
- a governance dashboard for health, review, and version context.

This lets a lead mod answer:

- Which rules appear stable?
- Which rules need review?
- Which overrides are unresolved?
- Which policy version was active when an action was taken?

### 6. Case Packet / Appeal Context

Wave 6 turns governance data into an appeal-support view.

When a user challenges a moderation action, a moderator can generate a Case
Packet that shows:

- what tracked action happened,
- which rule and policy version were recorded for that action,
- whether the selected action matched the policy recommendation,
- whether an override exists and how it was reviewed,
- prior tracked same-rule actions for the same user,
- deterministic comparable cases with match reasons,
- a caveated suggested appeal posture,
- a Markdown export for review notes.

This is not an AI fairness judgment and not appeal automation. It is an
evidence packet rooted in ModMirror's own policy and consistency records.

### 7. Productized Command Center

Wave 7/8 turns the prototype dashboard into a Reddit-native moderation command
center.

The app no longer renders a full raw dashboard in the inline post. It starts as
a compact launch/status card with data mode, top issue, unresolved overrides,
active policies, and an Open Dashboard action. Open Dashboard requests Reddit's
native expanded WebView modal when available, preserving the Devvit viewport
dropdown for reviewer/device switching, with an in-post fallback if the host
does not honor the request. The expanded/fallback dashboard uses this IA:

- Command Center
- Scan
- Policies
- Review
- Case Packets
- Digest
- Settings

The Command Center shows consistency score, top issue, unresolved overrides,
active policies, last scan, data mode, setup progress, and the next best
moderation-governance action.

### 8. Manual Digest + Runtime Settings

Wave 7/8 adds a manual Digest page and runtime Settings page.

The Digest page generates deterministic Markdown from Command Center and policy
health data. It includes data mode, policy health, top recommendations,
unresolved overrides, and caveats. There is no scheduler in this wave.

The Settings page shows live/demo mode, Redis/API status where available, last
scan context, policy/override counts, demo state, delivery mode, and runtime
caveats. The default delivery posture remains `log_only`.

### 9. Digest History + Launch Readiness

Wave 9/10 turns the manual digest into a persisted reporting loop and prepares
the app for submission.

Digest reports are deterministic records built from active policies, policy
health, override review statuses, recent Apply Policy actions, and last scan
metadata. A moderator can generate a digest now, preview the report, copy
Markdown, and see digest history. Mod discussion delivery and weekly scheduling
remain disabled/unverified unless runtime playtest proves a safe path.

Launch readiness adds app review/data practices documentation, submission copy,
screenshot/video planning, and a final checklist without publishing or
submitting anything publicly.

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

If the user appeals, the moderator opens Case Packets and generates an appeal
context packet. ModMirror shows the policy version active at action time, the
accepted override reason when present, prior same-rule history for that user,
deterministic comparable cases, and Markdown export.

The 3-minute Wave 7/8 demo starts from the inline launch card, opens Command
Center, loads the ExampleLearning scenario, creates the Rule 2 policy, applies
a stricter sample action with an override reason, reviews the exception inbox,
exports a Case Packet, and generates a manual Digest.

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
- Automated appeal adjudication.
- Legal/fairness conclusions.
- Automatic/scheduled digest delivery unless explicitly opted in and
  runtime-verified.
- Calibration Mode.
- Cross-subreddit comparisons.
- External analytics.
- LLM summaries.
- Payments/premium features.

## Submission Claim Boundaries

Safe claims:

- ModMirror helps reveal enforcement drift.
- ModMirror helps teams define rule policies.
- ModMirror provides consistency nudges.
- ModMirror helps teams review exceptions and improve policy over time.
- ModMirror can generate appeal context from policy versions, tracked actions,
  overrides, and deterministic comparable cases.
- ModMirror is human-in-the-loop.
- ModMirror uses deterministic attribution and confidence scoring.

Avoid claims:

- First ever mod notes tool.
- First ever removal reason tool.
- First ever strike system.
- Fully solves moderation fairness.
- Decides appeals automatically.
- Automatically detects all rules correctly.
- Replaces moderators.
