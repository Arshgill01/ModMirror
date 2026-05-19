import { redis } from '@devvit/web/server';
import { createHash } from 'node:crypto';
import { SCAN_HISTORY_LIMIT } from '../../shared/constants';
import type {
  AttributedModAction,
  Confidence,
  LastScanMetadata,
  MirrorScanComparison,
  MirrorScanRecord,
} from '../../shared/schema';
import { parseJson, readJson, redisKeys, serializeJson, writeJson } from './redis';

export async function saveLastScanMetadata(
  metadata: LastScanMetadata
): Promise<void> {
  await Promise.all([
    writeJson(redisKeys.scan(metadata.subreddit, metadata.id), metadata),
    writeJson(redisKeys.scanLast(metadata.subreddit), metadata),
  ]);
}

export async function getLastScanMetadata(
  subreddit: string
): Promise<LastScanMetadata | undefined> {
  return readJson<LastScanMetadata>(redisKeys.scanLast(subreddit));
}

export async function saveScanRecord(
  record: MirrorScanRecord
): Promise<void> {
  const metadata = toLastScanMetadata(record);
  const score = getCreatedAtScore(record.createdAt);
  const ruleKeys = getRuleKeys(record.attributedActions);
  const authorHashes = getAuthorHashes(record.attributedActions);

  await Promise.all([
    writeJson(redisKeys.scan(record.subreddit, record.id), record),
    writeJson(redisKeys.scanLast(record.subreddit), metadata),
    redis.zAdd(redisKeys.scans(record.subreddit), {
      member: serializeJson(metadata),
      score,
    }),
    redis.zAdd(redisKeys.scansBySource(record.subreddit, record.source), {
      member: serializeJson(metadata),
      score,
    }),
    ...ruleKeys.map((ruleKey) =>
      redis.zAdd(redisKeys.scansByRule(record.subreddit, ruleKey), {
        member: record.id,
        score,
      })
    ),
    ...authorHashes.map((authorHash) =>
      redis.zAdd(redisKeys.scansByAuthorHash(record.subreddit, authorHash), {
        member: record.id,
        score,
      })
    ),
  ]);

  await Promise.all([
    trimScanIndex(redisKeys.scans(record.subreddit), record.retention.maxScansPerSubreddit),
    trimScanIndex(
      redisKeys.scansBySource(record.subreddit, record.source),
      record.retention.maxScansPerSubreddit
    ),
  ]);
}

export async function listScanMetadata(
  subreddit: string,
  options: { limit?: number; source?: MirrorScanRecord['source'] } = {}
): Promise<LastScanMetadata[]> {
  const limit = options.limit ?? SCAN_HISTORY_LIMIT;
  if (limit <= 0) {
    return [];
  }

  const key =
    options.source === undefined
      ? redisKeys.scans(subreddit)
      : redisKeys.scansBySource(subreddit, options.source);
  const rows = await redis.zRange(key, 0, limit - 1, {
    by: 'rank',
    reverse: true,
  });

  return rows
    .map((row: { member: string }) => parseJson<LastScanMetadata>(row.member))
    .filter((metadata): metadata is LastScanMetadata => metadata !== undefined);
}

export async function getScanRecord(
  subreddit: string,
  scanId: string
): Promise<MirrorScanRecord | undefined> {
  return readJson<MirrorScanRecord>(redisKeys.scan(subreddit, scanId));
}

export async function compareScanRecords(
  subreddit: string,
  leftScanId: string,
  rightScanId: string
): Promise<MirrorScanComparison | undefined> {
  const [left, right] = await Promise.all([
    getScanRecord(subreddit, leftScanId),
    getScanRecord(subreddit, rightScanId),
  ]);
  if (left === undefined || right === undefined) {
    return undefined;
  }

  return {
    leftScanId,
    rightScanId,
    subreddit,
    totalActionsDelta: right.totalActionsScanned - left.totalActionsScanned,
    attributedDelta: right.attributedCount - left.attributedCount,
    unmatchedDelta: right.unmatchedCount - left.unmatchedCount,
    driftCandidateDelta:
      right.driftCandidates.length - left.driftCandidates.length,
    confidenceDelta: confidenceDelta(
      left.confidenceBreakdown,
      right.confidenceBreakdown
    ),
  };
}

function toLastScanMetadata(record: MirrorScanRecord): LastScanMetadata {
  return {
    id: record.id,
    subreddit: record.subreddit,
    createdAt: record.createdAt,
    createdBy: record.createdBy ?? 'unknown',
    source: record.source,
    totalActionsScanned: record.totalActionsScanned,
    attributedCount: record.attributedCount,
    unmatchedCount: record.unmatchedCount,
    confidenceBreakdown: record.confidenceBreakdown,
    driftCandidateCount: record.driftCandidates.length,
  };
}

function getCreatedAtScore(createdAt: string): number {
  const createdAtScore = Date.parse(createdAt);
  return Number.isNaN(createdAtScore) ? Date.now() : createdAtScore;
}

async function trimScanIndex(key: string, maxCount: number): Promise<void> {
  if (maxCount <= 0) {
    return;
  }
  await redis.zRemRangeByRank(key, 0, -(maxCount + 1));
}

function getRuleKeys(actions: AttributedModAction[]): string[] {
  return [...new Set(actions.flatMap((action) =>
    action.inferredRuleKey === undefined ? [] : [action.inferredRuleKey]
  ))];
}

function getAuthorHashes(actions: AttributedModAction[]): string[] {
  return [
    ...new Set(
      actions.flatMap((action) =>
        action.targetAuthor === undefined
          ? []
          : [hashAuthor(action.targetAuthor)]
      )
    ),
  ];
}

function hashAuthor(author: string): string {
  return createHash('sha256').update(author.toLowerCase()).digest('hex').slice(0, 16);
}

function confidenceDelta(
  left: Record<Confidence, number>,
  right: Record<Confidence, number>
): Record<Confidence, number> {
  return {
    high: right.high - left.high,
    medium: right.medium - left.medium,
    low: right.low - left.low,
    unmatched: right.unmatched - left.unmatched,
  };
}
