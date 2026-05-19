import { describe, expect, it } from 'vitest';
import {
  normalizeRatificationSettings,
  summarizePolicyRatification,
  upsertPolicyReviewRecord,
} from './policyRatification';

describe('policy ratification helpers', () => {
  it('normalizes invalid thresholds to a one-approval minimum', () => {
    expect(
      normalizeRatificationSettings({ requiredApprovals: 0 })
    ).toMatchObject({
      requiredApprovals: 1,
      allowSingleModAdoption: true,
    });
  });

  it('summarizes latest reviewer votes against the approval threshold', () => {
    const summary = summarizePolicyRatification({
      settings: { requiredApprovals: 2, allowSingleModAdoption: false },
      reviewRecords: [
        {
          id: 'review-1',
          reviewer: 'alice',
          decision: 'approve',
          createdAt: '2026-05-18T00:00:00.000Z',
        },
        {
          id: 'review-2',
          reviewer: 'bob',
          decision: 'abstain',
          createdAt: '2026-05-18T00:01:00.000Z',
        },
      ],
    });

    expect(summary).toMatchObject({
      approvals: 1,
      abstentions: 1,
      requiredApprovals: 2,
      canAdopt: false,
    });
    expect(summary.adoptionBlockedReason).toMatch(/Requires 2 approval/);
  });

  it('replaces a prior vote from the same reviewer', () => {
    const records = upsertPolicyReviewRecord(
      [
        {
          id: 'review-1',
          reviewer: 'alice',
          decision: 'abstain',
          createdAt: '2026-05-18T00:00:00.000Z',
        },
      ],
      {
        id: 'review-2',
        reviewer: 'Alice',
        decision: 'approve',
        createdAt: '2026-05-18T00:01:00.000Z',
      }
    );

    expect(records).toHaveLength(1);
    expect(records[0]?.decision).toBe('approve');
  });
});
