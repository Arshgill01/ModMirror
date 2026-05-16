# AGENT_B_POLICY_HEALTH_ENGINE.md — Policy Health Engine

## Mission

Implement deterministic policy health scoring.

The purpose is to show which rules/policies are stable and which need team review.

## Read First

- AGENTS.md
- PLAN.md
- docs/DATA_MODEL.md
- prompts/wave5/WAVE5_ORCHESTRATOR.md
- current action/override data model

## Product Goal

A rule card should be able to say:

```txt
Rule 2 — Low-effort Questions
Status: At Risk

28 actions
18 followed policy
7 overrides
3 unresolved overrides

Top issue:
Most overrides say "Policy seems wrong."

Recommendation:
Review this rule's escalation ladder.
```

## Tasks

### 1. Define health types

Add types similar to:

```ts
export type PolicyHealthStatus =
  | 'stable'
  | 'watch'
  | 'at_risk'
  | 'needs_review'
  | 'insufficient_data';

export interface PolicyHealthSummary {
  policyId: string;
  ruleId: string;
  ruleName: string;
  status: PolicyHealthStatus;
  totalActions: number;
  followedPolicyCount: number;
  overrideCount: number;
  unresolvedOverrideCount: number;
  policySeemsWrongCount: number;
  adherenceRate: number;
  overrideRate: number;
  reasons: string[];
  recommendations: string[];
  sampleWarning?: string;
}
```

Adapt to existing conventions.

### 2. Implement pure health calculation

Create a pure function like:

```ts
computePolicyHealth({
  policy,
  actions,
  overrides,
  options
}): PolicyHealthSummary
```

The function must be deterministic.

Suggested default thresholds:

```txt
totalActions < 5 => insufficient_data
unresolvedOverrideCount >= 5 => needs_review
policySeemsWrongCount >= 3 => needs_review
overrideRate >= 0.35 => at_risk
overrideRate >= 0.20 => watch
adherenceRate >= 0.85 => stable
otherwise watch
```

Tune as needed, but document thresholds.

### 3. Add recommendation generation

Examples:

- "Not enough tracked actions yet. Keep using ModMirror to build confidence."
- "Review this policy: many overrides say policy seems wrong."
- "Review recent exceptions before changing the policy."
- "Policy appears stable. No action needed."

No AI.

### 4. Wire to server endpoint/service

Expose health summaries through existing dashboard API or a new endpoint.

Possible endpoints:

```txt
GET /api/policy-health
GET /api/policies/:id/health
```

Use existing route style.

### 5. Use real + demo data

Health should work for:

- real action logs,
- demo seed data,
- sparse/no data.

### 6. Tests

Add tests for:

- insufficient data
- stable
- watch
- at risk
- needs review due to "policy seems wrong"
- needs review due to unresolved overrides

## Acceptance Criteria

- Health engine is pure/tested.
- Dashboard/API can retrieve summaries.
- No per-mod blame.
- Sparse data state is useful.
- No LLMs/external services.
