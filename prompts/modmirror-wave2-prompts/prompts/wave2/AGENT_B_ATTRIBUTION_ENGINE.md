# Agent B — Wave 2 Deterministic Attribution Engine

## Role

Implement deterministic rule/removal-reason attribution for Mirror Scan.

This should be pure, testable logic that does not depend on Devvit APIs.

## Read First

- `AGENTS.md`
- `PLAN.md`
- `docs/DATA_MODEL.md`
- `docs/DECISIONS.md`
- `prompts/wave2/WAVE2_ORCHESTRATOR.md`
- `.codex/skills/modmirror-product-guardrails/SKILL.md`

## Goal

Given:

- normalized mod actions,
- subreddit rules,
- removal reasons,

return attributed actions with:

- inferred rule candidate if any,
- confidence: `high`, `medium`, `low`, `unmatched`,
- evidence strings explaining the match,
- score/debug details if useful.

## Suggested Files

```txt
src/server/services/attribution.ts
src/shared/scoring.ts
src/shared/text.ts
src/shared/schema.ts
```

Tests if test framework exists:

```txt
src/server/services/attribution.test.ts
src/shared/scoring.test.ts
```

If no test framework exists yet, add a small pure verification script or document exactly how to test.

## Required Behavior

Implement deterministic matching signals:

1. Exact rule-number match:
   - action text contains `Rule 2`, `rule 2`, `R2`, etc.
2. Exact title match:
   - removal reason title equals rule title/name after normalization.
3. Strong keyword overlap:
   - removal reason title/message overlaps rule name/body.
4. Action details overlap:
   - mod action note/details overlap rule/removal reason terms.
5. Direct ModMirror metadata:
   - if a future ModMirror-created action includes rule ID, confidence should be high/certain.

## Confidence Guidance

Use a clear scoring threshold system.

Example:

```ts
score >= 0.8 => high
score >= 0.55 => medium
score >= 0.3 => low
otherwise => unmatched
```

Adjust as needed, but document thresholds.

## Text Normalization

Implement a small helper that:

- lowercases,
- strips punctuation,
- collapses whitespace,
- normalizes hyphens,
- removes very common stopwords where useful,
- keeps rule numbers meaningful.

Avoid heavy dependencies unless already present.

## Output Shape

Align with existing schema. If no shape exists, create:

```ts
export interface AttributionResult {
  actionId: string;
  inferredRuleId?: string;
  inferredRuleName?: string;
  confidence: 'high' | 'medium' | 'low' | 'unmatched';
  score: number;
  evidence: string[];
}
```

## Tests / Examples

Include cases for:

- exact `Rule 2` in action details,
- removal reason title matching rule name,
- fuzzy low-effort / low effort / low-effort match,
- no useful text => unmatched,
- ambiguous weak overlap => low or unmatched,
- ModMirror direct metadata => high.

## Do Not

- Do not use LLMs.
- Do not call external APIs.
- Do not present low-confidence matches as certainty.
- Do not make attribution depend on UI.

## Acceptance Criteria

- Attribution is deterministic.
- Confidence labels are produced for every action.
- Evidence strings explain why a match happened.
- Tests or verification script demonstrate behavior.
- The engine can be imported by Mirror Scan service.

## Commit Guidance

```bash
git add src/server/services/attribution.ts src/shared/scoring.ts src/shared/schema.ts
git commit -m "feat: add deterministic rule attribution engine"
```
