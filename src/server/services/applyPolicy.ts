import { DEMO_SUBREDDIT_NAME } from '../../shared/constants';
import { recommendPolicyAction } from '../../shared/scoring';
import type {
  ApplyPolicyConfirmInput,
  ApplyPolicyConfirmResult,
  ApplyPolicyPreview,
  ApplyPolicyPreviewInput,
  AttributedModAction,
  PolicyRecommendation,
} from '../../shared/schema';
import {
  createLogOnlyActionInput,
  listRecentActionEvents,
  saveActionEvent,
  saveOverrideEvent,
} from './audit';
import { getPolicyByRule } from './policies';

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
  const preview: ApplyPolicyPreview = {
    recommendation,
  };

  if (policy !== undefined) {
    preview.policy = policy;
  }

  return preview;
}

export async function confirmApplyPolicy(options: {
  input: ApplyPolicyConfirmInput;
  modUsername?: string;
}): Promise<ApplyPolicyConfirmResult> {
  const preview = await previewApplyPolicy(options.input);
  const recommendation = preview.recommendation;

  if (
    recommendation.requiresOverrideReason &&
    options.input.overrideReason === undefined
  ) {
    throw new Error('Override reason is required for policy deviations');
  }

  const subreddit = options.input.subreddit ?? DEMO_SUBREDDIT_NAME;
  const actionInput = createLogOnlyActionInput(createActionOptions(
    subreddit,
    recommendation,
    options.input,
    options.modUsername
  ));
  const actionEvent = await saveActionEvent(actionInput);

  const result: ApplyPolicyConfirmResult = {
    recommendation,
    actionEvent,
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
    if (options.input.targetThingId !== undefined) {
      overrideInput.targetThingId = options.input.targetThingId;
    }
    if (options.input.targetAuthor !== undefined) {
      overrideInput.targetAuthor = options.input.targetAuthor;
    }
    if (options.input.overrideNote !== undefined) {
      overrideInput.overrideNote = options.input.overrideNote;
    }

    result.overrideEvent = await saveOverrideEvent(overrideInput);
  }

  return result;
}

function createActionOptions(
  subreddit: string,
  recommendation: PolicyRecommendation,
  input: ApplyPolicyConfirmInput,
  modUsername?: string
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
}
