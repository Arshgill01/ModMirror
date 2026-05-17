# UX_SPEC.md — ModMirror Productized UX

This file mirrors the Wave 7/8 productized UX source prompt so future work can
reference the spec from `docs/`.

## Information Architecture

Use these sections:

1. Command Center
2. Scan
3. Policies
4. Review
5. Case Packets
6. Digest
7. Settings

The first screen is Command Center. The inline Reddit post starts as a compact
launch/status card, not the full dashboard.

## Required Screens

- Command Center: consistency score, top rule needing review, unresolved
  overrides, active policies, last scan, data mode, primary next action, and
  secondary actions.
- Scan: live scan and demo scan actions, confidence labels, drift candidates,
  and action-oriented empty states.
- Policies: create/edit policy ladders, create from drift, manual creation,
  no-policy fallback.
- Review: policy health cards and override inbox cards.
- Case Packets: official/exportable appeal context with Markdown export.
- Digest: manual Markdown digest generation only.
- Settings: data mode, runtime status, Redis/source status, last scan, demo
  state, delivery mode, caveats, and version where available.

## Empty States

Every empty state routes to a useful action such as loading demo data, running a
scan, creating a policy, reviewing a sample case, or generating a digest.

## Demo Scenario

The demo scenario is `r/ExampleLearning` and tells the Rule 2 low-effort
question story:

- Rule 2 drift detected.
- First-time low-effort cases were handled inconsistently.
- Create policy.
- Apply policy.
- Override appears.
- Policy health changes.
- Case Packet explains appeal context.

Demo mode must always be labeled.

## Mobile

The app must be usable at 390px, tablet width, and desktop width without
horizontal overflow. Buttons remain tappable and cards stack.
