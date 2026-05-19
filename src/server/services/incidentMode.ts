import { redis } from '@devvit/web/server';
import { randomUUID } from 'node:crypto';
import {
  INCIDENT_MODE_REASON_VALUES,
  INCIDENT_MODE_STATUS_VALUES,
  MODERATION_EXECUTION_STATUS_VALUES,
} from '../../shared/constants';
import type {
  ActionReceipt,
  EnforcementAction,
  IncidentMode,
  IncidentModeEndRequest,
  IncidentModeReason,
  IncidentModeReport,
  IncidentModeStartRequest,
  IncidentModeStateResponse,
  IncidentModeStatus,
  IncidentPolicyPresetSuggestion,
  IncidentTriageGroup,
  ModerationExecutionStatus,
} from '../../shared/schema';
import { listActionReceipts } from './receipts';
import { parseJson, readJson, redisKeys, serializeJson, writeJson } from './redis';

export type IncidentModeDependencies = {
  listReceipts?: typeof listActionReceipts;
  now?: () => string;
};

export type StartIncidentModeOptions = {
  subreddit: string;
  request: IncidentModeStartRequest;
  startedBy?: string;
  dependencies?: IncidentModeDependencies;
};

export type EndIncidentModeOptions = {
  subreddit: string;
  incidentId: string;
  request: IncidentModeEndRequest;
  endedBy?: string;
  dependencies?: IncidentModeDependencies;
};

const DEFAULT_DURATION_MINUTES = 120;
const MAX_DURATION_MINUTES = 24 * 60;
const INCIDENT_LIST_LIMIT = 20;

export async function getIncidentModeState(
  subreddit: string
): Promise<IncidentModeStateResponse> {
  const [active, incidents] = await Promise.all([
    getActiveIncidentMode(subreddit),
    listIncidents(subreddit),
  ]);
  const state: IncidentModeStateResponse = {
    incidents,
  };
  if (active !== undefined) {
    state.active = active;
  }
  return state;
}

export async function getActiveIncidentMode(
  subreddit: string,
  now = new Date().toISOString()
): Promise<IncidentMode | undefined> {
  const activeId = await redis.get(redisKeys.incidentActive(subreddit));
  if (activeId === undefined) {
    return undefined;
  }
  const incident = await getIncident(subreddit, activeId);
  if (incident === undefined || incident.status !== 'active') {
    return undefined;
  }
  if (Date.parse(incident.expiresAt) <= Date.parse(now)) {
    return {
      ...incident,
      status: 'expired',
    };
  }
  return incident;
}

export async function startIncidentMode(
  options: StartIncidentModeOptions
): Promise<IncidentMode> {
  validateIncidentReason(options.request.reason);
  const now = options.dependencies?.now?.() ?? new Date().toISOString();
  const active = await getActiveIncidentMode(options.subreddit, now);
  if (active !== undefined) {
    throw new Error('Incident Mode is already active.');
  }

  const durationMinutes = normalizeDuration(options.request.durationMinutes);
  const incident: IncidentMode = {
    id: `incident-${randomUUID()}`,
    subreddit: options.subreddit,
    status: 'active',
    reason: options.request.reason,
    startedAt: now,
    expiresAt: new Date(Date.parse(now) + durationMinutes * 60_000).toISOString(),
    presetSuggestions: buildIncidentPolicyPresetSuggestions(
      options.request.reason
    ),
    triageGroups: buildIncidentTriageGroups(options.request.reason),
  };
  if (options.request.description !== undefined) {
    incident.description = options.request.description.trim();
  }
  if (options.startedBy !== undefined) {
    incident.startedBy = options.startedBy;
  }

  await saveIncident(incident);
  await redis.set(redisKeys.incidentActive(options.subreddit), incident.id);
  return incident;
}

export async function endIncidentMode(
  options: EndIncidentModeOptions
): Promise<IncidentModeReport | undefined> {
  const incident = await getIncident(options.subreddit, options.incidentId);
  if (incident === undefined) {
    return undefined;
  }

  const now = options.dependencies?.now?.() ?? new Date().toISOString();
  const ended: IncidentMode = {
    ...incident,
    status: 'ended',
    endedAt: now,
  };
  if (options.endedBy !== undefined) {
    ended.endedBy = options.endedBy;
  }
  if (options.request.reviewNote !== undefined) {
    ended.reviewNote = options.request.reviewNote.trim();
  }

  await saveIncident(ended);
  await redis.set(redisKeys.incidentActive(options.subreddit), '');

  return buildIncidentModeReport({
    incident: ended,
    receipts: await (options.dependencies?.listReceipts ?? listActionReceipts)(
      options.subreddit,
      500
    ),
  });
}

export async function listIncidents(
  subreddit: string,
  limit = INCIDENT_LIST_LIMIT
): Promise<IncidentMode[]> {
  if (limit <= 0) {
    return [];
  }
  const rows = await redis.zRange(redisKeys.incidents(subreddit), 0, limit - 1, {
    by: 'rank',
    reverse: true,
  });
  const incidents = rows
    .map((row: { member: string }) => parseJson<IncidentMode>(row.member))
    .filter((incident): incident is IncidentMode => incident !== undefined);
  const byId = new Map<string, IncidentMode>();
  for (const incident of incidents) {
    if (!byId.has(incident.id)) {
      byId.set(incident.id, incident);
    }
  }
  return [...byId.values()];
}

export async function getIncident(
  subreddit: string,
  incidentId: string
): Promise<IncidentMode | undefined> {
  return readJson<IncidentMode>(redisKeys.incident(subreddit, incidentId));
}

export function buildIncidentModeReport(options: {
  incident: IncidentMode;
  receipts: ActionReceipt[];
}): IncidentModeReport {
  const taggedReceipts = options.receipts.filter(
    (receipt) => receipt.incidentId === options.incident.id
  );
  const executionResults = Object.fromEntries(
    MODERATION_EXECUTION_STATUS_VALUES.map((status) => [status, 0])
  ) as Record<ModerationExecutionStatus, number>;
  for (const receipt of taggedReceipts) {
    executionResults[receipt.executionResult] += 1;
  }

  return {
    incident: options.incident,
    receiptCount: taggedReceipts.length,
    overrideCount: taggedReceipts.filter((receipt) => receipt.deviatesFromPolicy)
      .length,
    executionResults,
    taggedReceiptIds: taggedReceipts.map((receipt) => receipt.id),
    caveats: [
      'Incident Mode tags ModMirror receipts but does not auto-remove, auto-ban, or override policy confirmation.',
      'Receipt counts only include actions confirmed through ModMirror during the incident.',
    ],
  };
}

export function buildIncidentPolicyPresetSuggestions(
  reason: IncidentModeReason
): IncidentPolicyPresetSuggestion[] {
  const base = suggestion(
    'manual-review-default',
    'Require manual review for ambiguous cases',
    'Keep moderators in the loop when the queue is moving quickly.',
    'manual_review'
  );
  if (reason === 'spam_flood' || reason === 'raid') {
    return [
      suggestion(
        'remove-spam-patterns',
        'Prefer removal for clear spam patterns',
        'Use existing policy criteria, then confirm each removal explicitly.',
        'remove'
      ),
      base,
    ];
  }
  if (reason === 'brigading') {
    return [
      suggestion(
        'ignore-report-abuse',
        'Consider ignore reports for coordinated false reports',
        'Only use after checking target context and report pattern evidence.',
        'ignore_reports'
      ),
      base,
    ];
  }
  return [base];
}

export function buildIncidentTriageGroups(
  reason: IncidentModeReason
): IncidentTriageGroup[] {
  const groups: IncidentTriageGroup[] = [
    {
      id: 'reported-content',
      label: 'Reported content first',
      detail: 'Group items with active reports and visible target context.',
      priority: 'high',
      suggestedQueueFilter: 'reported',
    },
    {
      id: 'policy-deviation',
      label: 'Policy deviations',
      detail: 'Review actions where selected enforcement differs from policy.',
      priority: 'medium',
      suggestedQueueFilter: 'overrides',
    },
  ];
  if (reason === 'spam_flood' || reason === 'raid') {
    groups.unshift({
      id: 'repeat-patterns',
      label: 'Repeat patterns',
      detail: 'Prioritize repeated titles, links, and authors from stored evidence.',
      priority: 'high',
      suggestedQueueFilter: 'repeat-pattern',
    });
  }
  return groups;
}

export function validateIncidentReason(
  reason: string
): asserts reason is IncidentModeReason {
  if (!INCIDENT_MODE_REASON_VALUES.includes(reason as IncidentModeReason)) {
    throw new Error('Invalid incident reason.');
  }
}

export function validateIncidentStatus(
  status: string
): asserts status is IncidentModeStatus {
  if (!INCIDENT_MODE_STATUS_VALUES.includes(status as IncidentModeStatus)) {
    throw new Error('Invalid incident status.');
  }
}

async function saveIncident(incident: IncidentMode): Promise<void> {
  const score = Date.parse(incident.endedAt ?? incident.startedAt);
  await Promise.all([
    writeJson(redisKeys.incident(incident.subreddit, incident.id), incident),
    redis.zAdd(redisKeys.incidents(incident.subreddit), {
      member: serializeJson(incident),
      score: Number.isNaN(score) ? Date.now() : score,
    }),
  ]);
}

function normalizeDuration(durationMinutes: number | undefined): number {
  if (durationMinutes === undefined || durationMinutes <= 0) {
    return DEFAULT_DURATION_MINUTES;
  }
  return Math.min(Math.ceil(durationMinutes), MAX_DURATION_MINUTES);
}

function suggestion(
  id: string,
  label: string,
  detail: string,
  recommendedAction: EnforcementAction
): IncidentPolicyPresetSuggestion {
  return {
    id,
    label,
    detail,
    recommendedAction,
    safetyNote:
      'Suggestion only. Moderator confirmation and normal Apply Policy receipts are still required.',
  };
}
