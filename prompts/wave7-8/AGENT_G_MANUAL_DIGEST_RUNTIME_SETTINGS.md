# AGENT G — Manual Digest + Runtime Settings

Goal: add practical team reporting and runtime confidence surfaces.

Tasks:
1. Implement Digest page: Generate Digest Now, markdown preview, Copy Markdown.
2. Include policy health, top rules needing review, unresolved override count, recommendations, caveats, and data mode label.
3. Do not implement scheduler as core.
4. Implement Settings page: data mode, last scan, policy/override/case counts, Redis/data availability if inferable, Reddit API availability if inferable, delivery mode, demo controls, runtime caveats.
5. Add pure digest generation tests.

Acceptance: digest generation is deterministic/testable; settings help debug runtime.
