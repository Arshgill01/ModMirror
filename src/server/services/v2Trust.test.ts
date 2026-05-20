import { describe, expect, it } from 'vitest';
import {
  confidenceTrustLabel,
  executionTrustLabel,
  sourceTrustLabel,
} from './v2Trust';

describe('V2 trust labels', () => {
  it('labels demo, confidence, and disabled execution without overclaiming', () => {
    expect(sourceTrustLabel('demo')).toMatchObject({
      kind: 'source',
      label: 'Demo data',
    });
    expect(confidenceTrustLabel('unmatched')).toMatchObject({
      kind: 'confidence',
      tone: 'blocked',
    });
    expect(executionTrustLabel('unverified_disabled')).toMatchObject({
      kind: 'execution',
      tone: 'blocked',
    });
  });
});
