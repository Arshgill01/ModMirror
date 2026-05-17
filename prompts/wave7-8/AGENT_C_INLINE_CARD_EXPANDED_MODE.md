# AGENT C — Inline Launch Card + Expanded Dashboard

Goal: stop rendering the entire raw dashboard directly inside the Reddit post.

Tasks:
1. Verify Devvit expanded/fullscreen/requestExpandedMode support through RESEARCH.md, typings, generated SDK, or docs.
2. Implement compact inline launch card.
3. Add Open Dashboard CTA.
4. If expanded mode is supported, request expanded mode on Open Dashboard.
5. If not, implement in-app expanded fallback after click.
6. Document new Devvit findings in RESEARCH.md.

Acceptance: initial inline view is compact; full dashboard appears only after Open Dashboard or expanded mode.
