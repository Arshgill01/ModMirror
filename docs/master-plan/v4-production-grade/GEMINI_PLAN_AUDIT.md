# Gemini Plan Audit

Date: 2026-05-21

## Source Files

Latest relevant Gemini/Antigravity CLI plan:

- `/Users/arshdeepsingh/.gemini/antigravity-cli/brain/e565110f-7b39-41a5-87d3-026c2d7d6787/implementation_plan.md`
- `/Users/arshdeepsingh/.gemini/antigravity-cli/brain/e565110f-7b39-41a5-87d3-026c2d7d6787/task.md`

This plan is separate from the May 21 visual-only Antigravity worktree that was
merged in `e64b5c9`.

Additional read-only explorer checks were run with `/goal` subagents against:

- current `src/client/main.ts`, `src/client/styles.css`, and
  `src/client/state/store.ts`;
- `docs/v3-hackathon-victory-waves`;
- `docs/master-plan/v2`;
- product and competitive context docs.

## Executive Verdict

Gemini identified real frontend gaps, but the plan is too narrow to be the
production-grade master plan. It is an 18-wave frontend overhaul centered on
client refactoring and richer UI controls. That is valuable, but it does not
close the larger blockers that keep ModMirror from being a credible production
application: route-level runtime proof, account-role proof, live source proof,
multi-moderator workflows, native mobile QA, reliability around partial API
failures, privacy/security review, and final integration discipline.

Use Gemini's plan as a UI/product-surface input, not as the source of truth.

## Keep

- Rename the calibration surface toward the clearer user job: "Onboard a New
  Mod" or "Team Policy Quiz".
- Build a real step-by-step calibration quiz instead of a read-only scenario
  list.
- Expose Scenario Lab authoring and archiving in the client.
- Turn Evidence Graph into a lane-based visual flow instead of raw edge text.
- Expose Policy Simulator results in the policy workbench.
- Expand Drift Radar cards with action distribution and representative cases.
- Improve policy ratification UX.
- Give Override Review a real resolution workflow.
- Add Incident Mode, config portability, and privacy retention controls to
  Settings if those backend routes are already safe.
- Reduce `src/client/main.ts` risk by extracting narrow state/action/rendering
  modules incrementally.

## Correct Before Use

- Do not import Google Fonts. Devvit app UI should use local/system font stacks
  and remain self-contained.
- Do not adopt glassmorphism as the default visual language. The current
  product is an operational moderation tool; heavy blur/glow styling risks
  looking decorative, less dense, and less Reddit-native.
- Do not perform a one-shot rewrite of the 8,500-line client monolith. Extract
  vertical slices with tests and screenshots so the app stays buildable after
  every wave.
- Do not show individual authors or moderator names in representative-case
  surfaces unless the field is already privacy-reviewed and appropriate for the
  current permission level.
- Do not treat browser/static rendering as Devvit runtime proof.
- Do not enable public comments, private delivery, Mod Discussion, native Mod
  Notes, scheduler jobs, retention deletion, AI calls, or destructive
  moderation without the existing explicit approval/proof plans.
- Do not optimize only for judge flash. Every addition must improve real
  moderator usefulness and preserve the consistency-first thesis.

## Missing From Gemini Plan

- A source-of-truth audit linking plan promises to actual repo state.
- Runtime proof waves for safe V2 routes and API-backed WebView states.
- True non-mod and limited-mod role proof.
- Live modqueue item proof and deep moderation-log pagination proof.
- Native Reddit mobile QA.
- Multi-moderator ratification proof.
- A 60-second judge/demo path that compresses the full Rule 2 story.
- Public proof assets: screenshot package, short demo video plan, and exact
  in-app states for each shot.
- Public copy/positioning pass for README, Devpost/app listing, and Reddit
  showcase copy around one workflow rather than a feature inventory.
- Accessibility, keyboard, focus, and reduced-motion validation.
- Error taxonomy and user-facing recovery paths for protected-route failures,
  subreddit isolation failures, offline/partial API states, and runtime
  capability failures.
- Bundle/performance work after modularization.
- Security/privacy review of stored operational data and export surfaces.
- PR/worktree/merge discipline for parallel agents.
- A completion checklist that prevents marking the goal complete from proxy
  signals alone.

## Plan Decision

The V4 production-grade plan keeps Gemini's useful product surfaces but expands
them into a 30-wave execution board covering:

- client UX and modularization,
- core product loop clarity,
- runtime proof and account/device evidence,
- privacy/security/accessibility,
- production reliability,
- integration, proof assets, PR, and final audit discipline.

## Explorer Findings Incorporated

- `store.ts` and `store.test.ts` already exist, but `main.ts` still owns most
  local UI state. V4 must wire existing state into one slice at a time instead
  of creating a duplicate store.
- Scenario Lab, incident mode, config portability, privacy controls, and
  override review already have monolith UI wiring. V4 should refine and test
  those surfaces instead of rebuilding them as if they do not exist.
- The calibration surface is still not a real quiz: it shows scenario cards and
  a `Show Team Norm` action that submits the expected answer. That is the
  highest-value frontend gap.
- Evidence Graph still renders important relationship data too flatly.
- Policy Simulator has a backend route but lacks a serious client panel.
- Drift Radar needs expandable distribution/case drilldowns.
- Final hackathon success still depends on proof/copy assets, even though older
  development-only plans intentionally excluded submission work.
- Runtime analysis confirms ModMirror is past MVP in breadth but not in proof.
  The production plan must convert local/type/static claims into runtime
  evidence before adding risky surface area.
- Redis index hygiene, fail-closed access, read-only Reddit source proof,
  controlled retention/execution harnesses, delivery/Mod Notes/scheduler proof
  plans, multi-moderator governance, and native mobile QA are production
  readiness work, not optional polish.
