import {
  APP_NAME,
  APP_TAGLINE,
  type HealthResponse,
} from '../shared/status';
import {
  API_ROUTES,
  CONFIDENCE_VALUES,
  DEMO_SUBREDDIT_NAME,
  ENFORCEMENT_ACTION_VALUES,
  EVIDENCE_BOARD_STATUS_VALUES,
  INCIDENT_MODE_REASON_VALUES,
  MESSAGE_DELIVERY_MODE_VALUES,
  NATIVE_MOD_NOTE_MODE_VALUES,
  OVERRIDE_REASON_VALUES,
  PRIVACY_RETENTION_CATEGORY_VALUES,
  RESPONSE_TEMPLATE_KIND_VALUES,
} from '../shared/constants';
import {
  buildCommandCenterSummary,
  buildSetupSteps,
  type CommandCenterAction,
  type ProductDataMode,
  type ProductPageId,
  type SetupStep,
} from '../shared/productization';
import { DEMO_POLICY } from '../shared/demoData';
import { buildApplyPolicyResponsePreview } from '../shared/responseTemplates';
import { buildCasePacketDeliveryDraft } from '../shared/casePacketDelivery';
import {
  classifyClientError,
  classifyClipboardFailure,
  formatClientNotice,
} from '../shared/clientResilience';
import type {
  ApplyPolicyConfirmResult,
  ApplyPolicyPreview,
  ApplyPolicySource,
  AiAdvisoryCapabilities,
  ApiResponse,
  ActionReceipt,
  AttributionCorrection,
  AttributedModAction,
  CalibrationAnswerResult,
  CalibrationPackResponse,
  CalibrationScenario,
  CasePacket,
  Confidence,
  CommandCenterV2Response,
  CommunityHealthSummary,
  ConsistencyAnalyticsSummary,
  DemoOrchestrationManifest,
  DigestCapabilities,
  DigestHistoryResponse,
  DigestReport,
  DigestSettings,
  DriftCandidate,
  DriftRadarResponse,
  EnforcementAction,
  EvidenceBoardCreateRequest,
  EvidenceGraphResponse,
  EvidenceBoardListResponse,
  EvidenceBoardStatus,
  EvidenceBoardStatusUpdateRequest,
  EvidenceBoardThread,
  GenerateCasePacketRequest,
  GenerateCasePacketResponse,
  GenerateDigestResponse,
  IncidentMode,
  IncidentModeEndRequest,
  IncidentModeReason,
  IncidentModeReport,
  IncidentModeStartRequest,
  IncidentModeStateResponse,
  LaunchContextResponse,
  MessageDeliveryMode,
  MirrorScan,
  MirrorScanDepth,
  MirrorScanRecord,
  ModeratorAccessDiagnostic,
  ModqueueTriageItem,
  ModqueueTriageResponse,
  NativeModNoteMode,
  OnboardingPath,
  OverrideReason,
  PolicyImpactMeasurement,
  PolicyWorkbenchResponse,
  PolicyStep,
  PolicyReplayResult,
  PortableConfigImportResult,
  PortableConfigPackage,
  PortableConfigTemplateListResponse,
  PrivacyDeletionResult,
  PrivacyRetentionCategory,
  PrivacyRetentionExport,
  PrivacyRetentionSettings,
  RedisSmokeResult,
  RedisStorageSmokeResult,
  RedisSortedSetSmokeResult,
  RetentionCleanupSmokeResult,
  ResponseTemplateKind,
  RuntimeCapabilityHealthEvent,
  RuntimeCapabilityHealthEventInput,
  RuntimeCapabilityMatrix,
  RuntimeCapabilityMatrixEntry,
  ReviewRoomResponse,
  RulePolicy,
  TeamDeliveryChannel,
  TeamDeliveryCapabilities,
  TeamDeliveryConfirmResponse,
} from '../shared/schema';
import './styles.css';

type ScanMode = 'live' | 'demo';
type ThemePreference = 'system' | 'light' | 'dark';
type PolicyHealthStatus =
  | 'stable'
  | 'watch'
  | 'at_risk'
  | 'needs_review'
  | 'insufficient_data';
type OverrideReviewStatus =
  | 'accepted_exception'
  | 'policy_needs_update'
  | 'needs_team_discussion'
  | 'no_action_needed';
type RuntimeSmokeCheck =
  | 'redis'
  | 'redis-zset'
  | 'redis-storage'
  | 'retention-cleanup'
  | 'reddit'
  | 'access';

type Page = {
  id: ProductPageId;
  label: string;
  title: string;
  purpose: string;
};

type ScanUiState = {
  loading: boolean;
  mode?: ScanMode;
  depth?: MirrorScanDepth;
  error?: string | undefined;
  calibrationError?: string | undefined;
  calibrationMessage?: string | undefined;
  calibrationSavingActionId?: string | undefined;
  result?: MirrorScan;
  record?: MirrorScanRecord | undefined;
  warnings: string[];
};

type PolicyFormState = {
  mode: 'create' | 'edit';
  policyId?: string;
  ruleKey: string;
  ruleName: string;
  defaultMessageMode: MessageDeliveryMode;
  requiredApprovals: number;
  allowSingleModAdoption: boolean;
  steps: PolicyStep[];
};

type PolicyUiState = {
  loading: boolean;
  saving: boolean;
  error: string | undefined;
  message: string | undefined;
  policies: RulePolicy[];
  form: PolicyFormState;
};

type PolicyReplayUiState = {
  loadingPolicyId: string | undefined;
  error: string | undefined;
  result: PolicyReplayResult | undefined;
};

type ApplyUiState = {
  loading: boolean;
  confirming: boolean;
  error: string | undefined;
  message: string | undefined;
  form: ApplyFormState;
  preview: ApplyPolicyPreview | undefined;
  result: ApplyPolicyConfirmResult | undefined;
};

type ApplyFormState = {
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
};

type CasePacketUiState = {
  loading: boolean;
  deliverySaving: boolean;
  error: string | undefined;
  message: string | undefined;
  deliveryReceiptId: string | undefined;
  deliveryStatus: string | undefined;
  packet: CasePacket | undefined;
};

type PolicyHealthSummary = {
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
};

type PolicyHealthOverview = {
  totalPolicies: number;
  stablePolicies: number;
  policiesNeedingReview: number;
  unresolvedOverrides: number;
  summaries: PolicyHealthSummary[];
};

type ReviewableOverrideEvent = {
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
};

type PolicyVersionSummary = {
  id: string;
  policyId: string;
  versionNumber: number;
  ruleName: string;
  createdAt: string;
  createdBy: string;
  changeReason?: string;
  changeSummary?: string;
};

type GovernanceUiState = {
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
};

type ReceiptLedgerUiState = {
  loading: boolean;
  error?: string;
  receipts: ActionReceipt[];
};

type DigestUiState = {
  loading: boolean;
  error: string | undefined;
  report?: DigestReport;
  history: DigestReport[];
  capabilities?: DigestCapabilities;
  settings?: DigestSettings;
  message: string | undefined;
};

type AiAdvisoryUiState = {
  capabilities?: AiAdvisoryCapabilities;
  error?: string;
};

type TeamDeliveryUiState = {
  capabilities?: TeamDeliveryCapabilities;
  error?: string;
};

type EvidenceBoardUiState = {
  loading: boolean;
  saving: boolean;
  updatingBoardId: string | undefined;
  error: string | undefined;
  message: string | undefined;
  boards: EvidenceBoardThread[];
};

type IncidentModeUiState = {
  loading: boolean;
  saving: boolean;
  ending: boolean;
  error: string | undefined;
  message: string | undefined;
  active: IncidentMode | undefined;
  incidents: IncidentMode[];
  report: IncidentModeReport | undefined;
};

type ConfigPortabilityUiState = {
  loading: boolean;
  importing: boolean;
  error: string | undefined;
  message: string | undefined;
  exportedPackage: PortableConfigPackage | undefined;
  importText: string;
  importResult: PortableConfigImportResult | undefined;
  templates: PortableConfigPackage[];
};

type PrivacyRetentionUiState = {
  loading: boolean;
  saving: boolean;
  deleting: boolean;
  error: string | undefined;
  message: string | undefined;
  settings: PrivacyRetentionSettings | undefined;
  inventory: PrivacyRetentionExport | undefined;
  deletionResult: PrivacyDeletionResult | undefined;
};

type RuntimeCapabilityUiState = {
  loading: boolean;
  smokeRunning: RuntimeSmokeCheck | undefined;
  eventRecording: boolean;
  error: string | undefined;
  message: string | undefined;
  matrix: RuntimeCapabilityMatrix | undefined;
};

type ModqueueTriageUiState = {
  loading: boolean;
  error: string | undefined;
  response: ModqueueTriageResponse | undefined;
};

type V2ProductUiState = {
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
};

const THEME_STORAGE_KEY = 'modmirror:theme-preference';
const DEVVIT_INTERNAL_MESSAGE_TYPE = 'devvit-internal';
const WEB_VIEW_CLIENT_SCOPE = 0;
const WEB_VIEW_INLINE_MODE = 1;
const WEB_VIEW_IMMERSIVE_MODE = 2;
const API_TIMEOUT_MS = 12_000;

type DevvitWebViewGlobal = {
  webViewMode?: number;
};

const pages: Page[] = [
  {
    id: 'act',
    label: 'Act',
    title: 'Act',
    purpose: 'Apply the agreed policy to a post or comment and record the receipt.',
  },
  {
    id: 'scan',
    label: 'Scan',
    title: 'Mirror Scan',
    purpose: 'Compare recent moderation actions against rules and removal reasons with confidence labels.',
  },
  {
    id: 'agree',
    label: 'Agree',
    title: 'Agree',
    purpose: 'Turn drift findings into explicit rule policy ladders that moderators can apply.',
  },
  {
    id: 'review',
    label: 'Review',
    title: 'Review',
    purpose: 'Review policy health and resolve exceptions without individual blame.',
  },
  {
    id: 'prove',
    label: 'Prove',
    title: 'Prove',
    purpose: 'Package receipts, comparable cases, digest notes, and before/after consistency evidence.',
  },
  {
    id: 'settings',
    label: 'Settings',
    title: 'Settings',
    purpose: 'Inspect runtime status, data mode, delivery caveats, and demo state.',
  },
];

const app = document.querySelector<HTMLDivElement>('#app');

if (!app) {
  throw new Error('Missing #app root');
}

const appRoot = app;
let dashboardOpen = getCurrentWebViewMode() === 'expanded';
let activePage: ProductPageId = dashboardOpen ? getPageFromHash() : 'act';
let themePreference: ThemePreference = loadThemePreference();
let health: HealthResponse | undefined;
let healthError: string | undefined;
let scanState: ScanUiState = {
  loading: false,
  warnings: [],
};
let policyState: PolicyUiState = {
  loading: false,
  saving: false,
  error: undefined,
  message: undefined,
  policies: [],
  form: emptyPolicyForm(),
};
let policyReplayState: PolicyReplayUiState = {
  loadingPolicyId: undefined,
  error: undefined,
  result: undefined,
};
let applyState: ApplyUiState = {
  loading: false,
  confirming: false,
  error: undefined,
  message: undefined,
  form: emptyApplyForm(),
  preview: undefined,
  result: undefined,
};
let casePacketState: CasePacketUiState = {
  loading: false,
  deliverySaving: false,
  error: undefined,
  message: undefined,
  deliveryReceiptId: undefined,
  deliveryStatus: undefined,
  packet: undefined,
};
let governanceState: GovernanceUiState = {
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
};
let receiptLedgerState: ReceiptLedgerUiState = {
  loading: false,
  receipts: [],
};
let digestState: DigestUiState = {
  loading: false,
  error: undefined,
  history: [],
  message: undefined,
};
let aiAdvisoryState: AiAdvisoryUiState = {};
let teamDeliveryState: TeamDeliveryUiState = {};
let evidenceBoardState: EvidenceBoardUiState = {
  loading: false,
  saving: false,
  updatingBoardId: undefined,
  error: undefined,
  message: undefined,
  boards: [],
};
let incidentModeState: IncidentModeUiState = {
  loading: false,
  saving: false,
  ending: false,
  error: undefined,
  message: undefined,
  active: undefined,
  incidents: [],
  report: undefined,
};
let configPortabilityState: ConfigPortabilityUiState = {
  loading: false,
  importing: false,
  error: undefined,
  message: undefined,
  exportedPackage: undefined,
  importText: '',
  importResult: undefined,
  templates: [],
};
let privacyRetentionState: PrivacyRetentionUiState = {
  loading: false,
  saving: false,
  deleting: false,
  error: undefined,
  message: undefined,
  settings: undefined,
  inventory: undefined,
  deletionResult: undefined,
};
let runtimeCapabilityState: RuntimeCapabilityUiState = {
  loading: false,
  smokeRunning: undefined,
  eventRecording: false,
  error: undefined,
  message: undefined,
  matrix: undefined,
};
let modqueueState: ModqueueTriageUiState = {
  loading: false,
  error: undefined,
  response: undefined,
};
let v2ProductState: V2ProductUiState = {
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
};

function getPageFromHash(): ProductPageId {
  const candidate = canonicalPageId(getHashRoute().page);
  return pages.some((page) => page.id === candidate)
    ? (candidate as ProductPageId)
    : 'act';
}

function canonicalPageId(page: string): string {
  if (page === 'command-center') {
    return 'act';
  }
  if (page === 'policies') {
    return 'agree';
  }
  if (page === 'case-packets' || page === 'digest') {
    return 'prove';
  }
  return page;
}

function getHashRoute() {
  const raw = window.location.hash.replace('#', '');
  const [page = '', query = ''] = raw.split('?');
  return {
    page,
    params: new URLSearchParams(query),
  };
}

function getApplyTargetParamsFromHash(): Partial<ApplyFormState> {
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

function emptyPolicyForm(): PolicyFormState {
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

function emptyApplyForm(): ApplyFormState {
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

function render() {
  if (!dashboardOpen) {
    renderInlineLaunchCard();
    return;
  }

  const page =
    pages.find((item) => item.id === activePage) ??
    ({
      id: 'act',
      label: 'Act',
      title: 'Act',
      purpose: 'Apply the agreed policy to a post or comment and record the receipt.',
    } satisfies Page);
  const summary = buildDashboardSummary();
  applyThemePreference();

  appRoot.innerHTML = `
    <div class="ops-shell">
      <aside class="ops-rail">
        <div class="ops-brand">
          <h1>${APP_NAME}</h1>
          <p>${APP_TAGLINE}</p>
        </div>

        <nav class="ops-nav" aria-label="ModMirror sections">
          ${pages
            .map(
              (item) => `
                <button class="nav-button${item.id === page.id ? ' active' : ''}" data-page="${item.id}" type="button">
                  ${item.label}
                </button>
              `
            )
            .join('')}
        </nav>

        <dl class="rail-status" aria-label="Workspace status">
          ${renderCommandSignal('Mode', formatDataMode(summary.dataMode))}
          ${renderCommandSignal('Open overrides', summary.unresolvedOverrideCount.toString())}
          ${renderCommandSignal('Policies', summary.activePolicyCount.toString())}
          ${renderCommandSignal('Build', health?.app.version ?? 'local build')}
        </dl>
      </aside>

      <main class="ops-main page-${page.id}">
        ${renderDemoBanner(summary.dataMode)}
        ${renderRuntimeResilienceBanner()}
        ${renderIncidentBanner()}
        <header class="workspace-header">
          <div>
            <h2>${page.title}</h2>
            <p>${page.purpose}</p>
          </div>
          <div class="workspace-tools">
            ${
              summary.dataMode === 'demo'
                ? ''
                : `<span class="status-badge status-neutral">${formatDataMode(summary.dataMode)}</span>`
            }
            ${renderAppearanceControl()}
            ${renderPageAction(page.id)}
          </div>
        </header>
        ${page.id === 'act' ? renderV2CommandCenterPanel() : ''}
        ${renderPage(page.id)}
      </main>
    </div>
  `;

  bindAllActions();
}

function renderInlineLaunchCard() {
  const summary = buildDashboardSummary();
  applyThemePreference();
  appRoot.innerHTML = `
    <main class="inline-shell">
      <section class="inline-card" aria-label="ModMirror launch card">
        <div class="inline-card-main">
          <h1>${APP_NAME}</h1>
          <span class="status-badge ${summary.dataMode === 'demo' ? 'status-watch' : 'status-neutral'}">${formatDataMode(summary.dataMode)}</span>
        </div>
        <p>${APP_TAGLINE}</p>
        <dl class="inline-stats">
          <div><dt>Consistency</dt><dd>${v2ProductState.commandCenter?.consistencyScore ?? summary.consistencyScore}/100</dd></div>
          <div><dt>Top issue</dt><dd>${escapeHtml(summary.topIssue)}</dd></div>
          <div><dt>Unresolved overrides</dt><dd>${summary.unresolvedOverrideCount}</dd></div>
          <div><dt>Active policies</dt><dd>${summary.activePolicyCount}</dd></div>
        </dl>
        <button class="primary-button" data-open-dashboard type="button">Open Dashboard</button>
      </section>
    </main>
  `;

  document
    .querySelector<HTMLButtonElement>('[data-open-dashboard]')
    ?.addEventListener('click', (event) => {
      openDashboard(event);
    });
}

function renderPageAction(pageId: ProductPageId) {
  void pageId;
  return '';
}

function renderAppearanceControl() {
  const options: ThemePreference[] = ['system', 'light', 'dark'];
  return `
    <div class="appearance-toggle" role="group" aria-label="Appearance">
      ${options
        .map(
          (option) => `
            <button class="${option === themePreference ? 'active' : ''}" data-theme-option="${option}" type="button" aria-pressed="${option === themePreference}">
              ${capitalize(option)}
            </button>
          `
        )
        .join('')}
    </div>
  `;
}

function renderDemoBanner(dataMode: ProductDataMode) {
  if (dataMode !== 'demo') {
    return '';
  }
  return `
    <aside class="demo-banner" aria-label="Demo data mode">
      <strong>Demo data active</strong>
      <span>ExampleLearning is loaded for review, screenshots, and the 3-minute walkthrough. Live subreddit data remains separate.</span>
    </aside>
  `;
}

function renderRuntimeResilienceBanner() {
  const notices: string[] = [];
  if (isStandaloneStaticPreview()) {
    notices.push(
      'Static preview mode: live Reddit and Redis calls may fail. Demo data and log-only paths are labeled.'
    );
  } else if (getDevvitGlobal() === undefined) {
    notices.push(
      'Devvit WebView signal is unavailable. Use explicit confirmation paths and expect live API fallback messages.'
    );
  }
  if (healthError !== undefined) {
    notices.push(healthError);
  }
  if (notices.length === 0) {
    return '';
  }

  return `
    <aside class="runtime-banner" aria-label="Runtime resilience notice">
      ${notices.map((notice) => `<p>${escapeHtml(notice)}</p>`).join('')}
    </aside>
  `;
}

function renderIncidentBanner() {
  const active = incidentModeState.active;
  if (active === undefined || active.status !== 'active') {
    return '';
  }

  return `
    <aside class="incident-banner" aria-label="Incident Mode active">
      <div>
        <strong>Incident Mode active</strong>
        <span>${formatAction(active.reason)} until ${formatDate(active.expiresAt)}. Receipts are tagged ${escapeHtml(active.id)}.</span>
      </div>
      <button class="secondary-button compact-button" data-end-incident type="button" ${incidentModeState.ending ? 'disabled' : ''}>End incident</button>
    </aside>
  `;
}

function renderPage(pageId: ProductPageId) {
  switch (pageId) {
    case 'act':
      return renderActPage();
    case 'scan':
      return renderScanPage();
    case 'agree':
      return renderAgreePage();
    case 'review':
      return renderReviewPage();
    case 'prove':
      return renderProvePage();
    case 'settings':
      return renderSettingsPage();
  }
}

function renderActPage() {
  const summary = buildDashboardSummary();
  const setupInput: Parameters<typeof buildSetupSteps>[0] = {
    policies: policyState.policies,
    hasAppliedPolicy: applyState.result !== undefined,
    hasReviewedOverride: governanceState.overrides.some(
      (event) => event.reviewStatus !== 'unresolved'
    ),
  };
  if (scanState.result !== undefined) {
    setupInput.scan = scanState.result;
  }
  const setupSteps = buildSetupSteps(setupInput);

  return `
    <section class="act-layout" aria-label="Apply policy workflow">
      <div class="act-primary">
        ${renderApplyPolicyPanel()}
      </div>

      <aside class="act-context">
        ${renderModqueueTriagePanel(summary)}

        ${renderSetupWizard(setupSteps)}
        ${renderDemoScenario()}
      </aside>
    </section>

    ${renderReceiptLedger()}
  `;
}

function renderModqueueTriagePanel(summary: ReturnType<typeof buildDashboardSummary>) {
  const response = modqueueState.response;
  const capability = response?.capability;
  const items = response?.items ?? [];

  return `
    <div class="document-panel modqueue-panel">
      <div class="section-header">
        <div>
          <h3>Operational Queue</h3>
          <p>Read-only triage from Reddit modqueue when runtime allows it.</p>
        </div>
        <button class="secondary-button compact-button" data-load-modqueue type="button" ${modqueueState.loading ? 'disabled' : ''}>Refresh</button>
      </div>
      <dl class="signal-list">
        ${renderCommandSignal('Consistency', `${summary.consistencyScore}/100`)}
        ${renderCommandSignal('Top issue', summary.topIssue)}
        ${renderCommandSignal('Open overrides', summary.unresolvedOverrideCount.toString())}
        ${renderCommandSignal('Last scan', formatDate(summary.lastScanLabel))}
      </dl>
      ${
        capability
          ? `<p class="inline-note">${escapeHtml(capability.label)}: ${escapeHtml(capability.detail)}</p>`
          : '<p class="inline-note">Queue capability has not been loaded yet.</p>'
      }
      ${modqueueState.error ? `<p class="inline-error">${escapeHtml(modqueueState.error)}</p>` : ''}
      ${
        modqueueState.loading
          ? renderLoadingState('Loading modqueue', 'Reading Reddit modqueue items without taking action.')
          : items.length > 0
            ? `<ol class="modqueue-list">${items.map(renderModqueueTriageItem).join('')}</ol>`
            : renderModqueueEmptyState(response, summary)
      }
    </div>
  `;
}

function renderModqueueEmptyState(
  response: ModqueueTriageResponse | undefined,
  summary: ReturnType<typeof buildDashboardSummary>
) {
  if (response?.capability.state === 'failed_runtime') {
    return `<p class="inline-note">${escapeHtml(response.warnings[0] ?? 'Modqueue read failed. Use post/comment Apply Policy menus until runtime proof is complete.')}</p>`;
  }
  if (response?.capability.state === 'unsupported') {
    return `<p class="inline-note">${escapeHtml(response.capability.nextAction)}</p>`;
  }
  if (response) {
    return '<p class="inline-note">No modqueue items returned. Use post/comment menus or enter a target thing ID directly.</p>';
  }
  return `
    <button class="secondary-button" data-action-intent="${summary.primaryAction.intent}" type="button">${escapeHtml(summary.primaryAction.label)}</button>
    <p class="inline-note">${escapeHtml(getPrimaryActionCopy(summary.primaryAction.intent))}</p>
  `;
}

function renderModqueueTriageItem(item: ModqueueTriageItem) {
  const policyLabel =
    item.policyHint.ruleName ?? formatAction(item.policyHint.status);
  const title = item.title ?? item.bodyExcerpt ?? item.targetThingId;
  return `
    <li class="modqueue-item">
      <div class="modqueue-item-main">
        <strong>${escapeHtml(title)}</strong>
        <span>${escapeHtml(item.targetThingId)}${item.authorName ? ` by ${escapeHtml(item.authorName)}` : ''}</span>
      </div>
      <dl class="compact-metrics">
        <div><dt>Reports</dt><dd>${item.reportCount}</dd></div>
        <div><dt>Risk</dt><dd>${formatAction(item.riskState)}</dd></div>
        <div><dt>Policy</dt><dd>${escapeHtml(policyLabel)}</dd></div>
        <div><dt>History</dt><dd>${item.historySummary.modmirrorActionsForAuthor}</dd></div>
      </dl>
      ${
        item.reportReasons.length > 0
          ? `<p class="inline-note">Reports: ${escapeHtml(item.reportReasons.slice(0, 3).join(', '))}</p>`
          : '<p class="inline-note">No report reason text was available from the queue item.</p>'
      }
      <button class="secondary-button compact-button" data-apply-triage="${escapeAttribute(item.id)}" type="button">Apply Policy</button>
    </li>
  `;
}

function renderCommandSignal(label: string, value: string) {
  return `
    <div>
      <dt>${escapeHtml(label)}</dt>
      <dd>${escapeHtml(value)}</dd>
    </div>
  `;
}

function renderV2CommandCenterPanel() {
  const command = v2ProductState.commandCenter;
  if (v2ProductState.loading && command === undefined) {
    return renderLoadingState('Loading Command Center', 'Reading policy health, scan history, and review tasks.');
  }
  if (command === undefined) {
    return `
      <section class="command-board" aria-label="Command Center">
        <div class="command-primary">
          <div class="score-block" style="--score: 0%">
            <span class="score-label">Consistency</span>
            <strong>--<span>/100</span></strong>
            <p>Score pending</p>
          </div>
          <div class="next-action">
            <span class="eyebrow">Command Center</span>
            <h3>No Data Loaded</h3>
            <p>${escapeHtml(v2ProductState.error ?? 'Run a scan or load demo mode to populate the operational view.')}</p>
          </div>
        </div>
      </section>
    `;
  }

  return `
    <section class="command-board" aria-label="Command Center">
      <div class="command-primary">
        <div class="score-block" style="--score: ${command.consistencyScore}%">
          <span class="score-label">Consistency</span>
          <strong>${command.consistencyScore}<span>/100</span></strong>
          <p>Team alignment score</p>
        </div>
        <div class="next-action">
          <span class="eyebrow">Next Action</span>
          <h3>${escapeHtml(command.nextBestAction.label)}</h3>
          <p>${escapeHtml(command.topIssue)}.</p>
          <div class="button-row">
            <button class="primary-button" data-v2-target="${command.nextBestAction.target}" type="button">${escapeHtml(command.nextBestAction.label)}</button>
          </div>
        </div>
      </div>
      <div class="command-secondary">
        <dl class="signal-list">
          ${command.ruleHealth.slice(0, 3).map((row) => `
            <div>
              <dt>${escapeHtml(row.ruleName)}</dt>
              <dd>${formatHealthStatus(row.status)} · ${row.totalActions} actions</dd>
            </div>
          `).join('')}
        </dl>
        <div class="secondary-actions">
          <div class="status-row" style="flex-grow: 1; display: flex; gap: 8px; justify-content: flex-start; align-items: center;">
            ${command.trustLabels.map(renderTrustLabel).join('')}
          </div>
          <button class="secondary-button" data-demo-reset type="button">Reset Demo</button>
        </div>
      </div>
    </section>
    ${renderOnboardingPaths()}
  `;
}

function renderTrustLabel(label: CommandCenterV2Response['trustLabels'][number]) {
  const className =
    label.tone === 'good'
      ? 'status-good'
      : label.tone === 'blocked'
        ? 'status-danger'
        : label.tone === 'watch'
          ? 'status-watch'
          : 'status-neutral';
  return `<span class="status-badge ${className}" title="${escapeAttribute(label.detail)}">${escapeHtml(label.label)}</span>`;
}

function renderOnboardingPaths() {
  const paths = v2ProductState.onboarding;
  if (paths === undefined || paths.length === 0) {
    return '';
  }
  return `
    <section class="section-panel">
      <div class="section-header">
        <div>
          <h3>Onboarding Paths</h3>
          <p>Role-agnostic routes through scan, policy, calibration, review, and confirmed action.</p>
        </div>
      </div>
      <div class="policy-grid">
        ${paths.map((path) => `
          <article class="policy-card">
            <h4>${escapeHtml(path.label)}</h4>
            <p>${escapeHtml(formatAction(path.audience))}</p>
            <ol class="plain-note-list">
              ${path.steps.map((step) => `
                <li>
                  <button class="text-button" data-v2-target="${step.target}" type="button">${escapeHtml(step.label)}</button>
                  <span class="status-badge ${step.status === 'complete' ? 'status-good' : step.status === 'current' ? 'status-watch' : 'status-neutral'}">${escapeHtml(step.status)}</span>
                </li>
              `).join('')}
            </ol>
          </article>
        `).join('')}
      </div>
    </section>
  `;
}

function renderSetupWizard(steps: SetupStep[]) {
  return `
    <div class="setup-workflow">
      <div class="section-header">
        <div>
          <h3>Guided Setup</h3>
          <p>Use live subreddit data or the ExampleLearning demo scenario to complete the consistency loop.</p>
        </div>
        <div class="button-row">
          <button class="secondary-button" data-run-scan="live" type="button">Live Scan</button>
          <button class="primary-button" data-run-scan="demo" type="button">Load Demo</button>
        </div>
      </div>
      <ol class="setup-list">
        ${steps
          .map(
            (step) => `
              <li class="${step.status}">
                <span>${formatStepStatus(step.status)}</span>
                <strong>${escapeHtml(step.title)}</strong>
                <button class="text-button" data-action-intent="${step.action.intent}" type="button">${escapeHtml(step.action.label)}</button>
              </li>
            `
          )
          .join('')}
      </ol>
    </div>
  `;
}

function renderDemoScenario() {
  return `
    <aside class="demo-story">
      <div>
        <h3>ExampleLearning Demo Scenario</h3>
        <p>Rule 2 first-time low-effort questions show warnings, removal-only actions, and temporary-ban suggestions. The demo is labeled and separate from live subreddit data.</p>
      </div>
      <div class="story-steps">
        <span>Scan drift</span>
        <span>Create Rule 2 policy</span>
        <span>Apply sample</span>
        <span>Review override</span>
        <span>Export case context</span>
      </div>
    </aside>
  `;
}

function renderScanPage() {
  return `
    <section class="section-panel">
      <div class="section-header">
        <div>
          <h3>Run Mirror Scan</h3>
          <p>Live scans use Reddit sources when available. Demo scans use deterministic ExampleLearning data.</p>
        </div>
        <div class="button-row">
          <button class="secondary-button" data-run-scan="demo" ${scanState.loading ? 'disabled' : ''} type="button">Use Demo Data</button>
          <button class="secondary-button" data-run-scan="live" data-scan-depth="quick" ${scanState.loading ? 'disabled' : ''} type="button">Quick Live Scan</button>
          <button class="primary-button" data-run-scan="live" data-scan-depth="standard" ${scanState.loading ? 'disabled' : ''} type="button">Standard Live Scan</button>
          <button class="secondary-button" data-run-scan="live" data-scan-depth="deep" ${scanState.loading ? 'disabled' : ''} type="button">Deep Live Scan</button>
        </div>
      </div>
    </section>
    ${renderScanWarnings()}
    ${renderScanBody()}
  `;
}

function renderScanWarnings() {
  if (scanState.warnings.length === 0) {
    return '';
  }
  return `
    <section class="notice-list" aria-label="Scan warnings">
      ${scanState.warnings.map((warning) => `<p>${escapeHtml(warning)}</p>`).join('')}
    </section>
  `;
}

function renderScanBody() {
  if (scanState.loading) {
    return renderLoadingState('Scanning moderation history', 'Loading actions, rules, removal reasons, and deterministic attribution output.');
  }
  if (scanState.error) {
    return renderEmptyState('Scan could not complete', scanState.error, [
      { label: 'Load Demo Scenario', page: 'scan', intent: 'load_demo' },
    ]);
  }
  if (!scanState.result) {
    return renderEmptyState(
      'No scan yet',
      'Run a live scan or load the demo scenario to see drift candidates and confidence labels.',
      [
        { label: 'Run Scan', page: 'scan', intent: 'run_scan' },
        { label: 'Load Demo Scenario', page: 'scan', intent: 'load_demo' },
      ]
    );
  }

  return `
    ${renderScanSummary(scanState.result)}
    ${renderV2DriftRadarPanel()}
    ${renderAttributionCalibrationPanel()}
    ${renderDriftCandidates(scanState.result.driftCandidates)}
  `;
}

function renderScanSummary(scan: MirrorScan) {
  return `
    <section class="metric-grid" aria-label="Scan summary">
      ${renderMetricCard('Source', formatDataMode(scan.source as ProductDataMode))}
      ${renderMetricCard('Depth', formatScanDepth(scan.scanDepth.depth))}
      ${renderMetricCard('Actions scanned', scan.totalActionsScanned.toString())}
      ${renderMetricCard('Attributed', scan.attributedCount.toString())}
      ${renderMetricCard('Unmatched', scan.unmatchedCount.toString())}
    </section>
    <section class="section-panel">
      <div class="section-header">
        <div>
          <h3>Confidence Breakdown</h3>
          <p>Historical rule labels remain inferred and confidence-scored. Scan requested ${scan.scanDepth.requestedLimit} actions with page size ${scan.scanDepth.pageSize}.</p>
        </div>
        <span class="status-badge status-neutral">${escapeHtml(scan.smallSubredditStatus.message)}</span>
      </div>
      <div class="confidence-grid">
        ${CONFIDENCE_VALUES.map((confidence) =>
          renderConfidenceItem(confidence, scan.confidenceBreakdown[confidence])
        ).join('')}
      </div>
    </section>
  `;
}

function renderV2DriftRadarPanel() {
  const radar = v2ProductState.driftRadar;
  if (radar === undefined) {
    return '';
  }
  return `
    <section class="section-panel">
      <div class="section-header">
        <div>
          <h3>Drift Radar</h3>
          <p>Rule-level action spread, confidence mix, and representative cases without copied author names.</p>
        </div>
        <span class="status-badge status-neutral">${escapeHtml(formatDataMode(radar.dataMode as ProductDataMode))}</span>
      </div>
      <div class="policy-grid">
        ${radar.details.slice(0, 3).map((detail) => `
          <article class="policy-card">
            <h4>${escapeHtml(detail.ruleName)}</h4>
            <p>${escapeHtml(detail.whyFlagged[0] ?? 'No drift explanation available.')}</p>
            <dl class="compact-metrics">
              <div><dt>Actions</dt><dd>${detail.totalActions}</dd></div>
              <div><dt>Unmatched</dt><dd>${detail.unmatchedCount}</dd></div>
              <div><dt>Cases</dt><dd>${detail.representativeCases.length}</dd></div>
            </dl>
            <p class="inline-note">${escapeHtml(detail.policyQuestions[0] ?? 'Review this rule with the team.')}</p>
          </article>
        `).join('')}
      </div>
    </section>
  `;
}

function renderAttributionCalibrationPanel() {
  const record = scanState.record;
  if (record === undefined) {
    return `
      <section class="section-panel">
        <div class="section-header">
          <div>
            <h3>Attribution Calibration</h3>
            <p>Run through Devvit runtime to load saved scan actions and correct inferred rule matches.</p>
          </div>
        </div>
      </section>
    `;
  }

  const calibratable = record.attributedActions
    .filter((action) => action.attributionKind !== 'direct')
    .slice(0, 8);

  return `
    <section class="section-panel calibration-panel" aria-label="Attribution calibration">
      <div class="section-header">
        <div>
          <h3>Attribution Calibration</h3>
          <p>Corrections are stored separately and applied to future scans with correction evidence.</p>
          ${scanState.calibrationError ? `<p class="inline-error">${escapeHtml(scanState.calibrationError)}</p>` : ''}
          ${scanState.calibrationMessage ? `<p class="inline-success">${escapeHtml(scanState.calibrationMessage)}</p>` : ''}
        </div>
      </div>
      ${
        calibratable.length > 0
          ? `<ol class="calibration-list">${calibratable.map(renderCalibrationItem).join('')}</ol>`
          : '<p class="inline-note">No inferred or unmatched actions were stored for this scan.</p>'
      }
    </section>
  `;
}

function renderCalibrationItem(action: AttributedModAction) {
  const correction = action.correction;
  const currentRule = action.inferredRuleName ?? action.inferredRuleKey ?? 'Unmatched';
  const correctedRuleName = correction?.correctedRuleName ?? action.inferredRuleName ?? '';
  const correctedRuleKey = correction?.correctedRuleKey ?? action.inferredRuleKey ?? '';

  return `
    <li class="calibration-item">
      <div class="calibration-item-main">
        <strong>${escapeHtml(currentRule)}</strong>
        <span>${escapeHtml(action.id)} · ${escapeHtml(action.rawActionType)} · ${escapeHtml(action.confidence)}</span>
      </div>
      <p class="inline-note">${escapeHtml(action.evidence[0] ?? 'No attribution evidence recorded.')}</p>
      <form class="calibration-form" data-calibration-form>
        <input type="hidden" name="actionId" value="${escapeAttribute(action.id)}">
        <input type="hidden" name="targetThingId" value="${escapeAttribute(action.targetThingId ?? '')}">
        <input type="hidden" name="sourceScanId" value="${escapeAttribute(scanState.record?.id ?? '')}">
        <input type="hidden" name="originalRuleKey" value="${escapeAttribute(action.inferredRuleKey ?? '')}">
        <input type="hidden" name="originalRuleName" value="${escapeAttribute(action.inferredRuleName ?? '')}">
        <input type="hidden" name="originalConfidence" value="${escapeAttribute(action.confidence)}">
        <label>
          Corrected rule key
          <input name="correctedRuleKey" value="${escapeAttribute(correctedRuleKey)}" required>
        </label>
        <label>
          Corrected rule name
          <input name="correctedRuleName" value="${escapeAttribute(correctedRuleName)}">
        </label>
        <label>
          Note
          <input name="note" value="${escapeAttribute(correction?.note ?? '')}" placeholder="Optional team context">
        </label>
        <button class="secondary-button compact-button" type="submit" ${scanState.calibrationSavingActionId === action.id ? 'disabled' : ''}>Save correction</button>
      </form>
    </li>
  `;
}

function renderDriftCandidates(candidates: DriftCandidate[]) {
  if (candidates.length === 0) {
    return renderEmptyState(
      'No drift candidates yet',
      'Create a policy now or keep scanning as more moderation history accumulates.',
      [{ label: 'Create Policy', page: 'agree', intent: 'create_policy' }]
    );
  }

  return `
    <section class="card-list" aria-label="Drift candidates">
      ${candidates.map(renderDriftCandidate).join('')}
    </section>
  `;
}

function renderDriftCandidate(candidate: DriftCandidate, index?: number) {
  return `
    <article class="action-card">
      <div class="card-header">
        <div>
          <h3>${escapeHtml(candidate.ruleName)}</h3>
          <p>${escapeHtml(candidate.summary)}</p>
        </div>
        <span class="status-badge confidence-${candidate.confidence}">${candidate.confidence}</span>
      </div>
      <div class="distribution-grid">
        ${Object.entries(candidate.actionDistribution)
          .map(([action, count]) =>
            renderDistributionItem(action as EnforcementAction, count ?? 0)
          )
          .join('')}
      </div>
      <p class="recommendation">${escapeHtml(candidate.recommendation)}</p>
      <button class="secondary-button" data-create-from-drift="${index ?? ''}" type="button">Create policy from drift</button>
    </article>
  `;
}

function renderAgreePage() {
  return `
    <section class="section-panel">
      <div class="section-header">
        <div>
          <h3>Decision Records</h3>
          <p>Draft, review, and adoption state stays separate from the action flow.</p>
          ${renderPolicyMessage()}
        </div>
        <div class="button-row">
          <button class="secondary-button" data-load-policies type="button">Refresh</button>
          <button class="primary-button" data-reset-policy-form type="button">Manual Policy</button>
        </div>
      </div>
    </section>
    ${renderPolicyFallback()}
    ${renderV2PolicyWorkbenchPanel()}
    ${renderPolicyList()}
    ${renderPolicyReplayPanel()}
    ${renderDriftPolicyPanel()}
    <section class="policy-workbench">
      ${renderPolicyForm()}
      ${renderPolicyVersionSummary()}
    </section>
  `;
}

function renderPolicyMessage() {
  if (policyState.error) {
    return `<p class="inline-error">${escapeHtml(policyState.error)}</p>`;
  }
  if (policyState.message) {
    return `<p class="inline-success">${escapeHtml(policyState.message)}</p>`;
  }
  return '';
}

function renderV2PolicyWorkbenchPanel() {
  const workbench = v2ProductState.policyWorkbench;
  if (workbench === undefined || workbench.policies.length === 0) {
    return '';
  }
  return `
    <section class="section-panel">
      <div class="section-header">
        <div>
          <h3>Policy Workbench</h3>
          <p>Draft gaps, adoption state, starter ladders, and version comparison in one working view.</p>
        </div>
        <span class="status-badge status-neutral">${workbench.starterTemplates.length} templates</span>
      </div>
      <div class="policy-grid">
        ${workbench.policies.slice(0, 4).map((policy) => `
          <article class="policy-card">
            <h4>${escapeHtml(policy.ruleName)}</h4>
            <p>${escapeHtml(policy.versionCompare.summary)}</p>
            <dl class="compact-metrics">
              <div><dt>State</dt><dd>${escapeHtml(formatAction(policy.adoptionState))}</dd></div>
              <div><dt>Missing steps</dt><dd>${policy.missingSteps.length}</dd></div>
              <div><dt>Warnings</dt><dd>${policy.warnings.length}</dd></div>
            </dl>
            ${policy.warnings[0] ? `<p class="inline-note">${escapeHtml(policy.warnings[0].message)}</p>` : ''}
          </article>
        `).join('')}
      </div>
    </section>
  `;
}

function renderPolicyFallback() {
  if (policyState.policies.length > 0) {
    return '';
  }
  return renderEmptyState(
    'No policies yet',
    'Create your first policy from a drift candidate or load the ExampleLearning demo scenario.',
    [
      { label: 'Load Demo Scenario', page: 'scan', intent: 'load_demo' },
      { label: 'Create Policy', page: 'agree', intent: 'create_policy' },
    ]
  );
}

function renderPolicyList() {
  if (policyState.loading) {
    return renderLoadingState('Loading policies', 'Reading subreddit policy ladders.');
  }
  if (policyState.policies.length === 0) {
    return '';
  }

  return `
    <section class="card-list" aria-label="Saved policies">
      ${policyState.policies.map(renderPolicyCard).join('')}
    </section>
  `;
}

function renderPolicyReplayPanel() {
  if (!policyReplayState.result && !policyReplayState.error) {
    return '';
  }
  const result = policyReplayState.result;
  return `
    <section class="section-panel replay-panel" aria-label="Policy replay sandbox">
      <div class="section-header">
        <div>
          <h3>Replay Sandbox</h3>
          <p>Read-only simulation against stored scan history or labeled synthetic actions.</p>
          ${policyReplayState.error ? `<p class="inline-error">${escapeHtml(policyReplayState.error)}</p>` : ''}
        </div>
      </div>
      ${
        result
          ? `
            <dl class="compact-metrics">
              <div><dt>Policy</dt><dd>${escapeHtml(result.ruleName)}</dd></div>
              <div><dt>Source</dt><dd>${formatAction(result.source)}</dd></div>
              <div><dt>Evaluated</dt><dd>${result.totalActionsEvaluated}</dd></div>
              <div><dt>Would change</dt><dd>${result.changedRecommendationCount}</dd></div>
              <div><dt>Skipped</dt><dd>${result.skippedActionCount}</dd></div>
            </dl>
            <ol class="replay-list">
              ${result.items.slice(0, 6).map(renderReplayItem).join('')}
            </ol>
            ${result.warnings.map((warning) => `<p class="inline-note">${escapeHtml(warning)}</p>`).join('')}
          `
          : ''
      }
    </section>
  `;
}

function renderReplayItem(item: PolicyReplayResult['items'][number]) {
  return `
    <li class="ledger-item">
      <div>
        <strong>${escapeHtml(item.actionId)}</strong>
        <span>${formatDate(item.createdAt)} - offense ${item.offenseCount}</span>
      </div>
      <dl class="compact-metrics">
        <div><dt>Historical</dt><dd>${formatAction(item.historicalAction)}</dd></div>
        <div><dt>Replay</dt><dd>${formatAction(item.recommendedAction)}</dd></div>
        <div><dt>Changed</dt><dd>${item.wouldChangeOutcome ? 'Yes' : 'No'}</dd></div>
        <div><dt>Confidence</dt><dd>${formatAction(item.confidence)}</dd></div>
      </dl>
    </li>
  `;
}

function renderPolicyCard(policy: RulePolicy) {
  const lifecycle = getPolicyLifecycle(policy);
  const reviews = policy.reviewRecords ?? [];
  const ratification = getPolicyRatificationSummary(policy);
  return `
    <article class="action-card">
      <div class="card-header">
        <div>
          <h3>${escapeHtml(policy.ruleName)}</h3>
          <p>${escapeHtml(policy.ruleKey)}</p>
        </div>
        <span class="status-badge ${policy.active ? 'status-good' : 'status-neutral'}">${escapeHtml(formatAction(lifecycle))}</span>
      </div>
      <dl class="compact-metrics">
        <div><dt>Steps</dt><dd>${policy.steps.length}</dd></div>
        <div><dt>Delivery</dt><dd>${formatAction(policy.defaultMessageMode)}</dd></div>
        <div><dt>Version</dt><dd>${policy.proposedVersionNumber ?? policy.activeVersionNumber ?? 1}</dd></div>
        <div><dt>Votes</dt><dd>${ratification.approvals}/${ratification.requiredApprovals}</dd></div>
        <div><dt>Reviews</dt><dd>${reviews.length}</dd></div>
        <div><dt>Updated</dt><dd>${formatDate(policy.updatedAt)}</dd></div>
      </dl>
      ${
        policy.proposalNote
          ? `<p class="inline-note">Proposal note: ${escapeHtml(policy.proposalNote)}</p>`
          : ''
      }
      ${
        ratification.adoptionBlockedReason && lifecycle !== 'adopted'
          ? `<p class="inline-note">${escapeHtml(ratification.adoptionBlockedReason)}</p>`
          : ''
      }
      <div class="button-row">
        <button class="secondary-button" data-edit-policy="${escapeAttribute(policy.id)}" type="button">${policy.active ? 'Draft revision' : 'Edit draft'}</button>
        ${renderPolicyLifecycleButtons(policy)}
        <button class="secondary-button" data-replay-policy="${escapeAttribute(policy.id)}" ${policyReplayState.loadingPolicyId === policy.id ? 'disabled' : ''} type="button">Replay</button>
        <button class="secondary-button" data-action-intent="review_policy" type="button">Review health</button>
      </div>
    </article>
  `;
}

function renderPolicyLifecycleButtons(policy: RulePolicy) {
  const lifecycle = getPolicyLifecycle(policy);
  const ratification = getPolicyRatificationSummary(policy);
  const policyId = escapeAttribute(policy.id);
  const quickAdoptionAllowed =
    policy.ratificationSettings?.allowSingleModAdoption ?? true;
  if (lifecycle === 'draft') {
    return `<button class="secondary-button" data-propose-policy="${policyId}" type="button">Propose</button>`;
  }
  if (lifecycle === 'proposed' || lifecycle === 'under_review') {
    return `
      <button class="secondary-button" data-review-policy="${policyId}" data-review-decision="approve" type="button">Approve</button>
      <button class="secondary-button" data-review-policy="${policyId}" data-review-decision="request_changes" type="button">Request changes</button>
      ${
        ratification.canAdopt
          ? `<button class="primary-button" data-adopt-policy="${policyId}" type="button">Adopt reviewed</button>`
          : ''
      }
      ${
        quickAdoptionAllowed
          ? `<button class="secondary-button" data-adopt-policy="${policyId}" data-quick-adoption="true" type="button">Quick adopt</button>`
          : ''
      }
    `;
  }
  return '';
}

function renderDriftPolicyPanel() {
  const candidates = scanState.result?.driftCandidates ?? [];
  if (candidates.length === 0) {
    return '';
  }
  return `
    <section class="section-panel">
      <div class="section-header">
        <div>
          <h3>Create From Drift</h3>
          <p>Convert scan findings into explicit team policy.</p>
        </div>
      </div>
      <div class="card-list compact">
        ${candidates.map((candidate, index) => renderDriftCandidate(candidate, index)).join('')}
      </div>
    </section>
  `;
}

function renderPolicyForm() {
  const form = policyState.form;
  return `
    <section class="section-panel policy-form-section" aria-label="Policy editor">
      <div class="section-header">
        <div>
          <h3>${form.mode === 'edit' ? 'Edit Policy' : 'Policy Editor'}</h3>
          <p>Saving creates a draft. Adopted versions are the only policies used by Apply Policy.</p>
        </div>
        <button class="secondary-button" data-reset-policy-form type="button">Reset</button>
      </div>

      <form class="policy-form" data-policy-form>
        <label>
          Rule key
          <input name="ruleKey" value="${escapeAttribute(form.ruleKey)}" ${form.mode === 'edit' ? 'readonly' : ''} required>
        </label>
        <label>
          Rule name
          <input name="ruleName" value="${escapeAttribute(form.ruleName)}" required>
        </label>
        <label>
          Delivery mode
          <select name="defaultMessageMode">
            ${MESSAGE_DELIVERY_MODE_VALUES.map(
              (mode) =>
              `<option value="${mode}" ${mode === form.defaultMessageMode ? 'selected' : ''}>${formatAction(mode)}</option>`
            ).join('')}
          </select>
        </label>
        <label>
          Approval threshold
          <input name="requiredApprovals" type="number" min="1" max="5" value="${form.requiredApprovals}">
        </label>
        <label class="checkbox-label">
          <input name="allowSingleModAdoption" type="checkbox" ${form.allowSingleModAdoption ? 'checked' : ''}>
          Allow recorded quick adoption
        </label>
        <div class="step-grid">
          ${form.steps.map(renderStepEditor).join('')}
        </div>
        <button class="primary-button" type="submit" ${policyState.saving ? 'disabled' : ''}>
          ${form.mode === 'edit' ? 'Save draft' : 'Create draft'}
        </button>
      </form>
    </section>
  `;
}

function renderStepEditor(step: PolicyStep, index: number) {
  return `
    <fieldset class="policy-step">
      <legend>Offense ${step.offenseCount}</legend>
      <input type="hidden" name="offenseCount-${index}" value="${step.offenseCount}">
      <label>
        Window days
        <input name="windowDays-${index}" type="number" min="1" value="${step.windowDays}">
      </label>
      <label>
        Recommended action
        <select name="recommendedAction-${index}">
          ${ENFORCEMENT_ACTION_VALUES.map(
            (action) =>
              `<option value="${action}" ${action === step.recommendedAction ? 'selected' : ''}>${formatAction(action)}</option>`
          ).join('')}
        </select>
      </label>
      <label class="checkbox-label">
        <input name="requireOverride-${index}" type="checkbox" ${step.requireOverrideReasonForDeviation ? 'checked' : ''}>
        Require override reason on deviation
      </label>
      <div class="template-editor-grid" aria-label="Response templates">
        ${RESPONSE_TEMPLATE_KIND_VALUES.map((kind) =>
          renderResponseTemplateEditor(step, index, kind)
        ).join('')}
      </div>
    </fieldset>
  `;
}

function renderResponseTemplateEditor(
  step: PolicyStep,
  index: number,
  kind: ResponseTemplateKind
) {
  const template = step.responseTemplates?.[kind];
  const body = template?.body ?? getLegacyTemplateBody(step, kind) ?? '';
  return `
    <label>
      ${formatTemplateKind(kind)}
      <textarea name="template-${kind}-${index}" rows="3" placeholder="${escapeAttribute(getTemplatePlaceholder(kind))}">${escapeHtml(body)}</textarea>
    </label>
  `;
}

function getLegacyTemplateBody(
  step: PolicyStep,
  kind: ResponseTemplateKind
): string | undefined {
  if (kind === 'removal_explanation') {
    return step.removalMessageTemplate;
  }
  if (kind === 'mod_note_summary') {
    return step.noteTemplate;
  }
  return undefined;
}

function renderApplyPolicyPanel() {
  return `
    <section class="section-panel" aria-label="Apply policy workflow">
      <div class="section-header">
        <div>
          <h3>Apply Policy</h3>
          <p>Simulator actions are logged as log-only records; no hidden destructive moderation action is performed.</p>
          ${renderApplyMessage()}
        </div>
        <button class="secondary-button" data-load-policies type="button">Refresh policies</button>
      </div>
      ${renderApplyTargetContext()}
      ${renderApplyForm()}
      ${renderApplyPreview()}
    </section>
  `;
}

function renderApplyTargetContext() {
  const form = applyState.form;
  if (!form.targetThingId || form.targetThingId === 't3_demo_policy_target') {
    return '';
  }

  const details = [
    renderCommandSignal('Target', form.targetThingId),
    renderCommandSignal('Author', form.targetAuthor || 'Unavailable'),
    renderCommandSignal('Subreddit', form.subreddit || 'Current context'),
  ];
  if (form.targetTitle) {
    details.push(renderCommandSignal('Title', form.targetTitle));
  }
  if (form.targetBody) {
    details.push(renderCommandSignal('Body', formatTargetBodyExcerpt(form.targetBody)));
  }

  return `
    <div class="target-context-strip" aria-label="Selected Reddit target">
      <div>
        <strong>Selected Reddit target</strong>
        <span>Captured from the post/comment menu; no moderation action has been taken.</span>
      </div>
      <dl class="compact-metrics">
        ${details.join('')}
      </dl>
      ${
        form.targetPermalink
          ? `<a href="${escapeAttribute(form.targetPermalink)}" target="_blank" rel="noreferrer">Open source item</a>`
          : ''
      }
    </div>
  `;
}

function formatTargetBodyExcerpt(body: string) {
  const collapsed = body.trim().replace(/\s+/g, ' ');
  if (collapsed.length <= 140) {
    return collapsed;
  }
  return `${collapsed.slice(0, 137)}...`;
}

function renderReceiptLedger() {
  const receipts = [
    ...(applyState.result ? [applyState.result.receipt] : []),
    ...receiptLedgerState.receipts.filter(
      (receipt) => receipt.id !== applyState.result?.receipt.id
    ),
  ].slice(0, 8);

  return `
    <section class="section-panel receipt-ledger" aria-label="Action receipt ledger">
      <div class="section-header">
        <div>
          <h3>Receipt Ledger</h3>
          <p>Every confirmed action creates a receipt, including skipped and log-only paths.</p>
          ${receiptLedgerState.error ? `<p class="inline-error">${escapeHtml(receiptLedgerState.error)}</p>` : ''}
        </div>
        <button class="secondary-button" data-load-receipts type="button">Refresh receipts</button>
      </div>
      ${
        receiptLedgerState.loading
          ? renderLoadingState('Loading receipts', 'Reading recent Apply Policy receipts.')
          : receipts.length > 0
            ? `<ol class="ledger-list">${receipts.map(renderReceiptLedgerItem).join('')}</ol>`
            : renderEmptyState(
                'No receipts yet',
                'Confirm an Apply Policy action to create a receipt for later review.',
                [{ label: 'Apply Sample', page: 'act', intent: 'review_policy' }]
              )
      }
    </section>
  `;
}

function renderReceiptLedgerItem(receipt: ActionReceipt) {
  const policy = receipt.policySnapshot;
  return `
    <li class="ledger-item">
      <div>
        <strong>${escapeHtml(receipt.id)}</strong>
        <span>${formatDate(receipt.createdAt)} - ${escapeHtml(receipt.targetThingId ?? receipt.targetSnapshot.targetType)}</span>
      </div>
      <dl class="compact-metrics">
        <div><dt>Rule</dt><dd>${escapeHtml(policy?.ruleName ?? receipt.recommendation.ruleName ?? 'Unavailable')}</dd></div>
        <div><dt>Recommended</dt><dd>${formatAction(receipt.recommendation.recommendedAction)}</dd></div>
        <div><dt>Selected</dt><dd>${formatAction(receipt.selectedAction)}</dd></div>
        <div><dt>Execution</dt><dd>${formatAction(receipt.executionResult)}</dd></div>
        <div><dt>Mode</dt><dd>${formatAction(receipt.executionMode)}</dd></div>
        <div><dt>Capability</dt><dd>${formatAction(receipt.capabilityState)}</dd></div>
      </dl>
      ${
        receipt.overrideReason
          ? `<p class="inline-note">Override: ${formatAction(receipt.overrideReason)}${receipt.overrideNote ? ` - ${escapeHtml(receipt.overrideNote)}` : ''}</p>`
          : ''
      }
      ${
        receipt.responsePreview
          ? `<p class="inline-note">${receipt.responsePreview.templates.length} response template draft${receipt.responsePreview.templates.length === 1 ? '' : 's'} captured; delivery remained gated.</p>`
          : ''
      }
      ${
        receipt.nativeModNote
          ? `<p class="inline-note">Native Mod Note: ${formatAction(receipt.nativeModNote.status)} (${formatAction(receipt.nativeModNote.capabilityState)}).</p>`
          : ''
      }
      ${
        receipt.incidentId
          ? `<p class="inline-note">Incident: ${escapeHtml(receipt.incidentId)}. Tagged for post-incident review.</p>`
          : ''
      }
      <div class="button-row">
        <button class="secondary-button" data-create-evidence-board-receipt="${escapeAttribute(receipt.id)}" type="button" ${evidenceBoardState.saving ? 'disabled' : ''}>Open evidence board</button>
      </div>
    </li>
  `;
}

function renderApplyMessage() {
  if (applyState.error) {
    return `<p class="inline-error">${escapeHtml(applyState.error)}</p>`;
  }
  if (applyState.message) {
    return `<p class="inline-success">${escapeHtml(applyState.message)}</p>`;
  }
  return '';
}

function renderApplyForm() {
  if (policyState.policies.length === 0) {
    return renderEmptyState(
      'No policy available',
      'Create a policy before applying it to a sample case.',
      [{ label: 'Create Policy', page: 'agree', intent: 'create_policy' }]
    );
  }

  const activePolicies = policyState.policies.filter(isPolicyAvailableForApply);
  const form = getApplyFormState(activePolicies);

  return `
    <form class="policy-form apply-form" data-apply-form>
      <label>
        Policy
        <select name="ruleKey">
          ${activePolicies
            .map(
              (policy) =>
                `<option value="${policy.ruleKey}" ${policy.ruleKey === form.ruleKey ? 'selected' : ''}>${escapeHtml(policy.ruleName)}</option>`
            )
            .join('')}
        </select>
      </label>
      <label>
        Target thing ID
        <input name="targetThingId" value="${escapeAttribute(form.targetThingId)}" required>
      </label>
      <label>
        Target author
        <input name="targetAuthor" value="${escapeAttribute(form.targetAuthor)}" required>
      </label>
      <input type="hidden" name="targetTitle" value="${escapeAttribute(form.targetTitle)}">
      <input type="hidden" name="targetBody" value="${escapeAttribute(form.targetBody)}">
      <input type="hidden" name="targetPermalink" value="${escapeAttribute(form.targetPermalink)}">
      <input type="hidden" name="subreddit" value="${escapeAttribute(form.subreddit)}">
      <label>
        Selected action
        <select name="selectedAction">
          ${ENFORCEMENT_ACTION_VALUES.map(
            (action) =>
              `<option value="${action}" ${action === form.selectedAction ? 'selected' : ''}>${formatAction(action)}</option>`
          ).join('')}
        </select>
      </label>
      <label>
        Native Mod Note
        <select name="modNoteMode">
          ${NATIVE_MOD_NOTE_MODE_VALUES.map(
            (mode) =>
              `<option value="${mode}" ${mode === form.modNoteMode ? 'selected' : ''}>${formatAction(mode)}</option>`
          ).join('')}
        </select>
      </label>
      <label>
        Override reason
        <select name="overrideReason">
          <option value="">Only required on deviation</option>
          ${OVERRIDE_REASON_VALUES.map(
            (reason) =>
              `<option value="${reason}" ${reason === form.overrideReason ? 'selected' : ''}>${formatAction(reason)}</option>`
          ).join('')}
        </select>
      </label>
      <label>
        Override note
        <input name="overrideNote" value="${escapeAttribute(form.overrideNote)}" placeholder="Optional context for review">
      </label>
      <div class="button-row">
        <button class="secondary-button" type="button" data-apply-preview ${applyState.loading ? 'disabled' : ''}>Preview</button>
        <button class="primary-button" type="submit" ${applyState.confirming ? 'disabled' : ''}>Confirm log-only action</button>
      </div>
    </form>
  `;
}

function getApplyFormState(activePolicies: RulePolicy[]): ApplyFormState {
  const fallbackRuleKey = activePolicies[0]?.ruleKey ?? '';
  const ruleKey =
    activePolicies.some((policy) => policy.ruleKey === applyState.form.ruleKey)
      ? applyState.form.ruleKey
      : fallbackRuleKey;

  return {
    ...applyState.form,
    ruleKey,
  };
}

function renderApplyPreview() {
  const recommendation =
    applyState.result?.recommendation ?? applyState.preview?.recommendation;
  if (!recommendation) {
    return renderEmptyState(
      'No recommendation preview',
      'Preview a sample action to see whether it matches team policy.',
      []
    );
  }

  return `
    <article class="action-card apply-preview">
      <div class="card-header">
        <div>
          <h3>Recommendation</h3>
          <p>${escapeHtml(recommendation.message)}</p>
        </div>
        <span class="status-badge ${recommendation.deviatesFromPolicy ? 'status-risk' : 'status-good'}">${recommendation.deviatesFromPolicy ? 'Override required' : 'Matches policy'}</span>
      </div>
      <dl class="compact-metrics">
        <div><dt>Rule</dt><dd>${escapeHtml(recommendation.ruleName ?? recommendation.ruleKey)}</dd></div>
        <div><dt>Offense</dt><dd>${recommendation.offenseCount}</dd></div>
        <div><dt>Recommended</dt><dd>${formatAction(recommendation.recommendedAction)}</dd></div>
        <div><dt>Delivery</dt><dd>${formatAction(recommendation.messageDeliveryMode)}</dd></div>
      </dl>
      ${renderApplyPreviewEvidence()}
      ${renderApplyResponsePreview()}
      ${
        applyState.result
          ? `<p class="inline-success">Receipt ${escapeHtml(applyState.result.receipt.id)} recorded${applyState.result.overrideEvent ? ' with override reason' : ''}. ${escapeHtml(formatExecutionResult(applyState.result))}</p>
             ${renderNativeModNoteResult(applyState.result.receipt.nativeModNote)}
             <button class="secondary-button" data-case-from-action="${escapeAttribute(applyState.result.actionEvent.id)}" type="button">Generate case packet</button>`
          : ''
      }
    </article>
  `;
}

function renderNativeModNoteResult(
  nativeModNote: ActionReceipt['nativeModNote']
) {
  if (!nativeModNote) {
    return '';
  }
  const statusClass =
    nativeModNote.status === 'sent'
      ? 'inline-success'
      : nativeModNote.status === 'failed'
        ? 'inline-error'
        : 'inline-note';
  const idCopy = nativeModNote.noteId ? ` ID ${nativeModNote.noteId}.` : '';
  const message =
    nativeModNote.status === 'sent'
      ? `Native Mod Note created.${idCopy}`
      : nativeModNote.errorMessage ?? 'Native Mod Note was not attempted.';
  return `<p class="${statusClass}">${escapeHtml(message)}</p>`;
}

function renderApplyResponsePreview() {
  const responsePreview = applyState.preview?.responsePreview;
  if (!responsePreview) {
    return '';
  }

  return `
    <section class="response-preview" aria-label="Response template preview">
      <div class="section-header compact-header">
        <div>
          <h4>Response Templates</h4>
          <p>Drafts are rendered for copy/review only; Apply Policy will not send them.</p>
        </div>
        <span class="status-badge status-neutral">Delivery gated</span>
      </div>
      ${
        responsePreview.templates.length > 0
          ? `<div class="template-preview-list">${responsePreview.templates
              .map(
                (template) => `
                  <article class="template-preview-item">
                    <div>
                      <strong>${escapeHtml(template.title)}</strong>
                      <span>${formatTemplateKind(template.kind)} - ${formatAction(template.deliveryMode)} - ${escapeHtml(template.source.replaceAll('_', ' '))}</span>
                    </div>
                    <pre>${escapeHtml(template.body)}</pre>
                    ${
                      template.missingVariables.length > 0
                        ? `<p class="inline-error">Missing variables: ${escapeHtml(template.missingVariables.join(', '))}</p>`
                        : ''
                    }
                  </article>
                `
              )
              .join('')}</div>`
          : renderEmptyState(
              'No templates for this step',
              'Add response templates in the policy editor before using manual delivery copy.',
              []
            )
      }
      ${responsePreview.warnings.map((warning) => `<p class="inline-note">${escapeHtml(warning)}</p>`).join('')}
    </section>
  `;
}

function formatExecutionResult(result: ApplyPolicyConfirmResult): string {
  const execution = result.execution;
  if (execution.executionResult === 'success') {
    return `Reddit ${formatExecutionOperation(execution.redditOperation)} succeeded.`;
  }
  if (execution.executionResult === 'failure') {
    return execution.errorMessage
      ? `Reddit action failed: ${execution.errorMessage}`
      : 'Reddit action failed.';
  }
  if (execution.capabilityState === 'not_applicable') {
    return 'No Reddit action was applicable.';
  }
  return execution.errorMessage ?? 'Reddit execution was skipped.';
}

function formatExecutionOperation(operation: string): string {
  return operation.replaceAll('_', ' ');
}

function renderApplyPreviewEvidence() {
  const preview = applyState.preview;
  if (!preview) {
    return '';
  }

  return `
    <div class="evidence-list">
      ${preview.evidence
        .map(
          (item) => `
            <div class="evidence-item">
              <span>${escapeHtml(item.label)}</span>
              <p>${escapeHtml(item.detail)}</p>
            </div>
          `
        )
        .join('')}
    </div>
    <p class="inline-note">${escapeHtml(preview.confirmation.message)}</p>
  `;
}

function renderReviewPage() {
  return `
    <section class="section-panel">
      <div class="section-header">
        <div>
          <h3>Governance Review</h3>
          <p>Policy health and exception review stay aggregate-first. Per-mod analytics remain hidden.</p>
          ${renderGovernanceMessage()}
        </div>
        <button class="secondary-button" data-load-governance type="button">Refresh</button>
      </div>
    </section>
    ${renderV2ReviewRoomPanel()}
    ${renderTeamCalibrationPanel()}
    ${renderGovernanceOverview()}
    ${renderCommunityHealthLens()}
    ${renderConsistencyAnalytics()}
    ${renderPolicyHealthCards()}
    ${renderOverrideInbox()}
    ${renderPolicyVersionSummary()}
  `;
}

function renderConsistencyAnalytics() {
  const analytics = governanceState.analytics;
  if (!analytics) {
    return '';
  }

  const trend = analytics.ruleTrends[0];
  const impact = analytics.policyImpacts[0];

  return `
    <section class="section-panel">
      <div class="section-header">
        <div>
          <h3>Consistency Over Time</h3>
          <p>${escapeHtml(analytics.caveats[0] ?? 'Receipts and persisted scans are used before making trend claims.')}</p>
        </div>
        <span class="status-badge status-neutral">${escapeHtml(formatAction(analytics.dataQuality))}</span>
      </div>
      <dl class="compact-metrics">
        <div><dt>Scans</dt><dd>${analytics.scanCount}</dd></div>
        <div><dt>Receipts</dt><dd>${analytics.receiptCount}</dd></div>
        <div><dt>Top trend</dt><dd>${escapeHtml(trend ? formatAction(trend.status) : 'No signal')}</dd></div>
        <div><dt>Policy impact</dt><dd>${escapeHtml(impact ? formatAction(impact.status) : 'No signal')}</dd></div>
      </dl>
      ${
        trend
          ? `<p class="recommendation">${escapeHtml(trend.ruleName)}: ${trend.points.length} scan point${trend.points.length === 1 ? '' : 's'}; latest distribution ${escapeHtml(formatDistribution(trend.latestDistribution))}.</p>`
          : '<p class="inline-note">No repeated drift candidates are available yet.</p>'
      }
    </section>
  `;
}

function renderGovernanceMessage() {
  if (governanceState.error) {
    return `<p class="inline-error">${escapeHtml(governanceState.error)}</p>`;
  }
  if (governanceState.message) {
    return `<p class="inline-success">${escapeHtml(governanceState.message)}</p>`;
  }
  return '';
}

function renderV2ReviewRoomPanel() {
  const reviewRoom = v2ProductState.reviewRoom;
  if (reviewRoom === undefined) {
    return '';
  }
  const unresolved = reviewRoom.tasks.filter((task) => task.status !== 'resolved');
  return `
    <section class="section-panel">
      <div class="section-header">
        <div>
          <h3>Review Room</h3>
          <p>Overrides, drift, policy health, ratification, and evidence boards become one queue.</p>
        </div>
        <span class="status-badge status-watch">${unresolved.length} unresolved</span>
      </div>
      <ol class="ledger-list">
        ${unresolved.slice(0, 5).map((task) => `
          <li class="ledger-item">
            <div>
              <strong>${escapeHtml(task.title)}</strong>
              <span>${escapeHtml(formatAction(task.source))} · ${escapeHtml(task.dueSignal)}</span>
            </div>
            <span class="status-badge ${task.severity === 'urgent' ? 'status-danger' : 'status-watch'}">${escapeHtml(task.severity)}</span>
            <div class="button-row">
              <button class="secondary-button compact-button" data-review-task-status="${escapeAttribute(task.id)}" data-review-task-next="in_review" type="button">Start review</button>
              <button class="secondary-button compact-button" data-review-task-status="${escapeAttribute(task.id)}" data-review-task-next="resolved" type="button">Resolve</button>
            </div>
          </li>
        `).join('')}
      </ol>
    </section>
  `;
}

function renderTeamCalibrationPanel() {
  const calibration = v2ProductState.calibration;
  if (calibration === undefined) {
    return '';
  }
  return `
    <section class="section-panel">
      <div class="section-header">
        <div>
          <h3>Team Calibration Studio</h3>
          <p>Practice team policy decisions without rankings, blame, or moderator scoreboards.</p>
          ${v2ProductState.calibrationResult ? `<p class="inline-success">${escapeHtml(v2ProductState.calibrationResult.explanation)}</p>` : ''}
        </div>
        <span class="status-badge status-neutral">${calibration.scenarios.length} scenarios</span>
      </div>
      <div class="policy-grid">
        ${calibration.scenarios.slice(0, 3).map((scenario) => `
          <article class="policy-card">
            <h4>${escapeHtml(scenario.title)}</h4>
            <p>${escapeHtml(scenario.prompt)}</p>
            <dl class="compact-metrics">
              <div><dt>Rule</dt><dd>${escapeHtml(scenario.ruleName)}</dd></div>
              <div><dt>Source</dt><dd>${escapeHtml(formatAction(scenario.source))}</dd></div>
            </dl>
            <button class="secondary-button compact-button" data-calibration-answer="${escapeAttribute(scenario.id)}" data-calibration-action="${scenario.expectedAction}" type="button">Show Team Norm</button>
            <button class="secondary-button compact-button" data-scenario-archive="${escapeAttribute(scenario.id)}" type="button">Archive</button>
          </article>
        `).join('')}
      </div>
      ${renderScenarioLabForm(calibration.scenarios[0])}
    </section>
  `;
}

function renderScenarioLabForm(seed: CalibrationScenario | undefined) {
  return `
    <form class="policy-form" data-scenario-form>
      <div class="section-header compact-header">
        <div>
          <h4>Scenario Lab</h4>
          <p>Create deterministic teaching scenarios. Drafts stay out of active calibration packs until activated.</p>
        </div>
      </div>
      <div class="incident-form-grid">
        <label>
          Title
          <input name="title" value="${escapeAttribute(seed?.title ?? 'Rule 2 teaching scenario')}" required>
        </label>
        <label>
          Rule key
          <input name="ruleKey" value="${escapeAttribute(seed?.ruleKey ?? DEMO_POLICY.ruleKey)}" required>
        </label>
        <label>
          Rule name
          <input name="ruleName" value="${escapeAttribute(seed?.ruleName ?? DEMO_POLICY.ruleName)}" required>
        </label>
        <label>
          Expected action
          <select name="expectedAction">
            ${ENFORCEMENT_ACTION_VALUES.map((action) => `
              <option value="${action}" ${action === (seed?.expectedAction ?? 'warn') ? 'selected' : ''}>${formatAction(action)}</option>
            `).join('')}
          </select>
        </label>
      </div>
      <label>
        Prompt
        <textarea name="prompt" rows="3" required>${escapeHtml(seed?.prompt ?? 'A first-time learner posts a low-effort homework request without context or prior attempt.')}</textarea>
      </label>
      <label>
        Explanation
        <textarea name="explanation" rows="3" required>${escapeHtml(seed?.explanation ?? 'Use the team policy norm and record stricter outcomes as exceptions for review.')}</textarea>
      </label>
      <label>
        Teaching reason
        <input name="teachingReason" value="Policy calibration scenario for team practice" required>
      </label>
      <label class="checkbox-label">
        <input name="active" type="checkbox">
        Activate immediately
      </label>
      <div class="button-row">
        <button class="secondary-button" type="submit">Save scenario</button>
      </div>
      <p class="inline-note">Scenario records do not store moderator names and cannot enforce a Reddit action.</p>
    </form>
  `;
}

function renderGovernanceOverview() {
  const health = governanceState.health;
  if (governanceState.loading && !health) {
    return renderLoadingState('Loading review data', 'Reading policy health, overrides, and version summaries.');
  }
  if (!health) {
    return renderEmptyState(
      'No review data yet',
      'Create policies and log Apply Policy actions. Review cards will appear as exceptions accumulate.',
      [{ label: 'Create Policy', page: 'agree', intent: 'create_policy' }]
    );
  }

  return `
    <section class="metric-grid" aria-label="Governance overview">
      ${renderMetricCard('Active policies', health.totalPolicies.toString())}
      ${renderMetricCard('Stable policies', health.stablePolicies.toString())}
      ${renderMetricCard('Need review', health.policiesNeedingReview.toString())}
      ${renderMetricCard('Unresolved overrides', health.unresolvedOverrides.toString())}
    </section>
  `;
}

function renderCommunityHealthLens() {
  const health = governanceState.communityHealth;
  if (!health) {
    return '';
  }
  const topRule = health.ruleSignals[0];
  return `
    <section class="section-panel community-health-panel">
      <div class="section-header">
        <div>
          <h3>Community Health</h3>
          <p>${escapeHtml(health.caveats[0] ?? 'Aggregate stored data only; no per-mod rankings are shown.')}</p>
        </div>
        <span class="status-badge status-neutral">${escapeHtml(formatAction(health.status))}</span>
      </div>
      <dl class="compact-metrics">
        <div><dt>Data</dt><dd>${formatAction(health.dataQuality)}</dd></div>
        <div><dt>Actions</dt><dd>${health.actionCount}</dd></div>
        <div><dt>Unresolved</dt><dd>${health.unresolvedOverrideCount}</dd></div>
        <div><dt>Churn</dt><dd>${health.policyChurnCount}</dd></div>
        <div><dt>Drift</dt><dd>${formatAction(health.driftStability)}</dd></div>
        <div><dt>Case-ready</dt><dd>${health.casePacketVolume.eligibleReceiptCount}</dd></div>
      </dl>
      ${
        topRule
          ? `<p class="recommendation">${escapeHtml(topRule.ruleName ?? topRule.ruleKey)}: ${formatPercent(topRule.consistencyRate)} consistency across ${topRule.actionCount} tracked action${topRule.actionCount === 1 ? '' : 's'}.</p>`
          : '<p class="inline-note">No rule-level community health signal yet.</p>'
      }
      <dl class="status-list">
        ${health.privacyGuardrails.map((guardrail) => `<div><dt>Guardrail</dt><dd>${escapeHtml(guardrail)}</dd></div>`).join('')}
      </dl>
    </section>
  `;
}

function renderPolicyHealthCards() {
  const summaries = governanceState.health?.summaries ?? [];
  if (summaries.length === 0) {
    return renderEmptyState(
      'Policy health has no signal yet',
      'Run the policy workflow to create enough tracked actions for health scoring.',
      [{ label: 'Apply Sample', page: 'act', intent: 'apply_policy' }]
    );
  }
  return `
    <section class="card-list" aria-label="Policy health cards">
      ${summaries.map(renderPolicyHealthCard).join('')}
    </section>
  `;
}

function renderPolicyHealthCard(summary: PolicyHealthSummary) {
  return `
    <article class="action-card health-card status-${summary.status}">
      <div class="card-header">
        <div>
          <h3>${escapeHtml(summary.ruleName)}</h3>
          <p>${escapeHtml(summary.reasons[0] ?? 'Policy health needs monitoring.')}</p>
        </div>
        <span class="status-badge">${formatHealthStatus(summary.status)}</span>
      </div>
      <dl class="compact-metrics">
        <div><dt>Actions</dt><dd>${summary.totalActions}</dd></div>
        <div><dt>Adherence</dt><dd>${formatPercent(summary.adherenceRate)}</dd></div>
        <div><dt>Overrides</dt><dd>${summary.overrideCount}</dd></div>
        <div><dt>Unresolved</dt><dd>${summary.unresolvedOverrideCount}</dd></div>
      </dl>
      <p class="recommendation">${escapeHtml(summary.recommendations[0] ?? 'Continue monitoring.')}</p>
      <div class="button-row">
        <button class="secondary-button" data-filter-overrides="${escapeAttribute(summary.ruleKey)}" type="button">Review overrides</button>
        <button class="secondary-button" data-edit-policy="${escapeAttribute(summary.policyId)}" type="button">Edit policy</button>
      </div>
    </article>
  `;
}

function renderOverrideInbox() {
  const overrides = [...governanceState.overrides].sort((left, right) =>
    left.reviewStatus === right.reviewStatus
      ? Date.parse(right.createdAt) - Date.parse(left.createdAt)
      : left.reviewStatus === 'unresolved'
        ? -1
        : 1
  );

  if (overrides.length === 0) {
    return renderEmptyState(
      'Override inbox is clear',
      'No unresolved exceptions are waiting for team review.',
      [{ label: 'Generate Digest', page: 'prove', intent: 'generate_digest' }]
    );
  }

  return `
    <section class="card-list" aria-label="Override inbox">
      ${overrides.map(renderOverrideCard).join('')}
    </section>
  `;
}

function renderOverrideCard(event: ReviewableOverrideEvent) {
  const attentionClass = event.reviewStatus === 'unresolved' ? ' status-needs-attention' : '';
  return `
    <article class="inbox-card${attentionClass}">
      <div class="card-header">
        <div>
          <h3>${escapeHtml(event.ruleName ?? event.ruleKey)}</h3>
          <p>${formatAction(event.recommendedAction)} recommended; ${formatAction(event.selectedAction)} selected.</p>
        </div>
        <span class="status-badge ${event.reviewStatus === 'unresolved' ? 'status-risk' : 'status-good'}">${formatAction(event.reviewStatus)}</span>
      </div>
      <dl class="compact-metrics">
        <div><dt>Reason</dt><dd>${formatAction(event.overrideReason)}</dd></div>
        <div><dt>Created</dt><dd>${formatDate(event.createdAt)}</dd></div>
        <div><dt>Policy</dt><dd>${event.policyVersionNumber ? `v${event.policyVersionNumber}` : 'Unavailable'}</dd></div>
        <div><dt>Target</dt><dd>${escapeHtml(event.targetThingId ?? 'Not captured')}</dd></div>
      </dl>
      ${event.overrideNote ? `<p>${escapeHtml(event.overrideNote)}</p>` : ''}
      <input class="review-note-input" data-review-note="${escapeAttribute(event.id)}" placeholder="Optional review note" value="${escapeAttribute(event.reviewNote ?? '')}">
      <div class="button-row">
        ${renderReviewButton(event, 'accepted_exception', 'Accept exception')}
        ${renderReviewButton(event, 'policy_needs_update', 'Policy needs update')}
        ${renderReviewButton(event, 'needs_team_discussion', 'Needs discussion')}
        ${renderReviewButton(event, 'no_action_needed', 'No action needed')}
      </div>
    </article>
  `;
}

function renderReviewButton(
  event: ReviewableOverrideEvent,
  status: OverrideReviewStatus,
  label: string
) {
  const buttonClass =
    status === 'accepted_exception' || status === 'policy_needs_update'
      ? 'primary-button compact-button'
      : 'secondary-button compact-button';
  return `
    <button class="${buttonClass}" data-review-override="${escapeAttribute(event.id)}" data-review-status="${status}" ${governanceState.savingOverrideId === event.id ? 'disabled' : ''} type="button">
      ${label}
    </button>
  `;
}

function renderPolicyVersionSummary() {
  if (policyState.policies.length === 0) {
    return '';
  }
  return `
    <section class="section-panel">
      <div class="section-header">
        <div>
          <h3>Policy Versions</h3>
          <p>Every edit creates a version so Case Packets can explain what policy was active at action time.</p>
        </div>
      </div>
      <div class="version-list">
        ${policyState.policies.map(renderPolicyVersionCard).join('')}
      </div>
    </section>
  `;
}

function renderPolicyVersionCard(policy: RulePolicy) {
  const versions = governanceState.versionsByPolicy[policy.id] ?? [];
  const impact = governanceState.impactsByPolicy[policy.id];
  return `
    <article class="version-card">
      <div class="card-header">
        <div>
          <h3>${escapeHtml(policy.ruleName)}</h3>
          <p>Current version ${policy.activeVersionNumber ?? versions.at(-1)?.versionNumber ?? 1}</p>
        </div>
        <span class="status-badge status-neutral">${policy.active ? 'Active' : 'Inactive'}</span>
      </div>
      ${
        versions.length > 0
          ? `<ol>${versions
              .map(
                (version) => `
                  <li>
                    <strong>v${version.versionNumber}</strong>
                    <span>${formatDate(version.createdAt)} by ${escapeHtml(version.createdBy)}</span>
                    ${version.changeSummary ? `<p>${escapeHtml(version.changeSummary)}</p>` : ''}
                  </li>
                `
              )
              .join('')}</ol>`
          : '<p>No version records returned yet.</p>'
      }
      ${impact ? renderPolicyImpactDetail(impact) : ''}
    </article>
  `;
}

function renderPolicyImpactDetail(impact: PolicyImpactMeasurement) {
  return `
    <div class="impact-detail">
      <div class="card-header">
        <div>
          <h4>Impact</h4>
          <p>${escapeHtml(impact.caveats[0] ?? 'Before/after impact uses stored receipts and scans.')}</p>
        </div>
        <span class="status-badge status-neutral">${escapeHtml(formatAction(impact.status))}</span>
      </div>
      <dl class="compact-metrics">
        <div><dt>Source</dt><dd>${formatAction(impact.source)}</dd></div>
        <div><dt>Before</dt><dd>${formatPercent(impact.before.consistencyRate)}</dd></div>
        <div><dt>After</dt><dd>${formatPercent(impact.after.consistencyRate)}</dd></div>
        <div><dt>Before receipts</dt><dd>${impact.before.receiptCount}</dd></div>
        <div><dt>After receipts</dt><dd>${impact.after.receiptCount}</dd></div>
      </dl>
    </div>
  `;
}

function renderProvePage() {
  return `
    ${renderConsistencyAnalytics()}
    ${renderEvidenceGraphPanel()}
    <section class="prove-layout">
      <div>
        ${renderCasePacketPage()}
        ${renderEvidenceBoardPage()}
      </div>
      <div>${renderDigestPage()}</div>
    </section>
  `;
}

function renderEvidenceGraphPanel() {
  const graph = v2ProductState.evidenceGraph;
  if (graph === undefined) {
    return '';
  }
  return `
    <section class="section-panel">
      <div class="section-header">
        <div>
          <h3>Case Evidence Graph</h3>
          <p>Receipt, policy, override, case packet, and board links with missing references called out.</p>
        </div>
        <span class="status-badge status-neutral">${graph.nodes.length} nodes</span>
      </div>
      <div class="policy-grid">
        ${graph.nodes.slice(0, 6).map((node) => `
          <article class="policy-card">
            <h4>${escapeHtml(node.label)}</h4>
            <p>${escapeHtml(node.detail)}</p>
            <span class="status-badge status-neutral">${escapeHtml(formatAction(node.type))}</span>
          </article>
        `).join('')}
      </div>
      ${
        graph.edges.length > 0
          ? `<p class="inline-note">${escapeHtml(graph.edges.slice(0, 4).map((edge) => `${edge.from} -> ${edge.to}: ${edge.label}`).join('; '))}</p>`
          : ''
      }
      ${graph.missingReferences.map((item) => `<p class="inline-error">${escapeHtml(item)}</p>`).join('')}
      ${graph.privacyNotes.map((item) => `<p class="inline-note">${escapeHtml(item)}</p>`).join('')}
    </section>
  `;
}

function renderEvidenceBoardPage() {
  return `
    <section class="section-panel evidence-board-panel">
      <div class="section-header">
        <div>
          <h3>Evidence Board</h3>
          <p>Moderator review threads that collect receipts, case packets, overrides, comparables, and policy changes.</p>
          ${renderEvidenceBoardMessage()}
        </div>
        <div class="button-row">
          <button class="secondary-button" data-load-evidence-boards type="button">Refresh boards</button>
          ${
            casePacketState.packet
              ? `<button class="secondary-button" data-create-evidence-board-case type="button" ${evidenceBoardState.saving ? 'disabled' : ''}>Open from packet</button>`
              : ''
          }
        </div>
      </div>
      ${
        evidenceBoardState.loading
          ? renderLoadingState('Loading evidence boards', 'Reading review threads and attached evidence summaries.')
          : evidenceBoardState.boards.length > 0
            ? `<ol class="evidence-thread-list">${evidenceBoardState.boards.map(renderEvidenceBoardThread).join('')}</ol>`
            : renderEmptyState(
                'No evidence board yet',
                'Create one from a receipt or the current Case Packet when a moderation decision needs team review.',
                [{ label: 'Review receipts', page: 'act', intent: 'review_policy' }]
              )
      }
    </section>
  `;
}

function renderEvidenceBoardMessage() {
  if (evidenceBoardState.error) {
    return `<p class="inline-error">${escapeHtml(evidenceBoardState.error)}</p>`;
  }
  if (evidenceBoardState.message) {
    return `<p class="inline-success">${escapeHtml(evidenceBoardState.message)}</p>`;
  }
  return '';
}

function renderEvidenceBoardThread(board: EvidenceBoardThread) {
  return `
    <li class="evidence-thread">
      <div class="evidence-thread-main">
        <div>
          <strong>${escapeHtml(board.title)}</strong>
          <span>${formatDate(board.updatedAt)} - ${board.evidence.length} evidence item${board.evidence.length === 1 ? '' : 's'}</span>
        </div>
        <span class="status-badge status-neutral">${formatAction(board.status)}</span>
      </div>
      <ul class="evidence-item-list">
        ${board.evidence
          .slice(0, 5)
          .map(
            (item) => `
              <li>
                <span>${formatAction(item.source)}</span>
                <strong>${escapeHtml(item.label)}</strong>
                <p>${escapeHtml(item.summary)}</p>
              </li>
            `
          )
          .join('')}
      </ul>
      <form class="evidence-status-form" data-evidence-board-status-form="${escapeAttribute(board.id)}">
        <label>
          Status
          <select name="status">
            ${EVIDENCE_BOARD_STATUS_VALUES.map(
              (status) =>
                `<option value="${status}" ${status === board.status ? 'selected' : ''}>${formatAction(status)}</option>`
            ).join('')}
          </select>
        </label>
        <label>
          Note
          <input name="note" placeholder="Optional review note">
        </label>
        <button class="secondary-button" type="submit" ${evidenceBoardState.updatingBoardId === board.id ? 'disabled' : ''}>Update</button>
      </form>
    </li>
  `;
}

function renderCasePacketPage() {
  return `
    <section class="section-panel">
      <div class="section-header">
        <div>
          <h3>Appeal Context Packet</h3>
          <p>Exportable context for moderator review. This is not automated appeal judgment.</p>
          ${renderCasePacketMessage()}
        </div>
        <button class="primary-button" data-generate-demo-case type="button">Generate Demo Packet</button>
      </div>
      <form class="policy-form action-id-form" data-case-action-form>
        <label>
          Tracked action or receipt ID
          <input name="actionId" placeholder="Paste an Apply Policy action or receipt ID">
        </label>
        <div class="button-row">
          <button class="secondary-button" type="submit">Generate from action</button>
          ${
            applyState.result
              ? `<button class="secondary-button" type="button" data-case-from-action="${escapeAttribute(applyState.result.actionEvent.id)}">Use latest logged action</button>`
              : ''
          }
        </div>
      </form>
    </section>
    ${renderCasePacketDetail()}
  `;
}

function renderCasePacketMessage() {
  if (casePacketState.error) {
    return `<p class="inline-error">${escapeHtml(casePacketState.error)}</p>`;
  }
  if (casePacketState.message) {
    return `<p class="inline-success">${escapeHtml(casePacketState.message)}</p>`;
  }
  return '';
}

function renderCasePacketDetail() {
  if (casePacketState.loading && !casePacketState.packet) {
    return renderLoadingState('Generating packet', 'Reading action history, policy versions, overrides, and comparable cases.');
  }

  const packet = casePacketState.packet;
  if (!packet) {
    return renderEmptyState(
      'No packet generated yet',
      'Generate the demo packet for the full ExampleLearning appeal context, or use a tracked action ID.',
      [{ label: 'Review Policy Context', page: 'review', intent: 'review_policy' }]
    );
  }
  const manualDeliveryLabel = casePacketState.deliverySaving
    ? 'Saving receipt'
    : 'Save manual receipt';
  const modDiscussionLabel = casePacketState.deliverySaving
    ? 'Saving draft'
    : 'Save mod discussion draft';
  const modDiscussionCapability =
    teamDeliveryState.capabilities?.modDiscussion;

  return `
    <section class="case-header">
      <div>
        <h3>Official Case Packet</h3>
        <p>Generated ${formatDate(packet.generatedAt)} for r/${escapeHtml(packet.subreddit)}</p>
      </div>
      <span class="status-badge status-neutral">${formatAction(packet.appealPosture)}</span>
    </section>
    <section class="packet-summary-strip" aria-label="Case packet summary">
      <span>${formatAction(packet.packetType)}</span>
      <strong>${formatAction(packet.consistencyStatus)}</strong>
      <span>posture ${formatAction(packet.appealPosture)}</span>
      <span>policy v${packet.policyContext.policyVersionNumber?.toString() ?? 'unavailable'}</span>
      <span>${packet.comparableCases.length} deterministic comparables</span>
    </section>
    <section class="case-grid">
      ${renderCasePacketAction(packet)}
      ${renderCasePacketPolicy(packet)}
      ${renderCasePacketOverride(packet)}
      ${renderCasePacketLists(packet)}
    </section>
    <section class="section-panel">
      <div class="section-header">
        <div>
          <h3>Markdown Export</h3>
          <p>Use this in review notes or an internal mod-team thread.</p>
          ${
            casePacketState.deliveryReceiptId
              ? `<p class="inline-success">Delivery receipt ${escapeHtml(casePacketState.deliveryReceiptId)} recorded as ${formatAction(casePacketState.deliveryStatus ?? 'unknown')}.</p>`
              : ''
          }
        </div>
        <div class="button-row">
          <button class="secondary-button" data-copy-case-markdown type="button">Copy Markdown</button>
          <button class="secondary-button" data-save-case-delivery="manual_markdown" type="button" ${casePacketState.deliverySaving ? 'disabled' : ''}>${manualDeliveryLabel}</button>
          <button class="secondary-button" data-save-case-delivery="mod_discussion" type="button" ${casePacketState.deliverySaving ? 'disabled' : ''}>${modDiscussionLabel}</button>
        </div>
      </div>
      <p class="helper-text">Manual copy is the supported path. Mod Discussion delivery is ${escapeHtml(modDiscussionCapability?.state ?? 'unverified')} and stores a draft receipt unless runtime delivery is explicitly proven and enabled.</p>
      <textarea class="markdown-export" readonly>${escapeHtml(packet.markdown)}</textarea>
    </section>
  `;
}

function renderCasePacketAction(packet: CasePacket) {
  const action = packet.action;
  return `
    <article class="action-card">
      <h3>Action Summary</h3>
      <dl class="status-list">
        <div><dt>Action ID</dt><dd>${escapeHtml(action?.actionId ?? 'Unavailable')}</dd></div>
        <div><dt>Receipt ID</dt><dd>${escapeHtml(action?.receiptId ?? 'Unavailable')}</dd></div>
        <div><dt>Created</dt><dd>${escapeHtml(action?.createdAt ? formatDate(action.createdAt) : 'Unavailable')}</dd></div>
        <div><dt>Rule</dt><dd>${escapeHtml(action?.ruleName ?? action?.ruleKey ?? 'Unavailable')}</dd></div>
        <div><dt>Recommended</dt><dd>${formatAction(action?.recommendedAction ?? 'unavailable')}</dd></div>
        <div><dt>Selected</dt><dd>${formatAction(action?.selectedAction ?? 'unavailable')}</dd></div>
        <div><dt>Execution</dt><dd>${formatAction(action?.execution?.executionResult ?? 'unavailable')}</dd></div>
        <div><dt>Evidence</dt><dd>${formatAction(action?.evidenceSource ?? 'unavailable')}</dd></div>
        <div><dt>Target author</dt><dd>${escapeHtml(action?.targetAuthor ?? 'Not captured')}</dd></div>
      </dl>
    </article>
  `;
}

function renderCasePacketPolicy(packet: CasePacket) {
  const policy = packet.policyContext;
  return `
    <article class="action-card">
      <h3>Policy Context</h3>
      <dl class="status-list">
        <div><dt>Policy</dt><dd>${escapeHtml(policy.policyName ?? policy.policyId ?? 'Unavailable')}</dd></div>
        <div><dt>Version</dt><dd>${policy.policyVersionNumber ?? 'Unavailable'}</dd></div>
        <div><dt>Status</dt><dd>${formatAction(policy.policyVersionStatus ?? 'unavailable')}</dd></div>
        <div><dt>Changed since action</dt><dd>${policy.changedSinceAction ? 'Yes' : 'No'}</dd></div>
      </dl>
    </article>
  `;
}

function renderCasePacketOverride(packet: CasePacket) {
  const override = packet.overrideContext;
  return `
    <article class="action-card">
      <h3>Override Context</h3>
      ${
        override
          ? `<dl class="status-list">
              <div><dt>Reason</dt><dd>${formatAction(override.reason ?? 'unavailable')}</dd></div>
              <div><dt>Review</dt><dd>${formatAction(override.reviewStatus ?? 'unavailable')}</dd></div>
              <div><dt>Reviewed by</dt><dd>${escapeHtml(override.reviewedBy ?? 'Not reviewed')}</dd></div>
              <div><dt>Note</dt><dd>${escapeHtml(override.note ?? 'None')}</dd></div>
            </dl>`
          : '<p>No matching override record was found for this action.</p>'
      }
    </article>
  `;
}

function renderCasePacketLists(packet: CasePacket) {
  return `
    <article class="action-card wide-card">
      <h3>History And Comparables</h3>
      <div class="case-list-block">
        <strong>Prior same-rule user history</strong>
        ${
          packet.userHistory.length > 0
            ? `<ul>${packet.userHistory
                .map(
                  (item) =>
                    `<li>${escapeHtml(formatDate(item.createdAt))}: ${formatAction(item.selectedAction ?? 'unavailable')}</li>`
                )
                .join('')}</ul>`
            : '<p>No prior tracked same-rule history for this user.</p>'
        }
      </div>
      <div class="case-list-block">
        <strong>Deterministic comparable cases</strong>
        ${
          packet.comparableCases.length > 0
            ? `<ul>${packet.comparableCases
                .map(
                  (item) =>
                    `<li>${escapeHtml(formatDate(item.createdAt))}: ${formatAction(item.selectedAction ?? 'unavailable')} - ${escapeHtml(item.matchReasons.join(', '))}</li>`
                )
                .join('')}</ul>`
            : '<p>No comparable cases found in the configured window.</p>'
        }
      </div>
      <div class="case-list-block">
        <strong>Evidence labels</strong>
        <ul>${packet.evidence.map((item) => `<li>${escapeHtml(item.label)}: ${formatAction(item.source)} - ${escapeHtml(item.detail)}</li>`).join('')}</ul>
      </div>
      <div class="case-list-block">
        <strong>Caveats</strong>
        <ul>${packet.caveats.map((caveat) => `<li>${escapeHtml(caveat)}</li>`).join('')}</ul>
      </div>
    </article>
  `;
}

function renderDigestPage() {
  const report = digestState.report ?? digestState.history[0];
  const rulesNeedingAttention =
    report?.ruleHealth.filter((item) =>
      ['needs_review', 'at_risk', 'watch'].includes(item.status)
    ) ?? [];
  const stableRules =
    report?.ruleHealth.filter((item) => item.status === 'stable') ?? [];

  return `
    <section class="section-panel">
      <div class="section-header">
        <div>
          <h3>ModMirror Digest</h3>
          <p>Generate a team-ready report from policy health, override review, Apply Policy logs, and scan context.</p>
          ${digestState.message ? `<p class="inline-success">${escapeHtml(digestState.message)}</p>` : ''}
          ${digestState.error ? `<p class="inline-error">${escapeHtml(digestState.error)}</p>` : ''}
        </div>
        <div class="button-row">
          <button class="primary-button" data-generate-digest type="button" ${digestState.loading ? 'disabled' : ''}>Generate Now</button>
          <button class="secondary-button" data-copy-digest type="button" ${report?.markdown ? '' : 'disabled'}>Copy Markdown</button>
        </div>
      </div>
      ${renderDigestCapabilities()}
      ${report ? renderDigestReport(report, rulesNeedingAttention, stableRules) : renderEmptyState(
        'No digest generated yet',
        'Generate a manual digest after loading demo data or running a scan.',
        [{ label: 'Generate Digest', page: 'prove', intent: 'generate_digest' }]
      )}
      ${renderDigestHistory()}
    </section>
  `;
}

function renderDigestCapabilities() {
  const capabilities = digestState.capabilities;
  const settings = digestState.settings;
  if (!capabilities && !settings) {
    return '';
  }

  return `
    <div class="status-list">
      ${capabilities ? renderStatusItem('Mod discussion', capabilities.modDiscussion.state, capabilities.modDiscussion.detail) : ''}
      ${capabilities ? renderStatusItem('Scheduler', capabilities.scheduler.state, capabilities.scheduler.detail) : ''}
      ${settings ? renderStatusItem('Delivery', formatAction(settings.deliveryMode), settings.scheduleEnabled ? `Weekly digest scheduling requested. Last generated ${formatDate(settings.lastGeneratedAt ?? 'Not generated yet')}.` : 'Manual copy is the active launch path.') : ''}
    </div>
  `;
}

function renderStatusItem(label: string, value: string, detail: string) {
  return `
    <div class="status-item">
      <span>${escapeHtml(label)}</span>
      <strong>${escapeHtml(value)}</strong>
      <small>${escapeHtml(detail)}</small>
    </div>
  `;
}

function renderDigestReport(
  report: DigestReport,
  rulesNeedingAttention: DigestReport['ruleHealth'],
  stableRules: DigestReport['ruleHealth']
) {
  return `
    <div class="digest-workbench">
      <div class="signal-ledger">
        <div>
          <span>Period</span>
          <strong>${escapeHtml(formatDate(report.periodStart))} - ${escapeHtml(formatDate(report.periodEnd))}</strong>
        </div>
        <div>
          <span>Overall status</span>
          <strong>${escapeHtml(formatAction(report.overallStatus))}</strong>
        </div>
        <div>
          <span>Active policies</span>
          <strong>${report.summary.activePolicies}</strong>
        </div>
        <div>
          <span>Tracked actions</span>
          <strong>${report.summary.policyTrackedActions}</strong>
        </div>
        <div>
          <span>Unresolved overrides</span>
          <strong>${report.summary.unresolvedOverrides}</strong>
        </div>
      </div>
      <div class="digest-grid">
        <section class="digest-column">
          <h4>Rules Needing Attention</h4>
          ${
            rulesNeedingAttention.length > 0
              ? rulesNeedingAttention.map(renderDigestRule).join('')
              : '<p>No rule needs immediate attention in this digest period.</p>'
          }
        </section>
        <section class="digest-column">
          <h4>Stable Rules</h4>
          ${
            stableRules.length > 0
              ? stableRules.map(renderDigestRule).join('')
              : '<p>No stable rule signal yet. Keep using Apply Policy to build history.</p>'
          }
        </section>
      </div>
      <section class="digest-column">
        <h4>Recommended Actions</h4>
        ${report.recommendations.map(
          (item) => `
            <div class="digest-recommendation severity-${item.severity}">
              <strong>${escapeHtml(item.title)}</strong>
              <p>${escapeHtml(item.detail)}</p>
              ${item.actionLabel ? `<span>${escapeHtml(item.actionLabel)}</span>` : ''}
            </div>
          `
        ).join('')}
      </section>
      <section class="digest-column">
        <h4>Markdown Export</h4>
        <textarea class="markdown-export" readonly>${escapeHtml(report.markdown)}</textarea>
      </section>
    </div>
  `;
}

function renderDigestRule(item: DigestReport['ruleHealth'][number]) {
  return `
    <article class="digest-rule-row status-${item.status}">
      <div>
        <strong>${escapeHtml(item.ruleName)}</strong>
        <span>${escapeHtml(formatAction(item.status))}</span>
      </div>
      <div>
        <span>Adherence ${escapeHtml(formatPercent(item.adherenceRate ?? 0))}</span>
        <span>${item.overrideCount} overrides</span>
        <span>${item.unresolvedOverrideCount} unresolved</span>
      </div>
      <p>${escapeHtml(item.recommendation)}</p>
    </article>
  `;
}

function renderDigestHistory() {
  return `
    <section class="digest-column">
      <h4>Digest History</h4>
      ${
        digestState.history.length > 0
          ? digestState.history
              .map(
                (item) => `
                  <button class="history-row" data-open-digest="${escapeAttribute(item.id)}" type="button">
                    <span>${escapeHtml(formatDate(item.generatedAt))}</span>
                    <strong>${escapeHtml(formatAction(item.overallStatus))}</strong>
                    <small>${item.summary.unresolvedOverrides} unresolved overrides</small>
                  </button>
                `
              )
              .join('')
          : '<p>No saved digest history yet.</p>'
      }
    </section>
  `;
}

function renderSettingsPage() {
  const summary = buildDashboardSummary();
  const redisCapability = getRuntimeCapabilityEntry('redis-smoke');
  const redditCapability = getRuntimeCapabilityEntry('reddit-api-smoke');
  return `
    <section class="settings-stack">
      ${renderRuntimeCapabilitySettings()}
      ${renderIncidentSettings()}
      ${renderConfigPortabilitySettings()}
      ${renderPrivacyRetentionSettings()}
    </section>
    <section class="settings-grid">
      ${renderSettingsCard('Appearance', capitalize(themePreference), themePreference === 'system' ? 'Following the WebView system color-scheme signal. Use the header control to force light or dark mode.' : `Forced ${themePreference} mode for this browser session.`)}
      ${renderSettingsCard('Data mode', formatDataMode(summary.dataMode), summary.dataMode === 'demo' ? 'Demo data is labeled and separate from live subreddit data.' : 'Live scans depend on Reddit API availability.')}
      ${renderSettingsCard('Redis status', getSettingsCapabilityValue(redisCapability, health?.redis.smokeStatus ?? 'not checked'), getSettingsCapabilityDetail(redisCapability, health?.redis.detail ?? healthError ?? 'Health endpoint not loaded yet.'))}
      ${renderSettingsCard('Reddit source status', getSettingsCapabilityValue(redditCapability, health?.environment.playtestStatus ?? 'not runtime verified'), getSettingsCapabilityDetail(redditCapability, 'Rules, removal reasons, and mod log reads are type/build-verified; run the safe smoke check to promote this state.'))}
      ${renderSettingsCard('Last scan', formatDate(summary.lastScanLabel), `${scanState.result?.totalActionsScanned ?? 0} actions scanned in current dashboard state.`)}
      ${renderSettingsCard('Policies', summary.activePolicyCount.toString(), `${policyState.policies.length} policies loaded in this session.`)}
      ${renderSettingsCard('Overrides', summary.unresolvedOverrideCount.toString(), 'Unresolved override count is aggregate-first.')}
      ${renderSettingsCard('Delivery mode', 'log only', 'Public comments, private messages, modmail, and native Mod Notes remain disabled as default delivery until playtest-verified.')}
      ${renderSettingsCard('Digest history', digestState.history.length.toString(), digestState.settings?.lastGeneratedAt ? `Last generated ${formatDate(digestState.settings.lastGeneratedAt)}.` : 'No saved digest history in this subreddit yet.')}
      ${renderSettingsCard('Digest mod discussion', digestState.capabilities?.modDiscussion.state ?? 'unverified', digestState.capabilities?.modDiscussion.detail ?? 'Capability status loads from the digest runtime endpoint.')}
      ${renderSettingsCard('Digest scheduler', digestState.capabilities?.scheduler.state ?? 'unverified', digestState.capabilities?.scheduler.detail ?? 'Weekly scheduling remains opt-in and disabled until runtime-verified.')}
      ${renderSettingsCard('AI advisory', aiAdvisoryState.capabilities?.overall.label ?? 'AI advisory disabled', aiAdvisoryState.capabilities?.overall.detail ?? aiAdvisoryState.error ?? 'Advisory drafts are disabled unless a provider is explicitly configured and runtime-verified.')}
      ${renderSettingsCard('AI enforcement use', aiAdvisoryState.capabilities?.enforcementUse.state ?? 'disabled', aiAdvisoryState.capabilities?.enforcementUse.detail ?? 'AI output cannot decide or execute moderation actions.')}
      ${renderSettingsCard('Team delivery', teamDeliveryState.capabilities?.modDiscussion.state ?? 'unverified', teamDeliveryState.capabilities?.modDiscussion.detail ?? teamDeliveryState.error ?? 'Mod discussion delivery remains preview-first until runtime-verified.')}
      ${renderSettingsCard('Team scheduler', teamDeliveryState.capabilities?.scheduler.state ?? 'unavailable', teamDeliveryState.capabilities?.scheduler.detail ?? 'Scheduled delivery is unavailable until a scheduler task is registered and runtime-verified.')}
      ${renderSettingsCard('Privacy retention', privacyRetentionState.settings ? `${privacyRetentionState.settings.scanHistoryDays} day scans` : 'not loaded', privacyRetentionState.settings ? 'Policy history is protected and operational data can be dry-run before deletion.' : privacyRetentionState.error ?? 'Retention settings have not loaded yet.')}
      ${renderSettingsCard('Demo subreddit', `r/${DEMO_SUBREDDIT_NAME}`, 'ExampleLearning contains seeded Rule 2 drift for screenshots and the 3-minute demo.')}
    </section>
  `;
}

function getRuntimeCapabilityEntry(id: RuntimeCapabilityMatrixEntry['id']) {
  return runtimeCapabilityState.matrix?.entries.find((entry) => entry.id === id);
}

function getSettingsCapabilityValue(
  entry: RuntimeCapabilityMatrixEntry | undefined,
  fallback: string
) {
  return entry ? formatRuntimeCapabilityState(entry.state) : fallback;
}

function getSettingsCapabilityDetail(
  entry: RuntimeCapabilityMatrixEntry | undefined,
  fallback: string
) {
  if (entry?.lastHealthEvent) {
    return `Last ${entry.lastHealthEvent.status}: ${entry.lastHealthEvent.message}`;
  }
  return entry?.summary ?? fallback;
}

function renderRuntimeCapabilitySettings() {
  const matrix = runtimeCapabilityState.matrix;
  const status = runtimeCapabilityState.loading
    ? 'loading'
    : matrix
      ? `${matrix.summary.verifiedRuntime} runtime`
      : 'not loaded';
  const detail =
    runtimeCapabilityState.error ??
    (matrix
      ? `${matrix.summary.typeOnly} type-only, ${matrix.summary.demoOnly} demo-only, ${matrix.summary.failedRuntime} failed.`
      : 'Capability truth has not loaded yet.');
  const entries = matrix?.entries ?? [];

  return `
    <section class="document-panel runtime-capability-panel" aria-label="Runtime capability matrix">
      <div class="section-header">
        <div>
          <h3>Runtime Capability Matrix</h3>
          <p>${escapeHtml(detail)}</p>
        </div>
        <span class="status-pill">${escapeHtml(status)}</span>
      </div>
      <div class="runtime-smoke-controls" aria-label="Safe runtime smoke checks">
        <div>
          <strong>Safe smoke checks</strong>
          <p>Run authenticated WebView diagnostics for Redis, Redis sorted-set ordering, the Redis storage envelope, synthetic retention cleanup, read-only Reddit API access, and current moderator permissions. These checks do not approve, remove, message, or ban.</p>
        </div>
        <div class="button-row">
          <button class="secondary-button compact-button" data-runtime-smoke="redis" type="button" ${runtimeCapabilityState.smokeRunning ? 'disabled' : ''}>Run Redis</button>
          <button class="secondary-button compact-button" data-runtime-smoke="redis-zset" type="button" ${runtimeCapabilityState.smokeRunning ? 'disabled' : ''}>Run Redis ZSET</button>
          <button class="secondary-button compact-button" data-runtime-smoke="redis-storage" type="button" ${runtimeCapabilityState.smokeRunning ? 'disabled' : ''}>Run Redis storage</button>
          <button class="secondary-button compact-button" data-runtime-smoke="retention-cleanup" type="button" ${runtimeCapabilityState.smokeRunning ? 'disabled' : ''}>Run retention cleanup</button>
          <button class="secondary-button compact-button" data-runtime-smoke="reddit" type="button" ${runtimeCapabilityState.smokeRunning ? 'disabled' : ''}>Run Reddit read</button>
          <button class="secondary-button compact-button" data-runtime-smoke="access" type="button" ${runtimeCapabilityState.smokeRunning ? 'disabled' : ''}>Check access</button>
        </div>
      </div>
      ${renderRuntimeSmokeMessage()}
      ${renderManualRuntimeEventForm(entries)}
      <div class="runtime-capability-grid">
        ${entries.map(renderRuntimeCapabilityEntry).join('')}
      </div>
      ${
        matrix?.warnings.length
          ? `<ul class="inline-list">${matrix.warnings.map((warning) => `<li>${escapeHtml(warning)}</li>`).join('')}</ul>`
          : ''
      }
    </section>
  `;
}

function renderManualRuntimeEventForm(entries: RuntimeCapabilityMatrixEntry[]) {
  const disabled =
    runtimeCapabilityState.eventRecording ||
    runtimeCapabilityState.smokeRunning !== undefined ||
    entries.length === 0;
  return `
    <form class="policy-form runtime-manual-event-form" data-runtime-event-form>
      <div class="section-header">
        <div>
          <h4>Manual runtime event</h4>
          <p>Record moderator-observed playtest proof that is not covered by a smoke route.</p>
        </div>
        <span class="status-pill">${runtimeCapabilityState.eventRecording ? 'saving' : 'manual QA'}</span>
      </div>
      <div class="runtime-event-grid">
        <label>
          Capability
          <select name="capabilityId" ${disabled ? 'disabled' : ''} required>
            ${
              entries.length
                ? entries
                    .map(
                      (entry) =>
                        `<option value="${escapeAttribute(entry.id)}">${escapeHtml(entry.label)} (${escapeHtml(formatRuntimeCapabilityState(entry.state))})</option>`
                    )
                    .join('')
                : '<option value="">Load capability matrix first</option>'
            }
          </select>
        </label>
        <label>
          Status
          <select name="status" ${disabled ? 'disabled' : ''} required>
            <option value="passed">Passed</option>
            <option value="failed">Failed</option>
            <option value="skipped">Skipped</option>
          </select>
        </label>
        <label>
          Source
          <select name="source" ${disabled ? 'disabled' : ''} required>
            <option value="playtest">Playtest</option>
            <option value="manual_qa">Manual QA</option>
          </select>
        </label>
      </div>
      <label>
        Evidence note
        <textarea name="message" ${disabled ? 'disabled' : ''} maxlength="280" required placeholder="Example: Native mobile opened Act and preserved the target strip."></textarea>
      </label>
      <label>
        Error detail
        <textarea name="errorMessage" ${disabled ? 'disabled' : ''} maxlength="280" placeholder="Only fill this for a failed observation."></textarea>
      </label>
      <div class="button-row">
        <button class="secondary-button compact-button" type="submit" ${disabled ? 'disabled' : ''}>Record event</button>
      </div>
    </form>
  `;
}

function renderRuntimeSmokeMessage() {
  if (runtimeCapabilityState.smokeRunning) {
    return `<p class="inline-note">Running ${formatRuntimeSmokeCheck(runtimeCapabilityState.smokeRunning)} smoke check...</p>`;
  }
  if (runtimeCapabilityState.error) {
    return `<p class="inline-error">${escapeHtml(runtimeCapabilityState.error)}</p>`;
  }
  if (runtimeCapabilityState.message) {
    return `<p class="inline-success">${escapeHtml(runtimeCapabilityState.message)}</p>`;
  }
  return '';
}

function renderRuntimeCapabilityEntry(entry: RuntimeCapabilityMatrixEntry) {
  const health = entry.lastHealthEvent
    ? `Last ${entry.lastHealthEvent.status}: ${entry.lastHealthEvent.message}`
    : entry.nextAction;
  return `
    <article class="runtime-capability-row capability-${escapeAttribute(entry.state)}">
      <div>
        <strong>${escapeHtml(entry.label)}</strong>
        <span>${escapeHtml(formatRuntimeCapabilityState(entry.state))}</span>
      </div>
      <p>${escapeHtml(entry.summary)}</p>
      <small>${escapeHtml(health)}</small>
    </article>
  `;
}

function formatRuntimeCapabilityState(
  state: RuntimeCapabilityMatrixEntry['state']
) {
  return state.replaceAll('_', ' ');
}

function formatRuntimeSmokeCheck(check: RuntimeSmokeCheck) {
  if (check === 'redis') {
    return 'Redis';
  }
  if (check === 'redis-zset') {
    return 'Redis sorted-set';
  }
  if (check === 'redis-storage') {
    return 'Redis storage envelope';
  }
  if (check === 'retention-cleanup') {
    return 'Retention cleanup';
  }
  if (check === 'reddit') {
    return 'Reddit read-only';
  }
  return 'Access';
}

function renderConfigPortabilitySettings() {
  return `
    <section class="document-panel config-portability" aria-label="Configuration portability">
      <div class="section-header">
        <div>
          <h3>Configuration Portability</h3>
          <p>Export policy ladders, response templates, and non-sensitive settings. Receipts, scans, overrides, content snapshots, and evidence boards are excluded.</p>
        </div>
        <div class="button-row">
          <button class="secondary-button compact-button" data-load-config-templates type="button" ${configPortabilityState.loading ? 'disabled' : ''}>Templates</button>
          <button class="primary-button compact-button" data-export-config type="button" ${configPortabilityState.loading ? 'disabled' : ''}>Export</button>
        </div>
      </div>
      ${renderConfigPortabilityMessage()}
      <div class="config-grid">
        <div class="config-column">
          <h4>Export package</h4>
          ${
            configPortabilityState.exportedPackage
              ? `<textarea class="markdown-export config-json" readonly>${escapeHtml(JSON.stringify(configPortabilityState.exportedPackage, null, 2))}</textarea>`
              : renderEmptyState(
                  'No export loaded',
                  'Generate a package to review the exact portable JSON before sharing it with another community.',
                  []
                )
          }
        </div>
        <div class="config-column">
          <h4>Import package</h4>
          <form class="policy-form config-import-form" data-config-import-form>
            <label>
              Portable JSON
              <textarea name="configJson" rows="12" placeholder="{ &quot;schemaVersion&quot;: &quot;modmirror.config.v1&quot;, ... }">${escapeHtml(configPortabilityState.importText)}</textarea>
            </label>
            <div class="button-row">
              <button class="secondary-button" name="mode" value="dry-run" type="submit" ${configPortabilityState.importing ? 'disabled' : ''}>Dry run</button>
              <button class="primary-button" name="mode" value="import" type="submit" ${configPortabilityState.importing ? 'disabled' : ''}>Import drafts</button>
            </div>
          </form>
        </div>
      </div>
      ${renderConfigImportResult()}
      ${renderConfigTemplates()}
    </section>
  `;
}

function renderConfigPortabilityMessage() {
  if (configPortabilityState.error) {
    return `<p class="inline-error">${escapeHtml(configPortabilityState.error)}</p>`;
  }
  if (configPortabilityState.message) {
    return `<p class="inline-success">${escapeHtml(configPortabilityState.message)}</p>`;
  }
  return '';
}

function renderConfigImportResult() {
  const result = configPortabilityState.importResult;
  if (result === undefined) {
    return '';
  }
  return `
    <div class="config-result">
      <h4>${result.dryRun ? 'Dry-run result' : 'Import result'}</h4>
      <dl class="compact-metrics">
        <div><dt>Accepted</dt><dd>${result.accepted ? 'yes' : 'no'}</dd></div>
        <div><dt>Policies</dt><dd>${result.importedPolicyCount}</dd></div>
        <div><dt>Skipped</dt><dd>${result.skippedPolicyCount}</dd></div>
        <div><dt>Settings</dt><dd>${result.updatedSettings ? (result.dryRun ? 'would update' : 'updated') : 'unchanged'}</dd></div>
      </dl>
      <ol class="incident-list compact">
        ${result.policies
          .map(
            (policy) => `
              <li>
                <strong>${escapeHtml(policy.ruleName)} - ${formatAction(policy.status)}</strong>
                <span>${escapeHtml(policy.message)}</span>
              </li>
            `
          )
          .join('')}
      </ol>
      <ul class="plain-note-list">
        ${result.warnings.map((warning) => `<li>${escapeHtml(warning)}</li>`).join('')}
      </ul>
    </div>
  `;
}

function renderConfigTemplates() {
  if (configPortabilityState.templates.length === 0) {
    return '';
  }
  return `
    <div class="config-result">
      <h4>Starter templates</h4>
      <ol class="incident-list compact">
        ${configPortabilityState.templates
          .map(
            (template) => `
              <li>
                <strong>${escapeHtml(template.packageId)}</strong>
                <span>${template.policies.length} policy starter${template.policies.length === 1 ? '' : 's'} - ${formatAction(template.source)}</span>
                <button class="secondary-button compact-button" data-load-config-template="${escapeAttribute(template.packageId)}" type="button">Load JSON</button>
              </li>
            `
          )
          .join('')}
      </ol>
    </div>
  `;
}

function renderPrivacyRetentionSettings() {
  const settings = getPrivacyRetentionFormSettings();
  return `
    <section class="document-panel privacy-retention" aria-label="Privacy retention controls">
      <div class="section-header">
        <div>
          <h3>Privacy Retention</h3>
          <p>Set deletion windows for operational records. Policy versions remain protected by default.</p>
        </div>
        <div class="button-row">
          <button class="secondary-button compact-button" data-load-privacy-retention type="button" ${privacyRetentionState.loading ? 'disabled' : ''}>Reload</button>
          <button class="secondary-button compact-button" data-export-privacy-inventory type="button" ${privacyRetentionState.loading ? 'disabled' : ''}>Export inventory</button>
        </div>
      </div>
      ${renderPrivacyRetentionMessage()}
      <form class="policy-form retention-form" data-privacy-retention-form>
        <div class="retention-grid">
          ${renderRetentionNumberField('scanHistoryDays', 'Scan history', settings.scanHistoryDays)}
          ${renderRetentionNumberField('actionReceiptDays', 'Action receipts', settings.actionReceiptDays)}
          ${renderRetentionNumberField('evidenceBoardDays', 'Evidence boards', settings.evidenceBoardDays)}
          ${renderRetentionNumberField('teamDeliveryReceiptDays', 'Team delivery receipts', settings.teamDeliveryReceiptDays)}
          ${renderRetentionNumberField('casePacketDays', 'Case packets', settings.casePacketDays)}
          ${renderRetentionNumberField('aiAdvisoryLogDays', 'AI advisory logs', settings.aiAdvisoryLogDays)}
        </div>
        <div class="retention-protected-row">
          <strong>Policy history</strong>
          <span>Protected. Policy versions and review history are not part of manual deletion controls.</span>
        </div>
        <div class="button-row">
          <button class="primary-button" type="submit" ${privacyRetentionState.saving ? 'disabled' : ''}>Save retention</button>
        </div>
      </form>
      <form class="retention-delete-form" data-privacy-delete-form>
        <fieldset>
          <legend>Deletion controls</legend>
          <div class="category-checks">
            ${PRIVACY_RETENTION_CATEGORY_VALUES.map(
              (category) => `
                <label>
                  <input type="checkbox" name="category" value="${category}">
                  ${formatPrivacyCategory(category)}
                </label>
              `
            ).join('')}
          </div>
        </fieldset>
        <div class="button-row">
          <button class="secondary-button" name="mode" value="dry-run" type="submit" ${privacyRetentionState.deleting ? 'disabled' : ''}>Dry run selected</button>
          <button class="secondary-button" name="mode" value="expired" type="submit" ${privacyRetentionState.deleting ? 'disabled' : ''}>Delete expired</button>
          <button class="danger-button" name="mode" value="delete" type="submit" ${privacyRetentionState.deleting ? 'disabled' : ''}>Delete selected</button>
        </div>
      </form>
      ${renderPrivacyRetentionInventory()}
      ${renderPrivacyDeletionResult()}
    </section>
  `;
}

function renderRetentionNumberField(
  name: keyof Pick<
    PrivacyRetentionSettings,
    | 'scanHistoryDays'
    | 'actionReceiptDays'
    | 'evidenceBoardDays'
    | 'teamDeliveryReceiptDays'
    | 'casePacketDays'
    | 'aiAdvisoryLogDays'
  >,
  label: string,
  value: number
) {
  return `
    <label>
      ${label}
      <input type="number" name="${name}" min="1" max="3650" step="1" value="${value}">
    </label>
  `;
}

function renderPrivacyRetentionMessage() {
  if (privacyRetentionState.error) {
    return `<p class="inline-error">${escapeHtml(privacyRetentionState.error)}</p>`;
  }
  if (privacyRetentionState.message) {
    return `<p class="inline-success">${escapeHtml(privacyRetentionState.message)}</p>`;
  }
  return '';
}

function renderPrivacyRetentionInventory() {
  const inventory = privacyRetentionState.inventory;
  if (inventory === undefined) {
    return '';
  }
  return `
    <div class="retention-result">
      <h4>Inventory export</h4>
      <dl class="compact-metrics">
        <div><dt>Subreddit</dt><dd>r/${escapeHtml(inventory.subreddit)}</dd></div>
        <div><dt>Exported</dt><dd>${formatDate(inventory.exportedAt)}</dd></div>
        <div><dt>Categories</dt><dd>${inventory.categories.length}</dd></div>
      </dl>
      ${renderPrivacyReports(inventory.categories)}
      <ul class="plain-note-list">
        ${inventory.warnings.map((warning) => `<li>${escapeHtml(warning)}</li>`).join('')}
      </ul>
    </div>
  `;
}

function renderPrivacyDeletionResult() {
  const result = privacyRetentionState.deletionResult;
  if (result === undefined) {
    return '';
  }
  return `
    <div class="retention-result">
      <h4>${result.dryRun ? 'Dry-run deletion' : 'Deletion receipt'}</h4>
      <dl class="compact-metrics">
        <div><dt>Subreddit</dt><dd>r/${escapeHtml(result.subreddit)}</dd></div>
        <div><dt>Mode</dt><dd>${result.dryRun ? 'dry run' : 'deleted'}</dd></div>
        <div><dt>Recorded</dt><dd>${formatDate(result.deletedAt)}</dd></div>
      </dl>
      ${renderPrivacyReports(result.categories)}
      <ul class="plain-note-list">
        ${result.warnings.map((warning) => `<li>${escapeHtml(warning)}</li>`).join('')}
      </ul>
    </div>
  `;
}

function renderPrivacyReports(
  reports: PrivacyRetentionExport['categories']
) {
  return `
    <ol class="incident-list compact">
      ${reports
        .map(
          (report) => `
            <li>
              <strong>${formatPrivacyCategory(report.category)}</strong>
              <span>${report.protected ? 'Protected' : `${report.retainedCount} retained / ${report.deletedCount} selected`} - ${escapeHtml(report.detail)}</span>
            </li>
          `
        )
        .join('')}
    </ol>
  `;
}

function renderIncidentSettings() {
  const active = incidentModeState.active;
  const hasActive = active !== undefined && active.status === 'active';
  return `
    <section class="document-panel incident-settings" aria-label="Incident Mode">
      <div class="section-header">
        <div>
          <h3>Incident Mode</h3>
          <p>Explicit temporary mode for raids, spam floods, brigading, or crisis handling. It changes review context and receipt tags, not automatic enforcement.</p>
        </div>
        <button class="secondary-button compact-button" data-load-incidents type="button" ${incidentModeState.loading ? 'disabled' : ''}>Refresh</button>
      </div>
      ${renderIncidentModeMessage()}
      ${
        incidentModeState.loading
          ? renderLoadingState('Loading Incident Mode', 'Reading active incident status and recent incident reports.')
          : hasActive
            ? renderActiveIncident(active)
            : renderStartIncidentForm()
      }
      ${renderLastIncidentReport()}
      ${renderRecentIncidents()}
    </section>
  `;
}

function renderIncidentModeMessage() {
  if (incidentModeState.error) {
    return `<p class="inline-error">${escapeHtml(incidentModeState.error)}</p>`;
  }
  if (incidentModeState.message) {
    return `<p class="inline-success">${escapeHtml(incidentModeState.message)}</p>`;
  }
  return '';
}

function renderActiveIncident(active: IncidentMode) {
  return `
    <div class="incident-active">
      <dl class="compact-metrics">
        <div><dt>Status</dt><dd>${formatAction(active.status)}</dd></div>
        <div><dt>Reason</dt><dd>${formatAction(active.reason)}</dd></div>
        <div><dt>Started</dt><dd>${formatDate(active.startedAt)}</dd></div>
        <div><dt>Expires</dt><dd>${formatDate(active.expiresAt)}</dd></div>
      </dl>
      ${active.description ? `<p class="inline-note">${escapeHtml(active.description)}</p>` : ''}
      <div class="incident-guidance-grid">
        <div>
          <h4>Policy preset suggestions</h4>
          <ol class="incident-list">
            ${active.presetSuggestions
              .map(
                (suggestion) => `
                  <li>
                    <strong>${escapeHtml(suggestion.label)}</strong>
                    <span>${formatAction(suggestion.recommendedAction)}. ${escapeHtml(suggestion.detail)}</span>
                    <em>${escapeHtml(suggestion.safetyNote)}</em>
                  </li>
                `
              )
              .join('')}
          </ol>
        </div>
        <div>
          <h4>Triage groups</h4>
          <ol class="incident-list">
            ${active.triageGroups
              .map(
                (group) => `
                  <li>
                    <strong>${escapeHtml(group.label)}</strong>
                    <span>${escapeHtml(group.detail)}</span>
                    <em>${escapeHtml(group.suggestedQueueFilter)}</em>
                  </li>
                `
              )
              .join('')}
          </ol>
        </div>
      </div>
      <form class="policy-form incident-form" data-incident-end-form>
        <label>
          Post-incident note
          <textarea name="reviewNote" rows="3" placeholder="What changed, what still needs review, or why the incident can end."></textarea>
        </label>
        <div class="button-row">
          <button class="secondary-button" type="submit" ${incidentModeState.ending ? 'disabled' : ''}>End Incident Mode</button>
        </div>
      </form>
    </div>
  `;
}

function renderStartIncidentForm() {
  return `
    <form class="policy-form incident-form" data-incident-start-form>
      <div class="incident-form-grid">
        <label>
          Reason
          <select name="reason">
            ${INCIDENT_MODE_REASON_VALUES.map(
              (reason) => `<option value="${reason}">${formatAction(reason)}</option>`
            ).join('')}
          </select>
        </label>
        <label>
          Duration minutes
          <input name="durationMinutes" type="number" min="15" max="1440" step="15" value="120" />
        </label>
      </div>
      <label>
        Description
        <textarea name="description" rows="3" placeholder="What moderators should know before acting during this incident."></textarea>
      </label>
      <div class="button-row">
        <button class="primary-button" type="submit" ${incidentModeState.saving ? 'disabled' : ''}>Start Incident Mode</button>
      </div>
      <p class="inline-note">No auto-remove, auto-ban, or silent action is enabled. Apply Policy still requires confirmation.</p>
    </form>
  `;
}

function renderLastIncidentReport() {
  const report = incidentModeState.report;
  if (report === undefined) {
    return '';
  }
  return `
    <div class="incident-report">
      <h4>Last post-incident report</h4>
      <dl class="compact-metrics">
        <div><dt>Receipts</dt><dd>${report.receiptCount}</dd></div>
        <div><dt>Overrides</dt><dd>${report.overrideCount}</dd></div>
        ${Object.entries(report.executionResults)
          .map(
            ([status, count]) =>
              `<div><dt>${formatAction(status)}</dt><dd>${count}</dd></div>`
          )
          .join('')}
      </dl>
      <ul class="plain-note-list">
        ${report.caveats.map((caveat) => `<li>${escapeHtml(caveat)}</li>`).join('')}
      </ul>
    </div>
  `;
}

function renderRecentIncidents() {
  if (incidentModeState.incidents.length === 0) {
    return '';
  }
  return `
    <div class="incident-report">
      <h4>Recent incidents</h4>
      <ol class="incident-list compact">
        ${incidentModeState.incidents
          .map(
            (incident) => `
              <li>
                <strong>${formatAction(incident.reason)} - ${formatAction(incident.status)}</strong>
                <span>${formatDate(incident.startedAt)} to ${formatDate(incident.endedAt ?? incident.expiresAt)}</span>
              </li>
            `
          )
          .join('')}
      </ol>
    </div>
  `;
}

function renderSettingsCard(title: string, value: string, detail: string) {
  return `
    <article class="action-card">
      <h3>${escapeHtml(title)}</h3>
      <strong class="settings-value">${escapeHtml(value)}</strong>
      <p>${escapeHtml(detail)}</p>
    </article>
  `;
}

function renderMetricCard(label: string, value: string) {
  return `
    <article class="metric-card">
      <span>${escapeHtml(label)}</span>
      <strong>${escapeHtml(value)}</strong>
    </article>
  `;
}

function renderConfidenceItem(confidence: Confidence, count: number) {
  return `
    <div class="confidence-item confidence-${confidence}">
      <span>${confidence}</span>
      <strong>${count}</strong>
    </div>
  `;
}

function renderDistributionItem(action: EnforcementAction, count: number) {
  return `
    <div class="distribution-item">
      <span>${formatAction(action)}</span>
      <strong>${count}</strong>
    </div>
  `;
}

function formatDistribution(
  distribution: Partial<Record<EnforcementAction, number>>
): string {
  const entries = Object.entries(distribution);
  if (entries.length === 0) {
    return 'no current distribution';
  }
  return entries
    .map(([action, count]) => `${formatAction(action)} ${count}`)
    .join(', ');
}

function renderEmptyState(
  title: string,
  body: string,
  actions: CommandCenterAction[]
) {
  return `
    <section class="empty-state">
      <div>
        <h3>${escapeHtml(title)}</h3>
        <p>${escapeHtml(body)}</p>
      </div>
      ${
        actions.length > 0
          ? `<div class="button-row">${actions
              .map(
                (action) =>
                  `<button class="secondary-button" data-action-intent="${action.intent}" type="button">${escapeHtml(action.label)}</button>`
              )
              .join('')}</div>`
          : ''
      }
    </section>
  `;
}

function renderLoadingState(title: string, body: string) {
  return `
    <section class="empty-state">
      <div>
        <h3>${escapeHtml(title)}</h3>
        <p>${escapeHtml(body)}</p>
        <p class="helper-text">Requests time out after ${Math.round(API_TIMEOUT_MS / 1000)} seconds with a labeled retry or fallback message.</p>
      </div>
    </section>
  `;
}

function bindAllActions() {
  bindNavigation();
  bindAppearanceActions();
  bindActionIntents();
  bindV2ProductActions();
  bindScanActions();
  bindCalibrationActions();
  bindModqueueActions();
  bindPolicyActions();
  bindApplyPolicyActions();
  bindCasePacketActions();
  bindEvidenceBoardActions();
  bindIncidentModeActions();
  bindConfigPortabilityActions();
  bindPrivacyRetentionActions();
  bindRuntimeCapabilityActions();
  bindGovernanceActions();
  bindDigestActions();
  bindReceiptActions();
  document
    .querySelectorAll<HTMLButtonElement>('[data-load-health]')
    .forEach((button) => {
      button.addEventListener('click', () => {
        void loadHealth();
      });
    });
}

function bindAppearanceActions() {
  document
    .querySelectorAll<HTMLButtonElement>('[data-theme-option]')
    .forEach((button) => {
      button.addEventListener('click', () => {
        const option = button.dataset.themeOption;
        if (option === 'system' || option === 'light' || option === 'dark') {
          themePreference = option;
          saveThemePreference(option);
          applyThemePreference();
          render();
        }
      });
    });
}

function bindNavigation() {
  document.querySelectorAll<HTMLButtonElement>('[data-page]').forEach((button) => {
    button.addEventListener('click', () => {
      const nextPage = button.dataset.page;
      if (nextPage && pages.some((page) => page.id === nextPage)) {
        activePage = nextPage as ProductPageId;
        window.location.hash = `#${activePage}`;
        if (activePage === 'review') {
          void loadGovernance();
          return;
        }
        render();
      }
    });
  });
}

function bindActionIntents() {
  document
    .querySelectorAll<HTMLButtonElement>('[data-action-intent]')
    .forEach((button) => {
      button.addEventListener('click', () => {
        handleActionIntent(button.dataset.actionIntent);
      });
    });
}

function bindV2ProductActions() {
  document.querySelectorAll<HTMLButtonElement>('[data-v2-target]').forEach((button) => {
    button.addEventListener('click', () => {
      const target = button.dataset.v2Target;
      if (target === 'calibration') {
        activePage = 'review';
        window.location.hash = '#review';
        void loadV2ProductSurfaces();
        return;
      }
      if (target && pages.some((page) => page.id === target)) {
        activePage = target as ProductPageId;
        window.location.hash = `#${activePage}`;
        render();
      }
    });
  });

  document.querySelectorAll<HTMLButtonElement>('[data-demo-reset]').forEach((button) => {
    button.addEventListener('click', () => {
      void resetDemoOrchestrationFromUi();
    });
  });

  document.querySelectorAll<HTMLButtonElement>('[data-calibration-answer]').forEach((button) => {
    button.addEventListener('click', () => {
      const scenarioId = button.dataset.calibrationAnswer;
      const selectedAction = button.dataset.calibrationAction;
      if (scenarioId && isEnforcementAction(selectedAction)) {
        void submitCalibrationAnswerFromUi(scenarioId, selectedAction);
      }
    });
  });

  document.querySelectorAll<HTMLButtonElement>('[data-review-task-status]').forEach((button) => {
    button.addEventListener('click', () => {
      const taskId = button.dataset.reviewTaskStatus;
      const status = button.dataset.reviewTaskNext;
      if (
        taskId &&
        (status === 'unresolved' || status === 'in_review' || status === 'resolved')
      ) {
        void updateReviewTaskStatusFromUi(taskId, status);
      }
    });
  });

  document.querySelectorAll<HTMLButtonElement>('[data-scenario-archive]').forEach((button) => {
    button.addEventListener('click', () => {
      const scenarioId = button.dataset.scenarioArchive;
      if (scenarioId) {
        void archiveScenarioFromUi(scenarioId);
      }
    });
  });

  document.querySelectorAll<HTMLFormElement>('[data-scenario-form]').forEach((form) => {
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      void createScenarioFromUi(new FormData(form));
    });
  });
}

function handleActionIntent(intent: string | undefined) {
  if (intent === 'load_demo') {
    void runScan('demo');
    return;
  }
  if (intent === 'run_scan') {
    activePage = 'scan';
    window.location.hash = '#scan';
    render();
    return;
  }
  if (intent === 'apply_policy') {
    activePage = 'act';
    window.location.hash = '#act';
    render();
    return;
  }
  if (intent === 'create_policy') {
    activePage = 'agree';
    window.location.hash = '#agree';
    render();
    return;
  }
  if (intent === 'review_overrides') {
    activePage = 'review';
    window.location.hash = '#review';
    void loadGovernance();
    return;
  }
  if (intent === 'review_policy') {
    activePage = 'review';
    window.location.hash = '#review';
    render();
    return;
  }
  if (intent === 'generate_digest') {
    activePage = 'prove';
    window.location.hash = '#prove';
    void generateDigest();
  }
}

function bindReceiptActions() {
  document
    .querySelectorAll<HTMLButtonElement>('[data-load-receipts]')
    .forEach((button) => {
      button.addEventListener('click', () => {
        void loadReceipts();
      });
    });
}

function bindScanActions() {
  document
    .querySelectorAll<HTMLButtonElement>('[data-run-scan]')
    .forEach((button) => {
      button.addEventListener('click', () => {
        const mode = button.dataset.runScan === 'demo' ? 'demo' : 'live';
        const depth = parseScanDepth(button.dataset.scanDepth);
        void runScan(mode, depth);
      });
    });
}

function bindPolicyActions() {
  document
    .querySelectorAll<HTMLButtonElement>('[data-load-policies]')
    .forEach((button) => {
      button.addEventListener('click', () => {
        void loadPolicies();
      });
    });

  document
    .querySelectorAll<HTMLButtonElement>('[data-reset-policy-form]')
    .forEach((button) => {
      button.addEventListener('click', () => {
        policyState = {
          ...policyState,
          form: emptyPolicyForm(),
          error: undefined,
          message: undefined,
        };
        activePage = 'agree';
        window.location.hash = '#agree';
        render();
      });
    });

  document.querySelectorAll<HTMLButtonElement>('[data-edit-policy]').forEach((button) => {
    button.addEventListener('click', () => {
      const policy = policyState.policies.find(
        (item) => item.id === button.dataset.editPolicy
      );
      if (policy) {
        policyState = {
          ...policyState,
          form: policyToForm(policy),
          error: undefined,
          message: undefined,
        };
        activePage = 'agree';
        window.location.hash = '#agree';
        render();
      }
    });
  });

  document.querySelectorAll<HTMLButtonElement>('[data-propose-policy]').forEach((button) => {
    button.addEventListener('click', () => {
      const policyId = button.dataset.proposePolicy;
      if (policyId) {
        void transitionPolicyLifecycle(policyId, 'propose');
      }
    });
  });

  document.querySelectorAll<HTMLButtonElement>('[data-review-policy]').forEach((button) => {
    button.addEventListener('click', () => {
      const policyId = button.dataset.reviewPolicy;
      const decision = button.dataset.reviewDecision;
      if (policyId && (decision === 'approve' || decision === 'request_changes')) {
        void transitionPolicyLifecycle(policyId, 'review', decision);
      }
    });
  });

  document.querySelectorAll<HTMLButtonElement>('[data-adopt-policy]').forEach((button) => {
    button.addEventListener('click', () => {
      const policyId = button.dataset.adoptPolicy;
      if (policyId) {
        void transitionPolicyLifecycle(
          policyId,
          'adopt',
          undefined,
          button.dataset.quickAdoption === 'true'
        );
      }
    });
  });

  document.querySelectorAll<HTMLButtonElement>('[data-replay-policy]').forEach((button) => {
    button.addEventListener('click', () => {
      const policyId = button.dataset.replayPolicy;
      if (policyId) {
        void runPolicyReplayFromUi(policyId);
      }
    });
  });

  document
    .querySelectorAll<HTMLButtonElement>('[data-create-from-drift]')
    .forEach((button) => {
      button.addEventListener('click', () => {
        const index = Number(button.dataset.createFromDrift);
        const candidate = scanState.result?.driftCandidates[index];
        if (candidate) {
          void createPolicyFromDrift(candidate);
        }
      });
    });

  document.querySelector<HTMLFormElement>('[data-policy-form]')?.addEventListener(
    'submit',
    (event) => {
      event.preventDefault();
      void savePolicyForm(new FormData(event.currentTarget as HTMLFormElement));
    }
  );
}

function bindCalibrationActions() {
  document
    .querySelectorAll<HTMLFormElement>('[data-calibration-form]')
    .forEach((form) => {
      form.addEventListener('submit', (event) => {
        event.preventDefault();
        void saveAttributionCorrection(
          new FormData(event.currentTarget as HTMLFormElement)
        );
      });
    });
}

function bindModqueueActions() {
  document.querySelectorAll<HTMLButtonElement>('[data-load-modqueue]').forEach((button) => {
    button.addEventListener('click', () => {
      void loadModqueueTriage();
    });
  });

  document.querySelectorAll<HTMLButtonElement>('[data-apply-triage]').forEach((button) => {
    button.addEventListener('click', () => {
      const itemId = button.dataset.applyTriage;
      const item = modqueueState.response?.items.find(
        (candidate) => candidate.id === itemId
      );
      if (item) {
        applyTriageItem(item);
      }
    });
  });
}

function bindApplyPolicyActions() {
  document.querySelectorAll<HTMLButtonElement>('[data-apply-preview]').forEach((button) => {
    button.addEventListener('click', () => {
      const form = document.querySelector<HTMLFormElement>('[data-apply-form]');
      if (form) {
        void previewApplyPolicy(new FormData(form));
      }
    });
  });

  document.querySelector<HTMLFormElement>('[data-apply-form]')?.addEventListener(
    'submit',
    (event) => {
      event.preventDefault();
      void confirmApplyPolicy(new FormData(event.currentTarget as HTMLFormElement));
    }
  );
}

function bindCasePacketActions() {
  document.querySelectorAll<HTMLButtonElement>('[data-generate-demo-case]').forEach((button) => {
    button.addEventListener('click', () => {
      void generateCasePacket({ type: 'demo' });
    });
  });

  document.querySelectorAll<HTMLButtonElement>('[data-case-from-action]').forEach((button) => {
    button.addEventListener('click', () => {
      const actionId = button.dataset.caseFromAction;
      if (actionId) {
        void generateCasePacket({ type: 'action', actionId });
      }
    });
  });

  document
    .querySelector<HTMLFormElement>('[data-case-action-form]')
    ?.addEventListener('submit', (event) => {
      event.preventDefault();
      const formData = new FormData(event.currentTarget as HTMLFormElement);
      const actionId = String(formData.get('actionId') ?? '').trim();
      if (actionId) {
        void generateCasePacket({ type: 'action', actionId });
      }
    });

  document.querySelectorAll<HTMLButtonElement>('[data-copy-case-markdown]').forEach((button) => {
    button.addEventListener('click', () => {
      void copyCasePacketMarkdown();
    });
  });

  document.querySelectorAll<HTMLButtonElement>('[data-save-case-delivery]').forEach((button) => {
    button.addEventListener('click', () => {
      const channel = button.dataset.saveCaseDelivery;
      if (channel === 'manual_markdown' || channel === 'mod_discussion') {
        void saveCasePacketDeliveryReceipt(channel);
      }
    });
  });
}

function bindEvidenceBoardActions() {
  document
    .querySelectorAll<HTMLButtonElement>('[data-load-evidence-boards]')
    .forEach((button) => {
      button.addEventListener('click', () => {
        void loadEvidenceBoards();
      });
    });

  document
    .querySelectorAll<HTMLButtonElement>('[data-create-evidence-board-case]')
    .forEach((button) => {
      button.addEventListener('click', () => {
        void createEvidenceBoardFromCasePacket();
      });
    });

  document
    .querySelectorAll<HTMLButtonElement>('[data-create-evidence-board-receipt]')
    .forEach((button) => {
      button.addEventListener('click', () => {
        const receiptId = button.dataset.createEvidenceBoardReceipt;
        if (receiptId) {
          void createEvidenceBoardFromReceipt(receiptId);
        }
      });
    });

  document
    .querySelectorAll<HTMLFormElement>('[data-evidence-board-status-form]')
    .forEach((form) => {
      form.addEventListener('submit', (event) => {
        event.preventDefault();
        const boardId = form.dataset.evidenceBoardStatusForm;
        const formData = new FormData(form);
        const status = String(formData.get('status') ?? '');
        const note = String(formData.get('note') ?? '').trim();
        if (boardId && isEvidenceBoardStatus(status)) {
          void updateEvidenceBoardStatusFromForm(boardId, status, note);
        }
      });
    });
}

function bindIncidentModeActions() {
  document
    .querySelectorAll<HTMLButtonElement>('[data-load-incidents]')
    .forEach((button) => {
      button.addEventListener('click', () => {
        void loadIncidentMode();
      });
    });

  document
    .querySelectorAll<HTMLButtonElement>('[data-end-incident]')
    .forEach((button) => {
      button.addEventListener('click', () => {
        void endIncidentMode('');
      });
    });

  document
    .querySelectorAll<HTMLFormElement>('[data-incident-start-form]')
    .forEach((form) => {
      form.addEventListener('submit', (event) => {
        event.preventDefault();
        void startIncidentMode(new FormData(form));
      });
    });

  document
    .querySelectorAll<HTMLFormElement>('[data-incident-end-form]')
    .forEach((form) => {
      form.addEventListener('submit', (event) => {
        event.preventDefault();
        const note = String(new FormData(form).get('reviewNote') ?? '').trim();
        void endIncidentMode(note);
      });
    });
}

function bindConfigPortabilityActions() {
  document
    .querySelectorAll<HTMLButtonElement>('[data-export-config]')
    .forEach((button) => {
      button.addEventListener('click', () => {
        void exportPortableConfig();
      });
    });

  document
    .querySelectorAll<HTMLButtonElement>('[data-load-config-templates]')
    .forEach((button) => {
      button.addEventListener('click', () => {
        void loadPortableConfigTemplates();
      });
    });

  document
    .querySelectorAll<HTMLButtonElement>('[data-load-config-template]')
    .forEach((button) => {
      button.addEventListener('click', () => {
        const packageId = button.dataset.loadConfigTemplate;
        const template = configPortabilityState.templates.find(
          (item) => item.packageId === packageId
        );
        if (template !== undefined) {
          configPortabilityState = {
            ...configPortabilityState,
            importText: JSON.stringify(template, null, 2),
            message: 'Starter template loaded into the import box.',
            error: undefined,
          };
          render();
        }
      });
    });

  document
    .querySelectorAll<HTMLFormElement>('[data-config-import-form]')
    .forEach((form) => {
      form.addEventListener('submit', (event) => {
        event.preventDefault();
        const submitter = event.submitter as HTMLButtonElement | null;
        const formData = new FormData(form);
        const configJson = String(formData.get('configJson') ?? '').trim();
        const dryRun = submitter?.value !== 'import';
        void importPortableConfig(configJson, dryRun);
      });
    });
}

function bindPrivacyRetentionActions() {
  document
    .querySelectorAll<HTMLButtonElement>('[data-load-privacy-retention]')
    .forEach((button) => {
      button.addEventListener('click', () => {
        void loadPrivacyRetentionSettings();
      });
    });

  document
    .querySelectorAll<HTMLButtonElement>('[data-export-privacy-inventory]')
    .forEach((button) => {
      button.addEventListener('click', () => {
        void exportPrivacyInventory();
      });
    });

  document
    .querySelectorAll<HTMLFormElement>('[data-privacy-retention-form]')
    .forEach((form) => {
      form.addEventListener('submit', (event) => {
        event.preventDefault();
        void savePrivacyRetentionSettings(new FormData(form));
      });
    });

  document
    .querySelectorAll<HTMLFormElement>('[data-privacy-delete-form]')
    .forEach((form) => {
      form.addEventListener('submit', (event) => {
        event.preventDefault();
        const submitter = event.submitter as HTMLButtonElement | null;
        void deletePrivacyDataFromForm(new FormData(form), submitter?.value);
      });
    });
}

function bindRuntimeCapabilityActions() {
  document
    .querySelectorAll<HTMLButtonElement>('[data-runtime-smoke]')
    .forEach((button) => {
      button.addEventListener('click', () => {
        const check = button.dataset.runtimeSmoke;
        if (
          check === 'redis' ||
          check === 'redis-zset' ||
          check === 'redis-storage' ||
          check === 'retention-cleanup' ||
          check === 'reddit' ||
          check === 'access'
        ) {
          void runRuntimeSmokeCheck(check);
        }
      });
    });
  document
    .querySelectorAll<HTMLFormElement>('[data-runtime-event-form]')
    .forEach((form) => {
      form.addEventListener('submit', (event) => {
        event.preventDefault();
        void recordManualRuntimeEvent(new FormData(form));
      });
    });
}

function bindGovernanceActions() {
  document.querySelectorAll<HTMLButtonElement>('[data-load-governance]').forEach((button) => {
    button.addEventListener('click', () => {
      void loadGovernance();
    });
  });

  document.querySelectorAll<HTMLButtonElement>('[data-filter-overrides]').forEach((button) => {
    button.addEventListener('click', () => {
      activePage = 'review';
      window.location.hash = '#review';
      void loadGovernance(button.dataset.filterOverrides);
    });
  });

  document.querySelectorAll<HTMLButtonElement>('[data-review-override]').forEach((button) => {
    button.addEventListener('click', () => {
      const overrideId = button.dataset.reviewOverride;
      const status = button.dataset.reviewStatus as
        | OverrideReviewStatus
        | undefined;
      if (!overrideId || !status) {
        return;
      }
      const noteInput = document.querySelector<HTMLInputElement>(
        `[data-review-note="${cssEscape(overrideId)}"]`
      );
      void reviewOverride(overrideId, status, noteInput?.value.trim());
    });
  });
}

function bindDigestActions() {
  document.querySelectorAll<HTMLButtonElement>('[data-generate-digest]').forEach((button) => {
    button.addEventListener('click', () => {
      void generateDigest();
    });
  });
  document.querySelectorAll<HTMLButtonElement>('[data-copy-digest]').forEach((button) => {
    button.addEventListener('click', () => {
      void copyDigestMarkdown();
    });
  });
  document.querySelectorAll<HTMLButtonElement>('[data-open-digest]').forEach((button) => {
    button.addEventListener('click', () => {
      const digestId = button.dataset.openDigest;
      const report = digestState.history.find((item) => item.id === digestId);
      if (report) {
        digestState = {
          ...digestState,
          report,
          message: `Opened digest from ${formatDate(report.generatedAt)}.`,
        };
        render();
      }
    });
  });
}

function openDashboard(event?: MouseEvent) {
  requestExpandedModeFallback(event);
  dashboardOpen = true;
  activePage = getPageFromHash();
  if (window.location.hash.length <= 1) {
    window.location.hash = '#act';
  }
  render();
}

function getCurrentWebViewMode(): 'inline' | 'expanded' {
  return getDevvitGlobal()?.webViewMode === WEB_VIEW_IMMERSIVE_MODE
    ? 'expanded'
    : 'inline';
}

function requestExpandedModeFallback(event?: MouseEvent) {
  if (
    getCurrentWebViewMode() === 'inline' &&
    (!event || (event.isTrusted && event.type === 'click'))
  ) {
    emitWebViewModeEffect(WEB_VIEW_IMMERSIVE_MODE);
  }
}

function requestInlineModeFallback() {
  if (getCurrentWebViewMode() === 'expanded') {
    emitWebViewModeEffect(WEB_VIEW_INLINE_MODE);
  }
}

function emitWebViewModeEffect(immersiveMode: number) {
  if (window.parent === window) {
    return;
  }

  window.parent.postMessage(
    {
      type: DEVVIT_INTERNAL_MESSAGE_TYPE,
      scope: WEB_VIEW_CLIENT_SCOPE,
      immersiveMode: {
        immersiveMode,
      },
    },
    '*'
  );
}

function getDevvitGlobal(): DevvitWebViewGlobal | undefined {
  const candidate = (globalThis as { devvit?: DevvitWebViewGlobal }).devvit;
  return candidate && typeof candidate === 'object' ? candidate : undefined;
}

async function runScan(mode: ScanMode, depth: MirrorScanDepth = 'standard') {
  scanState = {
    loading: true,
    mode,
    depth,
    warnings: [],
  };
  dashboardOpen = true;
  activePage = 'scan';
  window.location.hash = '#scan';
  render();

  try {
    const payload = await fetchApi<MirrorScan>(API_ROUTES.scan, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ mode, depth }),
    });
    const record = await loadScanRecord(payload).catch(() => undefined);
    scanState = {
      loading: false,
      mode,
      depth,
      result: payload,
      record,
      warnings: payload.warnings,
    };
    await loadV2ProductSurfaces();
  } catch (error) {
    if (mode === 'demo') {
      const payload = createClientPreviewDemoScan();
      scanState = {
        loading: false,
        mode,
        depth,
        result: payload,
        record: undefined,
        warnings: payload.warnings,
      };
      await loadV2ProductSurfaces();
      render();
      return;
    }

    scanState = {
      loading: false,
      mode,
      depth,
      error: normalizeClientError(error, 'Scan could not reach the ModMirror API.'),
      warnings: [],
    };
  }

  render();
}

async function loadScanRecord(scan: MirrorScan): Promise<MirrorScanRecord> {
  return fetchApi<MirrorScanRecord>(
    `${API_ROUTES.scans}/${encodeURIComponent(scan.id)}?subreddit=${encodeURIComponent(scan.subreddit)}`
  );
}

async function saveAttributionCorrection(formData: FormData) {
  const actionId = String(formData.get('actionId') ?? '').trim();
  if (!actionId || scanState.result === undefined) {
    return;
  }

  scanState = {
    ...scanState,
    calibrationSavingActionId: actionId,
    calibrationError: undefined,
    calibrationMessage: undefined,
  };
  render();

  const body = formDataToAttributionCorrection(formData);
  try {
    const correction = await fetchApi<AttributionCorrection>(
      API_ROUTES.attributionCorrections,
      {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(body),
      }
    );
    scanState = {
      ...scanState,
      calibrationSavingActionId: undefined,
      calibrationMessage: `Correction saved for ${correction.actionId}. Future scans will use it.`,
      record: applyCorrectionToScanRecord(scanState.record, correction),
    };
  } catch (error) {
    scanState = {
      ...scanState,
      calibrationSavingActionId: undefined,
      calibrationError: normalizeClientError(
        error,
        'Attribution correction could not be saved.'
      ),
    };
  }

  render();
}

function applyCorrectionToScanRecord(
  record: MirrorScanRecord | undefined,
  correction: AttributionCorrection
): MirrorScanRecord | undefined {
  if (record === undefined) {
    return undefined;
  }
  return {
    ...record,
    attributedActions: record.attributedActions.map((action) =>
      action.id === correction.actionId
        ? applyCorrectionToAction(action, correction)
        : action
    ),
  };
}

function applyCorrectionToAction(
  action: AttributedModAction,
  correction: AttributionCorrection
): AttributedModAction {
  const correctionSnapshot: AttributedModAction['correction'] = {
    correctionId: correction.id,
    correctedRuleKey: correction.correctedRuleKey,
    correctedBy: correction.correctedBy,
    correctedAt: correction.correctedAt,
    originalConfidence: correction.originalConfidence,
  };
  const corrected: AttributedModAction = {
    ...action,
    inferredRuleKey: correction.correctedRuleKey,
    confidence: 'high',
    attributionKind: 'corrected',
    correction: correctionSnapshot,
    evidence: [
      `Moderator correction applied by ${correction.correctedBy}.`,
      ...action.evidence,
    ],
  };
  if (correction.correctedRuleName !== undefined) {
    corrected.inferredRuleName = correction.correctedRuleName;
    correctionSnapshot.correctedRuleName = correction.correctedRuleName;
  } else {
    delete corrected.inferredRuleName;
  }
  if (correction.originalRuleKey !== undefined) {
    correctionSnapshot.originalRuleKey = correction.originalRuleKey;
  }
  if (correction.originalRuleName !== undefined) {
    correctionSnapshot.originalRuleName = correction.originalRuleName;
  }
  if (correction.note !== undefined) {
    correctionSnapshot.note = correction.note;
  }
  return corrected;
}

function formDataToAttributionCorrection(formData: FormData) {
  const body: Record<string, string> = {
    subreddit: scanState.result?.subreddit ?? '',
    actionId: String(formData.get('actionId') ?? ''),
    correctedRuleKey: String(formData.get('correctedRuleKey') ?? ''),
    originalConfidence: String(formData.get('originalConfidence') ?? 'unmatched'),
  };
  copyFormString(body, 'targetThingId', formData);
  copyFormString(body, 'sourceScanId', formData);
  copyFormString(body, 'originalRuleKey', formData);
  copyFormString(body, 'originalRuleName', formData);
  copyFormString(body, 'correctedRuleName', formData);
  copyFormString(body, 'note', formData);
  return body;
}

function copyFormString(
  body: Record<string, string>,
  fieldName: string,
  formData: FormData
) {
  const value = String(formData.get(fieldName) ?? '').trim();
  if (value) {
    body[fieldName] = value;
  }
}

function parseScanDepth(value: string | undefined): MirrorScanDepth {
  if (value === 'quick' || value === 'deep') {
    return value;
  }
  return 'standard';
}

function formatScanDepth(depth: MirrorScanDepth): string {
  return `${depth.charAt(0).toUpperCase()}${depth.slice(1)}`;
}

function createClientPreviewDemoScan(): MirrorScan {
  return {
    id: `client-demo-scan-${Date.now()}`,
    subreddit: DEMO_SUBREDDIT_NAME,
    createdAt: new Date().toISOString(),
    createdBy: 'local-preview',
    source: 'demo',
    totalActionsScanned: 60,
    attributedCount: 52,
    unmatchedCount: 8,
    confidenceBreakdown: {
      high: 31,
      medium: 14,
      low: 7,
      unmatched: 8,
    },
    driftCandidates: [
      {
        ruleKey: 'low-effort-questions-2',
        ruleName: 'Low-effort questions',
        confidence: 'high',
        summary:
          'Rule 2 first-time cases are split across warnings, removals, and temporary-ban suggestions.',
        totalActions: 24,
        actionDistribution: {
          warn: 9,
          remove: 10,
          temporary_ban_suggested: 5,
        },
        recommendation:
          'Create the Rule 2 ladder and review stricter-than-policy exceptions.',
      },
      {
        ruleKey: 'self-promotion-3',
        ruleName: 'Self-promotion',
        confidence: 'medium',
        summary:
          'Rule 3 is mostly consistent, with a small number of manual-review outcomes.',
        totalActions: 18,
        actionDistribution: {
          remove: 15,
          manual_review: 3,
        },
        recommendation:
          'Keep monitoring; this rule can serve as the comparison baseline.',
      },
    ],
    scanDepth: {
      depth: 'standard',
      requestedLimit: 60,
      pageSize: 60,
      fetchedActions: 60,
      hitLimit: true,
      paginationStrategy: 'listing_all',
      runtimeVerified: true,
    },
    smallSubredditStatus: {
      meetsThreshold: true,
      observedActions: 60,
      minimumActions: 20,
      message: 'Enough demo actions to show drift candidates.',
    },
    warnings: [
      'Demo mode: ExampleLearning seed data is labeled and separate from live subreddit data.',
      'Local static preview could not reach the ModMirror API, so the deterministic demo scan is rendered in memory.',
    ],
  };
}

function canUseClientDemoFallback() {
  return (
    scanState.result?.source === 'demo' ||
    policyState.policies.some((policy) => policy.subreddit === DEMO_SUBREDDIT_NAME)
  );
}

function isStandaloneStaticPreview() {
  return window.parent === window && getDevvitGlobal() === undefined;
}

function getPrivacyRetentionFormSettings(): PrivacyRetentionSettings {
  return (
    privacyRetentionState.settings ?? {
      subreddit: getWorkspaceSubreddit() ?? DEMO_SUBREDDIT_NAME,
      updatedAt: '1970-01-01T00:00:00.000Z',
      scanHistoryDays: 90,
      actionReceiptDays: 180,
      evidenceBoardDays: 365,
      teamDeliveryReceiptDays: 180,
      casePacketDays: 180,
      aiAdvisoryLogDays: 30,
      protectPolicyHistory: true,
    }
  );
}

function getWorkspaceSubreddit() {
  if (scanState.result?.source === 'demo') {
    return scanState.result.subreddit;
  }
  if (
    policyState.policies.some((policy) => policy.subreddit === DEMO_SUBREDDIT_NAME)
  ) {
    return DEMO_SUBREDDIT_NAME;
  }
  if (applyState.result?.actionEvent.subreddit === DEMO_SUBREDDIT_NAME) {
    return DEMO_SUBREDDIT_NAME;
  }
  return undefined;
}

function withWorkspaceSubreddit(url: string) {
  const subreddit = getWorkspaceSubreddit();
  if (!subreddit) {
    return url;
  }
  const joiner = url.includes('?') ? '&' : '?';
  return `${url}${joiner}subreddit=${encodeURIComponent(subreddit)}`;
}

function readRetentionDays(formData: FormData, key: string) {
  const value = Number(formData.get(key) ?? 0);
  return Number.isFinite(value) ? value : 0;
}

function isPrivacyRetentionCategory(
  value: string
): value is PrivacyRetentionCategory {
  return PRIVACY_RETENTION_CATEGORY_VALUES.includes(
    value as PrivacyRetentionCategory
  );
}

function formatPrivacyCategory(category: string) {
  if (category === 'policy_history') {
    return 'Policy history';
  }
  return formatAction(category);
}

function createClientDigestCapabilities(): DigestCapabilities {
  return {
    modDiscussion: {
      state: 'unverified',
      label: 'Mod discussion delivery',
      detail:
        'Delivery requires Devvit runtime verification. Manual copy remains available.',
    },
    scheduler: {
      state: 'unverified',
      label: 'Weekly scheduler',
      detail:
        'Scheduled digest delivery is not enabled in static preview or unverified runtime.',
    },
  };
}

function createClientDigestSettings(): DigestSettings {
  return {
    subreddit: getWorkspaceSubreddit() ?? DEMO_SUBREDDIT_NAME,
    updatedAt: new Date(0).toISOString(),
    deliveryMode: 'none',
    scheduleEnabled: false,
    scheduleCadence: 'weekly',
  };
}

function createClientDemoDigestReport(): DigestReport {
  const generatedAt = new Date().toISOString();
  const health = governanceState.health ?? createClientDemoHealth();
  const summary = buildDashboardSummary();
  const ruleHealth = health.summaries.map((item) => ({
    ruleKey: item.ruleKey,
    ruleName: item.ruleName,
    status: item.status,
    adherenceRate: item.adherenceRate,
    trackedActions: item.totalActions,
    overrideCount: item.overrideCount,
    unresolvedOverrideCount: item.unresolvedOverrideCount,
    topOverrideReason: 'severe_context' as const,
    recommendation: item.recommendations[0] ?? 'Continue monitoring.',
  }));
  const digestSummary: DigestReport['summary'] = {
    activePolicies: summary.activePolicyCount,
    policyTrackedActions: 12,
    unresolvedOverrides: summary.unresolvedOverrideCount,
    rulesNeedingReview: health.policiesNeedingReview,
  };
  if (scanState.result?.createdAt !== undefined) {
    digestSummary.lastScanAt = scanState.result.createdAt;
  }
  const markdown = [
    `# ModMirror Digest - r/${DEMO_SUBREDDIT_NAME}`,
    '',
    `Period: ${formatDate(generatedAt)} - ${formatDate(generatedAt)}`,
    '',
    '## Summary',
    '',
    '- Overall consistency: needs review',
    `- Active policies: ${summary.activePolicyCount}`,
    '- Policy-tracked actions: 12',
    `- Unresolved overrides: ${summary.unresolvedOverrideCount}`,
    `- Rules needing review: ${health.policiesNeedingReview}`,
    '',
    '## Rules Needing Attention',
    '',
    '### Low-effort questions',
    'Status: needs review',
    'Adherence: 67%',
    'Overrides: 3',
    'Recommended next step:',
    'Review unresolved Rule 2 overrides and decide whether the ladder should change.',
    '',
    '## Suggested Actions',
    '',
    '1. Resolve open overrides before changing the policy.',
    '2. Generate case packets for contested Rule 2 actions.',
    '',
    '## Caveats',
    '',
    '- Demo data is labeled and separate from live subreddit data.',
    '- Recommendations are deterministic and do not use AI.',
  ].join('\n');

  return {
    id: `client-demo-digest-${Date.now()}`,
    subreddit: DEMO_SUBREDDIT_NAME,
    generatedAt,
    generatedBy: 'local-preview',
    source: 'demo',
    periodStart: generatedAt,
    periodEnd: generatedAt,
    overallStatus: 'needs_review',
    summary: digestSummary,
    ruleHealth,
    overrideSummary: {
      total: 3,
      unresolved: summary.unresolvedOverrideCount,
      acceptedExceptions: 0,
      policyNeedsUpdate: 1,
      needsDiscussion: 0,
    },
    recommendations: [
      {
        id: 'demo-review-rule-2',
        severity: 'urgent',
        title: 'Review Low-effort questions',
        detail:
          'Rule 2 still has unresolved stricter-than-policy exceptions.',
        actionLabel: 'Open Review',
        targetRuleKey: DEMO_POLICY.ruleKey,
      },
    ],
    caveats: [
      'Demo data is labeled and separate from live subreddit data.',
      'Recommendations are deterministic and do not use AI.',
    ],
    markdown,
    delivery: {
      mode: 'none',
      status: 'not_configured',
      message: 'Manual copy is the active delivery path.',
    },
  };
}

function createClientDemoPolicy(candidate?: DriftCandidate): RulePolicy {
  const now = new Date().toISOString();
  return {
    ...DEMO_POLICY,
    id: DEMO_POLICY.id,
    ruleKey: candidate?.ruleKey ?? DEMO_POLICY.ruleKey,
    ruleName: candidate?.ruleName ?? DEMO_POLICY.ruleName,
    activeVersionId: 'demo-policy-low-effort-v2',
    activeVersionNumber: 2,
    lifecycleState: 'adopted',
    adoptedBy: 'demo-lead-mod',
    adoptedAt: '2026-05-16T10:30:00.000Z',
    ratificationSettings: {
      requiredApprovals: 1,
      allowSingleModAdoption: true,
    },
    ratificationSummary: {
      requiredApprovals: 1,
      approvals: 1,
      requestsForChanges: 0,
      abstentions: 0,
      latestReviewCount: 1,
      canAdopt: true,
    },
    createdAt: DEMO_POLICY.createdAt,
    updatedAt: now,
  };
}

function buildClientDemoReplay(policy: RulePolicy): PolicyReplayResult {
  const now = new Date().toISOString();
  const replay: PolicyReplayResult = {
    id: `demo-replay-${Date.now()}`,
    subreddit: policy.subreddit,
    policyId: policy.id,
    ruleKey: policy.ruleKey,
    ruleName: policy.ruleName,
    source: 'synthetic',
    generatedAt: now,
    totalActionsEvaluated: 3,
    matchedPolicyCount: 1,
    changedRecommendationCount: 2,
    skippedActionCount: 0,
    items: [
      {
        actionId: 'demo-replay-1',
        targetAuthor: 'learner_a',
        createdAt: now,
        confidence: 'high',
        historicalAction: 'remove',
        recommendedAction: 'warn',
        offenseCount: 1,
        wouldChangeOutcome: true,
        evidence: ['Demo synthetic first offense.'],
      },
      {
        actionId: 'demo-replay-2',
        targetAuthor: 'learner_a',
        createdAt: now,
        confidence: 'high',
        historicalAction: 'remove',
        recommendedAction: 'remove',
        offenseCount: 2,
        wouldChangeOutcome: false,
        evidence: ['Demo synthetic repeat offense.'],
      },
      {
        actionId: 'demo-replay-3',
        targetAuthor: 'learner_b',
        createdAt: now,
        confidence: 'medium',
        historicalAction: 'temporary_ban_suggested',
        recommendedAction: 'warn',
        offenseCount: 1,
        wouldChangeOutcome: true,
        evidence: ['Demo synthetic stricter first offense.'],
      },
    ],
    warnings: [
      'Demo replay uses synthetic actions, not live Reddit history.',
      'Replay is read-only and does not create receipts or Reddit moderation calls.',
    ],
  };
  const versionId = policy.activeVersionId ?? policy.proposedVersionId;
  const versionNumber =
    policy.activeVersionNumber ?? policy.proposedVersionNumber;
  if (versionId !== undefined) {
    replay.policyVersionId = versionId;
  }
  if (versionNumber !== undefined) {
    replay.policyVersionNumber = versionNumber;
  }
  return replay;
}

function createClientDemoHealth(
  overrideEvent?: ApplyPolicyConfirmResult['overrideEvent']
): PolicyHealthOverview {
  const overrideCount = overrideEvent ? 4 : 3;
  return {
    totalPolicies: 1,
    stablePolicies: 0,
    policiesNeedingReview: 1,
    unresolvedOverrides: 1,
    summaries: [
      {
        policyId: DEMO_POLICY.id,
        ruleKey: DEMO_POLICY.ruleKey,
        ruleName: DEMO_POLICY.ruleName,
        status: 'needs_review',
        totalActions: 12,
        followedPolicyCount: 8,
        overrideCount,
        unresolvedOverrideCount: 1,
        policySeemsWrongCount: 1,
        adherenceRate: 8 / 12,
        overrideRate: overrideCount / 12,
        reasons: [
          'Rule 2 first-time cases still have stricter-than-policy outcomes.',
        ],
        recommendations: [
          'Review unresolved Rule 2 overrides and decide whether the ladder should change.',
        ],
        sampleWarning:
          'One temporary-ban suggestion deviates from the first-offense warning policy.',
      },
    ],
  };
}

function createClientDemoAnalytics(): ConsistencyAnalyticsSummary {
  const now = new Date().toISOString();
  return {
    subreddit: DEMO_SUBREDDIT_NAME,
    generatedAt: now,
    scanCount: 2,
    receiptCount: 12,
    dataQuality: 'limited',
    caveats: ['Demo analytics are seeded for preview and are not live proof.'],
    ruleTrends: [
      {
        ruleKey: DEMO_POLICY.ruleKey,
        ruleName: DEMO_POLICY.ruleName,
        status: 'improving',
        latestDistribution: {
          warn: 9,
          remove: 5,
        },
        points: [
          {
            scanId: 'demo-scan-before',
            createdAt: '2026-05-15T00:00:00.000Z',
            source: 'demo',
            depth: 'standard',
            totalActions: 24,
            distinctActions: 3,
            confidence: 'high',
            actionDistribution: {
              warn: 7,
              remove: 10,
              temporary_ban_suggested: 7,
            },
          },
          {
            scanId: 'demo-scan-after',
            createdAt: now,
            source: 'demo',
            depth: 'standard',
            totalActions: 18,
            distinctActions: 2,
            confidence: 'high',
            actionDistribution: {
              warn: 9,
              remove: 5,
            },
          },
        ],
        caveats: ['Demo scans are useful for preview, not live policy proof.'],
      },
    ],
    policyImpacts: [
      {
        policyId: DEMO_POLICY.id,
        ruleKey: DEMO_POLICY.ruleKey,
        ruleName: DEMO_POLICY.ruleName,
        policyVersionId: 'demo-policy-low-effort-v2',
        adoptedAt: '2026-05-16T00:00:00.000Z',
        status: 'new_policy_tracking',
        before: {
          receiptCount: 3,
          adherenceRate: 1 / 3,
          overrideRate: 2 / 3,
          unresolvedOverrideCount: 0,
        },
        after: {
          receiptCount: 9,
          adherenceRate: 7 / 9,
          overrideRate: 2 / 9,
          unresolvedOverrideCount: 1,
        },
        caveats: [
          'Receipts cover ModMirror Apply Policy usage, not every moderator action.',
        ],
      },
    ],
  };
}

function createClientDemoCommunityHealth(): CommunityHealthSummary {
  const now = new Date().toISOString();
  return {
    subreddit: DEMO_SUBREDDIT_NAME,
    generatedAt: now,
    dataQuality: 'small_sample',
    status: 'needs_review',
    scanCount: 2,
    receiptCount: 12,
    actionCount: 12,
    overrideCount: 3,
    unresolvedOverrideCount: 1,
    policyChurnCount: 4,
    driftStability: 'improving',
    casePacketVolume: {
      eligibleReceiptCount: 12,
      persistedPacketCount: 0,
      source: 'not_persisted',
      note: 'Demo case packets are generated on demand.',
    },
    ruleSignals: [
      {
        ruleKey: DEMO_POLICY.ruleKey,
        ruleName: DEMO_POLICY.ruleName,
        actionCount: 12,
        consistentActionCount: 8,
        overrideCount: 3,
        unresolvedOverrideCount: 1,
        repeatAuthorCount: 2,
        consistencyRate: 8 / 12,
        overrideRate: 3 / 12,
        status: 'needs_review',
        notes: ['One unresolved Rule 2 override needs team review.'],
      },
    ],
    privacyGuardrails: [
      'No per-moderator leaderboard fields are emitted.',
      'Repeat-offense signals are aggregated by rule and do not expose usernames.',
      'Demo health is labeled and not live subreddit proof.',
    ],
    caveats: ['Demo community health is seeded for preview and is not live proof.'],
  };
}

function createClientDemoImpacts(): Record<string, PolicyImpactMeasurement> {
  const now = new Date().toISOString();
  return {
    [DEMO_POLICY.id]: {
      policyId: DEMO_POLICY.id,
      ruleKey: DEMO_POLICY.ruleKey,
      ruleName: DEMO_POLICY.ruleName,
      generatedAt: now,
      dataQuality: 'limited',
      status: 'new_policy_tracking',
      adoptedAt: '2026-05-16T10:30:00.000Z',
      policyVersionId: 'demo-policy-low-effort-v2',
      policyVersionNumber: 2,
      before: {
        receiptCount: 3,
        scanCount: 1,
        consistencyRate: 1 / 3,
        overrideRate: 2 / 3,
        driftCandidateCount: 1,
      },
      after: {
        receiptCount: 9,
        scanCount: 1,
        consistencyRate: 7 / 9,
        overrideRate: 2 / 9,
        driftCandidateCount: 1,
      },
      timeline: [
        {
          id: 'demo-policy-low-effort-v2',
          occurredAt: '2026-05-16T10:30:00.000Z',
          label: 'Policy adopted',
          detail: 'Demo policy version 2 became the comparison point.',
          source: 'policy_version',
        },
      ],
      caveats: ['Demo impact is seeded for preview and is not live subreddit proof.'],
      source: 'demo',
    },
  };
}

function createClientDemoOverrides(
  latestOverride?: ApplyPolicyConfirmResult['overrideEvent']
): ReviewableOverrideEvent[] {
  const now = new Date().toISOString();
  const overrides: ReviewableOverrideEvent[] = [
    {
      id: 'demo-override-r2-appeal',
      subreddit: DEMO_SUBREDDIT_NAME,
      targetThingId: 't3_demo_case_r2_appeal',
      targetAuthor: 'learner_1',
      ruleKey: DEMO_POLICY.ruleKey,
      ruleName: DEMO_POLICY.ruleName,
      policyId: DEMO_POLICY.id,
      policyVersionId: 'demo-policy-low-effort-v2',
      policyVersionNumber: 2,
      recommendedAction: 'warn',
      selectedAction: 'temporary_ban_suggested',
      overrideReason: 'severe_context',
      overrideNote:
        'Moderator saw repeat low-effort pattern that was not captured by the first-offense window.',
      reviewStatus: 'unresolved',
      createdAt: now,
    },
  ];

  if (latestOverride) {
    const reviewable: ReviewableOverrideEvent = {
      id: latestOverride.id,
      subreddit: latestOverride.subreddit,
      ruleKey: latestOverride.ruleKey,
      recommendedAction: latestOverride.recommendedAction,
      selectedAction: latestOverride.selectedAction,
      overrideReason: latestOverride.overrideReason,
      reviewStatus: latestOverride.reviewStatus,
      createdAt: latestOverride.createdAt,
    };
    if (latestOverride.targetThingId) {
      reviewable.targetThingId = latestOverride.targetThingId;
    }
    if (latestOverride.targetAuthor) {
      reviewable.targetAuthor = latestOverride.targetAuthor;
    }
    if (latestOverride.ruleName) {
      reviewable.ruleName = latestOverride.ruleName;
    }
    if (latestOverride.policyId) {
      reviewable.policyId = latestOverride.policyId;
    }
    if (latestOverride.policyVersionId) {
      reviewable.policyVersionId = latestOverride.policyVersionId;
    }
    if (latestOverride.policyVersionNumber) {
      reviewable.policyVersionNumber = latestOverride.policyVersionNumber;
    }
    if (latestOverride.overrideNote) {
      reviewable.overrideNote = latestOverride.overrideNote;
    }
    overrides.unshift(reviewable);
  }

  return overrides;
}

function createClientDemoVersions(): Record<string, PolicyVersionSummary[]> {
  return {
    [DEMO_POLICY.id]: [
      {
        id: 'demo-policy-low-effort-v1',
        policyId: DEMO_POLICY.id,
        versionNumber: 1,
        ruleName: DEMO_POLICY.ruleName,
        createdAt: '2026-05-15T18:30:00.000Z',
        createdBy: 'demo-lead-mod',
        changeSummary: 'Initial Rule 2 ladder drafted from Mirror Scan drift.',
      },
      {
        id: 'demo-policy-low-effort-v2',
        policyId: DEMO_POLICY.id,
        versionNumber: 2,
        ruleName: DEMO_POLICY.ruleName,
        createdAt: '2026-05-16T10:30:00.000Z',
        createdBy: 'demo-lead-mod',
        changeSummary: 'Kept first offense at warning and required override reasons.',
      },
    ],
  };
}

function createClientDemoApplyPreview(
  payload: ReturnType<typeof applyFormDataToPayload>
): ApplyPolicyPreview {
  const policy =
    policyState.policies.find((item) => item.ruleKey === payload.ruleKey) ??
    createClientDemoPolicy();
  const recommendedAction = policy.steps[0]?.recommendedAction ?? 'warn';
  const deviatesFromPolicy = payload.selectedAction !== recommendedAction;

  const contentSnapshot = {
    schemaVersion: 1 as const,
    targetThingId: payload.targetThingId,
    targetType: payload.targetThingId.startsWith('t1_')
      ? ('comment' as const)
      : ('post' as const),
    subreddit: DEMO_SUBREDDIT_NAME,
    authorName: payload.targetAuthor,
    titleExcerpt: payload.targetTitle || 'Demo policy target',
    bodyExcerpt: payload.targetBody || 'Seeded client fallback content.',
    fetchedAt: new Date().toISOString(),
    fetchStatus: 'captured' as const,
    source: 'demo' as const,
    warnings: ['Demo fallback preview uses seeded client data only.'],
    privacy: {
      retentionCategory: 'moderation_evidence' as const,
      authorStored: Boolean(payload.targetAuthor),
      titleExcerptStored: true,
      bodyExcerptStored: true,
      permalinkStored: Boolean(payload.targetPermalink),
      redactionNotes: ['Demo fallback stores excerpts only.'],
    },
  };
  const targetSnapshot: ApplyPolicyPreview['targetSnapshot'] = {
    targetThingId: payload.targetThingId,
    targetType: payload.targetThingId.startsWith('t1_') ? 'comment' : 'post',
    subreddit: DEMO_SUBREDDIT_NAME,
    authorName: payload.targetAuthor,
    title: contentSnapshot.titleExcerpt,
    body: contentSnapshot.bodyExcerpt,
    ...(payload.targetPermalink ? { permalink: payload.targetPermalink } : {}),
    source: 'provided',
    warnings: ['Demo fallback preview uses seeded client data only.'],
    contentSnapshot,
  };
  const recommendation: ApplyPolicyPreview['recommendation'] = {
    ruleKey: policy.ruleKey,
    ruleName: policy.ruleName,
    policyId: policy.id,
    offenseCount: 1,
    recommendedAction,
    messageDeliveryMode: policy.defaultMessageMode,
    requiresOverrideReason: true,
    selectedAction: payload.selectedAction,
    deviatesFromPolicy,
    fallbackReason: 'policy_found',
    message: deviatesFromPolicy
      ? `Team policy recommends ${formatAction(recommendedAction)} for this first Rule 2 offense. Continue only with an override reason.`
      : `Team policy recommends ${formatAction(recommendedAction)} for this first Rule 2 offense.`,
  };
  const preview: ApplyPolicyPreview = {
    policy,
    policySnapshot: {
      policyId: policy.id,
      policyVersionId: policy.activeVersionId ?? `${policy.id}-v1`,
      policyVersionNumber: policy.activeVersionNumber ?? 1,
      policyVersionStatus: 'active',
      ruleKey: policy.ruleKey,
      ruleName: policy.ruleName,
      steps: policy.steps,
      defaultMessageMode: policy.defaultMessageMode,
      capturedAt: new Date().toISOString(),
    },
    targetSnapshot,
    contentSnapshot,
    evidence: [
      {
        kind: 'policy',
        label: 'Policy version',
        detail: `Using ${policy.ruleName} version ${policy.activeVersionNumber ?? 1}.`,
      },
      {
        kind: 'target',
        label: 'Target context',
        detail: `${payload.targetThingId} by ${payload.targetAuthor}`,
      },
      {
        kind: 'history',
        label: 'Offense count',
        detail: 'Offense 1 from demo seed data.',
      },
      {
        kind: 'safety',
        label: 'Execution mode',
        detail:
          'Confirming this demo preview records a log-only ModMirror action.',
      },
    ],
    confirmation: {
      executionMode: 'log_only',
      willExecuteRedditAction: false,
      actionLabel: payload.selectedAction,
      requiresOverrideReason: deviatesFromPolicy,
      message:
        'Demo fallback confirmation records a log-only ModMirror action. No Reddit moderation action is attempted.',
      caveats: ['Demo fallback uses client seed data, not live Reddit state.'],
    },
    recommendation,
  };
  const responsePreview = buildApplyPolicyResponsePreview({
    policy,
    recommendation,
    targetSnapshot,
  });
  if (responsePreview !== undefined) {
    preview.responsePreview = responsePreview;
  }

  return preview;
}

function createClientDemoApplyResult(
  payload: ReturnType<typeof applyFormDataToPayload>
): ApplyPolicyConfirmResult {
  const preview = createClientDemoApplyPreview(payload);
  const policy = preview.policy ?? createClientDemoPolicy();
  const now = new Date().toISOString();
  const execution = {
    executionMode: 'log_only' as const,
    executionAttempted: false,
    executionResult: 'skipped' as const,
    redditOperation: 'none' as const,
    selectedAction: payload.selectedAction,
    targetThingId: payload.targetThingId,
    targetType: preview.targetSnapshot.targetType,
    capabilityState: 'not_applicable' as const,
    startedAt: now,
    completedAt: now,
  };
  const actionEvent = {
    id: `demo-action-${Date.now()}`,
    subreddit: DEMO_SUBREDDIT_NAME,
    modUsername: 'demo_mod_2',
    targetThingId: payload.targetThingId,
    targetAuthor: payload.targetAuthor,
    ruleKey: policy.ruleKey,
    ruleName: policy.ruleName,
    policyId: policy.id,
    policyVersionId: 'demo-policy-low-effort-v2',
    policyVersionNumber: 2,
    policyVersionStatus: 'active' as const,
    recommendedAction: preview.recommendation.recommendedAction,
    selectedAction: payload.selectedAction,
    deliveryMode: 'log_only' as const,
    source: 'simulator' as const,
    execution,
    createdAt: now,
  };

  const result: ApplyPolicyConfirmResult = {
    recommendation: preview.recommendation,
    actionEvent,
    execution,
    receipt: {
      id: `demo-receipt-${Date.now()}`,
      actionEventId: actionEvent.id,
      subreddit: DEMO_SUBREDDIT_NAME,
      targetThingId: payload.targetThingId,
      targetType: preview.targetSnapshot.targetType,
      targetSnapshot: preview.targetSnapshot,
      modUsername: 'demo_mod_2',
      source: 'simulator',
      recommendation: preview.recommendation,
      selectedAction: payload.selectedAction,
      deviatesFromPolicy: preview.recommendation.deviatesFromPolicy,
      executionMode: execution.executionMode,
      executionAttempted: execution.executionAttempted,
      executionResult: execution.executionResult,
      redditOperation: execution.redditOperation,
      capabilityState: execution.capabilityState,
      createdAt: now,
    },
  };
  if (preview.contentSnapshot !== undefined) {
    result.receipt.contentSnapshot = preview.contentSnapshot;
  }
  if (preview.policySnapshot !== undefined) {
    result.receipt.policySnapshot = preview.policySnapshot;
  }
  if (preview.responsePreview !== undefined) {
    result.receipt.responsePreview = preview.responsePreview;
    result.receipt.nativeModNote = {
      mode: payload.modNoteMode,
      status: 'skipped',
      deliveryAttempted: false,
      capabilityState:
        payload.modNoteMode === 'native' ? 'unverified_disabled' : 'disabled',
      subreddit: DEMO_SUBREDDIT_NAME,
      targetAuthor: payload.targetAuthor,
      targetThingId: payload.targetThingId,
      noteBody:
        preview.responsePreview.templates.find(
          (template) => template.kind === 'mod_note_summary'
        )?.body ?? 'Demo Mod Note draft stored on the receipt only.',
      errorCode:
        payload.modNoteMode === 'native'
          ? 'unverified_disabled'
          : 'log_only_mode',
      errorMessage:
        payload.modNoteMode === 'native'
          ? 'Native Mod Notes are disabled in demo fallback.'
          : 'Generated Mod Note was stored on the ModMirror receipt only.',
      startedAt: now,
      completedAt: now,
    };
  }

  if (preview.recommendation.deviatesFromPolicy) {
    result.overrideEvent = {
      id: `demo-override-${Date.now()}`,
      subreddit: DEMO_SUBREDDIT_NAME,
      modUsername: 'demo_mod_2',
      targetThingId: payload.targetThingId,
      targetAuthor: payload.targetAuthor,
      ruleKey: policy.ruleKey,
      ruleName: policy.ruleName,
      policyId: policy.id,
      policyVersionId: 'demo-policy-low-effort-v2',
      policyVersionNumber: 2,
      policyVersionStatus: 'active',
      recommendedAction: preview.recommendation.recommendedAction,
      selectedAction: payload.selectedAction,
      overrideReason: payload.overrideReason ?? 'severe_context',
      overrideNote:
        payload.overrideNote || 'Demo override recorded for review workflow.',
      reviewStatus: 'unresolved',
      updatedAt: now,
      createdAt: now,
    };
    result.receipt.overrideEventId = result.overrideEvent.id;
    result.receipt.overrideReason = result.overrideEvent.overrideReason;
    if (result.overrideEvent.overrideNote !== undefined) {
      result.receipt.overrideNote = result.overrideEvent.overrideNote;
    }
  }

  return result;
}

function createClientDemoCasePacket(): CasePacket {
  const generatedAt = new Date().toISOString();
  const markdown = [
    '# ModMirror Case Packet',
    '',
    `Generated: ${generatedAt}`,
    `Subreddit: r/${DEMO_SUBREDDIT_NAME}`,
    'Rule: Low-effort questions',
    'Recommended action: warn',
    'Selected action: temporary ban suggested',
    'Posture: review recommended',
    '',
    '## Caveats',
    '- This packet uses demo seed data, not real subreddit history.',
    '- Comparable cases are deterministic matches, not automated appeal judgment.',
  ].join('\n');

  return {
    id: 'client-demo-case-packet',
    generatedAt,
    generatedBy: 'local-preview',
    subreddit: DEMO_SUBREDDIT_NAME,
    packetType: 'appeal_context',
    subject: {
      type: 'demo',
      receiptId: 'demo-receipt-r2-appeal',
      targetThingId: 't3_demo_case_r2_appeal',
      ruleKey: DEMO_POLICY.ruleKey,
    },
    action: {
      actionId: 'demo-case-r2-appeal',
      receiptId: 'demo-receipt-r2-appeal',
      createdAt: '2026-05-16T19:15:00.000Z',
      moderator: 'demo_mod_2',
      targetThingId: 't3_demo_case_r2_appeal',
      targetAuthor: 'learner_1',
      ruleKey: DEMO_POLICY.ruleKey,
      ruleName: DEMO_POLICY.ruleName,
      recommendedAction: 'warn',
      selectedAction: 'temporary_ban_suggested',
      deliveryMode: 'log_only',
      source: 'demo',
      evidenceSource: 'demo_seed',
    },
    policyContext: {
      policyId: DEMO_POLICY.id,
      policyVersionId: 'demo-policy-low-effort-v2',
      policyVersionNumber: 2,
      policyVersionStatus: 'active',
      policyName: DEMO_POLICY.ruleName,
      ruleKey: DEMO_POLICY.ruleKey,
      ruleName: DEMO_POLICY.ruleName,
      activeAtActionTime: true,
      changedSinceAction: false,
    },
    consistencyStatus: 'stricter_than_policy',
    overrideContext: {
      overrideId: 'demo-override-r2-appeal',
      reason: 'severe_context',
      note: 'Moderator cited repeat pattern outside the tracked first-offense window.',
      reviewStatus: 'unresolved',
    },
    userHistory: [
      {
        actionId: 'demo-case-r2-prior-learner-1',
        createdAt: '2026-05-10T16:00:00.000Z',
        ruleKey: DEMO_POLICY.ruleKey,
        ruleName: DEMO_POLICY.ruleName,
        selectedAction: 'warn',
        recommendedAction: 'warn',
        consistencyStatus: 'matched_policy',
        policyVersionNumber: 2,
      },
    ],
    comparableCases: [
      {
        actionId: 'demo-case-r2-comparable-followed',
        createdAt: '2026-05-14T11:30:00.000Z',
        ruleKey: DEMO_POLICY.ruleKey,
        ruleName: DEMO_POLICY.ruleName,
        selectedAction: 'warn',
        recommendedAction: 'warn',
        offenseBucket: 'first_offense',
        selectedActionFamily: 'warn',
        recommendedActionFamily: 'warn',
        targetType: 'post',
        matchReasons: ['same rule', 'first offense', 'same policy version'],
        anonymizedTargetAuthor: 'learner_*',
        evidenceSource: 'demo_seed',
      },
      {
        actionId: 'demo-case-r2-comparable-strict',
        createdAt: '2026-05-15T09:15:00.000Z',
        ruleKey: DEMO_POLICY.ruleKey,
        ruleName: DEMO_POLICY.ruleName,
        selectedAction: 'remove',
        recommendedAction: 'warn',
        offenseBucket: 'first_offense',
        selectedActionFamily: 'remove',
        recommendedActionFamily: 'warn',
        targetType: 'post',
        matchReasons: ['same rule', 'first offense', 'stricter outcome'],
        anonymizedTargetAuthor: 'learner_*',
        evidenceSource: 'demo_seed',
      },
    ],
    evidence: [
      {
        label: 'Action receipt',
        source: 'demo_seed',
        detail: 'Demo receipt records a log-only moderation decision.',
      },
      {
        label: 'Comparable cases',
        source: 'demo_seed',
        detail: 'Demo comparables show followed and stricter Rule 2 outcomes.',
      },
    ],
    appealPosture: 'review_recommended',
    caveats: [
      'This packet uses demo seed data, not real subreddit history.',
      'Comparable cases are deterministic matches, not automated appeal judgment.',
      'Historical attribution remains confidence-scored and may be incomplete.',
    ],
    markdown,
  };
}

async function loadHealth() {
  try {
    const response = await fetch(API_ROUTES.health);
    if (!response.ok) {
      throw new Error(`Health endpoint returned ${response.status}`);
    }
    health = (await response.json()) as HealthResponse;
    healthError = undefined;
  } catch (error) {
    healthError =
      normalizeClientError(error, 'Health status is unavailable in this preview.');
  }

  render();
}

async function loadLaunchContext() {
  const hashParams = getApplyTargetParamsFromHash();
  if (hashParams.targetThingId !== undefined) {
    applyState = {
      ...applyState,
      form: {
        ...applyState.form,
        ...hashParams,
      },
    };
    render();
    return;
  }

  try {
    const payload = await fetchApi<LaunchContextResponse>(API_ROUTES.launchContext);
    const target = payload.target;
    if (target === undefined) {
      return;
    }

    applyState = {
      ...applyState,
      form: {
        ...applyState.form,
        targetThingId: target.targetThingId,
        targetAuthor: target.authorName ?? applyState.form.targetAuthor,
        targetTitle: target.title ?? '',
        targetBody: target.body ?? '',
        targetPermalink: target.permalink ?? '',
        subreddit: target.subreddit ?? applyState.form.subreddit,
      },
    };
    render();
  } catch (error) {
    applyState = {
      ...applyState,
      error: normalizeClientError(
        error,
        'Target context could not be loaded from this launch post.'
      ),
    };
    render();
  }
}

async function loadRuntimeCapabilities() {
  runtimeCapabilityState = {
    ...runtimeCapabilityState,
    loading: true,
    error: undefined,
  };
  render();

  try {
    const matrix = await fetchApi<RuntimeCapabilityMatrix>(
      withWorkspaceSubreddit(API_ROUTES.runtimeCapabilities)
    );
    runtimeCapabilityState = {
      loading: false,
      smokeRunning: runtimeCapabilityState.smokeRunning,
      eventRecording: runtimeCapabilityState.eventRecording,
      error: undefined,
      message: runtimeCapabilityState.message,
      matrix,
    };
  } catch (error) {
    runtimeCapabilityState = {
      ...runtimeCapabilityState,
      loading: false,
      error: normalizeClientError(
        error,
        'Runtime capability matrix is unavailable.'
      ),
    };
  }

  render();
}

async function runRuntimeSmokeCheck(check: RuntimeSmokeCheck) {
  runtimeCapabilityState = {
    ...runtimeCapabilityState,
    smokeRunning: check,
    error: undefined,
    message: undefined,
  };
  render();

  try {
    const result =
      check === 'access'
        ? await fetchApi<ModeratorAccessDiagnostic>(
            withWorkspaceSubreddit(API_ROUTES.accessDiagnostics)
          )
        : await fetchRawJson<unknown>(
            withWorkspaceSubreddit(
              check === 'redis'
                ? API_ROUTES.redisSmoke
                : check === 'redis-zset'
                  ? API_ROUTES.redisSortedSetSmoke
                  : check === 'redis-storage'
                    ? API_ROUTES.redisStorageSmoke
                    : check === 'retention-cleanup'
                      ? API_ROUTES.retentionCleanupSmoke
                      : API_ROUTES.redditSmoke
            ),
            {
              method: 'POST',
            }
          );
    const matrix = await fetchApi<RuntimeCapabilityMatrix>(
      withWorkspaceSubreddit(API_ROUTES.runtimeCapabilities)
    );
    runtimeCapabilityState = {
      loading: false,
      smokeRunning: undefined,
      eventRecording: false,
      error: undefined,
      message: summarizeRuntimeSmokeResult(check, result),
      matrix,
    };
  } catch (error) {
    runtimeCapabilityState = {
      ...runtimeCapabilityState,
      loading: false,
      smokeRunning: undefined,
      error: normalizeClientError(error, `${formatRuntimeSmokeCheck(check)} smoke check failed.`),
      message: undefined,
    };
  }

  render();
}

async function recordManualRuntimeEvent(formData: FormData) {
  const input = buildManualRuntimeEventInput(formData);
  if (input === undefined) {
    render();
    return;
  }

  runtimeCapabilityState = {
    ...runtimeCapabilityState,
    eventRecording: true,
    error: undefined,
    message: undefined,
  };
  render();

  try {
    const event = await fetchApi<RuntimeCapabilityHealthEvent>(
      API_ROUTES.runtimeCapabilityEvents,
      {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify(input),
      }
    );
    const matrix = await fetchApi<RuntimeCapabilityMatrix>(
      `${API_ROUTES.runtimeCapabilities}?subreddit=${encodeURIComponent(input.subreddit)}`
    );
    const entry = matrix.entries.find(
      (candidate) => candidate.id === event.capabilityId
    );
    runtimeCapabilityState = {
      loading: false,
      smokeRunning: undefined,
      eventRecording: false,
      error: undefined,
      message: `Recorded ${event.status} event for ${entry?.label ?? event.capabilityId}.`,
      matrix,
    };
  } catch (error) {
    runtimeCapabilityState = {
      ...runtimeCapabilityState,
      loading: false,
      eventRecording: false,
      error: normalizeClientError(
        error,
        'Runtime capability event could not be recorded.'
      ),
      message: undefined,
    };
  }

  render();
}

function buildManualRuntimeEventInput(
  formData: FormData
): RuntimeCapabilityHealthEventInput | undefined {
  const capabilityId = String(formData.get('capabilityId') ?? '').trim();
  const status = normalizeRuntimeHealthStatus(formData.get('status'));
  const source = normalizeRuntimeHealthSource(formData.get('source'));
  const message = String(formData.get('message') ?? '').trim();
  const errorMessage = String(formData.get('errorMessage') ?? '').trim();
  const subreddit =
    runtimeCapabilityState.matrix?.subreddit ??
    getWorkspaceSubreddit() ??
    DEMO_SUBREDDIT_NAME;

  if (!capabilityId || status === undefined || source === undefined || !message) {
    runtimeCapabilityState = {
      ...runtimeCapabilityState,
      error: 'Choose a capability, status, source, and evidence note before recording an event.',
      message: undefined,
    };
    return undefined;
  }

  return {
    subreddit,
    capabilityId,
    status,
    source,
    message,
    ...(errorMessage ? { errorMessage } : {}),
  };
}

function normalizeRuntimeHealthStatus(
  value: FormDataEntryValue | null
): RuntimeCapabilityHealthEventInput['status'] | undefined {
  return value === 'passed' || value === 'failed' || value === 'skipped'
    ? value
    : undefined;
}

function normalizeRuntimeHealthSource(
  value: FormDataEntryValue | null
): RuntimeCapabilityHealthEventInput['source'] | undefined {
  return value === 'playtest' || value === 'manual_qa' ? value : undefined;
}

async function fetchRawJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetchWithTimeout(url, init);
  const payload = (await response.json().catch(() => undefined)) as
    | ApiResponse<unknown>
    | T
    | undefined;

  if (!response.ok) {
    if (isApiFailure(payload)) {
      throw new Error(payload.error.message);
    }
    throw new Error(`API request returned ${response.status} for ${url}.`);
  }

  if (payload === undefined) {
    throw new Error(`API response was not JSON for ${url}.`);
  }

  return payload as T;
}

function isApiFailure(payload: unknown): payload is Extract<ApiResponse<never>, { ok: false }> {
  return (
    typeof payload === 'object' &&
    payload !== null &&
    'ok' in payload &&
    (payload as { ok: unknown }).ok === false &&
    'error' in payload
  );
}

function summarizeRuntimeSmokeResult(check: RuntimeSmokeCheck, result: unknown) {
  if (check === 'redis') {
    const redisResult = result as Partial<RedisSmokeResult>;
    return redisResult.ok
      ? 'Redis smoke passed: write/read matched inside Devvit playtest.'
      : 'Redis smoke completed but did not report a matched readBack value.';
  }

  if (check === 'redis-zset') {
    const redisResult = result as Partial<RedisSortedSetSmokeResult>;
    const expected = redisResult.expectedOrder?.join(', ') ?? 'unknown';
    const observed = redisResult.observedOrder?.join(', ') ?? 'unknown';
    const rowCount = redisResult.observedOrder?.length ?? 0;
    return redisResult.ok
      ? `Redis sorted-set smoke passed: observed ${observed}.`
      : `Redis sorted-set smoke order mismatch: expected ${expected}, observed ${observed}. Added ${redisResult.addCount ?? 'unknown'}, cardinality ${redisResult.cardinality ?? 'unknown'}, rows ${rowCount}.`;
  }

  if (check === 'redis-storage') {
    const redisResult = result as Partial<RedisStorageSmokeResult>;
    const expected = redisResult.expected;
    const observed = redisResult.observed;
    const scan = `${observed?.scanIndexCardinality ?? 'unknown'}/${expected?.scanMetadataCount ?? 'unknown'}`;
    const actions = `${observed?.actionIndexCardinality ?? 'unknown'}/${expected?.actionEventCount ?? 'unknown'}`;
    const overrides = `${observed?.overrideIndexCardinality ?? 'unknown'}/${expected?.overrideEventCount ?? 'unknown'}`;
    const cleanup = observed?.postCleanupExistingKeys ?? 'unknown';
    return redisResult.ok
      ? `Redis storage smoke passed: scan ${scan}, actions ${actions}, overrides ${overrides}, cleanup ${cleanup}.`
      : `Redis storage smoke mismatch: scan ${scan}, actions ${actions}, overrides ${overrides}, cleanup ${cleanup}.`;
  }

  if (check === 'retention-cleanup') {
    const cleanupResult = result as Partial<RetentionCleanupSmokeResult>;
    const expected = cleanupResult.expected;
    const observed = cleanupResult.observed;
    const scans = `${observed?.scanHistoryDeleted ?? 'unknown'}/${expected?.scanHistoryDeleted ?? 'unknown'}`;
    const receipts = `${observed?.actionReceiptsDeleted ?? 'unknown'}/${expected?.actionReceiptsDeleted ?? 'unknown'}`;
    const boards = `${observed?.evidenceBoardsDeleted ?? 'unknown'}/${expected?.evidenceBoardsDeleted ?? 'unknown'}`;
    const delivery = `${observed?.teamDeliveryReceiptsDeleted ?? 'unknown'}/${expected?.teamDeliveryReceiptsDeleted ?? 'unknown'}`;
    const detailKeys = observed?.detailKeysRemaining ?? 'unknown';
    const indexRefs = observed?.indexReferencesRemaining ?? 'unknown';
    return cleanupResult.ok
      ? `Retention cleanup smoke passed: scans ${scans}, receipts ${receipts}, boards ${boards}, delivery ${delivery}, detail keys ${detailKeys}, index refs ${indexRefs}.`
      : `Retention cleanup smoke mismatch: scans ${scans}, receipts ${receipts}, boards ${boards}, delivery ${delivery}, detail keys ${detailKeys}, index refs ${indexRefs}.`;
  }

  if (check === 'access') {
    const access = result as Partial<ModeratorAccessDiagnostic>;
    const permissions = access.permissions?.length
      ? access.permissions.join(', ')
      : 'none returned';
    const visibility =
      access.moderatorVisibilityLevel === 'full_moderator'
        ? 'full moderator visibility'
        : 'aggregate-only visibility';
    return `Access check passed: ${access.permissionCount ?? 0} permission(s): ${permissions}. Per-mod gate: ${visibility}.`;
  }

  const resultRecord = result as {
    rules?: unknown[];
    removalReasons?: unknown[];
    modActions?: unknown[];
  };
  return `Reddit read smoke passed: ${resultRecord.rules?.length ?? 0} rule(s), ${resultRecord.removalReasons?.length ?? 0} removal reason(s), ${resultRecord.modActions?.length ?? 0} mod log action(s).`;
}

async function loadPolicies() {
  policyState = { ...policyState, loading: true, error: undefined };
  render();

  try {
    const policies = await fetchApi<RulePolicy[]>(
      withWorkspaceSubreddit(API_ROUTES.policies)
    );
    policyState = {
      ...policyState,
      loading: false,
      policies,
    };
  } catch (error) {
    policyState = {
      ...policyState,
      loading: false,
      error: normalizeClientError(error, 'Policies are unavailable in this preview.'),
    };
  }

  render();
}

async function loadGovernance(ruleKey?: string) {
  governanceState = {
    ...governanceState,
    loading: true,
    error: undefined,
    message: undefined,
  };
  render();

  try {
    const [healthOverview, policies, overrides, analytics, communityHealth] =
      await Promise.all([
      fetchApi<PolicyHealthOverview>(
        withWorkspaceSubreddit(API_ROUTES.policyHealth)
      ),
      fetchApi<RulePolicy[]>(withWorkspaceSubreddit(API_ROUTES.policies)),
      fetchApi<ReviewableOverrideEvent[]>(
        ruleKey
          ? withWorkspaceSubreddit(
              `${API_ROUTES.overrides}?status=unresolved&ruleKey=${encodeURIComponent(ruleKey)}`
            )
          : withWorkspaceSubreddit(`${API_ROUTES.overrides}?status=unresolved`)
      ),
      fetchApi<ConsistencyAnalyticsSummary>(
        withWorkspaceSubreddit(API_ROUTES.consistencyAnalytics)
      ),
      fetchApi<CommunityHealthSummary>(
        withWorkspaceSubreddit(API_ROUTES.communityHealth)
      ),
    ]);
    const versionsByPolicy = await loadPolicyVersions(policies);
    const impactsByPolicy = await loadPolicyImpacts(policies);
    policyState = {
      ...policyState,
      policies,
    };
    governanceState = {
      ...governanceState,
      loading: false,
      health: healthOverview,
      analytics,
      communityHealth,
      overrides,
      versionsByPolicy,
      impactsByPolicy,
    };
  } catch (error) {
    if (canUseClientDemoFallback()) {
      const demoOverrides = createClientDemoOverrides();
      governanceState = {
        ...governanceState,
        loading: false,
        health: createClientDemoHealth(),
        analytics: createClientDemoAnalytics(),
        communityHealth: createClientDemoCommunityHealth(),
        overrides: ruleKey
          ? demoOverrides.filter((event) => event.ruleKey === ruleKey)
          : demoOverrides,
        versionsByPolicy: createClientDemoVersions(),
        impactsByPolicy: createClientDemoImpacts(),
        error: undefined,
      };
      render();
      return;
    }

    governanceState = {
      ...governanceState,
      loading: false,
      error: normalizeClientError(
        error,
        'Review data is unavailable in this preview.'
      ),
    };
  }

  render();
}

async function loadModqueueTriage() {
  modqueueState = {
    ...modqueueState,
    loading: true,
    error: undefined,
  };
  render();

  try {
    modqueueState = {
      loading: false,
      error: undefined,
      response: await fetchApi<ModqueueTriageResponse>(
        withWorkspaceSubreddit(`${API_ROUTES.modqueueTriage}?limit=10&type=all`)
      ),
    };
  } catch (error) {
    modqueueState = {
      ...modqueueState,
      loading: false,
      error: normalizeClientError(
        error,
        'Modqueue triage is unavailable in this preview.'
      ),
    };
  }

  render();
}

async function loadReceipts() {
  receiptLedgerState = {
    ...receiptLedgerState,
    loading: true,
  };
  render();

  try {
    receiptLedgerState = {
      loading: false,
      receipts: await fetchApi<ActionReceipt[]>(
        withWorkspaceSubreddit(API_ROUTES.receipts)
      ),
    };
  } catch (error) {
    if (canUseClientDemoFallback() || isStandaloneStaticPreview()) {
      receiptLedgerState = {
        loading: false,
        receipts: receiptLedgerState.receipts,
      };
      render();
      return;
    }

    receiptLedgerState = {
      loading: false,
      receipts: receiptLedgerState.receipts,
      error: normalizeClientError(error, 'Receipt ledger is unavailable.'),
    };
  }

  render();
}

async function loadDigestHistory() {
  try {
    const data = await fetchApi<DigestHistoryResponse>(
      withWorkspaceSubreddit(API_ROUTES.digestHistory)
    );
    digestState = {
      ...digestState,
      history: data.history,
      capabilities: data.capabilities,
      settings: data.settings,
    };
    render();
  } catch {
    digestState = {
      ...digestState,
      capabilities: createClientDigestCapabilities(),
      settings: createClientDigestSettings(),
    };
  }
}

async function loadAiAdvisoryCapabilities() {
  try {
    aiAdvisoryState = {
      capabilities: await fetchApi<AiAdvisoryCapabilities>(
        API_ROUTES.aiAdvisoryCapabilities
      ),
    };
  } catch (error) {
    aiAdvisoryState = {
      error: normalizeClientError(
        error,
        'AI advisory capability status is unavailable.'
      ),
    };
  }
  render();
}

async function loadTeamDeliveryCapabilities() {
  try {
    teamDeliveryState = {
      capabilities: await fetchApi<TeamDeliveryCapabilities>(
        API_ROUTES.teamDeliveryCapabilities
      ),
    };
  } catch (error) {
    teamDeliveryState = {
      error: normalizeClientError(
        error,
        'Team delivery capability status is unavailable.'
      ),
    };
  }
  render();
}

async function loadEvidenceBoards() {
  evidenceBoardState = {
    ...evidenceBoardState,
    loading: true,
    error: undefined,
  };
  render();

  try {
    const response = await fetchApi<EvidenceBoardListResponse>(
      withWorkspaceSubreddit(API_ROUTES.evidenceBoards)
    );
    evidenceBoardState = {
      ...evidenceBoardState,
      loading: false,
      boards: response.boards,
      error: undefined,
    };
  } catch (error) {
    evidenceBoardState = {
      ...evidenceBoardState,
      loading: false,
      error: normalizeClientError(
        error,
        'Evidence boards are unavailable in this preview.'
      ),
    };
  }

  render();
}

async function loadV2ProductSurfaces() {
  v2ProductState = {
    ...v2ProductState,
    loading: true,
    error: undefined,
  };
  render();

  const [
    commandCenter,
    policyWorkbench,
    calibration,
    reviewRoom,
    demoManifest,
    driftRadar,
    evidenceGraph,
    onboarding,
  ] = await Promise.allSettled([
    fetchApi<CommandCenterV2Response>(withWorkspaceSubreddit(API_ROUTES.commandCenter)),
    fetchApi<PolicyWorkbenchResponse>(withWorkspaceSubreddit(API_ROUTES.policyWorkbench)),
    fetchApi<CalibrationPackResponse>(withWorkspaceSubreddit(API_ROUTES.calibrationPack)),
    fetchApi<ReviewRoomResponse>(withWorkspaceSubreddit(API_ROUTES.reviewRoom)),
    fetchApi<DemoOrchestrationManifest>(API_ROUTES.demoManifest),
    loadV2DriftRadar(),
    loadV2EvidenceGraph(),
    fetchApi<OnboardingPath[]>(withWorkspaceSubreddit(API_ROUTES.onboarding)),
  ]);

  const failures = [
    commandCenter,
    policyWorkbench,
    calibration,
    reviewRoom,
    demoManifest,
    driftRadar,
    evidenceGraph,
    onboarding,
  ].filter((result): result is PromiseRejectedResult => result.status === 'rejected');
  const firstFailure = failures[0];

  v2ProductState = {
    ...v2ProductState,
    loading: false,
    error:
      firstFailure !== undefined
        ? normalizeClientError(firstFailure.reason, 'Some V2 surfaces are unavailable.')
        : undefined,
    commandCenter: settledValue(commandCenter) ?? v2ProductState.commandCenter,
    policyWorkbench: settledValue(policyWorkbench) ?? v2ProductState.policyWorkbench,
    calibration: settledValue(calibration) ?? v2ProductState.calibration,
    reviewRoom: settledValue(reviewRoom) ?? v2ProductState.reviewRoom,
    demoManifest: settledValue(demoManifest) ?? v2ProductState.demoManifest,
    driftRadar: settledValue(driftRadar) ?? v2ProductState.driftRadar,
    evidenceGraph: settledValue(evidenceGraph) ?? v2ProductState.evidenceGraph,
    onboarding: settledValue(onboarding) ?? v2ProductState.onboarding,
  };
  render();
}

async function loadV2DriftRadar(): Promise<DriftRadarResponse | undefined> {
  const scan = scanState.result;
  if (scan === undefined) {
    return undefined;
  }
  return fetchApi<DriftRadarResponse>(
    withWorkspaceSubreddit(
      API_ROUTES.driftRadar.replace(':id', encodeURIComponent(scan.id))
    )
  );
}

async function loadV2EvidenceGraph(): Promise<EvidenceGraphResponse | undefined> {
  const receiptId = applyState.result?.receipt.id ?? receiptLedgerState.receipts[0]?.id;
  if (receiptId !== undefined) {
    return fetchApi<EvidenceGraphResponse>(
      withWorkspaceSubreddit(
        `${API_ROUTES.evidenceGraph}?receiptId=${encodeURIComponent(receiptId)}`
      )
    );
  }

  const boardId = evidenceBoardState.boards[0]?.id;
  if (boardId !== undefined) {
    return fetchApi<EvidenceGraphResponse>(
      withWorkspaceSubreddit(
        `${API_ROUTES.evidenceGraph}?boardId=${encodeURIComponent(boardId)}`
      )
    );
  }

  return undefined;
}

async function resetDemoOrchestrationFromUi() {
  v2ProductState = {
    ...v2ProductState,
    loading: true,
    error: undefined,
  };
  render();

  try {
    const manifest = await fetchApi<DemoOrchestrationManifest>(API_ROUTES.demoReset, {
      method: 'POST',
    });
    v2ProductState = {
      ...v2ProductState,
      demoManifest: manifest,
      loading: false,
      error: undefined,
    };
    await runScan('demo');
    await Promise.all([loadPolicies(), loadGovernance(), loadReceipts(), loadEvidenceBoards()]);
    await loadV2ProductSurfaces();
  } catch (error) {
    v2ProductState = {
      ...v2ProductState,
      loading: false,
      error: normalizeClientError(error, 'Demo orchestration reset failed.'),
    };
    render();
  }
}

async function submitCalibrationAnswerFromUi(
  scenarioId: string,
  selectedAction: EnforcementAction
) {
  try {
    const result = await fetchApi<CalibrationAnswerResult>(
      API_ROUTES.calibrationAnswer,
      {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          subreddit: getWorkspaceSubreddit() ?? DEMO_SUBREDDIT_NAME,
          scenarioId,
          selectedAction,
        }),
      }
    );
    v2ProductState = {
      ...v2ProductState,
      calibrationResult: result,
      error: undefined,
    };
  } catch (error) {
    v2ProductState = {
      ...v2ProductState,
      error: normalizeClientError(error, 'Calibration answer could not be recorded.'),
    };
  }
  render();
}

async function updateReviewTaskStatusFromUi(
  taskId: string,
  status: ReviewRoomResponse['tasks'][number]['status']
) {
  try {
    await fetchApi<ReviewRoomResponse['tasks'][number]>(
      `${API_ROUTES.reviewRoom}/tasks/${encodeURIComponent(taskId)}/status`,
      {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          subreddit: getWorkspaceSubreddit() ?? DEMO_SUBREDDIT_NAME,
          status,
        }),
      }
    );
    await loadV2ProductSurfaces();
  } catch (error) {
    v2ProductState = {
      ...v2ProductState,
      error: normalizeClientError(error, 'Review task status could not be updated.'),
    };
    render();
  }
}

async function createScenarioFromUi(formData: FormData) {
  const expectedAction = String(formData.get('expectedAction') ?? '');
  if (!isEnforcementAction(expectedAction)) {
    v2ProductState = {
      ...v2ProductState,
      error: 'Scenario expected action is invalid.',
    };
    render();
    return;
  }

  try {
    await fetchApi<CalibrationScenario>(API_ROUTES.calibrationScenarios, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        subreddit: getWorkspaceSubreddit() ?? DEMO_SUBREDDIT_NAME,
        title: String(formData.get('title') ?? ''),
        prompt: String(formData.get('prompt') ?? ''),
        ruleKey: String(formData.get('ruleKey') ?? ''),
        ruleName: String(formData.get('ruleName') ?? ''),
        expectedAction,
        acceptableAlternatives: [],
        explanation: String(formData.get('explanation') ?? ''),
        source: 'manual',
        active: formData.get('active') === 'on',
        teachingReason: String(formData.get('teachingReason') ?? ''),
        containsRealUserContent: false,
      }),
    });
    await loadV2ProductSurfaces();
  } catch (error) {
    v2ProductState = {
      ...v2ProductState,
      error: normalizeClientError(error, 'Scenario could not be saved.'),
    };
    render();
  }
}

async function archiveScenarioFromUi(scenarioId: string) {
  try {
    await fetchApi<CalibrationScenario>(
      `${API_ROUTES.calibrationScenarios}/${encodeURIComponent(scenarioId)}/archive`,
      {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          subreddit: getWorkspaceSubreddit() ?? DEMO_SUBREDDIT_NAME,
        }),
      }
    );
    await loadV2ProductSurfaces();
  } catch (error) {
    v2ProductState = {
      ...v2ProductState,
      error: normalizeClientError(error, 'Scenario could not be archived.'),
    };
    render();
  }
}

async function createEvidenceBoardFromReceipt(receiptId: string) {
  const receipt = receiptLedgerState.receipts.find((item) => item.id === receiptId);
  const subject: EvidenceBoardCreateRequest['subject'] = {
    receiptId,
  };
  if (receipt?.targetThingId !== undefined) {
    subject.targetThingId = receipt.targetThingId;
  }
  if (receipt?.recommendation.ruleKey !== undefined) {
    subject.ruleKey = receipt.recommendation.ruleKey;
  }
  if (receipt?.policySnapshot?.policyId !== undefined) {
    subject.policyId = receipt.policySnapshot.policyId;
  }
  if (receipt?.policySnapshot?.policyVersionId !== undefined) {
    subject.policyVersionId = receipt.policySnapshot.policyVersionId;
  }
  await createEvidenceBoard({
    title: `Review receipt ${receiptId}`,
    subject,
    sourceRefs: [
      {
        source: 'receipt',
        id: receiptId,
      },
    ],
    note: 'Opened from the action receipt ledger.',
  });
}

async function createEvidenceBoardFromCasePacket() {
  const packet = casePacketState.packet;
  if (!packet) {
    return;
  }

  const sourceRefs: EvidenceBoardCreateRequest['sourceRefs'] = [];
  if (packet.action?.receiptId !== undefined) {
    sourceRefs.push({
      source: 'receipt',
      id: packet.action.receiptId,
    });
  }
  const subject: EvidenceBoardCreateRequest['subject'] = {
    casePacketId: packet.id,
  };
  if (packet.action?.receiptId !== undefined) {
    subject.receiptId = packet.action.receiptId;
  }
  if (packet.action?.targetThingId !== undefined) {
    subject.targetThingId = packet.action.targetThingId;
  }
  if (packet.policyContext.ruleKey !== undefined) {
    subject.ruleKey = packet.policyContext.ruleKey;
  }
  if (packet.policyContext.policyId !== undefined) {
    subject.policyId = packet.policyContext.policyId;
  }
  if (packet.policyContext.policyVersionId !== undefined) {
    subject.policyVersionId = packet.policyContext.policyVersionId;
  }

  await createEvidenceBoard({
    title: `Review case packet ${packet.id}`,
    subject,
    sourceRefs,
    casePacket: packet,
    note: 'Opened from a Case Packet in the Prove workspace.',
  });
}

async function createEvidenceBoard(request: EvidenceBoardCreateRequest) {
  evidenceBoardState = {
    ...evidenceBoardState,
    saving: true,
    error: undefined,
    message: undefined,
  };
  render();

  try {
    const subreddit = getWorkspaceSubreddit();
    const body: EvidenceBoardCreateRequest = {
      ...request,
      ...(subreddit ? { subreddit } : {}),
    };
    const board = await fetchApi<EvidenceBoardThread>(
      API_ROUTES.evidenceBoards,
      {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(body),
      }
    );
    evidenceBoardState = {
      ...evidenceBoardState,
      saving: false,
      boards: [
        board,
        ...evidenceBoardState.boards.filter((item) => item.id !== board.id),
      ],
      message: 'Evidence board opened.',
      error: undefined,
    };
    activePage = 'prove';
    window.location.hash = '#prove';
  } catch (error) {
    evidenceBoardState = {
      ...evidenceBoardState,
      saving: false,
      error: normalizeClientError(error, 'Evidence board could not be opened.'),
    };
  }

  render();
}

async function updateEvidenceBoardStatusFromForm(
  boardId: string,
  status: EvidenceBoardStatus,
  note: string
) {
  evidenceBoardState = {
    ...evidenceBoardState,
    updatingBoardId: boardId,
    error: undefined,
    message: undefined,
  };
  render();

  try {
    const subreddit = getWorkspaceSubreddit();
    const body: EvidenceBoardStatusUpdateRequest & { subreddit?: string } = {
      status,
    };
    if (note) {
      body.note = note;
    }
    if (subreddit) {
      body.subreddit = subreddit;
    }
    const updated = await fetchApi<EvidenceBoardThread>(
      `${API_ROUTES.evidenceBoards}/${encodeURIComponent(boardId)}/status`,
      {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(body),
      }
    );
    evidenceBoardState = {
      ...evidenceBoardState,
      updatingBoardId: undefined,
      boards: evidenceBoardState.boards.map((board) =>
        board.id === updated.id ? updated : board
      ),
      message: 'Evidence board status updated.',
      error: undefined,
    };
  } catch (error) {
    evidenceBoardState = {
      ...evidenceBoardState,
      updatingBoardId: undefined,
      error: normalizeClientError(
        error,
        'Evidence board status could not be updated.'
      ),
    };
  }

  render();
}

function isEvidenceBoardStatus(value: string): value is EvidenceBoardStatus {
  return EVIDENCE_BOARD_STATUS_VALUES.includes(value as EvidenceBoardStatus);
}

function isEnforcementAction(value: string | undefined): value is EnforcementAction {
  return ENFORCEMENT_ACTION_VALUES.includes(value as EnforcementAction);
}

function settledValue<T>(
  result: PromiseSettledResult<T>
): T | undefined {
  return result.status === 'fulfilled' ? result.value : undefined;
}

async function loadIncidentMode() {
  incidentModeState = {
    ...incidentModeState,
    loading: true,
    error: undefined,
  };
  render();

  try {
    const response = await fetchApi<IncidentModeStateResponse>(
      withWorkspaceSubreddit(API_ROUTES.incidents)
    );
    incidentModeState = {
      ...incidentModeState,
      loading: false,
      active: response.active,
      incidents: response.incidents,
      error: undefined,
    };
  } catch (error) {
    incidentModeState = {
      ...incidentModeState,
      loading: false,
      error: normalizeClientError(
        error,
        'Incident Mode status is unavailable in this preview.'
      ),
    };
  }

  render();
}

async function startIncidentMode(formData: FormData) {
  const reason = String(formData.get('reason') ?? '');
  if (!isIncidentModeReason(reason)) {
    incidentModeState = {
      ...incidentModeState,
      error: 'Choose an incident reason before starting Incident Mode.',
    };
    render();
    return;
  }

  const durationMinutes = Number(formData.get('durationMinutes') ?? 120);
  const description = String(formData.get('description') ?? '').trim();
  const subreddit = getWorkspaceSubreddit();
  const body: IncidentModeStartRequest = {
    reason,
    durationMinutes: Number.isFinite(durationMinutes) ? durationMinutes : 120,
  };
  if (description) {
    body.description = description;
  }
  if (subreddit) {
    body.subreddit = subreddit;
  }

  incidentModeState = {
    ...incidentModeState,
    saving: true,
    error: undefined,
    message: undefined,
    report: undefined,
  };
  render();

  try {
    const incident = await fetchApi<IncidentMode>(API_ROUTES.incidentStart, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
    });
    incidentModeState = {
      ...incidentModeState,
      saving: false,
      active: incident,
      incidents: [
        incident,
        ...incidentModeState.incidents.filter((item) => item.id !== incident.id),
      ],
      message: 'Incident Mode started. Apply Policy confirmations will tag receipts.',
      error: undefined,
    };
  } catch (error) {
    incidentModeState = {
      ...incidentModeState,
      saving: false,
      error: normalizeClientError(error, 'Incident Mode could not be started.'),
    };
  }

  render();
}

async function endIncidentMode(reviewNote: string) {
  const active = incidentModeState.active;
  if (active === undefined) {
    return;
  }

  const body: IncidentModeEndRequest = {};
  const subreddit = getWorkspaceSubreddit();
  if (reviewNote) {
    body.reviewNote = reviewNote;
  }
  if (subreddit) {
    body.subreddit = subreddit;
  }

  incidentModeState = {
    ...incidentModeState,
    ending: true,
    error: undefined,
    message: undefined,
  };
  render();

  try {
    const report = await fetchApi<IncidentModeReport>(
      `${API_ROUTES.incidents}/${encodeURIComponent(active.id)}/end`,
      {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(body),
      }
    );
    incidentModeState = {
      ...incidentModeState,
      ending: false,
      active: undefined,
      report,
      incidents: [
        report.incident,
        ...incidentModeState.incidents.filter(
          (item) => item.id !== report.incident.id
        ),
      ],
      message: 'Incident Mode ended and a review summary is ready.',
      error: undefined,
    };
  } catch (error) {
    incidentModeState = {
      ...incidentModeState,
      ending: false,
      error: normalizeClientError(error, 'Incident Mode could not be ended.'),
    };
  }

  render();
}

function isIncidentModeReason(value: string): value is IncidentModeReason {
  return INCIDENT_MODE_REASON_VALUES.includes(value as IncidentModeReason);
}

async function exportPortableConfig() {
  configPortabilityState = {
    ...configPortabilityState,
    loading: true,
    error: undefined,
    message: undefined,
  };
  render();

  try {
    const portablePackage = await fetchApi<PortableConfigPackage>(
      withWorkspaceSubreddit(API_ROUTES.configExport)
    );
    configPortabilityState = {
      ...configPortabilityState,
      loading: false,
      exportedPackage: portablePackage,
      message: 'Portable config package generated without private history.',
      error: undefined,
    };
  } catch (error) {
    configPortabilityState = {
      ...configPortabilityState,
      loading: false,
      error: normalizeClientError(error, 'Portable config export failed.'),
    };
  }

  render();
}

async function loadPortableConfigTemplates() {
  configPortabilityState = {
    ...configPortabilityState,
    loading: true,
    error: undefined,
  };
  render();

  try {
    const response = await fetchApi<PortableConfigTemplateListResponse>(
      API_ROUTES.configTemplates
    );
    configPortabilityState = {
      ...configPortabilityState,
      loading: false,
      templates: response.templates,
      message: 'Starter templates loaded. Review JSON before importing.',
      error: undefined,
    };
  } catch (error) {
    configPortabilityState = {
      ...configPortabilityState,
      loading: false,
      error: normalizeClientError(error, 'Portable config templates failed to load.'),
    };
  }

  render();
}

async function importPortableConfig(configJson: string, dryRun: boolean) {
  if (!configJson) {
    configPortabilityState = {
      ...configPortabilityState,
      importText: configJson,
      error: 'Paste portable config JSON before importing.',
      message: undefined,
    };
    render();
    return;
  }

  let parsedPackage: unknown;
  try {
    parsedPackage = JSON.parse(configJson);
  } catch {
    configPortabilityState = {
      ...configPortabilityState,
      importText: configJson,
      error: 'Portable config JSON is invalid.',
      message: undefined,
    };
    render();
    return;
  }

  configPortabilityState = {
    ...configPortabilityState,
    importing: true,
    importText: configJson,
    error: undefined,
    message: undefined,
    importResult: undefined,
  };
  render();

  try {
    const subreddit = getWorkspaceSubreddit();
    const body = {
      package: parsedPackage,
      dryRun,
      ...(subreddit ? { subreddit } : {}),
    };
    const result = await fetchApi<PortableConfigImportResult>(
      API_ROUTES.configImport,
      {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(body),
      }
    );
    configPortabilityState = {
      ...configPortabilityState,
      importing: false,
      importResult: result,
      message: dryRun
        ? 'Dry run completed. No policies or settings were written.'
        : 'Portable config imported as drafts and proposed updates.',
      error: undefined,
    };
    if (!dryRun) {
      void loadPolicies();
      void loadDigestHistory();
    }
  } catch (error) {
    configPortabilityState = {
      ...configPortabilityState,
      importing: false,
      error: normalizeClientError(error, 'Portable config import failed safely.'),
    };
  }

  render();
}

async function loadPrivacyRetentionSettings() {
  privacyRetentionState = {
    ...privacyRetentionState,
    loading: true,
    error: undefined,
  };
  render();

  try {
    const settings = await fetchApi<PrivacyRetentionSettings>(
      withWorkspaceSubreddit(API_ROUTES.privacyRetention)
    );
    privacyRetentionState = {
      ...privacyRetentionState,
      loading: false,
      settings,
      message: undefined,
      error: undefined,
    };
  } catch (error) {
    privacyRetentionState = {
      ...privacyRetentionState,
      loading: false,
      error: normalizeClientError(
        error,
        'Privacy retention settings are unavailable.'
      ),
    };
  }

  render();
}

async function savePrivacyRetentionSettings(formData: FormData) {
  privacyRetentionState = {
    ...privacyRetentionState,
    saving: true,
    error: undefined,
    message: undefined,
  };
  render();

  try {
    const subreddit = getWorkspaceSubreddit();
    const body = {
      scanHistoryDays: readRetentionDays(formData, 'scanHistoryDays'),
      actionReceiptDays: readRetentionDays(formData, 'actionReceiptDays'),
      evidenceBoardDays: readRetentionDays(formData, 'evidenceBoardDays'),
      teamDeliveryReceiptDays: readRetentionDays(
        formData,
        'teamDeliveryReceiptDays'
      ),
      casePacketDays: readRetentionDays(formData, 'casePacketDays'),
      aiAdvisoryLogDays: readRetentionDays(formData, 'aiAdvisoryLogDays'),
      ...(subreddit ? { subreddit } : {}),
    };
    const settings = await fetchApi<PrivacyRetentionSettings>(
      API_ROUTES.privacyRetention,
      {
        method: 'PUT',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(body),
      }
    );
    privacyRetentionState = {
      ...privacyRetentionState,
      saving: false,
      settings,
      message: 'Retention settings saved. Policy history remains protected.',
      error: undefined,
    };
  } catch (error) {
    privacyRetentionState = {
      ...privacyRetentionState,
      saving: false,
      error: normalizeClientError(error, 'Retention settings could not be saved.'),
    };
  }

  render();
}

async function exportPrivacyInventory() {
  privacyRetentionState = {
    ...privacyRetentionState,
    loading: true,
    error: undefined,
    message: undefined,
  };
  render();

  try {
    const inventory = await fetchApi<PrivacyRetentionExport>(
      withWorkspaceSubreddit(API_ROUTES.privacyExport)
    );
    privacyRetentionState = {
      ...privacyRetentionState,
      loading: false,
      inventory,
      message: 'Privacy inventory loaded. It reports counts, not private payloads.',
      error: undefined,
    };
  } catch (error) {
    privacyRetentionState = {
      ...privacyRetentionState,
      loading: false,
      error: normalizeClientError(error, 'Privacy inventory export failed.'),
    };
  }

  render();
}

async function deletePrivacyDataFromForm(
  formData: FormData,
  mode: string | undefined
) {
  const categories = formData
    .getAll('category')
    .map((value) => String(value))
    .filter(isPrivacyRetentionCategory);
  if (mode !== 'expired' && categories.length === 0) {
    privacyRetentionState = {
      ...privacyRetentionState,
      error: 'Select at least one data category before running deletion controls.',
      message: undefined,
    };
    render();
    return;
  }

  privacyRetentionState = {
    ...privacyRetentionState,
    deleting: true,
    error: undefined,
    message: undefined,
    deletionResult: undefined,
  };
  render();

  try {
    const subreddit = getWorkspaceSubreddit();
    const body = {
      categories:
        mode === 'expired' ? [...PRIVACY_RETENTION_CATEGORY_VALUES] : categories,
      dryRun: mode !== 'delete' && mode !== 'expired',
      expiredOnly: mode === 'expired',
      ...(subreddit ? { subreddit } : {}),
    };
    const deletionResult = await fetchApi<PrivacyDeletionResult>(
      API_ROUTES.privacyDelete,
      {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(body),
      }
    );
    privacyRetentionState = {
      ...privacyRetentionState,
      deleting: false,
      deletionResult,
      message: deletionResult.dryRun
        ? 'Dry run completed. No data was deleted.'
        : 'Selected privacy data was deleted. Policy history remains protected.',
      error: undefined,
    };
    if (!deletionResult.dryRun) {
      void exportPrivacyInventory();
    }
  } catch (error) {
    privacyRetentionState = {
      ...privacyRetentionState,
      deleting: false,
      error: normalizeClientError(error, 'Privacy deletion failed safely.'),
    };
  }

  render();
}

async function loadPolicyVersions(
  policies: RulePolicy[]
): Promise<Record<string, PolicyVersionSummary[]>> {
  const entries = await Promise.all(
    policies.map(async (policy) => {
      try {
        return [
          policy.id,
          await fetchApi<PolicyVersionSummary[]>(
            withWorkspaceSubreddit(`${API_ROUTES.policies}/${policy.id}/versions`)
          ),
        ] as const;
      } catch {
        return [policy.id, []] as const;
      }
    })
  );

  return Object.fromEntries(entries);
}

async function loadPolicyImpacts(
  policies: RulePolicy[]
): Promise<Record<string, PolicyImpactMeasurement>> {
  const entries = await Promise.all(
    policies.map(async (policy) => {
      try {
        return [
          policy.id,
          await fetchApi<PolicyImpactMeasurement>(
            withWorkspaceSubreddit(
              API_ROUTES.policyImpact.replace(
                ':id',
                encodeURIComponent(policy.id)
              )
            )
          ),
        ] as const;
      } catch {
        return [policy.id, undefined] as const;
      }
    })
  );

  return Object.fromEntries(
    entries.filter((entry): entry is readonly [string, PolicyImpactMeasurement] =>
      entry[1] !== undefined
    )
  );
}

async function reviewOverride(
  overrideId: string,
  reviewStatus: OverrideReviewStatus,
  reviewNote?: string
) {
  governanceState = {
    ...governanceState,
    savingOverrideId: overrideId,
    error: undefined,
    message: undefined,
  };
  render();

  try {
    const body: {
      reviewStatus: OverrideReviewStatus;
      reviewNote?: string;
    } = { reviewStatus };
    if (reviewNote) {
      body.reviewNote = reviewNote;
    }
    const updated = await fetchApi<ReviewableOverrideEvent>(
      withWorkspaceSubreddit(
        `${API_ROUTES.overrides}/${encodeURIComponent(overrideId)}/review`
      ),
      {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(body),
      }
    );
    governanceState = {
      ...governanceState,
      savingOverrideId: undefined,
      overrides: governanceState.overrides.map((event) =>
        event.id === updated.id ? updated : event
      ),
      message: 'Override review updated.',
    };
  } catch (error) {
    governanceState = {
      ...governanceState,
      savingOverrideId: undefined,
      error: normalizeClientError(
        error,
        'Override review update failed.'
      ),
    };
  }

  render();
}

async function fetchApi<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetchWithTimeout(url, init);
  let payload: ApiResponse<T>;
  try {
    payload = (await response.json()) as ApiResponse<T>;
  } catch (error) {
    throw new Error(`API response was not JSON for ${url}: ${String(error)}`);
  }
  if (!payload.ok) {
    throw new Error(`API error (${payload.error.code}): ${payload.error.message}`);
  }
  if (!response.ok) {
    throw new Error(`API request returned ${response.status} for ${url}.`);
  }
  return payload.data;
}

async function fetchWithTimeout(
  url: string,
  init?: RequestInit
): Promise<Response> {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => {
    controller.abort();
  }, API_TIMEOUT_MS);
  try {
    return await fetch(url, {
      ...init,
      signal: controller.signal,
    });
  } catch (error) {
    if (controller.signal.aborted) {
      throw new Error(`Request to ${url} timed out after ${API_TIMEOUT_MS}ms.`);
    }
    throw error;
  } finally {
    window.clearTimeout(timeout);
  }
}

async function writeClipboardText(text: string, subject: string): Promise<void> {
  if (!hasClipboardApi()) {
    throw new Error(`${subject} clipboard API unavailable.`);
  }
  await navigator.clipboard.writeText(text);
}

function hasClipboardApi(): boolean {
  return typeof navigator.clipboard?.writeText === 'function';
}

function formatClipboardError(error: unknown, subject: string): string {
  return formatClientNotice(
    classifyClipboardFailure({
      hasClipboardApi: hasClipboardApi(),
      error,
      subject,
    })
  );
}

async function generateCasePacket(
  subject: GenerateCasePacketRequest['subject']
) {
  casePacketState = {
    ...casePacketState,
    loading: true,
    deliverySaving: false,
    error: undefined,
    message: undefined,
    deliveryReceiptId: undefined,
    deliveryStatus: undefined,
  };
  dashboardOpen = true;
  activePage = 'prove';
  window.location.hash = '#prove';
  render();

  try {
    const body: GenerateCasePacketRequest & { subreddit?: string } = {
      subject,
      timeWindowDays: 30,
      maxComparableCases: 5,
    };
    const subreddit = getWorkspaceSubreddit();
    if (subreddit) {
      body.subreddit = subreddit;
    }
    const data = await fetchApi<GenerateCasePacketResponse>(
      API_ROUTES.casePacket,
      {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(body),
      }
    );
    casePacketState = {
      loading: false,
      deliverySaving: false,
      error: undefined,
      message: 'Case packet generated.',
      deliveryReceiptId: undefined,
      deliveryStatus: undefined,
      packet: data.packet,
    };
  } catch (error) {
    if (subject.type === 'demo' && canUseClientDemoFallback()) {
      casePacketState = {
        loading: false,
        deliverySaving: false,
        error: undefined,
        message: 'Demo case packet generated.',
        deliveryReceiptId: undefined,
        deliveryStatus: undefined,
        packet: createClientDemoCasePacket(),
      };
      render();
      return;
    }

    casePacketState = {
      ...casePacketState,
      loading: false,
      deliverySaving: false,
      error: normalizeClientError(
        error,
        'Case Packet generation is unavailable in this preview.'
      ),
    };
  }

  render();
}

async function copyCasePacketMarkdown() {
  const markdown = casePacketState.packet?.markdown;
  if (!markdown) {
    return;
  }

  try {
    await writeClipboardText(markdown, 'Case Packet Markdown');
    casePacketState = {
      ...casePacketState,
      message: 'Markdown copied to clipboard.',
      error: undefined,
    };
  } catch (error) {
    casePacketState = {
      ...casePacketState,
      message: undefined,
      error: formatClipboardError(error, 'Case Packet Markdown'),
    };
  }

  render();
}

async function saveCasePacketDeliveryReceipt(channel: TeamDeliveryChannel) {
  const packet = casePacketState.packet;
  if (!packet) {
    return;
  }

  casePacketState = {
    ...casePacketState,
    deliverySaving: true,
    error: undefined,
    message: undefined,
  };
  render();

  try {
    const draft = buildCasePacketDeliveryDraft(packet, channel);
    const subreddit = getWorkspaceSubreddit();
    const body = {
      ...draft,
      confirmed: true,
      ...(subreddit ? { subreddit } : {}),
    };
    const response = await fetchApi<TeamDeliveryConfirmResponse>(
      API_ROUTES.teamDeliveryConfirm,
      {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(body),
      }
    );

    casePacketState = {
      ...casePacketState,
      deliverySaving: false,
      deliveryReceiptId: response.receipt.id,
      deliveryStatus: response.receipt.status,
      message:
        response.receipt.status === 'manual_ready'
          ? 'Manual delivery receipt saved. Copy the Markdown into your review thread.'
          : 'Mod Discussion draft receipt saved. No Reddit message was sent.',
      error: undefined,
    };
  } catch (error) {
    casePacketState = {
      ...casePacketState,
      deliverySaving: false,
      error: normalizeClientError(
        error,
        'Case packet delivery receipt could not be saved.'
      ),
    };
  }

  render();
}

async function createPolicyFromDrift(candidate: DriftCandidate) {
  policyState = { ...policyState, saving: true, error: undefined };
  render();

  try {
    const response = await fetch(API_ROUTES.policyFromDrift, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        subreddit: scanState.result?.subreddit,
        driftCandidate: candidate,
      }),
    });
    const payload = (await response.json()) as ApiResponse<RulePolicy>;
    if (!payload.ok) {
      throw new Error(payload.error.message);
    }
    policyState = {
      ...policyState,
      saving: false,
      policies: upsertPolicy(policyState.policies, payload.data),
      message: `Draft created for ${payload.data.ruleName}.`,
      form: policyToForm(payload.data),
    };
    activePage = 'agree';
    window.location.hash = '#agree';
  } catch (error) {
    if (canUseClientDemoFallback()) {
      const policy = createClientDemoPolicy(candidate);
      policyState = {
        ...policyState,
        saving: false,
        policies: upsertPolicy(policyState.policies, policy),
        message: `Demo draft created for ${policy.ruleName}.`,
        form: policyToForm(policy),
      };
      activePage = 'agree';
      window.location.hash = '#agree';
      render();
      return;
    }

    policyState = {
      ...policyState,
      saving: false,
      error: normalizeClientError(error, 'Create-from-drift failed.'),
    };
  }

  render();
}

async function savePolicyForm(formData: FormData) {
  const form = formDataToPolicy(formData);
  policyState = { ...policyState, saving: true, error: undefined };
  render();

  try {
    const url =
      policyState.form.mode === 'edit' && policyState.form.policyId
        ? withWorkspaceSubreddit(
            `${API_ROUTES.policies}/${policyState.form.policyId}`
          )
        : API_ROUTES.policies;
    const method = policyState.form.mode === 'edit' ? 'PUT' : 'POST';
    const response = await fetch(url, {
      method,
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(form),
    });
    const payload = (await response.json()) as ApiResponse<RulePolicy>;
    if (!payload.ok) {
      throw new Error(payload.error.message);
    }
    policyState = {
      ...policyState,
      saving: false,
      policies: upsertPolicy(policyState.policies, payload.data),
      message: `Draft saved for ${payload.data.ruleName}.`,
      form: policyToForm(payload.data),
    };
  } catch (error) {
    policyState = {
      ...policyState,
      saving: false,
      error: normalizeClientError(error, 'Policy save failed.'),
    };
  }

  render();
}

async function transitionPolicyLifecycle(
  policyId: string,
  action: 'propose' | 'review' | 'adopt',
  decision?: 'approve' | 'request_changes',
  quickAdoption = false
) {
  policyState = { ...policyState, saving: true, error: undefined };
  render();

  try {
    const suffix =
      action === 'propose'
        ? 'propose'
        : action === 'review'
          ? 'reviews'
          : 'adopt';
    const body =
      action === 'review'
        ? {
            decision,
            note:
              decision === 'approve'
                ? 'Approved for adoption.'
                : 'Changes requested before adoption.',
          }
        : action === 'adopt'
          ? {
              quickAdoption,
              note: quickAdoption
                ? 'Single-mod quick adoption recorded.'
                : 'Ratified policy version adopted.',
            }
          : { note: 'Draft proposed for team review.' };
    const policy = await fetchPolicyLifecycle(policyId, suffix, body);
    policyState = {
      ...policyState,
      saving: false,
      policies: upsertPolicy(policyState.policies, policy),
      message:
        action === 'adopt'
          ? `Adopted ${policy.ruleName}.`
          : `Updated ${policy.ruleName}.`,
      form: policyToForm(policy),
    };
  } catch (error) {
    if (canUseClientDemoFallback()) {
      const policy = policyState.policies.find((item) => item.id === policyId);
      if (policy) {
        const updated = applyClientDemoLifecycle(policy, action, decision);
        policyState = {
          ...policyState,
          saving: false,
          policies: upsertPolicy(policyState.policies, updated),
          message:
            action === 'adopt'
              ? `Demo policy adopted for ${updated.ruleName}.`
              : `Demo policy updated for ${updated.ruleName}.`,
          form: policyToForm(updated),
        };
        render();
        return;
      }
    }
    policyState = {
      ...policyState,
      saving: false,
      error: normalizeClientError(error, 'Policy lifecycle update failed.'),
    };
  }

  render();
}

async function runPolicyReplayFromUi(policyId: string) {
  policyReplayState = {
    loadingPolicyId: policyId,
    error: undefined,
    result: policyReplayState.result,
  };
  render();

  try {
    const scanId = scanState.record?.id;
    if (!scanId) {
      throw new Error('Run a scan first so replay has stored actions to use.');
    }
    const replay = await fetchPolicyReplay(policyId, { scanId });
    policyReplayState = {
      loadingPolicyId: undefined,
      result: replay,
      error: undefined,
    };
  } catch (error) {
    if (canUseClientDemoFallback()) {
      const policy = policyState.policies.find((item) => item.id === policyId);
      if (policy) {
        policyReplayState = {
          loadingPolicyId: undefined,
          result: buildClientDemoReplay(policy),
          error: undefined,
        };
        render();
        return;
      }
    }
    policyReplayState = {
      loadingPolicyId: undefined,
      error: normalizeClientError(error, 'Policy replay failed.'),
      result: undefined,
    };
  }

  render();
}

async function fetchPolicyReplay(
  policyId: string,
  body: Record<string, unknown>
): Promise<PolicyReplayResult> {
  return fetchApi<PolicyReplayResult>(
    withWorkspaceSubreddit(
      API_ROUTES.policyReplay.replace(':id', encodeURIComponent(policyId))
    ),
    {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
    }
  );
}

async function fetchPolicyLifecycle(
  policyId: string,
  suffix: string,
  body: Record<string, unknown>
): Promise<RulePolicy> {
  return fetchApi<RulePolicy>(
    withWorkspaceSubreddit(`${API_ROUTES.policies}/${policyId}/${suffix}`),
    {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
    }
  );
}

function applyClientDemoLifecycle(
  policy: RulePolicy,
  action: 'propose' | 'review' | 'adopt',
  decision?: 'approve' | 'request_changes'
): RulePolicy {
  const now = new Date().toISOString();
  if (action === 'adopt') {
    return {
      ...policy,
      active: true,
      lifecycleState: 'adopted',
      activeVersionId: policy.proposedVersionId ?? policy.activeVersionId ?? 'demo-policy-low-effort-v2',
      activeVersionNumber:
        policy.proposedVersionNumber ?? policy.activeVersionNumber ?? 2,
      adoptedBy: 'demo-lead-mod',
      adoptedAt: now,
      ratificationSummary: {
        requiredApprovals: policy.ratificationSettings?.requiredApprovals ?? 1,
        approvals: Math.max(
          1,
          policy.ratificationSummary?.approvals ?? 0
        ),
        requestsForChanges: 0,
        abstentions: policy.ratificationSummary?.abstentions ?? 0,
        latestReviewCount:
          policy.ratificationSummary?.latestReviewCount ?? 1,
        canAdopt: true,
      },
      updatedAt: now,
    };
  }
  if (action === 'review') {
    return {
      ...policy,
      lifecycleState: decision === 'request_changes' ? 'draft' : 'under_review',
      reviewRecords: [
        ...(policy.reviewRecords ?? []),
        {
          id: `demo-policy-review-${now}`,
          reviewer: 'demo-reviewer',
          decision: decision ?? 'abstain',
          createdAt: now,
        },
      ],
      ratificationSummary:
        decision === 'approve'
          ? {
              requiredApprovals:
                policy.ratificationSettings?.requiredApprovals ?? 1,
              approvals: 1,
              requestsForChanges: 0,
              abstentions: 0,
              latestReviewCount: 1,
              canAdopt: true,
            }
          : {
              requiredApprovals:
                policy.ratificationSettings?.requiredApprovals ?? 1,
              approvals: 0,
              requestsForChanges: 1,
              abstentions: 0,
              latestReviewCount: 1,
              canAdopt: false,
              adoptionBlockedReason:
                'At least one reviewer requested changes on this version.',
            },
      updatedAt: now,
    };
  }
  return {
    ...policy,
    lifecycleState: 'proposed',
    proposedBy: 'demo-lead-mod',
    proposedAt: now,
    proposalNote: 'Draft proposed for team review.',
    ratificationSummary: {
      requiredApprovals: policy.ratificationSettings?.requiredApprovals ?? 1,
      approvals: 0,
      requestsForChanges: 0,
      abstentions: 0,
      latestReviewCount: 0,
      canAdopt: false,
      adoptionBlockedReason: `Requires ${policy.ratificationSettings?.requiredApprovals ?? 1} approval vote(s) before adoption.`,
    },
    updatedAt: now,
  };
}

async function previewApplyPolicy(formData: FormData) {
  const payload = applyFormDataToPayload(formData, false);
  applyState = {
    ...applyState,
    loading: true,
    error: undefined,
    message: undefined,
    form: applyFormDataToState(formData),
  };
  render();

  try {
    const preview = await fetchApi<ApplyPolicyPreview>(
      API_ROUTES.applyPolicyPreview,
      {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
      }
    );
    applyState = {
      ...applyState,
      loading: false,
      preview,
      result: undefined,
    };
  } catch (error) {
    if (canUseClientDemoFallback()) {
      applyState = {
        ...applyState,
        loading: false,
        preview: createClientDemoApplyPreview(payload),
        result: undefined,
      };
      render();
      return;
    }

    applyState = {
      ...applyState,
      loading: false,
      error: normalizeClientError(error, 'Apply Policy preview failed.'),
    };
  }

  render();
}

async function confirmApplyPolicy(formData: FormData) {
  const payload = applyFormDataToPayload(formData, true);
  applyState = {
    ...applyState,
    confirming: true,
    error: undefined,
    message: undefined,
    form: applyFormDataToState(formData),
  };
  render();

  try {
    const result = await fetchApi<ApplyPolicyConfirmResult>(
      API_ROUTES.applyPolicyConfirm,
      {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
      }
    );
    const preview = applyState.preview ?? createClientDemoApplyPreview(payload);
    applyState = {
      ...applyState,
      confirming: false,
      preview: {
        ...preview,
        recommendation: result.recommendation,
      },
      result,
      message: 'Policy action recorded with receipt.',
    };
    await loadGovernance();
    await loadReceipts();
  } catch (error) {
    if (canUseClientDemoFallback()) {
      const result = createClientDemoApplyResult(payload);
      const preview = createClientDemoApplyPreview(payload);
      applyState = {
        ...applyState,
        confirming: false,
        preview: {
          ...preview,
          recommendation: result.recommendation,
        },
        result,
        message: 'Demo policy action recorded in log-only mode.',
      };
      governanceState = {
        ...governanceState,
        error: undefined,
        message: undefined,
        health: createClientDemoHealth(result.overrideEvent),
        overrides: createClientDemoOverrides(result.overrideEvent),
        versionsByPolicy: createClientDemoVersions(),
      };
      receiptLedgerState = {
        loading: false,
        receipts: [result.receipt, ...receiptLedgerState.receipts],
      };
      render();
      return;
    }

    applyState = {
      ...applyState,
      confirming: false,
      error: normalizeClientError(error, 'Apply Policy confirm failed.'),
    };
    render();
  }
}

function applyTriageItem(item: ModqueueTriageItem) {
  applyState = {
    ...applyState,
    error: undefined,
    message: `Loaded ${item.targetThingId} from the operational queue.`,
    form: {
      ...applyState.form,
      ruleKey: item.policyHint.ruleKey ?? applyState.form.ruleKey,
      targetThingId: item.targetThingId,
      targetAuthor: item.authorName ?? '',
      targetTitle: item.title ?? '',
      targetBody: item.bodyExcerpt ?? '',
      targetPermalink: item.permalink ?? '',
      subreddit: item.subreddit,
      selectedAction: applyState.form.selectedAction,
    },
  };
  activePage = 'act';
  window.location.hash = item.applyPolicyHash;
  render();
}

async function generateDigest() {
  digestState = {
    ...digestState,
    loading: true,
    error: undefined,
    message: undefined,
  };
  render();

  try {
    const body: { subreddit?: string; source: 'manual' | 'demo'; periodDays: number } = {
      source: buildDashboardSummary().dataMode === 'demo' ? 'demo' : 'manual',
      periodDays: 7,
    };
    const subreddit = getWorkspaceSubreddit();
    if (subreddit) {
      body.subreddit = subreddit;
    }
    const data = await fetchApi<GenerateDigestResponse>(
      API_ROUTES.digestGenerate,
      {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(body),
      }
    );
    digestState = {
      loading: false,
      error: undefined,
      report: data.report,
      history: data.history,
      capabilities: data.capabilities,
      settings: data.settings,
      message: 'Manual digest generated and saved to history.',
    };
  } catch (error) {
    if (canUseClientDemoFallback()) {
      const report = createClientDemoDigestReport();
      digestState = {
        loading: false,
        error: undefined,
        report,
        history: [report, ...digestState.history.filter((item) => item.id !== report.id)],
        capabilities: createClientDigestCapabilities(),
        settings: {
          ...createClientDigestSettings(),
          lastGeneratedAt: report.generatedAt,
        },
        message: 'Demo digest generated locally for preview.',
      };
      render();
      return;
    }

    digestState = {
      ...digestState,
      loading: false,
      error: normalizeClientError(error, 'Digest generation failed.'),
    };
  }
  render();
}

async function copyDigestMarkdown() {
  const markdown = digestState.report?.markdown ?? digestState.history[0]?.markdown;
  if (!markdown) {
    return;
  }
  try {
    await writeClipboardText(markdown, 'Digest Markdown');
    digestState = {
      ...digestState,
      message: 'Digest copied to clipboard.',
      error: undefined,
    };
  } catch (error) {
    digestState = {
      ...digestState,
      message: undefined,
      error: formatClipboardError(error, 'Digest Markdown'),
    };
  }
  render();
}

function applyFormDataToPayload(formData: FormData, includeOverride: boolean) {
  const ruleKey = String(formData.get('ruleKey') ?? '');
  const payload: {
    subreddit?: string;
    ruleKey: string;
    targetThingId: string;
    targetAuthor: string;
    targetTitle?: string;
    targetBody?: string;
    targetPermalink?: string;
    selectedAction: EnforcementAction;
    modNoteMode: NativeModNoteMode;
    source: ApplyPolicySource;
    confirmed?: boolean;
    overrideReason?: OverrideReason;
    overrideNote?: string;
  } = {
    ruleKey,
    targetThingId: String(formData.get('targetThingId') ?? ''),
    targetAuthor: String(formData.get('targetAuthor') ?? ''),
    selectedAction: String(
      formData.get('selectedAction') ?? 'manual_review'
    ) as EnforcementAction,
    modNoteMode: parseNativeModNoteMode(
      String(formData.get('modNoteMode') ?? 'log_only')
    ),
    source: getApplyPolicySource(String(formData.get('targetThingId') ?? '')),
  };
  const targetTitle = String(formData.get('targetTitle') ?? '').trim();
  const targetBody = String(formData.get('targetBody') ?? '').trim();
  const targetPermalink = String(formData.get('targetPermalink') ?? '').trim();
  const formSubreddit = String(formData.get('subreddit') ?? '').trim();
  if (targetTitle) {
    payload.targetTitle = targetTitle;
  }
  if (targetBody) {
    payload.targetBody = targetBody;
  }
  if (targetPermalink) {
    payload.targetPermalink = targetPermalink;
  }
  const selectedPolicy = policyState.policies.find(
    (policy) => policy.ruleKey === ruleKey
  );
  if (selectedPolicy !== undefined) {
    payload.subreddit = selectedPolicy.subreddit;
  } else if (formSubreddit) {
    payload.subreddit = formSubreddit;
  }

  if (includeOverride) {
    payload.confirmed = true;
    const overrideReason = String(formData.get('overrideReason') ?? '');
    const overrideNote = String(formData.get('overrideNote') ?? '').trim();
    if (overrideReason) {
      payload.overrideReason = overrideReason as OverrideReason;
    }
    if (overrideNote) {
      payload.overrideNote = overrideNote;
    }
  }

  return payload;
}

function getApplyPolicySource(targetThingId: string): ApplyPolicySource {
  if (!targetThingId || targetThingId === 't3_demo_policy_target') {
    return 'simulator';
  }
  if (targetThingId.startsWith('t1_') || targetThingId.startsWith('t3_')) {
    return 'live';
  }
  return 'simulator';
}

function parseNativeModNoteMode(value: string): NativeModNoteMode {
  return NATIVE_MOD_NOTE_MODE_VALUES.includes(value as NativeModNoteMode)
    ? (value as NativeModNoteMode)
    : 'log_only';
}

function applyFormDataToState(formData: FormData): ApplyFormState {
  const overrideReason = String(formData.get('overrideReason') ?? '');

  return {
    ruleKey: String(formData.get('ruleKey') ?? ''),
    targetThingId: String(formData.get('targetThingId') ?? ''),
    targetAuthor: String(formData.get('targetAuthor') ?? ''),
    targetTitle: String(formData.get('targetTitle') ?? ''),
    targetBody: String(formData.get('targetBody') ?? ''),
    targetPermalink: String(formData.get('targetPermalink') ?? ''),
    subreddit: String(formData.get('subreddit') ?? ''),
    selectedAction: String(
      formData.get('selectedAction') ?? 'manual_review'
    ) as EnforcementAction,
    modNoteMode: parseNativeModNoteMode(
      String(formData.get('modNoteMode') ?? 'log_only')
    ),
    overrideReason: overrideReason ? (overrideReason as OverrideReason) : '',
    overrideNote: String(formData.get('overrideNote') ?? ''),
  };
}

function formDataToPolicy(formData: FormData) {
  const steps = policyState.form.steps.map((step, index) => {
    const responseTemplates = Object.fromEntries(
      RESPONSE_TEMPLATE_KIND_VALUES.map((kind) => {
        const body = String(formData.get(`template-${kind}-${index}`) ?? '').trim();
        return [
          kind,
          body
            ? {
                kind,
                body,
                deliveryMode: 'log_only' as const,
                enabled: true,
              }
            : undefined,
        ];
      }).filter(([, template]) => template !== undefined)
    ) as PolicyStep['responseTemplates'];
    const nextStep: PolicyStep = {
      offenseCount: step.offenseCount,
      windowDays: Number(formData.get(`windowDays-${index}`) ?? step.windowDays),
      recommendedAction: String(
        formData.get(`recommendedAction-${index}`) ?? step.recommendedAction
      ) as EnforcementAction,
      requireOverrideReasonForDeviation:
        formData.get(`requireOverride-${index}`) === 'on',
    };
    if (responseTemplates !== undefined && Object.keys(responseTemplates).length > 0) {
      nextStep.responseTemplates = responseTemplates;
    }
    const removalTemplate = responseTemplates?.removal_explanation?.body;
    if (removalTemplate !== undefined) {
      nextStep.removalMessageTemplate = removalTemplate;
    }
    const noteTemplate = responseTemplates?.mod_note_summary?.body;
    if (noteTemplate !== undefined) {
      nextStep.noteTemplate = noteTemplate;
    }
    return nextStep;
  });

  const policy = {
    ruleKey: String(formData.get('ruleKey') ?? '').trim(),
    ruleName: String(formData.get('ruleName') ?? '').trim(),
    defaultMessageMode: String(
      formData.get('defaultMessageMode') ?? 'log_only'
    ) as MessageDeliveryMode,
    steps,
    active: false,
    ratificationSettings: {
      requiredApprovals: Math.max(
        1,
        Number(formData.get('requiredApprovals') ?? 1)
      ),
      allowSingleModAdoption:
        formData.get('allowSingleModAdoption') === 'on',
    },
  };
  const subreddit = getWorkspaceSubreddit();
  if (subreddit) {
    return { ...policy, subreddit };
  }

  return policy;
}

function policyToForm(policy: RulePolicy): PolicyFormState {
  return {
    mode: 'edit',
    policyId: policy.id,
    ruleKey: policy.ruleKey,
    ruleName: policy.ruleName,
    defaultMessageMode: policy.defaultMessageMode,
    requiredApprovals: policy.ratificationSettings?.requiredApprovals ?? 1,
    allowSingleModAdoption:
      policy.ratificationSettings?.allowSingleModAdoption ?? true,
    steps: policy.steps.map((step) => ({ ...step })),
  };
}

function upsertPolicy(policies: RulePolicy[], policy: RulePolicy) {
  const others = policies.filter(
    (item) =>
      item.id !== policy.id &&
      !(item.subreddit === policy.subreddit && item.ruleKey === policy.ruleKey)
  );
  return [...others, policy].sort((left, right) =>
    left.ruleName.localeCompare(right.ruleName)
  );
}

function getPolicyLifecycle(policy: RulePolicy) {
  return policy.lifecycleState ?? (policy.active ? 'adopted' : 'draft');
}

function getPolicyRatificationSummary(policy: RulePolicy) {
  const reviewsByReviewer = new Map(
    (policy.reviewRecords ?? []).map((record) => [
      record.reviewer.toLowerCase(),
      record,
    ])
  );
  const latestReviews = [...reviewsByReviewer.values()];
  const requiredApprovals =
    policy.ratificationSummary?.requiredApprovals ??
    policy.ratificationSettings?.requiredApprovals ??
    1;
  const approvals =
    policy.ratificationSummary?.approvals ??
    latestReviews.filter((record) => record.decision === 'approve').length;
  const requestsForChanges =
    policy.ratificationSummary?.requestsForChanges ??
    latestReviews.filter((record) => record.decision === 'request_changes')
      .length;
  const canAdopt =
    policy.ratificationSummary?.canAdopt ??
    (requestsForChanges === 0 && approvals >= requiredApprovals);

  return {
    requiredApprovals,
    approvals,
    requestsForChanges,
    canAdopt,
    adoptionBlockedReason:
      policy.ratificationSummary?.adoptionBlockedReason ??
      (canAdopt
        ? undefined
        : `Requires ${requiredApprovals} approval vote(s) before adoption.`),
  };
}

function isPolicyAvailableForApply(policy: RulePolicy) {
  return (
    policy.active &&
    policy.activeVersionId !== undefined &&
    policy.archived !== true
  );
}

function buildDashboardSummary() {
  const input: Parameters<typeof buildCommandCenterSummary>[0] = {
    policies: policyState.policies,
    overrides: governanceState.overrides,
  };
  if (scanState.result !== undefined) {
    input.scan = scanState.result;
  }
  if (governanceState.health !== undefined) {
    input.health = governanceState.health;
  }
  return buildCommandCenterSummary(input);
}

function loadThemePreference(): ThemePreference {
  try {
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
    if (stored === 'system' || stored === 'light' || stored === 'dark') {
      return stored;
    }
  } catch {
    // Storage can be unavailable in some embedded WebView/privacy modes.
  }
  return 'system';
}

function saveThemePreference(preference: ThemePreference) {
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, preference);
  } catch {
    // Keep the in-memory preference for this render if storage is blocked.
  }
}

function applyThemePreference() {
  if (themePreference === 'system') {
    document.documentElement.removeAttribute('data-theme');
    document.documentElement.dataset.themePreference = 'system';
    return;
  }
  document.documentElement.dataset.theme = themePreference;
  document.documentElement.dataset.themePreference = themePreference;
}

function getPrimaryActionCopy(intent: CommandCenterAction['intent']) {
  if (intent === 'load_demo') {
    return 'Start with ExampleLearning so the whole scan-policy-override-case story is visible immediately.';
  }
  if (intent === 'create_policy') {
    return 'Turn the strongest drift signal into an explicit team policy ladder.';
  }
  if (intent === 'review_overrides') {
    return 'Resolve exceptions so the team can decide whether policy or practice should change.';
  }
  if (intent === 'review_policy') {
    return 'Inspect policy health before changing the ladder.';
  }
  if (intent === 'generate_digest') {
    return 'Share the current governance status with the team.';
  }
  return 'Run a fresh Mirror Scan.';
}

function formatAction(action: string) {
  return escapeHtml(action.replaceAll('_', ' '));
}

function formatTemplateKind(kind: ResponseTemplateKind) {
  return kind
    .split('_')
    .map((part) => capitalize(part))
    .join(' ');
}

function getTemplatePlaceholder(kind: ResponseTemplateKind) {
  if (kind === 'warning') {
    return 'Hi {{target_author}}, please review {{rule_name}} before posting again.';
  }
  if (kind === 'removal_explanation') {
    return 'Removed under {{rule_name}}. Add context before reposting.';
  }
  if (kind === 'mod_note_summary') {
    return '{{rule_name}} offense {{offense_count}}. Recommended: {{recommended_action}}.';
  }
  if (kind === 'modmail_draft') {
    return '{{target_author}} reached offense {{offense_count}} for {{rule_name}}.';
  }
  return 'Private note for {{target_author}} about {{rule_name}}.';
}

function formatHealthStatus(status: PolicyHealthStatus) {
  return status.replaceAll('_', ' ');
}

function formatStepStatus(status: SetupStep['status']) {
  return status === 'complete' ? 'Done' : status === 'current' ? 'Now' : 'Next';
}

function formatPercent(value: number) {
  return `${Math.round(value * 100)}%`;
}

function formatDataMode(mode: ProductDataMode) {
  return mode === 'demo' ? 'Demo data' : mode === 'live' ? 'Live data' : 'No data';
}

function capitalize(value: string) {
  return `${value.charAt(0).toUpperCase()}${value.slice(1)}`;
}

function formatDate(value: string) {
  const timestamp = Date.parse(value);
  if (value === 'Not run yet' || Number.isNaN(timestamp)) {
    return value;
  }
  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(timestamp);
}

function cssEscape(value: string) {
  return window.CSS?.escape
    ? window.CSS.escape(value)
    : value.replaceAll('"', '\\"');
}

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function escapeAttribute(value: string) {
  return escapeHtml(value);
}

function normalizeClientError(error: unknown, fallback: string) {
  return formatClientNotice(classifyClientError(error, fallback));
}

window.addEventListener('hashchange', () => {
  activePage = getPageFromHash();
  const targetParams = getApplyTargetParamsFromHash();
  if (targetParams.targetThingId !== undefined) {
    applyState = {
      ...applyState,
      form: {
        ...applyState.form,
        ...targetParams,
      },
    };
  }
  if (window.location.hash.length > 1) {
    dashboardOpen = true;
  }
  render();
});

render();
void loadLaunchContext();
void loadHealth();
void loadRuntimeCapabilities();
void loadPolicies();
void loadGovernance();
void loadModqueueTriage();
void loadReceipts();
void loadDigestHistory();
void loadAiAdvisoryCapabilities();
void loadTeamDeliveryCapabilities();
void loadEvidenceBoards();
void loadIncidentMode();
void loadPortableConfigTemplates();
void loadPrivacyRetentionSettings();
void loadV2ProductSurfaces();

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && dashboardOpen) {
    requestInlineModeFallback();
    dashboardOpen = false;
    window.location.hash = '';
    render();
  }
});
