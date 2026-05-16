import { Hono } from 'hono';
import { context } from '@devvit/web/server';
import { runRedditSmoke, runRedisSmoke } from '../core/smoke';

export const api = new Hono();

api.get('/health', (c) =>
  c.json({
    ok: true,
    appSlug: context.appSlug,
    appVersion: context.appVersion,
    subredditId: context.subredditId,
    subredditName: context.subredditName,
    username: context.username,
  })
);

api.post('/smoke/redis', async (c) => {
  const result = await runRedisSmoke();
  return c.json(result);
});

api.post('/smoke/reddit', async (c) => {
  const result = await runRedditSmoke();
  return c.json(result);
});
