import { redis } from '@devvit/web/server';
import type { OverrideEvent } from '../../shared/schema';
import { parseJson, redisKeys, serializeJson } from './redis';

export async function saveAuditEvent(event: OverrideEvent): Promise<void> {
  const createdAtScore = Date.parse(event.createdAt);

  await redis.zAdd(redisKeys.overrides(event.subreddit), {
    member: serializeJson(event),
    score: Number.isNaN(createdAtScore) ? Date.now() : createdAtScore,
  });
}

export async function listRecentAuditEvents(
  subreddit: string,
  limit = 25
): Promise<OverrideEvent[]> {
  if (limit <= 0) {
    return [];
  }

  const rows = await redis.zRange(
    redisKeys.overrides(subreddit),
    0,
    limit - 1,
    {
      by: 'rank',
      reverse: true,
    }
  );

  return rows
    .map((row) => parseJson<OverrideEvent>(row.member))
    .filter((event): event is OverrideEvent => event !== undefined);
}
