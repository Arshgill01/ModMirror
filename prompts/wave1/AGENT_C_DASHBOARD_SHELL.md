# AGENT C — Wave 1 Dashboard Shell

## Mission

Build the initial ModMirror dashboard shell and route/page structure.

You own the client UI skeleton and server route shape needed for health/status/demo-mode display. You do not own Redis internals or full product logic.

## Read First

- AGENTS.md
- PLAN.md
- RESEARCH.md
- docs/PRODUCT.md
- docs/DECISIONS.md
- docs/DEMO_SCRIPT.md
- .codex/skills/modmirror-product-guardrails/SKILL.md
- .codex/skills/wave-execution/SKILL.md

## Scope

Create/update:

- main client app shell
- dashboard layout
- initial pages/sections:
  - Overview
  - Mirror Scan placeholder
  - Policies placeholder
  - Overrides placeholder
  - Demo Mode placeholder
- health/status fetch from server
- empty states

Use the scaffold’s actual client/server setup from Wave 0.

## Required UI Behavior

The dashboard should communicate the product clearly within 10 seconds.

Must include:

- product name: ModMirror
- tagline: Find enforcement drift before your users do.
- short explanation:
  "ModMirror helps mod teams detect enforcement drift, align rule policies, and apply consistent moderation workflows."
- clear Wave 1 status cards:
  - Mirror Scan
  - Policy Agreement
  - Apply Policy
  - Override Audit
- demo mode indicator/toggle placeholder
- health/status display if endpoint exists
- “Wave 2 will implement live scan” placeholder text

## Design Direction

Keep it clean and serious. This is a moderator tool, not a flashy consumer app.

Prefer:
- readable cards,
- simple layout,
- clear empty states,
- no fake claims.

Avoid:
- AI-looking buzzwords,
- overanimated UI,
- dense dashboards before data exists,
- pretending unbuilt features work.

## Server Route

If no health endpoint exists, create or coordinate a minimal one:

Response shape should include:

- app name
- environment/playtest-ish status if available
- subreddit context if available
- demo mode flag if available
- Redis smoke status if available

If Redis services are not merged yet, use a safe placeholder and leave integration TODO.

## Non-goals

Do not:
- implement real Mirror Scan,
- implement policy editor,
- implement Apply Policy menu action,
- implement attribution scoring,
- add heavy UI libraries unless already present.

## Acceptance Criteria

- Dashboard loads.
- Status/health section works or shows documented placeholder.
- UI has no dead empty state.
- Build passes or exact blocker is documented.
- TODO.md updated with Wave 2 UI tasks.
- Commit changes with granular commit messages.

## Completion Report

At the end, report:

- files changed,
- UI sections added,
- endpoints used/created,
- commands run,
- integration needs from Agents A/B.
