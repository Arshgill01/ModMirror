import { redis } from '@devvit/web/server';
import { randomUUID } from 'node:crypto';
import {
  DEFAULT_DIGEST_PERIOD_DAYS,
  DIGEST_HISTORY_LIMIT,
} from '../../shared/constants';
import type {
  ActionEvent,
  DigestCapabilities,
  DigestDeliveryMode,
  DigestOverallStatus,
  DigestReport,
  DigestRuleHealthItem,
  DigestSettings,
  GenerateDigestRequest,
  GenerateDigestResponse,
  OverrideEvent,
  OverrideReason,
  PolicyHealthOverview,
  PolicyHealthStatus,
  PolicyHealthSummary,
  RulePolicy,
} from '../../shared/schema';
import {
  listRecentActionEvents,
  listRecentAuditEvents,
} from './audit';
import { listPolicies } from './policies';
import { getPolicyHealthOverview } from './policyHealth';
import { redisKeys, readJson, serializeJson, writeJson, parseJson } from './redis';
import { getLastScanMetadata } from './scans';

type GenerateDigestOptions = {
  subreddit: string;
  generatedBy?: string;
  request?: GenerateDigestRequest;
};

type DigestInput = {
  policies: RulePolicy[];
  health: PolicyHealthOverview;
  actions: ActionEvent[];
  overrides: OverrideEvent[];
  lastScanAt?: string;
};

const STATUS_PRIORITY: Record<DigestOverallStatus, number> = {
  needs_review: 4,
  at_risk: 3,
  watch: 2,
  stable: 1,
};

export async function generateDigestReport(
  options: GenerateDigestOptions
): Promise<GenerateDigestResponse> {
  const [policies, health, actions, overrides, scanMetadata, settings] =
    await Promise.all([
      listPolicies(options.subreddit),
      getPolicyHealthOverview(options.subreddit),
      listRecentActionEvents(options.subreddit, 250),
      listRecentAuditEvents(options.subreddit, 250),
      getLastScanMetadata(options.subreddit),
      getDigestSettings(options.subreddit),
    ]);

  const generatedAt = new Date().toISOString();
  const periodDays = normalizePeriodDays(options.request?.periodDays);
  const periodEnd = generatedAt;
  const periodStart = new Date(
    Date.parse(generatedAt) - periodDays * 24 * 60 * 60 * 1000
  ).toISOString();
  const input: DigestInput = {
    policies,
    health,
    actions: filterSince(actions, periodStart),
    overrides: filterSince(overrides, periodStart),
  };
  if (scanMetadata?.createdAt !== undefined) {
    input.lastScanAt = scanMetadata.createdAt;
  }

  const reportBase: Omit<DigestReport, 'markdown'> = {
    id: `digest-${randomUUID()}`,
    subreddit: options.subreddit,
    generatedAt,
    generatedBy: options.generatedBy ?? 'unknown',
    source: options.request?.source ?? 'manual',
    periodStart,
    periodEnd,
    overallStatus: resolveOverallStatus(input.health),
    summary: {
      activePolicies: input.policies.filter((policy) => policy.active).length,
      policyTrackedActions: input.actions.length,
      unresolvedOverrides: input.overrides.filter(
        (event) => event.reviewStatus === 'unresolved'
      ).length,
      rulesNeedingReview: input.health.policiesNeedingReview,
      ...(input.lastScanAt ? { lastScanAt: input.lastScanAt } : {}),
    },
    ruleHealth: buildRuleHealth(input.health.summaries, input.overrides),
    overrideSummary: {
      total: input.overrides.length,
      unresolved: input.overrides.filter(
        (event) => event.reviewStatus === 'unresolved'
      ).length,
      acceptedExceptions: input.overrides.filter(
        (event) => event.reviewStatus === 'accepted_exception'
      ).length,
      policyNeedsUpdate: input.overrides.filter(
        (event) => event.reviewStatus === 'policy_needs_update'
      ).length,
      needsDiscussion: input.overrides.filter(
        (event) => event.reviewStatus === 'needs_team_discussion'
      ).length,
    },
    recommendations: buildRecommendations(input),
    caveats: [
      'Historical moderation-log attribution remains confidence-scored.',
      'Digest recommendations are deterministic and do not use AI.',
      'Delivery and scheduling require explicit moderator action.',
    ],
    delivery: {
      mode: settings.deliveryMode,
      status:
        settings.deliveryMode === 'none' ? 'not_configured' : 'unavailable',
      message:
        settings.deliveryMode === 'none'
          ? 'Manual copy is the active delivery path.'
          : 'Configured delivery is not runtime-verified in this build.',
    },
  };
  const report: DigestReport = {
    ...reportBase,
    markdown: renderDigestMarkdown(reportBase),
  };

  await saveDigestReport(report);
  const updatedSettings: DigestSettings = {
    ...settings,
    lastGeneratedAt: report.generatedAt,
    updatedAt: report.generatedAt,
  };
  await saveDigestSettings(updatedSettings);

  return {
    report,
    history: await listDigestHistory(options.subreddit),
    capabilities: getDigestCapabilities(),
    settings: updatedSettings,
  };
}

export async function listDigestHistory(
  subreddit: string,
  limit = DIGEST_HISTORY_LIMIT
): Promise<DigestReport[]> {
  if (limit <= 0) {
    return [];
  }

  const rows = await redis.zRange(
    redisKeys.digestHistory(subreddit),
    0,
    limit - 1,
    {
      by: 'rank',
      reverse: true,
    }
  );

  return rows
    .map((row: { member: string }) => parseJson<DigestReport>(row.member))
    .filter((report): report is DigestReport => report !== undefined);
}

export async function getDigestSettings(
  subreddit: string
): Promise<DigestSettings> {
  return (
    (await readJson<DigestSettings>(redisKeys.digestSettings(subreddit))) ?? {
      subreddit,
      updatedAt: new Date(0).toISOString(),
      deliveryMode: 'none',
      scheduleEnabled: false,
      scheduleCadence: 'weekly',
    }
  );
}

export async function updateDigestSettings(input: {
  subreddit: string;
  updatedBy?: string;
  deliveryMode?: DigestDeliveryMode;
  scheduleEnabled?: boolean;
}): Promise<DigestSettings> {
  const current = await getDigestSettings(input.subreddit);
  const updated: DigestSettings = {
    ...current,
    updatedAt: new Date().toISOString(),
  };
  if (input.updatedBy !== undefined) {
    updated.updatedBy = input.updatedBy;
  }
  if (input.deliveryMode !== undefined) {
    updated.deliveryMode = input.deliveryMode;
  }
  if (input.scheduleEnabled !== undefined) {
    updated.scheduleEnabled = input.scheduleEnabled;
  }

  await saveDigestSettings(updated);
  return updated;
}

export function getDigestCapabilities(): DigestCapabilities {
  return {
    modDiscussion: {
      state: 'unverified',
      label: 'Mod discussion delivery',
      detail:
        'Devvit exposes modmail/mod discussion typings, but ModMirror has not runtime-verified safe digest delivery.',
    },
    scheduler: {
      state: 'unverified',
      label: 'Weekly scheduler',
      detail:
        'Devvit scheduler typings are present, but scheduled digest execution is not registered or runtime-verified in this build.',
    },
  };
}

async function saveDigestReport(report: DigestReport): Promise<void> {
  const score = Date.parse(report.generatedAt);
  await Promise.all([
    writeJson(redisKeys.digest(report.subreddit, report.id), report),
    redis.zAdd(redisKeys.digestHistory(report.subreddit), {
      member: serializeJson(report),
      score: Number.isNaN(score) ? Date.now() : score,
    }),
  ]);
}

async function saveDigestSettings(settings: DigestSettings): Promise<void> {
  await writeJson(redisKeys.digestSettings(settings.subreddit), settings);
}

function normalizePeriodDays(periodDays: number | undefined): number {
  if (periodDays === undefined || !Number.isFinite(periodDays)) {
    return DEFAULT_DIGEST_PERIOD_DAYS;
  }
  return Math.max(1, Math.min(31, Math.round(periodDays)));
}

function filterSince<T extends { createdAt: string }>(
  rows: T[],
  periodStart: string
): T[] {
  const start = Date.parse(periodStart);
  return rows.filter((row) => {
    const createdAt = Date.parse(row.createdAt);
    return Number.isNaN(createdAt) || createdAt >= start;
  });
}

function resolveOverallStatus(
  health: PolicyHealthOverview
): DigestOverallStatus {
  const statuses = health.summaries.map((summary) =>
    normalizeHealthStatus(summary.status)
  );
  if (statuses.length === 0) {
    return 'watch';
  }
  return statuses.sort(
    (left, right) => STATUS_PRIORITY[right] - STATUS_PRIORITY[left]
  )[0] ?? 'watch';
}

function normalizeHealthStatus(status: PolicyHealthStatus): DigestOverallStatus {
  return status === 'insufficient_data' ? 'watch' : status;
}

function buildRuleHealth(
  summaries: PolicyHealthSummary[],
  overrides: OverrideEvent[]
): DigestRuleHealthItem[] {
  return summaries.map((summary) => {
    const item: DigestRuleHealthItem = {
      ruleKey: summary.ruleKey,
      ruleName: summary.ruleName,
      status: summary.status,
      adherenceRate: summary.adherenceRate,
      trackedActions: summary.totalActions,
      overrideCount: summary.overrideCount,
      unresolvedOverrideCount: summary.unresolvedOverrideCount,
      recommendation: summary.recommendations[0] ?? 'Continue monitoring.',
    };
    const topReason = getTopOverrideReason(
      overrides.filter((event) => event.ruleKey === summary.ruleKey)
    );
    if (topReason !== undefined) {
      item.topOverrideReason = topReason;
    }
    return item;
  });
}

function getTopOverrideReason(
  overrides: OverrideEvent[]
): OverrideReason | undefined {
  const counts = new Map<OverrideReason, number>();
  for (const event of overrides) {
    counts.set(event.overrideReason, (counts.get(event.overrideReason) ?? 0) + 1);
  }
  return [...counts.entries()].sort((left, right) => right[1] - left[1])[0]?.[0];
}

function buildRecommendations(input: DigestInput) {
  const recommendations = [];

  if (!input.lastScanAt) {
    recommendations.push({
      id: 'run-scan',
      severity: 'watch' as const,
      title: 'Run Mirror Scan',
      detail: 'No scan metadata is available for this digest period.',
      actionLabel: 'Run Scan',
    });
  }

  for (const summary of input.health.summaries) {
    if (summary.status === 'needs_review' || summary.status === 'at_risk') {
      recommendations.push({
        id: `review-${summary.ruleKey}`,
        severity:
          summary.status === 'needs_review' ? ('urgent' as const) : ('watch' as const),
        title: `Review ${summary.ruleName}`,
        detail: summary.recommendations[0] ?? 'Review recent policy exceptions.',
        actionLabel: 'Review Policy',
        targetRuleKey: summary.ruleKey,
      });
    }
  }

  const unresolved = input.overrides.filter(
    (event) => event.reviewStatus === 'unresolved'
  ).length;
  if (unresolved > 0) {
    recommendations.push({
      id: 'resolve-overrides',
      severity: unresolved >= 5 ? ('urgent' as const) : ('watch' as const),
      title: 'Resolve open overrides',
      detail: `${unresolved} override${unresolved === 1 ? '' : 's'} need review.`,
      actionLabel: 'Open Review',
    });
  }

  if (recommendations.length === 0) {
    recommendations.push({
      id: 'continue-monitoring',
      severity: 'info' as const,
      title: 'Continue monitoring',
      detail: 'No urgent policy review item was detected for this period.',
      actionLabel: 'Generate Next Digest',
    });
  }

  return recommendations.slice(0, 6);
}

function renderDigestMarkdown(report: Omit<DigestReport, 'markdown'>): string {
  const needsAttention = report.ruleHealth.filter((item) =>
    ['needs_review', 'at_risk', 'watch'].includes(item.status)
  );
  const stableRules = report.ruleHealth.filter(
    (item) => item.status === 'stable'
  );

  return [
    `# ModMirror Digest - r/${report.subreddit}`,
    '',
    `Period: ${formatDate(report.periodStart)} - ${formatDate(report.periodEnd)}`,
    '',
    '## Summary',
    '',
    `- Overall consistency: ${formatLabel(report.overallStatus)}`,
    `- Active policies: ${report.summary.activePolicies}`,
    `- Policy-tracked actions: ${report.summary.policyTrackedActions}`,
    `- Unresolved overrides: ${report.summary.unresolvedOverrides}`,
    `- Rules needing review: ${report.summary.rulesNeedingReview}`,
    report.summary.lastScanAt
      ? `- Last scan: ${formatDate(report.summary.lastScanAt)}`
      : '- Last scan: Not available',
    '',
    '## Rules Needing Attention',
    '',
    needsAttention.length > 0
      ? needsAttention.map(renderRuleMarkdown).join('\n\n')
      : '- No rules need immediate attention.',
    '',
    '## Stable Rules',
    '',
    stableRules.length > 0
      ? stableRules
          .map(
            (item) =>
              `- ${item.ruleName}: ${formatLabel(item.status)} (${formatPercent(item.adherenceRate)})`
          )
          .join('\n')
      : '- No stable rule signal yet.',
    '',
    '## Open Overrides',
    '',
    `- Total overrides: ${report.overrideSummary.total}`,
    `- Unresolved: ${report.overrideSummary.unresolved}`,
    `- Accepted exceptions: ${report.overrideSummary.acceptedExceptions}`,
    `- Policy needs update: ${report.overrideSummary.policyNeedsUpdate}`,
    `- Needs team discussion: ${report.overrideSummary.needsDiscussion}`,
    '',
    '## Suggested Actions',
    '',
    ...report.recommendations.map(
      (item, index) =>
        `${index + 1}. ${item.title}: ${item.detail}`
    ),
    '',
    '## Caveats',
    '',
    ...report.caveats.map((caveat) => `- ${caveat}`),
  ].join('\n');
}

function renderRuleMarkdown(item: DigestRuleHealthItem): string {
  return [
    `### ${item.ruleName}`,
    `Status: ${formatLabel(item.status)}`,
    `Adherence: ${formatPercent(item.adherenceRate)}`,
    `Tracked actions: ${item.trackedActions}`,
    `Overrides: ${item.overrideCount}`,
    item.topOverrideReason
      ? `Top reason: ${formatLabel(item.topOverrideReason)}`
      : 'Top reason: Not enough override data',
    '',
    'Recommended next step:',
    item.recommendation,
  ].join('\n');
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(value));
}

function formatPercent(value: number | undefined): string {
  if (value === undefined) {
    return 'n/a';
  }
  return `${Math.round(value * 100)}%`;
}

function formatLabel(value: string): string {
  return value.replaceAll('_', ' ');
}
