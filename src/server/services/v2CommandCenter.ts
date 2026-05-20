import type {
  CommandCenterRuleHealthRow,
  CommandCenterV2Response,
  CommunityHealthSummary,
  Confidence,
  DriftCandidate,
  MirrorScan,
  PolicyHealthOverview,
  PolicyHealthStatus,
  RulePolicy,
} from '../../shared/schema';
import { buildCommandCenterSummary } from '../../shared/productization';
import { confidenceTrustLabel, privacyTrustLabel, sourceTrustLabel } from './v2Trust';

export function buildCommandCenterV2(input: {
  subreddit: string;
  generatedAt: string;
  scan?: MirrorScan;
  policies: RulePolicy[];
  policyHealth?: PolicyHealthOverview;
  communityHealth?: CommunityHealthSummary;
}): CommandCenterV2Response {
  const summaryInput: Parameters<typeof buildCommandCenterSummary>[0] = {
    policies: input.policies,
  };
  if (input.scan !== undefined) {
    summaryInput.scan = input.scan;
  }
  if (input.policyHealth !== undefined) {
    summaryInput.health = input.policyHealth;
  }
  const summary = buildCommandCenterSummary(summaryInput);
  const ruleHealth = buildRuleRows(input);
  const dataMode = resolveDataMode(input.scan);
  const weakestConfidence = resolveWeakestConfidence(input.scan);

  return {
    subreddit: input.subreddit,
    generatedAt: input.generatedAt,
    consistencyScore: summary.consistencyScore,
    topIssue: summary.topIssue,
    dataMode,
    nextBestAction: selectNextBestAction({
      policies: input.policies,
      ...(input.scan !== undefined ? { scan: input.scan } : {}),
      ...(input.policyHealth !== undefined ? { policyHealth: input.policyHealth } : {}),
      ...(input.communityHealth !== undefined
        ? { communityHealth: input.communityHealth }
        : {}),
    }),
    ruleHealth,
    trustLabels: [
      sourceTrustLabel(dataMode),
      confidenceTrustLabel(weakestConfidence),
      privacyTrustLabel(),
    ],
    caveats: buildCaveats(input.scan, input.policyHealth),
  };
}

function buildRuleRows(input: {
  scan?: MirrorScan;
  policies: RulePolicy[];
  policyHealth?: PolicyHealthOverview;
  communityHealth?: CommunityHealthSummary;
}): CommandCenterRuleHealthRow[] {
  const healthRows =
    input.policyHealth?.summaries.map((summary) => ({
      ruleKey: summary.ruleKey,
      ruleName: summary.ruleName,
      status: summary.status,
      consistencyRate: summary.adherenceRate,
      totalActions: summary.totalActions,
      unresolvedOverrideCount: summary.unresolvedOverrideCount,
      confidence: inferRuleConfidence(input.scan, summary.ruleKey),
      nextAction: summary.recommendations[0] ?? nextActionForStatus(summary.status),
      caveats: summary.sampleWarning ? [summary.sampleWarning] : [],
    })) ?? [];

  const healthRuleKeys = new Set(healthRows.map((row) => row.ruleKey));
  const driftRows =
    input.scan?.driftCandidates
      .filter(
        (candidate) =>
          candidate.ruleKey === undefined || !healthRuleKeys.has(candidate.ruleKey)
      )
      .map((candidate) => driftCandidateToRow(candidate)) ?? [];

  const policyRows = input.policies
    .filter((policy) => !healthRuleKeys.has(policy.ruleKey))
    .filter((policy) => !driftRows.some((row) => row.ruleKey === policy.ruleKey))
    .map((policy) => ({
      ruleKey: policy.ruleKey,
      ruleName: policy.ruleName,
      status: policy.active ? 'insufficient_data' : 'needs_review',
      consistencyRate: 0,
      totalActions: 0,
      unresolvedOverrideCount: 0,
      confidence: 'unmatched',
      nextAction: policy.active
        ? 'Collect Apply Policy receipts for this rule.'
        : 'Review and adopt this policy before using it in Apply Policy.',
      caveats: ['No receipt-backed policy health sample is available yet.'],
    }) satisfies CommandCenterRuleHealthRow);

  return [...healthRows, ...driftRows, ...policyRows].slice(0, 6);
}

function driftCandidateToRow(candidate: DriftCandidate): CommandCenterRuleHealthRow {
  const row: CommandCenterRuleHealthRow = {
    ruleName: candidate.ruleName,
    status: 'needs_review',
    consistencyRate: 0,
    totalActions: candidate.totalActions,
    unresolvedOverrideCount: 0,
    confidence: candidate.confidence,
    nextAction: candidate.recommendation,
    caveats: ['Drift is inferred from historical action patterns, not guaranteed rule metadata.'],
  };
  if (candidate.ruleKey !== undefined) {
    row.ruleKey = candidate.ruleKey;
  }
  return row;
}

function selectNextBestAction(input: {
  scan?: MirrorScan;
  policies: RulePolicy[];
  policyHealth?: PolicyHealthOverview;
  communityHealth?: CommunityHealthSummary;
}): CommandCenterV2Response['nextBestAction'] {
  if (input.scan === undefined) {
    return {
      label: 'Run Mirror Scan',
      target: 'scan',
      reason: 'No scan signal exists yet.',
    };
  }
  if (!input.policies.some((policy) => policy.active)) {
    return {
      label: 'Create policy from drift',
      target: 'agree',
      reason: 'Drift is visible but no active policy ladder is available.',
    };
  }
  if ((input.policyHealth?.unresolvedOverrides ?? 0) > 0) {
    return {
      label: 'Review unresolved exceptions',
      target: 'review',
      reason: 'Override review closes the consistency loop.',
    };
  }
  if (input.communityHealth?.status === 'watch') {
    return {
      label: 'Run calibration',
      target: 'calibration',
      reason: 'Aggregate health is watch-level and can benefit from practice scenarios.',
    };
  }
  return {
    label: 'Apply policy to the next case',
    target: 'act',
    reason: 'Policy and scan signals are ready for moderator-confirmed action.',
  };
}

function resolveDataMode(scan: MirrorScan | undefined): CommandCenterV2Response['dataMode'] {
  if (scan?.source === 'demo') {
    return 'demo';
  }
  if (scan?.source === 'live') {
    return 'live';
  }
  return 'unknown';
}

function inferRuleConfidence(scan: MirrorScan | undefined, ruleKey: string): Confidence {
  return (
    scan?.driftCandidates.find((candidate) => candidate.ruleKey === ruleKey)?.confidence ??
    'unmatched'
  );
}

function resolveWeakestConfidence(scan: MirrorScan | undefined): Confidence {
  if (scan === undefined || scan.unmatchedCount > 0) {
    return 'unmatched';
  }
  if (scan.confidenceBreakdown.low > 0) {
    return 'low';
  }
  if (scan.confidenceBreakdown.medium > 0) {
    return 'medium';
  }
  return 'high';
}

function nextActionForStatus(status: PolicyHealthStatus): string {
  if (status === 'stable') {
    return 'Continue monitoring receipts and drift trends.';
  }
  if (status === 'insufficient_data') {
    return 'Collect more Apply Policy receipts before making a claim.';
  }
  return 'Open Review Room and inspect the linked evidence.';
}

function buildCaveats(
  scan: MirrorScan | undefined,
  health: PolicyHealthOverview | undefined
): string[] {
  const caveats = [
    'Historical rule attribution remains confidence-scored and deterministic.',
  ];
  if (scan === undefined) {
    caveats.push('No scan has been loaded for this Command Center response.');
  }
  if (health === undefined || health.summaries.length === 0) {
    caveats.push('Policy health needs receipt-backed actions before it can show adherence.');
  }
  return caveats;
}
