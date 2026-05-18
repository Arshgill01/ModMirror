import { Hono } from 'hono';
import { context, reddit } from '@devvit/web/server';
import type { UiResponse } from '@devvit/web/shared';
import type { ModerationTargetContext } from '../shared/schema';
import { resolveModerationTargetContext } from '../server/services/targetContext';

type ApplyPolicyTargetFormValues = {
  targetThingId?: string;
  targetAuthor?: string;
  subreddit?: string;
};

export const forms = new Hono();

forms.post('/dashboard-launch-submit', async (c) => {
  await c.req.json().catch(() => undefined);

  return c.json<UiResponse>(await createDashboardNavigation(), 200);
});

forms.post('/apply-policy-target-submit', async (c) => {
  const values = await c.req.json<ApplyPolicyTargetFormValues>();
  const targetThingId = values.targetThingId?.trim();
  if (!targetThingId) {
    return c.json<UiResponse>(
      {
        showToast: {
          text: 'ModMirror could not open policy guidance: missing target ID.',
          appearance: 'neutral',
        },
      },
      200
    );
  }

  try {
    const target = await resolveModerationTargetContext(targetThingId);
    const navigationOptions: Parameters<typeof createDashboardNavigation>[0] = {
      target,
    };
    const fallbackTargetAuthor = normalizeOptionalString(values.targetAuthor);
    const fallbackSubreddit = normalizeOptionalString(values.subreddit);
    if (fallbackTargetAuthor !== undefined) {
      navigationOptions.fallbackTargetAuthor = fallbackTargetAuthor;
    }
    if (fallbackSubreddit !== undefined) {
      navigationOptions.fallbackSubreddit = fallbackSubreddit;
    }

    return c.json<UiResponse>(await createDashboardNavigation(navigationOptions), 200);
  } catch (error) {
    return c.json<UiResponse>(
      {
        showToast: {
          text: `ModMirror could not resolve this target: ${formatError(error)}`,
          appearance: 'neutral',
        },
      },
      200
    );
  }
});

async function createDashboardNavigation(options?: {
  target?: ModerationTargetContext;
  fallbackTargetAuthor?: string;
  fallbackSubreddit?: string;
}): Promise<UiResponse> {
  const subredditName =
    options?.target?.subreddit ??
    normalizeOptionalString(options?.fallbackSubreddit) ??
    context.subredditName ??
    (await reddit.getCurrentSubreddit()).name;
  const post = await reddit.submitCustomPost({
    subredditName,
    title: options?.target
      ? `ModMirror policy guidance for ${options.target.targetType}`
      : 'ModMirror policy dashboard',
    entry: 'default',
    textFallback: {
      text: 'Open this post in Reddit to use the ModMirror policy dashboard.',
    },
  });

  return {
    navigateTo: buildDashboardUrl(post.permalink, options),
    showToast: {
      text: options?.target
        ? 'Opening ModMirror policy guidance'
        : 'Opening ModMirror dashboard',
      appearance: 'success',
    },
  };
}

function buildDashboardUrl(
  permalink: string,
  options?: {
    target?: ModerationTargetContext;
    fallbackTargetAuthor?: string;
  }
): string {
  const url = permalink.startsWith('http')
    ? permalink
    : `https://www.reddit.com${permalink}`;
  const target = options?.target;
  if (!target) {
    return url;
  }

  const params = new URLSearchParams({
    targetThingId: target.targetThingId,
    targetType: target.targetType,
  });
  const targetAuthor =
    target.authorName ?? normalizeOptionalString(options?.fallbackTargetAuthor);
  if (targetAuthor !== undefined) {
    params.set('targetAuthor', targetAuthor);
  }
  if (target.subreddit !== undefined) {
    params.set('subreddit', target.subreddit);
  }
  if (target.title !== undefined) {
    params.set('targetTitle', target.title);
  }
  if (target.body !== undefined) {
    params.set('targetBody', target.body);
  }
  if (target.permalink !== undefined) {
    params.set('targetPermalink', target.permalink);
  }

  return `${url}#act?${params.toString()}`;
}

function normalizeOptionalString(value: string | undefined): string | undefined {
  const normalized = value?.trim();
  return normalized ? normalized : undefined;
}

function formatError(error: unknown): string {
  return error instanceof Error ? error.message : 'unknown error';
}
