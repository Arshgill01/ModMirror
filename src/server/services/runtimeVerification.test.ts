import { describe, expect, it } from 'vitest';
import {
  buildRuntimeVerificationMatrix,
  summarizeRuntimeVerification,
} from './runtimeVerification';

describe('runtime verification matrix', () => {
  it('summarizes verification states and preserves runtime context', () => {
    const matrix = buildRuntimeVerificationMatrix(
      {
        appSlug: 'modmirror',
        subredditName: 'modmirror_dev',
        username: 'tester',
      },
      '2026-05-18T00:00:00.000Z'
    );

    expect(matrix.generatedAt).toBe('2026-05-18T00:00:00.000Z');
    expect(matrix.context).toEqual({
      appSlug: 'modmirror',
      subredditName: 'modmirror_dev',
      username: 'tester',
    });
    expect(matrix.summary.total).toBe(matrix.items.length);
    expect(matrix.summary.runtimeVerified).toBeGreaterThanOrEqual(8);
    expect(matrix.summary.disabled).toBeGreaterThanOrEqual(3);
    expect(matrix.summary.typeOnly).toBe(0);
    expect(matrix.criticalBlockers.some((item) => item.includes('Real Reddit'))).toBe(
      true
    );
  });

  it('marks destructive real execution as unsafe for normal playtest runs', () => {
    const matrix = buildRuntimeVerificationMatrix();
    const realExecution = matrix.items.find(
      (item) => item.id === 'real-remove-approve-ignore'
    );

    expect(realExecution).toMatchObject({
      status: 'disabled',
      destructive: true,
      safeToRunInPlaytest: false,
    });
  });

  it('can summarize arbitrary item sets for docs and tests', () => {
    const summary = summarizeRuntimeVerification([
      {
        id: 'a',
        category: 'entrypoint',
        capability: 'A',
        status: 'runtime_verified',
        evidence: [],
        safeToRunInPlaytest: true,
        destructive: false,
        nextAction: 'none',
      },
      {
        id: 'b',
        category: 'delivery',
        capability: 'B',
        status: 'blocked',
        evidence: [],
        safeToRunInPlaytest: false,
        destructive: false,
        nextAction: 'fix',
      },
    ]);

    expect(summary).toMatchObject({
      total: 2,
      runtimeVerified: 1,
      blocked: 1,
      disabled: 0,
    });
  });
});
