import { Hono, type MiddlewareHandler } from 'hono';
import { context, reddit } from '@devvit/web/server';
import { runRedditSmoke, runRedisSmoke } from '../core/smoke';
import { APP_NAME, type HealthResponse } from '../shared/status';
import {
  AI_ADVISORY_EVIDENCE_SOURCE_VALUES,
  AI_ADVISORY_KIND_VALUES,
  CASE_PACKET_TYPE_VALUES,
  CONFIDENCE_VALUES,
  DEMO_SUBREDDIT_NAME,
  EVIDENCE_BOARD_STATUS_VALUES,
  INCIDENT_MODE_REASON_VALUES,
  MIRROR_SCAN_DEPTH_VALUES,
  MODQUEUE_CONTENT_TYPE_VALUES,
  NATIVE_MOD_NOTE_MODE_VALUES,
  PRIVACY_RETENTION_CATEGORY_VALUES,
  TEAM_DELIVERY_CHANNEL_VALUES,
  TEAM_DELIVERY_SUBJECT_TYPE_VALUES,
} from '../shared/constants';
import type {
  ActionEvent,
  ActionReceipt,
  AiAdvisoryCapabilities,
  AiAdvisoryEvidenceInput,
  AiAdvisoryEvidenceSource,
  AiAdvisoryKind,
  AiAdvisoryRequest,
  AiAdvisoryResponse,
  ApplyPolicyConfirmInput,
  ApplyPolicyConfirmResult,
  ApplyPolicyPreview,
  ApplyPolicyPreviewInput,
  ApiResponse,
  AttributionCorrection,
  AttributionCorrectionInput,
  CommunityHealthSummary,
  ConsistencyAnalyticsSummary,
  DigestCapabilities,
  DigestHistoryResponse,
  DigestSettings,
  EvidenceBoardCreateRequest,
  EvidenceBoardListResponse,
  EvidenceBoardSourceRef,
  EvidenceBoardStatus,
  EvidenceBoardStatusUpdateRequest,
  IncidentMode,
  IncidentModeEndRequest,
  IncidentModeReason,
  IncidentModeReport,
  IncidentModeStartRequest,
  IncidentModeStateResponse,
  GenerateCasePacketRequest,
  GenerateCasePacketResponse,
  GenerateDigestRequest,
  GenerateDigestResponse,
  DriftCandidate,
  LastScanMetadata,
  LaunchContextResponse,
  MirrorScan,
  MirrorScanComparison,
  MirrorScanDepth,
  MirrorScanRecord,
  ModeratorAccessDiagnostic,
  ModqueueContentType,
  ModqueueTriageResponse,
  OverrideEvent,
  OverrideReviewStatus,
  OverrideReviewUpdateInput,
  OverrideSummary,
  PolicyAdoptInput,
  PolicyHealthOverview,
  PolicyHealthSummary,
  PolicyCreateInput,
  PolicyProposeInput,
  PolicyImpactMeasurement,
  PolicyReplayActionInput,
  PolicyReplayResult,
  PortableConfigImportRequest,
  PortableConfigImportResult,
  PortableConfigPackage,
  PortableConfigTemplateListResponse,
  PrivacyDeletionRequest,
  PrivacyDeletionResult,
  PrivacyRetentionCategory,
  PrivacyRetentionExport,
  PrivacyRetentionSettings,
  PrivacyRetentionUpdateRequest,
  PolicyReviewInput,
  PolicyUpdateInput,
  RulePolicy,
  TeamDeliveryCapabilities,
  TeamDeliveryChannel,
  TeamDeliveryConfirmRequest,
  TeamDeliveryConfirmResponse,
  TeamDeliveryPreviewRequest,
  TeamDeliverySubjectType,
  RuntimeCapabilityHealthEvent,
  RuntimeCapabilityHealthEventInput,
  RuntimeCapabilityMatrix,
  RuntimeVerificationMatrix,
} from '../shared/schema';
import { runMirrorScan } from '../server/services/mirrorScan';
import { getConsistencyAnalytics } from '../server/services/analytics';
import { getCommunityHealthSummary } from '../server/services/communityHealth';
import { getPolicyImpactMeasurement } from '../server/services/policyImpact';
import {
  compareScanRecords,
  getScanRecord,
  listScanMetadata,
} from '../server/services/scans';
import {
  createPolicy,
  createPolicyFromDriftCandidate,
  addPolicyReview,
  adoptPolicyVersion,
  getPolicyById,
  listPolicyChangeEvents,
  listPolicyVersions,
  listPolicies,
  proposePolicyVersion,
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
  getActionReceipt,
  listActionReceipts,
  listActionReceiptsByTarget,
} from '../server/services/receipts';
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
import {
  generateAiAdvisory,
  getAiAdvisoryCapabilities,
} from '../server/services/aiAdvisory';
import {
  buildTeamDeliveryPreview,
  confirmTeamDelivery,
  getTeamDeliveryCapabilities,
} from '../server/services/teamDelivery';
import { buildRuntimeVerificationMatrix } from '../server/services/runtimeVerification';
import {
  getRuntimeCapabilityMatrix,
  recordRuntimeHealthEvent,
} from '../server/services/runtimeCapabilities';
import { loadModqueueTriage } from '../server/services/modqueueTriage';
import {
  applyAttributionCorrectionsToStoredActions,
  listAttributionCorrections,
  saveAttributionCorrection,
} from '../server/services/attributionCalibration';
import { runPolicyReplay, toPolicyReplayActions } from '../server/services/replaySandbox';
import {
  createEvidenceBoard,
  listEvidenceBoards,
  updateEvidenceBoardStatus,
} from '../server/services/evidenceBoard';
import {
  endIncidentMode,
  getIncidentModeState,
  startIncidentMode,
} from '../server/services/incidentMode';
import {
  exportPortableConfig,
  getPortableConfigTemplates,
  importPortableConfig,
} from '../server/services/configPortability';
import {
  deletePrivacyData,
  exportPrivacyRetentionInventory,
  getPrivacyRetentionSettings,
  updatePrivacyRetentionSettings,
} from '../server/services/privacyRetention';
import { readApplyPolicyLaunchContext } from '../server/services/targetContext';
import {
  isSubredditIsolationError,
  resolveLiveSubredditScope,
  resolveSubredditScope,
} from '../server/services/subredditIsolation';
import {
  assertModeratorAccess,
  isModeratorAccessError,
  resolveModeratorVisibilityLevel,
} from '../server/services/moderatorAccess';

export const api = new Hono();

api.onError((error, c) => {
  if (isModeratorAccessError(error)) {
    return c.json(
      {
        ok: false,
        error: {
          code: 'moderator_access_required',
          message: error.message,
        },
      } satisfies ApiResponse<never>,
      403
    );
  }

  if (isSubredditIsolationError(error)) {
    return c.json(
      {
        ok: false,
        error: {
          code: 'subreddit_isolation_failed',
          message: error.message,
        },
      } satisfies ApiResponse<never>,
      403
    );
  }

  return c.json(
    {
      ok: false,
      error: {
        code: 'internal_error',
        message: 'Internal ModMirror API error',
      },
    } satisfies ApiResponse<never>,
    500
  );
});

api.use('*', requireModeratorAccess());

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

api.get('/runtime-verification', (c) => {
  const runtimeContext: RuntimeVerificationMatrix['context'] = {
    appSlug: context.appSlug,
    appVersion: context.appVersion,
    subredditId: context.subredditId,
    subredditName: context.subredditName,
  };
  if (context.username !== undefined) {
    runtimeContext.username = context.username;
  }
  const response: ApiResponse<RuntimeVerificationMatrix> = {
    ok: true,
    data: buildRuntimeVerificationMatrix(runtimeContext),
  };
  return c.json(response);
});

api.get('/launch-context', (c) => {
  const response: ApiResponse<LaunchContextResponse> = {
    ok: true,
    data: readApplyPolicyLaunchContext(context.postData),
  };
  return c.json(response);
});

api.get('/runtime-capabilities', async (c) => {
  const response: ApiResponse<RuntimeCapabilityMatrix> = {
    ok: true,
    data: await getRuntimeCapabilityMatrix(getRequestedSubreddit(c)),
  };
  return c.json(response);
});

api.get('/access/diagnostics', async (c) => {
  const access = await assertModeratorAccess({
    currentSubreddit: context.subredditName,
    contextUsername: context.username,
    getCurrentUser: () => reddit.getCurrentUser(),
  });
  const diagnostic: ModeratorAccessDiagnostic = {
    evidence: access.evidence,
    permissionCount: access.permissions?.length ?? 0,
    permissions: access.permissions ?? [],
    moderatorVisibilityLevel: resolveModeratorVisibilityLevel(
      access.permissions
    ),
    source: 'current_user_permissions',
  };
  if (access.subreddit !== undefined) {
    diagnostic.subreddit = access.subreddit;
  }
  if (access.username !== undefined) {
    diagnostic.username = access.username;
  }
  const response: ApiResponse<ModeratorAccessDiagnostic> = {
    ok: true,
    data: diagnostic,
  };
  return c.json(response);
});

api.post('/runtime-capabilities/events', async (c) => {
  const body = (await c.req.json().catch(() => ({}))) as Partial<RuntimeCapabilityHealthEventInput>;

  try {
    const event = await recordRuntimeHealthEvent(
      normalizeRuntimeHealthEventInput(body)
    );
    const response: ApiResponse<RuntimeCapabilityHealthEvent> = {
      ok: true,
      data: event,
    };
    return c.json(response, 201);
  } catch (error) {
    return c.json(runtimeCapabilityError(error), 400);
  }
});

api.get('/modqueue/triage', async (c) => {
  const subreddit = getRequestedLiveSubreddit(c);
  const type = normalizeModqueueContentType(c.req.query('type'));
  const limit = normalizeModqueueLimit(c.req.query('limit'));
  const triageOptions: Parameters<typeof loadModqueueTriage>[0] = {
    type,
    limit,
    dependencies: {
      fetchQueueItems: async (options) => {
        const subredditClient = await reddit.getSubredditByName(options.subreddit);
        if (options.type === 'post') {
          return subredditClient
            .getModQueue({ type: 'post', limit: options.limit })
            .all();
        }
        if (options.type === 'comment') {
          return subredditClient
            .getModQueue({ type: 'comment', limit: options.limit })
            .all();
        }
        return subredditClient
          .getModQueue({ type: 'all', limit: options.limit })
          .all();
      },
      listPolicies,
      listRecentActions: listRecentActionEvents,
    },
  };
  if (subreddit !== undefined) {
    triageOptions.subreddit = subreddit;
  }

  const response: ApiResponse<ModqueueTriageResponse> = {
    ok: true,
    data: await loadModqueueTriage(triageOptions),
  };
  return c.json(response);
});

api.post('/smoke/redis', async (c) => {
  const subreddit = getRequestedSubreddit(c);
  try {
    const result = await runRedisSmoke();
    await recordRuntimeHealthEvent({
      subreddit,
      capabilityId: 'redis-smoke',
      status: result.ok ? 'passed' : 'failed',
      source: 'smoke_route',
      message: result.ok
        ? 'Redis smoke write/read matched.'
        : 'Redis smoke write/read did not match.',
      diagnosticRoute: '/api/smoke/redis',
      ...(result.ok ? {} : { errorCode: 'redis_smoke_mismatch' }),
    });
    return c.json(result);
  } catch (error) {
    await recordRuntimeHealthEvent({
      subreddit,
      capabilityId: 'redis-smoke',
      status: 'failed',
      source: 'smoke_route',
      message: 'Redis smoke route threw before returning a result.',
      diagnosticRoute: '/api/smoke/redis',
      errorCode: 'redis_smoke_failed',
      errorMessage: error instanceof Error ? error.message : 'Unknown Redis smoke failure.',
    });
    throw error;
  }
});

api.post('/smoke/reddit', async (c) => {
  const subreddit = getRequestedSubreddit(c);
  try {
    const result = await runRedditSmoke();
    await recordRuntimeHealthEvent({
      subreddit,
      capabilityId: 'reddit-api-smoke',
      status: 'passed',
      source: 'smoke_route',
      message: 'Reddit read-only smoke route completed.',
      diagnosticRoute: '/api/smoke/reddit',
    });
    return c.json(result);
  } catch (error) {
    await recordRuntimeHealthEvent({
      subreddit,
      capabilityId: 'reddit-api-smoke',
      status: 'failed',
      source: 'smoke_route',
      message: 'Reddit read-only smoke route failed.',
      diagnosticRoute: '/api/smoke/reddit',
      errorCode: 'reddit_smoke_failed',
      errorMessage: error instanceof Error ? error.message : 'Unknown Reddit smoke failure.',
    });
    throw error;
  }
});

api.post('/scan', async (c) => {
  const body = (await c.req.json().catch(() => ({}))) as Partial<{
    mode: string;
    depth: string;
  }>;
  const mode: 'live' | 'demo' = body.mode === 'demo' ? 'demo' : 'live';
  const depth = normalizeScanDepth(body.depth);

  try {
    const scanOptions: Parameters<typeof runMirrorScan>[0] = {
      mode,
      depth,
    };
    if (context.username !== undefined) {
      scanOptions.createdBy = context.username;
    }
    const scan = await runMirrorScan(scanOptions);
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

function normalizeScanDepth(depth: string | undefined): MirrorScanDepth {
  if (
    depth !== undefined &&
    MIRROR_SCAN_DEPTH_VALUES.includes(depth as MirrorScanDepth)
  ) {
    return depth as MirrorScanDepth;
  }
  return 'standard';
}

api.get('/scans', async (c) => {
  const source = c.req.query('source');
  const options: Parameters<typeof listScanMetadata>[1] = {};
  if (source === 'live' || source === 'demo') {
    options.source = source;
  }
  const response: ApiResponse<LastScanMetadata[]> = {
    ok: true,
    data: await listScanMetadata(getRequestedSubreddit(c), options),
  };
  return c.json(response);
});

api.get('/scans/compare', async (c) => {
  const left = c.req.query('left');
  const right = c.req.query('right');
  if (left === undefined || right === undefined) {
    return c.json(
      {
        ok: false,
        error: {
          code: 'scan_compare_missing_ids',
          message: 'Both left and right scan IDs are required.',
        },
      } satisfies ApiResponse<MirrorScanComparison>,
      400
    );
  }

  const comparison = await compareScanRecords(
    getRequestedSubreddit(c),
    left,
    right
  );
  if (comparison === undefined) {
    return c.json(
      {
        ok: false,
        error: {
          code: 'scan_compare_not_found',
          message: 'One or both scans were not found for this subreddit.',
        },
      } satisfies ApiResponse<MirrorScanComparison>,
      404
    );
  }

  return c.json({
    ok: true,
    data: comparison,
  } satisfies ApiResponse<MirrorScanComparison>);
});

api.get('/scans/:id', async (c) => {
  const record = await getScanRecord(getRequestedSubreddit(c), c.req.param('id'));
  if (record === undefined) {
    return c.json(
      {
        ok: false,
        error: {
          code: 'scan_not_found',
          message: 'Scan record was not found for this subreddit.',
        },
      } satisfies ApiResponse<MirrorScanRecord>,
      404
    );
  }

  return c.json({
    ok: true,
    data: record,
  } satisfies ApiResponse<MirrorScanRecord>);
});

api.get('/attribution/corrections', async (c) => {
  const response: ApiResponse<AttributionCorrection[]> = {
    ok: true,
    data: await listAttributionCorrections(getRequestedSubreddit(c)),
  };
  return c.json(response);
});

api.post('/attribution/corrections', async (c) => {
  const body = (await c.req.json().catch(() => ({}))) as Partial<
    AttributionCorrectionInput
  >;

  try {
    const input = await normalizeAttributionCorrectionInput(body);
    const response: ApiResponse<AttributionCorrection> = {
      ok: true,
      data: await saveAttributionCorrection(input),
    };
    return c.json(response, 201);
  } catch (error) {
    return c.json(
      {
        ok: false,
        error: {
          code: 'attribution_correction_failed',
          message:
            error instanceof Error
              ? error.message
              : 'Attribution correction failed.',
        },
      } satisfies ApiResponse<AttributionCorrection>,
      400
    );
  }
});

api.get('/analytics/consistency', async (c) => {
  const response: ApiResponse<ConsistencyAnalyticsSummary> = {
    ok: true,
    data: await getConsistencyAnalytics(getRequestedSubreddit(c)),
  };
  return c.json(response);
});

api.get('/community-health', async (c) => {
  const response: ApiResponse<CommunityHealthSummary> = {
    ok: true,
    data: await getCommunityHealthSummary(getRequestedSubreddit(c)),
  };
  return c.json(response);
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
      subreddit: getRequestedBodySubreddit(body),
      createdBy: body.createdBy ?? context.username ?? 'unknown',
      ruleKey: body.ruleKey ?? '',
      ruleName: body.ruleName ?? '',
      steps: body.steps ?? [],
      defaultMessageMode: body.defaultMessageMode ?? 'log_only',
      active: body.active ?? false,
    };
    if (body.ratificationSettings !== undefined) {
      input.ratificationSettings = body.ratificationSettings;
    }
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
        subreddit: getRequestedBodySubreddit(body),
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

api.post('/policies/:id/propose', async (c) => {
  const body = (await c.req.json().catch(() => ({}))) as Partial<PolicyProposeInput>;

  try {
    const subreddit = getRequestedSubreddit(c);
    const input: PolicyProposeInput = {
      proposedBy: body.proposedBy ?? context.username ?? 'unknown',
    };
    if (body.policyVersionId !== undefined) {
      input.policyVersionId = body.policyVersionId;
    }
    if (body.note !== undefined) {
      input.note = body.note;
    }

    const policy = await proposePolicyVersion(
      subreddit,
      c.req.param('id'),
      input
    );
    if (!policy) {
      return c.json(policyNotFoundResponse(), 404);
    }

    return c.json({
      ok: true,
      data: policy,
    } satisfies ApiResponse<RulePolicy>);
  } catch (error) {
    return c.json(policyError(error), 400);
  }
});

api.post('/policies/:id/reviews', async (c) => {
  const body = (await c.req.json().catch(() => ({}))) as Partial<PolicyReviewInput>;

  try {
    const subreddit = getRequestedSubreddit(c);
    const input: PolicyReviewInput = {
      reviewer: body.reviewer ?? context.username ?? 'unknown',
      decision: body.decision ?? 'abstain',
    };
    if (body.policyVersionId !== undefined) {
      input.policyVersionId = body.policyVersionId;
    }
    if (body.note !== undefined) {
      input.note = body.note;
    }

    const policy = await addPolicyReview(subreddit, c.req.param('id'), input);
    if (!policy) {
      return c.json(policyNotFoundResponse(), 404);
    }

    return c.json({
      ok: true,
      data: policy,
    } satisfies ApiResponse<RulePolicy>);
  } catch (error) {
    return c.json(policyError(error), 400);
  }
});

api.post('/policies/:id/adopt', async (c) => {
  const body = (await c.req.json().catch(() => ({}))) as Partial<PolicyAdoptInput>;

  try {
    const subreddit = getRequestedSubreddit(c);
    const input: PolicyAdoptInput = {
      adoptedBy: body.adoptedBy ?? context.username ?? 'unknown',
      quickAdoption: body.quickAdoption ?? false,
    };
    if (body.policyVersionId !== undefined) {
      input.policyVersionId = body.policyVersionId;
    }
    if (body.note !== undefined) {
      input.note = body.note;
    }

    const policy = await adoptPolicyVersion(subreddit, c.req.param('id'), input);
    if (!policy) {
      return c.json(policyNotFoundResponse(), 404);
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

api.post('/policies/:id/replay', async (c) => {
  const body = (await c.req.json().catch(() => ({}))) as Partial<{
    scanId: string;
    source: 'scan' | 'synthetic';
    actions: PolicyReplayActionInput[];
  }>;
  const subreddit = getRequestedSubreddit(c);
  const policy = await getPolicyById(subreddit, c.req.param('id'));
  if (!policy) {
    return c.json(policyNotFoundResponse(), 404);
  }

  try {
    const scanRecord =
      body.scanId === undefined
        ? undefined
        : await getScanRecord(subreddit, body.scanId);
    if (body.scanId !== undefined && scanRecord === undefined) {
      return c.json(
        {
          ok: false,
          error: {
            code: 'scan_not_found',
            message: 'Scan record was not found for replay.',
          },
        } satisfies ApiResponse<PolicyReplayResult>,
        404
      );
    }

    const actions =
      scanRecord === undefined
        ? normalizeReplayActions(body.actions)
        : toPolicyReplayActions(
            applyAttributionCorrectionsToStoredActions(
              scanRecord.attributedActions,
              await listAttributionCorrections(subreddit)
            )
          );
    if (actions.length === 0) {
      return c.json(
        {
          ok: false,
          error: {
            code: 'replay_actions_required',
            message:
              'Policy replay requires a scanId or supplied synthetic actions.',
          },
        } satisfies ApiResponse<PolicyReplayResult>,
        400
      );
    }

    const replayInput = {
      subreddit,
      policy,
      source: scanRecord === undefined ? (body.source ?? 'synthetic') : 'scan',
      actions,
    };
    if (scanRecord !== undefined) {
      Object.assign(replayInput, { scanId: scanRecord.id });
    }

    return c.json({
      ok: true,
      data: runPolicyReplay(replayInput),
    } satisfies ApiResponse<PolicyReplayResult>);
  } catch (error) {
    return c.json(policyError(error), 400);
  }
});

api.get('/policies/:id/impact', async (c) => {
  const subreddit = getRequestedSubreddit(c);
  const policy = await getPolicyById(subreddit, c.req.param('id'));
  if (!policy) {
    return c.json(policyNotFoundResponse(), 404);
  }

  return c.json({
    ok: true,
    data: await getPolicyImpactMeasurement({ subreddit, policy }),
  } satisfies ApiResponse<PolicyImpactMeasurement>);
});

api.get('/actions', async (c) => {
  const response: ApiResponse<ActionEvent[]> = {
    ok: true,
    data: await listRecentActionEvents(getRequestedSubreddit(c)),
  };
  return c.json(response);
});

api.get('/receipts', async (c) => {
  const response: ApiResponse<ActionReceipt[]> = {
    ok: true,
    data: await listActionReceipts(getRequestedSubreddit(c)),
  };
  return c.json(response);
});

api.get('/receipts/target/:targetThingId', async (c) => {
  const response: ApiResponse<ActionReceipt[]> = {
    ok: true,
    data: await listActionReceiptsByTarget(
      getRequestedSubreddit(c),
      c.req.param('targetThingId')
    ),
  };
  return c.json(response);
});

api.get('/receipts/:id', async (c) => {
  const subreddit = getRequestedSubreddit(c);
  const receipt = await getActionReceipt(subreddit, c.req.param('id'));
  if (receipt === undefined) {
    return c.json(
      {
        ok: false,
        error: {
          code: 'receipt_not_found',
          message: 'Action receipt was not found for this subreddit.',
        },
      } satisfies ApiResponse<ActionReceipt>,
      404
    );
  }

  return c.json({
    ok: true,
    data: receipt,
  } satisfies ApiResponse<ActionReceipt>);
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

api.get('/evidence-boards', async (c) => {
  const response: ApiResponse<EvidenceBoardListResponse> = {
    ok: true,
    data: {
      boards: await listEvidenceBoards(getRequestedSubreddit(c)),
    },
  };
  return c.json(response);
});

api.post('/evidence-boards', async (c) => {
  const body = (await c.req.json().catch(() => ({}))) as Partial<EvidenceBoardCreateRequest>;

  try {
    const response: ApiResponse<EvidenceBoardListResponse['boards'][number]> = {
      ok: true,
      data: await createEvidenceBoard({
        request: normalizeEvidenceBoardCreateRequest(body),
        subreddit: getRequestedBodySubreddit(body),
        createdBy: context.username ?? 'unknown',
      }),
    };
    return c.json(response, 201);
  } catch (error) {
    return c.json(evidenceBoardError(error), 400);
  }
});

api.post('/evidence-boards/:id/status', async (c) => {
  const body = (await c.req.json().catch(() => ({}))) as Partial<EvidenceBoardStatusUpdateRequest> & {
    subreddit?: string;
  };

  try {
    const board = await updateEvidenceBoardStatus({
      subreddit: getRequestedBodySubreddit(body),
      boardId: c.req.param('id'),
      request: normalizeEvidenceBoardStatusUpdateRequest(body),
      changedBy: context.username ?? 'unknown',
    });
    if (board === undefined) {
      return c.json(
        {
          ok: false,
          error: {
            code: 'evidence_board_not_found',
            message: 'Evidence board was not found for this subreddit.',
          },
        } satisfies ApiResponse<EvidenceBoardListResponse['boards'][number]>,
        404
      );
    }
    const response: ApiResponse<EvidenceBoardListResponse['boards'][number]> = {
      ok: true,
      data: board,
    };
    return c.json(response);
  } catch (error) {
    return c.json(evidenceBoardError(error), 400);
  }
});

api.get('/incidents', async (c) => {
  const response: ApiResponse<IncidentModeStateResponse> = {
    ok: true,
    data: await getIncidentModeState(getRequestedSubreddit(c)),
  };
  return c.json(response);
});

api.post('/incidents/start', async (c) => {
  const body = (await c.req.json().catch(() => ({}))) as Partial<IncidentModeStartRequest>;

  try {
    const response: ApiResponse<IncidentMode> = {
      ok: true,
      data: await startIncidentMode({
        subreddit: getRequestedBodySubreddit(body),
        request: normalizeIncidentModeStartRequest(body),
        startedBy: context.username ?? 'unknown',
      }),
    };
    return c.json(response, 201);
  } catch (error) {
    return c.json(incidentModeError(error), 400);
  }
});

api.post('/incidents/:id/end', async (c) => {
  const body = (await c.req.json().catch(() => ({}))) as Partial<IncidentModeEndRequest>;

  try {
    const report = await endIncidentMode({
      subreddit: getRequestedBodySubreddit(body),
      incidentId: c.req.param('id'),
      request: normalizeIncidentModeEndRequest(body),
      endedBy: context.username ?? 'unknown',
    });
    if (report === undefined) {
      return c.json(
        {
          ok: false,
          error: {
            code: 'incident_not_found',
            message: 'Incident was not found for this subreddit.',
          },
        } satisfies ApiResponse<IncidentModeReport>,
        404
      );
    }
    const response: ApiResponse<IncidentModeReport> = {
      ok: true,
      data: report,
    };
    return c.json(response);
  } catch (error) {
    return c.json(incidentModeError(error), 400);
  }
});

api.get('/config/export', async (c) => {
  const response: ApiResponse<PortableConfigPackage> = {
    ok: true,
    data: await exportPortableConfig({
      subreddit: getRequestedSubreddit(c),
      exportedBy: context.username ?? 'unknown',
    }),
  };
  return c.json(response);
});

api.get('/config/templates', (c) => {
  const response: ApiResponse<PortableConfigTemplateListResponse> = {
    ok: true,
    data: getPortableConfigTemplates(),
  };
  return c.json(response);
});

api.post('/config/import', async (c) => {
  const body = (await c.req.json().catch(() => ({}))) as Partial<PortableConfigImportRequest>;

  try {
    const response: ApiResponse<PortableConfigImportResult> = {
      ok: true,
      data: await importPortableConfig({
        subreddit: getRequestedBodySubreddit(body),
        importedBy: context.username ?? 'unknown',
        request: normalizePortableConfigImportRequest(body),
      }),
    };
    return c.json(response);
  } catch (error) {
    return c.json(configPortabilityError(error), 400);
  }
});

api.get('/privacy/retention', async (c) => {
  const response: ApiResponse<PrivacyRetentionSettings> = {
    ok: true,
    data: await getPrivacyRetentionSettings(getRequestedSubreddit(c)),
  };
  return c.json(response);
});

api.put('/privacy/retention', async (c) => {
  const body = (await c.req.json().catch(() => ({}))) as Partial<PrivacyRetentionUpdateRequest>;

  try {
    const response: ApiResponse<PrivacyRetentionSettings> = {
      ok: true,
      data: await updatePrivacyRetentionSettings({
        subreddit: getRequestedBodySubreddit(body),
        updatedBy: context.username ?? 'unknown',
        request: normalizePrivacyRetentionUpdateRequest(body),
      }),
    };
    return c.json(response);
  } catch (error) {
    return c.json(privacyRetentionError(error), 400);
  }
});

api.get('/privacy/export', async (c) => {
  const response: ApiResponse<PrivacyRetentionExport> = {
    ok: true,
    data: await exportPrivacyRetentionInventory({
      subreddit: getRequestedSubreddit(c),
    }),
  };
  return c.json(response);
});

api.post('/privacy/delete', async (c) => {
  const body = (await c.req.json().catch(() => ({}))) as Partial<PrivacyDeletionRequest>;

  try {
    const response: ApiResponse<PrivacyDeletionResult> = {
      ok: true,
      data: await deletePrivacyData({
        subreddit: getRequestedBodySubreddit(body),
        request: normalizePrivacyDeletionRequest(body),
      }),
    };
    return c.json(response);
  } catch (error) {
    return c.json(privacyDeletionError(error), 400);
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

api.get('/delivery/capabilities', (c) => {
  const response: ApiResponse<TeamDeliveryCapabilities> = {
    ok: true,
    data: getTeamDeliveryCapabilities(),
  };
  return c.json(response);
});

api.post('/delivery/preview', async (c) => {
  const body = (await c.req.json().catch(() => ({}))) as Partial<TeamDeliveryPreviewRequest>;

  try {
    const response = {
      ok: true,
      data: buildTeamDeliveryPreview({
        request: normalizeTeamDeliveryPreviewRequest(body),
        subreddit: getRequestedBodySubreddit(body),
      }),
    } satisfies ApiResponse<ReturnType<typeof buildTeamDeliveryPreview>>;
    return c.json(response);
  } catch (error) {
    return c.json(teamDeliveryError(error), 400);
  }
});

api.post('/delivery/confirm', async (c) => {
  const body = (await c.req.json().catch(() => ({}))) as Partial<TeamDeliveryConfirmRequest>;

  try {
    const response: ApiResponse<TeamDeliveryConfirmResponse> = {
      ok: true,
      data: await confirmTeamDelivery({
        request: normalizeTeamDeliveryConfirmRequest(body),
        subreddit: getRequestedBodySubreddit(body),
        requestedBy: context.username ?? 'unknown',
      }),
    };
    return c.json(response, 201);
  } catch (error) {
    return c.json(teamDeliveryError(error), 400);
  }
});

api.get('/ai/capabilities', (c) => {
  const response: ApiResponse<AiAdvisoryCapabilities> = {
    ok: true,
    data: getAiAdvisoryCapabilities(),
  };
  return c.json(response);
});

api.post('/ai/advisory', async (c) => {
  const body = (await c.req.json().catch(() => ({}))) as Partial<AiAdvisoryRequest>;

  try {
    const response: ApiResponse<AiAdvisoryResponse> = {
      ok: true,
      data: await generateAiAdvisory({
        request: normalizeAiAdvisoryRequest(body),
      }),
    };
    return c.json(response);
  } catch (error) {
    const response: ApiResponse<AiAdvisoryResponse> = {
      ok: false,
      error: {
        code: 'ai_advisory_failed',
        message:
          error instanceof Error ? error.message : 'AI advisory request failed',
      },
    };
    return c.json(response, 400);
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

function getRequestedLiveSubreddit(c: {
  req: { query: (name: string) => string | undefined };
}): string | undefined {
  return resolveLiveSubredditScope({
    requestedSubreddit: c.req.query('subreddit'),
    currentSubreddit: context.subredditName,
  });
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
  return resolveSubredditScope({
    requestedSubreddit: subreddit,
    currentSubreddit: context.subredditName,
    demoSubreddit: DEMO_SUBREDDIT_NAME,
  });
}

function normalizeModqueueContentType(
  value: string | undefined
): ModqueueContentType {
  return MODQUEUE_CONTENT_TYPE_VALUES.includes(value as ModqueueContentType)
    ? (value as ModqueueContentType)
    : 'all';
}

function normalizeModqueueLimit(value: string | undefined): number {
  const limit = Number(value);
  if (!Number.isFinite(limit)) {
    return 25;
  }
  return Math.min(Math.max(Math.floor(limit), 1), 50);
}

function normalizeRuntimeHealthEventInput(
  body: Partial<RuntimeCapabilityHealthEventInput>
): RuntimeCapabilityHealthEventInput {
  if (typeof body.capabilityId !== 'string' || body.capabilityId.length === 0) {
    throw new Error('capabilityId is required.');
  }
  if (!isRuntimeHealthStatus(body.status)) {
    throw new Error('status must be passed, failed, or skipped.');
  }
  if (!isRuntimeHealthSource(body.source)) {
    throw new Error('source is invalid.');
  }
  if (typeof body.message !== 'string' || body.message.length === 0) {
    throw new Error('message is required.');
  }

  const input: RuntimeCapabilityHealthEventInput = {
    subreddit: getRequestedBodySubreddit(body),
    capabilityId: body.capabilityId,
    status: body.status,
    source: body.source,
    message: body.message,
  };
  if (body.diagnosticRoute !== undefined) {
    input.diagnosticRoute = body.diagnosticRoute;
  }
  if (body.errorCode !== undefined) {
    input.errorCode = body.errorCode;
  }
  if (body.errorMessage !== undefined) {
    input.errorMessage = body.errorMessage;
  }
  if (body.observedAt !== undefined) {
    input.observedAt = body.observedAt;
  }
  return input;
}

function isRuntimeHealthStatus(
  value: RuntimeCapabilityHealthEventInput['status'] | undefined
): value is RuntimeCapabilityHealthEventInput['status'] {
  return value === 'passed' || value === 'failed' || value === 'skipped';
}

function isRuntimeHealthSource(
  value: RuntimeCapabilityHealthEventInput['source'] | undefined
): value is RuntimeCapabilityHealthEventInput['source'] {
  return (
    value === 'smoke_route' ||
    value === 'playtest' ||
    value === 'manual_qa' ||
    value === 'unit_test' ||
    value === 'system'
  );
}

function normalizeReplayActions(
  actions: PolicyReplayActionInput[] | undefined
): PolicyReplayActionInput[] {
  if (!Array.isArray(actions)) {
    return [];
  }

  return actions
    .filter(
      (action) =>
        typeof action.id === 'string' &&
        typeof action.subreddit === 'string' &&
        typeof action.rawActionType === 'string' &&
        typeof action.createdAt === 'string'
    )
    .map((action) => ({
      ...action,
      evidence: Array.isArray(action.evidence) ? action.evidence : [],
    }));
}

async function normalizeAttributionCorrectionInput(
  body: Partial<AttributionCorrectionInput>
): Promise<AttributionCorrectionInput> {
  const subreddit = getRequestedBodySubreddit(body);
  const actionId = body.actionId?.trim();
  const correctedRuleKey = body.correctedRuleKey?.trim();
  if (!actionId) {
    throw new Error('actionId is required');
  }
  if (!correctedRuleKey) {
    throw new Error('correctedRuleKey is required');
  }

  const scanRecord =
    body.sourceScanId === undefined
      ? undefined
      : await getScanRecord(subreddit, body.sourceScanId);
  const originalAction = scanRecord?.attributedActions.find(
    (action) => action.id === actionId
  );
  const originalConfidence =
    body.originalConfidence !== undefined &&
    CONFIDENCE_VALUES.includes(body.originalConfidence)
      ? body.originalConfidence
      : originalAction?.confidence ?? 'unmatched';

  const input: AttributionCorrectionInput = {
    subreddit,
    actionId,
    originalConfidence,
    correctedRuleKey,
    correctedBy: body.correctedBy ?? context.username ?? 'unknown',
  };

  copyString(body.targetThingId ?? originalAction?.targetThingId, (value) => {
    input.targetThingId = value;
  });
  copyString(body.sourceScanId, (value) => {
    input.sourceScanId = value;
  });
  copyString(body.originalRuleKey ?? originalAction?.inferredRuleKey, (value) => {
    input.originalRuleKey = value;
  });
  copyString(body.originalRuleName ?? originalAction?.inferredRuleName, (value) => {
    input.originalRuleName = value;
  });
  copyString(body.correctedRuleName, (value) => {
    input.correctedRuleName = value;
  });
  copyString(body.note, (value) => {
    input.note = value;
  });

  return input;
}

function copyString(value: string | undefined, assign: (value: string) => void) {
  const trimmed = value?.trim();
  if (trimmed) {
    assign(trimmed);
  }
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

function policyNotFoundResponse(): ApiResponse<RulePolicy> {
  return {
    ok: false,
    error: {
      code: 'policy_not_found',
      message: 'Policy was not found for this subreddit.',
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

function runtimeCapabilityError(
  error: unknown
): ApiResponse<RuntimeCapabilityHealthEvent> {
  return {
    ok: false,
    error: {
      code: 'runtime_capability_event_failed',
      message:
        error instanceof Error
          ? error.message
          : 'Runtime capability event failed',
    },
  };
}

function teamDeliveryError(
  error: unknown
): ApiResponse<TeamDeliveryConfirmResponse> {
  return {
    ok: false,
    error: {
      code: 'team_delivery_failed',
      message:
        error instanceof Error ? error.message : 'Team delivery request failed',
    },
  };
}

function normalizeTeamDeliveryPreviewRequest(
  body: Partial<TeamDeliveryPreviewRequest>
): TeamDeliveryPreviewRequest {
  if (
    body.channel === undefined ||
    !TEAM_DELIVERY_CHANNEL_VALUES.includes(body.channel as TeamDeliveryChannel)
  ) {
    throw new Error('Team delivery channel is required.');
  }
  if (
    body.subjectType === undefined ||
    !TEAM_DELIVERY_SUBJECT_TYPE_VALUES.includes(
      body.subjectType as TeamDeliverySubjectType
    )
  ) {
    throw new Error('Team delivery subject type is required.');
  }
  if (body.title === undefined || body.markdown === undefined) {
    throw new Error('Team delivery title and markdown are required.');
  }

  const request: TeamDeliveryPreviewRequest = {
    channel: body.channel,
    subjectType: body.subjectType,
    title: body.title,
    markdown: body.markdown,
  };
  if (body.subreddit !== undefined) {
    request.subreddit = body.subreddit;
  }
  if (body.subjectId !== undefined) {
    request.subjectId = body.subjectId;
  }
  return request;
}

function normalizeTeamDeliveryConfirmRequest(
  body: Partial<TeamDeliveryConfirmRequest>
): TeamDeliveryConfirmRequest {
  return {
    ...normalizeTeamDeliveryPreviewRequest(body),
    confirmed: body.confirmed === true,
  };
}

function normalizeEvidenceBoardCreateRequest(
  body: Partial<EvidenceBoardCreateRequest>
): EvidenceBoardCreateRequest {
  if (body.title === undefined) {
    throw new Error('Evidence board title is required.');
  }
  const request: EvidenceBoardCreateRequest = {
    title: body.title,
  };
  if (body.subreddit !== undefined) {
    request.subreddit = body.subreddit;
  }
  if (body.subject !== undefined) {
    request.subject = {
      ...body.subject,
    };
  }
  if (Array.isArray(body.sourceRefs)) {
    request.sourceRefs = body.sourceRefs.map((ref) => {
      if (
        ref.source !== 'receipt' &&
        ref.source !== 'override' &&
        ref.source !== 'policy_change'
      ) {
        throw new Error('Unsupported evidence board source reference.');
      }
      if (ref.id === undefined) {
        throw new Error('Evidence board source reference ID is required.');
      }
      const sourceRef: EvidenceBoardSourceRef = {
        source: ref.source,
        id: ref.id,
      };
      if (ref.policyId !== undefined) {
        sourceRef.policyId = ref.policyId;
      }
      return sourceRef;
    });
  }
  if (body.casePacket !== undefined) {
    request.casePacket = body.casePacket;
  }
  if (body.note !== undefined) {
    request.note = body.note;
  }
  return request;
}

function normalizeEvidenceBoardStatusUpdateRequest(
  body: Partial<EvidenceBoardStatusUpdateRequest>
): EvidenceBoardStatusUpdateRequest {
  if (
    body.status === undefined ||
    !EVIDENCE_BOARD_STATUS_VALUES.includes(body.status as EvidenceBoardStatus)
  ) {
    throw new Error('Evidence board status is required.');
  }
  const request: EvidenceBoardStatusUpdateRequest = {
    status: body.status,
  };
  if (body.note !== undefined) {
    request.note = body.note;
  }
  return request;
}

function evidenceBoardError(
  error: unknown
): ApiResponse<EvidenceBoardListResponse | EvidenceBoardListResponse['boards'][number]> {
  return {
    ok: false,
    error: {
      code: 'evidence_board_failed',
      message:
        error instanceof Error ? error.message : 'Evidence board request failed',
    },
  };
}

function normalizeIncidentModeStartRequest(
  body: Partial<IncidentModeStartRequest>
): IncidentModeStartRequest {
  if (
    body.reason === undefined ||
    !INCIDENT_MODE_REASON_VALUES.includes(body.reason as IncidentModeReason)
  ) {
    throw new Error('Incident reason is required.');
  }
  const request: IncidentModeStartRequest = {
    reason: body.reason,
  };
  if (body.subreddit !== undefined) {
    request.subreddit = body.subreddit;
  }
  if (body.description !== undefined) {
    request.description = body.description;
  }
  if (body.durationMinutes !== undefined) {
    request.durationMinutes = body.durationMinutes;
  }
  return request;
}

function normalizeIncidentModeEndRequest(
  body: Partial<IncidentModeEndRequest>
): IncidentModeEndRequest {
  const request: IncidentModeEndRequest = {};
  if (body.subreddit !== undefined) {
    request.subreddit = body.subreddit;
  }
  if (body.reviewNote !== undefined) {
    request.reviewNote = body.reviewNote;
  }
  return request;
}

function incidentModeError(
  error: unknown
): ApiResponse<IncidentMode | IncidentModeReport> {
  return {
    ok: false,
    error: {
      code: 'incident_mode_failed',
      message:
        error instanceof Error ? error.message : 'Incident Mode request failed',
    },
  };
}

function normalizePortableConfigImportRequest(
  body: Partial<PortableConfigImportRequest>
): PortableConfigImportRequest {
  if (!('package' in body)) {
    throw new Error('Portable config package is required.');
  }
  const request: PortableConfigImportRequest = {
    package: body.package,
  };
  if (body.subreddit !== undefined) {
    request.subreddit = body.subreddit;
  }
  if (body.dryRun !== undefined) {
    request.dryRun = body.dryRun === true;
  }
  return request;
}

function configPortabilityError(
  error: unknown
): ApiResponse<PortableConfigImportResult> {
  return {
    ok: false,
    error: {
      code: 'config_portability_failed',
      message:
        error instanceof Error
          ? error.message
          : 'Portable configuration request failed',
    },
  };
}

function normalizePrivacyRetentionUpdateRequest(
  body: Partial<PrivacyRetentionUpdateRequest>
): PrivacyRetentionUpdateRequest {
  const request: PrivacyRetentionUpdateRequest = {};
  if (body.subreddit !== undefined) {
    request.subreddit = body.subreddit;
  }
  for (const field of [
    'scanHistoryDays',
    'actionReceiptDays',
    'evidenceBoardDays',
    'teamDeliveryReceiptDays',
    'aiAdvisoryLogDays',
    'casePacketDays',
  ] as const) {
    if (body[field] !== undefined) {
      request[field] = Number(body[field]);
    }
  }
  return request;
}

function normalizePrivacyDeletionRequest(
  body: Partial<PrivacyDeletionRequest>
): PrivacyDeletionRequest {
  const request: PrivacyDeletionRequest = {};
  if (body.subreddit !== undefined) {
    request.subreddit = body.subreddit;
  }
  if (body.dryRun !== undefined) {
    request.dryRun = body.dryRun === true;
  }
  if (body.expiredOnly !== undefined) {
    request.expiredOnly = body.expiredOnly === true;
  }
  if (Array.isArray(body.categories)) {
    request.categories = body.categories.map((category) => {
      if (
        !PRIVACY_RETENTION_CATEGORY_VALUES.includes(
          category as PrivacyRetentionCategory
        )
      ) {
        throw new Error(`Unsupported privacy deletion category: ${category}`);
      }
      return category as PrivacyRetentionCategory;
    });
  }
  return request;
}

function privacyRetentionError(
  error: unknown
): ApiResponse<PrivacyRetentionSettings> {
  return {
    ok: false,
    error: {
      code: 'privacy_retention_failed',
      message:
        error instanceof Error
          ? error.message
          : 'Privacy retention request failed',
    },
  };
}

function privacyDeletionError(
  error: unknown
): ApiResponse<PrivacyDeletionResult> {
  return {
    ok: false,
    error: {
      code: 'privacy_deletion_failed',
      message:
        error instanceof Error ? error.message : 'Privacy deletion request failed',
    },
  };
}

function normalizeAiAdvisoryRequest(
  body: Partial<AiAdvisoryRequest>
): AiAdvisoryRequest {
  if (
    body.kind === undefined ||
    !AI_ADVISORY_KIND_VALUES.includes(body.kind as AiAdvisoryKind)
  ) {
    throw new Error('AI advisory kind is required.');
  }
  if (!Array.isArray(body.evidence)) {
    throw new Error('AI advisory evidence is required.');
  }

  const request: AiAdvisoryRequest = {
    kind: body.kind,
    evidence: body.evidence.map((item) => normalizeAiEvidence(item)),
  };
  if (body.subreddit !== undefined) {
    request.subreddit = body.subreddit;
  }
  if (body.prompt !== undefined) {
    request.prompt = body.prompt;
  }
  if (body.maxWords !== undefined) {
    request.maxWords = body.maxWords;
  }
  return request;
}

function normalizeAiEvidence(
  item: Partial<AiAdvisoryEvidenceInput>
): AiAdvisoryEvidenceInput {
  if (
    item.id === undefined ||
    item.source === undefined ||
    !AI_ADVISORY_EVIDENCE_SOURCE_VALUES.includes(
      item.source as AiAdvisoryEvidenceSource
    ) ||
    item.label === undefined ||
    item.summary === undefined
  ) {
    throw new Error('AI advisory evidence requires id, source, label, and summary.');
  }

  const evidence: AiAdvisoryEvidenceInput = {
    id: item.id,
    source: item.source,
    label: item.label,
    summary: item.summary,
  };
  if (item.createdAt !== undefined) {
    evidence.createdAt = item.createdAt;
  }
  return evidence;
}

function normalizeApplyPreviewInput(
  body: Partial<ApplyPolicyPreviewInput>
): ApplyPolicyPreviewInput {
  const input: ApplyPolicyPreviewInput = {
    subreddit: getRequestedBodySubreddit(body),
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
  if (
    body.packetType !== undefined &&
    CASE_PACKET_TYPE_VALUES.includes(body.packetType)
  ) {
    request.packetType = body.packetType;
  }

  if (body.subject.actionId !== undefined) {
    request.subject.actionId = body.subject.actionId;
  }
  if (body.subject.receiptId !== undefined) {
    request.subject.receiptId = body.subject.receiptId;
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
    confirmed: body.confirmed === true,
  };

  if (body.executionMode !== undefined) {
    input.executionMode = body.executionMode;
  }
  if (
    body.modNoteMode !== undefined &&
    NATIVE_MOD_NOTE_MODE_VALUES.includes(body.modNoteMode)
  ) {
    input.modNoteMode = body.modNoteMode;
  }
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

function requireModeratorAccess(): MiddlewareHandler {
  return async (c, next) => {
    if (c.req.method === 'OPTIONS' || isPublicApiPath(c.req.path)) {
      await next();
      return;
    }

    await assertModeratorAccess({
      currentSubreddit: context.subredditName,
      contextUsername: context.username,
      getCurrentUser: () => reddit.getCurrentUser(),
    });
    await next();
  };
}

const PUBLIC_API_PATHS = new Set([
  '/health',
  '/runtime-verification',
  '/launch-context',
  '/config/templates',
  '/digest/capabilities',
  '/delivery/capabilities',
  '/ai/capabilities',
]);

function isPublicApiPath(path: string): boolean {
  const apiPath = path.replace(/^\/api(?=\/|$)/, '');
  return PUBLIC_API_PATHS.has(apiPath);
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
