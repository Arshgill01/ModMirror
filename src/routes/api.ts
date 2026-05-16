import { Hono } from 'hono';
import { context } from '@devvit/web/server';
import { runRedditSmoke, runRedisSmoke } from '../core/smoke';
import { APP_NAME, type HealthResponse } from '../shared/status';
import type { ApiResponse, MirrorScan } from '../shared/schema';
import { runMirrorScan } from '../server/services/mirrorScan';

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

api.post('/scan', async (c) => {
  const body = (await c.req.json().catch(() => ({}))) as Partial<{
    mode: string;
  }>;
  const mode: 'live' | 'demo' = body.mode === 'demo' ? 'demo' : 'live';

  try {
    const scan =
      context.username !== undefined
        ? await runMirrorScan({ mode, createdBy: context.username })
        : await runMirrorScan({ mode });
    const response: ApiResponse<MirrorScan> = {
      ok: true,
      data: scan,
    };

    return c.json(response);
  } catch (error) {
    const response: ApiResponse<MirrorScan> = {
      ok: false,
      error: {
        code: 'scan_failed',
        message:
          error instanceof Error ? error.message : 'Unknown scan failure',
      },
    };

    return c.json(response, 500);
  }
});
