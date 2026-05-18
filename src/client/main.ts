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
  MESSAGE_DELIVERY_MODE_VALUES,
  OVERRIDE_REASON_VALUES,
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
import type {
  ApplyPolicyConfirmResult,
  ApplyPolicyPreview,
  ApplyPolicySource,
  ApiResponse,
  CasePacket,
  Confidence,
  ConsistencyAnalyticsSummary,
  DigestCapabilities,
  DigestHistoryResponse,
  DigestReport,
  DigestSettings,
  DriftCandidate,
  EnforcementAction,
  GenerateCasePacketRequest,
  GenerateCasePacketResponse,
  GenerateDigestResponse,
  MessageDeliveryMode,
  MirrorScan,
  MirrorScanDepth,
  OverrideReason,
  PolicyStep,
  RulePolicy,
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
  error?: string;
  result?: MirrorScan;
  warnings: string[];
};

type PolicyFormState = {
  mode: 'create' | 'edit';
  policyId?: string;
  ruleKey: string;
  ruleName: string;
  defaultMessageMode: MessageDeliveryMode;
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
  selectedAction: EnforcementAction;
  overrideReason: OverrideReason | '';
  overrideNote: string;
};

type CasePacketUiState = {
  loading: boolean;
  error: string | undefined;
  message: string | undefined;
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
  overrides: ReviewableOverrideEvent[];
  versionsByPolicy: Record<string, PolicyVersionSummary[]>;
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

const THEME_STORAGE_KEY = 'modmirror:theme-preference';
const DEVVIT_INTERNAL_MESSAGE_TYPE = 'devvit-internal';
const WEB_VIEW_CLIENT_SCOPE = 0;
const WEB_VIEW_INLINE_MODE = 1;
const WEB_VIEW_IMMERSIVE_MODE = 2;

type DevvitWebViewGlobal = {
  webViewMode?: number;
};

const pages: Page[] = [
  {
    id: 'command-center',
    label: 'Command Center',
    title: 'Command Center',
    purpose: 'A one-screen view of drift, policy health, and the next moderation governance action.',
  },
  {
    id: 'scan',
    label: 'Scan',
    title: 'Mirror Scan',
    purpose: 'Compare recent moderation actions against rules and removal reasons with confidence labels.',
  },
  {
    id: 'policies',
    label: 'Policies',
    title: 'Policies',
    purpose: 'Turn drift findings into explicit rule policy ladders that moderators can apply.',
  },
  {
    id: 'review',
    label: 'Review',
    title: 'Review',
    purpose: 'Review policy health and resolve exceptions without individual blame.',
  },
  {
    id: 'case-packets',
    label: 'Case Packets',
    title: 'Case Packets',
    purpose: 'Generate appeal context rooted in policy versions, tracked actions, and deterministic comparable cases.',
  },
  {
    id: 'digest',
    label: 'Digest',
    title: 'Digest',
    purpose: 'Generate a manual Markdown governance digest for the mod team.',
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
let activePage: ProductPageId = dashboardOpen ? getPageFromHash() : 'command-center';
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
  error: undefined,
  message: undefined,
  packet: undefined,
};
let governanceState: GovernanceUiState = {
  loading: false,
  savingOverrideId: undefined,
  error: undefined,
  message: undefined,
  health: undefined,
  analytics: undefined,
  overrides: [],
  versionsByPolicy: {},
};
let digestState: DigestUiState = {
  loading: false,
  error: undefined,
  history: [],
  message: undefined,
};

function getPageFromHash(): ProductPageId {
  const candidate = getHashRoute().page;
  return pages.some((page) => page.id === candidate)
    ? (candidate as ProductPageId)
    : 'command-center';
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
  return {
    targetThingId,
    targetAuthor: targetAuthor || '',
  };
}

function emptyPolicyForm(): PolicyFormState {
  return {
    mode: 'create',
    ruleKey: '',
    ruleName: '',
    defaultMessageMode: 'log_only',
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
    selectedAction: 'remove',
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
      id: 'command-center',
      label: 'Command Center',
      title: 'Command Center',
      purpose:
        'A one-screen view of drift, policy health, and the next moderation governance action.',
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

function renderPage(pageId: ProductPageId) {
  switch (pageId) {
    case 'command-center':
      return renderCommandCenterPage();
    case 'scan':
      return renderScanPage();
    case 'policies':
      return renderPoliciesPage();
    case 'review':
      return renderReviewPage();
    case 'case-packets':
      return renderCasePacketPage();
    case 'digest':
      return renderDigestPage();
    case 'settings':
      return renderSettingsPage();
  }
}

function renderCommandCenterPage() {
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
    <section class="command-board" aria-label="Command center summary">
      <div class="command-primary">
        <div class="score-block" style="--score: ${summary.consistencyScore}%">
          <span class="score-label">Consistency score</span>
          <strong>${summary.consistencyScore}<span>/100</span></strong>
          <p>${escapeHtml(summary.topIssue)}</p>
        </div>

        <div class="next-action">
          <h3>${escapeHtml(summary.primaryAction.label)}</h3>
          <p>${getPrimaryActionCopy(summary.primaryAction.intent)}</p>
          <button class="primary-button" data-action-intent="${summary.primaryAction.intent}" type="button">${escapeHtml(summary.primaryAction.label)}</button>
        </div>
      </div>

      <div class="command-secondary">
        <dl class="signal-list">
          ${renderCommandSignal('Data mode', formatDataMode(summary.dataMode))}
          ${renderCommandSignal('Unresolved overrides', summary.unresolvedOverrideCount.toString())}
          ${renderCommandSignal('Active policies', summary.activePolicyCount.toString())}
          ${renderCommandSignal('Last scan', formatDate(summary.lastScanLabel))}
        </dl>
        <div class="secondary-actions">
          ${summary.secondaryActions
            .map(
              (action) =>
                `<button class="secondary-button" data-action-intent="${action.intent}" type="button">${escapeHtml(action.label)}</button>`
            )
            .join('')}
        </div>
      </div>
    </section>

    <section class="workflow-board">
      ${renderSetupWizard(setupSteps)}
      ${renderDemoScenario()}
    </section>
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

function renderDriftCandidates(candidates: DriftCandidate[]) {
  if (candidates.length === 0) {
    return renderEmptyState(
      'No drift candidates yet',
      'Create a policy now or keep scanning as more moderation history accumulates.',
      [{ label: 'Create Policy', page: 'policies', intent: 'create_policy' }]
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

function renderPoliciesPage() {
  return `
    <section class="section-panel">
      <div class="section-header">
        <div>
          <h3>Policy Agreement Flow</h3>
          <p>Policies are versioned and use local rule keys because Devvit rule IDs are not stable in current typings.</p>
          ${renderPolicyMessage()}
        </div>
        <div class="button-row">
          <button class="secondary-button" data-load-policies type="button">Refresh</button>
          <button class="primary-button" data-reset-policy-form type="button">Manual Policy</button>
        </div>
      </div>
    </section>
    ${renderPolicyFallback()}
    ${renderPolicyList()}
    ${renderDriftPolicyPanel()}
    <section class="policy-workbench">
      ${renderPolicyForm()}
      ${renderApplyPolicyPanel()}
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

function renderPolicyFallback() {
  if (policyState.policies.length > 0) {
    return '';
  }
  return renderEmptyState(
    'No policies yet',
    'Create your first policy from a drift candidate or load the ExampleLearning demo scenario.',
    [
      { label: 'Load Demo Scenario', page: 'scan', intent: 'load_demo' },
      { label: 'Create Policy', page: 'policies', intent: 'create_policy' },
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

function renderPolicyCard(policy: RulePolicy) {
  const lifecycle = policy.lifecycleState ?? (policy.active ? 'adopted' : 'draft');
  const reviews = policy.reviewRecords ?? [];
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
        <div><dt>Reviews</dt><dd>${reviews.length}</dd></div>
        <div><dt>Updated</dt><dd>${formatDate(policy.updatedAt)}</dd></div>
      </dl>
      <div class="button-row">
        <button class="secondary-button" data-edit-policy="${escapeAttribute(policy.id)}" type="button">${policy.active ? 'Draft revision' : 'Edit draft'}</button>
        ${renderPolicyLifecycleButtons(policy)}
        <button class="secondary-button" data-action-intent="review_policy" type="button">Review health</button>
      </div>
    </article>
  `;
}

function renderPolicyLifecycleButtons(policy: RulePolicy) {
  const lifecycle = policy.lifecycleState ?? (policy.active ? 'adopted' : 'draft');
  const policyId = escapeAttribute(policy.id);
  if (lifecycle === 'draft') {
    return `<button class="secondary-button" data-propose-policy="${policyId}" type="button">Propose</button>`;
  }
  if (lifecycle === 'proposed' || lifecycle === 'under_review') {
    return `
      <button class="secondary-button" data-review-policy="${policyId}" data-review-decision="approve" type="button">Approve</button>
      <button class="secondary-button" data-review-policy="${policyId}" data-review-decision="request_changes" type="button">Request changes</button>
      <button class="primary-button" data-adopt-policy="${policyId}" type="button">Quick adopt</button>
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
    </fieldset>
  `;
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
      ${renderApplyForm()}
      ${renderApplyPreview()}
    </section>
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
      [{ label: 'Create Policy', page: 'policies', intent: 'create_policy' }]
    );
  }

  const activePolicies = policyState.policies.filter((policy) => policy.active);
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
      ${
        applyState.result
          ? `<p class="inline-success">Receipt ${escapeHtml(applyState.result.receipt.id)} recorded${applyState.result.overrideEvent ? ' with override reason' : ''}. ${escapeHtml(formatExecutionResult(applyState.result))}</p>
             <button class="secondary-button" data-case-from-action="${escapeAttribute(applyState.result.actionEvent.id)}" type="button">Generate case packet</button>`
          : ''
      }
    </article>
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
    ${renderGovernanceOverview()}
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

function renderGovernanceOverview() {
  const health = governanceState.health;
  if (governanceState.loading && !health) {
    return renderLoadingState('Loading review data', 'Reading policy health, overrides, and version summaries.');
  }
  if (!health) {
    return renderEmptyState(
      'No review data yet',
      'Create policies and log Apply Policy actions. Review cards will appear as exceptions accumulate.',
      [{ label: 'Create Policy', page: 'policies', intent: 'create_policy' }]
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

function renderPolicyHealthCards() {
  const summaries = governanceState.health?.summaries ?? [];
  if (summaries.length === 0) {
    return renderEmptyState(
      'Policy health has no signal yet',
      'Run the policy workflow to create enough tracked actions for health scoring.',
      [{ label: 'Apply Sample', page: 'policies', intent: 'review_policy' }]
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
      [{ label: 'Generate Digest', page: 'digest', intent: 'generate_digest' }]
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
    </article>
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
        </div>
        <button class="secondary-button" data-copy-case-markdown type="button">Copy Markdown</button>
      </div>
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
        [{ label: 'Generate Digest', page: 'digest', intent: 'generate_digest' }]
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
  return `
    <section class="settings-grid">
      ${renderSettingsCard('Appearance', capitalize(themePreference), themePreference === 'system' ? 'Following the WebView system color-scheme signal. Use the header control to force light or dark mode.' : `Forced ${themePreference} mode for this browser session.`)}
      ${renderSettingsCard('Data mode', formatDataMode(summary.dataMode), summary.dataMode === 'demo' ? 'Demo data is labeled and separate from live subreddit data.' : 'Live scans depend on Reddit API availability.')}
      ${renderSettingsCard('Redis status', health?.redis.smokeStatus ?? 'not checked', health?.redis.detail ?? healthError ?? 'Health endpoint not loaded yet.')}
      ${renderSettingsCard('Reddit source status', health?.environment.playtestStatus ?? 'not runtime verified', 'Rules, removal reasons, and mod log reads are type/build-verified; broader runtime smoke is still documented in RESEARCH.md.')}
      ${renderSettingsCard('Last scan', formatDate(summary.lastScanLabel), `${scanState.result?.totalActionsScanned ?? 0} actions scanned in current dashboard state.`)}
      ${renderSettingsCard('Policies', summary.activePolicyCount.toString(), `${policyState.policies.length} policies loaded in this session.`)}
      ${renderSettingsCard('Overrides', summary.unresolvedOverrideCount.toString(), 'Unresolved override count is aggregate-first.')}
      ${renderSettingsCard('Delivery mode', 'log only', 'Public comments, private messages, modmail, and native Mod Notes remain disabled as default delivery until playtest-verified.')}
      ${renderSettingsCard('Digest history', digestState.history.length.toString(), digestState.settings?.lastGeneratedAt ? `Last generated ${formatDate(digestState.settings.lastGeneratedAt)}.` : 'No saved digest history in this subreddit yet.')}
      ${renderSettingsCard('Digest mod discussion', digestState.capabilities?.modDiscussion.state ?? 'unverified', digestState.capabilities?.modDiscussion.detail ?? 'Capability status loads from the digest runtime endpoint.')}
      ${renderSettingsCard('Digest scheduler', digestState.capabilities?.scheduler.state ?? 'unverified', digestState.capabilities?.scheduler.detail ?? 'Weekly scheduling remains opt-in and disabled until runtime-verified.')}
      ${renderSettingsCard('Demo subreddit', `r/${DEMO_SUBREDDIT_NAME}`, 'ExampleLearning contains seeded Rule 2 drift for screenshots and the 3-minute demo.')}
    </section>
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
      </div>
    </section>
  `;
}

function bindAllActions() {
  bindNavigation();
  bindAppearanceActions();
  bindActionIntents();
  bindScanActions();
  bindPolicyActions();
  bindApplyPolicyActions();
  bindCasePacketActions();
  bindGovernanceActions();
  bindDigestActions();
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
  if (intent === 'create_policy') {
    activePage = 'policies';
    window.location.hash = '#policies';
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
    activePage = 'digest';
    window.location.hash = '#digest';
    void generateDigest();
  }
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
        activePage = 'policies';
        window.location.hash = '#policies';
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
        activePage = 'policies';
        window.location.hash = '#policies';
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
        void transitionPolicyLifecycle(policyId, 'adopt');
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
    window.location.hash = '#command-center';
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
    scanState = {
      loading: false,
      mode,
      depth,
      result: payload,
      warnings: payload.warnings,
    };
  } catch (error) {
    if (mode === 'demo') {
      const payload = createClientPreviewDemoScan();
      scanState = {
        loading: false,
        mode,
        depth,
        result: payload,
        warnings: payload.warnings,
      };
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
    createdAt: DEMO_POLICY.createdAt,
    updatedAt: now,
  };
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

  return {
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
    targetSnapshot: {
      targetThingId: payload.targetThingId,
      targetType: payload.targetThingId.startsWith('t1_') ? 'comment' : 'post',
      subreddit: DEMO_SUBREDDIT_NAME,
      authorName: payload.targetAuthor,
      source: 'provided',
      warnings: ['Demo fallback preview uses seeded client data only.'],
    },
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
    recommendation: {
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
    },
  };
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
  if (preview.policySnapshot !== undefined) {
    result.receipt.policySnapshot = preview.policySnapshot;
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
    const [healthOverview, policies, overrides, analytics] = await Promise.all([
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
    ]);
    const versionsByPolicy = await loadPolicyVersions(policies);
    policyState = {
      ...policyState,
      policies,
    };
    governanceState = {
      ...governanceState,
      loading: false,
      health: healthOverview,
      analytics,
      overrides,
      versionsByPolicy,
    };
  } catch (error) {
    if (canUseClientDemoFallback()) {
      const demoOverrides = createClientDemoOverrides();
      governanceState = {
        ...governanceState,
        loading: false,
        health: createClientDemoHealth(),
        analytics: createClientDemoAnalytics(),
        overrides: ruleKey
          ? demoOverrides.filter((event) => event.ruleKey === ruleKey)
          : demoOverrides,
        versionsByPolicy: createClientDemoVersions(),
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
  const response = await fetch(url, init);
  const payload = (await response.json()) as ApiResponse<T>;
  if (!payload.ok) {
    throw new Error(payload.error.message);
  }
  return payload.data;
}

async function generateCasePacket(
  subject: GenerateCasePacketRequest['subject']
) {
  casePacketState = {
    ...casePacketState,
    loading: true,
    error: undefined,
    message: undefined,
  };
  dashboardOpen = true;
  activePage = 'case-packets';
  window.location.hash = '#case-packets';
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
      error: undefined,
      message: 'Case packet generated.',
      packet: data.packet,
    };
  } catch (error) {
    if (subject.type === 'demo' && canUseClientDemoFallback()) {
      casePacketState = {
        loading: false,
        error: undefined,
        message: 'Demo case packet generated.',
        packet: createClientDemoCasePacket(),
      };
      render();
      return;
    }

    casePacketState = {
      ...casePacketState,
      loading: false,
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
    await navigator.clipboard.writeText(markdown);
    casePacketState = {
      ...casePacketState,
      message: 'Markdown copied to clipboard.',
      error: undefined,
    };
  } catch {
    casePacketState = {
      ...casePacketState,
      message: 'Markdown is ready in the export textarea.',
      error: undefined,
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
    activePage = 'policies';
    window.location.hash = '#policies';
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
      activePage = 'policies';
      window.location.hash = '#policies';
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
  decision?: 'approve' | 'request_changes'
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
              quickAdoption: true,
              note: 'Single-mod quick adoption recorded.',
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

async function fetchPolicyLifecycle(
  policyId: string,
  suffix: string,
  body: Record<string, unknown>
): Promise<RulePolicy> {
  const response = await fetch(
    withWorkspaceSubreddit(`${API_ROUTES.policies}/${policyId}/${suffix}`),
    {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
    }
  );
  const payload = (await response.json()) as ApiResponse<RulePolicy>;
  if (!payload.ok) {
    throw new Error(payload.error.message);
  }
  return payload.data;
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
      updatedAt: now,
    };
  }
  return {
    ...policy,
    lifecycleState: 'proposed',
    proposedBy: 'demo-lead-mod',
    proposedAt: now,
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
      message: 'Policy action recorded in log-only mode.',
    };
    await loadGovernance();
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
    await navigator.clipboard.writeText(markdown);
    digestState = { ...digestState, message: 'Digest copied to clipboard.' };
  } catch {
    digestState = { ...digestState, message: 'Digest is ready in the textarea.' };
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
    selectedAction: EnforcementAction;
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
    source: getApplyPolicySource(String(formData.get('targetThingId') ?? '')),
  };
  const selectedPolicy = policyState.policies.find(
    (policy) => policy.ruleKey === ruleKey
  );
  if (selectedPolicy !== undefined) {
    payload.subreddit = selectedPolicy.subreddit;
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

function applyFormDataToState(formData: FormData): ApplyFormState {
  const overrideReason = String(formData.get('overrideReason') ?? '');

  return {
    ruleKey: String(formData.get('ruleKey') ?? ''),
    targetThingId: String(formData.get('targetThingId') ?? ''),
    targetAuthor: String(formData.get('targetAuthor') ?? ''),
    selectedAction: String(
      formData.get('selectedAction') ?? 'manual_review'
    ) as EnforcementAction,
    overrideReason: overrideReason ? (overrideReason as OverrideReason) : '',
    overrideNote: String(formData.get('overrideNote') ?? ''),
  };
}

function formDataToPolicy(formData: FormData) {
  const steps = policyState.form.steps.map((step, index) => ({
    offenseCount: step.offenseCount,
    windowDays: Number(formData.get(`windowDays-${index}`) ?? step.windowDays),
    recommendedAction: String(
      formData.get(`recommendedAction-${index}`) ?? step.recommendedAction
    ) as EnforcementAction,
    requireOverrideReasonForDeviation:
      formData.get(`requireOverride-${index}`) === 'on',
  }));

  const policy = {
    ruleKey: String(formData.get('ruleKey') ?? '').trim(),
    ruleName: String(formData.get('ruleName') ?? '').trim(),
    defaultMessageMode: String(
      formData.get('defaultMessageMode') ?? 'log_only'
    ) as MessageDeliveryMode,
    steps,
    active: true,
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
  const message = error instanceof Error ? error.message : '';
  if (
    message.includes('Unexpected token') ||
    message.includes('<!DOCTYPE') ||
    message.includes('returned 404')
  ) {
    return `${fallback} Run the app through Devvit playtest for live API data.`;
  }
  return message || fallback;
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
void loadHealth();
void loadPolicies();
void loadGovernance();
void loadDigestHistory();

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && dashboardOpen) {
    requestInlineModeFallback();
    dashboardOpen = false;
    window.location.hash = '';
    render();
  }
});
