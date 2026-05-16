import { Hono } from 'hono';
import { context } from '@devvit/web/server';
import { runRedditSmoke, runRedisSmoke } from '../core/smoke';
import { APP_NAME, type HealthResponse } from '../shared/status';
import { DEMO_SUBREDDIT_NAME } from '../shared/constants';
import type {
  ActionEvent,
  ApiResponse,
  DriftCandidate,
  MirrorScan,
  OverrideEvent,
  OverrideSummary,
  PolicyCreateInput,
  PolicyUpdateInput,
  RulePolicy,
} from '../shared/schema';
import { runMirrorScan } from '../server/services/mirrorScan';
import {
  createPolicy,
  createPolicyFromDriftCandidate,
  getPolicyById,
  listPolicies,
  updatePolicy,
} from '../server/services/policies';
import {
  buildOverrideSummary,
  listRecentActionEvents,
  listRecentAuditEvents,
} from '../server/services/audit';

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

api.get('/policies', async (c) => {
  const subreddit = getCurrentSubreddit();

  try {
    const response: ApiResponse<RulePolicy[]> = {
      ok: true,
      data: await listPolicies(subreddit),
    };
    return c.json(response);
  } catch (error) {
    return c.json(policyError(error), 500);
  }
});

api.post('/policies', async (c) => {
  const body = (await c.req.json().catch(() => ({}))) as Partial<PolicyCreateInput>;

  try {
    const input: PolicyCreateInput = {
      subreddit: body.subreddit ?? getCurrentSubreddit(),
      createdBy: body.createdBy ?? context.username ?? 'unknown',
      ruleKey: body.ruleKey ?? '',
      ruleName: body.ruleName ?? '',
      steps: body.steps ?? [],
      defaultMessageMode: body.defaultMessageMode ?? 'log_only',
      active: body.active ?? true,
    };
    if (body.rulePriority !== undefined) {
      input.rulePriority = body.rulePriority;
    }
    if (body.ruleKind !== undefined) {
      input.ruleKind = body.ruleKind;
    }

    const response: ApiResponse<RulePolicy> = {
      ok: true,
      data: await createPolicy(input),
    };
    return c.json(response, 201);
  } catch (error) {
    return c.json(policyError(error), 400);
  }
});

api.post('/policies/from-drift', async (c) => {
  const body = (await c.req.json().catch(() => ({}))) as Partial<{
    subreddit: string;
    createdBy: string;
    driftCandidate: DriftCandidate;
  }>;

  if (!body.driftCandidate) {
    return c.json(
      {
        ok: false,
        error: {
          code: 'policy_validation_failed',
          message: 'driftCandidate is required',
        },
      } satisfies ApiResponse<RulePolicy>,
      400
    );
  }

  try {
    const response: ApiResponse<RulePolicy> = {
      ok: true,
      data: await createPolicyFromDriftCandidate({
        subreddit: body.subreddit ?? getCurrentSubreddit(),
        createdBy: body.createdBy ?? context.username ?? 'unknown',
        driftCandidate: body.driftCandidate,
      }),
    };
    return c.json(response, 201);
  } catch (error) {
    return c.json(policyError(error), 400);
  }
});

api.get('/policies/:id', async (c) => {
  const policy = await getPolicyById(getCurrentSubreddit(), c.req.param('id'));
  if (!policy) {
    return c.json(
      {
        ok: false,
        error: {
          code: 'policy_not_found',
          message: 'Policy was not found for this subreddit.',
        },
      } satisfies ApiResponse<RulePolicy>,
      404
    );
  }

  return c.json({
    ok: true,
    data: policy,
  } satisfies ApiResponse<RulePolicy>);
});

api.put('/policies/:id', async (c) => {
  const body = (await c.req.json().catch(() => ({}))) as PolicyUpdateInput;

  try {
    const policy = await updatePolicy(
      getCurrentSubreddit(),
      c.req.param('id'),
      body
    );
    if (!policy) {
      return c.json(
        {
          ok: false,
          error: {
            code: 'policy_not_found',
            message: 'Policy was not found for this subreddit.',
          },
        } satisfies ApiResponse<RulePolicy>,
        404
      );
    }

    return c.json({
      ok: true,
      data: policy,
    } satisfies ApiResponse<RulePolicy>);
  } catch (error) {
    return c.json(policyError(error), 400);
  }
});

api.get('/actions', async (c) => {
  const response: ApiResponse<ActionEvent[]> = {
    ok: true,
    data: await listRecentActionEvents(getCurrentSubreddit()),
  };
  return c.json(response);
});

api.get('/overrides', async (c) => {
  const response: ApiResponse<OverrideEvent[]> = {
    ok: true,
    data: await listRecentAuditEvents(getCurrentSubreddit()),
  };
  return c.json(response);
});

api.get('/overrides/summary', async (c) => {
  const events = await listRecentAuditEvents(getCurrentSubreddit(), 100);
  const response: ApiResponse<OverrideSummary> = {
    ok: true,
    data: buildOverrideSummary(events),
  };
  return c.json(response);
});

function getCurrentSubreddit(): string {
  return context.subredditName ?? DEMO_SUBREDDIT_NAME;
}

function policyError(error: unknown): ApiResponse<RulePolicy> {
  return {
    ok: false,
    error: {
      code: 'policy_validation_failed',
      message: error instanceof Error ? error.message : 'Policy request failed',
    },
  };
}
