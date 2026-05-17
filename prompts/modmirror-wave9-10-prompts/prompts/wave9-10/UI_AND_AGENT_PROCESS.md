# UI and Agent Process — Wave 9/10

## Core Rule

Codex must not freestyle UI.

Use existing ModMirror design system and Wave 7/8 UX docs as the source of truth.

If available, use:

- `uncodexify` frontend improvement skill.
- browser/playwright/agent-browser skills.
- screenshot-driven visual QA.
- Gemini CLI for design critique.
- Gemini 3.1 Pro for high-level design review if available.
- Gemini Flash/slave agents for secondary review if available.
- tmux panes to run dev server, test watcher, visual QA, and design critique concurrently.

If a tool is unavailable, continue without it and document that.

## Required UI Process

1. Inspect current UI via browser screenshot.
2. Compare against `docs/DESIGN_SYSTEM.md` and `docs/UX_SPEC.md` if present.
3. Identify slop:
   - flat tab dump,
   - generic cards,
   - weak hierarchy,
   - dead empty states,
   - cramped inline post layout,
   - inconsistent buttons,
   - unclear CTAs,
   - inaccessible contrast,
   - mobile breakage.
4. Implement UI changes.
5. Re-run screenshot QA.
6. Iterate until the UI feels like a launch-grade mod tool.

## Digest UI Requirements

Digest page must feel like a command surface, not a raw table.

It should include:

- period label/selector,
- Generate Digest Now CTA,
- preview panel,
- summary cards,
- rules needing attention,
- recommended actions,
- copy Markdown button,
- delivery status,
- digest history.

## Launch UI Requirements

Final app must have:

- clear first screen,
- no dead-end empty states,
- demo mode path,
- live mode path,
- settings/runtime capability panel,
- copy that explains value in < 10 seconds.

## Gemini Review Prompt

If Gemini CLI is available, use:

```txt
You are a senior product designer reviewing a Reddit Devvit moderation app called ModMirror.
It helps mod teams find enforcement drift, align policy, review overrides, generate case packets, and create digests.
Review the current screenshots and UI code.
Do not suggest generic SaaS dashboard slop.
Give specific, implementable improvements for hierarchy, layout, copy, navigation, empty states, mobile behavior, and Reddit-native feel.
Focus on making the app judge-ready for a hackathon.
```
