import { Hono } from 'hono';
import { context } from '@devvit/web/server';
import { runRedditSmoke, runRedisSmoke } from '../core/smoke';
import { APP_NAME, type HealthResponse } from '../shared/status';
import { DEMO_SUBREDDIT_NAME } from '../shared/constants';
import type {
  ActionEvent,
  ApplyPolicyConfirmInput,
  ApplyPolicyConfirmResult,
  ApplyPolicyPreview,
  ApplyPolicyPreviewInput,
  ApiResponse,
  DigestCapabilities,
  DigestHistoryResponse,
  DigestSettings,
  GenerateCasePacketRequest,
  GenerateCasePacketResponse,
  GenerateDigestRequest,
  GenerateDigestResponse,
  DriftCandidate,
  MirrorScan,
  OverrideEvent,
  OverrideReviewStatus,
  OverrideReviewUpdateInput,
  OverrideSummary,
  PolicyHealthOverview,
  PolicyHealthSummary,
  PolicyCreateInput,
  PolicyUpdateInput,
  RulePolicy,
} from '../shared/schema';
import { runMirrorScan } from '../server/services/mirrorScan';
import {
  createPolicy,
  createPolicyFromDriftCandidate,
  getPolicyById,
  listPolicyChangeEvents,
  listPolicyVersions,
  listPolicies,
  updatePolicy,
} from '../server/services/policies';
import {
  buildOverrideSummary,
  getOverrideEvent,
  listOverrideEvents,
  listRecentActionEvents,
  listRecentAuditEvents,
  updateOverrideReview,
  validateOverrideReviewStatus,
} from '../server/services/audit';
import { confirmApplyPolicy, previewApplyPolicy } from '../server/services/applyPolicy';
import {
  getPolicyHealthOverview,
  listPolicyHealthSummaries,
} from '../server/services/policyHealth';
import { generateCasePacket } from '../server/services/casePacket';
import {
  generateDigestReport,
  getDigestCapabilities,
  getDigestSettings,
  listDigestHistory,
  updateDigestSettings,
} from '../server/services/digest';

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
  const subreddit = getRequestedSubreddit(c);

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
  const policy = await getPolicyById(
    getRequestedSubreddit(c),
    c.req.param('id')
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
});

api.put('/policies/:id', async (c) => {
  const body = (await c.req.json().catch(() => ({}))) as PolicyUpdateInput;

  try {
    const subreddit = getRequestedSubreddit(c);
    const policy = await updatePolicy(
      subreddit,
      c.req.param('id'),
      {
        ...body,
        updatedBy: body.updatedBy ?? context.username ?? 'unknown',
      }
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

api.get('/policies/:id/versions', async (c) => {
  const subreddit = getRequestedSubreddit(c);
  const policy = await getPolicyById(subreddit, c.req.param('id'));
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
    data: await listPolicyVersions(subreddit, policy.id),
  });
});

api.get('/policies/:id/changes', async (c) => {
  const subreddit = getRequestedSubreddit(c);
  const policy = await getPolicyById(subreddit, c.req.param('id'));
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
    data: await listPolicyChangeEvents(subreddit, policy.id),
  });
});

api.get('/actions', async (c) => {
  const response: ApiResponse<ActionEvent[]> = {
    ok: true,
    data: await listRecentActionEvents(getRequestedSubreddit(c)),
  };
  return c.json(response);
});

api.get('/overrides', async (c) => {
  const status = c.req.query('status');
  const ruleKey = c.req.query('ruleKey');
  if (status !== undefined) {
    try {
      validateOverrideReviewStatus(status);
    } catch (error) {
      return c.json(overrideError(error), 400);
    }
  }

  const options: Parameters<typeof listOverrideEvents>[0] = {
    subreddit: getRequestedSubreddit(c),
  };
  if (status !== undefined) {
    options.status = status as OverrideReviewStatus;
  }
  if (ruleKey !== undefined) {
    options.ruleKey = ruleKey;
  }

  const response: ApiResponse<OverrideEvent[]> = {
    ok: true,
    data: await listOverrideEvents(options),
  };
  return c.json(response);
});

api.get('/overrides/:id', async (c) => {
  const event = await getOverrideEvent(
    getRequestedSubreddit(c),
    c.req.param('id')
  );
  if (!event) {
    return c.json(
      {
        ok: false,
        error: {
          code: 'override_not_found',
          message: 'Override was not found for this subreddit.',
        },
      } satisfies ApiResponse<OverrideEvent>,
      404
    );
  }

  return c.json({
    ok: true,
    data: event,
  } satisfies ApiResponse<OverrideEvent>);
});

api.post('/overrides/:id/review', async (c) => {
  const body = (await c.req.json().catch(() => ({}))) as Partial<OverrideReviewUpdateInput>;

  try {
    if (body.reviewStatus === undefined) {
      throw new Error('reviewStatus is required');
    }
    const input: OverrideReviewUpdateInput = {
      reviewStatus: body.reviewStatus,
      reviewedBy: body.reviewedBy ?? context.username ?? 'unknown',
    };
    if (body.reviewNote !== undefined) {
      input.reviewNote = body.reviewNote;
    }

    const updated = await updateOverrideReview(
      getRequestedSubreddit(c),
      c.req.param('id'),
      input
    );
    if (!updated) {
      return c.json(
        {
          ok: false,
          error: {
            code: 'override_not_found',
            message: 'Override was not found for this subreddit.',
          },
        } satisfies ApiResponse<OverrideEvent>,
        404
      );
    }

    return c.json({
      ok: true,
      data: updated,
    } satisfies ApiResponse<OverrideEvent>);
  } catch (error) {
    return c.json(overrideError(error), 400);
  }
});

api.get('/overrides/summary', async (c) => {
  const events = await listRecentAuditEvents(getRequestedSubreddit(c), 100);
  const response: ApiResponse<OverrideSummary> = {
    ok: true,
    data: buildOverrideSummary(events),
  };
  return c.json(response);
});

api.get('/policy-health', async (c) => {
  const response: ApiResponse<PolicyHealthOverview> = {
    ok: true,
    data: await getPolicyHealthOverview(getRequestedSubreddit(c)),
  };
  return c.json(response);
});

api.get('/policies/:id/health', async (c) => {
  const summaries = await listPolicyHealthSummaries(getRequestedSubreddit(c));
  const summary = summaries.find(
    (item) => item.policyId === c.req.param('id')
  );
  if (!summary) {
    return c.json(
      {
        ok: false,
        error: {
          code: 'policy_health_not_found',
          message: 'Policy health was not found for this subreddit.',
        },
      } satisfies ApiResponse<PolicyHealthSummary>,
      404
    );
  }

  return c.json({
    ok: true,
    data: summary,
  } satisfies ApiResponse<PolicyHealthSummary>);
});

api.post('/case-packet', async (c) => {
  const body = (await c.req.json().catch(() => ({}))) as Partial<GenerateCasePacketRequest> & {
    subreddit?: string;
  };

  try {
    const request = normalizeGenerateCasePacketInput(body);
    const options: Parameters<typeof generateCasePacket>[0] = {
      request,
      subreddit: getRequestedBodySubreddit(body),
    };
    if (context.username !== undefined) {
      options.generatedBy = context.username;
    }
    const response: ApiResponse<GenerateCasePacketResponse> = {
      ok: true,
      data: await generateCasePacket(options),
    };
    return c.json(response);
  } catch (error) {
    return c.json(casePacketError(error), 400);
  }
});

api.post('/digest/generate', async (c) => {
  const body = (await c.req.json().catch(() => ({}))) as Partial<GenerateDigestRequest>;

  try {
    const response: ApiResponse<GenerateDigestResponse> = {
      ok: true,
      data: await generateDigestReport({
        subreddit: getRequestedBodySubreddit(body),
        generatedBy: context.username ?? 'unknown',
        request: {
          ...body,
          source: body.source ?? 'manual',
        },
      }),
    };
    return c.json(response, 201);
  } catch (error) {
    return c.json(digestError(error), 400);
  }
});

api.get('/digest/history', async (c) => {
  const subreddit = getRequestedSubreddit(c);
  const response: ApiResponse<DigestHistoryResponse> = {
    ok: true,
    data: {
      history: await listDigestHistory(subreddit),
      capabilities: getDigestCapabilities(),
      settings: await getDigestSettings(subreddit),
    },
  };
  return c.json(response);
});

api.get('/digest/capabilities', (c) => {
  const response: ApiResponse<DigestCapabilities> = {
    ok: true,
    data: getDigestCapabilities(),
  };
  return c.json(response);
});

api.get('/digest/settings', async (c) => {
  const response: ApiResponse<DigestSettings> = {
    ok: true,
    data: await getDigestSettings(getRequestedSubreddit(c)),
  };
  return c.json(response);
});

api.put('/digest/settings', async (c) => {
  const body = (await c.req.json().catch(() => ({}))) as Partial<DigestSettings>;

  try {
    const input: Parameters<typeof updateDigestSettings>[0] = {
      subreddit: getRequestedBodySubreddit(body),
      updatedBy: context.username ?? 'unknown',
    };
    if (body.deliveryMode !== undefined) {
      input.deliveryMode = body.deliveryMode;
    }
    if (body.scheduleEnabled !== undefined) {
      input.scheduleEnabled = body.scheduleEnabled;
    }
    const response: ApiResponse<DigestSettings> = {
      ok: true,
      data: await updateDigestSettings(input),
    };
    return c.json(response);
  } catch (error) {
    return c.json(digestSettingsError(error), 400);
  }
});

api.post('/apply-policy/preview', async (c) => {
  const body = (await c.req.json().catch(() => ({}))) as Partial<ApplyPolicyPreviewInput>;

  try {
    const input = normalizeApplyPreviewInput(body);
    const response: ApiResponse<ApplyPolicyPreview> = {
      ok: true,
      data: await previewApplyPolicy(input),
    };
    return c.json(response);
  } catch (error) {
    return c.json(applyPolicyError(error), 400);
  }
});

api.post('/apply-policy/confirm', async (c) => {
  const body = (await c.req.json().catch(() => ({}))) as Partial<ApplyPolicyConfirmInput>;

  try {
    const input = normalizeApplyConfirmInput(body);
    const options: Parameters<typeof confirmApplyPolicy>[0] = {
      input,
    };
    if (context.username !== undefined) {
      options.modUsername = context.username;
    }
    const response: ApiResponse<ApplyPolicyConfirmResult> = {
      ok: true,
      data: await confirmApplyPolicy(options),
    };
    return c.json(response, 201);
  } catch (error) {
    return c.json(applyPolicyError(error), 400);
  }
});

function getCurrentSubreddit(): string {
  return context.subredditName ?? DEMO_SUBREDDIT_NAME;
}

function getRequestedSubreddit(c: {
  req: { query: (name: string) => string | undefined };
}): string {
  return normalizeRequestedSubreddit(c.req.query('subreddit'));
}

function getRequestedBodySubreddit(body: { subreddit?: string }): string {
  return normalizeRequestedSubreddit(body.subreddit);
}

function normalizeRequestedSubreddit(subreddit: string | undefined): string {
  if (subreddit === DEMO_SUBREDDIT_NAME) {
    return DEMO_SUBREDDIT_NAME;
  }

  return getCurrentSubreddit();
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

function digestError(error: unknown): ApiResponse<GenerateDigestResponse> {
  return {
    ok: false,
    error: {
      code: 'digest_generation_failed',
      message:
        error instanceof Error ? error.message : 'Digest generation failed',
    },
  };
}

function digestSettingsError(error: unknown): ApiResponse<DigestSettings> {
  return {
    ok: false,
    error: {
      code: 'digest_settings_failed',
      message:
        error instanceof Error ? error.message : 'Digest settings update failed',
    },
  };
}

function normalizeApplyPreviewInput(
  body: Partial<ApplyPolicyPreviewInput>
): ApplyPolicyPreviewInput {
  const input: ApplyPolicyPreviewInput = {
    subreddit: body.subreddit ?? getCurrentSubreddit(),
    ruleKey: body.ruleKey ?? '',
    source: body.source ?? 'simulator',
  };

  if (body.targetThingId !== undefined) {
    input.targetThingId = body.targetThingId;
  }
  if (body.targetType !== undefined) {
    input.targetType = body.targetType;
  }
  if (body.targetAuthor !== undefined) {
    input.targetAuthor = body.targetAuthor;
  }
  if (body.targetTitle !== undefined) {
    input.targetTitle = body.targetTitle;
  }
  if (body.targetBody !== undefined) {
    input.targetBody = body.targetBody;
  }
  if (body.targetPermalink !== undefined) {
    input.targetPermalink = body.targetPermalink;
  }
  if (body.selectedAction !== undefined) {
    input.selectedAction = body.selectedAction;
  }

  return input;
}

function normalizeGenerateCasePacketInput(
  body: Partial<GenerateCasePacketRequest>
): GenerateCasePacketRequest {
  if (!body.subject) {
    throw new Error('subject is required');
  }

  const request: GenerateCasePacketRequest = {
    subject: {
      type: body.subject.type ?? 'demo',
    },
  };

  if (body.subject.actionId !== undefined) {
    request.subject.actionId = body.subject.actionId;
  }
  if (body.subject.username !== undefined) {
    request.subject.username = body.subject.username;
  }
  if (body.subject.ruleKey !== undefined) {
    request.subject.ruleKey = body.subject.ruleKey;
  }
  if (body.subject.targetThingId !== undefined) {
    request.subject.targetThingId = body.subject.targetThingId;
  }
  if (body.timeWindowDays !== undefined) {
    request.timeWindowDays = body.timeWindowDays;
  }
  if (body.maxComparableCases !== undefined) {
    request.maxComparableCases = body.maxComparableCases;
  }

  return request;
}

function normalizeApplyConfirmInput(
  body: Partial<ApplyPolicyConfirmInput>
): ApplyPolicyConfirmInput {
  if (body.selectedAction === undefined) {
    throw new Error('selectedAction is required');
  }

  const input: ApplyPolicyConfirmInput = {
    ...normalizeApplyPreviewInput(body),
    selectedAction: body.selectedAction,
  };

  if (body.overrideReason !== undefined) {
    input.overrideReason = body.overrideReason;
  }
  if (body.overrideNote !== undefined) {
    input.overrideNote = body.overrideNote;
  }

  return input;
}

function applyPolicyError(
  error: unknown
): ApiResponse<ApplyPolicyPreview | ApplyPolicyConfirmResult> {
  return {
    ok: false,
    error: {
      code: 'apply_policy_failed',
      message:
        error instanceof Error ? error.message : 'Apply Policy request failed',
    },
  };
}

function overrideError(error: unknown): ApiResponse<OverrideEvent[]> {
  return {
    ok: false,
    error: {
      code: 'override_review_failed',
      message:
        error instanceof Error ? error.message : 'Override review failed',
    },
  };
}

function casePacketError(
  error: unknown
): ApiResponse<GenerateCasePacketResponse> {
  return {
    ok: false,
    error: {
      code: 'case_packet_failed',
      message:
        error instanceof Error ? error.message : 'Case packet request failed',
    },
  };
}
