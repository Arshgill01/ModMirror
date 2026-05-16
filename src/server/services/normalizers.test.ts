import { describe, expect, it } from 'vitest';
import {
  normalizeEnforcementAction,
  normalizeModAction,
  normalizeRedditRule,
  normalizeRemovalReason,
} from './normalizers';

describe('live source normalizers', () => {
  it('normalizes subreddit rules into local rule keys', () => {
    expect(
      normalizeRedditRule({
        shortName: 'Low-effort questions',
        description: 'Needs context and code.',
        violationReason: 'No homework dumps.',
        priority: 2,
        kind: 'link',
      })
    ).toMatchObject({
      ruleKey: 'low-effort-questions-2',
      ruleName: 'Low-effort questions',
      source: 'reddit_rule',
    });
  });

  it('normalizes removal reasons without assuming rule metadata', () => {
    expect(
      normalizeRemovalReason({
        id: 'rr_1',
        title: 'Rule 2: Low-effort question',
        message: 'Add context.',
      })
    ).toEqual({
      id: 'rr_1',
      title: 'Rule 2: Low-effort question',
      message: 'Add context.',
      source: 'reddit_removal_reason',
    });
  });

  it('maps common mod action types to internal enforcement actions', () => {
    expect(normalizeEnforcementAction('removelink')).toBe('remove');
    expect(normalizeEnforcementAction('approvelink')).toBe('approve');
    expect(normalizeEnforcementAction('banuser')).toBe(
      'temporary_ban_suggested'
    );
  });

  it('normalizes moderation log actions with limited attribution text', () => {
    const action = normalizeModAction(
      {
        id: 'modaction_1',
        type: 'removelink',
        moderatorName: 'example_mod',
        createdAt: new Date('2026-05-16T00:00:00.000Z'),
        description: 'Removed under Rule 2',
        details: 'No code or context.',
        target: {
          id: 't3_demo',
          author: 'example_user',
          title: 'Help with assignment',
        },
      },
      'ExampleLearning'
    );

    expect(action).toMatchObject({
      id: 'modaction_1',
      subreddit: 'ExampleLearning',
      source: 'live',
      rawActionType: 'removelink',
      normalizedAction: 'remove',
      moderator: 'example_mod',
      targetThingId: 't3_demo',
      targetAuthor: 'example_user',
    });
    expect(action.detailsText).toContain('Rule 2');
  });
});
