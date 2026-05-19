# AI Privacy Readiness Gate

Created: 2026-05-20

## Current Status

ModMirror does not call external AI providers in the current build. The W10 AI
advisory spike remains disabled by default, uses mocked providers in tests, and
must not decide or execute moderation actions.

This note is the readiness gate that must be satisfied before any uploaded
build enables external fetch for AI advisory.

## Required Before External AI Fetch

- Product scope stays advisory-only. AI output must never classify violations,
  choose enforcement, approve bans, or bypass moderator confirmation.
- Provider terms review is recorded for the exact provider, model, endpoint,
  region/data-processing posture, retention policy, and prohibited-use terms.
- Privacy notice copy is updated to disclose external processing before any
  live provider call can be enabled.
- Moderator-facing UI copy states that AI advisory is optional, draft-only, and
  based on ModMirror evidence supplied by the moderator workflow.
- Inputs are minimized to deterministic ModMirror evidence summaries and stable
  evidence IDs. Do not send raw private mod logs, moderator names, author names,
  full post/comment bodies, secrets, access tokens, or unrelated subreddit data.
- Provider output must cite deterministic evidence IDs already supplied in the
  request. Uncited output remains rejected.
- Provider keys are stored only through Devvit app secrets or an equivalent
  reviewed secret store. No provider key may be committed, logged, exported, or
  embedded in client code.
- External HTTP permissions and provider domains are explicitly reviewed in
  `devvit.json` or equivalent config before upload.
- Runtime proof covers successful call, timeout, provider error, malformed
  response, missing citations, secret-read failure, and disabled fallback.
- Retention behavior is documented before persistence. Persist only the minimum
  advisory metadata needed for audit value, and keep payload deletion/dry-run
  behavior explicit.

## Non-Starters

- No AI moderation judge in v1.
- No AI-generated enforcement action without human confirmation.
- No automatic bans.
- No cross-subreddit benchmarking or training-data claims.
- No external AI call from demo mode unless the demo is explicitly labeled and
  uses non-sensitive synthetic data.

## Open Runtime Proof

- Devvit external fetch has not been runtime-verified by ModMirror.
- Devvit app secret retrieval has not been runtime-verified by ModMirror.
- Provider latency, timeout, and failure behavior are unverified.
- Terms/privacy review has not been completed for any provider.
