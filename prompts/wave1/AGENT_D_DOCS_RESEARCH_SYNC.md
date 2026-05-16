# AGENT D — Wave 1 Docs + Research Sync

## Mission

Reconcile Wave 0 findings with the planning docs so future agents do not use stale assumptions.

You own docs, TODOs, and research truth. You do not own product implementation.

## Read First

- AGENTS.md
- PLAN.md
- TODO.md
- RESEARCH.md
- docs/*
- .codex/skills/devvit-research/SKILL.md
- .codex/skills/wave-execution/SKILL.md
- .codex/skills/devpost-submission/SKILL.md

## Scope

Update:

- RESEARCH.md
- TODO.md
- PLAN.md if needed
- docs/DECISIONS.md if Wave 0 forced changes
- docs/DATA_MODEL.md if Wave 0 changed API/data assumptions
- docs/DEVVIT_RESEARCH_QUESTIONS.md with resolved/unresolved markers
- docs/DEMO_SCRIPT.md if demo flow needs adjustment
- docs/SUBMISSION_NOTES.md only if product positioning changed

## Required Work

1. Read all Wave 0 findings.
2. Extract verified platform facts.
3. Mark assumptions as:
   - verified,
   - unverified,
   - broken,
   - deferred.
4. Update TODO.md for Wave 1 and Wave 2.
5. Create a "Known Platform Constraints" section somewhere obvious.
6. Create a short "Implementation Warnings for Future Agents" section.

## Special Attention

Make sure docs clearly answer:

- Does the app have Devvit Web/client-server structure?
- What are the exact generated commands?
- Which APIs were verified?
- Which APIs failed or remain untested?
- Can the app comment before/after removal?
- What is the chosen message-delivery default?
- What exact permission/capability configs are needed?
- What UI surface is best for dashboard vs forms?

## Non-goals

Do not:
- change product thesis,
- reopen locked decisions,
- implement code,
- write Devpost final copy yet.

## Acceptance Criteria

- Docs match Wave 0 reality.
- TODO.md clearly tells Wave 1 agents what to do.
- Unresolved questions are not hidden.
- Broken assumptions are explicit.
- Commit changes with a docs-focused commit message.

## Completion Report

At the end, report:

- docs changed,
- major Wave 0 findings,
- broken assumptions,
- unresolved risks,
- recommendations before Wave 2.
