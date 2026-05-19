import { createHash, randomUUID } from 'node:crypto';
import type {
  AttributedModAction,
  EnforcementAction,
  PolicyReplayActionInput,
  PolicyReplayInput,
  PolicyReplayItem,
  PolicyReplayResult,
} from '../../shared/schema';
import { recommendPolicyAction } from '../../shared/scoring';

export function runPolicyReplay(input: PolicyReplayInput): PolicyReplayResult {
  const generatedAt = input.generatedAt ?? new Date().toISOString();
  const sortedActions = [...input.actions].sort(
    (left, right) => Date.parse(left.createdAt) - Date.parse(right.createdAt)
  );
  const relevantActions = sortedActions.filter(
    (action) => action.inferredRuleKey === input.policy.ruleKey
  );
  const skippedActionCount = sortedActions.length - relevantActions.length;
  const replayHistory: AttributedModAction[] = [];
  const items: PolicyReplayItem[] = [];

  for (const action of relevantActions) {
    const historicalAction = action.normalizedAction ?? 'manual_review';
    const recommendationInput = {
      policy: input.policy,
      ruleKey: input.policy.ruleKey,
      ruleName: input.policy.ruleName,
      actionHistory: replayHistory,
      selectedAction: historicalAction,
      now: toDate(action.createdAt),
    };
    if (action.targetAuthor !== undefined) {
      Object.assign(recommendationInput, { targetAuthor: action.targetAuthor });
    }
    const recommendation = recommendPolicyAction(recommendationInput);
    const item: PolicyReplayItem = {
      actionId: action.id,
      createdAt: action.createdAt,
      confidence: action.confidence,
      historicalAction,
      recommendedAction: recommendation.recommendedAction,
      offenseCount: recommendation.offenseCount,
      wouldChangeOutcome:
        recommendation.recommendedAction !== historicalAction,
      evidence: buildReplayEvidence(action, recommendation.recommendedAction),
    };
    if (action.targetThingId !== undefined) {
      item.targetThingId = action.targetThingId;
    }
    if (action.targetAuthor !== undefined) {
      item.targetAuthor = action.targetAuthor;
    }

    items.push(item);
    replayHistory.push(toAttributedAction(action, historicalAction));
  }

  const result: PolicyReplayResult = {
    id: `policy-replay-${hashReplayId(input.policy.id, generatedAt)}`,
    subreddit: input.subreddit,
    policyId: input.policy.id,
    ruleKey: input.policy.ruleKey,
    ruleName: input.policy.ruleName,
    source: input.source,
    generatedAt,
    totalActionsEvaluated: relevantActions.length,
    matchedPolicyCount: items.filter((item) => !item.wouldChangeOutcome).length,
    changedRecommendationCount: items.filter((item) => item.wouldChangeOutcome)
      .length,
    skippedActionCount,
    items,
    warnings: buildReplayWarnings(input.source, skippedActionCount),
  };
  copyReplayVersionFields(result, input);
  return result;
}

export function toPolicyReplayActions(
  actions: AttributedModAction[]
): PolicyReplayActionInput[] {
  return actions.map((action) => {
    const input: PolicyReplayActionInput = {
      id: action.id,
      subreddit: action.subreddit,
      rawActionType: action.rawActionType,
      createdAt: action.createdAt,
      confidence: action.confidence,
      evidence: [...action.evidence],
    };
    copyOptionalActionFields(input, action);
    return input;
  });
}

function toAttributedAction(
  action: PolicyReplayActionInput,
  normalizedAction: EnforcementAction
): AttributedModAction {
  const attributedAction: AttributedModAction = {
    id: action.id,
    subreddit: action.subreddit,
    source: 'modmirror',
    rawActionType: action.rawActionType,
    normalizedAction,
    createdAt: action.createdAt,
    confidence: action.confidence,
    evidence: [...action.evidence],
  };
  copyOptionalActionFields(attributedAction, action);
  return attributedAction;
}

function copyOptionalActionFields(
  target: PolicyReplayActionInput | AttributedModAction,
  source: PolicyReplayActionInput | AttributedModAction
): void {
  if (source.normalizedAction !== undefined) {
    target.normalizedAction = source.normalizedAction;
  }
  if (source.targetThingId !== undefined) {
    target.targetThingId = source.targetThingId;
  }
  if (source.targetAuthor !== undefined) {
    target.targetAuthor = source.targetAuthor;
  }
  if (source.inferredRuleKey !== undefined) {
    target.inferredRuleKey = source.inferredRuleKey;
  }
  if (source.inferredRuleName !== undefined) {
    target.inferredRuleName = source.inferredRuleName;
  }
}

function buildReplayEvidence(
  action: PolicyReplayActionInput,
  recommendedAction: EnforcementAction
): string[] {
  return [
    `Historical action was ${action.normalizedAction ?? 'manual_review'}.`,
    `Policy replay recommends ${recommendedAction}.`,
    ...action.evidence.slice(0, 2),
  ];
}

function buildReplayWarnings(
  source: PolicyReplayInput['source'],
  skippedActionCount: number
): string[] {
  const warnings = [
    'Replay is read-only and does not create receipts, action events, or Reddit moderation calls.',
  ];
  if (source === 'synthetic') {
    warnings.push('Replay used supplied synthetic actions, not live Reddit history.');
  }
  if (skippedActionCount > 0) {
    warnings.push(
      `${skippedActionCount} action(s) did not match the policy rule and were skipped.`
    );
  }
  return warnings;
}

function copyReplayVersionFields(
  result: PolicyReplayResult,
  input: PolicyReplayInput
): void {
  const policyVersionId =
    input.policy.activeVersionId ?? input.policy.proposedVersionId;
  const policyVersionNumber =
    input.policy.activeVersionNumber ?? input.policy.proposedVersionNumber;
  if (policyVersionId !== undefined) {
    result.policyVersionId = policyVersionId;
  }
  if (policyVersionNumber !== undefined) {
    result.policyVersionNumber = policyVersionNumber;
  }
  if (input.scanId !== undefined) {
    result.scanId = input.scanId;
  }
}

function hashReplayId(policyId: string, generatedAt: string): string {
  return createHash('sha256')
    .update(`${policyId}:${generatedAt}:${randomUUID()}`)
    .digest('hex')
    .slice(0, 16);
}

function toDate(value: string): Date {
  const timestamp = Date.parse(value);
  return new Date(Number.isNaN(timestamp) ? Date.now() : timestamp);
}
