import { Hono } from 'hono';
import type { Context } from 'hono';
import type { MenuItemRequest, UiResponse } from '@devvit/web/shared';
import type { FormField } from '@devvit/shared-types/shared/form.js';
import type { ModerationTargetContext } from '../shared/schema';
import { resolveModerationTargetContext } from '../server/services/targetContext';

export const menu = new Hono();

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

const buildApplyPolicyFields = (
  target: ModerationTargetContext
): FormField[] => [
  {
    name: 'targetThingId',
    label: 'Target thing ID',
    type: 'string',
    required: true,
    defaultValue: target.targetThingId,
    helpText: 'ModMirror will re-check this target before any future action.',
  },
  {
    name: 'targetType',
    label: 'Target type',
    type: 'string',
    defaultValue: target.targetType,
    disabled: true,
  },
  {
    name: 'targetAuthor',
    label: 'Target author',
    type: 'string',
    defaultValue: target.authorName ?? '',
  },
  {
    name: 'subreddit',
    label: 'Subreddit',
    type: 'string',
    defaultValue: target.subreddit ?? '',
  },
  {
    name: 'targetSummary',
    label: 'Resolved target',
    type: 'paragraph',
    defaultValue: summarizeTarget(target),
    disabled: true,
  },
  {
    name: 'safetyNote',
    label: 'Safety note',
    type: 'paragraph',
    defaultValue:
      'This opens ModMirror policy guidance for the selected item. No Reddit moderation action will be performed from this form.',
    disabled: true,
  },
];

const buildApplyPolicyForm = (target: ModerationTargetContext) => ({
  title: 'Apply ModMirror Policy',
  description:
    'Review the selected target, then open ModMirror to choose a team policy.',
  fields: buildApplyPolicyFields(target),
  acceptLabel: 'Open policy dashboard',
  cancelLabel: 'Cancel',
});

menu.post('/apply-policy-comment', async (c) => {
  const request = await c.req.json<MenuItemRequest>();
  return showApplyPolicyForm(c, request);
});

menu.post('/apply-policy-post', async (c) => {
  const request = await c.req.json<MenuItemRequest>();
  return showApplyPolicyForm(c, request);
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

async function showApplyPolicyForm(
  c: Context,
  request: MenuItemRequest
) {
  try {
    const target = await resolveModerationTargetContext(request.targetId);
    if (target.targetType === 'unknown') {
      return c.json<UiResponse>(
        {
          showToast: {
            text: target.warnings[0] ?? 'ModMirror does not support this target type.',
            appearance: 'neutral',
          },
        },
        200
      );
    }
    return c.json<UiResponse>(
      {
        showForm: {
          name: 'applyPolicyTarget',
          form: buildApplyPolicyForm(target),
        },
      },
      200
    );
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
}

function summarizeTarget(target: ModerationTargetContext): string {
  const lines = [
    `${target.targetType} ${target.targetThingId}`,
    target.authorName ? `Author: ${target.authorName}` : 'Author unavailable',
  ];
  if (target.title) {
    lines.push(`Title: ${target.title}`);
  }
  if (target.body) {
    lines.push(`Body: ${target.body}`);
  }
  if (target.permalink) {
    lines.push(`Permalink: ${target.permalink}`);
  }
  if (target.warnings.length > 0) {
    lines.push(`Warnings: ${target.warnings.join(' ')}`);
  }
  return lines.join('\n');
}

function formatError(error: unknown): string {
  return error instanceof Error ? error.message : 'unknown error';
}
