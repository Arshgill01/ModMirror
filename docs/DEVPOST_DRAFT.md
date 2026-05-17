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

- Runtime verification for Redis smoke, Reddit API smoke, menu/form actions,
  comment delivery ordering, modmail, scheduler, and permission gating.
- Optional mod discussion digest delivery after safe preview/confirmation proof.
- Optional weekly digest scheduling after scheduler proof.
- Deeper role-based access checks for sensitive views.

## Known Limitations

ModMirror does not use AI, does not auto-ban, does not decide appeals, and does
not claim perfect attribution. Delivery and scheduler features remain disabled
unless runtime-verified and explicitly enabled.
