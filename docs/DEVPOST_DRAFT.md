# ModMirror Devpost Draft

## Inspiration

Most moderation tools help moderators act faster. ModMirror focuses on whether
the team is acting consistently.

Appeals often expose a simple problem: the team thought a rule was obvious, but
similar cases were handled differently. ModMirror makes that drift visible and
gives teams a workflow to fix it.

## What It Does

ModMirror is a Reddit Devvit moderation governance app. It scans recent
moderation patterns, surfaces enforcement drift with confidence labels, helps
moderators define explicit rule policies, nudges future actions toward the team
policy, records justified overrides, generates case packets for appeals, and
creates saved Markdown digests for the mod team.

## How It Works

1. A moderator opens ModMirror from a compact Reddit-native inline card.
2. Command Center shows scan state, policy health, overrides, and next action.
3. Mirror Scan attributes historical actions to rules using deterministic
   matching and confidence labels.
4. The team creates a policy ladder for a drift-prone rule.
5. Apply Policy previews the team recommendation and stores a log-only action.
6. Deviations require an override reason.
7. Review, Case Packets, and Digest help the team resolve exceptions and share
   what changed.

## Built With Devvit

- Devvit Web custom post surface.
- Hono server routes under `/api`.
- Devvit Redis for policies, policy versions, actions, overrides, case packet
  context, and digest history.
- Reddit API typings for moderation log, rules, removal reasons, and future
  delivery research.
- TypeScript, Vite, Vitest.

## Community Impact

ModMirror helps communities make moderation more explainable and consistent
without replacing moderator judgment. It is especially useful for teams with
many moderators, repeated rule patterns, appeal friction, or new moderator
onboarding needs.

## Challenges

- Devvit historical moderation log entries do not expose perfect rule/removal
  metadata, so attribution must be honest and confidence-scored.
- Runtime delivery paths such as comments, modmail, and scheduler behavior need
  careful playtest proof before they can be enabled safely.
- The UI had to feel serious inside Reddit's constrained embedded surface, not
  like a generic admin dashboard.

## What We Learned

Consistency is a stronger moderation story than speed alone. The safest version
of this product is deterministic, aggregate-first, and explicit about what it
knows versus what it infers.

## What's Next

- True non-mod and limited-moderator runtime proof for protected workflows.
- Read-only live modqueue item proof and deep moderation-log pagination proof.
- Native Reddit mobile QA on a real device/session.
- Optional public comment, modmail, Mod Discussion, Mod Notes, scheduler, and
  destructive moderation proof only after explicit approval of the matching
  controlled runbook.
- Public app listing terms/privacy links before any publish request.

## Known Limitations

ModMirror does not use AI, does not auto-ban, does not decide appeals, and does
not claim perfect attribution. Delivery and scheduler features remain disabled
unless runtime-verified and explicitly enabled.

## Current Proof Snapshot

As of May 21, 2026, the repository passes local type, lint, build, and test
gates on `master`. `npm run deploy` also passed and uploaded Devvit app version
`0.0.2` with WebView capability. Route-level WebView smoke checks for the latest
build still require an authenticated Devvit WebView session and are not claimed
from upload readiness alone.
