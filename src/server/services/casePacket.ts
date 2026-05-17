import { randomUUID } from 'node:crypto';
import { DEMO_SUBREDDIT_NAME } from '../../shared/constants';
import type {
  ActionEvent,
  AppealPosture,
  CasePacket,
  CasePacketAction,
  CasePacketConsistencyStatus,
  CasePacketOverrideContext,
  CasePacketPolicyContext,
  CasePacketUserHistoryItem,
  EnforcementAction,
  GenerateCasePacketRequest,
  GenerateCasePacketResponse,
  OverrideEvent,
  PolicySnapshot,
  RulePolicy,
} from '../../shared/schema';
import { listRecentActionEvents, listRecentAuditEvents } from './audit';
import { findComparableCases } from './comparableCases';
import { getPolicyByRule } from './policies';

const DEFAULT_CASE_PACKET_WINDOW_DAYS = 30;
const DEFAULT_CASE_PACKET_MAX_CASES = 5;
const MINIMUM_HISTORY_FOR_STRONG_POSTURE = 2;

type GenerateCasePacketOptions = {
  request: GenerateCasePacketRequest;
  subreddit: string;
  generatedBy?: string;
};

type CasePacketDataSet = {
  actions: ActionEvent[];
  overrides: OverrideEvent[];
  currentPolicy: RulePolicy | undefined;
  demoMode: boolean;
};

export async function generateCasePacket(
  options: GenerateCasePacketOptions
): Promise<GenerateCasePacketResponse> {
  const request = normalizeRequest(options.request);
  const dataSet =
    request.subject.type === 'demo'
      ? getDemoCasePacketData()
      : await loadStoredCasePacketData(options.subreddit);
  const currentAction = resolveSubjectAction(request, dataSet.actions);
  if (!dataSet.demoMode && currentAction !== undefined) {
    dataSet.currentPolicy = await getPolicyByRule(
      options.subreddit,
      currentAction.ruleKey
    );
  }

  const packet = buildCasePacket({
    request,
    subreddit: dataSet.demoMode ? DEMO_SUBREDDIT_NAME : options.subreddit,
    generatedBy: options.generatedBy,
    action: currentAction,
    dataSet,
  });

  return { packet };
}

export function buildCasePacket(options: {
  request: GenerateCasePacketRequest;
  subreddit: string;
  generatedBy: string | undefined;
  action: ActionEvent | undefined;
  dataSet: CasePacketDataSet;
}): CasePacket {
  const generatedAt = new Date().toISOString();
  const action = options.action;
  const override = action
    ? findOverrideForAction(action, options.dataSet.overrides)
    : undefined;
  const policyContext = buildPolicyContext(action, options.dataSet.currentPolicy);
  const consistencyStatus = getConsistencyStatus(action);
  const userHistory = action
    ? buildUserHistory(action, options.dataSet.actions)
    : [];
  const comparableOptions: Parameters<typeof findComparableCases>[0] | undefined =
    action
      ? {
          currentAction: action,
          actions: options.dataSet.actions,
        }
      : undefined;
  if (
    comparableOptions !== undefined &&
    options.request.timeWindowDays !== undefined
  ) {
    comparableOptions.timeWindowDays = options.request.timeWindowDays;
  }
  if (
    comparableOptions !== undefined &&
    options.request.maxComparableCases !== undefined
  ) {
    comparableOptions.maxCases = options.request.maxComparableCases;
  }
  const comparableCases = comparableOptions
    ? findComparableCases(comparableOptions)
    : [];
  const caveats = buildCaveats({
    action,
    override,
    policyContext,
    userHistory,
    comparableCasesCount: comparableCases.length,
    demoMode: options.dataSet.demoMode,
  });
  const appealPosture = getAppealPosture({
    consistencyStatus,
    override,
    policyContext,
    userHistoryCount: userHistory.length,
    comparableCasesCount: comparableCases.length,
  });
  const packetBase: Omit<CasePacket, 'markdown'> = {
    id: `case-packet-${randomUUID()}`,
    generatedAt,
    subreddit: options.subreddit,
    subject: options.request.subject,
    policyContext,
    consistencyStatus,
    userHistory,
    comparableCases,
    appealPosture,
    caveats,
  };

  if (options.generatedBy !== undefined) {
    packetBase.generatedBy = options.generatedBy;
  }
  if (action !== undefined) {
    packetBase.action = toCasePacketAction(action);
  }
  const overrideContext = toOverrideContext(override);
  if (overrideContext !== undefined) {
    packetBase.overrideContext = overrideContext;
  }

  const packet: CasePacket = {
    ...packetBase,
    markdown: '',
  };
  packet.markdown = renderCasePacketMarkdown(packet);
  return packet;
}

export function getConsistencyStatus(
  action: ActionEvent | undefined
): CasePacketConsistencyStatus {
  if (!action) {
    return 'insufficient_data';
  }
  if (
    !action.policyId ||
    !action.policyVersionId ||
    action.policyVersionStatus === 'missing'
  ) {
    return 'policy_unavailable';
  }
  if (action.recommendedAction === 'manual_review') {
    return 'manual_review';
  }
  if (action.selectedAction === action.recommendedAction) {
    return 'matched_policy';
  }

  const selectedRank = getActionSeverityRank(action.selectedAction);
  const recommendedRank = getActionSeverityRank(action.recommendedAction);
  if (selectedRank === recommendedRank) {
    return 'manual_review';
  }
  return selectedRank > recommendedRank
    ? 'stricter_than_policy'
    : 'looser_than_policy';
}

export function getAppealPosture(options: {
  consistencyStatus: CasePacketConsistencyStatus;
  override: OverrideEvent | undefined;
  policyContext: CasePacketPolicyContext;
  userHistoryCount: number;
  comparableCasesCount: number;
}): AppealPosture {
  if (options.policyContext.changedSinceAction) {
    return 'policy_changed_since_action';
  }
  if (options.consistencyStatus === 'matched_policy') {
    return 'policy_consistent';
  }
  if (options.consistencyStatus === 'policy_unavailable') {
    return 'unknown';
  }
  if (
    options.userHistoryCount + options.comparableCasesCount <
    MINIMUM_HISTORY_FOR_STRONG_POSTURE
  ) {
    return 'insufficient_history';
  }
  if (
    options.override?.reviewStatus === 'accepted_exception' ||
    options.override?.reviewStatus === 'no_action_needed'
  ) {
    return 'justified_override';
  }
  if (
    options.consistencyStatus === 'stricter_than_policy' ||
    options.consistencyStatus === 'looser_than_policy' ||
    options.consistencyStatus === 'manual_review'
  ) {
    return 'review_recommended';
  }
  return 'unknown';
}

export function renderCasePacketMarkdown(packet: CasePacket): string {
  const action = packet.action;
  const override = packet.overrideContext;
  const policy = packet.policyContext;

  return [
    '# ModMirror Case Packet',
    '',
    `Generated: ${packet.generatedAt}`,
    `Subreddit: r/${packet.subreddit}`,
    `Subject: ${formatSubject(packet.subject.type, action)}`,
    '',
    '## Action Summary',
    action
      ? [
          `- Action ID: ${action.actionId ?? 'Unavailable'}`,
          `- Created: ${action.createdAt ?? 'Unavailable'}`,
          `- Rule: ${action.ruleName ?? action.ruleKey ?? 'Unavailable'}`,
          `- Recommended action: ${formatValue(action.recommendedAction)}`,
          `- Selected action: ${formatValue(action.selectedAction)}`,
          `- Target: ${action.targetThingId ?? 'Not captured'}`,
          `- Target author: ${action.targetAuthor ?? 'Not captured'}`,
        ].join('\n')
      : '- Action data was not found in ModMirror history.',
    '',
    '## Policy at Time of Action',
    [
      `- Policy: ${policy.policyName ?? policy.policyId ?? 'Unavailable'}`,
      `- Version: ${policy.policyVersionNumber ?? 'Unavailable'}`,
      `- Version status: ${formatValue(policy.policyVersionStatus)}`,
      `- Changed since action: ${policy.changedSinceAction ? 'Yes' : 'No'}`,
    ].join('\n'),
    '',
    '## Consistency Status',
    `- ${formatValue(packet.consistencyStatus)}`,
    '',
    '## Override Context',
    override
      ? [
          `- Reason: ${formatValue(override.reason)}`,
          `- Review status: ${formatValue(override.reviewStatus)}`,
          `- Reviewed by: ${override.reviewedBy ?? 'Not reviewed'}`,
          `- Note: ${override.note ?? 'None'}`,
        ].join('\n')
      : '- No override context was found for this action.',
    '',
    '## User Same-Rule History',
    packet.userHistory.length > 0
      ? packet.userHistory
          .map(
            (item) =>
              `- ${item.createdAt}: ${formatValue(item.selectedAction)} for ${item.ruleName ?? item.ruleKey ?? 'rule unavailable'} (${item.actionId})`
          )
          .join('\n')
      : '- No prior tracked same-rule actions were found for this user.',
    '',
    '## Comparable Cases',
    packet.comparableCases.length > 0
      ? packet.comparableCases
          .map(
            (item) =>
              `- ${item.createdAt}: ${formatValue(item.selectedAction)} (${item.matchReasons.join(', ')})`
          )
          .join('\n')
      : '- No deterministic comparable cases were found in the configured window.',
    '',
    '## Suggested Appeal Posture',
    `- ${formatValue(packet.appealPosture)}`,
    '',
    '## Caveats',
    packet.caveats.map((caveat) => `- ${caveat}`).join('\n'),
  ].join('\n');
}

async function loadStoredCasePacketData(
  subreddit: string
): Promise<CasePacketDataSet> {
  const actions = await listRecentActionEvents(subreddit, 500);
  const overrides = await listRecentAuditEvents(subreddit, 500);

  return {
    actions,
    overrides,
    currentPolicy: undefined,
    demoMode: false,
  };
}

function normalizeRequest(
  request: GenerateCasePacketRequest
): GenerateCasePacketRequest {
  return {
    subject: request.subject,
    timeWindowDays:
      request.timeWindowDays === undefined || request.timeWindowDays < 1
        ? DEFAULT_CASE_PACKET_WINDOW_DAYS
        : request.timeWindowDays,
    maxComparableCases:
      request.maxComparableCases === undefined || request.maxComparableCases < 1
        ? DEFAULT_CASE_PACKET_MAX_CASES
        : request.maxComparableCases,
  };
}

function resolveSubjectAction(
  request: GenerateCasePacketRequest,
  actions: ActionEvent[]
): ActionEvent | undefined {
  if (request.subject.actionId) {
    return actions.find((action) => action.id === request.subject.actionId);
  }
  if (request.subject.type === 'demo') {
    return (
      actions.find((action) => action.id === 'demo-case-r2-appeal') ??
      actions[0]
    );
  }
  if (request.subject.type === 'user_rule') {
    return actions.find((action) => {
      if (
        request.subject.username !== undefined &&
        action.targetAuthor?.toLowerCase() !==
          request.subject.username.toLowerCase()
      ) {
        return false;
      }
      if (
        request.subject.ruleKey !== undefined &&
        action.ruleKey !== request.subject.ruleKey
      ) {
        return false;
      }
      return true;
    });
  }
  return actions[0];
}

function buildPolicyContext(
  action: ActionEvent | undefined,
  currentPolicy: RulePolicy | undefined
): CasePacketPolicyContext {
  if (!action) {
    return {};
  }

  const snapshot = action.policySnapshot;
  const context: CasePacketPolicyContext = {
    ruleKey: action.ruleKey,
    activeAtActionTime: action.policyVersionStatus !== 'missing',
    changedSinceAction: false,
  };
  const policyId = action.policyId ?? snapshot?.policyId;
  const policyVersionId = action.policyVersionId ?? snapshot?.policyVersionId;
  const policyVersionNumber =
    action.policyVersionNumber ?? snapshot?.policyVersionNumber;
  const policyVersionStatus =
    action.policyVersionStatus ?? snapshot?.policyVersionStatus;
  const policyName = snapshot?.ruleName ?? action.ruleName;
  const ruleName = action.ruleName ?? snapshot?.ruleName;

  if (policyId !== undefined) {
    context.policyId = policyId;
  }
  if (policyVersionId !== undefined) {
    context.policyVersionId = policyVersionId;
  }
  if (policyVersionNumber !== undefined) {
    context.policyVersionNumber = policyVersionNumber;
  }
  if (policyVersionStatus !== undefined) {
    context.policyVersionStatus = policyVersionStatus;
  }
  if (policyName !== undefined) {
    context.policyName = policyName;
  }
  if (ruleName !== undefined) {
    context.ruleName = ruleName;
  }
  if (snapshot !== undefined) {
    context.policySnapshot = snapshot;
  }
  if (
    currentPolicy !== undefined &&
    context.policyId === currentPolicy.id &&
    context.policyVersionId !== undefined &&
    currentPolicy.activeVersionId !== undefined &&
    context.policyVersionId !== currentPolicy.activeVersionId
  ) {
    context.changedSinceAction = true;
  }

  return context;
}

function buildUserHistory(
  action: ActionEvent,
  actions: ActionEvent[]
): CasePacketUserHistoryItem[] {
  if (!action.targetAuthor) {
    return [];
  }

  const actionTime = Date.parse(action.createdAt);
  const author = action.targetAuthor.toLowerCase();
  return actions
    .filter((candidate) => {
      if (candidate.id === action.id) {
        return false;
      }
      if (candidate.ruleKey !== action.ruleKey) {
        return false;
      }
      if (candidate.targetAuthor?.toLowerCase() !== author) {
        return false;
      }
      const candidateTime = Date.parse(candidate.createdAt);
      return !Number.isNaN(candidateTime) && candidateTime <= actionTime;
    })
    .sort((left, right) => Date.parse(right.createdAt) - Date.parse(left.createdAt))
    .map((candidate) => {
      const item: CasePacketUserHistoryItem = {
        actionId: candidate.id,
        createdAt: candidate.createdAt,
        ruleKey: candidate.ruleKey,
        selectedAction: candidate.selectedAction,
        recommendedAction: candidate.recommendedAction,
        consistencyStatus: getConsistencyStatus(candidate),
      };
      if (candidate.ruleName !== undefined) {
        item.ruleName = candidate.ruleName;
      }
      if (candidate.policyVersionNumber !== undefined) {
        item.policyVersionNumber = candidate.policyVersionNumber;
      }
      return item;
    });
}

function findOverrideForAction(
  action: ActionEvent,
  overrides: OverrideEvent[]
): OverrideEvent | undefined {
  return overrides.find((override) => {
    if (override.ruleKey !== action.ruleKey) {
      return false;
    }
    if (
      override.targetThingId !== undefined &&
      action.targetThingId !== undefined &&
      override.targetThingId !== action.targetThingId
    ) {
      return false;
    }
    if (override.selectedAction !== action.selectedAction) {
      return false;
    }
    if (override.recommendedAction !== action.recommendedAction) {
      return false;
    }

    const overrideTime = Date.parse(override.createdAt);
    const actionTime = Date.parse(action.createdAt);
    return (
      !Number.isNaN(overrideTime) &&
      !Number.isNaN(actionTime) &&
      Math.abs(overrideTime - actionTime) <= 60_000
    );
  });
}

function toCasePacketAction(action: ActionEvent): CasePacketAction {
  const packetAction: CasePacketAction = {
    actionId: action.id,
    createdAt: action.createdAt,
    ruleKey: action.ruleKey,
    recommendedAction: action.recommendedAction,
    selectedAction: action.selectedAction,
    deliveryMode: action.deliveryMode,
    source: action.source,
  };
  if (action.modUsername !== undefined) {
    packetAction.moderator = action.modUsername;
  }
  if (action.targetThingId !== undefined) {
    packetAction.targetThingId = action.targetThingId;
  }
  if (action.targetAuthor !== undefined) {
    packetAction.targetAuthor = action.targetAuthor;
  }
  if (action.ruleName !== undefined) {
    packetAction.ruleName = action.ruleName;
  }
  return packetAction;
}

function toOverrideContext(
  override: OverrideEvent | undefined
): CasePacketOverrideContext | undefined {
  if (!override) {
    return undefined;
  }

  const context: CasePacketOverrideContext = {
    overrideId: override.id,
    reason: override.overrideReason,
    reviewStatus: override.reviewStatus,
  };
  if (override.overrideNote !== undefined) {
    context.note = override.overrideNote;
  }
  if (override.reviewedBy !== undefined) {
    context.reviewedBy = override.reviewedBy;
  }
  if (override.reviewedAt !== undefined) {
    context.reviewedAt = override.reviewedAt;
  }
  return context;
}

function buildCaveats(options: {
  action: ActionEvent | undefined;
  override: OverrideEvent | undefined;
  policyContext: CasePacketPolicyContext;
  userHistory: CasePacketUserHistoryItem[];
  comparableCasesCount: number;
  demoMode: boolean;
}): string[] {
  const caveats = [
    'Comparable cases are deterministic matches, not AI judgments.',
    'Historical rule attribution may be inferred and should be reviewed by a moderator.',
  ];

  if (options.demoMode) {
    caveats.push('This packet uses demo seed data, not real subreddit history.');
  }
  if (!options.action) {
    caveats.push('The requested action was not found in tracked ModMirror history.');
  }
  if (!options.policyContext.policyVersionId) {
    caveats.push('No policy version was recorded for this action.');
  }
  if (options.policyContext.changedSinceAction) {
    caveats.push('The current policy differs from the version recorded at action time.');
  }
  if (!options.override && options.action?.selectedAction !== options.action?.recommendedAction) {
    caveats.push('The action deviated from policy and no matching override record was found.');
  }
  if (options.userHistory.length === 0) {
    caveats.push('No prior tracked same-rule actions were found for this user.');
  }
  if (options.comparableCasesCount === 0) {
    caveats.push('No deterministic comparable cases were found in the configured window.');
  }

  return caveats;
}

function getActionSeverityRank(action: EnforcementAction): number {
  const ranks: Record<EnforcementAction, number> = {
    approve: 0,
    ignore_reports: 0,
    log_only: 1,
    note: 2,
    warn: 3,
    remove: 4,
    manual_review: 5,
    temporary_ban_suggested: 6,
    permanent_ban_suggested: 7,
  };

  return ranks[action];
}

function getDemoCasePacketData(): CasePacketDataSet {
  const policySnapshot = getDemoPolicySnapshot();
  const actions: ActionEvent[] = [
    demoActionEvent({
      id: 'demo-case-r2-prior-learner-1',
      createdAt: '2026-05-03T12:00:00.000Z',
      targetAuthor: 'learner_1',
      recommendedAction: 'warn',
      selectedAction: 'warn',
      policySnapshot,
    }),
    demoActionEvent({
      id: 'demo-case-r2-comparable-prior',
      createdAt: '2026-05-04T12:00:00.000Z',
      targetAuthor: 'learner_22',
      recommendedAction: 'warn',
      selectedAction: 'warn',
      policySnapshot,
    }),
    demoActionEvent({
      id: 'demo-case-r2-comparable-accepted',
      createdAt: '2026-05-14T12:00:00.000Z',
      targetAuthor: 'learner_22',
      recommendedAction: 'remove',
      selectedAction: 'temporary_ban_suggested',
      policySnapshot,
    }),
    demoActionEvent({
      id: 'demo-case-r2-comparable-followed',
      createdAt: '2026-05-15T12:00:00.000Z',
      targetAuthor: 'learner_30',
      recommendedAction: 'remove',
      selectedAction: 'remove',
      policySnapshot,
    }),
    demoActionEvent({
      id: 'demo-case-r2-appeal',
      createdAt: '2026-05-16T12:00:00.000Z',
      targetAuthor: 'learner_1',
      recommendedAction: 'remove',
      selectedAction: 'temporary_ban_suggested',
      policySnapshot,
    }),
  ];
  const overrides: OverrideEvent[] = [
    {
      id: 'demo-override-r2-appeal',
      subreddit: DEMO_SUBREDDIT_NAME,
      modUsername: 'demo_mod_2',
      targetThingId: 't3_demo_case_r2_appeal',
      targetAuthor: 'learner_1',
      ruleKey: 'low-effort-questions-2',
      ruleName: 'Low-effort questions',
      policyId: policySnapshot.policyId,
      policyVersionId: policySnapshot.policyVersionId,
      policyVersionNumber: policySnapshot.policyVersionNumber,
      policyVersionStatus: policySnapshot.policyVersionStatus,
      policySnapshot,
      recommendedAction: 'remove',
      selectedAction: 'temporary_ban_suggested',
      overrideReason: 'repeat_pattern_not_captured',
      overrideNote:
        'Moderator noted repeated low-effort pattern outside the visible thread.',
      reviewStatus: 'accepted_exception',
      reviewedBy: 'lead_mod',
      reviewedAt: '2026-05-17T09:00:00.000Z',
      reviewNote: 'Accepted because prior context was documented.',
      updatedAt: '2026-05-17T09:00:00.000Z',
      createdAt: '2026-05-16T12:00:30.000Z',
    },
  ];

  return {
    actions,
    overrides,
    currentPolicy: {
      id: policySnapshot.policyId,
      subreddit: DEMO_SUBREDDIT_NAME,
      ruleKey: policySnapshot.ruleKey,
      ruleName: policySnapshot.ruleName,
      activeVersionId: policySnapshot.policyVersionId,
      activeVersionNumber: policySnapshot.policyVersionNumber,
      createdAt: '2026-05-01T09:00:00.000Z',
      updatedAt: '2026-05-12T09:00:00.000Z',
      createdBy: 'lead_mod',
      steps: policySnapshot.steps,
      defaultMessageMode: policySnapshot.defaultMessageMode,
      active: true,
    },
    demoMode: true,
  };
}

function getDemoPolicySnapshot(): PolicySnapshot {
  return {
    policyId: 'demo-policy-rule-2',
    policyVersionId: 'demo-policy-rule-2-v2',
    policyVersionNumber: 2,
    policyVersionStatus: 'active',
    ruleKey: 'low-effort-questions-2',
    ruleName: 'Low-effort questions',
    steps: [
      {
        offenseCount: 1,
        windowDays: 30,
        recommendedAction: 'warn',
        requireOverrideReasonForDeviation: true,
      },
      {
        offenseCount: 2,
        windowDays: 30,
        recommendedAction: 'remove',
        requireOverrideReasonForDeviation: true,
      },
      {
        offenseCount: 3,
        windowDays: 30,
        recommendedAction: 'temporary_ban_suggested',
        requireOverrideReasonForDeviation: true,
      },
    ],
    defaultMessageMode: 'log_only',
    capturedAt: '2026-05-16T12:00:00.000Z',
  };
}

function demoActionEvent(options: {
  id: string;
  createdAt: string;
  targetAuthor: string;
  recommendedAction: EnforcementAction;
  selectedAction: EnforcementAction;
  policySnapshot: PolicySnapshot;
}): ActionEvent {
  return {
    id: options.id,
    subreddit: DEMO_SUBREDDIT_NAME,
    modUsername: 'demo_mod_2',
    targetThingId: `t3_${options.id.replaceAll('-', '_')}`,
    targetAuthor: options.targetAuthor,
    ruleKey: options.policySnapshot.ruleKey,
    ruleName: options.policySnapshot.ruleName,
    policyId: options.policySnapshot.policyId,
    policyVersionId: options.policySnapshot.policyVersionId,
    policyVersionNumber: options.policySnapshot.policyVersionNumber,
    policyVersionStatus: options.policySnapshot.policyVersionStatus,
    policySnapshot: options.policySnapshot,
    recommendedAction: options.recommendedAction,
    selectedAction: options.selectedAction,
    deliveryMode: 'log_only',
    source: 'demo',
    createdAt: options.createdAt,
  };
}

function formatSubject(type: string, action?: CasePacketAction): string {
  if (type === 'demo') {
    return 'Demo appeal packet';
  }
  return action?.actionId ?? type;
}

function formatValue(value: string | number | undefined): string {
  if (value === undefined) {
    return 'Unavailable';
  }
  return String(value).replaceAll('_', ' ');
}
