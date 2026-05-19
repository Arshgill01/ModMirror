# Expansion Architecture Notes

## Integration Shape

Waves 16-34 are integrated linearly on `expansion/w34-integration`, descended
from `integration/operational-overhaul`. The wave branches remain reviewable
checkpoints, but the integration branch contains the full expansion line through
W33 plus W34 reporting.

## Current Product Architecture

- `src/routes/api.ts` remains the HTTP boundary for Devvit Web API calls.
- `src/server/services/*` holds operational logic and Redis persistence.
- `src/shared/schema.ts` is the shared contract layer for server/client/tests.
- `src/client/main.ts` is still a string-template client organized around Act,
  Scan, Agree, Review, Prove, and Settings.

## Operational Capability Areas Added In Expansion

- Context intake: content snapshots now flow through Apply Policy, receipts,
  and Case Packets.
- Queue awareness: modqueue triage is read-only and truthfully capability-gated.
- Calibration: moderator attribution corrections are stored and used by scans.
- Agreement: policy ratification thresholds and review state make adoption more
  explicit.
- Replay: proposed policies can be tested against scan/synthetic histories
  without mutating receipts.
- Review/proof: community health, policy impact, evidence boards, incident mode,
  appeal posture, and synthetic eval make policy consistency auditable.
- Operations: response templates, native Mod Note gates, delivery drafts,
  portability, subreddit isolation, privacy retention, mobile resilience, and
  runtime observability support real-world use without hiding unverified paths.

## Safety Gate Consolidation

Destructive or user-facing behavior stays gated in services rather than client
copy:

- `moderationExecution.ts`: live Reddit remove/approve/ignore-reports requires
  explicit confirmation, live mode, runtime proof, and receipt availability.
- `modNotes.ts`: native Mod Notes require explicit native mode and runtime proof.
- `teamDelivery.ts`: delivery remains preview/manual/skipped by default unless a
  verified adapter is injected.
- `runtimeCapabilities.ts`: health events can promote safe proof surfaces such
  as Redis/Reddit smoke, but cannot enable destructive execution operations.
- `privacyRetention.ts`: deletion supports dry-run and keeps policy history
  protected by default.

## Runtime Truth

Runtime-verified remains narrower than local/test-verified:

- Verified runtime: subreddit dashboard launcher and desktop expanded WebView
  IA from prior W13 proof.
- Static/local verified: service logic, UI build, mobile static layout,
  synthetic eval, persistence contracts, and safety gates.
- Type-only or disabled: post/comment Apply Policy menu proof, target context
  runtime capture, Devvit Redis route proof, Reddit smoke route proof, real
  moderation execution, native Mod Notes, modmail/mod discussion send,
  scheduler, external AI, native mobile, and non-mod blocking.

## Integration Risks

- `src/shared/schema.ts` is large and should be watched for duplicate capability
  vocabulary over time.
- `src/client/main.ts` is feature-rich and string-template based; future UI work
  should prefer small functions and avoid broad rewrites.
- Devvit runtime proof still needs focused safe playtest passes before any
  disabled capability moves to enabled.
