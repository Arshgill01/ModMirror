import { describe, expect, it } from 'vitest';
import type { EvidenceGraphNode } from './schema';
import {
  buildEvidenceGraphLanes,
  buildEvidenceGraphRelationships,
  formatEvidenceGraphMissingReference,
} from './evidenceGraphPresentation';

describe('evidence graph presentation helpers', () => {
  it('groups graph nodes into stable moderator-facing lanes', () => {
    const lanes = buildEvidenceGraphLanes(nodes());

    expect(lanes.map((lane) => lane.id)).toEqual([
      'context',
      'decisions',
      'policies',
      'audits',
    ]);
    expect(lanes.find((lane) => lane.id === 'context')?.nodes.map((node) => node.type)).toEqual([
      'content_snapshot',
      'case_packet',
    ]);
    expect(lanes.find((lane) => lane.id === 'audits')?.nodes.map((node) => node.type)).toEqual([
      'override',
      'evidence_board',
    ]);
  });

  it('turns edges into readable relationship badges without raw ids', () => {
    const relationships = buildEvidenceGraphRelationships(nodes(), [
      { from: 'receipt:1', to: 'policy:1', label: 'used policy' },
      { from: 'receipt:1', to: 'missing:1', label: 'linked missing' },
    ]);
    const first = relationships[0];
    const second = relationships[1];

    expect(first).toBeDefined();
    expect(second).toBeDefined();

    expect(first).toMatchObject({
      label: 'Used Policy',
      fromLabel: 'Receipt remove',
      toLabel: 'Low-effort questions',
      missingEndpoint: false,
    });
    expect(first?.description).not.toContain('receipt:1');
    expect(second).toMatchObject({
      label: 'Linked Missing',
      toLabel: 'missing:1',
      missingEndpoint: true,
    });
  });

  it('formats missing references by evidence type', () => {
    expect(formatEvidenceGraphMissingReference('receipt:receipt-9')).toBe(
      'Missing receipt reference: receipt-9'
    );
    expect(formatEvidenceGraphMissingReference('override:override-2')).toBe(
      'Missing override audit reference: override-2'
    );
    expect(formatEvidenceGraphMissingReference('unknown:value')).toBe(
      'Missing evidence reference: unknown:value'
    );
  });
});

function nodes(): EvidenceGraphNode[] {
  return [
    node('content_snapshot:1', 'content_snapshot', 'Content snapshot'),
    node('case_packet:1', 'case_packet', 'Case Packet'),
    node('receipt:1', 'receipt', 'Receipt remove'),
    node('policy:1', 'policy', 'Low-effort questions'),
    node('override:1', 'override', 'Override reason recorded'),
    node('evidence_board:1', 'evidence_board', 'Evidence Board'),
  ];
}

function node(
  id: string,
  type: EvidenceGraphNode['type'],
  label: string
): EvidenceGraphNode {
  return {
    id,
    type,
    label,
    detail: `${label} detail`,
    trustLabels: [],
  };
}
