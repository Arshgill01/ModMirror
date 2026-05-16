# DEMO_SCRIPT.md — ModMirror Demo Narrative

## Core Demo Line

Most mod tools help moderators act faster. ModMirror helps mod teams act consistently.

## 60-second Demo

1. Open ModMirror dashboard.
2. Click "Run Mirror Scan."
3. Show result:
   - "60 recent actions scanned"
   - "Rule 2 drift detected"
   - "First-time low-effort cases were handled three different ways"
4. Open Rule 2 drift candidate.
5. Click "Create Team Policy."
6. Configure:
   - first offense: remove + warning
   - second offense: remove + formal note
   - third offense: suggest 3-day ban
   - message delivery: log only until public comment delivery is verified
7. Save policy.
8. Open the Apply Policy dashboard simulator.
9. Select the Rule 2 policy.
10. Select Rule 2.
11. Show recommendation:
    - "Policy recommends remove + warning"
12. Select a stricter action.
13. ModMirror shows:
    - "This is stricter than team policy. Continue with override?"
14. Choose override reason or follow policy.
15. Return to Governance and show:
    - Rule 2 policy health,
    - unresolved override inbox,
    - current policy version.
16. Mark the override as "Policy needs update."
17. Edit the Rule 2 policy and show that a new policy version is created.

Runtime note: the dashboard can be launched from a moderator-only subreddit
menu action that opens a confirmation form before creating a custom post.
Post/comment Apply Policy menu UX remains a later browser playtest item. The
Wave 3/4 demo uses the dashboard simulator so no unverified Reddit moderation
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

- [ ] Dashboard empty state
- [ ] Demo seed loaded
- [ ] Mirror Scan result
- [ ] Rule 2 drift detail
- [x] Policy editor
- [x] Apply Policy simulator
- [x] Consistency nudge / override reason requirement
- [x] Override audit summary API/service
- [x] Governance dashboard policy health cards
- [x] Override review inbox
- [x] Policy version history summary

## Devpost Opening

> ModMirror helps Reddit mod teams find enforcement drift before users do. It scans recent moderation patterns, helps teams convert vague norms into explicit rule policies, and nudges moderators toward consistent enforcement while preserving human discretion.
