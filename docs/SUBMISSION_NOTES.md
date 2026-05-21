# SUBMISSION_NOTES.md — Devpost Draft Material

## Project Name

ModMirror

## Tagline

Find enforcement drift before your users do.

## Category

Best New Mod Tool

## Short Description

ModMirror is a Devvit moderation app that helps Reddit mod teams enforce rules consistently. It scans recent moderation patterns, identifies enforcement drift, helps teams agree on rule policies, and gives moderators live consistency nudges when handling posts or comments.

## Tool Overview Draft

Moderation teams often do not realize when they are enforcing the same rule differently. One moderator may warn a first-time offender, another may remove without explanation, and another may escalate to a temporary ban. This creates appeal friction, user distrust, and inconsistent onboarding for new moderators.

ModMirror gives mod teams a shared consistency layer.

The app runs a Mirror Scan over recent moderation activity, compares actions against subreddit rules and removal reasons using deterministic matching, and surfaces potential enforcement drift with confidence labels. Moderators can turn those findings into explicit rule policies using the Policy Agreement Flow. Once policies exist, moderators can apply them from post/comment actions and receive a live consistency nudge when their selected action differs from the team policy.

ModMirror does not replace moderators or auto-judge content. It keeps humans in control while making team norms visible, repeatable, and auditable.

Wave 5 expands this from a detection-and-nudge loop into a governance loop:
ModMirror does not just detect inconsistency. It gives teams a feedback loop:
detect drift, set policy, enforce, review exceptions, and improve policy.

Wave 6 adds Case Packet / Appeal Context:
when a user appeals or challenges an action, ModMirror can generate a
moderator-facing packet that shows the tracked action, policy version at the
time, consistency status, override review context, prior same-rule user
history, deterministic comparable cases, caveats, and a Markdown export.

Wave 7/8 productizes the experience into a Reddit-native moderation command
center. The inline post is now a compact status/launch card instead of a full
dashboard dump. Open Dashboard uses Reddit's native expanded WebView modal when
available, preserving the Devvit viewport dropdown, and opens to Command Center
to guide the demo through scan, policy setup, Apply Policy, override review,
Case Packet, manual Digest, and runtime Settings.

Wave 9/10 adds the proactive reporting loop and launch package. Manual Digest
now saves report history in Redis, shows deterministic recommendations, exposes
Markdown export/copy, and labels mod discussion delivery plus scheduler as
unverified until runtime proof exists.

## Project Impact Draft

Communities that would benefit:

1. Large Q&A or advice communities
   - High moderation volume means small inconsistencies can become visible to users quickly.
   - ModMirror helps teams keep enforcement aligned across many moderators.

2. Learning/help communities such as programming or language-learning communities
   - Beginner posts are often repetitive, but harsh or inconsistent moderation can discourage users.
   - ModMirror helps define consistent escalation paths for low-effort, duplicate, or self-promotion rules.

3. Mid-size hobby communities
   - Community culture depends heavily on fair and predictable moderation.
   - ModMirror helps new moderators follow existing norms instead of guessing.

## What Makes It New

Existing tools help with removal speed, notes, strikes, or queue handling. ModMirror focuses on team consistency:

- surfacing drift,
- converting drift into policy,
- nudging future actions,
- logging justified exceptions.

## Human-in-the-loop Safety

ModMirror does not automatically ban users by default. It recommends, nudges, and logs. Moderators remain responsible for final decisions.

## Current Build Proof

- Current `master` passed `npm run deploy` on 2026-05-21, which ran
  `type-check`, `lint`, `test`, and `devvit upload`.
- The deploy uploaded Devvit app version `0.0.2` with four WebView assets.
- `npx devvit view --json` confirmed public API version `0.12.24`, build
  status `1`, and app capabilities `[10, 11]` (`MODERATOR`, `WEBVIEW` in the
  installed Devvit protos).
- Mirror Scan demo mode surfaces Rule 2 drift.
- Policy Agreement Flow can create/edit policies from drift or manually.
- Apply Policy simulator previews and confirms `log_only` decisions.
- Deviating actions require an override reason and are stored for aggregate review.
- Policy edits create version history so future reviews can see which policy
  version was active.
- Policy health uses deterministic thresholds to flag rules that look stable,
  at risk, or in need of review.
- Overrides can be reviewed without exposing per-mod performance analytics.
- Case Packets generate from demo data or tracked Apply Policy action IDs.
- Case Packets include deterministic comparable cases with match reasons and
  Markdown export/copy UI.
- Command Center is the first dashboard screen and summarizes consistency
  score, top issue, unresolved overrides, policies, last scan, and data mode.
- Manual Digest generates deterministic team-ready Markdown with policy health,
  recommendations, caveats, data mode labels, and saved history.
- Runtime Settings shows live/demo state, Redis/API caveats, delivery mode, and
  demo status.
- Runtime Settings shows digest history and delivery/scheduler capability
  status.

## Known Limitations

- Historical rule attribution depends on available mod log/removal reason data.
- ModMirror uses confidence levels and does not claim perfect attribution.
- Low-volume communities may see less historical drift at first, so ModMirror includes policy-first setup and demo mode.
- Live public comment/private message/modmail/native Mod Notes delivery is not enabled by default.
- Policy health depends on tracked action volume and may show insufficient data
  for sparse communities.
- Case Packets are evidence packets for moderator review; they do not decide
  appeals or claim perfect fairness.
- Scheduled digest delivery and Calibration Mode remain deferred unless
  explicitly opted in and runtime-verified.
- True non-mod protected-route proof, lower-permission moderator role proof,
  live modqueue item reads, deep moderation-log pagination, native Reddit mobile
  app behavior, public/private delivery, scheduler behavior, native Mod Notes,
  destructive moderation actions, real retention deletion, and external AI calls
  remain unverified or disabled.
- Current app metadata still needs terms/privacy links on the app details page
  before any public publish request.
- Browser UI proof is signed in, playtest-ready, shows the compact inline
  launch card, opens the native expanded dashboard modal with the Devvit
  viewport dropdown, and verifies demo scan, policy creation, Apply Policy
  override capture, Case Packet Markdown export, Review inbox/health, Digest,
  and Settings. Static screenshot QA also verifies the productized inline card,
  Command Center, demo scan, policy/apply path, review inbox, Case Packet,
  Digest, Settings, and mobile layout.
