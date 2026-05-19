import type {
  ActionEvent,
  ContentSnapshot,
  ModqueueContentType,
  ModqueueHistorySummary,
  ModqueuePolicyHint,
  ModqueueTriageCapability,
  ModqueueTriageItem,
  ModqueueTriageResponse,
  ModqueueTriageRiskState,
  ModerationTargetType,
  RulePolicy,
} from '../../shared/schema';
import {
  captureContentSnapshot,
  type ContentSnapshotInput,
} from './contentSnapshots';
import { getTargetType } from './targetContext';

export type ModqueueTargetLike = {
  id?: string | undefined;
  authorName?: string | undefined;
  subredditName?: string | undefined;
  title?: string | undefined;
  body?: string | undefined;
  permalink?: string | undefined;
  createdAt?: Date | string | undefined;
  numberOfReports?: number | undefined;
  numReports?: number | undefined;
  userReportReasons?: unknown;
  modReportReasons?: unknown;
  removed?: boolean | undefined;
  approved?: boolean | undefined;
  spam?: boolean | undefined;
};

export type ModqueueTriageFetchOptions = {
  subreddit: string;
  type: ModqueueContentType;
  limit: number;
};

export type ModqueueTriageDependencies = {
  fetchQueueItems: (
    options: ModqueueTriageFetchOptions
  ) => Promise<ModqueueTargetLike[]>;
  listPolicies: (subreddit: string) => Promise<RulePolicy[]>;
  listRecentActions: (subreddit: string, limit: number) => Promise<ActionEvent[]>;
  now?: () => string;
};

export type LoadModqueueTriageOptions = {
  subreddit?: string;
  type?: ModqueueContentType;
  limit?: number;
  dependencies?: ModqueueTriageDependencies;
};

const DEFAULT_QUEUE_LIMIT = 25;
const MAX_QUEUE_LIMIT = 50;
const HISTORY_ACTION_LIMIT = 100;

export function getModqueueTriageCapability(
  state: ModqueueTriageCapability['state'] = 'type_only',
  detail?: string
): ModqueueTriageCapability {
  const baseEvidence = [
    'Installed @devvit/public-api typings expose Subreddit.getModQueue(options) and RedditAPIClient.getModQueue(options).',
    'Installed @devvit/public-api typings expose getReports(options) for reported posts/comments.',
    'Installed Devvit protos define read-only /r/{subreddit}/about/modqueue and /about/reports endpoints.',
  ];

  if (state === 'failed_runtime') {
    return {
      state,
      label: 'Modqueue triage runtime failed',
      detail:
        detail ??
        'Devvit exposes modqueue reads, but this runtime request failed. No queue items are synthesized.',
      runtimeProof: 'not_verified',
      evidence: baseEvidence,
      nextAction:
        'Run W17 playtest against r/modmirror_dev and record the exact modqueue response or permission failure.',
      safeToUseForReadOnlyTriage: false,
    };
  }

  if (state === 'unsupported') {
    return {
      state,
      label: 'Modqueue triage unavailable',
      detail:
        detail ??
        'A subreddit context is required before ModMirror can request Reddit modqueue items.',
      runtimeProof: 'not_verified',
      evidence: baseEvidence,
      nextAction:
        'Open ModMirror from a subreddit context or provide a subreddit query parameter.',
      safeToUseForReadOnlyTriage: false,
    };
  }

  if (state === 'runtime_verified') {
    return {
      state,
      label: 'Modqueue triage runtime verified',
      detail:
        detail ??
        'ModMirror has read Reddit modqueue items in playtest and can use them for read-only triage.',
      runtimeProof: 'runtime_verified',
      evidence: baseEvidence,
      nextAction:
        'Keep modqueue reads in the runtime verification regression checklist.',
      safeToUseForReadOnlyTriage: true,
    };
  }

  return {
    state,
    label: 'Modqueue triage type-supported',
    detail:
      detail ??
      'Devvit typings expose read-only modqueue APIs, but ModMirror has not runtime-verified this endpoint in playtest.',
    runtimeProof: 'type_only',
    evidence: baseEvidence,
    nextAction:
      'Run a non-destructive playtest read against safe test subreddit modqueue content.',
    safeToUseForReadOnlyTriage: true,
  };
}

export async function loadModqueueTriage(
  options: LoadModqueueTriageOptions
): Promise<ModqueueTriageResponse> {
  const generatedAt = options.dependencies?.now?.() ?? new Date().toISOString();
  const requestedType = options.type ?? 'all';
  const limit = clampLimit(options.limit);
  const subreddit = options.subreddit?.trim();

  if (!subreddit) {
    return {
      generatedAt,
      requestedType,
      capability: getModqueueTriageCapability('unsupported'),
      items: [],
      source: 'unavailable',
      warnings: ['No subreddit context was available for modqueue triage.'],
    };
  }

  if (options.dependencies === undefined) {
    return {
      generatedAt,
      subreddit,
      requestedType,
      capability: getModqueueTriageCapability('unsupported'),
      items: [],
      source: 'unavailable',
      warnings: ['No modqueue adapter was configured for this runtime path.'],
    };
  }

  try {
    const [queueItems, policies, recentActions] = await Promise.all([
      options.dependencies.fetchQueueItems({
        subreddit,
        type: requestedType,
        limit,
      }),
      options.dependencies.listPolicies(subreddit),
      options.dependencies.listRecentActions(subreddit, HISTORY_ACTION_LIMIT),
    ]);

    const items = await Promise.all(
      queueItems
        .slice(0, limit)
        .map((item) =>
          buildModqueueTriageItem({
            item,
            subreddit,
            policies,
            recentActions,
            generatedAt,
          })
        )
    );

    return {
      generatedAt,
      subreddit,
      requestedType,
      capability: getModqueueTriageCapability('type_only'),
      items,
      source: 'reddit_modqueue',
      warnings: [
        'Modqueue read support is type-confirmed but not yet runtime-verified in ModMirror playtest.',
      ],
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Unknown modqueue read failure.';
    return {
      generatedAt,
      subreddit,
      requestedType,
      capability: getModqueueTriageCapability('failed_runtime', message),
      items: [],
      source: 'unavailable',
      warnings: [`Reddit modqueue read failed: ${message}`],
    };
  }
}

export async function buildModqueueTriageItem(options: {
  item: ModqueueTargetLike;
  subreddit: string;
  policies: RulePolicy[];
  recentActions: ActionEvent[];
  generatedAt?: string;
}): Promise<ModqueueTriageItem> {
  const targetThingId = normalizeThingId(options.item.id);
  const targetType = getTargetType(targetThingId);
  const reportReasons = uniqueStrings([
    ...normalizeReportReasons(options.item.userReportReasons),
    ...normalizeReportReasons(options.item.modReportReasons),
  ]);
  const reportCount = Math.max(
    Number(options.item.numberOfReports ?? 0),
    Number(options.item.numReports ?? 0),
    reportReasons.length
  );
  const snapshotOptions: {
    item: ModqueueTargetLike;
    targetThingId: string;
    targetType: ModerationTargetType;
    subreddit: string;
    generatedAt?: string;
  } = {
    item: options.item,
    targetThingId,
    targetType,
    subreddit: options.item.subredditName ?? options.subreddit,
  };
  if (options.generatedAt !== undefined) {
    snapshotOptions.generatedAt = options.generatedAt;
  }
  const contentSnapshot = await buildContentSnapshot(snapshotOptions);
  const policyHint = inferPolicyHint({
    policies: options.policies,
    reportReasons,
    item: options.item,
  });
  const historyInput: {
    authorName?: string;
    recentActions: ActionEvent[];
  } = {
    recentActions: options.recentActions,
  };
  if (options.item.authorName !== undefined) {
    historyInput.authorName = options.item.authorName;
  }
  const historySummary = summarizeHistory(historyInput);
  const warnings = buildItemWarnings({
    targetThingId,
    targetType,
    contentSnapshot,
    policyHint,
  });
  const applyPolicyHashInput: ApplyPolicyHashInput = {
    targetThingId,
    targetType,
    subreddit: options.item.subredditName ?? options.subreddit,
    policyHint,
  };
  if (options.item.authorName !== undefined) {
    applyPolicyHashInput.authorName = options.item.authorName;
  }
  if (options.item.title !== undefined) {
    applyPolicyHashInput.title = options.item.title;
  }
  if (options.item.body !== undefined) {
    applyPolicyHashInput.body = options.item.body;
  }
  if (options.item.permalink !== undefined) {
    applyPolicyHashInput.permalink = options.item.permalink;
  }

  const triageItem: ModqueueTriageItem = {
    id: `triage-${targetThingId}`,
    targetThingId,
    targetType,
    subreddit: options.item.subredditName ?? options.subreddit,
    reportCount,
    reportReasons,
    riskState: classifyRisk(options.item, reportCount),
    policyHint,
    historySummary,
    contentSnapshot,
    applyPolicyHash: buildApplyPolicyHash(applyPolicyHashInput),
    source: 'reddit_modqueue',
    warnings,
  };

  copyOptionalItemFields(triageItem, options.item);
  return triageItem;
}

function clampLimit(limit: number | undefined): number {
  if (limit === undefined || Number.isNaN(limit)) {
    return DEFAULT_QUEUE_LIMIT;
  }
  return Math.min(Math.max(Math.floor(limit), 1), MAX_QUEUE_LIMIT);
}

function normalizeThingId(id: string | undefined): string {
  const trimmed = id?.trim();
  return trimmed || 'unknown';
}

function normalizeReportReasons(value: unknown): string[] {
  if (value === undefined || value === null) {
    return [];
  }
  if (typeof value === 'string') {
    return value.trim() ? [value.trim()] : [];
  }
  if (Array.isArray(value)) {
    return value.flatMap((item) => normalizeReportReasons(item));
  }
  if (typeof value === 'object') {
    return Object.entries(value)
      .flatMap(([key, itemValue]) => [
        key,
        ...normalizeReportReasons(itemValue),
      ])
      .filter((item) => item.trim().length > 0);
  }
  return [String(value)];
}

function uniqueStrings(values: string[]): string[] {
  return [...new Set(values.map((value) => value.trim()).filter(Boolean))];
}

async function buildContentSnapshot(options: {
  item: ModqueueTargetLike;
  targetThingId: string;
  targetType: ModerationTargetType;
  subreddit: string;
  generatedAt?: string;
}): Promise<ContentSnapshot> {
  const input: ContentSnapshotInput = {
    targetThingId: options.targetThingId,
    targetType: options.targetType,
    subreddit: options.subreddit,
    source: 'api',
  };
  if (options.item.authorName !== undefined) {
    input.authorName = options.item.authorName;
  }
  if (options.item.title !== undefined) {
    input.title = options.item.title;
  }
  if (options.item.body !== undefined) {
    input.body = options.item.body;
  }
  if (options.item.permalink !== undefined) {
    input.permalink = options.item.permalink;
  }

  return captureContentSnapshot(
    input,
    options.generatedAt === undefined
      ? undefined
      : {
          now: () => options.generatedAt ?? new Date().toISOString(),
          getPostById: async () => {
            throw new Error('Modqueue item did not include post content.');
          },
          getCommentById: async () => {
            throw new Error('Modqueue item did not include comment content.');
          },
          getCurrentUser: async () => undefined,
        }
  );
}

function inferPolicyHint(options: {
  policies: RulePolicy[];
  reportReasons: string[];
  item: ModqueueTargetLike;
}): ModqueuePolicyHint {
  const adoptedPolicies = options.policies.filter((policy) => policy.active);
  if (adoptedPolicies.length === 0) {
    return {
      status: 'no_policy',
      confidence: 'unmatched',
      matchReasons: ['No adopted policy exists for this subreddit.'],
    };
  }

  const haystack = [
    ...options.reportReasons,
    options.item.title ?? '',
    options.item.body ?? '',
  ]
    .join(' ')
    .toLowerCase();
  const scored = adoptedPolicies
    .map((policy) => {
      const policyTokens = tokenize(`${policy.ruleKey} ${policy.ruleName}`);
      const exactNameMatch =
        haystack.includes(policy.ruleName.toLowerCase()) ||
        haystack.includes(policy.ruleKey.toLowerCase());
      const tokenMatches = policyTokens.filter((token) => haystack.includes(token));
      return {
        policy,
        exactNameMatch,
        score: exactNameMatch ? tokenMatches.length + 4 : tokenMatches.length,
        tokenMatches,
      };
    })
    .sort((left, right) => right.score - left.score);
  const best = scored[0];

  if (best === undefined || best.score <= 0) {
    return {
      status: 'unmatched',
      confidence: 'unmatched',
      matchReasons: [
        'Report reasons did not match an adopted policy name or rule key.',
      ],
    };
  }

  return {
    status: best.exactNameMatch || best.score >= 3 ? 'matched' : 'possible_match',
    ruleKey: best.policy.ruleKey,
    ruleName: best.policy.ruleName,
    confidence: best.exactNameMatch || best.score >= 3 ? 'medium' : 'low',
    matchReasons:
      best.tokenMatches.length > 0
        ? best.tokenMatches.map((token) => `Matched "${token}" in report/content text.`)
        : ['Matched policy name or rule key in report/content text.'],
  };
}

function tokenize(value: string): string[] {
  return uniqueStrings(
    value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, ' ')
      .split(' ')
      .filter((token) => token.length >= 4)
  );
}

function summarizeHistory(options: {
  authorName?: string;
  recentActions: ActionEvent[];
}): ModqueueHistorySummary {
  if (!options.authorName) {
    return {
      modmirrorActionsForAuthor: 0,
      recentRules: [],
      summary:
        'No author was available from the queue item, so ModMirror history was not matched.',
    };
  }

  const matching = options.recentActions.filter(
    (event) =>
      event.targetAuthor?.toLowerCase() === options.authorName?.toLowerCase()
  );
  const recentRules = uniqueStrings(
    matching.map((event) => event.ruleName ?? event.ruleKey)
  ).slice(0, 3);

  const summary: ModqueueHistorySummary = {
    modmirrorActionsForAuthor: matching.length,
    recentRules,
    summary:
      matching.length === 0
        ? 'No prior ModMirror Apply Policy receipts for this author.'
        : `${matching.length} recent ModMirror action${matching.length === 1 ? '' : 's'} for this author.`,
  };
  if (matching[0]?.createdAt !== undefined) {
    summary.lastActionAt = matching[0].createdAt;
  }
  return summary;
}

function classifyRisk(
  item: ModqueueTargetLike,
  reportCount: number
): ModqueueTriageRiskState {
  if (item.removed || item.spam || item.approved) {
    return 'already_actioned';
  }
  if (reportCount >= 3) {
    return 'high_report_volume';
  }
  if (reportCount > 0) {
    return 'reported';
  }
  return 'needs_review';
}

type ApplyPolicyHashInput = {
  targetThingId: string;
  targetType: ModerationTargetType;
  subreddit: string;
  authorName?: string;
  title?: string;
  body?: string;
  permalink?: string;
  policyHint: ModqueuePolicyHint;
};

function buildApplyPolicyHash(options: ApplyPolicyHashInput): string {
  const params = new URLSearchParams();
  params.set('targetThingId', options.targetThingId);
  params.set('targetType', options.targetType);
  params.set('subreddit', options.subreddit);
  if (options.authorName !== undefined) {
    params.set('targetAuthor', options.authorName);
  }
  if (options.title !== undefined) {
    params.set('targetTitle', options.title);
  }
  if (options.body !== undefined) {
    params.set('targetBody', options.body);
  }
  if (options.permalink !== undefined) {
    params.set('targetPermalink', options.permalink);
  }
  if (options.policyHint.ruleKey !== undefined) {
    params.set('ruleKey', options.policyHint.ruleKey);
  }
  return `#act?${params.toString()}`;
}

function buildItemWarnings(options: {
  targetThingId: string;
  targetType: ModerationTargetType;
  contentSnapshot: ContentSnapshot;
  policyHint: ModqueuePolicyHint;
}): string[] {
  const warnings = [...options.contentSnapshot.warnings];
  if (options.targetThingId === 'unknown' || options.targetType === 'unknown') {
    warnings.push('Queue item did not include a supported post/comment thing ID.');
  }
  if (options.policyHint.status !== 'matched') {
    warnings.push('Policy match is not deterministic; moderator must choose the rule.');
  }
  return warnings;
}

function copyOptionalItemFields(
  triageItem: ModqueueTriageItem,
  item: ModqueueTargetLike
): void {
  if (item.authorName !== undefined) {
    triageItem.authorName = item.authorName;
  }
  if (item.title !== undefined) {
    triageItem.title = item.title;
  }
  if (item.body !== undefined) {
    triageItem.bodyExcerpt = item.body.trim().slice(0, 180);
  }
  if (item.permalink !== undefined) {
    triageItem.permalink = item.permalink.startsWith('http')
      ? item.permalink
      : `https://www.reddit.com${item.permalink}`;
  }
  const createdAt = normalizeDate(item.createdAt);
  if (createdAt !== undefined) {
    triageItem.createdAt = createdAt;
  }
}

function normalizeDate(value: Date | string | undefined): string | undefined {
  if (value === undefined) {
    return undefined;
  }
  if (value instanceof Date) {
    return value.toISOString();
  }
  const timestamp = Date.parse(value);
  return Number.isNaN(timestamp) ? undefined : new Date(timestamp).toISOString();
}
