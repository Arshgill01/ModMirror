import { Hono } from 'hono';
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

const buildDashboardLaunchForm = () => ({
  title: 'Open ModMirror Dashboard',
  fields: [
    {
      name: 'confirmation',
      label: 'Confirmation',
      type: 'paragraph',
      defaultValue:
        'This creates a visible ModMirror dashboard custom post in this subreddit and opens it.',
      disabled: true,
    },
  ] satisfies FormField[],
  acceptLabel: 'Create dashboard post',
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

  return c.json<UiResponse>(
    {
      showForm: {
        name: 'dashboardLaunch',
        form: buildDashboardLaunchForm(),
      },
    },
    200
  );
});
