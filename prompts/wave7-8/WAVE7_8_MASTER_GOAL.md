/goal

You are working in the ModMirror repository.

This is Mega Wave 7/8: Productization + Real Moderation Workflow.

The user is explicitly unhappy with the current UI/prototype feel. The current app works, but it looks like a cramped prototype embedded inside a Reddit post. Your job is to turn it into a launch-grade Reddit-native moderation product.

This is a large autonomous execution goal, but you do NOT have design autonomy. You must follow the UX spec and design system exactly unless a Devvit limitation forces a change.

## Read First

Read all of these before coding:

- AGENTS.md
- PLAN.md
- TODO.md
- RESEARCH.md
- docs/PRODUCT.md
- docs/DECISIONS.md
- docs/DATA_MODEL.md
- docs/DEMO_SCRIPT.md
- docs/SUBMISSION_NOTES.md
- docs/WAVE7_8_EXECUTION_NOTES.md
- docs/UX_SPEC.md
- docs/DESIGN_SYSTEM.md
- docs/PRODUCTIZATION_ACCEPTANCE_CHECKLIST.md
- prompts/wave7-8/UI_FRONTEND_PROCESS.md
- prompts/wave7-8/WAVE7_8_ORCHESTRATOR.md
- all AGENT_*.md files in prompts/wave7-8/

Also inspect the current source tree and current Wave 6 implementation.

## Required Process

1. Start from master/main with a clean working tree.
2. Create an integration branch: `integration/wave7-8-productization`.
3. Create worktrees/branches for sub-passes if practical:
   - `feat/wave7-8-ux-architecture`
   - `feat/wave7-8-visual-system`
   - `feat/wave7-8-inline-expanded`
   - `feat/wave7-8-command-center-setup`
   - `feat/wave7-8-governance-case-ui`
   - `feat/wave7-8-workflow-digest-settings`
   - `test/wave7-8-qa-docs`
4. If worktrees are too heavy for this repo state, execute sub-passes sequentially on the integration branch, but keep commits granular.
5. Execute every AGENT_*.md prompt one by one.
6. Merge/integrate each sub-pass.
7. Run full checks.
8. Runtime verify in Reddit playtest if possible.
9. Update docs/TODO/RESEARCH.
10. Merge integration into master/main and push if all checks pass.

## Mandatory UI/Frontend Process

Codex must not freestyle UI.

Before UI implementation:

- read docs/UX_SPEC.md,
- read docs/DESIGN_SYSTEM.md,
- read prompts/wave7-8/UI_FRONTEND_PROCESS.md,
- inspect `.codex/skills`.

Use available skills:

- If `uncodexify` exists, use it for a UI critique/refinement loop.
- If browser automation/playwright/agent-browser exists, use it for screenshot QA.
- If Gemini CLI exists and is authenticated, use it as a design reviewer.

Gemini instructions:

- Probe availability first with `which gemini` and `gemini --help`.
- Do not assume exact model names.
- If configured model aliases such as Gemini 3.1 Pro / Flash are available, use stronger model for design review and faster model for narrow QA critique.
- Do not rely on Gemini to write large code blindly.
- Save any useful design critique summary to `docs/UI_REVIEW.md`.
- Do not block the wave if Gemini is unavailable.

Tmux instructions:

- If running in tmux, you may create panes for dev server, tests, and browser QA.
- Use bounded session/pane counts.
- Record commands in the completion report.
- Do not spawn uncontrolled background processes.

## Product Goal

Make ModMirror feel like this:

> A serious Reddit-native moderation command center that helps mod teams find enforcement drift, set policies, review exceptions, and handle appeals with context.

Not like:

- a README rendered in a post,
- a flat tab dump,
- a generic admin panel,
- a Codex default CSS prototype.

## Required Deliverables

### 1. New App Shell / IA

Replace flat prototype tabs with:

- Command Center
- Scan
- Policies
- Review
- Case Packets
- Digest
- Settings

The first screen must be Command Center.

### 2. Inline Launch Card + Expanded Dashboard

Implement a compact inline launch/status card.

The inline card should show:

- ModMirror tagline
- data mode
- top issue
- unresolved override count
- policy count
- Open Dashboard CTA

If Devvit supports expanded mode/requestExpandedMode, implement Open Dashboard to request expanded mode after verifying with installed SDK/typings/RESEARCH.md.

If expanded mode is not available, implement robust fallback where full dashboard opens inside the post after clicking Open Dashboard.

Do not render the full raw dashboard immediately in inline mode.

### 3. Command Center

Build a real command center showing:

- consistency score
- top rule needing review
- unresolved overrides
- active policies
- last scan time
- live/demo mode
- primary next action
- secondary actions

It should be operational, not explanatory.

### 4. Setup Wizard + Cinematic Demo Scenario

Add guided setup:

- choose live scan or demo scenario,
- run scan/load demo,
- map/create policy,
- apply policy/sample,
- review results.

Demo scenario should tell the ExampleLearning story.

Every empty state should route to setup/demo/action.

### 5. Governance + Case Packet UI Upgrade

Upgrade existing Wave 5/6 UI:

- policy health cards visual and actionable,
- override review as inbox cards,
- case packets as official/exportable appeal context,
- clear status labels,
- markdown export remains working.

### 6. Real Workflow Hardening

Ensure Apply Policy, override capture, and Case Packet generation still work. Demo flows must not corrupt live data. Settings must clearly show live vs demo mode. If message delivery is uncertain, keep log_only as safe default and document.

### 7. Manual Digest

Implement manual digest generation:

- dashboard page,
- generate now,
- markdown output,
- copy markdown,
- include policy health, overrides, top recommendations, caveats.

Do NOT implement scheduler unless already proven and trivial. Do NOT make scheduler core.

### 8. Runtime Settings Panel

Settings page should show Redis/data status, Reddit API/source status if available, last scan, demo data state, app/build version if possible, runtime caveats, and delivery mode if applicable.

### 9. Responsive + Accessibility QA

Must test desktop expanded/dashboard, inline post, mobile-ish width, keyboard focus where practical, contrast sanity, and no horizontal overflow.

Capture screenshots if tooling allows.

### 10. Docs + Tests

Update README.md, TODO.md, PRODUCT.md, DEMO_SCRIPT.md, SUBMISSION_NOTES.md, DATA_MODEL.md if needed, RESEARCH.md if Devvit behavior discovered, and docs/UI_REVIEW.md if design review was performed.

Add/update tests for command center summary calculations, digest generation, setup/demo state helpers, and any new pure functions.

## Hard Constraints

Do NOT add LLM rule classification, AI moderation judge, generic queue dashboard, automatic ban engine, cross-subreddit benchmarking, external analytics service, vague fuzzy similar-case logic, or huge design dependency unless justified.

Do NOT remove deterministic attribution, policy version history, policy health, override review, case packets, or tests.

## Acceptance Criteria

Wave 7/8 is complete only if:

- `npm install` succeeds or existing audit warnings are documented.
- `npm run build` passes.
- `npm run type-check` passes.
- `npm test` passes.
- `npm run lint` passes.
- `npm run dev` / playtest reaches a usable Reddit UI or exact blocker is documented.
- Inline card no longer looks like a full raw dashboard.
- Command Center is the first meaningful screen.
- Demo scenario can carry a 3-minute judge demo.
- Manual digest works.
- Case Packet flow still works.
- UI screenshots are captured or screenshot blocker documented.
- docs/PRODUCTIZATION_ACCEPTANCE_CHECKLIST.md is updated.
- Completion report includes what changed, commands run, checks, screenshots, known issues, and next recommended wave.

## Final Merge

If all checks pass, merge `integration/wave7-8-productization` into master/main with a no-ff commit and push to origin.

If checks fail, do not merge to master/main. Document exact blocker and stop.
