import { redis } from '@devvit/web/server';
import type {
  RedisSmokeResult,
  RedisSortedSetSmokeResult,
} from '../../shared/schema';
import { assertSafeSubredditName } from './subredditIsolation';

export function mmKey(subreddit: string, suffix: string): string {
  assertSafeSubredditName(subreddit);
  return `modmirror:${subreddit}:${suffix}`;
}

export const redisKeys = {
  config: (subreddit: string) => mmKey(subreddit, 'config'),
  demo: (subreddit: string) => mmKey(subreddit, 'demo'),
  policies: (subreddit: string) => mmKey(subreddit, 'policies'),
  policy: (subreddit: string, ruleId: string) =>
    mmKey(subreddit, `policy:${ruleId}`),
  policyVersions: (subreddit: string, policyId: string) =>
    mmKey(subreddit, `policy:${policyId}:versions`),
  policyVersion: (subreddit: string, policyId: string, versionId: string) =>
    mmKey(subreddit, `policy:${policyId}:version:${versionId}`),
  policyChanges: (subreddit: string, policyId: string) =>
    mmKey(subreddit, `policy:${policyId}:changes`),
  scanLast: (subreddit: string) => mmKey(subreddit, 'scan:last'),
  scan: (subreddit: string, scanId: string) =>
    mmKey(subreddit, `scan:${scanId}`),
  scans: (subreddit: string) => mmKey(subreddit, 'scans'),
  scansBySource: (subreddit: string, source: string) =>
    mmKey(subreddit, `scans:source:${source}`),
  scansByRule: (subreddit: string, ruleKey: string) =>
    mmKey(subreddit, `scans:rule:${ruleKey}`),
  scansByAuthorHash: (subreddit: string, authorHash: string) =>
    mmKey(subreddit, `scans:author:${authorHash}`),
  attributionCorrections: (subreddit: string) =>
    mmKey(subreddit, 'attribution:corrections'),
  attributionCorrectionHistory: (subreddit: string) =>
    mmKey(subreddit, 'attribution:correction-history'),
  actions: (subreddit: string) => mmKey(subreddit, 'actions'),
  actionsByUser: (subreddit: string, username: string) =>
    mmKey(subreddit, `actions:user:${username}`),
  receipts: (subreddit: string) => mmKey(subreddit, 'receipts'),
  receipt: (subreddit: string, receiptId: string) =>
    mmKey(subreddit, `receipt:${receiptId}`),
  receiptsByTarget: (subreddit: string, targetThingId: string) =>
    mmKey(subreddit, `receipts:target:${targetThingId}`),
  overrides: (subreddit: string) => mmKey(subreddit, 'overrides'),
  overrideReview: (subreddit: string, overrideId: string) =>
    mmKey(subreddit, `override:${overrideId}:review`),
  digestHistory: (subreddit: string) => mmKey(subreddit, 'digests'),
  digest: (subreddit: string, digestId: string) =>
    mmKey(subreddit, `digest:${digestId}`),
  digestSettings: (subreddit: string) => mmKey(subreddit, 'digest:settings'),
  deliveryReceipts: (subreddit: string) => mmKey(subreddit, 'delivery:receipts'),
  deliveryReceipt: (subreddit: string, receiptId: string) =>
    mmKey(subreddit, `delivery:receipt:${receiptId}`),
  evidenceBoards: (subreddit: string) => mmKey(subreddit, 'evidence:boards'),
  evidenceBoard: (subreddit: string, boardId: string) =>
    mmKey(subreddit, `evidence:board:${boardId}`),
  incidents: (subreddit: string) => mmKey(subreddit, 'incidents'),
  incident: (subreddit: string, incidentId: string) =>
    mmKey(subreddit, `incident:${incidentId}`),
  incidentActive: (subreddit: string) => mmKey(subreddit, 'incident:active'),
  privacyRetentionSettings: (subreddit: string) =>
    mmKey(subreddit, 'privacy:retention-settings'),
  runtimeHealthEvents: (subreddit: string) =>
    mmKey(subreddit, 'runtime:health-events'),
  smoke: (subreddit: string) => mmKey(subreddit, 'smoke:redis-data-layer'),
  smokeSortedSet: (subreddit: string) =>
    mmKey(subreddit, 'smoke:redis-zset-ordering'),
};

export function serializeJson(value: unknown): string {
  return JSON.stringify(value);
}

export function parseJson<T>(value: string | undefined): T | undefined {
  if (value === undefined) {
    return undefined;
  }

  return JSON.parse(value) as T;
}

export async function readJson<T>(key: string): Promise<T | undefined> {
  return parseJson<T>(await redis.get(key));
}

export async function writeJson(key: string, value: unknown): Promise<void> {
  await redis.set(key, serializeJson(value));
}

export async function deleteKeys(...keys: string[]): Promise<void> {
  if (keys.length > 0) {
    await redis.del(...keys);
  }
}

export async function runRedisDataSmoke(
  subreddit: string
): Promise<RedisSmokeResult> {
  const key = redisKeys.smoke(subreddit);
  const value = serializeJson({
    subreddit,
    checkedAt: new Date().toISOString(),
  });

  await redis.set(key, value);
  const readBack = await redis.get(key);

  const result: RedisSmokeResult = {
    key,
    value,
    ok: readBack === value,
  };

  if (readBack !== undefined) {
    result.readBack = readBack;
  }

  return result;
}

type RedisSortedSetSmokeMember = {
  id: string;
  subreddit: string;
  checkedAt: string;
  ordinal: number;
};

export async function runRedisSortedSetSmoke(
  subreddit: string
): Promise<RedisSortedSetSmokeResult> {
  const key = redisKeys.smokeSortedSet(subreddit);
  const checkedAt = new Date().toISOString();
  const members = [
    {
      id: 'oldest',
      score: 1000,
      member: serializeJson({
        id: 'oldest',
        subreddit,
        checkedAt,
        ordinal: 1,
      } satisfies RedisSortedSetSmokeMember),
    },
    {
      id: 'middle',
      score: 2000,
      member: serializeJson({
        id: 'middle',
        subreddit,
        checkedAt,
        ordinal: 2,
      } satisfies RedisSortedSetSmokeMember),
    },
    {
      id: 'newest',
      score: 3000,
      member: serializeJson({
        id: 'newest',
        subreddit,
        checkedAt,
        ordinal: 3,
      } satisfies RedisSortedSetSmokeMember),
    },
  ];

  await deleteKeys(key);
  const result = await (async () => {
    try {
      const addCount = await redis.zAdd(
        key,
        ...members.map(({ member, score }) => ({ member, score }))
      );
      const cardinality = await redis.zCard(key);
      const scoreEntries = await Promise.all(
        members.map(async ({ id, member }) => [id, await redis.zScore(key, member)])
      );
      const rows = await redis.zRange(key, 0, members.length - 1, {
        by: 'rank',
        reverse: true,
      });

      return {
        addCount,
        cardinality,
        rows,
        scoreChecks: Object.fromEntries(scoreEntries) as Record<
          string,
          number | undefined
        >,
      };
    } finally {
      await deleteKeys(key);
    }
  })();

  const expectedOrder = ['newest', 'middle', 'oldest'];
  const observedOrder = result.rows.map((row) => {
    const parsed = parseJson<RedisSortedSetSmokeMember>(row.member);
    return parsed?.id ?? row.member;
  });

  return {
    key,
    addCount: result.addCount,
    cardinality: result.cardinality,
    expectedOrder,
    observedOrder,
    observedScores: result.rows.map((row) => row.score),
    scoreChecks: result.scoreChecks,
    ok: expectedOrder.join('|') === observedOrder.join('|'),
  };
}
