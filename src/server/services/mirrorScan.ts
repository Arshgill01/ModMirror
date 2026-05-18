import {
  CONFIDENCE_VALUES,
  MIRROR_SCAN_DEPTH_CONFIG,
  MINIMUM_RULE_ACTIONS_FOR_DRIFT_DISPLAY,
  SCAN_HISTORY_LIMIT,
} from '../../shared/constants';
import { getSmallSubredditThresholdStatus } from '../../shared/scoring';
import type {
  ActionSource,
  AttributedModAction,
  Confidence,
  DriftCandidate,
  EnforcementAction,
  MirrorScan,
  MirrorScanDepth,
  MirrorScanDepthMetadata,
  MirrorScanRecord,
} from '../../shared/schema';
import { attributeActions } from './attribution';
import {
  createAttributionCorrectionIndex,
  listAttributionCorrections,
} from './attributionCalibration';
import { getDemoMirrorScanSources } from './demoData';
import { loadLiveMirrorScanSources } from './redditSources';
import { saveScanRecord } from './scans';

export type RunMirrorScanOptions = {
  mode: 'live' | 'demo';
  depth?: MirrorScanDepth;
  createdBy?: string;
};

export async function runMirrorScan(
  options: RunMirrorScanOptions
): Promise<MirrorScan> {
  const sources =
    options.mode === 'demo'
      ? getDemoMirrorScanSources()
      : await loadLiveMirrorScanSources(
          options.depth === undefined ? {} : { depth: options.depth }
        );
  const calibration = await loadCalibrationForScan(sources.subreddit);
  const attributedActions = attributeActions(
    sources.actions,
    sources.rules,
    sources.removalReasons,
    calibration.correctionIndex
  );
  const confidenceBreakdown = getConfidenceBreakdown(attributedActions);
  const unmatchedCount = confidenceBreakdown.unmatched;
  const attributedCount = attributedActions.length - unmatchedCount;
  const scan: MirrorScan = {
    id: createScanId(sources.source),
    subreddit: sources.subreddit,
    createdAt: new Date().toISOString(),
    source: sources.source,
    totalActionsScanned: sources.actions.length,
    attributedCount,
    unmatchedCount,
    confidenceBreakdown,
    driftCandidates: buildDriftCandidates(attributedActions),
    smallSubredditStatus: getSmallSubredditThresholdStatus(
      sources.actions.length
    ),
    scanDepth:
      sources.scanDepth ??
      createDemoScanDepthMetadata(options.depth ?? 'standard', sources.actions.length),
    warnings: [...sources.warnings, ...calibration.warnings],
  };

  if (options.createdBy) {
    scan.createdBy = options.createdBy;
  }

  await saveScanMetadata(scan, attributedActions);
  return scan;
}

async function loadCalibrationForScan(subreddit: string): Promise<{
  correctionIndex?: ReturnType<typeof createAttributionCorrectionIndex>;
  warnings: string[];
}> {
  try {
    const corrections = await listAttributionCorrections(subreddit);
    if (corrections.length === 0) {
      return { warnings: [] };
    }
    return {
      correctionIndex: createAttributionCorrectionIndex(corrections),
      warnings: [
        `Applied ${corrections.length} moderator attribution correction${corrections.length === 1 ? '' : 's'} during scan.`,
      ],
    };
  } catch (error) {
    return {
      warnings: [
        `Scan continued without attribution corrections because calibration lookup failed: ${formatError(error)}`,
      ],
    };
  }
}

export function getConfidenceBreakdown(
  actions: AttributedModAction[]
): Record<Confidence, number> {
  const totals = Object.fromEntries(
    CONFIDENCE_VALUES.map((confidence) => [confidence, 0])
  ) as Record<Confidence, number>;

  for (const action of actions) {
    totals[action.confidence] += 1;
  }

  return totals;
}

export function buildDriftCandidates(
  actions: AttributedModAction[]
): DriftCandidate[] {
  const groups = new Map<string, AttributedModAction[]>();

  for (const action of actions) {
    if (action.confidence === 'unmatched' || !action.inferredRuleName) {
      continue;
    }

    const key = action.inferredRuleKey ?? action.inferredRuleName;
    groups.set(key, [...(groups.get(key) ?? []), action]);
  }

  return Array.from(groups.entries())
    .map(([, group]) => buildDriftCandidate(group))
    .filter((candidate): candidate is DriftCandidate => Boolean(candidate))
    .sort((left, right) => right.totalActions - left.totalActions);
}

function buildDriftCandidate(
  group: AttributedModAction[]
): DriftCandidate | undefined {
  if (group.length < MINIMUM_RULE_ACTIONS_FOR_DRIFT_DISPLAY) {
    return undefined;
  }

  const actionDistribution = getActionDistribution(group);
  const distinctActions = Object.keys(actionDistribution).length;

  if (distinctActions < 2) {
    return undefined;
  }

  const ruleName = group[0]?.inferredRuleName ?? 'Unknown rule';
  const confidence = summarizeConfidence(group);

  const candidate: DriftCandidate = {
    ruleName,
    confidence,
    summary: `${ruleName} has ${group.length} attributed actions split across ${distinctActions} enforcement outcomes.`,
    totalActions: group.length,
    actionDistribution,
    recommendation: 'Create a team policy for this rule.',
  };
  const ruleKey = group[0]?.inferredRuleKey;
  if (ruleKey) {
    candidate.ruleKey = ruleKey;
  }

  return candidate;
}

function getActionDistribution(
  actions: AttributedModAction[]
): Partial<Record<EnforcementAction, number>> {
  return actions.reduce<Partial<Record<EnforcementAction, number>>>(
    (distribution, action) => {
      const key = action.normalizedAction ?? 'manual_review';
      distribution[key] = (distribution[key] ?? 0) + 1;
      return distribution;
    },
    {}
  );
}

function summarizeConfidence(actions: AttributedModAction[]): Confidence {
  const totals = getConfidenceBreakdown(actions);
  if (totals.high >= totals.medium && totals.high >= totals.low) {
    return 'high';
  }
  if (totals.medium >= totals.low) {
    return 'medium';
  }
  return 'low';
}

async function saveScanMetadata(
  scan: MirrorScan,
  attributedActions: AttributedModAction[]
): Promise<void> {
  try {
    await saveScanRecord(toScanRecord(scan, attributedActions));
  } catch (error) {
    scan.warnings.push(
      `Scan completed, but saving scan metadata failed: ${formatError(error)}`
    );
  }
}

function toScanRecord(
  scan: MirrorScan,
  attributedActions: AttributedModAction[]
): MirrorScanRecord {
  return {
    ...scan,
    attributedActions,
    unmatchedActions: attributedActions.filter(
      (action) => action.confidence === 'unmatched'
    ),
    retention: {
      maxScansPerSubreddit: SCAN_HISTORY_LIMIT,
      storedActionCount: attributedActions.length,
    },
  };
}

function createScanId(source: ActionSource): string {
  return `scan-${source}-${new Date().toISOString().replace(/[:.]/g, '-')}`;
}

function createDemoScanDepthMetadata(
  depth: MirrorScanDepth,
  actionCount: number
): MirrorScanDepthMetadata {
  const config = MIRROR_SCAN_DEPTH_CONFIG[depth];

  return {
    depth,
    requestedLimit: config.requestedLimit,
    pageSize: config.pageSize,
    fetchedActions: actionCount,
    hitLimit: actionCount >= config.requestedLimit,
    paginationStrategy: 'listing_all',
    runtimeVerified: true,
  };
}

function formatError(error: unknown): string {
  return error instanceof Error ? error.message : 'unknown error';
}
