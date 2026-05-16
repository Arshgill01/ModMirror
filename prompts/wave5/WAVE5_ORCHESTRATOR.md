# WAVE5_ORCHESTRATOR.md — Governance Core

## Objective

Implement Wave 5: Policy Versioning + Policy Health + Override Review.

This wave closes the governance loop.

## Required Features

### 1. Policy Version History

Every policy edit must create a new immutable version.

Each enforcement/action/override should store the policy version active at the time.

Minimum required concepts:

```ts
Policy
PolicyVersion
PolicyChangeEvent
ActivePolicyVersion
PolicySnapshotOnAction
```

Do not destroy old versions when editing a policy.

### 2. Policy Health Engine

For each rule/policy, compute a deterministic health status:

```txt
stable
watch
at_risk
needs_review
insufficient_data
```

Use factors like:

- total tracked actions
- adherence rate
- override rate
- unresolved override count
- count/rate of "policy seems wrong" overrides
- unmatched/low-confidence actions where available
- recent activity if available

No AI. No LLMs.

### 3. Override Review Inbox

Overrides should be reviewable, not just stored.

Review statuses:

```txt
unresolved
accepted_exception
policy_needs_update
needs_team_discussion
no_action_needed
```

Each review update should record:

- reviewedBy
- reviewedAt
- reviewStatus
- reviewNote optional

### 4. Governance Dashboard

Add UI surfaces for:

- policy health cards
- override review inbox
- policy version/timeline summary
- recommendations/suggestions
- small data / insufficient data states

Avoid per-mod blame. Prefer team aggregate framing.

### 5. Tests + Docs + Runtime QA

Add tests for:

- policy version creation
- policy snapshot stamping
- health status calculation
- override review state transitions
- migration/fallback for old policy/action data if needed

Update:

- PLAN.md
- TODO.md
- RESEARCH.md if runtime/platform facts are discovered
- docs/DATA_MODEL.md
- docs/DECISIONS.md
- docs/PRODUCT.md
- README.md if needed

## Acceptance Criteria

- `npm install` passes or existing lockfile remains valid.
- `npm run build` passes.
- `npm run type-check` passes if present.
- `npm run lint` passes if present.
- `npm test` passes if present.
- Dashboard shows policy health.
- Override review inbox works.
- Editing a policy creates a new version.
- Old action records remain linked to their original policy version/snapshot.
- No Wave 6 case-packet UI or digest scheduler is implemented in this wave.

## Hard Guardrails

- Do not use LLMs.
- Do not add external services.
- Do not build Calibration Mode.
- Do not build Case Packets yet.
- Do not build scheduled digest yet.
- Do not convert ModMirror into a generic moderation suite.
- Do not expose individual mod performance analytics unless permission-gated and explicitly justified.
