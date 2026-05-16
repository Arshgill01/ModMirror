import { redis } from '@devvit/web/server';
import { randomUUID } from 'node:crypto';
import { OVERRIDE_REASON_VALUES } from '../../shared/constants';
import type {
  ActionEvent,
  EnforcementAction,
  MessageDeliveryMode,
  OverrideEvent,
  OverrideReason,
  OverrideSummary,
} from '../../shared/schema';
import { parseJson, redisKeys, serializeJson } from './redis';

export type ActionEventInput = Omit<ActionEvent, 'id' | 'createdAt'> & {
  id?: string;
  createdAt?: string;
};

export type OverrideEventInput = Omit<OverrideEvent, 'id' | 'createdAt'> & {
  id?: string;
  createdAt?: string;
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

  return rows
    .map((row: { member: string }) => parseJson<OverrideEvent>(row.member))
    .filter((event): event is OverrideEvent => event !== undefined);
}

export async function saveOverrideEvent(
  input: OverrideEventInput
): Promise<OverrideEvent> {
  validateOverrideReasonForDeviation(
    input.recommendedAction,
    input.selectedAction,
    input.overrideReason
  );

  const event: OverrideEvent = {
    id: input.id ?? `override-${randomUUID()}`,
    subreddit: input.subreddit,
    modUsername: input.modUsername,
    ruleKey: input.ruleKey,
    recommendedAction: input.recommendedAction,
    selectedAction: input.selectedAction,
    overrideReason: input.overrideReason,
    createdAt: input.createdAt ?? new Date().toISOString(),
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

  await saveAuditEvent(event);
  return event;
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

export function createLogOnlyActionInput(options: {
  subreddit: string;
  modUsername?: string;
  targetThingId?: string;
  targetAuthor?: string;
  ruleKey: string;
  ruleName?: string;
  policyId?: string;
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

  return input;
}
