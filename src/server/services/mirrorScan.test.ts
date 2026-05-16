import { describe, expect, it } from 'vitest';
import {
  buildDriftCandidates,
  getConfidenceBreakdown,
  runMirrorScan,
} from './mirrorScan';
import { DEMO_DATA_LABEL } from './demoData';
import type { AttributedModAction } from '../../shared/schema';

describe('Mirror Scan service', () => {
  it('counts confidence labels across attributed actions', () => {
    const actions = [
      attributed('a1', 'high'),
      attributed('a2', 'medium'),
      attributed('a3', 'low'),
      attributed('a4', 'unmatched'),
    ];

    expect(getConfidenceBreakdown(actions)).toEqual({
      high: 1,
      medium: 1,
      low: 1,
      unmatched: 1,
    });
  });

  it('builds drift candidates from mixed enforcement outcomes', () => {
    const candidates = buildDriftCandidates([
      attributed('r2-1', 'high', 'warn'),
      attributed('r2-2', 'high', 'remove'),
      attributed('r2-3', 'medium', 'temporary_ban_suggested'),
      attributed('r3-1', 'high', 'remove', 'self-promotion-3', 'Self-promotion'),
      attributed('r3-2', 'high', 'remove', 'self-promotion-3', 'Self-promotion'),
      attributed('r3-3', 'high', 'remove', 'self-promotion-3', 'Self-promotion'),
    ]);

    expect(candidates).toHaveLength(1);
    expect(candidates[0]).toMatchObject({
      ruleKey: 'low-effort-questions-2',
      ruleName: 'Low-effort questions',
      totalActions: 3,
      actionDistribution: {
        warn: 1,
        remove: 1,
        temporary_ban_suggested: 1,
      },
    });
  });

  it('runs the demo scan through attribution and finds Rule 2 drift', async () => {
    const scan = await runMirrorScan({
      mode: 'demo',
      createdBy: 'test_mod',
    });

    expect(scan.totalActionsScanned).toBe(60);
    expect(scan.warnings).toContain(DEMO_DATA_LABEL);
    expect(
      scan.driftCandidates.some(
        (candidate) => candidate.ruleKey === 'low-effort-questions-2'
      )
    ).toBe(true);
    expect(
      Object.values(scan.confidenceBreakdown).reduce(
        (total, count) => total + count,
        0
      )
    ).toBe(scan.totalActionsScanned);
  });
});

function attributed(
  id: string,
  confidence: AttributedModAction['confidence'],
  normalizedAction: AttributedModAction['normalizedAction'] = 'remove',
  inferredRuleKey = 'low-effort-questions-2',
  inferredRuleName = 'Low-effort questions'
): AttributedModAction {
  return {
    id,
    subreddit: 'ExampleLearning',
    source: 'demo',
    rawActionType: normalizedAction,
    normalizedAction,
    createdAt: '2026-05-16T00:00:00.000Z',
    inferredRuleKey,
    inferredRuleName,
    confidence,
    evidence: ['test evidence'],
  };
}
