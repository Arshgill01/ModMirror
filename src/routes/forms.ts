import { Hono } from 'hono';
import { context, reddit } from '@devvit/web/server';
import type { UiResponse } from '@devvit/web/shared';
import type { FormField } from '@devvit/shared-types/shared/form.js';
import { getTargetSummary, runRedisSmoke } from '../core/smoke';

type SmokeFormValues = {
  targetId?: string;
  location?: string;
  note?: string;
};

export const forms = new Hono();

const getTargetId = (values: SmokeFormValues) => {
  if (typeof values.targetId === 'string' && values.targetId.trim()) {
    return values.targetId.trim();
  }

  return undefined;
};

const buildChainedFields = (
  targetId: string,
  authorName: string | undefined
): FormField[] => [
  {
    name: 'targetId',
    label: 'Target ID',
    type: 'string',
    required: true,
    defaultValue: targetId,
    disabled: true,
  },
  {
    name: 'authorName',
    label: 'Resolved author',
    type: 'string',
    defaultValue: authorName ?? 'unavailable',
    disabled: true,
  },
  {
    name: 'note',
    label: 'Smoke note',
    type: 'paragraph',
    helpText: 'Stored only in the Wave 0 Redis smoke key.',
    defaultValue: 'Wave 0 form chaining proof',
  },
];

forms.post('/smoke-target-submit', async (c) => {
  const values = await c.req.json<SmokeFormValues>();
  const targetId = getTargetId(values);
  if (!targetId) {
    return c.json<UiResponse>(
      {
        showToast: 'Smoke test failed: missing target ID.',
      },
      200
    );
  }

  const target = await getTargetSummary(targetId);

  return c.json<UiResponse>(
    {
      showForm: {
        name: 'smokeChained',
        form: {
          title: 'ModMirror Chained Form Smoke Test',
          fields: buildChainedFields(target.id, target.authorName),
          acceptLabel: 'Write Redis Smoke',
          cancelLabel: 'Cancel',
        },
      },
    },
    200
  );
});

forms.post('/smoke-chained-submit', async (c) => {
  const values = await c.req.json<SmokeFormValues>();
  const targetId = getTargetId(values);
  if (!targetId) {
    return c.json<UiResponse>(
      {
        showToast: 'Smoke test failed: missing target ID.',
      },
      200
    );
  }

  const [target, redisResult] = await Promise.all([
    getTargetSummary(targetId),
    runRedisSmoke(),
  ]);

  return c.json<UiResponse>(
    {
      showToast: {
        text: `Smoke ok: ${target.kind} by ${
          target.authorName ?? 'unknown author'
        }; Redis ${redisResult.ok ? 'read/write passed' : 'read/write failed'}.`,
        appearance: redisResult.ok ? 'success' : 'neutral',
      },
    },
    200
  );
});

forms.post('/dashboard-launch-submit', async (c) => {
  await c.req.json().catch(() => undefined);

  const subredditName =
    context.subredditName ?? (await reddit.getCurrentSubreddit()).name;
  const post = await reddit.submitCustomPost({
    subredditName,
    title: 'ModMirror policy dashboard',
    entry: 'default',
    textFallback: {
      text: 'Open this post in Reddit to use the ModMirror policy dashboard.',
    },
  });

  const url = post.permalink.startsWith('http')
    ? post.permalink
    : `https://www.reddit.com${post.permalink}`;

  return c.json<UiResponse>(
    {
      navigateTo: url,
      showToast: {
        text: 'Opening ModMirror dashboard',
        appearance: 'success',
      },
    },
    200
  );
});
