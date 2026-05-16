import { redis } from '@devvit/web/server';
import { randomUUID } from 'node:crypto';
import {
  OVERRIDE_REASON_VALUES,
  OVERRIDE_REVIEW_STATUS_VALUES,
} from '../../shared/constants';
import type {
  ActionEvent,
  EnforcementAction,
  MessageDeliveryMode,
  OverrideEvent,
  OverrideReason,
  OverrideReviewStatus,
  OverrideReviewUpdateInput,
  OverrideSummary,
  PolicySnapshot,
  PolicyVersionStatus,
} from '../../shared/schema';
import { parseJson, readJson, redisKeys, serializeJson, writeJson } from './redis';

export type ActionEventInput = Omit<ActionEvent, 'id' | 'createdAt'> & {
  id?: string;
  createdAt?: string;
};

export type OverrideEventInput = Omit<
  OverrideEvent,
  | 'id'
  | 'createdAt'
  | 'reviewStatus'
  | 'reviewedBy'
  | 'reviewedAt'
  | 'reviewNote'
  | 'updatedAt'
> & {
  id?: string;
  createdAt?: string;
  reviewStatus?: OverrideReviewStatus;
  updatedAt?: string;
};

type OverrideReviewRecord = {
  overrideId: string;
  reviewStatus: OverrideReviewStatus;
  reviewedBy: string;
  reviewedAt: string;
  reviewNote?: string;
  updatedAt: string;
};

export async function saveActionEvent(
  input: ActionEventInput
): Promise<ActionEvent> {
  const event: ActionEvent = {
    id: input.id ?? `action-${randomUUID()}`,
    subreddit: input.subreddit,
    ruleKey: input.ruleKey,
    recommendedAction: input.recommendedAction,
    selectedAction: input.selectedAction,
    deliveryMode: input.deliveryMode,
    source: input.source,
    createdAt: input.createdAt ?? new Date().toISOString(),
  };

  if (input.modUsername !== undefined) {
    event.modUsername = input.modUsername;
  }
  if (input.targetThingId !== undefined) {
    event.targetThingId = input.targetThingId;
  }
  if (input.targetAuthor !== undefined) {
    event.targetAuthor = input.targetAuthor;
  }
  if (input.ruleName !== undefined) {
    event.ruleName = input.ruleName;
  }
  if (input.policyId !== undefined) {
    event.policyId = input.policyId;
  }
  if (input.policyVersionId !== undefined) {
    event.policyVersionId = input.policyVersionId;
  }
  if (input.policyVersionNumber !== undefined) {
    event.policyVersionNumber = input.policyVersionNumber;
  }
  if (input.policyVersionStatus !== undefined) {
    event.policyVersionStatus = input.policyVersionStatus;
  }
  if (input.policySnapshot !== undefined) {
    event.policySnapshot = input.policySnapshot;
  }

  const createdAtScore = Date.parse(event.createdAt);
  const score = Number.isNaN(createdAtScore) ? Date.now() : createdAtScore;

  await redis.zAdd(redisKeys.actions(event.subreddit), {
    member: serializeJson(event),
    score,
  });

  if (event.modUsername) {
    await redis.zAdd(redisKeys.actionsByUser(event.subreddit, event.modUsername), {
      member: serializeJson(event),
      score,
    });
  }

  return event;
}

export async function listRecentActionEvents(
  subreddit: string,
  limit = 25
): Promise<ActionEvent[]> {
  if (limit <= 0) {
    return [];
  }

  const rows = await redis.zRange(
    redisKeys.actions(subreddit),
    0,
    limit - 1,
    {
      by: 'rank',
      reverse: true,
    }
  );

  return rows
    .map((row: { member: string }) => parseJson<ActionEvent>(row.member))
    .filter((event): event is ActionEvent => event !== undefined);
}

export async function saveAuditEvent(event: OverrideEvent): Promise<void> {
  const createdAtScore = Date.parse(event.createdAt);

  await redis.zAdd(redisKeys.overrides(event.subreddit), {
    member: serializeJson(event),
    score: Number.isNaN(createdAtScore) ? Date.now() : createdAtScore,
  });
}

export async function listRecentAuditEvents(
  subreddit: string,
  limit = 25
): Promise<OverrideEvent[]> {
  if (limit <= 0) {
    return [];
  }

  const rows = await redis.zRange(
    redisKeys.overrides(subreddit),
    0,
    limit - 1,
    {
      by: 'rank',
      reverse: true,
    }
  );

  const events = rows
    .map((row: { member: string }) => parseJson<OverrideEvent>(row.member))
    .filter((event): event is OverrideEvent => event !== undefined);

  return Promise.all(events.map((event) => hydrateOverrideReview(event)));
}

export async function saveOverrideEvent(
  input: OverrideEventInput
): Promise<OverrideEvent> {
  validateOverrideReasonForDeviation(
    input.recommendedAction,
    input.selectedAction,
    input.overrideReason
  );

  const createdAt = input.createdAt ?? new Date().toISOString();
  const event: OverrideEvent = {
    id: input.id ?? `override-${randomUUID()}`,
    subreddit: input.subreddit,
    modUsername: input.modUsername,
    ruleKey: input.ruleKey,
    recommendedAction: input.recommendedAction,
    selectedAction: input.selectedAction,
    overrideReason: input.overrideReason,
    reviewStatus: input.reviewStatus ?? 'unresolved',
    updatedAt: input.updatedAt ?? createdAt,
    createdAt,
  };

  if (input.targetThingId !== undefined) {
    event.targetThingId = input.targetThingId;
  }
  if (input.targetAuthor !== undefined) {
    event.targetAuthor = input.targetAuthor;
  }
  if (input.overrideNote !== undefined) {
    event.overrideNote = input.overrideNote;
  }
  if (input.policyId !== undefined) {
    event.policyId = input.policyId;
  }
  if (input.policyVersionId !== undefined) {
    event.policyVersionId = input.policyVersionId;
  }
  if (input.policyVersionNumber !== undefined) {
    event.policyVersionNumber = input.policyVersionNumber;
  }
  if (input.policyVersionStatus !== undefined) {
    event.policyVersionStatus = input.policyVersionStatus;
  }
  if (input.policySnapshot !== undefined) {
    event.policySnapshot = input.policySnapshot;
  }

  await saveAuditEvent(event);
  return event;
}

export async function listOverrideEvents(options: {
  subreddit: string;
  limit?: number;
  status?: OverrideReviewStatus;
  ruleKey?: string;
}): Promise<OverrideEvent[]> {
  const events = await listRecentAuditEvents(options.subreddit, options.limit ?? 100);

  return events.filter((event) => {
    if (options.status !== undefined && event.reviewStatus !== options.status) {
      return false;
    }
    if (options.ruleKey !== undefined && event.ruleKey !== options.ruleKey) {
      return false;
    }
    return true;
  });
}

export async function getOverrideEvent(
  subreddit: string,
  overrideId: string
): Promise<OverrideEvent | undefined> {
  const events = await listRecentAuditEvents(subreddit, 500);
  return events.find((event) => event.id === overrideId);
}

export async function updateOverrideReview(
  subreddit: string,
  overrideId: string,
  input: OverrideReviewUpdateInput
): Promise<OverrideEvent | undefined> {
  validateOverrideReviewStatus(input.reviewStatus);
  if (!input.reviewedBy.trim()) {
    throw new Error('reviewedBy is required');
  }

  const event = await getOverrideEvent(subreddit, overrideId);
  if (!event) {
    return undefined;
  }

  const now = new Date().toISOString();
  const review: OverrideReviewRecord = {
    overrideId,
    reviewStatus: input.reviewStatus,
    reviewedBy: input.reviewedBy,
    reviewedAt: now,
    updatedAt: now,
  };
  if (input.reviewNote !== undefined) {
    review.reviewNote = input.reviewNote;
  }

  await writeJson(redisKeys.overrideReview(subreddit, overrideId), review);
  return applyOverrideReview(event, review);
}

export function validateOverrideReviewStatus(
  status: string
): asserts status is OverrideReviewStatus {
  if (
    !OVERRIDE_REVIEW_STATUS_VALUES.includes(
      status as OverrideReviewStatus
    )
  ) {
    throw new Error('Invalid override review status');
  }
}

export function validateOverrideReasonForDeviation(
  recommendedAction: EnforcementAction,
  selectedAction: EnforcementAction,
  overrideReason?: OverrideReason
): void {
  if (recommendedAction === selectedAction) {
    return;
  }

  if (!overrideReason || !OVERRIDE_REASON_VALUES.includes(overrideReason)) {
    throw new Error('Override reason is required when selected action deviates');
  }
}

export function buildOverrideSummary(
  events: OverrideEvent[],
  recentLimit = 10
): OverrideSummary {
  const overridesByReason = Object.fromEntries(
    OVERRIDE_REASON_VALUES.map((reason) => [reason, 0])
  ) as Record<OverrideReason, number>;
  const overridesByRule: Record<string, number> = {};

  for (const event of events) {
    overridesByRule[event.ruleKey] = (overridesByRule[event.ruleKey] ?? 0) + 1;
    overridesByReason[event.overrideReason] += 1;
  }

  return {
    totalOverrides: events.length,
    overridesByRule,
    overridesByReason,
    recentOverrides: events.slice(0, recentLimit).map((event) => {
      const { modUsername: _modUsername, ...safeEvent } = event;
      return safeEvent;
    }),
  };
}

async function hydrateOverrideReview(event: OverrideEvent): Promise<OverrideEvent> {
  const normalized = normalizeOverrideReviewDefaults(event);
  const review = await readJson<OverrideReviewRecord>(
    redisKeys.overrideReview(normalized.subreddit, normalized.id)
  );

  return review ? applyOverrideReview(normalized, review) : normalized;
}

function normalizeOverrideReviewDefaults(event: OverrideEvent): OverrideEvent {
  return {
    ...event,
    reviewStatus: event.reviewStatus ?? 'unresolved',
    updatedAt: event.updatedAt ?? event.createdAt,
  };
}

function applyOverrideReview(
  event: OverrideEvent,
  review: OverrideReviewRecord
): OverrideEvent {
  const updated: OverrideEvent = {
    ...event,
    reviewStatus: review.reviewStatus,
    reviewedBy: review.reviewedBy,
    reviewedAt: review.reviewedAt,
    updatedAt: review.updatedAt,
  };

  if (review.reviewNote !== undefined) {
    updated.reviewNote = review.reviewNote;
  }

  return updated;
}

export function createLogOnlyActionInput(options: {
  subreddit: string;
  modUsername?: string;
  targetThingId?: string;
  targetAuthor?: string;
  ruleKey: string;
  ruleName?: string;
  policyId?: string;
  policyVersionId?: string;
  policyVersionNumber?: number;
  policyVersionStatus?: PolicyVersionStatus;
  policySnapshot?: PolicySnapshot;
  recommendedAction: EnforcementAction;
  selectedAction: EnforcementAction;
  deliveryMode?: MessageDeliveryMode;
  source?: ActionEvent['source'];
}): ActionEventInput {
  const input: ActionEventInput = {
    subreddit: options.subreddit,
    ruleKey: options.ruleKey,
    recommendedAction: options.recommendedAction,
    selectedAction: options.selectedAction,
    deliveryMode: options.deliveryMode ?? 'log_only',
    source: options.source ?? 'simulator',
  };

  if (options.modUsername !== undefined) {
    input.modUsername = options.modUsername;
  }
  if (options.targetThingId !== undefined) {
    input.targetThingId = options.targetThingId;
  }
  if (options.targetAuthor !== undefined) {
    input.targetAuthor = options.targetAuthor;
  }
  if (options.ruleName !== undefined) {
    input.ruleName = options.ruleName;
  }
  if (options.policyId !== undefined) {
    input.policyId = options.policyId;
  }
  if (options.policyVersionId !== undefined) {
    input.policyVersionId = options.policyVersionId;
  }
  if (options.policyVersionNumber !== undefined) {
    input.policyVersionNumber = options.policyVersionNumber;
  }
  if (options.policyVersionStatus !== undefined) {
    input.policyVersionStatus = options.policyVersionStatus;
  }
  if (options.policySnapshot !== undefined) {
    input.policySnapshot = options.policySnapshot;
  }

  return input;
}
