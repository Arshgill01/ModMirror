# Wave 9/10 Execution Notes — Digest, Delivery, Launch Hardening

## Purpose

Wave 9/10 is the final major system wave before final human submission work.

Wave 9 adds the proactive reporting loop:

> Generate Digest → review policy health → copy/send to mod team → optionally schedule weekly digest.

Wave 10 hardens the app for launch:

> QA matrix → app review/data practices → screenshots/video plan → app listing → Devpost draft → final release report.

## Strategic Goal

At the end of this wave, ModMirror should no longer feel like a prototype. It should feel like a launch-grade Reddit-native moderation governance app.

The product story should be:

1. ModMirror detects enforcement drift.
2. Mods create policies.
3. Mods apply policy.
4. Overrides are reviewed.
5. Case packets help with appeals.
6. Digests tell the mod team what changed and what to do next.
7. The app is polished enough to demo and submit.

## Wave 9 Scope

Build:

- Digest domain model.
- Deterministic digest engine.
- Manual **Generate Digest Now** flow.
- Digest preview UI.
- Markdown export/copy.
- Digest history.
- Optional mod discussion delivery if verified.
- Optional scheduler if verified.
- Runtime capability status for digest delivery and scheduler.

## Wave 10 Scope

Build:

- Launch readiness checklist.
- App review/data practices docs.
- README polish.
- App listing draft.
- Devpost draft.
- Screenshot/video plan.
- Final visual/runtime QA.
- Final wave report.

## Non-goals

Do not add:

- LLM summaries.
- AI content judgement.
- Generic queue dashboard.
- Automatic bans.
- External services.
- Cross-subreddit analytics.
- Premium/payments.
- Calibration quiz mode.
- Unverified scheduled posting as default behavior.

## Important Product Principle

Manual digest must be excellent. Scheduler and mod discussion delivery are optional.

The core product must still be judge-ready if only manual digest + copy markdown works.
