import type {
  EvidenceGraphEdge,
  EvidenceGraphNode,
} from './schema';

export type EvidenceGraphLaneId = 'context' | 'decisions' | 'policies' | 'audits';

export interface EvidenceGraphLane {
  id: EvidenceGraphLaneId;
  label: string;
  description: string;
  nodes: EvidenceGraphNode[];
}

export interface EvidenceGraphRelationship {
  id: string;
  label: string;
  fromLabel: string;
  toLabel: string;
  description: string;
  missingEndpoint: boolean;
}

const LANE_DEFINITIONS: Omit<EvidenceGraphLane, 'nodes'>[] = [
  {
    id: 'context',
    label: 'Context',
    description: 'Content snapshots and case packets that explain what was reviewed.',
  },
  {
    id: 'decisions',
    label: 'Decisions',
    description: 'Receipts and moderation decisions created through ModMirror.',
  },
  {
    id: 'policies',
    label: 'Policies',
    description: 'Policy versions and rule guidance used by the decision.',
  },
  {
    id: 'audits',
    label: 'Audits',
    description: 'Overrides and evidence boards that need team review.',
  },
];

export function buildEvidenceGraphLanes(
  nodes: EvidenceGraphNode[]
): EvidenceGraphLane[] {
  return LANE_DEFINITIONS.map((lane) => ({
    ...lane,
    nodes: nodes.filter((node) => getEvidenceGraphLaneId(node) === lane.id),
  }));
}

export function getEvidenceGraphLaneId(
  node: EvidenceGraphNode
): EvidenceGraphLaneId {
  if (node.type === 'content_snapshot' || node.type === 'case_packet') {
    return 'context';
  }
  if (node.type === 'receipt') {
    return 'decisions';
  }
  if (node.type === 'policy') {
    return 'policies';
  }
  return 'audits';
}

export function buildEvidenceGraphRelationships(
  nodes: EvidenceGraphNode[],
  edges: EvidenceGraphEdge[]
): EvidenceGraphRelationship[] {
  const nodeById = new Map(nodes.map((node) => [node.id, node]));

  return edges.map((edge) => {
    const from = nodeById.get(edge.from);
    const to = nodeById.get(edge.to);
    const fromLabel = from?.label ?? edge.from;
    const toLabel = to?.label ?? edge.to;
    const missingEndpoint = from === undefined || to === undefined;

    return {
      id: `${edge.from}:${edge.to}:${edge.label}`,
      label: humanizeRelationshipLabel(edge.label),
      fromLabel,
      toLabel,
      description: missingEndpoint
        ? `Missing endpoint: ${from === undefined ? edge.from : edge.to}`
        : `${fromLabel} ${edge.label} ${toLabel}`,
      missingEndpoint,
    };
  });
}

export function formatEvidenceGraphMissingReference(reference: string): string {
  const [kind, id] = reference.split(':', 2);
  if (kind === 'receipt') {
    return `Missing receipt reference: ${id ?? reference}`;
  }
  if (kind === 'override') {
    return `Missing override audit reference: ${id ?? reference}`;
  }
  if (kind === 'evidence_board') {
    return `Missing evidence board reference: ${id ?? reference}`;
  }
  return `Missing evidence reference: ${reference}`;
}

function humanizeRelationshipLabel(label: string): string {
  return label
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join(' ');
}
