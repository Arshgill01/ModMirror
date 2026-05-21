# ModMirror Context

Last updated: 2026-05-20

This document is a detailed handoff for a fresh coding agent that has no prior
context on ModMirror. Its purpose is to avoid burning tokens rediscovering the
repository, product intent, architecture, implementation status, and current
gaps.

If this document conflicts with current source code, trust the source code and
update this document. If it conflicts with `AGENTS.md`, trust `AGENTS.md`.

## Quick Orientation

ModMirror is a Reddit Devvit moderation app built for the Reddit Mod Tools and
Migrated Apps Hackathon, targeting the **Best New Mod Tool** category.

The core tagline is:

> Find enforcement drift before your users do.

The core thesis is:

> Most moderation tools help moderators act faster. ModMirror helps moderator
> teams act consistently.

ModMirror is not a generic queue dashboard, a Toolbox clone, a strike bot, a
migrated bot, an AI moderator, or an automatic enforcement tool. It is a
moderation governance and policy-consistency layer.

The intended demo story is:

1. A mod team installs ModMirror.
2. ModMirror runs a Mirror Scan over recent moderation activity.
3. The scan finds enforcement drift.
4. The lead mod creates a policy ladder for a rule.
5. A new post/comment needs moderation.
6. A moderator uses Apply Policy.
7. ModMirror recommends the team-aligned action.
8. If the moderator chooses a stricter or looser action, ModMirror asks for an
   override reason.
9. The override is logged so the team can improve policy later.

The central product line is:

> Your team thought Rule 2 was simple. ModMirror showed that it was not.

## Current Repository State

Root path:

`/Users/arshdeepsingh/Developer/ModMirror`

Current primary branch:

`master`

Relevant local context observed on 2026-05-20:

- Operational overhaul W00-W14 is merged.
- Expansion W16-W34 is merged.
- Post-W34 runtime proof follow-ups are merged.
- Latest documented Devvit playtest observed while runtime proof continued:
  `v0.0.1.138`.
- Untracked root directories exist and should not be touched unless the user
  explicitly asks:
  - `modmirror-expansion-waves-16-34/`
  - `modmirror_operational_overhaul_spec_pack/`
- `output/` is ignored by `.git/info/exclude`. Files written there are useful
  local artifacts but do not appear in `git status`.

Important top-level files:

- `AGENTS.md`: binding operating instructions and product guardrails.
- `README.md`: public project summary and current status.
- `TODO.md`: current work queue and runtime proof gaps.
- `RESEARCH.md`: Devvit/API research and runtime observations.
- `PLAN.md`: wave plan/history if present in the repo.
- `devvit.json`: Devvit app config.
- `package.json`: scripts and dependencies.

Important docs:

- `docs/PRODUCT.md`: product narrative.
- `docs/DEVPOST_DRAFT.md`: Devpost submission draft.
- `docs/SUBMISSION_NOTES.md`: submission positioning and limitations.
- `docs/APP_LISTING_DRAFT.md`: developer app listing copy.
- `docs/DEMO_SCRIPT.md`: intended demo flow.
- `docs/DECISIONS.md`: product and technical decisions.
- `docs/LAUNCH_READINESS_CHECKLIST.md`: launch/submission readiness.
- `docs/operational-overhaul/CURRENT_REPO_TRUTH.md`: latest deep truth doc.
- `docs/operational-overhaul/RUNTIME_VERIFICATION_MATRIX.md`: what is runtime
  verified vs local/type-only/disabled.
- `docs/operational-overhaul/RUNTIME_PROOF_BACKLOG.md`: current proof gaps.
- `docs/operational-overhaul/CAPABILITY_MATRIX.md`: capability status.
- `docs/operational-overhaul/COMPLETION_AUDIT.md`: operational completion
  evidence.
- `docs/expansion-waves/REPO_CONTEXT_RELOAD.md`: historical reload context for
  W16-W34.
- `docs/expansion-waves/ARCHITECTURE_NOTES.md`: expansion architecture notes.
- `docs/expansion-waves/BUILD_REPORT.md`: build/report context.

Recent local strategy artifacts:

- `output/hackathon/mod-recruit-corrected-competitive-intel-2026-05-20.md`
- `output/hackathon/reddit-devvit-post-draft-modmirror-after-polish.md`

Those output files are intentionally local/ignored artifacts, not committed
source files.

## Hackathon Context

The hackathon is the Reddit Mod Tools and Migrated Apps Hackathon.

Category target:

- Best New Mod Tool.

Judging criteria relevant to ModMirror:

- Community Impact: Does it save moderator time or improve community operation?
- Polish: Is it close to publishable and compliant with Devvit rules?
- Reliable UX: Is it easy to install/configure and reliable at scale?
- Ecosystem Impact: Does it bring net-new functionality to the Devvit
  ecosystem with broad moderator appeal?

Deadline confirmed from Devpost during the previous pass:

- May 27, 2026 at 6:00pm PDT.
- May 28, 2026 at 6:30am IST.

As of 2026-05-20, roughly 7 days remain.

Competitive context:

- A strong r/Devvit competitor post was analyzed from
  `/Users/arshdeepsingh/Downloads/devvit_mod_recruit_reddit_post_agent_context.json`.
- The competitor is **Mod Recruit / ModRecruit**, a Devvit app for running mod
  recruitment inside a subreddit.
- Mod Recruit's public artifact is strong because it has an obvious pain point,
  a native Reddit workflow, applicant forms, eligibility gates, auto-saved
  drafts, applicant status checks, moderator voting/notes, accept/reject/more
  info actions, modmail templates, Discord webhook notifications, sensible
  defaults, a demo subreddit, and screenshots.
- Corrected score estimate from the competitive pass:
  - Mod Recruit public artifact: 8.91 / 10.
  - ModMirror current public readiness: 7.90 / 10.
  - ModMirror after focused proof/polish sprint: 9.22 / 10.
- Strategic implication: do not post the main r/Devvit showcase until
  ModMirror has the same level of clarity, visual proof, and demo smoothness.
- Best counter-position:
  > Mod Recruit helps a subreddit recruit moderators. ModMirror helps those
  > moderators enforce rules consistently once they are on the team.

Recommended high-leverage addition from the competitive pass:

- A deterministic **Mod Calibration Pack** generated from existing policies and
  demo/live-safe cases.
- It should help new or existing moderators compare scenario choices against
  team policy.
- It must stay non-punitive, aggregate-first, no per-mod leaderboard, no AI
  scoring, and no automated enforcement.

## Product Scope

Locked MVP:

- Mirror Scan.
- Policy Agreement Flow.
- Apply Policy Action.
- Consistency Nudge + Override Audit.
- Demo seed mode.

Implemented product surfaces now extend beyond the original MVP, but they
should be treated as supporting the same consistency-first loop rather than as
new product pillars.

Current user-facing IA:

- Inline launch card.
- Expanded Devvit WebView dashboard.
- Act.
- Scan.
- Agree.
- Review.
- Prove.
- Settings.

The core loop should always be explained as:

> Scan drift -> agree on policy -> apply policy -> explain override -> review
> exceptions.

Avoid leading with every supporting feature. Receipts, Case Packets, Evidence
Boards, Digest, runtime labels, replay, impact summaries, and portability are
proof/supporting systems.

## What The Product Does

### 1. Mirror Scan

Purpose:

- Read recent moderation activity.
- Fetch subreddit rules and removal reasons where Devvit supports it.
- Attribute historical actions to likely rules/removal reasons using
  deterministic matching.
- Surface possible enforcement drift.

Important behavior:

- Attribution is deterministic, not AI.
- Attribution is confidence-scored.
- Confidence labels are:
  - `high`
  - `medium`
  - `low`
  - `unmatched`
- Inferred attribution must never be presented as certain.

Outputs include:

- actions scanned,
- likely rule buckets,
- confidence breakdown,
- unmatched count,
- drift candidates,
- warnings,
- small-subreddit fallback state,
- scan metadata,
- stored scan records,
- scan comparison data,
- drift-over-time analytics.

Relevant code:

- `src/server/services/mirrorScan.ts`
- `src/server/services/redditSources.ts`
- `src/server/services/attribution.ts`
- `src/server/services/scans.ts`
- `src/server/services/analytics.ts`
- `src/shared/scoring.ts`
- `src/shared/demoData.ts`
- `src/server/services/demoData.ts`

Relevant API routes:

- `POST /api/scan`
- `GET /api/scans`
- `GET /api/scans/compare`
- `GET /api/scans/:id`
- `GET /api/analytics/consistency`

Runtime status:

- Safe live scan paths and scan persistence have runtime evidence.
- Deep moderation-log pagination remains unverified.
- Live modqueue item reads remain unverified/fallback-only.

### 2. Demo Seed Mode

Demo mode is mandatory and central to the hackathon story.

The demo community is `r/ExampleLearning` or equivalent labeled demo context.

Demo rules:

- Rule 1: Be civil.
- Rule 2: Low-effort questions.
- Rule 3: Self-promotion.

The demo data intentionally shows drift:

- Rule 2 first-time cases receive mixed treatment:
  - warnings,
  - removal-only,
  - temporary-ban suggestions.
- Rule 3 is mostly consistent.
- Rule 1 has severe cases that escalate.

Purpose:

- Let judges and moderators experience the full product even if the test
  subreddit has little/no history.
- Avoid pretending sparse live data proves product value.
- Show the central Rule 2 story reliably.

Important boundaries:

- Demo mode must be clearly labeled.
- Demo data must not be mistaken for live subreddit data.
- Demo fallback should feel intentional, not like a broken live integration.

Relevant code:

- `src/shared/demoData.ts`
- `src/server/services/demoData.ts`
- `src/server/services/config.ts`
- UI rendering in `src/client/main.ts`

### 3. Policy Agreement Flow

Purpose:

- Turn drift findings into explicit team policy.
- Give teams a concrete policy ladder instead of an informal memory.

Policy examples:

- First offense: remove + warning.
- Second offense within a window: remove + formal note.
- Third offense: suggest temporary ban.
- Severe case: manual escalation.

Implemented behavior:

- Policy CRUD.
- Policy creation from drift candidates.
- Manual policy creation.
- Default policy steps.
- Policy snapshots.
- Immutable policy versions.
- Draft/proposed/under-review/adopted/superseded/archived lifecycle.
- Proposal notes.
- Review records.
- Ratification settings and approval thresholds.
- Quick adoption when allowed.
- Blocking adoption when thresholds are not met.
- Policy change history.
- Active adopted version lookup.

Important product rule:

- Apply Policy should use adopted active policy versions.
- Policy history matters because receipts and later reviews must reflect the
  policy that existed at the time, not only the newest policy.

Relevant code:

- `src/server/services/policies.ts`
- `src/server/services/policyRatification.ts`
- `src/server/services/policyHealth.ts`
- `src/server/services/policyImpact.ts`
- `src/server/services/replaySandbox.ts`
- `src/shared/schema.ts`

Relevant API routes:

- `GET /api/policies`
- `POST /api/policies`
- `POST /api/policies/from-drift`
- `GET /api/policies/:id`
- `PUT /api/policies/:id`
- `POST /api/policies/:id/propose`
- `POST /api/policies/:id/reviews`
- `POST /api/policies/:id/adopt`
- `GET /api/policies/:id/versions`
- `GET /api/policies/:id/changes`
- `POST /api/policies/:id/replay`
- `GET /api/policies/:id/impact`
- `GET /api/policy-health`
- `GET /api/policies/:id/health`

Runtime status:

- Single-mod playtest paths for proposal/review/adoption and threshold blocking
  have runtime evidence.
- Multi-moderator distinct-reviewer proof remains open.

### 4. Apply Policy Action

Purpose:

- Let moderators open ModMirror guidance from a post/comment context.
- Load the relevant target, policy, recommendation, history, and evidence.
- Recommend the team-aligned action.
- Require explicit confirmation before logging or executing anything.

Devvit menu items:

- `Apply ModMirror Policy` on comments.
- `Apply ModMirror Policy` on posts.
- `Open ModMirror dashboard` on subreddit.

Configured in:

- `devvit.json`

Internal routes:

- `/internal/menu/apply-policy-comment`
- `/internal/menu/apply-policy-post`
- `/internal/menu/open-dashboard`
- `/internal/form/apply-policy-target-submit`
- `/internal/form/dashboard-launch-submit`
- `/internal/triggers/on-app-install`

Implemented behavior:

- Post/comment menu target capture.
- Target context resolution.
- Target strip handoff into Act workspace.
- Apply Policy preview.
- Policy version/snapshot shown in preview.
- ModMirror-tracked user/action history.
- Evidence notes.
- Recommendation.
- Selected action.
- Confirmation flow.
- Log-only confirmation by default.
- Action event persistence.
- Action receipt persistence.
- Override event persistence when selected action deviates.
- Content snapshot capture for receipts/Case Packets.

Relevant code:

- `src/routes/menu.ts`
- `src/routes/forms.ts`
- `src/server/services/targetContext.ts`
- `src/server/services/applyPolicy.ts`
- `src/server/services/audit.ts`
- `src/server/services/receipts.ts`
- `src/server/services/contentSnapshots.ts`
- `src/server/services/moderationExecution.ts`

Relevant API routes:

- `POST /api/apply-policy/preview`
- `POST /api/apply-policy/confirm`
- `GET /api/actions`
- `GET /api/receipts`
- `GET /api/receipts/:id`
- `GET /api/receipts/target/:targetThingId`

Runtime status:

- Post Apply Policy menu target capture is runtime verified in desktop Reddit
  WebView.
- Comment Apply Policy menu target capture is runtime verified in desktop
  Reddit WebView.
- Log-only Apply Policy receipt persistence is runtime verified in Devvit
  Redis.
- Native Reddit mobile behavior is not verified.
- Real moderation execution remains disabled/unverified.

### 5. Consistency Nudge And Override Audit

Purpose:

- Warn when a moderator's selected action differs from team policy or recent
  team norms.
- Require a reason for stricter/looser decisions.
- Store the exception for team review and policy improvement.

Override reasons:

- `severe_context`
- `repeat_pattern_not_captured`
- `user_history_outside_modmirror`
- `edge_case_mod_discretion`
- `policy_seems_wrong`
- `other`

Implemented behavior:

- Override event persistence.
- Override review status.
- Override summary.
- Policy health based partly on override patterns.
- Review inbox UI.
- Aggregate-first framing.

Important product rule:

- This is about improving team policy, not blaming individual moderators.
- Avoid per-mod breakdowns unless strong permissions are runtime verified.

Relevant code:

- `src/server/services/audit.ts`
- `src/server/services/policyHealth.ts`
- `src/server/services/communityHealth.ts`
- `src/shared/schema.ts`

Relevant API routes:

- `GET /api/overrides`
- `GET /api/overrides/:id`
- `POST /api/overrides/:id/review`
- `GET /api/overrides/summary`
- `GET /api/policy-health`
- `GET /api/community-health`

Runtime status:

- Override capture and review paths have runtime evidence through desktop
  Devvit WebView/Redis playtest paths.

### 6. Receipts

Purpose:

- Create immutable records for confirmed Apply Policy operations.
- Preserve enough context to explain what happened later.

Receipts can include:

- target snapshot,
- policy snapshot,
- recommendation,
- selected action,
- override context,
- execution result,
- source,
- content snapshot,
- incident tag,
- response preview,
- native Mod Note attempt result,
- delivery references.

Important behavior:

- Receipt-backed evidence is treated as stronger than inferred historical
  mod-log attribution.
- Log-only receipts are valid product artifacts.
- Real destructive action receipts are not runtime verified.

Relevant code:

- `src/server/services/receipts.ts`
- `src/server/services/audit.ts`
- `src/server/services/contentSnapshots.ts`
- `src/server/services/modNotes.ts`
- `src/server/services/teamDelivery.ts`

Relevant API routes:

- `GET /api/receipts`
- `GET /api/receipts/:id`
- `GET /api/receipts/target/:targetThingId`

Runtime status:

- Log-only receipt persistence is runtime verified.
- Receipt-backed content snapshots, Evidence Boards, Case Packets, Incident
  Mode tags, response previews, and manual/skipped delivery receipts have
  runtime evidence.
- Real Reddit action receipts remain disabled/unverified.

### 7. Case Packets

Purpose:

- Generate moderator-facing packets that explain an action or case.
- Help with appeals, internal review, and consistency proof.

Case Packets can include:

- action summary,
- policy version/snapshot,
- consistency status,
- target snapshot,
- receipt ID,
- execution result,
- override information,
- comparable cases,
- evidence labels,
- appeal posture,
- Markdown export.

Important behavior:

- Receipt-backed Case Packets are stronger.
- Inferred-history packets are still possible but must carry caveats.

Relevant code:

- `src/server/services/casePacket.ts`
- `src/server/services/comparableCases.ts`
- `src/server/services/receipts.ts`

Relevant API route:

- `POST /api/case-packet`

Runtime status:

- Receipt-backed Case Packet generation is runtime verified in desktop Devvit
  WebView paths.

### 8. Evidence Boards

Purpose:

- Collect and organize evidence around receipts, snapshots, overrides, Case
  Packets, comparable cases, and policy changes.
- Support review-thread status and proof workflows.

Implemented behavior:

- Evidence Board schema.
- Redis-backed list/create/status update.
- Evidence summaries.
- Privacy metadata.
- Status history.
- Entrypoints from receipt ledger and Case Packets.

Relevant code:

- `src/server/services/evidenceBoard.ts`

Relevant API routes:

- `GET /api/evidence-boards`
- `POST /api/evidence-boards`
- `POST /api/evidence-boards/:id/status`

Runtime status:

- Evidence Board create/list/status persistence is runtime verified through
  Devvit Web/Redis playtest.

### 9. Digest

Purpose:

- Generate deterministic manual team updates from policy health, overrides,
  scans, receipts, and recommendations.

Implemented behavior:

- Manual Markdown digest generation.
- Digest history.
- Digest settings.
- Capability labels.
- Copy/export oriented UI.

Important boundary:

- There is no registered scheduler task for ModMirror delivery.
- Scheduled digest delivery is not runtime verified and should not be claimed.

Relevant code:

- `src/server/services/digest.ts`

Relevant API routes:

- `POST /api/digest/generate`
- `GET /api/digest/history`
- `GET /api/digest/capabilities`
- `GET /api/digest/settings`
- `PUT /api/digest/settings`

Runtime status:

- Manual digest generation and history have runtime evidence.
- Scheduler behavior remains disabled/unverified.

### 10. Team Delivery

Purpose:

- Preview and store delivery receipts for team-facing artifacts such as
  digests or Case Packet drafts.

Implemented behavior:

- Capability state.
- Preview API.
- Confirm API.
- Manual/skipped delivery receipts.
- Mocked adapter tests.

Important boundary:

- Product routes do not inject a live send adapter by default.
- Real modmail/private-message/Mod Discussion delivery remains disabled or
  unverified.
- Scheduler confirmations are guarded as skipped because no scheduler task is
  registered.

Relevant code:

- `src/server/services/teamDelivery.ts`

Relevant API routes:

- `GET /api/delivery/capabilities`
- `POST /api/delivery/preview`
- `POST /api/delivery/confirm`

Runtime status:

- Manual/skipped delivery receipt persistence has runtime evidence.
- Real send paths are not enabled.

### 11. Response Templates

Purpose:

- Generate warning/removal/mod note/modmail/private-message draft text tied to
  policy steps.

Implemented behavior:

- Response template schema.
- Safe rendering with missing-variable placeholders.
- Policy editor fields.
- Apply Policy preview integration.
- Gated response previews stored on receipts.

Relevant code:

- `src/shared/responseTemplates.ts`
- `src/server/services/policies.ts`
- `src/server/services/applyPolicy.ts`

Runtime status:

- Response preview persistence is runtime verified.
- Public comment delivery is disabled/unverified.

### 12. Attribution Correction And Replay

Purpose:

- Let moderators correct inferred attribution.
- Preserve the inferred/corrected distinction.
- Replay stored or synthetic actions against policies without mutating live
  state or receipts.

Implemented behavior:

- Attribution correction schema.
- Redis-backed correction persistence.
- Future scan attribution can apply corrections.
- Stored-scan replay.
- Synthetic replay fixtures.
- Policy replay UI.

Relevant code:

- `src/server/services/attributionCalibration.ts`
- `src/server/services/replaySandbox.ts`
- `src/server/services/fixtures/replaySandbox.ts`

Relevant API routes:

- `GET /api/attribution/corrections`
- `POST /api/attribution/corrections`
- `POST /api/policies/:id/replay`

Runtime status:

- Correction persistence and stored-scan replay are runtime verified.

### 13. Community Health And Policy Impact

Purpose:

- Provide aggregate health signals without turning ModMirror into a surveillance
  dashboard.

Implemented behavior:

- Aggregate community health summary.
- Repeat-author buckets without exposing usernames.
- Unresolved override counts.
- Policy churn signals.
- Drift stability.
- Receipt-backed Case Packet readiness.
- Before/after policy impact measurement.
- Insufficient-data caveats.

Important boundary:

- Default visibility is aggregate-first.
- Per-mod breakdowns require strong permission proof. Current helper is
  conservative and full-access-only.

Relevant code:

- `src/server/services/communityHealth.ts`
- `src/server/services/policyImpact.ts`
- `src/server/services/policyHealth.ts`

Relevant API routes:

- `GET /api/community-health`
- `GET /api/policies/:id/impact`
- `GET /api/policy-health`

Runtime status:

- Aggregate community health and policy impact routes have runtime evidence.
- Lower-permission role proof remains open.

### 14. Incident Mode

Purpose:

- Temporarily tag Apply Policy receipts and reports during unusual moderation
  periods such as brigading, major news, or coordinated incidents.

Implemented behavior:

- Incident schema.
- Start/end/expiry behavior.
- Active incident banner.
- Receipt tagging.
- Preset suggestions.
- Triage groups.
- Post-incident report.

Important boundary:

- Incident Mode does not change execution mode or bypass confirmation.

Relevant code:

- `src/server/services/incidentMode.ts`

Relevant API routes:

- `GET /api/incidents`
- `POST /api/incidents/start`
- `POST /api/incidents/:id/end`

Runtime status:

- Incident Mode route persistence and active receipt tagging are runtime
  verified.

### 15. Config Portability

Purpose:

- Let teams export/import policy configuration without exporting private
  history by default.

Implemented behavior:

- Versioned portable config packages.
- Export policies, response templates, digest settings, starter templates.
- Exclude private history by default.
- Import validation.
- Dry run.
- Legacy v0 migration path.
- Import policies as drafts/proposed updates instead of silently adopting live
  enforcement.
- Starter templates.

Relevant code:

- `src/server/services/configPortability.ts`

Relevant API routes:

- `GET /api/config/export`
- `GET /api/config/templates`
- `POST /api/config/import`

Runtime status:

- Config export/import persistence is runtime verified.

### 16. Privacy Retention

Purpose:

- Give visibility into retained ModMirror data and support retention controls.

Implemented behavior:

- Retention settings.
- Inventory/export.
- Dry-run deletion controls.
- Synthetic cleanup smoke route.
- Expired synthetic record cleanup proof.

Important boundary:

- Actual cleanup against real operational records is not runtime verified.
- Synthetic cleanup smoke does not prove destructive real-record deletion.

Relevant code:

- `src/server/services/privacyRetention.ts`

Relevant API routes:

- `GET /api/privacy/retention`
- `PUT /api/privacy/retention`
- `GET /api/privacy/export`
- `POST /api/privacy/delete`
- `POST /api/smoke/retention-cleanup`

Runtime status:

- Privacy inventory/dry-run controls are runtime verified.
- Synthetic retention cleanup smoke is runtime verified.
- Real operational-record deletion remains open.

### 17. Modqueue Triage

Purpose:

- Read queue-like items and connect them to ModMirror policy guidance.

Implemented behavior:

- Shared triage contracts.
- Capability state.
- Read-only service that normalizes queue items.
- Policy hints and history summaries.
- Operational Queue UI.

Important boundary:

- Live modqueue item reads remain unverified.
- Runtime playtests reached the same-subreddit Operational Queue refresh path
  but returned labeled type-supported/no-items fallback.

Relevant code:

- `src/server/services/modqueueTriage.ts`

Relevant API route:

- `GET /api/modqueue/triage`

Runtime status:

- Fallback path observed in runtime.
- Live queue item reads remain open.

### 18. Native Mod Notes

Purpose:

- Optionally write native Reddit Mod Notes tied to Apply Policy decisions.

Implemented behavior:

- Native Mod Note attempt schema.
- Receipt status fields.
- Apply Policy opt-in mode for native/log-only/no Mod Note.
- Skipped/sent/failed attempt modeling.
- Mocked tests.

Important boundary:

- Native Mod Notes are disabled unless explicit env/runtime gates pass.
- Native `reddit.addModNote` is not runtime verified on safe test content.

Relevant code:

- `src/server/services/modNotes.ts`

Runtime status:

- Local mocked tests exist.
- Runtime proof is still required before enabling or claiming native Mod Note
  writes.

### 19. Moderation Execution

Purpose:

- Eventually execute supported Reddit moderation operations such as remove,
  approve, or ignore reports.

Implemented behavior:

- Typed execution engine.
- Success/failure/skipped result modeling.
- Capability gating.
- Explicit confirmation requirement.
- Runtime-proof flag requirement.
- Receipt-availability requirement.

Important boundary:

- Product-integrated live Reddit moderation actions remain disabled by default.
- Do not claim real remove/approve/ignore-report execution is working.
- Do not enable without explicit user approval, controlled test content,
  Reddit-visible state verification, receipts, and cleanup notes.

Relevant code:

- `src/server/services/moderationExecution.ts`

Runtime status:

- Local tests and type support exist.
- No real Reddit moderation execution proof exists.

### 20. AI Advisory

Purpose:

- A future advisory layer that could summarize evidence or suggest review
  points, but not decide or execute enforcement.

Implemented behavior:

- Contracts.
- Capability endpoint.
- Settings labels.
- Mock-provider tests.
- Deterministic evidence ID requirements.
- Provider output must cite known evidence IDs.
- Disabled fallback behavior.

Important boundary:

- No LLM/AI judging in v1.
- AI advisory remains disabled by default.
- No external AI calls are runtime verified.
- Devvit secret retrieval and provider latency/failure behavior are not proven.
- `docs/operational-overhaul/AI_PRIVACY_READINESS.md` blocks any external AI
  build until provider terms, privacy notice, data minimization, secret
  handling, HTTP permissions, runtime failure behavior, and retention are
  reviewed.

Relevant code:

- `src/server/services/aiAdvisory.ts`

Relevant API routes:

- `GET /api/ai/capabilities`
- `POST /api/ai/advisory`

Runtime status:

- Disabled/type-only/local mocked status.
- No real external AI behavior.

## Architecture

### Runtime Shape

This is a Devvit Web app using TypeScript, Vite, Hono, Redis, and Devvit SDK.

Key dependencies:

- `devvit` / `@devvit/web` / `@devvit/start`: `0.12.23`
- `hono`: `4.11.7`
- `vite`: `7.3.1`
- `typescript`: `5.9.3`
- `vitest`: `4.0.15`
- Node engine: `>=22.2.0`

Important scripts:

- `npm run type-check`: `tsc --build`
- `npm run lint`: `eslint 'src/**/*.{ts,tsx}'`
- `npm run build`: `vite build`
- `npm test`: `vitest run --config vitest.config.ts`
- `npm run dev`: `devvit playtest`
- `npm run deploy`: type-check + lint + test + `devvit upload`
- `npm run launch`: deploy + `devvit publish`

### Devvit Config

`devvit.json` configures:

- app name: `modmirror`
- server build output: `dist/server/index.cjs`
- client build output: `dist/client/index.html`
- custom post entrypoint:
  - `height: tall`
  - `inline: true`
- menu items:
  - comment: `Apply ModMirror Policy`
  - post: `Apply ModMirror Policy`
  - subreddit: `Open ModMirror dashboard`
- forms:
  - `applyPolicyTarget`
  - `dashboardLaunch`
- install trigger:
  - `onAppInstall`
- Reddit permission:
  - `permissions.reddit = true`
- dev subreddit:
  - `modmirror_dev`

### Server Entrypoints

Main entry:

- `src/index.ts`

Routes:

- `src/routes/api.ts`: main `/api/*` surface.
- `src/routes/menu.ts`: Devvit menu callbacks.
- `src/routes/forms.ts`: Devvit form submissions.
- `src/routes/triggers.ts`: install trigger handling.

The server mounts Hono routes under `/api` and internal Devvit callback paths.

### Client Shape

The client is not React despite the original expected architecture mentioning
React. The current client is a TypeScript string-template dashboard.

Key files:

- `src/client/main.ts`
- `src/client/styles.css`
- `src/client/index.html`

Current UI structure:

- Compact inline launch card first.
- Expanded dashboard with sections:
  - Act
  - Scan
  - Agree
  - Review
  - Prove
  - Settings

Conceptual IA:

- Act: Apply Policy, target context, receipts.
- Scan: Mirror Scan controls/history, attribution correction.
- Agree: policy creation/lifecycle/ratification/replay.
- Review: overrides, policy health, community health, exception review.
- Prove: analytics, Case Packets, Evidence Boards, Digest.
- Settings: runtime capabilities, demo state, config portability, privacy,
  diagnostics, access checks, Incident Mode, delivery/AI capability labels.

### Shared Contracts

Main files:

- `src/shared/schema.ts`
- `src/shared/constants.ts`
- `src/shared/scoring.ts`
- `src/shared/productization.ts`
- `src/shared/responseTemplates.ts`
- `src/shared/casePacketDelivery.ts`
- `src/shared/clientResilience.ts`
- `src/shared/status.ts`

`src/shared/schema.ts` is the main contract file and is large. It includes
types for policies, scans, attribution, actions, overrides, receipts, execution,
case packets, evidence boards, digest, delivery, AI advisory, runtime
verification, config portability, privacy retention, incidents, modqueue
triage, and related UI responses.

`src/shared/constants.ts` defines enum-like value lists and defaults such as:

- confidence values,
- enforcement action values,
- delivery modes,
- native Mod Note modes,
- override reasons,
- policy health statuses,
- case packet statuses,
- incident statuses,
- privacy retention categories,
- mirror scan depth values,
- execution statuses,
- digest states,
- AI advisory values,
- modqueue triage values,
- default policy window days,
- default required approvals,
- default digest period.

## API Surface

The main API routes in `src/routes/api.ts` include:

Health/runtime:

- `GET /api/health`
- `GET /api/runtime-verification`
- `GET /api/launch-context`
- `GET /api/runtime-capabilities`
- `POST /api/runtime-capabilities/events`
- `GET /api/access/diagnostics`

Diagnostics/smoke:

- `POST /api/smoke/redis`
- `POST /api/smoke/redis-zset`
- `POST /api/smoke/redis-storage`
- `POST /api/smoke/retention-cleanup`
- `POST /api/smoke/reddit`

Modqueue:

- `GET /api/modqueue/triage`

Scans/attribution/analytics:

- `POST /api/scan`
- `GET /api/scans`
- `GET /api/scans/compare`
- `GET /api/scans/:id`
- `GET /api/attribution/corrections`
- `POST /api/attribution/corrections`
- `GET /api/analytics/consistency`
- `GET /api/community-health`

Policies:

- `GET /api/policies`
- `POST /api/policies`
- `POST /api/policies/from-drift`
- `GET /api/policies/:id`
- `PUT /api/policies/:id`
- `POST /api/policies/:id/propose`
- `POST /api/policies/:id/reviews`
- `POST /api/policies/:id/adopt`
- `GET /api/policies/:id/versions`
- `GET /api/policies/:id/changes`
- `POST /api/policies/:id/replay`
- `GET /api/policies/:id/impact`

Actions/receipts/overrides:

- `GET /api/actions`
- `GET /api/receipts`
- `GET /api/receipts/target/:targetThingId`
- `GET /api/receipts/:id`
- `GET /api/overrides`
- `GET /api/overrides/:id`
- `POST /api/overrides/:id/review`
- `GET /api/overrides/summary`
- `GET /api/policy-health`
- `GET /api/policies/:id/health`

Proof/evidence:

- `POST /api/case-packet`
- `GET /api/evidence-boards`
- `POST /api/evidence-boards`
- `POST /api/evidence-boards/:id/status`

Incident/config/privacy:

- `GET /api/incidents`
- `POST /api/incidents/start`
- `POST /api/incidents/:id/end`
- `GET /api/config/export`
- `GET /api/config/templates`
- `POST /api/config/import`
- `GET /api/privacy/retention`
- `PUT /api/privacy/retention`
- `GET /api/privacy/export`
- `POST /api/privacy/delete`

Digest/delivery/AI:

- `POST /api/digest/generate`
- `GET /api/digest/history`
- `GET /api/digest/capabilities`
- `GET /api/digest/settings`
- `PUT /api/digest/settings`
- `GET /api/delivery/capabilities`
- `POST /api/delivery/preview`
- `POST /api/delivery/confirm`
- `GET /api/ai/capabilities`
- `POST /api/ai/advisory`

Apply Policy:

- `POST /api/apply-policy/preview`
- `POST /api/apply-policy/confirm`

## Service Map

Key service files:

- `src/server/services/redditSources.ts`: loads live rules, removal reasons,
  and mod-log/action sources for Mirror Scan.
- `src/server/services/normalizers.ts`: normalizes Reddit-like rules, removal
  reasons, mod actions, and action names.
- `src/server/services/mirrorScan.ts`: runs Mirror Scan and builds drift
  candidates.
- `src/server/services/attribution.ts`: deterministic attribution logic.
- `src/server/services/scans.ts`: persists scan records and metadata.
- `src/server/services/analytics.ts`: consistency analytics from scans and
  receipts.
- `src/server/services/demoData.ts`: server demo scan sources.
- `src/server/services/policies.ts`: policy CRUD, versions, lifecycle,
  adoption, snapshots.
- `src/server/services/policyRatification.ts`: review/ratification helpers.
- `src/server/services/policyHealth.ts`: policy health and overview.
- `src/server/services/policyImpact.ts`: before/after policy impact.
- `src/server/services/replaySandbox.ts`: read-only policy replay.
- `src/server/services/applyPolicy.ts`: Apply Policy preview/confirm.
- `src/server/services/targetContext.ts`: post/comment target context capture.
- `src/server/services/audit.ts`: action events, override events, review
  updates, summaries.
- `src/server/services/receipts.ts`: immutable action receipt persistence.
- `src/server/services/contentSnapshots.ts`: target/content snapshots.
- `src/server/services/moderationExecution.ts`: gated Reddit moderation
  execution engine.
- `src/server/services/modNotes.ts`: gated native Mod Note attempts.
- `src/server/services/casePacket.ts`: Case Packet generation and Markdown.
- `src/server/services/comparableCases.ts`: comparable case selection.
- `src/server/services/evidenceBoard.ts`: Evidence Board persistence/status.
- `src/server/services/digest.ts`: manual digest generation/history/settings.
- `src/server/services/teamDelivery.ts`: preview/manual/skipped delivery
  receipts.
- `src/server/services/aiAdvisory.ts`: disabled-by-default AI advisory layer.
- `src/server/services/runtimeVerification.ts`: static runtime matrix builder.
- `src/server/services/runtimeCapabilities.ts`: runtime health/capability event
  matrix.
- `src/server/services/moderatorAccess.ts`: protected API access checks and
  visibility level helper.
- `src/server/services/subredditIsolation.ts`: subreddit scope guard.
- `src/server/services/modqueueTriage.ts`: read-only modqueue triage/fallback.
- `src/server/services/communityHealth.ts`: aggregate community health.
- `src/server/services/incidentMode.ts`: temporary incident mode.
- `src/server/services/configPortability.ts`: import/export/starter templates.
- `src/server/services/privacyRetention.ts`: retention settings, inventory,
  dry run/delete, synthetic cleanup smoke.
- `src/server/services/config.ts`: app/demo config state.
- `src/server/services/redis.ts`: Redis key helpers, JSON helpers, smoke tests.
- `src/server/services/syntheticEval.ts`: deterministic synthetic evaluation.

## Redis And Persistence

Redis is the persistence layer for ModMirror app state.

Key strategy:

- Keys must be namespaced by subreddit/install context.
- Key helper:
  - `src/server/services/redis.ts`
  - `mmKey(subreddit, suffix)`
- Prefix pattern:
  - `modmirror:{subreddit}:{suffix}`

Important behavior:

- Subreddit isolation is a core safety requirement.
- Cross-subreddit API writes should be rejected, not silently redirected.
- The labeled `ExampleLearning` demo namespace is a specific allowed demo
  exception.
- Redis key guards reject unsafe subreddit namespace segments.

Examples of persisted data:

- config,
- policies,
- policy versions/change events,
- scan records,
- scan metadata,
- action events,
- action receipts,
- override events,
- evidence boards,
- digest history,
- team-delivery receipts,
- incidents,
- retention settings,
- attribution corrections,
- runtime health events.

Runtime storage proof:

- Redis sorted-set ordering passed on Devvit playtest `v0.0.1.136`.
- Redis storage-envelope smoke passed on Devvit playtest `v0.0.1.137`.
- Current bounded envelope proven by smoke:
  - scan metadata: `10/10`
  - action rows: `500/500`
  - override rows: `500/500`
  - one scan-like record
  - cleanup `0`

Do not raise caps or store larger live envelopes without new proof.

## Runtime Verification Status

Runtime verified:

- Devvit app identity and playtest readiness.
- Compact inline card.
- Expanded dashboard modal in Reddit desktop WebView.
- Act / Scan / Agree / Review / Prove / Settings IA.
- Host fullscreen/viewport behavior by desktop WebView inspection.
- Safe Redis smoke.
- Redis sorted-set ordering.
- Redis storage envelope.
- Synthetic retention cleanup smoke.
- Reddit read-only smoke.
- Post Apply Policy menu target capture.
- Comment Apply Policy menu target capture.
- Target context handoff into Act workspace.
- Log-only Apply Policy receipt persistence.
- Receipt-backed content snapshots.
- Receipt-backed Case Packet generation.
- Evidence Board create/list/status persistence.
- Incident Mode receipt tagging.
- Config export/import persistence.
- Privacy retention inventory/dry-run controls.
- Response preview receipt persistence.
- Attribution correction persistence.
- Stored-scan replay.
- Review health.
- Policy impact.
- Policy ratification propose/review/blocking in a single-mod path.
- Community health aggregate route.
- Subreddit isolation for Devvit Web request context.
- Current moderator access diagnostic for the current account returning `all`.

Locally verified/type-supported but not fully runtime proven:

- Server-side protected API moderator access guard with unit tests.
- Lower-permission moderator role handling.
- Some policy/adoption flows beyond single-mod playtest.
- Native Mod Note service with mocked Reddit.
- Moderation execution engine with local tests.
- AI advisory provider abstraction with mocked provider.
- Team delivery adapters with mocked/manual/skipped paths.
- Deep moderation-log pagination.

Disabled or unverified:

- Real Reddit remove/approve/ignore-report execution.
- Destructive action receipts from real Reddit actions.
- Public comment delivery.
- Private message/modmail/Mod Discussion delivery.
- Scheduler delivery.
- Native Mod Notes in live Reddit runtime.
- External AI fetches.
- Devvit secret retrieval for AI providers.
- Non-mod account runtime blocking.
- Lower-permission moderator role strings.
- Native Reddit mobile app behavior.
- Same-subreddit live modqueue item reads.
- Actual retention deletion against real operational records.

Use `docs/operational-overhaul/RUNTIME_VERIFICATION_MATRIX.md` and
`docs/operational-overhaul/RUNTIME_PROOF_BACKLOG.md` before claiming any
runtime behavior.

## Safety And Product Boundaries

Non-negotiable boundaries:

- No LLM/AI judging in v1.
- No automatic bans as the default demo.
- Human confirmation is required for meaningful enforcement actions.
- Deterministic attribution must be confidence-labeled and honest.
- Do not imply historical mod-log attribution is perfect.
- Aggregate dashboard data can be visible to all mods.
- Per-mod breakdowns require stronger moderator/manage-level permission if
  available and runtime verified.
- If exact permission checks are uncertain, hide per-mod analytics entirely.
- Store the minimum needed for product value.
- Avoid external services unless absolutely required.
- Prefer Devvit-native capabilities and Redis.
- Do not use deprecated APIs if a current replacement exists.

Current safe defaults:

- Apply Policy confirmation is log-only by default.
- Policy message delivery is normalized/guarded to `log_only` until public
  comment delivery order and identity are runtime proven.
- Native Mod Notes require explicit gates and remain off by default.
- AI advisory remains disabled by default.
- Team delivery stores manual/skipped receipts unless a safe proof-backed
  adapter exists.
- Scheduler confirmations are skipped because no scheduler task is registered.

When adding or changing features:

- Keep UI thin and server/shared logic testable.
- Put pure scoring/attribution/policy logic in shared/server services.
- Keep Reddit/Redis calls isolated.
- Add proof plans before enabling risky runtime behavior.
- Update `RESEARCH.md` when new platform facts are discovered.
- Update `TODO.md` when work is done, blocked, or newly discovered.
- Update `docs/DECISIONS.md` only for real product/technical decisions.

## Current Gaps And Known Risks

Major open product/runtime gaps:

1. Real moderation execution is disabled/unverified.
   - Do not claim ModMirror removes/approves/ignores reports live.
   - Execution engine exists but is gated.

2. Public comment delivery is disabled/unverified.
   - Response templates exist.
   - Public delivery does not have runtime proof.

3. Modmail/Mod Discussion/private delivery is disabled or manual/skipped.
   - Delivery receipt persistence exists.
   - Real send behavior is not enabled.

4. Scheduler is not registered.
   - Manual digest exists.
   - Scheduled digest delivery should not be claimed.

5. Native Mod Notes are not runtime verified.
   - Mocked tests exist.
   - Live `reddit.addModNote` proof is still needed.

6. External AI is disabled.
   - No external provider calls are runtime proven.
   - No AI judging should be added to v1.

7. Non-mod runtime access proof is incomplete.
   - Local server guard tests pass.
   - Current moderator diagnostic returned `all`.
   - A true non-mod account playtest remains open.

8. Lower-permission moderator role proof is incomplete.
   - Future per-mod/manage-level surfaces remain aggregate-only unless `all`
     permission is present.

9. Native Reddit mobile app behavior is unverified.
   - Static/narrow layout proof exists.
   - Real native mobile runtime proof is still needed.

10. Live modqueue item reads are unverified.
    - Fallback path is observed.
    - Live item reads need a safe proof gate.

11. Actual deletion of real operational records is not runtime verified.
    - Synthetic cleanup smoke passed.
    - Real destructive cleanup needs a controlled proof plan.

12. Public story/polish currently trails the strongest competitor artifact.
    - ModMirror has deep implementation.
    - It needs a sharper demo and screenshot/video package before the main
      r/Devvit showcase post.

## Recommended Next Work

If the next agent is helping win the hackathon, the highest leverage path is
not broad feature expansion. It is public clarity and proof.

Recommended sequence:

1. Build a single "Run Judge Demo" path.
   - Start from the launch card/Command Center.
   - Show ExampleLearning demo.
   - Run Mirror Scan.
   - Show Rule 2 drift.
   - Create/adopt a policy ladder.
   - Apply policy to a sample post/comment.
   - Trigger override nudge.
   - Store log-only receipt.
   - Generate Case Packet/Evidence Board/Digest proof.

2. Add the Mod Calibration Pack if feasible.
   - Deterministic, policy-based scenario flow.
   - 5-8 demo/live-safe scenarios.
   - Moderator selects an action.
   - UI compares selected action to team policy.
   - Optional override reason.
   - Aggregate/non-punitive summary.
   - No per-mod leaderboard.
   - No AI scoring.
   - No enforcement action.

3. Capture public proof assets.
   - Screenshot inline launch card.
   - Screenshot Mirror Scan Rule 2 drift.
   - Screenshot policy ladder.
   - Screenshot Apply Policy consistency nudge.
   - Screenshot receipt/Case Packet/Evidence Board.
   - Screenshot Settings runtime safety labels.
   - Record 60-90 second demo video if possible.

4. Tighten public copy.
   - Lead with one workflow, not the whole architecture.
   - Structure like:
     - how it helps your mod team,
     - how it looks for moderators,
     - getting started,
     - what is intentionally safe,
     - feedback ask.

5. Run validation and update docs.
   - `npm run type-check`
   - `npm run lint`
   - `npm test`
   - `npm run build`
   - `git diff --check`
   - Devvit playtest for any runtime-facing change.

## How To Validate Changes

Use the narrowest command that proves the change, then run broader checks for
submission-facing changes.

Common local checks:

```bash
npm run type-check
npm run lint
npm test
npm run build
git diff --check
```

Runtime checks:

```bash
npx devvit whoami
npm run dev
```

Do not claim runtime verification unless the relevant Devvit playtest or
browser/manual proof actually ran.

For risky features, consult the specific proof plans:

- `docs/operational-overhaul/REDDIT_MODERATION_EXECUTION_TEST_PLAN.md`
- `docs/operational-overhaul/PUBLIC_COMMENT_DELIVERY_TEST_PLAN.md`
- `docs/operational-overhaul/PRIVATE_DELIVERY_TEST_PLAN.md`
- `docs/operational-overhaul/MOD_DISCUSSION_DELIVERY_TEST_PLAN.md`
- `docs/operational-overhaul/SCHEDULER_RUNTIME_TEST_PLAN.md`
- `docs/operational-overhaul/NATIVE_MOD_NOTES_TEST_PLAN.md`
- `docs/operational-overhaul/ACCESS_RUNTIME_TEST_PLAN.md`
- `docs/operational-overhaul/MODQUEUE_RUNTIME_TEST_PLAN.md`
- `docs/operational-overhaul/RETENTION_DESTRUCTIVE_TEST_PLAN.md`

## Coding Conventions For Future Agents

Follow `AGENTS.md`.

Practical guidance:

- Read relevant docs before editing.
- Check nested `AGENTS.md` files if working outside the root.
- Use `rg` / `rg --files` for discovery.
- Use existing service boundaries.
- Keep diffs scoped.
- Do not add external services.
- Ask before heavy dependencies.
- Do not hardcode secrets.
- Do not enable destructive Reddit behavior without explicit approval and proof
  plans.
- Preserve unrelated user changes.
- Update docs when behavior, setup, or claims change.
- End substantial work with:
  - what changed,
  - commands run,
  - pass/fail status,
  - open risks.

## Useful Mental Model

ModMirror's implementation is broad, but the winning product story is narrow:

> A mod team enforces the same rule three different ways. ModMirror finds that
> drift, helps the team agree on a policy, nudges future actions toward that
> policy, and records exceptions so the policy can improve.

Everything else exists to make that loop trustworthy:

- confidence labels make scan findings honest,
- policy versions make time-sensitive reviews fair,
- receipts make decisions auditable,
- Case Packets and Evidence Boards make proof portable,
- Digest makes follow-up practical,
- runtime labels prevent overclaiming,
- demo mode makes the story reliable for judges.

Do not dilute the pitch. Build and polish around that loop.
