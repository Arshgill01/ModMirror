import { choosePolicyStep } from './scoring';
import type {
  ApplyPolicyResponsePreview,
  ApplyPolicyTargetSnapshot,
  EnforcementAction,
  MessageDeliveryMode,
  PolicyRecommendation,
  PolicyResponseTemplate,
  PolicyStep,
  RenderedResponseTemplate,
  ResponseTemplateKind,
  RulePolicy,
} from './schema';

const TEMPLATE_VARIABLE_PATTERN = /\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g;

const TEMPLATE_KIND_LABELS: Record<ResponseTemplateKind, string> = {
  warning: 'Warning',
  removal_explanation: 'Removal Explanation',
  mod_note_summary: 'Mod Note Summary',
  modmail_draft: 'Modmail Draft',
  private_message: 'Private Message Draft',
};

export type ResponseTemplateVariables = Record<string, string | undefined>;

export function buildApplyPolicyResponsePreview(options: {
  policy: RulePolicy | undefined;
  recommendation: PolicyRecommendation;
  targetSnapshot: ApplyPolicyTargetSnapshot;
}): ApplyPolicyResponsePreview | undefined {
  if (options.policy === undefined) {
    return undefined;
  }

  const step = choosePolicyStep(
    options.policy.steps,
    options.recommendation.offenseCount
  );
  if (step === undefined) {
    return undefined;
  }

  const variables = buildTemplateVariables({
    policy: options.policy,
    recommendation: options.recommendation,
    targetSnapshot: options.targetSnapshot,
    step,
  });
  const templates = getTemplatesForStep(step, options.recommendation)
    .map((template) =>
      renderPolicyResponseTemplate({
        template,
        variables,
      })
    );

  const warnings = [
    'Response templates are preview-only in this wave. Confirming Apply Policy does not send comments, messages, modmail, or native mod notes.',
  ];
  if (templates.length === 0) {
    warnings.push(
      'No response template exists for this policy step. Add one before using delivery copy.'
    );
  }
  if (templates.some((template) => template.missingVariables.length > 0)) {
    warnings.push(
      'One or more templates contain missing variables and need review before manual delivery.'
    );
  }

  return {
    stepOffenseCount: step.offenseCount,
    templates,
    deliveryWillBeAttempted: false,
    warnings,
  };
}

export function renderPolicyResponseTemplate(options: {
  template: PolicyResponseTemplate & { source?: RenderedResponseTemplate['source'] };
  variables: ResponseTemplateVariables;
}): RenderedResponseTemplate {
  const missingVariables = new Set<string>();
  const body = options.template.body.replace(
    TEMPLATE_VARIABLE_PATTERN,
    (_match, variableName: string) => {
      const value = options.variables[variableName];
      if (value === undefined || !value.trim()) {
        missingVariables.add(variableName);
        return `[missing ${variableName}]`;
      }
      return escapeTemplateValue(value);
    }
  );
  const title = options.template.title?.trim()
    ? renderInlineTemplate(options.template.title, options.variables, missingVariables)
    : TEMPLATE_KIND_LABELS[options.template.kind];

  return {
    kind: options.template.kind,
    title,
    body,
    deliveryMode: options.template.deliveryMode,
    source: options.template.source ?? 'policy_template',
    missingVariables: [...missingVariables].sort(),
    deliveryGated: true,
  };
}

export function normalizeResponseTemplate(
  kind: ResponseTemplateKind,
  input: PolicyResponseTemplate | undefined
): PolicyResponseTemplate | undefined {
  if (input === undefined || !input.enabled || !input.body.trim()) {
    return undefined;
  }

  const normalized: PolicyResponseTemplate = {
    kind,
    body: input.body.trim(),
    deliveryMode: normalizeDeliveryMode(input.deliveryMode),
    enabled: true,
  };
  if (input.title !== undefined && input.title.trim()) {
    normalized.title = input.title.trim();
  }
  return normalized;
}

function getTemplatesForStep(
  step: PolicyStep,
  recommendation: PolicyRecommendation
): Array<PolicyResponseTemplate & { source?: RenderedResponseTemplate['source'] }> {
  const templates = Object.values(step.responseTemplates ?? {}).filter(
    (template): template is PolicyResponseTemplate =>
      template !== undefined && template.enabled && Boolean(template.body.trim())
  );
  if (templates.length > 0) {
    return templates.map((template) => ({ ...template, source: 'policy_template' }));
  }

  const legacyTemplates = buildLegacyTemplates(step);
  if (legacyTemplates.length > 0) {
    return legacyTemplates;
  }

  return [buildFallbackTemplate(recommendation)];
}

function buildLegacyTemplates(
  step: PolicyStep
): Array<PolicyResponseTemplate & { source: 'legacy_template' }> {
  const templates: Array<PolicyResponseTemplate & { source: 'legacy_template' }> = [];
  if (step.removalMessageTemplate?.trim()) {
    templates.push({
      kind: 'removal_explanation',
      body: step.removalMessageTemplate.trim(),
      deliveryMode: 'log_only',
      enabled: true,
      source: 'legacy_template',
    });
  }
  if (step.noteTemplate?.trim()) {
    templates.push({
      kind: 'mod_note_summary',
      body: step.noteTemplate.trim(),
      deliveryMode: 'log_only',
      enabled: true,
      source: 'legacy_template',
    });
  }
  return templates;
}

function buildFallbackTemplate(
  recommendation: PolicyRecommendation
): PolicyResponseTemplate & { source: 'fallback' } {
  return {
    kind: getFallbackTemplateKind(recommendation.recommendedAction),
    body:
      'ModMirror recommends {{recommended_action}} for {{rule_name}} on offense {{offense_count}}. Review the target context before manual delivery.',
    deliveryMode: 'log_only',
    enabled: true,
    source: 'fallback',
  };
}

function getFallbackTemplateKind(
  action: EnforcementAction
): ResponseTemplateKind {
  if (action === 'warn') {
    return 'warning';
  }
  if (action === 'remove') {
    return 'removal_explanation';
  }
  if (action === 'note') {
    return 'mod_note_summary';
  }
  if (action === 'temporary_ban_suggested' || action === 'permanent_ban_suggested') {
    return 'modmail_draft';
  }
  return 'mod_note_summary';
}

function buildTemplateVariables(options: {
  policy: RulePolicy;
  recommendation: PolicyRecommendation;
  targetSnapshot: ApplyPolicyTargetSnapshot;
  step: PolicyStep;
}): ResponseTemplateVariables {
  const variables: ResponseTemplateVariables = {
    subreddit: options.policy.subreddit,
    rule_key: options.policy.ruleKey,
    rule_name: options.policy.ruleName,
    offense_count: String(options.recommendation.offenseCount),
    step_offense_count: String(options.step.offenseCount),
    recommended_action: formatAction(options.recommendation.recommendedAction),
    selected_action:
      options.recommendation.selectedAction === undefined
        ? undefined
        : formatAction(options.recommendation.selectedAction),
    target_author: options.targetSnapshot.authorName,
    target_thing_id: options.targetSnapshot.targetThingId,
    target_type: options.targetSnapshot.targetType,
    target_title: options.targetSnapshot.title,
    target_body_excerpt: options.targetSnapshot.body,
    target_permalink: options.targetSnapshot.permalink,
    policy_version:
      options.policy.activeVersionNumber === undefined
        ? undefined
        : String(options.policy.activeVersionNumber),
  };
  return variables;
}

function renderInlineTemplate(
  template: string,
  variables: ResponseTemplateVariables,
  missingVariables: Set<string>
) {
  return template.replace(
    TEMPLATE_VARIABLE_PATTERN,
    (_match, variableName: string) => {
      const value = variables[variableName];
      if (value === undefined || !value.trim()) {
        missingVariables.add(variableName);
        return `[missing ${variableName}]`;
      }
      return escapeTemplateValue(value);
    }
  );
}

function escapeTemplateValue(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
    .split('')
    .map((character) => {
      const codePoint = character.charCodeAt(0);
      return codePoint < 32 || codePoint === 127 ? ' ' : character;
    })
    .join('')
    .replace(/\s+/g, ' ')
    .trim();
}

function normalizeDeliveryMode(mode: MessageDeliveryMode): MessageDeliveryMode {
  if (
    mode === 'public_comment' ||
    mode === 'private_message' ||
    mode === 'modmail'
  ) {
    return mode;
  }
  return 'log_only';
}

function formatAction(action: EnforcementAction) {
  return action.replaceAll('_', ' ');
}
