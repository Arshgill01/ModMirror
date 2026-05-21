# DEMO_SCRIPT.md — ModMirror Demo Narrative

## Core Demo Line

Most mod tools help moderators act faster. ModMirror helps mod teams act consistently.

## 3-minute Wave 7/8 Demo

1. Start in the Reddit post inline card.
2. Show that it is compact: tagline, data mode, top issue, unresolved overrides,
   active policies, and Open Dashboard.
3. Click "Open Dashboard."
4. Land on Command Center.
5. Show:
   - consistency score,
   - top issue,
   - unresolved overrides,
   - active policies,
   - last scan,
   - data mode,
   - primary next action.
6. Click "Load Demo" for `r/ExampleLearning`.
7. Open Scan and show result:
   - "60 recent actions scanned"
   - "Rule 2 drift detected"
   - "First-time low-effort cases were handled three different ways"
8. Open Rule 2 drift candidate.
9. Click "Create policy from drift."
10. Configure or show the created policy:
   - first offense: remove + warning
   - second offense: remove + formal note
   - third offense: suggest 3-day ban
   - message delivery: log only until public comment delivery is verified
11. Open the Apply Policy panel.
12. Select the Rule 2 policy.
13. Select a stricter action.
14. Show recommendation:
    - "Policy recommends remove + warning"
15. ModMirror shows:
    - "This is stricter than team policy. Continue with override?"
16. Choose an override reason and confirm the log-only action.
17. Open Review and show:
    - Rule 2 policy health,
    - unresolved override inbox,
    - current policy version.
18. Mark the override as "Policy needs update" if time allows.
19. Open Case Packets and click "Generate demo packet."
20. Show:
    - tracked action,
    - Rule 2 policy version at action time,
    - consistency status,
    - accepted override context,
    - prior same-rule user history,
    - deterministic comparable cases with match reasons,
    - Markdown export.
21. Open Digest and click "Generate Now."
22. Show a saved team-ready Markdown digest with policy health,
    recommendations, unresolved overrides, data mode, caveats, and history.
23. Copy the Markdown.
24. Open Settings and point out data mode, Redis/API caveats, last scan,
    delivery mode `log_only`, demo state, digest history, and unverified
    delivery/scheduler capability status.

## 60-second Demo

Use the same flow, but skip Settings and policy editing:

1. Inline launch card -> Open Dashboard.
2. Command Center -> Load Demo.
3. Scan -> Rule 2 drift.
4. Create Rule 2 policy.
5. Apply stricter sample action and record override.
6. Review override inbox.
7. Generate Case Packet.
8. Generate manual Digest and show history.

Runtime note: the dashboard starts as a compact inline Reddit card and Open
Dashboard requests Reddit's native expanded WebView modal, preserving the
Devvit viewport dropdown for mobile/desktop switching. Post/comment Apply
Policy menu UX remains runtime-unverified. The Wave 7/8 demo uses the
dashboard simulator and `log_only` records so no unverified Reddit moderation
action is performed.

## 2-minute Demo

Use the 60-second demo plus:

- small subreddit mode,
- confidence labels,
- demo seed data toggle,
- aggregate override analytics,
- override review inbox,
- policy health,
- policy version history,
- Case Packet / Appeal Context,
- no-policy fallback.

## Demo Data

Fake subreddit:

`r/ExampleLearning`

Rules:

- Rule 1: Be civil
- Rule 2: Low-effort questions
- Rule 3: Self-promotion

Seed actions:

- 60 total actions
- Rule 2:
  - 12 warning/removal comments
  - 5 removals with no note
  - 4 temporary ban suggestions
- Rule 3:
  - mostly consistent removals
- Rule 1:
  - severe cases escalated

## Wave 0 Runtime Caveat

Until Devvit playtest verifies comment behavior before/after removal, the live demo should treat visible warning/removal messages as preview text and store the actual decision as `log_only`.

Do not show public comment, private message, modmail, or native Mod Notes delivery as working unless that exact path has been tested in the target subreddit.

## Screenshot Checklist

- [x] Inline launch card
- [x] Command Center
- [x] Setup wizard / demo scenario
- [x] Demo seed loaded
- [x] Mirror Scan result
- [x] Rule 2 drift detail
- [x] Policy editor
- [x] Apply Policy simulator
- [x] Consistency nudge / override reason requirement
- [x] Override audit summary API/service
- [x] Governance dashboard policy health cards
- [x] Override review inbox
- [x] Policy version history summary
- [x] Case Packet demo generation
- [x] Markdown export/copy surface
- [x] Manual Digest page
- [x] Digest history/capability status
- [x] Runtime Settings page
- [x] Mobile-width Settings screenshot

Latest committed Rule 2 drift-detail proof asset:

- `docs/screenshots/submission/rule2-drift-detail-static.png`

This screenshot is a static built-client proof with deterministic
ExampleLearning demo data. It does not replace authenticated Devvit WebView
route proof.

## Devpost Opening

> ModMirror helps Reddit mod teams find enforcement drift before users do. It scans recent moderation patterns, helps teams convert vague norms into explicit rule policies, and nudges moderators toward consistent enforcement while preserving human discretion.
