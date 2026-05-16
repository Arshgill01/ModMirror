# AGENT_A_POLICY_VERSIONING.md — Policy Version History

## Mission

Implement immutable policy versioning.

Wave 5 cannot be trustworthy unless actions and overrides can be interpreted against the policy version active when they happened.

## Read First

- AGENTS.md
- PLAN.md
- RESEARCH.md
- docs/DATA_MODEL.md
- docs/DECISIONS.md
- docs/PRODUCT.md
- prompts/wave5/WAVE5_ORCHESTRATOR.md

## Tasks

### 1. Inspect current policy data model

Find the existing policy types, Redis keys, server endpoints, and UI assumptions from Waves 3/4.

Do not rewrite blindly. Extend current structure.

### 2. Add versioned policy types

Add/extend types roughly like:

```ts
export interface PolicyRecord {
  id: string;
  subreddit: string;
  ruleId: string;
  ruleName: string;
  activeVersionId: string;
  activeVersionNumber: number;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  archived?: boolean;
}

export interface PolicyVersion {
  id: string;
  policyId: string;
  versionNumber: number;
  subreddit: string;
  ruleId: string;
  ruleName: string;
  steps: PolicyStep[];
  defaultMessageMode: 'public_comment' | 'private_message' | 'log_only';
  createdAt: string;
  createdBy: string;
  changeReason?: string;
  changeSummary?: string;
}

export interface PolicySnapshot {
  policyId: string;
  policyVersionId: string;
  policyVersionNumber: number;
  ruleId: string;
  ruleName: string;
  steps: PolicyStep[];
  defaultMessageMode: 'public_comment' | 'private_message' | 'log_only';
  capturedAt: string;
}
```

Adapt names to existing project conventions.

### 3. Redis persistence

Add helpers for:

- create policy with version 1
- get active policy
- get active policy version
- list policy versions
- create new policy version
- capture policy snapshot for action logs
- handle legacy policies if current data exists without versions

Suggested keys can be adjusted to existing conventions:

```txt
modmirror:{subreddit}:policies
modmirror:{subreddit}:policy:{policyId}
modmirror:{subreddit}:policy:{policyId}:versions
modmirror:{subreddit}:policy:{policyId}:version:{versionId}
modmirror:{subreddit}:policy:{policyId}:changes
```

### 4. Edit behavior

When a policy is edited:

- do not mutate the old version,
- create a new version with versionNumber + 1,
- update policy.activeVersionId and activeVersionNumber,
- save change event.

### 5. Action stamping

Wherever Apply Policy logs an action, include:

- policyId
- policyVersionId
- policyVersionNumber
- policySnapshot

If no policy/version is found:

- log as `policyVersionStatus: 'missing'` or equivalent,
- do not crash.

### 6. Migration/fallback

If existing Wave 3/4 policies are stored without versions:

- create a safe adapter that treats them as version 1,
- or add a one-time lazy migration when read.

Do not delete existing data.

### 7. Tests

Add/extend tests for:

- create initial policy version,
- edit creates new version,
- old version remains unchanged,
- active version updates,
- action snapshot captures active version,
- legacy policy fallback if relevant.

## Acceptance Criteria

- Policy edit creates immutable version history.
- Apply Policy logs are stamped with active version snapshot.
- Tests pass.
- Existing Wave 3/4 behavior still works.
- No dashboard work required beyond returning version data to existing endpoints if needed.

## Completion Report

Include:

- files changed,
- Redis keys added,
- migration behavior,
- tests added,
- known issues.
