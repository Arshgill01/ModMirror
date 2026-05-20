import { createHash } from 'node:crypto';
import type {
  AttributedModAction,
  EnforcementAction,
  PolicyReplayActionInput,
  PolicySimulationDelta,
  PolicySimulationResult,
  RulePolicy,
} from '../../shared/schema';
import { recommendPolicyAction } from '../../shared/scoring';

const ACTION_SEVERITY: Record<EnforcementAction, number> = {
  approve: 0,
  ignore_reports: 0,
  log_only: 0,
  note: 1,
  warn: 2,
  remove: 3,
  manual_review: 4,
  temporary_ban_suggested: 5,
  permanent_ban_suggested: 6,
};

export function simulatePolicyDraft(input: {
  subreddit: string;
  activePolicy?: RulePolicy;
  draftPolicy: RulePolicy;
  actions: PolicyReplayActionInput[];
  generatedAt?: string;
}): PolicySimulationResult {
  const generatedAt = input.generatedAt ?? new Date().toISOString();
  const relevantActions = input.actions.filter(
    (action) => action.inferredRuleKey === input.draftPolicy.ruleKey
  );
  const activeHistory: AttributedModAction[] = [];
  const draftHistory: AttributedModAction[] = [];
  const items = relevantActions.map((action) => {
    const historicalAction = action.normalizedAction ?? 'manual_review';
    let activeRecommendation: EnforcementAction | undefined;
    if (input.activePolicy !== undefined) {
      const activeInput: Parameters<typeof recommendPolicyAction>[0] = {
            policy: input.activePolicy,
            ruleKey: input.activePolicy.ruleKey,
            ruleName: input.activePolicy.ruleName,
            actionHistory: activeHistory,
            selectedAction: historicalAction,
            now: new Date(action.createdAt),
      };
      if (action.targetAuthor !== undefined) {
        activeInput.targetAuthor = action.targetAuthor;
      }
      activeRecommendation = recommendPolicyAction(activeInput).recommendedAction;
    }
    const draftInput: Parameters<typeof recommendPolicyAction>[0] = {
      policy: input.draftPolicy,
      ruleKey: input.draftPolicy.ruleKey,
      ruleName: input.draftPolicy.ruleName,
      actionHistory: draftHistory,
      selectedAction: historicalAction,
      now: new Date(action.createdAt),
    };
    if (action.targetAuthor !== undefined) {
      draftInput.targetAuthor = action.targetAuthor;
    }
    const draftRecommendation = recommendPolicyAction(draftInput).recommendedAction;
    activeHistory.push(toHistoryAction(action, historicalAction));
    draftHistory.push(toHistoryAction(action, historicalAction));

    const item = {
      actionId: action.id,
      createdAt: action.createdAt,
      confidence: action.confidence,
      historicalAction,
      draftRecommendation,
      delta: classifyDelta({
        confidence: action.confidence,
        draftRecommendation,
        ...(activeRecommendation !== undefined ? { activeRecommendation } : {}),
      }),
      evidence: [
        `Historical action was ${historicalAction}.`,
        `Draft policy recommends ${draftRecommendation}.`,
        ...action.evidence.slice(0, 2),
      ],
    };
    if (activeRecommendation !== undefined) {
      Object.assign(item, { activeRecommendation });
    }
    if (action.targetThingId !== undefined) {
      Object.assign(item, { targetThingId: action.targetThingId });
    }
    return item;
  });

  return {
    id: deterministicSimulationId(input.draftPolicy.id, generatedAt, relevantActions),
    subreddit: input.subreddit,
    policyId: input.draftPolicy.id,
    ruleKey: input.draftPolicy.ruleKey,
    ruleName: input.draftPolicy.ruleName,
    generatedAt,
    totalCases: items.length,
    summary: {
      same: items.filter((item) => item.delta === 'same').length,
      stricter: items.filter((item) => item.delta === 'stricter').length,
      looser: items.filter((item) => item.delta === 'looser').length,
      manual_review: items.filter((item) => item.delta === 'manual_review').length,
      insufficient_data: items.filter((item) => item.delta === 'insufficient_data').length,
    },
    items,
    warnings: buildWarnings(input.actions.length, relevantActions.length, items),
  };
}

function classifyDelta(input: {
  confidence: string;
  activeRecommendation?: EnforcementAction;
  draftRecommendation: EnforcementAction;
}): PolicySimulationDelta {
  if (input.confidence === 'low' || input.confidence === 'unmatched') {
    return 'insufficient_data';
  }
  if (input.draftRecommendation === 'manual_review') {
    return 'manual_review';
  }
  if (input.activeRecommendation === undefined) {
    return 'same';
  }
  const activeSeverity = ACTION_SEVERITY[input.activeRecommendation];
  const draftSeverity = ACTION_SEVERITY[input.draftRecommendation];
  if (draftSeverity > activeSeverity) {
    return 'stricter';
  }
  if (draftSeverity < activeSeverity) {
    return 'looser';
  }
  return 'same';
}

function buildWarnings(
  totalActions: number,
  relevantActions: number,
  items: Array<{ confidence: string }>
): string[] {
  const warnings = [
    'Policy simulation is read-only and never creates moderation receipts or Reddit actions.',
  ];
  if (relevantActions === 0) {
    warnings.push('No historical or demo cases matched this policy rule.');
  }
  if (totalActions > relevantActions) {
    warnings.push(`${totalActions - relevantActions} case(s) did not match this rule.`);
  }
  if (items.some((item) => item.confidence === 'low' || item.confidence === 'unmatched')) {
    warnings.push('Low-confidence or unmatched cases are labeled insufficient data.');
  }
  return warnings;
}

function toHistoryAction(
  action: PolicyReplayActionInput,
  normalizedAction: EnforcementAction
): AttributedModAction {
  const historyAction: AttributedModAction = {
    id: action.id,
    subreddit: action.subreddit,
    source: 'modmirror',
    rawActionType: action.rawActionType,
    createdAt: action.createdAt,
    confidence: action.confidence,
    evidence: [...action.evidence],
    normalizedAction,
  };
  if (action.targetThingId !== undefined) {
    historyAction.targetThingId = action.targetThingId;
  }
  if (action.targetAuthor !== undefined) {
    historyAction.targetAuthor = action.targetAuthor;
  }
  if (action.inferredRuleKey !== undefined) {
    historyAction.inferredRuleKey = action.inferredRuleKey;
  }
  if (action.inferredRuleName !== undefined) {
    historyAction.inferredRuleName = action.inferredRuleName;
  }
  return historyAction;
}

function deterministicSimulationId(
  policyId: string,
  generatedAt: string,
  actions: PolicyReplayActionInput[]
): string {
  return `policy-simulation-${createHash('sha256')
    .update(`${policyId}:${generatedAt}:${actions.map((action) => action.id).join('|')}`)
    .digest('hex')
    .slice(0, 16)}`;
}
