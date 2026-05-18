import {
  APPLY_POLICY_SOURCE_VALUES,
  DEMO_SUBREDDIT_NAME,
  ENFORCEMENT_ACTION_VALUES,
  MODERATION_EXECUTION_MODE_VALUES,
} from '../../shared/constants';
import { recommendPolicyAction } from '../../shared/scoring';
import type {
  ApplyPolicyConfirmInput,
  ApplyPolicyConfirmResult,
  ApplyPolicyPreview,
  ApplyPolicyPreviewEvidence,
  ApplyPolicyPreviewInput,
  ApplyPolicyTargetSnapshot,
  AttributedModAction,
  ModerationExecutionResult,
  PolicyRecommendation,
} from '../../shared/schema';
import {
  createLogOnlyActionInput,
  listRecentActionEvents,
  saveActionEvent,
  saveOverrideEvent,
} from './audit';
import {
  executeModerationAction,
  getRedditOperation,
  type ModerationExecutionDependencies,
} from './moderationExecution';
import { capturePolicySnapshot, getPolicyByRule } from './policies';
import { getTargetType } from './targetContext';

export async function previewApplyPolicy(
  input: ApplyPolicyPreviewInput
): Promise<ApplyPolicyPreview> {
  validatePreviewInput(input);

  const subreddit = input.subreddit ?? DEMO_SUBREDDIT_NAME;
  const policy = await getPolicyByRule(subreddit, input.ruleKey);
  const actionHistory = await loadActionHistory(subreddit);
  const recommendationOptions: Parameters<typeof recommendPolicyAction>[0] = {
    ruleKey: input.ruleKey,
    actionHistory,
  };
  if (policy !== undefined) {
    recommendationOptions.policy = policy;
    recommendationOptions.ruleName = policy.ruleName;
  }
  if (input.targetAuthor !== undefined) {
    recommendationOptions.targetAuthor = input.targetAuthor;
  }
  if (input.selectedAction !== undefined) {
    recommendationOptions.selectedAction = input.selectedAction;
  }

  const recommendation = recommendPolicyAction(recommendationOptions);
  const policySnapshot = capturePolicySnapshot(policy);
  const targetSnapshot = buildTargetSnapshot(input);
  const preview: ApplyPolicyPreview = {
    recommendation,
    targetSnapshot,
    evidence: buildPreviewEvidence({
      policy,
      recommendation,
      actionHistory,
      targetSnapshot,
    }),
    confirmation: buildConfirmationPreview(recommendation),
  };

  if (policy !== undefined) {
    preview.policy = policy;
  }
  if (policySnapshot !== undefined) {
    preview.policySnapshot = policySnapshot;
  }

  return preview;
}

export async function confirmApplyPolicy(options: {
  input: ApplyPolicyConfirmInput;
  modUsername?: string;
  executionDependencies?: ModerationExecutionDependencies;
}): Promise<ApplyPolicyConfirmResult> {
  validateConfirmInput(options.input);

  const preview = await previewApplyPolicy(options.input);
  const recommendation = preview.recommendation;

  if (
    recommendation.requiresOverrideReason &&
    options.input.overrideReason === undefined
  ) {
    throw new Error('Override reason is required for policy deviations');
  }

  const subreddit = options.input.subreddit ?? DEMO_SUBREDDIT_NAME;
  const policySnapshot = preview.policySnapshot;
  const executionInput: Parameters<typeof executeModerationAction>[0] = {
    selectedAction: options.input.selectedAction,
    targetType: preview.targetSnapshot.targetType,
    confirmed: options.input.confirmed,
  };
  if (options.input.targetThingId !== undefined) {
    executionInput.targetThingId = options.input.targetThingId;
  }
  if (options.input.executionMode !== undefined) {
    executionInput.executionMode = options.input.executionMode;
  }
  const execution = await executeModerationAction(
    executionInput,
    options.executionDependencies
  );
  const actionInput = createLogOnlyActionInput(createActionOptions(
    subreddit,
    recommendation,
    options.input,
    options.modUsername,
    policySnapshot,
    execution
  ));
  const actionEvent = await saveActionEvent(actionInput);

  const result: ApplyPolicyConfirmResult = {
    recommendation,
    actionEvent,
    execution,
  };

  if (recommendation.deviatesFromPolicy && options.input.overrideReason) {
    const overrideInput: Parameters<typeof saveOverrideEvent>[0] = {
      subreddit,
      modUsername: options.modUsername ?? 'unknown',
      ruleKey: recommendation.ruleKey,
      recommendedAction: recommendation.recommendedAction,
      selectedAction: options.input.selectedAction,
      overrideReason: options.input.overrideReason,
    };
    if (recommendation.ruleName !== undefined) {
      overrideInput.ruleName = recommendation.ruleName;
    }
    if (options.input.targetThingId !== undefined) {
      overrideInput.targetThingId = options.input.targetThingId;
    }
    if (options.input.targetAuthor !== undefined) {
      overrideInput.targetAuthor = options.input.targetAuthor;
    }
    if (options.input.overrideNote !== undefined) {
      overrideInput.overrideNote = options.input.overrideNote;
    }
    if (policySnapshot !== undefined) {
      overrideInput.policyId = policySnapshot.policyId;
      overrideInput.policyVersionId = policySnapshot.policyVersionId;
      overrideInput.policyVersionNumber = policySnapshot.policyVersionNumber;
      overrideInput.policyVersionStatus = policySnapshot.policyVersionStatus;
      overrideInput.policySnapshot = policySnapshot;
    } else {
      overrideInput.policyVersionStatus = 'missing';
    }

    result.overrideEvent = await saveOverrideEvent(overrideInput);
  }

  return result;
}

function createActionOptions(
  subreddit: string,
  recommendation: PolicyRecommendation,
  input: ApplyPolicyConfirmInput,
  modUsername?: string,
  policySnapshot?: ReturnType<typeof capturePolicySnapshot>,
  execution?: ModerationExecutionResult
): Parameters<typeof createLogOnlyActionInput>[0] {
  const actionInput: Parameters<typeof createLogOnlyActionInput>[0] = {
    subreddit,
    ruleKey: recommendation.ruleKey,
    recommendedAction: recommendation.recommendedAction,
    selectedAction: input.selectedAction,
    deliveryMode: recommendation.messageDeliveryMode,
    source: input.source ?? 'simulator',
  };

  if (modUsername !== undefined) {
    actionInput.modUsername = modUsername;
  }
  if (input.targetThingId !== undefined) {
    actionInput.targetThingId = input.targetThingId;
  }
  if (input.targetAuthor !== undefined) {
    actionInput.targetAuthor = input.targetAuthor;
  }
  if (recommendation.ruleName !== undefined) {
    actionInput.ruleName = recommendation.ruleName;
  }
  if (recommendation.policyId !== undefined) {
    actionInput.policyId = recommendation.policyId;
  }
  if (policySnapshot !== undefined) {
    actionInput.policyId = policySnapshot.policyId;
    actionInput.policyVersionId = policySnapshot.policyVersionId;
    actionInput.policyVersionNumber = policySnapshot.policyVersionNumber;
    actionInput.policyVersionStatus = policySnapshot.policyVersionStatus;
    actionInput.policySnapshot = policySnapshot;
  } else {
    actionInput.policyVersionStatus = 'missing';
  }
  if (execution !== undefined) {
    actionInput.execution = execution;
  }

  return actionInput;
}

async function loadActionHistory(
  subreddit: string
): Promise<AttributedModAction[]> {
  const events = await listRecentActionEvents(subreddit, 100);

  return events.map((event) => {
    const action: AttributedModAction = {
      id: event.id,
      subreddit: event.subreddit,
      source: 'modmirror',
      rawActionType: event.selectedAction,
      normalizedAction: event.selectedAction,
      createdAt: event.createdAt,
      inferredRuleKey: event.ruleKey,
      confidence: 'high',
      evidence: ['ModMirror Apply Policy action event'],
    };

    if (event.targetThingId !== undefined) {
      action.targetThingId = event.targetThingId;
    }
    if (event.targetAuthor !== undefined) {
      action.targetAuthor = event.targetAuthor;
    }
    if (event.modUsername !== undefined) {
      action.moderator = event.modUsername;
    }
    if (event.ruleName !== undefined) {
      action.inferredRuleName = event.ruleName;
    }

    return action;
  });
}

function validatePreviewInput(input: ApplyPolicyPreviewInput): void {
  if (!input.ruleKey.trim()) {
    throw new Error('ruleKey is required');
  }
  if (
    input.selectedAction !== undefined &&
    !ENFORCEMENT_ACTION_VALUES.includes(input.selectedAction)
  ) {
    throw new Error('selectedAction is invalid');
  }
  if (
    input.source !== undefined &&
    !APPLY_POLICY_SOURCE_VALUES.includes(input.source)
  ) {
    throw new Error('source is invalid');
  }
  if (input.targetThingId !== undefined) {
    const targetType = getTargetType(input.targetThingId);
    if (targetType === 'unknown') {
      throw new Error('targetThingId must be a post t3_ or comment t1_ ID');
    }
    if (
      input.targetType !== undefined &&
      input.targetType !== 'unknown' &&
      input.targetType !== targetType
    ) {
      throw new Error('targetType does not match targetThingId');
    }
  }
}

function validateConfirmInput(input: ApplyPolicyConfirmInput): void {
  if (input.confirmed !== true) {
    throw new Error('Explicit confirmation is required');
  }
  if (
    input.executionMode !== undefined &&
    !MODERATION_EXECUTION_MODE_VALUES.includes(input.executionMode)
  ) {
    throw new Error('executionMode is invalid');
  }
}

function buildTargetSnapshot(
  input: ApplyPolicyPreviewInput
): ApplyPolicyTargetSnapshot {
  if (input.targetThingId === undefined || !input.targetThingId.trim()) {
    return {
      targetType: 'unknown',
      source: 'not_provided',
      warnings: [
        'No target context was provided. Offense count defaults to the first offense unless target author history is available.',
      ],
    };
  }

  const targetType =
    input.targetType !== undefined && input.targetType !== 'unknown'
      ? input.targetType
      : getTargetType(input.targetThingId);
  const snapshot: ApplyPolicyTargetSnapshot = {
    targetThingId: input.targetThingId,
    targetType,
    source: 'provided',
    warnings: [],
  };

  if (input.subreddit !== undefined) {
    snapshot.subreddit = input.subreddit;
  }
  if (input.targetAuthor !== undefined) {
    snapshot.authorName = input.targetAuthor;
  } else {
    snapshot.warnings.push(
      'Target author was not provided. Offense count defaults to the first offense.'
    );
  }
  if (input.targetTitle !== undefined) {
    snapshot.title = input.targetTitle;
  }
  if (input.targetBody !== undefined) {
    snapshot.body = input.targetBody;
  }
  if (input.targetPermalink !== undefined) {
    snapshot.permalink = input.targetPermalink;
  }

  return snapshot;
}

function buildPreviewEvidence(options: {
  policy: Awaited<ReturnType<typeof getPolicyByRule>>;
  recommendation: PolicyRecommendation;
  actionHistory: AttributedModAction[];
  targetSnapshot: ApplyPolicyTargetSnapshot;
}): ApplyPolicyPreviewEvidence[] {
  const evidence: ApplyPolicyPreviewEvidence[] = [];

  if (options.policy) {
    evidence.push({
      kind: 'policy',
      label: 'Policy version',
      detail: `Using ${options.policy.ruleName} version ${options.policy.activeVersionNumber ?? 1}.`,
    });
  } else {
    evidence.push({
      kind: 'fallback',
      label: 'No policy',
      detail:
        'No active team policy exists for this rule. ModMirror recommends manual review.',
    });
  }

  if (options.targetSnapshot.source === 'provided') {
    evidence.push({
      kind: 'target',
      label: 'Target context',
      detail: `${options.targetSnapshot.targetType} ${options.targetSnapshot.targetThingId ?? ''} by ${
        options.targetSnapshot.authorName ?? 'unknown author'
      }`,
    });
  } else {
    evidence.push({
      kind: 'target',
      label: 'Target context missing',
      detail:
        'Preview was generated without a resolved Reddit post/comment target.',
    });
  }

  evidence.push({
    kind: 'history',
    label: 'Offense count',
    detail: `Offense ${options.recommendation.offenseCount} based on ${options.actionHistory.length} ModMirror-tracked prior actions. Historical Reddit mod-log matches are not counted here yet.`,
  });

  evidence.push({
    kind: 'safety',
    label: 'Execution mode',
    detail:
      'Confirming this preview records a log-only ModMirror action. It does not execute a Reddit moderation action in this wave.',
  });

  return evidence;
}

function buildConfirmationPreview(
  recommendation: PolicyRecommendation
): ApplyPolicyPreview['confirmation'] {
  const redditOperation = getRedditOperation(
    recommendation.selectedAction ?? recommendation.recommendedAction
  );
  const executionMode =
    redditOperation === 'none' ? 'log_only' : 'unverified_disabled';

  return {
    executionMode,
    willExecuteRedditAction: false,
    actionLabel: recommendation.selectedAction ?? recommendation.recommendedAction,
    requiresOverrideReason: recommendation.requiresOverrideReason,
    message:
      redditOperation === 'none'
        ? 'Confirming will write a ModMirror log-only action and optional override record. No Reddit moderation action will be attempted.'
        : 'This Reddit action is previewed but live execution is disabled until receipts and runtime proof are in place.',
    caveats: [
      'Live Reddit execution is disabled until the moderation execution and receipt waves add safety gates and runtime proof.',
      'Offense count only includes ModMirror-tracked Apply Policy actions.',
    ],
  };
}
