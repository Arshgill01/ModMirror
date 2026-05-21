import type {
  ApplyPolicyConfirmResult,
  ApplyPolicyPreview,
  ActionReceipt,
  CalibrationAnswerResult,
  CalibrationPackResponse,
  CalibrationScenario,
  CasePacket,
  CommandCenterV2Response,
  CommunityHealthSummary,
  ConsistencyAnalyticsSummary,
  DemoOrchestrationManifest,
  DigestCapabilities,
  DigestReport,
  DigestSettings,
  DriftRadarResponse,
  EnforcementAction,
  EvidenceGraphResponse,
  MessageDeliveryMode,
  MirrorScan,
  MirrorScanDepth,
  MirrorScanRecord,
  NativeModNoteMode,
  OnboardingPath,
  OverrideReason,
  PolicyImpactMeasurement,
  PolicyWorkbenchResponse,
  PolicyStep,
  PolicyReplayResult,
  ReviewRoomResponse,
  RulePolicy,
  PolicySimulationResult,
} from '../../shared/schema';
import type { ProductPageId } from '../../shared/productization';

export type ScanMode = 'live' | 'demo';
export type ThemePreference = 'system' | 'light' | 'dark';
export type PolicyHealthStatus =
  | 'stable'
  | 'watch'
  | 'at_risk'
  | 'needs_review'
  | 'insufficient_data';
export type OverrideReviewStatus =
  | 'accepted_exception'
  | 'policy_needs_update'
  | 'needs_team_discussion'
  | 'no_action_needed';
export type RuntimeSmokeCheck =
  | 'redis'
  | 'redis-zset'
  | 'redis-storage'
  | 'retention-cleanup'
  | 'reddit'
  | 'access';

export interface ScanUiState {
  loading: boolean;
  mode?: ScanMode;
  depth?: MirrorScanDepth;
  error?: string;
  calibrationError?: string;
  calibrationMessage?: string;
  calibrationSavingActionId?: string;
  result?: MirrorScan;
  record?: MirrorScanRecord;
  warnings: string[];
}

export interface PolicyFormState {
  mode: 'create' | 'edit';
  policyId?: string;
  ruleKey: string;
  ruleName: string;
  defaultMessageMode: MessageDeliveryMode;
  requiredApprovals: number;
  allowSingleModAdoption: boolean;
  steps: PolicyStep[];
}

export interface PolicyUiState {
  loading: boolean;
  saving: boolean;
  error: string | undefined;
  message: string | undefined;
  policies: RulePolicy[];
  form: PolicyFormState;
}

export interface PolicyReplayUiState {
  loadingPolicyId: string | undefined;
  error: string | undefined;
  result: PolicyReplayResult | undefined;
}

export interface ApplyFormState {
  ruleKey: string;
  targetThingId: string;
  targetAuthor: string;
  targetTitle: string;
  targetBody: string;
  targetPermalink: string;
  subreddit: string;
  selectedAction: EnforcementAction;
  modNoteMode: NativeModNoteMode;
  overrideReason: OverrideReason | '';
  overrideNote: string;
}

export interface ApplyUiState {
  loading: boolean;
  confirming: boolean;
  error: string | undefined;
  message: string | undefined;
  form: ApplyFormState;
  preview: ApplyPolicyPreview | undefined;
  result: ApplyPolicyConfirmResult | undefined;
}

export interface CasePacketUiState {
  loading: boolean;
  deliverySaving: boolean;
  error: string | undefined;
  message: string | undefined;
  deliveryReceiptId: string | undefined;
  deliveryStatus: string | undefined;
  packet: CasePacket | undefined;
}

export interface PolicyHealthSummary {
  policyId: string;
  ruleKey: string;
  ruleName: string;
  status: PolicyHealthStatus;
  totalActions: number;
  followedPolicyCount: number;
  overrideCount: number;
  unresolvedOverrideCount: number;
  policySeemsWrongCount: number;
  adherenceRate: number;
  overrideRate: number;
  reasons: string[];
  recommendations: string[];
  sampleWarning?: string;
}

export interface PolicyHealthOverview {
  totalPolicies: number;
  stablePolicies: number;
  policiesNeedingReview: number;
  unresolvedOverrides: number;
  summaries: PolicyHealthSummary[];
}

export interface ReviewableOverrideEvent {
  id: string;
  subreddit: string;
  targetThingId?: string;
  targetAuthor?: string;
  ruleKey: string;
  ruleName?: string;
  recommendedAction: EnforcementAction;
  selectedAction: EnforcementAction;
  overrideReason: OverrideReason;
  overrideNote?: string;
  reviewStatus: 'unresolved' | OverrideReviewStatus;
  reviewedBy?: string;
  reviewedAt?: string;
  reviewNote?: string;
  createdAt: string;
  policyId?: string;
  policyVersionId?: string;
  policyVersionNumber?: number;
}

export interface PolicyVersionSummary {
  id: string;
  policyId: string;
  versionNumber: number;
  ruleName: string;
  createdAt: string;
  createdBy: string;
  changeReason?: string;
  changeSummary?: string;
}

export interface GovernanceUiState {
  loading: boolean;
  savingOverrideId: string | undefined;
  error: string | undefined;
  message: string | undefined;
  health: PolicyHealthOverview | undefined;
  analytics: ConsistencyAnalyticsSummary | undefined;
  communityHealth: CommunityHealthSummary | undefined;
  overrides: ReviewableOverrideEvent[];
  versionsByPolicy: Record<string, PolicyVersionSummary[]>;
  impactsByPolicy: Record<string, PolicyImpactMeasurement>;
}

export interface ReceiptLedgerUiState {
  loading: boolean;
  error?: string;
  receipts: ActionReceipt[];
}

export interface DigestUiState {
  loading: boolean;
  error: string | undefined;
  report?: DigestReport;
  history: DigestReport[];
  capabilities?: DigestCapabilities;
  settings?: DigestSettings;
  message: string | undefined;
}

export interface V2ProductUiState {
  loading: boolean;
  error: string | undefined;
  commandCenter: CommandCenterV2Response | undefined;
  policyWorkbench: PolicyWorkbenchResponse | undefined;
  calibration: CalibrationPackResponse | undefined;
  calibrationResult: CalibrationAnswerResult | undefined;
  reviewRoom: ReviewRoomResponse | undefined;
  evidenceGraph: EvidenceGraphResponse | undefined;
  demoManifest: DemoOrchestrationManifest | undefined;
  driftRadar: DriftRadarResponse | undefined;
  onboarding: OnboardingPath[] | undefined;
}

export interface QuizState {
  currentScenarioIndex: number;
  selectedActions: Record<string, EnforcementAction>;
  submittedAnswers: Record<string, boolean>;
  answerResults: Record<string, CalibrationAnswerResult>;
  submittingScenarioId: string | undefined;
  error: string | undefined;
}

export interface CalibrationQuizSummary {
  totalCount: number;
  completedCount: number;
  alignedCount: number;
  acceptableAlternativeCount: number;
  reviewRecommendedCount: number;
  completedAll: boolean;
}

export interface SimulationUiState {
  loading: boolean;
  error?: string;
  result?: PolicySimulationResult;
}

export interface GlobalState {
  dashboardOpen: boolean;
  activePage: ProductPageId;
  themePreference: ThemePreference;
  scanState: ScanUiState;
  policyState: PolicyUiState;
  policyReplayState: PolicyReplayUiState;
  applyState: ApplyUiState;
  casePacketState: CasePacketUiState;
  governanceState: GovernanceUiState;
  receiptLedgerState: ReceiptLedgerUiState;
  digestState: DigestUiState;
  v2ProductState: V2ProductUiState;
  quizState: QuizState;
  simulationState: SimulationUiState;
  driftRadarExpandedRule?: string;
}

const THEME_STORAGE_KEY = 'modmirror:theme-preference';

export function getHashRoute() {
  const raw = typeof window === 'undefined' ? '' : window.location.hash.replace('#', '');
  const [page = '', query = ''] = raw.split('?');
  return {
    page,
    params: new URLSearchParams(query),
  };
}

export function getPageFromHash(): ProductPageId {
  const page = getHashRoute().page;
  if (page === 'setup') {
    return 'act';
  }
  if (page === 'workbench') {
    return 'agree';
  }
  if (page === 'case-packets' || page === 'digest') {
    return 'prove';
  }
  return page as ProductPageId;
}

export function getApplyTargetParamsFromHash(): Partial<ApplyFormState> {
  const params = getHashRoute().params;
  const targetThingId = params.get('targetThingId')?.trim();
  if (!targetThingId) {
    return {};
  }

  const targetAuthor = params.get('targetAuthor')?.trim();
  const targetTitle = params.get('targetTitle')?.trim();
  const targetBody = params.get('targetBody')?.trim();
  const targetPermalink = params.get('targetPermalink')?.trim();
  const subreddit = params.get('subreddit')?.trim();
  const ruleKey = params.get('ruleKey')?.trim();
  return {
    ruleKey: ruleKey || '',
    targetThingId,
    targetAuthor: targetAuthor || '',
    targetTitle: targetTitle || '',
    targetBody: targetBody || '',
    targetPermalink: targetPermalink || '',
    subreddit: subreddit || '',
  };
}

export function emptyPolicyForm(): PolicyFormState {
  return {
    mode: 'create',
    ruleKey: '',
    ruleName: '',
    defaultMessageMode: 'log_only',
    requiredApprovals: 1,
    allowSingleModAdoption: true,
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
  };
}

export function emptyApplyForm(): ApplyFormState {
  const targetParams = getApplyTargetParamsFromHash();
  return {
    ruleKey: '',
    targetThingId: targetParams.targetThingId ?? 't3_demo_policy_target',
    targetAuthor: targetParams.targetAuthor ?? 'learner_1',
    targetTitle: targetParams.targetTitle ?? '',
    targetBody: targetParams.targetBody ?? '',
    targetPermalink: targetParams.targetPermalink ?? '',
    subreddit: targetParams.subreddit ?? '',
    selectedAction: 'remove',
    modNoteMode: 'log_only',
    overrideReason: '',
    overrideNote: '',
  };
}

export function emptyQuizState(): QuizState {
  return {
    currentScenarioIndex: 0,
    selectedActions: {},
    submittedAnswers: {},
    answerResults: {},
    submittingScenarioId: undefined,
    error: undefined,
  };
}

export function syncQuizStateForScenarios(
  state: QuizState,
  scenarios: CalibrationScenario[]
): QuizState {
  const scenarioIds = new Set(scenarios.map((scenario) => scenario.id));
  const lastIndex = Math.max(scenarios.length - 1, 0);
  return {
    ...state,
    currentScenarioIndex: Math.min(Math.max(state.currentScenarioIndex, 0), lastIndex),
    selectedActions: filterScenarioRecord(state.selectedActions, scenarioIds),
    submittedAnswers: filterScenarioRecord(state.submittedAnswers, scenarioIds),
    answerResults: filterScenarioRecord(state.answerResults, scenarioIds),
    submittingScenarioId:
      state.submittingScenarioId !== undefined && scenarioIds.has(state.submittingScenarioId)
        ? state.submittingScenarioId
        : undefined,
  };
}

export function buildCalibrationQuizSummary(
  scenarios: CalibrationScenario[],
  answerResults: Record<string, CalibrationAnswerResult>
): CalibrationQuizSummary {
  const scenarioIds = new Set(scenarios.map((scenario) => scenario.id));
  const results = Object.values(answerResults).filter((result) => scenarioIds.has(result.scenarioId));
  return {
    totalCount: scenarios.length,
    completedCount: results.length,
    alignedCount: results.filter((result) => result.alignment === 'aligned').length,
    acceptableAlternativeCount: results.filter(
      (result) => result.alignment === 'acceptable_alternative'
    ).length,
    reviewRecommendedCount: results.filter(
      (result) => result.alignment === 'review_recommended'
    ).length,
    completedAll: scenarios.length > 0 && results.length === scenarios.length,
  };
}

function filterScenarioRecord<T>(record: Record<string, T>, scenarioIds: Set<string>): Record<string, T> {
  return Object.fromEntries(
    Object.entries(record).filter(([scenarioId]) => scenarioIds.has(scenarioId))
  );
}

function loadThemePreference(): ThemePreference {
  try {
    if (typeof localStorage === 'undefined') {
      return 'system';
    }
    const val = localStorage.getItem(THEME_STORAGE_KEY);
    if (val === 'light' || val === 'dark' || val === 'system') {
      return val;
    }
  } catch {
    // Ignore storage blocker
  }
  return 'system';
}

function getCurrentWebViewMode(): 'expanded' | 'compact' {
  if (typeof window === 'undefined') {
    return 'compact';
  }
  const w = window as { webViewMode?: number };
  if (w.webViewMode === 2) {
    return 'expanded';
  }
  return 'compact';
}

const dashboardOpen = getCurrentWebViewMode() === 'expanded';

export const initialGlobalState: GlobalState = {
  dashboardOpen,
  activePage: dashboardOpen ? getPageFromHash() : 'act',
  themePreference: loadThemePreference(),
  scanState: {
    loading: false,
    warnings: [],
  },
  policyState: {
    loading: false,
    saving: false,
    error: undefined,
    message: undefined,
    policies: [],
    form: emptyPolicyForm(),
  },
  policyReplayState: {
    loadingPolicyId: undefined,
    error: undefined,
    result: undefined,
  },
  applyState: {
    loading: false,
    confirming: false,
    error: undefined,
    message: undefined,
    form: emptyApplyForm(),
    preview: undefined,
    result: undefined,
  },
  casePacketState: {
    loading: false,
    deliverySaving: false,
    error: undefined,
    message: undefined,
    deliveryReceiptId: undefined,
    deliveryStatus: undefined,
    packet: undefined,
  },
  governanceState: {
    loading: false,
    savingOverrideId: undefined,
    error: undefined,
    message: undefined,
    health: undefined,
    analytics: undefined,
    communityHealth: undefined,
    overrides: [],
    versionsByPolicy: {},
    impactsByPolicy: {},
  },
  receiptLedgerState: {
    loading: false,
    receipts: [],
  },
  digestState: {
    loading: false,
    error: undefined,
    history: [],
    message: undefined,
  },
  v2ProductState: {
    loading: false,
    error: undefined,
    commandCenter: undefined,
    policyWorkbench: undefined,
    calibration: undefined,
    calibrationResult: undefined,
    reviewRoom: undefined,
    evidenceGraph: undefined,
    demoManifest: undefined,
    driftRadar: undefined,
    onboarding: undefined,
  },
  quizState: {
    ...emptyQuizState(),
  },
  simulationState: {
    loading: false,
  },
};

const currentGlobalState: GlobalState = { ...initialGlobalState };

type RenderCallback = () => void;
const listeners: RenderCallback[] = [];

export function getGlobalState(): GlobalState {
  return currentGlobalState;
}

export function registerListener(cb: RenderCallback) {
  listeners.push(cb);
}

export function updateState(updater: (state: GlobalState) => void) {
  updater(currentGlobalState);
  listeners.forEach((cb) => cb());
}

export function saveThemePreference(pref: ThemePreference) {
  currentGlobalState.themePreference = pref;
  try {
    if (typeof localStorage === 'undefined') {
      return;
    }
    localStorage.setItem(THEME_STORAGE_KEY, pref);
  } catch {
    // Ignore storage issues
  }
}
