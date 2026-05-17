# DESIGN_SYSTEM.md — ModMirror Visual System

## Direction

ModMirror should feel like a serious Reddit-native moderation command center, not a generic SaaS dashboard and not a default Codex prototype.

Keywords: compact, operational, trustworthy, readable, calm, decisive.

## Visual Hierarchy

Every page should have:

1. Page title
2. One-line purpose
3. Primary action
4. Status/metrics
5. Detailed cards

## Layout

Use a shell:

```txt
Header / launch card
Navigation
Main content
```

Preferred max content width:

- expanded dashboard: around 1120px
- inline card: compact, not a huge scroll dump

## Cards

Cards should have clear title, short description, metric or status, action buttons, subtle border, and consistent padding. Avoid raw tables unless the content truly needs comparison.

## Status Colors

Use status semantically. Suggested tokens:

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

If dark mode is detected or existing app uses dark, preserve contrast and do not create low-contrast gray-on-gray UI.

## Typography

Use system fonts.

Scale:

- app title: 28-34px desktop, 24px mobile
- page title: 24-28px
- card title: 16-18px
- body: 14-16px
- labels: 12-13px

## Bad UI Patterns To Avoid

- eight flat tabs in one row,
- giant empty white boxes,
- default unstyled forms,
- unlabeled demo data,
- tables with no action,
- walls of text,
- dashboard where every metric is zero,
- screenshots that look like raw localhost admin UI,
- cramped inline-only full app.

## Required UI QA

After implementation, capture screenshots for inline launch card, expanded command center, setup wizard, demo scenario loaded, policy health/review inbox, case packet, digest, settings, and mobile width.

Use available browser automation/playwright/agent-browser skills if present.
