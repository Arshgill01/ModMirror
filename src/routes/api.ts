import { Hono } from 'hono';
import { context } from '@devvit/web/server';
import { runRedditSmoke, runRedisSmoke } from '../core/smoke';
import { APP_NAME, type HealthResponse } from '../shared/status';

export const api = new Hono();

api.get('/health', (c) =>
  c.json({
    ok: true,
    app: {
      name: APP_NAME,
      slug: context.appSlug ?? null,
      version: context.appVersion ?? null,
    },
    environment: {
      runtime: 'devvit-web',
      playtestStatus: 'not-runtime-verified',
    },
    subreddit: {
      id: context.subredditId ?? null,
      name: context.subredditName ?? null,
    },
    user: {
      username: context.username ?? null,
    },
    demoMode: {
      enabled: false,
      source: 'placeholder',
    },
    redis: {
      smokeStatus: 'not_checked',
      detail:
        'Redis smoke remains available at POST /api/smoke/redis; dashboard health will integrate the Redis data layer after Agents A/B merge.',
    },
  } satisfies HealthResponse)
);

api.post('/smoke/redis', async (c) => {
  const result = await runRedisSmoke();
  return c.json(result);
});

api.post('/smoke/reddit', async (c) => {
  const result = await runRedditSmoke();
  return c.json(result);
});
