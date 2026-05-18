import { describe, expect, it } from 'vitest';
import {
  buildApplyPolicyResponsePreview,
  renderPolicyResponseTemplate,
} from './responseTemplates';
import type { PolicyRecommendation, RulePolicy } from './schema';

const policy: RulePolicy = {
  id: 'policy-rule-2',
  subreddit: 'ExampleLearning',
  ruleKey: 'rule-2',
  ruleName: 'Low-effort questions',
  activeVersionId: 'policy-v1',
  activeVersionNumber: 1,
  createdAt: '2026-05-16T00:00:00.000Z',
  updatedAt: '2026-05-16T00:00:00.000Z',
  createdBy: 'leadmod',
  defaultMessageMode: 'log_only',
  active: true,
  steps: [
    {
      offenseCount: 1,
      windowDays: 30,
      recommendedAction: 'warn',
      responseTemplates: {
        warning: {
          kind: 'warning',
          title: 'Warning for {{target_author}}',
          body: 'Hi {{target_author}}, Rule: {{rule_name}}. Missing: {{missing_field}}.',
          deliveryMode: 'private_message',
          enabled: true,
        },
      },
      requireOverrideReasonForDeviation: true,
    },
  ],
};

const recommendation: PolicyRecommendation = {
  ruleKey: policy.ruleKey,
  ruleName: policy.ruleName,
  policyId: policy.id,
  offenseCount: 1,
  recommendedAction: 'warn',
  messageDeliveryMode: 'log_only',
  requiresOverrideReason: false,
  selectedAction: 'warn',
  deviatesFromPolicy: false,
  fallbackReason: 'policy_found',
  message: 'Team policy recommends warn.',
};

describe('response template rendering', () => {
  it('renders step templates and records missing variables without delivery', () => {
    const preview = buildApplyPolicyResponsePreview({
      policy,
      recommendation,
      targetSnapshot: {
        targetThingId: 't3_case',
        targetType: 'post',
        authorName: 'learner_1',
        source: 'provided',
        warnings: [],
      },
    });

    expect(preview?.deliveryWillBeAttempted).toBe(false);
    expect(preview?.templates[0]).toEqual(
      expect.objectContaining({
        title: 'Warning for learner_1',
        deliveryMode: 'private_message',
        deliveryGated: true,
        missingVariables: ['missing_field'],
      })
    );
    expect(preview?.templates[0]?.body).toContain('[missing missing_field]');
    expect(preview?.warnings).toContain(
      'One or more templates contain missing variables and need review before manual delivery.'
    );
  });

  it('escapes interpolated variable values before preview display', () => {
    const rendered = renderPolicyResponseTemplate({
      template: {
        kind: 'warning',
        body: 'Author {{target_author}}',
        deliveryMode: 'private_message',
        enabled: true,
      },
      variables: {
        target_author: '<script>alert("x")</script>',
      },
    });

    expect(rendered.body).toBe(
      'Author &lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt;'
    );
    expect(rendered.body).not.toContain('<script>');
  });

  it('falls back to legacy templates before generated fallback copy', () => {
    const legacyPreview = buildApplyPolicyResponsePreview({
      policy: {
        ...policy,
        steps: [
          {
            offenseCount: 1,
            windowDays: 30,
            recommendedAction: 'remove',
            removalMessageTemplate: 'Removed for {{rule_name}}.',
            requireOverrideReasonForDeviation: true,
          },
        ],
      },
      recommendation: {
        ...recommendation,
        recommendedAction: 'remove',
      },
      targetSnapshot: {
        targetThingId: 't3_case',
        targetType: 'post',
        source: 'provided',
        warnings: [],
      },
    });

    expect(legacyPreview?.templates[0]).toEqual(
      expect.objectContaining({
        kind: 'removal_explanation',
        source: 'legacy_template',
        body: 'Removed for Low-effort questions.',
      })
    );
  });
});
