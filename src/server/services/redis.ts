import { redis } from '@devvit/web/server';
import type { RedisSmokeResult } from '../../shared/schema';

export function mmKey(subreddit: string, suffix: string): string {
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
  actions: (subreddit: string) => mmKey(subreddit, 'actions'),
  actionsByUser: (subreddit: string, username: string) =>
    mmKey(subreddit, `actions:user:${username}`),
  overrides: (subreddit: string) => mmKey(subreddit, 'overrides'),
  overrideReview: (subreddit: string, overrideId: string) =>
    mmKey(subreddit, `override:${overrideId}:review`),
  smoke: (subreddit: string) => mmKey(subreddit, 'smoke:redis-data-layer'),
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
