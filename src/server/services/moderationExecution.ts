import { reddit } from '@devvit/web/server';
import type { T1, T3 } from '@devvit/shared-types/tid.js';
import type {
  EnforcementAction,
  ModerationExecutionCapabilityState,
  ModerationExecutionMode,
  ModerationExecutionResult,
  ModerationTargetType,
  RedditModerationOperation,
} from '../../shared/schema';
import { getTargetType } from './targetContext';

type ReportIgnorer = {
  ignoreReports: () => Promise<void>;
};

type RedditModerationClient = {
  approve: (id: T1 | T3) => Promise<void>;
  remove: (id: T1 | T3, isSpam: boolean) => Promise<void>;
  getPostById: (id: T3) => Promise<ReportIgnorer>;
  getCommentById: (id: T1) => Promise<ReportIgnorer>;
};

export type ModerationExecutionCapabilities = {
  liveRedditActionsEnabled: boolean;
  redditActionsRuntimeVerified: boolean;
  receiptCreationAvailable: boolean;
};

export type ModerationExecutionInput = {
  selectedAction: EnforcementAction;
  targetThingId?: string;
  targetType?: ModerationTargetType;
  confirmed: boolean;
  executionMode?: ModerationExecutionMode;
};

export type ModerationExecutionDependencies = {
  reddit: RedditModerationClient;
  capabilities: ModerationExecutionCapabilities;
  now: () => string;
};

export async function executeModerationAction(
  input: ModerationExecutionInput,
  dependencies: ModerationExecutionDependencies = defaultDependencies()
): Promise<ModerationExecutionResult> {
  const startedAt = dependencies.now();
  const redditOperation = getRedditOperation(input.selectedAction);
  const targetType =
    input.targetType !== undefined && input.targetType !== 'unknown'
      ? input.targetType
      : input.targetThingId !== undefined
        ? getTargetType(input.targetThingId)
        : 'unknown';
  const executionMode = getExecutionMode(input, redditOperation);

  if (redditOperation === 'none') {
    return skipped({
      input,
      startedAt,
      completedAt: dependencies.now(),
      executionMode: 'log_only',
      redditOperation,
      targetType,
      capabilityState: 'not_applicable',
    });
  }

  if (!input.confirmed) {
    return skipped({
      input,
      startedAt,
      completedAt: dependencies.now(),
      executionMode,
      redditOperation,
      targetType,
      capabilityState: 'disabled',
      errorCode: 'confirmation_required',
      errorMessage: 'Explicit moderator confirmation is required.',
    });
  }

  if (input.targetThingId === undefined || !input.targetThingId.trim()) {
    return failedWithoutAttempt({
      input,
      startedAt,
      completedAt: dependencies.now(),
      executionMode,
      redditOperation,
      targetType,
      capabilityState: 'disabled',
      errorCode: 'target_required',
      errorMessage: 'A post or comment target is required for Reddit execution.',
    });
  }

  if (targetType === 'unknown') {
    return failedWithoutAttempt({
      input,
      startedAt,
      completedAt: dependencies.now(),
      executionMode,
      redditOperation,
      targetType,
      capabilityState: 'disabled',
      errorCode: 'unsupported_target',
      errorMessage: 'Expected a Reddit post t3_ or comment t1_ target.',
    });
  }

  if (executionMode === 'dry_run') {
    return skipped({
      input,
      startedAt,
      completedAt: dependencies.now(),
      executionMode,
      redditOperation,
      targetType,
      capabilityState: 'enabled',
      redditResultMetadata: { dryRun: true },
    });
  }

  const gate = getLiveGateState(dependencies.capabilities);
  if (executionMode !== 'live' || gate !== 'enabled') {
    return skipped({
      input,
      startedAt,
      completedAt: dependencies.now(),
      executionMode: gate === 'enabled' ? executionMode : 'unverified_disabled',
      redditOperation,
      targetType,
      capabilityState: gate,
      errorCode: gate,
      errorMessage: getGateMessage(gate),
    });
  }

  try {
    await runRedditOperation(
      dependencies.reddit,
      redditOperation,
      input.targetThingId,
      targetType
    );

    return {
      executionMode: 'live',
      executionAttempted: true,
      executionResult: 'success',
      redditOperation,
      selectedAction: input.selectedAction,
      targetThingId: input.targetThingId,
      targetType,
      capabilityState: 'enabled',
      redditResultMetadata: { returned: 'void' },
      startedAt,
      completedAt: dependencies.now(),
    };
  } catch (error) {
    return {
      executionMode: 'live',
      executionAttempted: true,
      executionResult: 'failure',
      redditOperation,
      selectedAction: input.selectedAction,
      targetThingId: input.targetThingId,
      targetType,
      capabilityState: 'enabled',
      errorCode: classifyExecutionError(error),
      errorMessage: formatError(error),
      startedAt,
      completedAt: dependencies.now(),
    };
  }
}

export function getRedditOperation(
  action: EnforcementAction
): RedditModerationOperation {
  if (action === 'remove') {
    return 'remove';
  }
  if (action === 'approve') {
    return 'approve';
  }
  if (action === 'ignore_reports') {
    return 'ignore_reports';
  }
  return 'none';
}

export function getDefaultModerationExecutionCapabilities(): ModerationExecutionCapabilities {
  return {
    liveRedditActionsEnabled:
      process.env.MODMIRROR_ENABLE_LIVE_REDDIT_ACTIONS === 'true',
    redditActionsRuntimeVerified:
      process.env.MODMIRROR_REDDIT_ACTIONS_RUNTIME_VERIFIED === 'true',
    receiptCreationAvailable:
      process.env.MODMIRROR_ACTION_RECEIPTS_AVAILABLE !== 'false',
  };
}

function defaultDependencies(): ModerationExecutionDependencies {
  return {
    reddit,
    capabilities: getDefaultModerationExecutionCapabilities(),
    now: () => new Date().toISOString(),
  };
}

function getExecutionMode(
  input: ModerationExecutionInput,
  redditOperation: RedditModerationOperation
): ModerationExecutionMode {
  if (input.executionMode !== undefined) {
    return input.executionMode;
  }
  return redditOperation === 'none' ? 'log_only' : 'unverified_disabled';
}

function getLiveGateState(
  capabilities: ModerationExecutionCapabilities
): ModerationExecutionCapabilityState {
  if (!capabilities.liveRedditActionsEnabled) {
    return 'disabled';
  }
  if (!capabilities.redditActionsRuntimeVerified) {
    return 'unverified_disabled';
  }
  if (!capabilities.receiptCreationAvailable) {
    return 'receipt_required';
  }
  return 'enabled';
}

function getGateMessage(state: ModerationExecutionCapabilityState): string {
  if (state === 'receipt_required') {
    return 'Live Reddit execution is blocked until action receipts are available.';
  }
  if (state === 'unverified_disabled') {
    return 'Live Reddit execution is disabled until playtest runtime proof is recorded.';
  }
  if (state === 'disabled') {
    return 'Live Reddit execution is disabled by configuration.';
  }
  return 'No Reddit execution is applicable for this action.';
}

async function runRedditOperation(
  client: RedditModerationClient,
  operation: Exclude<RedditModerationOperation, 'none'>,
  targetThingId: string,
  targetType: Exclude<ModerationTargetType, 'unknown'>
): Promise<void> {
  if (operation === 'approve') {
    await client.approve(targetThingId as T1 | T3);
    return;
  }

  if (operation === 'remove') {
    await client.remove(targetThingId as T1 | T3, false);
    return;
  }

  const target =
    targetType === 'post'
      ? await client.getPostById(targetThingId as T3)
      : await client.getCommentById(targetThingId as T1);
  await target.ignoreReports();
}

function skipped(options: {
  input: ModerationExecutionInput;
  startedAt: string;
  completedAt: string;
  executionMode: ModerationExecutionMode;
  redditOperation: RedditModerationOperation;
  targetType: ModerationTargetType;
  capabilityState: ModerationExecutionCapabilityState;
  errorCode?: string;
  errorMessage?: string;
  redditResultMetadata?: Record<string, string | number | boolean>;
}): ModerationExecutionResult {
  const result: ModerationExecutionResult = {
    executionMode: options.executionMode,
    executionAttempted: false,
    executionResult: 'skipped',
    redditOperation: options.redditOperation,
    selectedAction: options.input.selectedAction,
    targetType: options.targetType,
    capabilityState: options.capabilityState,
    startedAt: options.startedAt,
    completedAt: options.completedAt,
  };

  return withOptionalExecutionFields(result, options);
}

function failedWithoutAttempt(options: {
  input: ModerationExecutionInput;
  startedAt: string;
  completedAt: string;
  executionMode: ModerationExecutionMode;
  redditOperation: RedditModerationOperation;
  targetType: ModerationTargetType;
  capabilityState: ModerationExecutionCapabilityState;
  errorCode: string;
  errorMessage: string;
}): ModerationExecutionResult {
  const result: ModerationExecutionResult = {
    executionMode: options.executionMode,
    executionAttempted: false,
    executionResult: 'failure',
    redditOperation: options.redditOperation,
    selectedAction: options.input.selectedAction,
    targetType: options.targetType,
    capabilityState: options.capabilityState,
    startedAt: options.startedAt,
    completedAt: options.completedAt,
  };

  return withOptionalExecutionFields(result, options);
}

function withOptionalExecutionFields(
  result: ModerationExecutionResult,
  options: {
    input: ModerationExecutionInput;
    errorCode?: string;
    errorMessage?: string;
    redditResultMetadata?: Record<string, string | number | boolean>;
  }
): ModerationExecutionResult {
  if (options.input.targetThingId !== undefined) {
    result.targetThingId = options.input.targetThingId;
  }
  if (options.errorCode !== undefined) {
    result.errorCode = options.errorCode;
  }
  if (options.errorMessage !== undefined) {
    result.errorMessage = options.errorMessage;
  }
  if (options.redditResultMetadata !== undefined) {
    result.redditResultMetadata = options.redditResultMetadata;
  }

  return result;
}

function classifyExecutionError(error: unknown): string {
  const message = formatError(error).toLowerCase();
  if (
    message.includes('permission') ||
    message.includes('forbidden') ||
    message.includes('403')
  ) {
    return 'permission_denied';
  }
  if (message.includes('not found') || message.includes('404')) {
    return 'target_not_found';
  }
  return 'reddit_execution_failed';
}

function formatError(error: unknown): string {
  return error instanceof Error ? error.message : 'unknown error';
}
