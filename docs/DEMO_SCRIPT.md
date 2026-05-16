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
7. Save policy.
8. Open a test post/comment.
9. Use "Apply ModMirror Policy."
10. Select Rule 2.
11. Show recommendation:
    - "Policy recommends remove + warning"
12. Select a stricter action.
13. ModMirror shows:
    - "This is stricter than team policy. Continue with override?"
14. Choose override reason or follow policy.
15. Return to dashboard and show override/audit count.

## 2-minute Demo

Use the 60-second demo plus:

- small subreddit mode,
- confidence labels,
- demo seed data toggle,
- aggregate override analytics,
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

## Screenshot Checklist

- [ ] Dashboard empty state
- [ ] Demo seed loaded
- [ ] Mirror Scan result
- [ ] Rule 2 drift detail
- [ ] Policy editor
- [ ] Apply Policy flow
- [ ] Consistency nudge
- [ ] Override audit summary

## Devpost Opening

> ModMirror helps Reddit mod teams find enforcement drift before users do. It scans recent moderation patterns, helps teams convert vague norms into explicit rule policies, and nudges moderators toward consistent enforcement while preserving human discretion.
