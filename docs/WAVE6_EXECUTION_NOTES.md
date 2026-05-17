# WAVE6_EXECUTION_NOTES.md — Case Packet / Appeal Context

## Scope

Wave 6 adds a reactive appeal-support view. It does not add scheduled digest,
Calibration Mode, queue dashboards, AI/LLM features, automatic enforcement, or
external services.

## Implemented Shape

- `POST /api/case-packet` accepts `GenerateCasePacketRequest`.
- Demo packets use deterministic seeded Wave 6 data and do not mutate Redis.
- Stored packets can be generated from tracked Apply Policy `ActionEvent` IDs.
- Packets include action summary, policy version/snapshot context,
  consistency status, override review context, prior same-user same-rule
  history, deterministic comparable cases, appeal posture, caveats, and
  Markdown export.

## Comparable Cases

Comparable cases are deterministic only:

- same rule key,
- current action excluded,
- prior action within the configured time window,
- same offense bucket when known,
- same selected or recommended action family,
- optional target type reason when target type matches.

The implementation does not use embeddings, LLMs, vague semantic similarity,
or cross-subreddit comparisons.

## Appeal Posture

Appeal posture is a caveated status for moderator review:

- `policy_consistent`
- `justified_override`
- `review_recommended`
- `insufficient_history`
- `policy_changed_since_action`
- `unknown`

It is not legal advice, not final moderation advice, and not automated appeal
adjudication.

## Runtime Status

Local build, typecheck, tests, and lint pass. `npm run dev` reached Devvit
Playtest ready for `r/modmirror_dev` on version `v0.0.1.17`.

Browser QA was completed in the signed-in Reddit playtest UI. The Case Packets
page generated the demo packet, displayed policy version, consistency, accepted
override review, prior same-rule history, deterministic comparable case reasons,
caveats, and Markdown export. The Copy Markdown control reported success.
