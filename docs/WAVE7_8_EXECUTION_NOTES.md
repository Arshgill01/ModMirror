# WAVE7_8_EXECUTION_NOTES.md — Mega Productization + Real Workflow

## Name

Mega Wave 7/8 — Make ModMirror Real

## Goal

Turn ModMirror from a functional prototype into a launch-grade Reddit-native moderation product.

This is not a small polish pass. This wave should:

- redesign the app information architecture,
- replace prototype UI with a real product experience,
- add inline launch card + expanded dashboard behavior where supported,
- build a command center that tells mods what to do next,
- add a guided setup/onboarding flow,
- make demo mode cinematic and judge-proof,
- harden the real mod workflow surfaces,
- add manual digest generation,
- add runtime/settings status,
- perform mobile/web/accessibility QA,
- update docs and demo assets.

## Product Bar

The app should feel understandable and valuable within 90 seconds.

The first screen should answer:

1. What is wrong?
2. What should I do now?
3. Is this live data or demo data?
4. Can I trust the recommendation?
5. How does this help a mod team today?

## Locked Thesis

ModMirror helps Reddit mod teams enforce rules consistently over time.

The loop:

Scan → Detect drift → Set policy → Enforce → Override → Review → Improve policy → Handle appeal with context.

## What This Wave Is Not

Do not add:

- AI rule judging,
- LLM classification,
- generic mod queue dashboard,
- automatic punishment engine,
- cross-subreddit benchmarking,
- vague fuzzy similar-case matching,
- external analytics services,
- unrelated visual gimmicks.

## Final Experience Target

Inline post should act as a launch card.

Expanded/dashboard mode should feel like a command center.

The dashboard should have:

- Command Center
- Scan
- Policies
- Review
- Case Packets
- Digest
- Settings

No more flat prototype tab dump.
