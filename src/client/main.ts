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
  generateManualDigest,
  type CommandCenterAction,
  type ProductDataMode,
  type ProductPageId,
  type SetupStep,
} from '../shared/productization';
import type {
  ApplyPolicyConfirmResult,
  ApplyPolicyPreview,
  ApiResponse,
  CasePacket,
  Confidence,
  DriftCandidate,
  EnforcementAction,
  GenerateCasePacketRequest,
  GenerateCasePacketResponse,
  MessageDeliveryMode,
  MirrorScan,
  OverrideReason,
  PolicyStep,
  RulePolicy,
} from '../shared/schema';
import './styles.css';

type ScanMode = 'live' | 'demo';
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
  preview: ApplyPolicyPreview | undefined;
  result: ApplyPolicyConfirmResult | undefined;
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
  overrides: ReviewableOverrideEvent[];
  versionsByPolicy: Record<string, PolicyVersionSummary[]>;
};

type DigestUiState = {
  markdown: string;
  generatedAt?: string;
  message?: string;
};

type DevvitWebViewGlobal = {
  entrypoints?: Record<string, string>;
  token?: string;
  webViewMode?: number;
};

const DEVVIT_INTERNAL_MESSAGE_TYPE = 'devvit-internal';
const EFFECT_WEB_VIEW = 9;
const WEB_VIEW_INLINE_MODE = 1;
const WEB_VIEW_IMMERSIVE_MODE = 2;

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
let activePage: ProductPageId = getPageFromHash();
let dashboardOpen = window.location.hash.length > 1;
let expandedModeMessage: string | undefined;
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
  overrides: [],
  versionsByPolicy: {},
};
let digestState: DigestUiState = {
  markdown: '',
};

function getPageFromHash(): ProductPageId {
  const candidate = window.location.hash.replace('#', '');
  return pages.some((page) => page.id === candidate)
    ? (candidate as ProductPageId)
    : 'command-center';
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

  appRoot.innerHTML = `
    <div class="mm-shell">
      <header class="mm-header">
        <div>
          <h1>${APP_NAME}</h1>
          <p>${APP_TAGLINE}</p>
        </div>
        <div class="mode-stack">
          <span class="status-badge ${summary.dataMode === 'demo' ? 'status-watch' : 'status-neutral'}">${formatDataMode(summary.dataMode)}</span>
          <span>${escapeHtml(health?.app.version ?? 'local build')}</span>
        </div>
      </header>

      <nav class="mm-nav" aria-label="ModMirror sections">
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

      <main class="mm-main">
        <section class="page-heading">
          <div>
            <h2>${page.title}</h2>
            <p>${page.purpose}</p>
          </div>
          ${renderPageAction(page.id)}
        </section>
        ${renderExpandedModeMessage()}
        ${renderPage(page.id)}
      </main>
    </div>
  `;

  bindAllActions();
}

function renderInlineLaunchCard() {
  const summary = buildDashboardSummary();
  appRoot.innerHTML = `
    <main class="inline-shell">
      <section class="inline-card" aria-label="ModMirror launch card">
        <div class="inline-card-main">
          <div>
            <h1>${APP_NAME}</h1>
            <p>${APP_TAGLINE}</p>
          </div>
          <span class="status-badge ${summary.dataMode === 'demo' ? 'status-watch' : 'status-neutral'}">${formatDataMode(summary.dataMode)}</span>
        </div>
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
  if (pageId === 'scan') {
    return `<button class="primary-button" data-run-scan="live" type="button">Run Scan</button>`;
  }
  if (pageId === 'policies') {
    return `<button class="primary-button" data-reset-policy-form type="button">Create Policy</button>`;
  }
  if (pageId === 'review') {
    return `<button class="secondary-button" data-load-governance type="button">Refresh Review</button>`;
  }
  if (pageId === 'case-packets') {
    return `<button class="primary-button" data-generate-demo-case type="button">Generate Demo Packet</button>`;
  }
  if (pageId === 'digest') {
    return `<button class="primary-button" data-generate-digest type="button">Generate Now</button>`;
  }
  if (pageId === 'settings') {
    return `<button class="secondary-button" data-load-health type="button">Refresh Status</button>`;
  }
  return '';
}

function renderExpandedModeMessage() {
  return expandedModeMessage
    ? `<p class="inline-note">${escapeHtml(expandedModeMessage)}</p>`
    : '';
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
    <section class="command-grid">
      <article class="command-score">
        <span>Consistency Score</span>
        <strong>${summary.consistencyScore}</strong>
        <p>${escapeHtml(summary.topIssue)}</p>
      </article>
      ${renderMetricCard('Unresolved overrides', summary.unresolvedOverrideCount.toString())}
      ${renderMetricCard('Active policies', summary.activePolicyCount.toString())}
      ${renderMetricCard('Last scan', formatDate(summary.lastScanLabel))}
    </section>

    <section class="action-strip">
      <div>
        <h3>${escapeHtml(summary.primaryAction.label)}</h3>
        <p>${getPrimaryActionCopy(summary.primaryAction.intent)}</p>
      </div>
      <div class="button-row">
        <button class="primary-button" data-action-intent="${summary.primaryAction.intent}" type="button">${escapeHtml(summary.primaryAction.label)}</button>
        ${summary.secondaryActions
          .map(
            (action) =>
              `<button class="secondary-button" data-action-intent="${action.intent}" type="button">${escapeHtml(action.label)}</button>`
          )
          .join('')}
      </div>
    </section>

    ${renderSetupWizard(setupSteps)}
    ${renderDemoScenario()}
  `;
}

function renderSetupWizard(steps: SetupStep[]) {
  return `
    <section class="section-panel">
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
    </section>
  `;
}

function renderDemoScenario() {
  return `
    <section class="section-panel demo-story">
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
    </section>
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
          <button class="primary-button" data-run-scan="live" ${scanState.loading ? 'disabled' : ''} type="button">Run Live Scan</button>
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
      ${renderMetricCard('Actions scanned', scan.totalActionsScanned.toString())}
      ${renderMetricCard('Attributed', scan.attributedCount.toString())}
      ${renderMetricCard('Unmatched', scan.unmatchedCount.toString())}
    </section>
    <section class="section-panel">
      <div class="section-header">
        <div>
          <h3>Confidence Breakdown</h3>
          <p>Historical rule labels remain inferred and confidence-scored.</p>
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
    ${renderPolicyForm()}
    ${renderApplyPolicyPanel()}
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
  return `
    <article class="action-card">
      <div class="card-header">
        <div>
          <h3>${escapeHtml(policy.ruleName)}</h3>
          <p>${escapeHtml(policy.ruleKey)}</p>
        </div>
        <span class="status-badge ${policy.active ? 'status-good' : 'status-neutral'}">${policy.active ? 'Active' : 'Inactive'}</span>
      </div>
      <dl class="compact-metrics">
        <div><dt>Steps</dt><dd>${policy.steps.length}</dd></div>
        <div><dt>Delivery</dt><dd>${formatAction(policy.defaultMessageMode)}</dd></div>
        <div><dt>Version</dt><dd>${policy.activeVersionNumber ?? 1}</dd></div>
        <div><dt>Updated</dt><dd>${formatDate(policy.updatedAt)}</dd></div>
      </dl>
      <div class="button-row">
        <button class="secondary-button" data-edit-policy="${escapeAttribute(policy.id)}" type="button">Edit policy</button>
        <button class="secondary-button" data-action-intent="review_policy" type="button">Review health</button>
      </div>
    </article>
  `;
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
          <p>Use log-only delivery until public comment behavior is playtest-verified.</p>
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
          ${form.mode === 'edit' ? 'Save policy' : 'Create policy'}
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

  return `
    <form class="policy-form apply-form" data-apply-form>
      <label>
        Policy
        <select name="ruleKey">
          ${policyState.policies
            .filter((policy) => policy.active)
            .map(
              (policy) =>
                `<option value="${policy.ruleKey}">${escapeHtml(policy.ruleName)}</option>`
            )
            .join('')}
        </select>
      </label>
      <label>
        Target thing ID
        <input name="targetThingId" value="t3_demo_policy_target" required>
      </label>
      <label>
        Target author
        <input name="targetAuthor" value="learner_1" required>
      </label>
      <label>
        Selected action
        <select name="selectedAction">
          ${ENFORCEMENT_ACTION_VALUES.map(
            (action) => `<option value="${action}">${formatAction(action)}</option>`
          ).join('')}
        </select>
      </label>
      <label>
        Override reason
        <select name="overrideReason">
          <option value="">Only required on deviation</option>
          ${OVERRIDE_REASON_VALUES.map(
            (reason) => `<option value="${reason}">${formatAction(reason)}</option>`
          ).join('')}
        </select>
      </label>
      <label>
        Override note
        <input name="overrideNote" placeholder="Optional context for review">
      </label>
      <div class="button-row">
        <button class="secondary-button" type="button" data-apply-preview ${applyState.loading ? 'disabled' : ''}>Preview</button>
        <button class="primary-button" type="submit" ${applyState.confirming ? 'disabled' : ''}>Confirm log-only action</button>
      </div>
    </form>
  `;
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
      ${
        applyState.result
          ? `<p class="inline-success">Policy action logged${applyState.result.overrideEvent ? ' with override reason' : ''}.</p>
             <button class="secondary-button" data-case-from-action="${escapeAttribute(applyState.result.actionEvent.id)}" type="button">Generate case packet</button>`
          : ''
      }
    </article>
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
    ${renderPolicyHealthCards()}
    ${renderOverrideInbox()}
    ${renderPolicyVersionSummary()}
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
  return `
    <article class="inbox-card">
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
  return `
    <button class="secondary-button compact-button" data-review-override="${escapeAttribute(event.id)}" data-review-status="${status}" ${governanceState.savingOverrideId === event.id ? 'disabled' : ''} type="button">
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
          Tracked action ID
          <input name="actionId" placeholder="Paste an Apply Policy action ID">
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
      [{ label: 'Generate Demo Packet', page: 'case-packets', intent: 'review_policy' }]
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
    <section class="metric-grid" aria-label="Case packet summary">
      ${renderMetricCard('Posture', formatAction(packet.appealPosture))}
      ${renderMetricCard('Consistency', formatAction(packet.consistencyStatus))}
      ${renderMetricCard('Policy version', packet.policyContext.policyVersionNumber?.toString() ?? 'Unavailable')}
      ${renderMetricCard('Comparables', packet.comparableCases.length.toString())}
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
        <div><dt>Created</dt><dd>${escapeHtml(action?.createdAt ? formatDate(action.createdAt) : 'Unavailable')}</dd></div>
        <div><dt>Rule</dt><dd>${escapeHtml(action?.ruleName ?? action?.ruleKey ?? 'Unavailable')}</dd></div>
        <div><dt>Recommended</dt><dd>${formatAction(action?.recommendedAction ?? 'unavailable')}</dd></div>
        <div><dt>Selected</dt><dd>${formatAction(action?.selectedAction ?? 'unavailable')}</dd></div>
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
        <strong>Caveats</strong>
        <ul>${packet.caveats.map((caveat) => `<li>${escapeHtml(caveat)}</li>`).join('')}</ul>
      </div>
    </article>
  `;
}

function renderDigestPage() {
  return `
    <section class="section-panel">
      <div class="section-header">
        <div>
          <h3>Manual Digest</h3>
          <p>Generate a team-ready Markdown summary. Scheduler is intentionally out of scope for this wave.</p>
          ${digestState.message ? `<p class="inline-success">${escapeHtml(digestState.message)}</p>` : ''}
        </div>
        <div class="button-row">
          <button class="primary-button" data-generate-digest type="button">Generate Now</button>
          <button class="secondary-button" data-copy-digest type="button" ${digestState.markdown ? '' : 'disabled'}>Copy Markdown</button>
        </div>
      </div>
      ${
        digestState.markdown
          ? `<textarea class="markdown-export" readonly>${escapeHtml(digestState.markdown)}</textarea>`
          : renderEmptyState(
              'No digest generated yet',
              'Generate a manual digest after loading demo data or running a scan.',
              [{ label: 'Generate Digest', page: 'digest', intent: 'generate_digest' }]
            )
      }
    </section>
  `;
}

function renderSettingsPage() {
  const summary = buildDashboardSummary();
  return `
    <section class="settings-grid">
      ${renderSettingsCard('Data mode', formatDataMode(summary.dataMode), summary.dataMode === 'demo' ? 'Demo data is labeled and separate from live subreddit data.' : 'Live scans depend on Reddit API availability.')}
      ${renderSettingsCard('Redis status', health?.redis.smokeStatus ?? 'not checked', health?.redis.detail ?? healthError ?? 'Health endpoint not loaded yet.')}
      ${renderSettingsCard('Reddit source status', health?.environment.playtestStatus ?? 'not runtime verified', 'Rules, removal reasons, and mod log reads are type/build-verified; broader runtime smoke is still documented in RESEARCH.md.')}
      ${renderSettingsCard('Last scan', formatDate(summary.lastScanLabel), `${scanState.result?.totalActionsScanned ?? 0} actions scanned in current dashboard state.`)}
      ${renderSettingsCard('Policies', summary.activePolicyCount.toString(), `${policyState.policies.length} policies loaded in this session.`)}
      ${renderSettingsCard('Overrides', summary.unresolvedOverrideCount.toString(), 'Unresolved override count is aggregate-first.')}
      ${renderSettingsCard('Delivery mode', 'log only', 'Public comments, private messages, modmail, and native Mod Notes remain disabled as default delivery until playtest-verified.')}
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

function bindNavigation() {
  document.querySelectorAll<HTMLButtonElement>('[data-page]').forEach((button) => {
    button.addEventListener('click', () => {
      const nextPage = button.dataset.page;
      if (nextPage && pages.some((page) => page.id === nextPage)) {
        activePage = nextPage as ProductPageId;
        window.location.hash = `#${activePage}`;
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
    generateDigest();
  }
}

function bindScanActions() {
  document
    .querySelectorAll<HTMLButtonElement>('[data-run-scan]')
    .forEach((button) => {
      button.addEventListener('click', () => {
        const mode = button.dataset.runScan === 'demo' ? 'demo' : 'live';
        void runScan(mode);
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
      generateDigest();
    });
  });
  document.querySelectorAll<HTMLButtonElement>('[data-copy-digest]').forEach((button) => {
    button.addEventListener('click', () => {
      void copyDigestMarkdown();
    });
  });
}

function openDashboard(event: MouseEvent) {
  try {
    if (getCurrentWebViewMode() === 'inline') {
      requestExpandedModeFallback(event, 'default');
      expandedModeMessage =
        'Expanded dashboard requested. If Reddit keeps this view inline, the full dashboard is available here.';
    }
  } catch (error) {
    expandedModeMessage =
      error instanceof Error
        ? `Expanded mode fallback active: ${error.message}`
        : 'Expanded mode fallback active.';
  }
  dashboardOpen = true;
  activePage = 'command-center';
  window.location.hash = '#command-center';
  render();
}

async function runScan(mode: ScanMode) {
  scanState = {
    loading: true,
    mode,
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
      body: JSON.stringify({ mode }),
    });
    scanState = {
      loading: false,
      mode,
      result: payload,
      warnings: payload.warnings,
    };
  } catch (error) {
    scanState = {
      loading: false,
      mode,
      error: error instanceof Error ? error.message : 'Unknown scan error',
      warnings: [],
    };
  }

  render();
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
      error instanceof Error ? error.message : 'Unknown health fetch error';
  }

  render();
}

async function loadPolicies() {
  policyState = { ...policyState, loading: true, error: undefined };
  render();

  try {
    const policies = await fetchApi<RulePolicy[]>(API_ROUTES.policies);
    policyState = {
      ...policyState,
      loading: false,
      policies,
    };
  } catch (error) {
    policyState = {
      ...policyState,
      loading: false,
      error: error instanceof Error ? error.message : 'Policy fetch failed',
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
    const [healthOverview, policies, overrides] = await Promise.all([
      fetchApi<PolicyHealthOverview>(API_ROUTES.policyHealth),
      fetchApi<RulePolicy[]>(API_ROUTES.policies),
      fetchApi<ReviewableOverrideEvent[]>(
        ruleKey
          ? `${API_ROUTES.overrides}?status=unresolved&ruleKey=${encodeURIComponent(ruleKey)}`
          : `${API_ROUTES.overrides}?status=unresolved`
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
      overrides,
      versionsByPolicy,
    };
  } catch (error) {
    governanceState = {
      ...governanceState,
      loading: false,
      error:
        error instanceof Error
          ? error.message
          : 'Governance data fetch failed',
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
            `${API_ROUTES.policies}/${policy.id}/versions`
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
      `${API_ROUTES.overrides}/${encodeURIComponent(overrideId)}/review`,
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
      error:
        error instanceof Error ? error.message : 'Override review update failed',
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
    const data = await fetchApi<GenerateCasePacketResponse>(
      API_ROUTES.casePacket,
      {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          subject,
          timeWindowDays: 30,
          maxComparableCases: 5,
        } satisfies GenerateCasePacketRequest),
      }
    );
    casePacketState = {
      loading: false,
      error: undefined,
      message: 'Case packet generated.',
      packet: data.packet,
    };
  } catch (error) {
    casePacketState = {
      ...casePacketState,
      loading: false,
      error:
        error instanceof Error ? error.message : 'Case packet generation failed',
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
      message: `Policy created for ${payload.data.ruleName}.`,
      form: policyToForm(payload.data),
    };
  } catch (error) {
    policyState = {
      ...policyState,
      saving: false,
      error:
        error instanceof Error ? error.message : 'Create-from-drift failed',
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
        ? `${API_ROUTES.policies}/${policyState.form.policyId}`
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
      message: `Policy saved for ${payload.data.ruleName}.`,
      form: policyToForm(payload.data),
    };
  } catch (error) {
    policyState = {
      ...policyState,
      saving: false,
      error: error instanceof Error ? error.message : 'Policy save failed',
    };
  }

  render();
}

async function previewApplyPolicy(formData: FormData) {
  applyState = {
    ...applyState,
    loading: true,
    error: undefined,
    message: undefined,
  };
  render();

  try {
    const preview = await fetchApi<ApplyPolicyPreview>(
      API_ROUTES.applyPolicyPreview,
      {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(applyFormDataToPayload(formData, false)),
      }
    );
    applyState = {
      ...applyState,
      loading: false,
      preview,
      result: undefined,
    };
  } catch (error) {
    applyState = {
      ...applyState,
      loading: false,
      error:
        error instanceof Error ? error.message : 'Apply Policy preview failed',
    };
  }

  render();
}

async function confirmApplyPolicy(formData: FormData) {
  applyState = {
    ...applyState,
    confirming: true,
    error: undefined,
    message: undefined,
  };
  render();

  try {
    const result = await fetchApi<ApplyPolicyConfirmResult>(
      API_ROUTES.applyPolicyConfirm,
      {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(applyFormDataToPayload(formData, true)),
      }
    );
    applyState = {
      ...applyState,
      confirming: false,
      preview: {
        recommendation: result.recommendation,
      },
      result,
      message: 'Policy action recorded in log-only mode.',
    };
    await loadGovernance();
  } catch (error) {
    applyState = {
      ...applyState,
      confirming: false,
      error:
        error instanceof Error ? error.message : 'Apply Policy confirm failed',
    };
    render();
  }
}

function generateDigest() {
  const generatedAt = new Date().toISOString();
  const summary = buildDashboardSummary();
  const digestInput: Parameters<typeof generateManualDigest>[0] = {
    generatedAt,
    dataMode: summary.dataMode,
    summary,
    caveats: [
      'Historical moderation-log attribution is inferred and confidence-scored.',
      'Delivery remains log-only until public comment behavior is playtest-verified.',
      'Digest is generated manually; no scheduler is enabled in this wave.',
    ],
  };
  if (governanceState.health !== undefined) {
    digestInput.health = governanceState.health;
  }
  digestState = {
    generatedAt,
    markdown: generateManualDigest(digestInput),
    message: 'Manual digest generated.',
  };
  render();
}

async function copyDigestMarkdown() {
  if (!digestState.markdown) {
    return;
  }
  try {
    await navigator.clipboard.writeText(digestState.markdown);
    digestState = { ...digestState, message: 'Digest copied to clipboard.' };
  } catch {
    digestState = { ...digestState, message: 'Digest is ready in the textarea.' };
  }
  render();
}

function applyFormDataToPayload(formData: FormData, includeOverride: boolean) {
  const payload: {
    ruleKey: string;
    targetThingId: string;
    targetAuthor: string;
    selectedAction: EnforcementAction;
    source: 'simulator';
    overrideReason?: OverrideReason;
    overrideNote?: string;
  } = {
    ruleKey: String(formData.get('ruleKey') ?? ''),
    targetThingId: String(formData.get('targetThingId') ?? ''),
    targetAuthor: String(formData.get('targetAuthor') ?? ''),
    selectedAction: String(
      formData.get('selectedAction') ?? 'manual_review'
    ) as EnforcementAction,
    source: 'simulator',
  };

  if (includeOverride) {
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

  return {
    ruleKey: String(formData.get('ruleKey') ?? '').trim(),
    ruleName: String(formData.get('ruleName') ?? '').trim(),
    defaultMessageMode: String(
      formData.get('defaultMessageMode') ?? 'log_only'
    ) as MessageDeliveryMode,
    steps,
    active: true,
  };
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
  const others = policies.filter((item) => item.id !== policy.id);
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

window.addEventListener('hashchange', () => {
  activePage = getPageFromHash();
  if (window.location.hash.length > 1) {
    dashboardOpen = true;
  }
  render();
});

window.addEventListener('focus', () => {
  try {
    if (dashboardOpen && getCurrentWebViewMode() === 'inline') {
      expandedModeMessage =
        expandedModeMessage ?? 'Dashboard is open in inline fallback mode.';
    }
  } catch {
    expandedModeMessage =
      expandedModeMessage ?? 'Dashboard is open in local fallback mode.';
  }
});

render();
void loadHealth();
void loadPolicies();
void loadGovernance();

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && dashboardOpen) {
    try {
      requestInlineModeFallback();
    } catch {
      dashboardOpen = false;
      window.location.hash = '';
      render();
    }
  }
});

function getCurrentWebViewMode(): 'inline' | 'expanded' {
  return getDevvitGlobal()?.webViewMode === WEB_VIEW_IMMERSIVE_MODE
    ? 'expanded'
    : 'inline';
}

function requestExpandedModeFallback(event: MouseEvent, entry: string): void {
  if (!event.isTrusted || event.type !== 'click') {
    throw new Error('Expanded mode requires a trusted click.');
  }
  emitWebViewModeEffect(WEB_VIEW_IMMERSIVE_MODE, entry);
}

function requestInlineModeFallback(): void {
  emitWebViewModeEffect(WEB_VIEW_INLINE_MODE);
}

function emitWebViewModeEffect(mode: number, entry?: string): void {
  const devvitGlobal = getDevvitGlobal();
  if (!devvitGlobal) {
    throw new Error('Devvit WebView global unavailable.');
  }

  let entryUrl: string | undefined;
  if (entry) {
    const entrypoint = devvitGlobal.entrypoints?.[entry];
    if (!entrypoint) {
      throw new Error(`No Devvit entrypoint named ${entry}.`);
    }
    const url = new URL(entrypoint);
    if (devvitGlobal.token) {
      url.searchParams.set('token', devvitGlobal.token);
    }
    entryUrl = url.toString();
  }

  const message = {
    type: DEVVIT_INTERNAL_MESSAGE_TYPE,
    scope: 0,
    immersiveMode: {
      entryUrl,
      immersiveMode: mode,
    },
    effectType: EFFECT_WEB_VIEW,
  };
  window.parent.postMessage(message, '*');
}

function getDevvitGlobal(): DevvitWebViewGlobal | undefined {
  const candidate = (globalThis as { devvit?: DevvitWebViewGlobal }).devvit;
  return candidate;
}
