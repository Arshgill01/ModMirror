import type {
  ActionReceipt,
  EvidenceBoardThread,
  EvidenceGraphEdge,
  EvidenceGraphNode,
  EvidenceGraphResponse,
} from '../../shared/schema';
import { getOverrideEvent } from './audit';
import { getEvidenceBoard } from './evidenceBoard';
import { getActionReceipt } from './receipts';
import { confidenceTrustLabel, executionTrustLabel, privacyTrustLabel } from './v2Trust';

export type EvidenceGraphSubject =
  | { type: 'receipt'; id: string }
  | { type: 'board'; id: string };

export type EvidenceGraphDependencies = {
  getReceipt?: typeof getActionReceipt;
  getBoard?: typeof getEvidenceBoard;
  getOverride?: typeof getOverrideEvent;
};

export async function buildEvidenceGraph(options: {
  subreddit: string;
  subject: EvidenceGraphSubject;
  dependencies?: EvidenceGraphDependencies;
}): Promise<EvidenceGraphResponse> {
  const deps = {
    getReceipt: options.dependencies?.getReceipt ?? getActionReceipt,
    getBoard: options.dependencies?.getBoard ?? getEvidenceBoard,
    getOverride: options.dependencies?.getOverride ?? getOverrideEvent,
  };
  const nodes: EvidenceGraphNode[] = [];
  const edges: EvidenceGraphEdge[] = [];
  const missingReferences: string[] = [];

  if (options.subject.type === 'receipt') {
    const receipt = await deps.getReceipt(options.subreddit, options.subject.id);
    if (receipt === undefined) {
      missingReferences.push(`receipt:${options.subject.id}`);
    } else {
      await addReceiptGraph({
        receipt,
        nodes,
        edges,
        missingReferences,
        getOverride: deps.getOverride,
      });
    }
  } else {
    const board = await deps.getBoard(options.subreddit, options.subject.id);
    if (board === undefined) {
      missingReferences.push(`evidence_board:${options.subject.id}`);
    } else {
      await addBoardGraph({
        board,
        nodes,
        edges,
        missingReferences,
        getReceipt: deps.getReceipt,
        getOverride: deps.getOverride,
      });
    }
  }

  return {
    subreddit: options.subreddit,
    generatedAt: new Date().toISOString(),
    subjectId: options.subject.id,
    nodes: dedupeNodes(nodes),
    edges: dedupeEdges(edges),
    missingReferences,
    privacyNotes: [
      'Graph nodes omit target authors and moderator names.',
      'Content snapshots are summarized by capture status instead of copying full content.',
    ],
  };
}

async function addReceiptGraph(options: {
  receipt: ActionReceipt;
  nodes: EvidenceGraphNode[];
  edges: EvidenceGraphEdge[];
  missingReferences: string[];
  getOverride: typeof getOverrideEvent;
}): Promise<void> {
  const receiptId = nodeId('receipt', options.receipt.id);
  options.nodes.push(receiptNode(options.receipt));
  if (options.receipt.policySnapshot !== undefined) {
    const policyId = nodeId('policy', options.receipt.policySnapshot.policyId);
    options.nodes.push({
      id: policyId,
      type: 'policy',
      label: options.receipt.policySnapshot.ruleName,
      detail: `Policy version ${options.receipt.policySnapshot.policyVersionNumber}`,
      trustLabels: [confidenceTrustLabel('high')],
    });
    options.edges.push({ from: receiptId, to: policyId, label: 'used policy' });
  }
  if (options.receipt.contentSnapshot !== undefined) {
    const snapshotId = nodeId('content_snapshot', options.receipt.id);
    options.nodes.push({
      id: snapshotId,
      type: 'content_snapshot',
      label: 'Content snapshot',
      detail: `Capture status: ${options.receipt.contentSnapshot.fetchStatus}`,
      trustLabels: [privacyTrustLabel('Snapshot graph omits copied author fields.')],
    });
    options.edges.push({ from: receiptId, to: snapshotId, label: 'captured context' });
  }
  if (options.receipt.overrideEventId !== undefined) {
    const override = await options.getOverride(
      options.receipt.subreddit,
      options.receipt.overrideEventId
    );
    if (override === undefined) {
      options.missingReferences.push(`override:${options.receipt.overrideEventId}`);
    } else {
      const overrideId = nodeId('override', override.id);
      options.nodes.push({
        id: overrideId,
        type: 'override',
        label: 'Override reason recorded',
        detail: `Reason: ${override.overrideReason}; review: ${override.reviewStatus}`,
        trustLabels: [privacyTrustLabel()],
      });
      options.edges.push({ from: receiptId, to: overrideId, label: 'created override' });
    }
  }
}

async function addBoardGraph(options: {
  board: EvidenceBoardThread;
  nodes: EvidenceGraphNode[];
  edges: EvidenceGraphEdge[];
  missingReferences: string[];
  getReceipt: typeof getActionReceipt;
  getOverride: typeof getOverrideEvent;
}): Promise<void> {
  const boardId = nodeId('evidence_board', options.board.id);
  options.nodes.push({
    id: boardId,
    type: 'evidence_board',
    label: options.board.title,
    detail: `Board status: ${options.board.status}; evidence items: ${options.board.evidence.length}`,
    trustLabels: [privacyTrustLabel()],
  });
  for (const item of options.board.evidence) {
    if (item.source === 'receipt' && item.sourceId !== undefined) {
      const receipt = await options.getReceipt(options.board.subreddit, item.sourceId);
      if (receipt === undefined) {
        options.missingReferences.push(`receipt:${item.sourceId}`);
      } else {
        options.nodes.push(receiptNode(receipt));
        options.edges.push({
          from: boardId,
          to: nodeId('receipt', receipt.id),
          label: 'includes receipt',
        });
      }
    }
    if (item.source === 'override' && item.sourceId !== undefined) {
      const override = await options.getOverride(options.board.subreddit, item.sourceId);
      if (override === undefined) {
        options.missingReferences.push(`override:${item.sourceId}`);
      } else {
        const overrideId = nodeId('override', override.id);
        options.nodes.push({
          id: overrideId,
          type: 'override',
          label: 'Override evidence',
          detail: `Reason: ${override.overrideReason}; review: ${override.reviewStatus}`,
          trustLabels: [privacyTrustLabel()],
        });
        options.edges.push({ from: boardId, to: overrideId, label: 'includes override' });
      }
    }
  }
}

function receiptNode(receipt: ActionReceipt): EvidenceGraphNode {
  return {
    id: nodeId('receipt', receipt.id),
    type: 'receipt',
    label: `Receipt ${receipt.selectedAction.replaceAll('_', ' ')}`,
    detail: `Recommendation: ${receipt.recommendation.recommendedAction}; execution: ${receipt.executionMode}`,
    trustLabels: [
      executionTrustLabel(receipt.capabilityState),
      confidenceTrustLabel(receipt.recommendation.fallbackReason === 'policy_found' ? 'high' : 'medium'),
    ],
  };
}

function nodeId(type: EvidenceGraphNode['type'], id: string): string {
  return `${type}:${id}`;
}

function dedupeNodes(nodes: EvidenceGraphNode[]): EvidenceGraphNode[] {
  return [...new Map(nodes.map((node) => [node.id, node])).values()];
}

function dedupeEdges(edges: EvidenceGraphEdge[]): EvidenceGraphEdge[] {
  return [
    ...new Map(edges.map((edge) => [`${edge.from}:${edge.to}:${edge.label}`, edge])).values(),
  ];
}
