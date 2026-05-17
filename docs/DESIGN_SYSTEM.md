# DESIGN_SYSTEM.md — ModMirror Visual System

This file mirrors the Wave 7/8 design direction in repo-local docs.

## Direction

ModMirror should feel compact, operational, trustworthy, readable, calm, and
decisive. It should look like a serious Reddit-native moderation command
center, not a generic SaaS dashboard or a prototype tab dump.

## Tokens

Use semantic CSS tokens:

```css
--mm-bg: #f7f7f5;
--mm-surface: #ffffff;
--mm-surface-strong: #f1f3f2;
--mm-text: #1f2328;
--mm-muted: #667085;
--mm-border: #d8ddd8;
--mm-accent: #ff4500;
--mm-good: #1a7f37;
--mm-watch: #b7791f;
--mm-risk: #c2410c;
--mm-danger: #b42318;
--mm-info: #2563eb;
```

## Layout

- Inline launch card: compact.
- Expanded dashboard: max width around 1120px.
- Shell order: header or launch card, navigation, main content.
- Cards use subtle borders, consistent padding, and 8px radius.

## Typography

Use system fonts.

- App title: 28-34px desktop, 24px mobile.
- Page title: 24-28px.
- Card title: 16-18px.
- Body: 14-16px.
- Labels: 12-13px.

## Avoid

- Full raw dashboard in inline mode.
- Eight flat tabs in a row.
- Giant empty boxes.
- Walls of explanatory text.
- Unlabeled demo data.
- Tables with no action.
- Scheduler as a core digest feature.
