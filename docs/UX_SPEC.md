# UX_SPEC.md — ModMirror Productized UX

## Product Experience Principle

Every screen must be action-oriented.

Bad:

> No policies have been created.

Good:

> No policies yet. Create your first policy from a drift candidate or load the demo scenario.

## Information Architecture

Replace prototype tabs with these sections:

1. Command Center
2. Scan
3. Policies
4. Review
5. Case Packets
6. Digest
7. Settings

### Command Center

Purpose: give moderators a one-screen summary of what needs attention.

Must show:

- consistency score,
- top rule needing review,
- unresolved overrides,
- policies active,
- last scan timestamp,
- data mode: Live or Demo,
- primary next action.

Example:

```txt
ModMirror Command Center
Find enforcement drift before your users do.

Consistency Score: 72 / 100
Rule 2 needs review
7 unresolved overrides
3 active policies
Last scan: 12 minutes ago

[Review Rule 2 Overrides] [Run Scan] [Create Policy] [Generate Digest]
```

### Inline Launch Card

The inline Reddit post should not contain the full dashboard.

It should be a compact launch/status surface:

```txt
ModMirror
Find enforcement drift before your users do.

Rule 2 needs review
7 unresolved overrides
3 active policies

[Open Dashboard]
```

If expanded mode is unavailable, keep the card compact at top and render the full dashboard below only after clicking Open Dashboard.

### Expanded Dashboard

The expanded/full view should be the main product. If Devvit supports `requestExpandedMode()` or equivalent, use it for Open Dashboard after verifying against installed typings/RESEARCH.md.

### Setup Wizard

Show when no policies exist, no live scan has been run, or the user explicitly selects Setup.

Steps:

1. Choose data source: Live scan or Demo scenario.
2. Map removal reasons/rules where possible.
3. Create first policy.
4. Apply policy to a sample case.
5. Review dashboard.

### Demo Scenario

Demo mode must feel like a guided story.

Scenario: `r/ExampleLearning`

Rules:

- Rule 1: Be civil
- Rule 2: Low-effort questions
- Rule 3: Self-promotion

Visible story:

- Rule 2 drift detected.
- First-time low-effort cases were handled inconsistently.
- Create policy.
- Apply policy.
- Override appears.
- Policy Health changes.
- Case Packet explains an appeal.

Demo mode must always be labeled.

### Review Inbox

Overrides should feel like cards in an inbox, not raw rows.

Each card:

- rule,
- recommended action,
- selected action,
- override reason,
- status,
- timestamp,
- target/user context where available,
- actions: Accept exception, Policy needs update, Needs discussion, No action needed.

### Case Packets

Case packets must look official and exportable.

Must include user/target, rule, action taken, policy version at action time, consistency status, override review status, prior same-rule history, deterministic comparable cases, caveats, and markdown export.

### Digest

Manual digest only in this wave unless scheduler/mod discussion is already proven.

Digest should generate Markdown with policy health, top issue, suggested action, caveats, and data mode label.

### Settings / Runtime

Settings should show data mode, Redis status, Reddit API/source status if available, rules/removal reasons availability, last scan, demo data controls, delivery mode config if available, and build/version label if available.

## Empty State Rules

Every empty state must include an action.

Examples:

- Load demo scenario
- Run first scan
- Create policy
- Review sample case
- Generate digest

Never leave a screen with only "No data."

## Mobile Rules

The app must be usable at 390px width, tablet width, and desktop width. Cards should stack. Navigation should wrap/collapse. No horizontal overflow. Buttons must remain tappable.
