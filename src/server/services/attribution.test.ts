import { describe, expect, it } from 'vitest';
import {
  attributeAction,
  extractRuleNumbers,
  inferAttribution,
  tokenizeForAttribution,
} from './attribution';
import type {
  NormalizedModAction,
  NormalizedRemovalReason,
  NormalizedRule,
} from '../../shared/schema';

const rules: NormalizedRule[] = [
  {
    ruleKey: 'be-civil-1',
    ruleName: 'Be civil',
    description: 'No insults, harassment, or personal attacks.',
    priority: 1,
    source: 'demo',
  },
  {
    ruleKey: 'low-effort-questions-2',
    ruleName: 'Low-effort questions',
    description:
      'Questions need enough context, prior research, code, and a clear learning goal.',
    priority: 2,
    source: 'demo',
  },
  {
    ruleKey: 'self-promotion-3',
    ruleName: 'Self-promotion',
    description: 'No drive-by links, spam, or promotional posts.',
    priority: 3,
    source: 'demo',
  },
];

const removalReasons: NormalizedRemovalReason[] = [
  {
    id: 'rr-low-effort',
    title: 'Rule 2: Low-effort question',
    message: 'Please include code, context, and what you already tried.',
    source: 'demo',
  },
  {
    id: 'rr-self-promotion',
    title: 'Rule 3: Self-promotion',
    message: 'Promotional links should go in the weekly thread.',
    source: 'demo',
  },
];

function action(overrides: Partial<NormalizedModAction>): NormalizedModAction {
  return {
    id: 'act-test',
    subreddit: 'ExampleLearning',
    source: 'demo',
    rawActionType: 'remove',
    createdAt: '2026-05-16T00:00:00.000Z',
    ...overrides,
  };
}

describe('deterministic attribution engine', () => {
  it('extracts rule number references from action text', () => {
    expect(extractRuleNumbers('Removed under Rule 2')).toEqual([2]);
    expect(extractRuleNumbers('R3 drive-by link')).toEqual([3]);
  });

  it('normalizes hyphenated low-effort tokens for matching', () => {
    expect(tokenizeForAttribution('Low-effort questions, please!')).toContain(
      'effort'
    );
  });

  it('returns high confidence for exact rule number matches', () => {
    const result = inferAttribution(
      action({ detailsText: 'Removed: Rule 2, no prior research.' }),
      rules,
      removalReasons
    );

    expect(result).toMatchObject({
      inferredRuleKey: 'low-effort-questions-2',
      confidence: 'high',
    });
    expect(result.evidence.join(' ')).toContain('Rule 2');
  });

  it('returns high confidence when a removal reason title matches a rule', () => {
    const result = inferAttribution(
      action({ removalReasonId: 'rr-self-promotion' }),
      rules,
      removalReasons
    );

    expect(result).toMatchObject({
      inferredRuleKey: 'self-promotion-3',
      confidence: 'high',
    });
  });

  it('returns medium confidence for strong keyword overlap without exact title', () => {
    const result = inferAttribution(
      action({
        detailsText:
          'Removed because the post has no context, no code, and no clear learning goal.',
      }),
      rules,
      removalReasons
    );

    expect(result.inferredRuleKey).toBe('low-effort-questions-2');
    expect(result.confidence).toBe('medium');
  });

  it('returns unmatched for actions with no useful rule signal', () => {
    const result = inferAttribution(
      action({ rawActionType: 'sticky_post', detailsText: 'Weekly welcome' }),
      rules,
      removalReasons
    );

    expect(result).toMatchObject({
      confidence: 'unmatched',
      score: 0,
    });
  });

  it('returns high confidence for direct ModMirror metadata', () => {
    const attributed = attributeAction(
      action({
        directRuleKey: 'low-effort-questions-2',
        directRuleName: 'Low-effort questions',
      }),
      rules,
      removalReasons
    );

    expect(attributed).toMatchObject({
      inferredRuleKey: 'low-effort-questions-2',
      inferredRuleName: 'Low-effort questions',
      confidence: 'high',
    });
  });
});
