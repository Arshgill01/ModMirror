import { DEMO_SUBREDDIT_NAME } from '../../shared/constants';
import { DEMO_POLICY } from '../../shared/demoData';
import type {
  ActionEvent,
  ActionReceipt,
  DemoOrchestrationManifest,
  EvidenceBoardThread,
  ModerationExecutionResult,
  OverrideEvent,
  PolicyRecommendation,
  PolicySnapshot,
  ReviewTask,
  RulePolicy,
} from '../../shared/schema';
import { saveActionEvent } from './audit';
import { listOverrideEvents, saveOverrideEvent } from './audit';
import {
  buildDemoCalibrationScenarios,
  createScenarioDraft,
  listCalibrationScenarios,
} from './calibration';
import { createEvidenceBoard, listEvidenceBoards } from './evidenceBoard';
import { runMirrorScan } from './mirrorScan';
import { capturePolicySnapshot, createPolicy, listPolicies } from './policies';
import { listActionReceipts, saveActionReceipt } from './receipts';
import { getReviewRoom } from './reviewRoom';
import { sourceTrustLabel } from './v2Trust';

export async function resetDemoOrchestration(options: {
  resetBy?: string;
} = {}): Promise<DemoOrchestrationManifest> {
  const subreddit = DEMO_SUBREDDIT_NAME;
  const scan = await runMirrorScan({
    mode: 'demo',
    depth: 'standard',
    createdBy: options.resetBy ?? 'demo-orchestrator',
  });
  await ensureDemoPolicy(options.resetBy ?? 'demo-orchestrator');
  await ensureDemoApplyArtifacts(options.resetBy ?? 'demo-orchestrator');
  await ensureDemoScenarios();
  await ensureDemoEvidenceBoard(options.resetBy ?? 'demo-orchestrator');
  const [policies, scenarios, boards, reviewRoom, receipts, overrides] = await Promise.all([
    listPolicies(subreddit),
    listCalibrationScenarios(subreddit, { activeOnly: true }),
    listEvidenceBoards(subreddit),
    getReviewRoom({ subreddit }),
    listActionReceipts(subreddit, 100),
    listOverrideEvents({ subreddit, limit: 100 }),
  ]);

  return buildDemoManifest({
    policies,
    calibrationScenarioCount: scenarios.length,
    evidenceBoards: boards,
    reviewTasks: reviewRoom.tasks,
    receiptCount: receipts.length,
    overrideCount: overrides.length,
    scanCount: scan.totalActionsScanned > 0 ? 1 : 0,
  });
}

export async function getDemoOrchestrationManifest(): Promise<DemoOrchestrationManifest> {
  const [policies, scenarios, boards, reviewRoom, receipts, overrides] =
    await Promise.all([
    listPolicies(DEMO_SUBREDDIT_NAME),
    listCalibrationScenarios(DEMO_SUBREDDIT_NAME, { activeOnly: true }),
    listEvidenceBoards(DEMO_SUBREDDIT_NAME),
    getReviewRoom({ subreddit: DEMO_SUBREDDIT_NAME }),
    listActionReceipts(DEMO_SUBREDDIT_NAME, 100),
    listOverrideEvents({ subreddit: DEMO_SUBREDDIT_NAME, limit: 100 }),
  ]);
  return buildDemoManifest({
    policies,
    calibrationScenarioCount:
      scenarios.length > 0 ? scenarios.length : buildDemoCalibrationScenarios().length,
    evidenceBoards: boards,
    reviewTasks: reviewRoom.tasks,
    receiptCount: receipts.length,
    overrideCount: overrides.length,
    scanCount: 1,
  });
}

async function ensureDemoPolicy(createdBy: string): Promise<void> {
  const policies = await listPolicies(DEMO_SUBREDDIT_NAME);
  if (policies.some((policy) => policy.ruleKey === DEMO_POLICY.ruleKey)) {
    return;
  }
  const input: Parameters<typeof createPolicy>[0] = {
    subreddit: DEMO_SUBREDDIT_NAME,
    createdBy,
    ruleKey: DEMO_POLICY.ruleKey,
    ruleName: DEMO_POLICY.ruleName,
    steps: DEMO_POLICY.steps,
    defaultMessageMode: 'log_only',
    active: true,
  };
  if (DEMO_POLICY.rulePriority !== undefined) {
    input.rulePriority = DEMO_POLICY.rulePriority;
  }
  if (DEMO_POLICY.ruleKind !== undefined) {
    input.ruleKind = DEMO_POLICY.ruleKind;
  }
  await createPolicy(input);
}

async function ensureDemoApplyArtifacts(createdBy: string): Promise<void> {
  const receipts = await listActionReceipts(DEMO_SUBREDDIT_NAME, 100);
  if (receipts.some((receipt) => receipt.id === DEMO_RECEIPT_ID)) {
    return;
  }

  const policySnapshot = capturePolicySnapshot(DEMO_POLICY) ?? demoPolicySnapshot();
  const actionEvent = await saveActionEvent(demoActionEvent(policySnapshot, createdBy));
  const overrideEvent = await saveOverrideEvent(
    demoOverrideEvent(policySnapshot, createdBy)
  );
  await saveActionReceipt(
    demoActionReceipt(policySnapshot, actionEvent, overrideEvent, createdBy)
  );
}

async function ensureDemoScenarios(): Promise<void> {
  const existing = await listCalibrationScenarios(DEMO_SUBREDDIT_NAME, {
    activeOnly: true,
  });
  if (existing.length >= buildDemoCalibrationScenarios().length) {
    return;
  }
  for (const scenario of buildDemoCalibrationScenarios()) {
    await createScenarioDraft({
      subreddit: scenario.subreddit,
      title: scenario.title,
      prompt: scenario.prompt,
      ruleKey: scenario.ruleKey,
      ruleName: scenario.ruleName,
      expectedAction: scenario.expectedAction,
      acceptableAlternatives: scenario.acceptableAlternatives,
      explanation: scenario.explanation,
      source: scenario.source,
      active: true,
      teachingReason: 'Canonical deterministic demo scenario.',
    });
  }
}

async function ensureDemoEvidenceBoard(createdBy: string): Promise<void> {
  const boards = await listEvidenceBoards(DEMO_SUBREDDIT_NAME);
  if (
    boards.some(
      (board) =>
        board.title === 'Demo Rule 2 drift evidence' && board.evidence.length > 0
    )
  ) {
    return;
  }
  await createEvidenceBoard({
    subreddit: DEMO_SUBREDDIT_NAME,
    createdBy,
    request: {
      title: 'Demo Rule 2 drift evidence',
      subject: {
        ruleKey: DEMO_POLICY.ruleKey,
        policyId: DEMO_POLICY.id,
      },
      sourceRefs: [
        {
          source: 'receipt',
          id: DEMO_RECEIPT_ID,
        },
        {
          source: 'override',
          id: DEMO_OVERRIDE_ID,
        },
      ],
      note: 'Seeded by Demo Orchestration Engine.',
    },
  });
}

function buildDemoManifest(input: {
  policies: RulePolicy[];
  calibrationScenarioCount: number;
  evidenceBoards: EvidenceBoardThread[];
  reviewTasks: ReviewTask[];
  receiptCount: number;
  overrideCount: number;
  scanCount: number;
}): DemoOrchestrationManifest {
  const policyCount = input.policies.length;
  const evidenceItemCount = input.evidenceBoards.reduce(
    (total, board) => total + board.evidence.length,
    0
  );

  return {
    subreddit: DEMO_SUBREDDIT_NAME,
    generatedAt: new Date().toISOString(),
    deterministicSeed: 'modmirror-v2-examplelearning-2026-05-21',
    scanCount: input.scanCount,
    policyCount,
    receiptCount: input.receiptCount,
    overrideCount: input.overrideCount,
    calibrationScenarioCount: input.calibrationScenarioCount,
    reviewTaskCount: input.reviewTasks.length,
    evidenceItemCount,
    storyChecks: [
      {
        id: 'scan',
        label: 'Rule 2 drift scan exists',
        ok: input.scanCount > 0,
      },
      {
        id: 'policy',
        label: 'At least one policy ladder exists',
        ok: policyCount > 0,
      },
      {
        id: 'calibration',
        label: 'Calibration scenarios are available',
        ok: input.calibrationScenarioCount >= 5,
      },
      {
        id: 'review',
        label: 'Review workflow can produce tasks',
        ok: input.reviewTasks.length > 0,
      },
      {
        id: 'apply',
        label: 'Apply Policy receipt and override exist',
        ok: input.receiptCount > 0 && input.overrideCount > 0,
      },
      {
        id: 'evidence',
        label: 'Evidence board has linked receipt context',
        ok: evidenceItemCount > 0,
      },
    ],
    trustLabels: [sourceTrustLabel('demo')],
  };
}

const DEMO_RECEIPT_ID = 'demo-v2-receipt-rule-2-override';
const DEMO_OVERRIDE_ID = 'demo-v2-override-rule-2-severe';
const DEMO_ACTION_ID = 'demo-v2-action-rule-2-override';
const DEMO_TARGET_ID = 't3_demo_v2_low_effort_case';
const DEMO_CREATED_AT = '2026-05-21T12:00:00.000Z';

function demoPolicySnapshot(): PolicySnapshot {
  return {
    policyId: DEMO_POLICY.id,
    policyVersionId: DEMO_POLICY.activeVersionId ?? 'demo-policy-low-effort-v2',
    policyVersionNumber: DEMO_POLICY.activeVersionNumber ?? 2,
    policyVersionStatus: 'active',
    ruleKey: DEMO_POLICY.ruleKey,
    ruleName: DEMO_POLICY.ruleName,
    steps: DEMO_POLICY.steps,
    defaultMessageMode: DEMO_POLICY.defaultMessageMode,
    capturedAt: DEMO_CREATED_AT,
  };
}

function demoRecommendation(policySnapshot: PolicySnapshot): PolicyRecommendation {
  return {
    ruleKey: policySnapshot.ruleKey,
    ruleName: policySnapshot.ruleName,
    policyId: policySnapshot.policyId,
    offenseCount: 1,
    recommendedAction: 'warn',
    messageDeliveryMode: 'log_only',
    requiresOverrideReason: true,
    selectedAction: 'remove',
    deviatesFromPolicy: true,
    fallbackReason: 'policy_found',
    message:
      'Team policy recommends a warning for first-time Rule 2 cases; selected action is stricter and requires an override reason.',
  };
}

function demoExecution(): ModerationExecutionResult {
  return {
    executionMode: 'log_only',
    executionAttempted: false,
    executionResult: 'skipped',
    redditOperation: 'none',
    selectedAction: 'remove',
    targetThingId: DEMO_TARGET_ID,
    targetType: 'post',
    capabilityState: 'not_applicable',
    startedAt: DEMO_CREATED_AT,
    completedAt: DEMO_CREATED_AT,
  };
}

function demoActionEvent(
  policySnapshot: PolicySnapshot,
  createdBy: string
): ActionEvent {
  return {
    id: DEMO_ACTION_ID,
    subreddit: DEMO_SUBREDDIT_NAME,
    modUsername: createdBy,
    targetThingId: DEMO_TARGET_ID,
    targetAuthor: 'demo-learner-27',
    ruleKey: policySnapshot.ruleKey,
    ruleName: policySnapshot.ruleName,
    policyId: policySnapshot.policyId,
    policyVersionId: policySnapshot.policyVersionId,
    policyVersionNumber: policySnapshot.policyVersionNumber,
    policyVersionStatus: policySnapshot.policyVersionStatus,
    policySnapshot,
    recommendedAction: 'warn',
    selectedAction: 'remove',
    deliveryMode: 'log_only',
    source: 'demo',
    execution: demoExecution(),
    createdAt: DEMO_CREATED_AT,
  };
}

function demoOverrideEvent(
  policySnapshot: PolicySnapshot,
  createdBy: string
): OverrideEvent {
  return {
    id: DEMO_OVERRIDE_ID,
    subreddit: DEMO_SUBREDDIT_NAME,
    modUsername: createdBy,
    targetThingId: DEMO_TARGET_ID,
    targetAuthor: 'demo-learner-27',
    ruleKey: policySnapshot.ruleKey,
    ruleName: policySnapshot.ruleName,
    policyId: policySnapshot.policyId,
    policyVersionId: policySnapshot.policyVersionId,
    policyVersionNumber: policySnapshot.policyVersionNumber,
    policyVersionStatus: policySnapshot.policyVersionStatus,
    policySnapshot,
    recommendedAction: 'warn',
    selectedAction: 'remove',
    overrideReason: 'severe_context',
    overrideNote:
      'Demo case included repeated copy-paste homework requests, so the moderator recorded a stricter log-only outcome for team review.',
    reviewStatus: 'unresolved',
    updatedAt: DEMO_CREATED_AT,
    createdAt: DEMO_CREATED_AT,
  };
}

function demoActionReceipt(
  policySnapshot: PolicySnapshot,
  actionEvent: ActionEvent,
  overrideEvent: OverrideEvent,
  createdBy: string
): ActionReceipt {
  const recommendation = demoRecommendation(policySnapshot);
  const receipt: ActionReceipt = {
    id: DEMO_RECEIPT_ID,
    actionEventId: actionEvent.id,
    subreddit: DEMO_SUBREDDIT_NAME,
    targetThingId: DEMO_TARGET_ID,
    targetType: 'post',
    targetSnapshot: {
      targetThingId: DEMO_TARGET_ID,
      targetType: 'post',
      subreddit: DEMO_SUBREDDIT_NAME,
      authorName: 'demo-learner-27',
      title: 'Can someone solve this assignment for me?',
      source: 'provided',
      warnings: ['Demo target snapshot; no live Reddit content was fetched.'],
    },
    contentSnapshot: {
      schemaVersion: 1,
      targetThingId: DEMO_TARGET_ID,
      targetType: 'post',
      subreddit: DEMO_SUBREDDIT_NAME,
      authorName: 'demo-learner-27',
      titleExcerpt: 'Can someone solve this assignment for me?',
      bodyExcerpt:
        'Need the full answer quickly. I have not tried anything yet.',
      fetchedAt: DEMO_CREATED_AT,
      fetchStatus: 'captured',
      source: 'demo',
      warnings: ['Seeded demo snapshot, not live subreddit content.'],
      privacy: {
        retentionCategory: 'moderation_evidence',
        authorStored: true,
        titleExcerptStored: true,
        bodyExcerptStored: true,
        permalinkStored: false,
        redactionNotes: ['Demo-only account and excerpt.'],
      },
    },
    modUsername: createdBy,
    source: 'demo',
    policySnapshot,
    recommendation,
    selectedAction: 'remove',
    deviatesFromPolicy: true,
    overrideEventId: overrideEvent.id,
    overrideReason: overrideEvent.overrideReason,
    executionMode: 'log_only',
    executionAttempted: false,
    executionResult: 'skipped',
    redditOperation: 'none',
    capabilityState: 'not_applicable',
    createdAt: DEMO_CREATED_AT,
  };
  if (overrideEvent.overrideNote !== undefined) {
    receipt.overrideNote = overrideEvent.overrideNote;
  }
  return receipt;
}
