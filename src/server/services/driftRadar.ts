import {
  CONFIDENCE_VALUES,
  ENFORCEMENT_ACTION_VALUES,
} from '../../shared/constants';
import type {
  AttributedModAction,
  Confidence,
  DriftRadarResponse,
  DriftRadarRuleDetail,
  EnforcementAction,
  MirrorScanRecord,
} from '../../shared/schema';
import { confidenceTrustLabel, sourceTrustLabel } from './v2Trust';

export function buildDriftRadar(record: MirrorScanRecord): DriftRadarResponse {
  const details = groupActionsByRule(record).map(([ruleKey, actions]) =>
    buildRuleDetail(ruleKey, actions)
  );

  return {
    subreddit: record.subreddit,
    scanId: record.id,
    generatedAt: new Date().toISOString(),
    dataMode: record.source,
    details: details.sort((left, right) => {
      const spreadDelta =
        Object.keys(right.actionDistribution).length -
        Object.keys(left.actionDistribution).length;
      if (spreadDelta !== 0) {
        return spreadDelta;
      }
      return right.totalActions - left.totalActions;
    }),
    trustLabels: [
      sourceTrustLabel(record.source),
      confidenceTrustLabel(resolveLowestConfidence(record.attributedActions)),
    ],
  };
}

function buildRuleDetail(
  ruleKey: string | undefined,
  actions: AttributedModAction[]
): DriftRadarRuleDetail {
  const ruleName =
    actions.find((action) => action.inferredRuleName !== undefined)
      ?.inferredRuleName ?? 'Unmatched actions';
  const actionDistribution = countActions(actions);
  const confidenceDistribution = countConfidence(actions);
  const unmatchedCount = actions.filter(
    (action) => action.confidence === 'unmatched'
  ).length;

  const detail: DriftRadarRuleDetail = {
    ruleName,
    totalActions: actions.length,
    actionDistribution,
    confidenceDistribution,
    unmatchedCount,
    whyFlagged: buildWhyFlagged(actionDistribution, confidenceDistribution),
    policyQuestions: buildPolicyQuestions(ruleName, actionDistribution),
    representativeCases: actions.slice(0, 5).map((action) => {
      const item = {
        actionId: action.id,
        createdAt: action.createdAt,
        confidence: action.confidence,
        evidence: action.evidence.slice(0, 3),
      };
      if (action.normalizedAction !== undefined) {
        Object.assign(item, { normalizedAction: action.normalizedAction });
      }
      if (action.targetThingId !== undefined) {
        Object.assign(item, { targetThingId: action.targetThingId });
      }
      return item;
    }),
    caveats: [
      'Representative cases omit target authors and moderator names.',
      'Rule labels are inferred unless confidence and source evidence say otherwise.',
    ],
  };
  if (ruleKey !== undefined) {
    detail.ruleKey = ruleKey;
  }
  return detail;
}

function groupActionsByRule(
  record: MirrorScanRecord
): Array<[string | undefined, AttributedModAction[]]> {
  const groups = new Map<string, AttributedModAction[]>();
  for (const action of [...record.attributedActions, ...record.unmatchedActions]) {
    const key = action.inferredRuleKey ?? '__unmatched__';
    const bucket = groups.get(key) ?? [];
    bucket.push(action);
    groups.set(key, bucket);
  }
  return [...groups.entries()].map(([key, actions]) => [
    key === '__unmatched__' ? undefined : key,
    actions,
  ]);
}

function countActions(
  actions: AttributedModAction[]
): Partial<Record<EnforcementAction, number>> {
  const counts: Partial<Record<EnforcementAction, number>> = {};
  for (const action of actions) {
    const normalized = action.normalizedAction ?? 'manual_review';
    counts[normalized] = (counts[normalized] ?? 0) + 1;
  }
  return Object.fromEntries(
    ENFORCEMENT_ACTION_VALUES.filter((action) => counts[action] !== undefined).map(
      (action) => [action, counts[action]]
    )
  ) as Partial<Record<EnforcementAction, number>>;
}

function countConfidence(actions: AttributedModAction[]): Record<Confidence, number> {
  const counts = {
    high: 0,
    medium: 0,
    low: 0,
    unmatched: 0,
  } satisfies Record<Confidence, number>;
  for (const action of actions) {
    counts[action.confidence] += 1;
  }
  return counts;
}

function buildWhyFlagged(
  actionDistribution: Partial<Record<EnforcementAction, number>>,
  confidenceDistribution: Record<Confidence, number>
): string[] {
  const distinctActions = Object.keys(actionDistribution).length;
  const reasons = [
    `${distinctActions} distinct action type(s) appear in this rule bucket.`,
  ];
  if (confidenceDistribution.low + confidenceDistribution.unmatched > 0) {
    reasons.push('Some evidence is low-confidence or unmatched and needs human review.');
  }
  const tempBans = actionDistribution.temporary_ban_suggested ?? 0;
  const warnings = actionDistribution.warn ?? 0;
  if (tempBans > 0 && warnings > 0) {
    reasons.push('Warnings and temporary-ban suggestions both appear for similar history.');
  }
  return reasons;
}

function buildPolicyQuestions(
  ruleName: string,
  actionDistribution: Partial<Record<EnforcementAction, number>>
): string[] {
  const actions = Object.keys(actionDistribution);
  if (actions.length === 0) {
    return [`What should moderators do when ${ruleName} cannot be confidently attributed?`];
  }
  return [
    `Which first-offense action should be the team default for ${ruleName}?`,
    `When is escalation beyond ${formatAction(actions[0] ?? 'manual_review')} justified?`,
    'Which exceptions require an override reason?',
  ];
}

function resolveLowestConfidence(actions: AttributedModAction[]): Confidence {
  for (const confidence of [...CONFIDENCE_VALUES].reverse()) {
    if (actions.some((action) => action.confidence === confidence)) {
      return confidence;
    }
  }
  return 'unmatched';
}

function formatAction(value: string): string {
  return value.replace(/_/g, ' ');
}
