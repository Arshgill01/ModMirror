# ModMirror V2 Master Build Plan

Last updated: 2026-05-21

## Purpose

This is the canonical development-only master plan. It supersedes the earlier
12-wave control plan because that plan was too thin and too weighted toward
hardening. This V2 plan is built for continuous multi-agent execution over 3-4
days.

This is not a submission plan. Do not work on Devpost, app listing copy, public
Reddit posts, video scripts, demo videos, or submission hardening from this
folder.

## What We Are Actually Building

The plan builds ten peak product additions:

1. **Command Center:** the first screen becomes a quantified policy health
   cockpit, not a generic dashboard.
2. **Drift Radar:** moderators can see which rules are drifting, why, and what
   evidence supports the claim.
3. **Policy Workbench:** policy creation becomes a serious editor with drafts,
   versions, gaps, checks, and adoption states.
4. **Apply Policy Cockpit:** target handling becomes a focused decision cockpit
   with recommendation, evidence, preview, override, and receipt.
5. **Team Calibration Studio:** new and existing mods can practice policy
   decisions against team-aligned scenarios without leaderboards or blame.
6. **Scenario Lab:** lead mods can create and tune calibration scenarios from
   drift, receipts, and demo fixtures.
7. **Policy Simulator:** teams can preview how policy ladder changes would have
   affected recent historical cases before adopting them.
8. **Evidence Graph:** Case Packets and Evidence Boards become connected,
   explainable proof objects instead of isolated records.
9. **Review Room:** overrides, policy impact, ratification, and unresolved
   exceptions become one moderator review workflow.
10. **Demo Orchestration Engine:** demo mode becomes deterministic,
    stateful, resettable, and capable of proving the full product loop without
    live subreddit data.

These are product additions, not presentation artifacts.

## Product Standard

At the end of V2, a moderator should be able to open ModMirror and understand:

- where the team is inconsistent
- which rule needs attention first
- what policy the team agreed to
- what action is recommended for a new case
- why a moderator deviated
- what the team should review next
- how a new mod can learn the team norm

The app must still be deterministic, moderator-confirmed, privacy-conscious,
and honest about confidence.

## Execution Rules

Every wave folder contains the actual task brief. Agents must:

1. read root `AGENTS.md`
2. read `docs/master-plan/agent-protocol.md`
3. read this file
4. read `PEAK_ADDITIONS.md`
5. read their wave README
6. inspect source before editing
7. update their wave `execution-log.md`

Default validation:

```sh
npm run type-check
npm run lint
npm test
npm run build
```

Runtime waves must also record exact Devvit playtest versions and proof paths.

## Parallel Lanes

| Lane | Waves | Ownership |
|---|---|---|
| Product hook | 01, 02, 03 | health, drift, policy authoring |
| Action loop | 04, 08, 09 | Apply Policy, evidence, review |
| Calibration | 05, 06, 07, 10 | onboarding, scenarios, simulation |
| Trust/runtime | 12, 14, 15, 16, 17 | labels, proof, resilience, storage |
| Demo/test/UI | 13, 18, 19, 20 | demo orchestration, golden tests, polish, final audit |

## Wave Board

| Wave | Name | Build Outcome |
|---|---|---|
| 01 | Command Center | First screen shows quantified policy health and next best actions. |
| 02 | Drift Radar | Rule-level drift analysis becomes inspectable and evidence-backed. |
| 03 | Policy Workbench | Policy creation/editing becomes a serious team agreement tool. |
| 04 | Apply Policy Cockpit | Applying a policy becomes a focused, receipt-backed decision flow. |
| 05 | Team Calibration Studio | Mods can practice decisions against team policy safely. |
| 06 | Scenario Lab | Leads can create, edit, and seed calibration scenarios. |
| 07 | Policy Simulator | Policy changes can be previewed against historical/demo cases. |
| 08 | Case Evidence Graph | Receipts, snapshots, packets, boards, policies connect coherently. |
| 09 | Review Room | Overrides and policy exceptions become one review workflow. |
| 10 | Onboarding Paths | New mod and existing team workflows become first-class journeys. |
| 11 | Community Health Radar | Aggregate-only health signals become actionable without surveillance. |
| 12 | Trust Labels | Capability status, confidence, privacy, and proof labels become universal. |
| 13 | Demo Orchestration Engine | Demo mode becomes resettable, deterministic, and full-loop. |
| 14 | Live Read Proof | Safe read-only Reddit paths are proven or accurately constrained. |
| 15 | Access + Privacy Proof | Non-mod, lower-role, and privacy gates are runtime verified where possible. |
| 16 | Runtime Resilience | Offline, fallback, partial failure, and retry states are hardened. |
| 17 | Storage + Retention | Redis caps, cleanup, indexes, and retention behavior are hardened. |
| 18 | Golden Test System | Core product story gets regression-proof fixtures and contract tests. |
| 19 | UI Excellence Pass | The whole product gets dense, polished, no-overlap UX. |
| 20 | Final Development Gauntlet | Full development audit and end-to-end validation. |

## Non-Negotiable Exclusions

- no Devpost
- no video
- no video script
- no app listing copy
- no public launch copy
- no automatic enforcement
- no AI judging
- no per-mod blame or leaderboard
- no destructive Reddit action without explicit approval

