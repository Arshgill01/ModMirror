import { describe, expect, it, vi } from 'vitest';
import { DEMO_SUBREDDIT_NAME } from '../../shared/constants';
import { DEMO_POLICY } from '../../shared/demoData';
import type {
  ActionEvent,
  ActionReceipt,
  EvidenceBoardThread,
  OverrideEvent,
  ReviewRoomResponse,
} from '../../shared/schema';

const runMirrorScan = vi.fn();
const createPolicy = vi.fn();
const listPolicies = vi.fn();
const capturePolicySnapshot = vi.fn();
const listActionReceipts = vi.fn();
const saveActionReceipt = vi.fn();
const saveActionEvent = vi.fn();
const listOverrideEvents = vi.fn();
const saveOverrideEvent = vi.fn();
const listCalibrationScenarios = vi.fn();
const createScenarioDraft = vi.fn();
const buildDemoCalibrationScenarios = vi.fn();
const listEvidenceBoards = vi.fn();
const createEvidenceBoard = vi.fn();
const getReviewRoom = vi.fn();

vi.mock('./mirrorScan', () => ({ runMirrorScan }));
vi.mock('./policies', () => ({
  capturePolicySnapshot,
  createPolicy,
  listPolicies,
}));
vi.mock('./receipts', () => ({
  listActionReceipts,
  saveActionReceipt,
}));
vi.mock('./audit', () => ({
  listOverrideEvents,
  saveActionEvent,
  saveOverrideEvent,
}));
vi.mock('./calibration', () => ({
  buildDemoCalibrationScenarios,
  createScenarioDraft,
  listCalibrationScenarios,
}));
vi.mock('./evidenceBoard', () => ({
  createEvidenceBoard,
  listEvidenceBoards,
}));
vi.mock('./reviewRoom', () => ({ getReviewRoom }));

describe('Demo Orchestration Engine', () => {
  it('seeds the full scan-policy-apply-override-review evidence loop', async () => {
    const { resetDemoOrchestration } = await import('./demoOrchestration');
    const receipt = demoReceipt();
    const override = demoOverride();
    const board = demoBoard();
    const reviewRoom = demoReviewRoom();

    runMirrorScan.mockResolvedValue({
      totalActionsScanned: 60,
    });
    listPolicies.mockResolvedValue([DEMO_POLICY]);
    capturePolicySnapshot.mockReturnValue({
      policyId: DEMO_POLICY.id,
      policyVersionId: 'demo-policy-low-effort-v2',
      policyVersionNumber: 2,
      policyVersionStatus: 'active',
      ruleKey: DEMO_POLICY.ruleKey,
      ruleName: DEMO_POLICY.ruleName,
      steps: DEMO_POLICY.steps,
      defaultMessageMode: 'log_only',
      capturedAt: '2026-05-21T12:00:00.000Z',
    });
    listActionReceipts.mockResolvedValueOnce([]).mockResolvedValueOnce([receipt]);
    saveActionEvent.mockResolvedValue(demoAction());
    saveOverrideEvent.mockResolvedValue(override);
    saveActionReceipt.mockResolvedValue(receipt);
    listOverrideEvents.mockResolvedValue([override]);
    buildDemoCalibrationScenarios.mockReturnValue(
      Array.from({ length: 5 }, (_, index) => ({
        id: `scenario-${index}`,
        title: `Scenario ${index}`,
      }))
    );
    listCalibrationScenarios.mockResolvedValue(
      Array.from({ length: 5 }, (_, index) => ({ id: `scenario-${index}` }))
    );
    listEvidenceBoards.mockResolvedValueOnce([]).mockResolvedValueOnce([board]);
    createEvidenceBoard.mockResolvedValue(board);
    getReviewRoom.mockResolvedValue(reviewRoom);

    const manifest = await resetDemoOrchestration({ resetBy: 'demo-lead-mod' });

    expect(manifest.receiptCount).toBe(1);
    expect(manifest.overrideCount).toBe(1);
    expect(manifest.evidenceItemCount).toBe(2);
    expect(manifest.storyChecks.every((check) => check.ok)).toBe(true);
    expect(saveActionEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        source: 'demo',
        deliveryMode: 'log_only',
        recommendedAction: 'warn',
        selectedAction: 'remove',
      })
    );
    expect(saveActionReceipt).toHaveBeenCalledWith(
      expect.objectContaining({
        source: 'demo',
        executionMode: 'log_only',
        executionAttempted: false,
        executionResult: 'skipped',
        redditOperation: 'none',
      })
    );
    expect(createEvidenceBoard).toHaveBeenCalledWith(
      expect.objectContaining({
        request: expect.objectContaining({
          sourceRefs: expect.arrayContaining([
            expect.objectContaining({ source: 'receipt' }),
            expect.objectContaining({ source: 'override' }),
          ]),
        }),
      })
    );
    expect(JSON.stringify(manifest)).toContain(DEMO_SUBREDDIT_NAME);
  });
});

function demoAction(): ActionEvent {
  return {
    id: 'demo-action',
    subreddit: DEMO_SUBREDDIT_NAME,
    ruleKey: DEMO_POLICY.ruleKey,
    ruleName: DEMO_POLICY.ruleName,
    recommendedAction: 'warn',
    selectedAction: 'remove',
    deliveryMode: 'log_only',
    source: 'demo',
    createdAt: '2026-05-21T12:00:00.000Z',
  };
}

function demoOverride(): OverrideEvent {
  return {
    id: 'demo-override',
    subreddit: DEMO_SUBREDDIT_NAME,
    modUsername: 'demo-lead-mod',
    ruleKey: DEMO_POLICY.ruleKey,
    ruleName: DEMO_POLICY.ruleName,
    recommendedAction: 'warn',
    selectedAction: 'remove',
    overrideReason: 'severe_context',
    reviewStatus: 'unresolved',
    updatedAt: '2026-05-21T12:00:00.000Z',
    createdAt: '2026-05-21T12:00:00.000Z',
  };
}

function demoReceipt(): ActionReceipt {
  return {
    id: 'demo-receipt',
    actionEventId: 'demo-action',
    subreddit: DEMO_SUBREDDIT_NAME,
    targetType: 'post',
    targetSnapshot: {
      targetType: 'post',
      source: 'provided',
      warnings: [],
    },
    modUsername: 'demo-lead-mod',
    source: 'demo',
    recommendation: {
      ruleKey: DEMO_POLICY.ruleKey,
      ruleName: DEMO_POLICY.ruleName,
      policyId: DEMO_POLICY.id,
      offenseCount: 1,
      recommendedAction: 'warn',
      messageDeliveryMode: 'log_only',
      requiresOverrideReason: true,
      selectedAction: 'remove',
      deviatesFromPolicy: true,
      fallbackReason: 'policy_found',
      message: 'Team policy recommends warning.',
    },
    selectedAction: 'remove',
    deviatesFromPolicy: true,
    overrideEventId: 'demo-override',
    overrideReason: 'severe_context',
    executionMode: 'log_only',
    executionAttempted: false,
    executionResult: 'skipped',
    redditOperation: 'none',
    capabilityState: 'not_applicable',
    createdAt: '2026-05-21T12:00:00.000Z',
  };
}

function demoBoard(): EvidenceBoardThread {
  return {
    id: 'demo-board',
    subreddit: DEMO_SUBREDDIT_NAME,
    title: 'Demo Rule 2 drift evidence',
    status: 'open',
    subject: {
      ruleKey: DEMO_POLICY.ruleKey,
      policyId: DEMO_POLICY.id,
    },
    evidence: [
      {
        id: 'evidence-receipt',
        source: 'receipt',
        sourceId: 'demo-receipt',
        label: 'Action receipt',
        summary: 'Demo receipt summary.',
        occurredAt: '2026-05-21T12:00:00.000Z',
        addedAt: '2026-05-21T12:00:00.000Z',
        privacy: {
          sourceContainsAuthor: false,
          authorCopiedToBoard: false,
          contentExcerptCopiedToBoard: false,
          moderatorNameCopiedToBoard: false,
          retentionCategory: 'moderation_evidence',
          redactionNotes: ['Demo evidence.'],
        },
      },
      {
        id: 'evidence-override',
        source: 'override',
        sourceId: 'demo-override',
        label: 'Override',
        summary: 'Demo override summary.',
        occurredAt: '2026-05-21T12:00:00.000Z',
        addedAt: '2026-05-21T12:00:00.000Z',
        privacy: {
          sourceContainsAuthor: false,
          authorCopiedToBoard: false,
          contentExcerptCopiedToBoard: false,
          moderatorNameCopiedToBoard: false,
          retentionCategory: 'moderation_evidence',
          redactionNotes: ['Demo evidence.'],
        },
      },
    ],
    statusHistory: [],
    createdAt: '2026-05-21T12:00:00.000Z',
    updatedAt: '2026-05-21T12:00:00.000Z',
  };
}

function demoReviewRoom(): ReviewRoomResponse {
  return {
    subreddit: DEMO_SUBREDDIT_NAME,
    generatedAt: '2026-05-21T12:00:00.000Z',
    tasks: [
      {
        id: 'review-demo',
        subreddit: DEMO_SUBREDDIT_NAME,
        source: 'override',
        title: 'Review demo override',
        severity: 'watch',
        status: 'unresolved',
        dueSignal: 'Demo override needs review.',
        linkedEvidence: [{ label: 'Override', target: 'demo-override' }],
        nextAction: 'Review the demo exception.',
        createdAt: '2026-05-21T12:00:00.000Z',
        updatedAt: '2026-05-21T12:00:00.000Z',
      },
    ],
    trustLabels: [],
  };
}
