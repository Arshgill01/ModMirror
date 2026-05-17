# Digest Spec — ModMirror

## Goal

The digest turns ModMirror's governance state into a concise moderator-facing report.

It answers:

1. Which rules are healthy?
2. Which rules need review?
3. What changed since the last report?
4. Which overrides are unresolved?
5. What should the mod team do next?

## Digest Modes

### Manual Digest

Primary path.

Capabilities:

- Generate digest now.
- Preview digest.
- Copy Markdown.
- Save digest history.

### Mod Discussion Delivery

Optional, only after runtime verification.

Capabilities:

- Preview before sending.
- Explicit confirmation.
- Create private mod-team discussion/conversation if supported.
- Store delivery result.

### Scheduled Digest

Optional, opt-in only.

Capabilities:

- Weekly cadence initially.
- Same deterministic digest engine.
- Safe delivery path only.
- Never silently post.

## Digest Inputs

Use existing ModMirror state:

- active policies,
- policy versions,
- policy health,
- override review statuses,
- action history,
- case packet/action context where useful,
- last scan metadata,
- demo/live mode,
- runtime capability state.

## Digest Data Contract Draft

```ts
export type DigestSource = 'manual' | 'scheduled' | 'demo';
export type DigestOverallStatus = 'stable' | 'watch' | 'at_risk' | 'needs_review';

export interface DigestReport {
  id: string;
  subreddit: string;
  generatedAt: string;
  generatedBy: string;
  source: DigestSource;
  periodStart: string;
  periodEnd: string;
  overallStatus: DigestOverallStatus;
  summary: DigestSummary;
  ruleHealth: DigestRuleHealthItem[];
  overrideSummary: DigestOverrideSummary;
  recommendations: DigestRecommendation[];
  markdown: string;
  delivery?: DigestDeliveryStatus;
}

export interface DigestSummary {
  activePolicies: number;
  policyTrackedActions: number;
  unresolvedOverrides: number;
  rulesNeedingReview: number;
  lastScanAt?: string;
}

export interface DigestRuleHealthItem {
  ruleId: string;
  ruleName: string;
  status: DigestOverallStatus;
  adherenceRate?: number;
  overrideCount: number;
  topOverrideReason?: string;
  recommendation: string;
}

export interface DigestOverrideSummary {
  total: number;
  unresolved: number;
  acceptedExceptions: number;
  policyNeedsUpdate: number;
  needsDiscussion: number;
}

export interface DigestRecommendation {
  id: string;
  severity: 'info' | 'watch' | 'urgent';
  title: string;
  detail: string;
  actionLabel?: string;
  targetRuleId?: string;
}

export interface DigestDeliveryStatus {
  mode: 'none' | 'markdown_copied' | 'mod_discussion' | 'scheduled';
  status: 'not_configured' | 'pending' | 'sent' | 'failed' | 'unavailable';
  message?: string;
  deliveredAt?: string;
}
```

## Example Markdown

```md
# ModMirror Digest — r/example

Period: May 10–17, 2026

## Summary

- Overall consistency: Watch
- 3 active policies
- 28 policy-tracked actions
- 7 unresolved overrides
- 1 rule needs review

## Rules Needing Attention

### Rule 2 — Low-effort Questions
Status: At Risk
Adherence: 63%
Overrides: 9
Top reason: Policy seems wrong

Recommended next step:
Review the second-offense escalation step.

## Stable Rules

- Rule 3 — Self-promotion: 95% adherence

## Open Overrides

- 4 accepted exceptions pending policy review
- 3 unresolved overrides

## Suggested Actions

1. Review Rule 2 policy.
2. Resolve 7 override events.
3. Generate case packets for contested actions.
```

## Deterministic Recommendation Rules

Examples:

- high override rate → review policy.
- many `policy_seems_wrong` overrides → policy update recommended.
- low sample size → collect more data.
- high adherence → stable.
- unresolved overrides → review inbox.
- stale scan → run Mirror Scan.

No AI. No vague semantic summaries.
