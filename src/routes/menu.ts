import { Hono } from 'hono';
import { context, reddit } from '@devvit/web/server';
import type { MenuItemRequest, UiResponse } from '@devvit/web/shared';
import type { FormField } from '@devvit/shared-types/shared/form.js';

export const menu = new Hono();

const buildSmokeFields = (targetId: string, location: string): FormField[] => [
  {
    name: 'targetId',
    label: 'Target ID',
    type: 'string',
    helpText: 'Auto-filled from the selected item.',
    required: true,
    defaultValue: targetId,
  },
  {
    name: 'location',
    label: 'Menu location',
    type: 'string',
    required: true,
    defaultValue: location,
    disabled: true,
  },
];

const buildSmokeForm = (title: string, request: MenuItemRequest) => ({
  fields: buildSmokeFields(request.targetId, request.location),
  title,
  acceptLabel: 'Continue',
  cancelLabel: 'Cancel',
});

menu.post('/smoke-comment', async (c) => {
  const request = await c.req.json<MenuItemRequest>();
  return c.json<UiResponse>(
    {
      showForm: {
        name: 'smokeTarget',
        form: buildSmokeForm('ModMirror Comment Smoke Test', request),
      },
    },
    200
  );
});

menu.post('/smoke-post', async (c) => {
  const request = await c.req.json<MenuItemRequest>();
  return c.json<UiResponse>(
    {
      showForm: {
        name: 'smokeTarget',
        form: buildSmokeForm('ModMirror Post Smoke Test', request),
      },
    },
    200
  );
});

menu.post('/open-dashboard', async (c) => {
  await c.req.json<MenuItemRequest>().catch(() => undefined);

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
