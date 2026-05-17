import {
  APP_NAME,
  APP_SUMMARY,
  APP_TAGLINE,
  WAVE_1_FEATURE_STATUSES,
  type HealthResponse,
} from '../shared/status';
import {
  API_ROUTES,
  CONFIDENCE_VALUES,
  ENFORCEMENT_ACTION_VALUES,
  MESSAGE_DELIVERY_MODE_VALUES,
  OVERRIDE_REASON_VALUES,
} from '../shared/constants';
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

type PageId =
  | 'overview'
  | 'governance'
  | 'mirror-scan'
  | 'policies'
  | 'apply-policy'
  | 'case-packets'
  | 'overrides'
  | 'demo-mode';
type ScanMode = 'live' | 'demo';
type FeatureStatusState = (typeof WAVE_1_FEATURE_STATUSES)[number]['state'];
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
  id: PageId;
  label: string;
  title: string;
  body: string;
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

const overviewPage: Page = {
  id: 'overview',
  label: 'Overview',
  title: 'Overview',
  body: 'The dashboard shows scan, policy, and audit readiness without claiming unverified enforcement delivery.',
};

const pages: Page[] = [
  overviewPage,
  {
    id: 'governance',
    label: 'Governance',
    title: 'Governance',
    body: 'Review policy health, unresolved overrides, and policy version history as a team feedback loop.',
  },
  {
    id: 'mirror-scan',
    label: 'Mirror Scan',
    title: 'Mirror Scan',
    body: 'Run a scan to compare recent moderation actions against subreddit rules and removal reasons with honest confidence labels.',
  },
  {
    id: 'policies',
    label: 'Policies',
    title: 'Policies',
    body: 'Turn drift findings into explicit team policy ladders. Delivery defaults to log only until live comment behavior is verified.',
  },
  {
    id: 'apply-policy',
    label: 'Apply Policy',
    title: 'Apply Policy',
    body: 'Use the dashboard simulator while Reddit menu actions remain runtime-unverified. Confirmed actions are logged with log-only delivery.',
  },
  {
    id: 'case-packets',
    label: 'Case Packets',
    title: 'Case Packets',
    body: 'Generate appeal context rooted in policy versions, tracked action history, overrides, and deterministic comparable cases.',
  },
  {
    id: 'overrides',
    label: 'Overrides',
    title: 'Overrides',
    body: 'Override Audit remains neutral and aggregate-first; per-mod breakdowns stay hidden until permission gating is verified.',
  },
  {
    id: 'demo-mode',
    label: 'Demo Mode',
    title: 'Demo Mode',
    body: 'Demo data is clearly labeled so screenshots and cold-start review do not look like real subreddit history.',
  },
];

const app = document.querySelector<HTMLDivElement>('#app');

if (!app) {
  throw new Error('Missing #app root');
}

const appRoot = app;
let activePage: PageId = getPageFromHash();
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

function getPageFromHash(): PageId {
  const candidate = window.location.hash.replace('#', '');
  return pages.some((page) => page.id === candidate)
    ? (candidate as PageId)
    : 'overview';
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
  const page = pages.find((item) => item.id === activePage) ?? overviewPage;

  appRoot.innerHTML = `
    <div class="shell">
      <aside class="sidebar">
        <div class="brand">
          <h1>${APP_NAME}</h1>
          <p>${APP_TAGLINE}</p>
        </div>
        <nav class="nav" aria-label="Dashboard sections">
          ${pages
            .map(
              (item) => `
                <a href="#${item.id}" class="nav-link${item.id === page.id ? ' active' : ''}" data-page="${item.id}">
                  ${item.label}
                </a>
              `
            )
            .join('')}
        </nav>
      </aside>

      <main class="content">
        <header class="topbar">
          <div>
            <h2>${page.title}</h2>
            <p>${APP_SUMMARY}</p>
          </div>
          <div class="demo-control" aria-label="Demo mode status">
            <span class="demo-state">${health?.demoMode.enabled ? 'Demo on' : 'Demo available'}</span>
            <span class="muted">Demo data stays labeled and separate from live scan mode.</span>
          </div>
        </header>

        ${renderPage(page)}
      </main>
    </div>
  `;

  bindNavigation();
  bindScanActions();
  bindPolicyActions();
  bindApplyPolicyActions();
  bindCasePacketActions();
  bindGovernanceActions();
}

function renderPage(page: Page) {
  if (page.id === 'mirror-scan') {
    return renderMirrorScanPage();
  }
  if (page.id === 'policies') {
    return renderPoliciesPage();
  }
  if (page.id === 'apply-policy') {
    return renderApplyPolicyPage();
  }
  if (page.id === 'case-packets') {
    return renderCasePacketPage();
  }
  if (page.id === 'governance' || page.id === 'overrides') {
    return renderGovernancePage();
  }

  return renderPlaceholderPage(page);
}

function renderGovernancePage() {
  return `
    <section class="section policy-layout" aria-labelledby="current-page-title">
      <div>
        <h3 id="current-page-title">Governance Core</h3>
        <p>${pages.find((page) => page.id === 'governance')?.body ?? ''}</p>
        ${renderGovernanceMessage()}
      </div>
      <div class="policy-actions">
        <button class="secondary-button" data-load-governance ${governanceState.loading ? 'disabled' : ''}>Refresh governance</button>
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
    return `
      <section class="section loading-state">
        <h3>Loading governance data</h3>
        <p class="muted">Reading policy health, reviewable overrides, and version summaries.</p>
      </section>
    `;
  }
  if (!health) {
    return `
      <section class="section empty-scan-state">
        <h3>No governance data yet</h3>
        <p>Create a policy and record Apply Policy actions. ModMirror will start showing health and review signals as data accumulates.</p>
      </section>
    `;
  }

  return `
    <section class="scan-summary-grid" aria-label="Governance overview">
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
    return `
      <section class="section empty-scan-state">
        <h3>Policy health</h3>
        <p>Not enough tracked policy data yet. Create policies now; health status will appear after Apply Policy actions are logged.</p>
      </section>
    `;
  }

  return `
    <section class="health-card-grid" aria-label="Policy health cards">
      ${summaries.map(renderPolicyHealthCard).join('')}
    </section>
  `;
}

function renderPolicyHealthCard(summary: PolicyHealthSummary) {
  const topReason = summary.reasons[0] ?? 'No issue detected.';
  const recommendation =
    summary.recommendations[0] ?? 'Continue reviewing new exceptions.';

  return `
    <article class="health-card status-${summary.status}">
      <div class="health-card-header">
        <div>
          <h3>${escapeHtml(summary.ruleName)}</h3>
          <p>${escapeHtml(summary.ruleKey)}</p>
        </div>
        <span>${formatHealthStatus(summary.status)}</span>
      </div>
      <dl class="compact-metrics">
        <div><dt>Actions</dt><dd>${summary.totalActions}</dd></div>
        <div><dt>Adherence</dt><dd>${formatPercent(summary.adherenceRate)}</dd></div>
        <div><dt>Overrides</dt><dd>${summary.overrideCount}</dd></div>
        <div><dt>Unresolved</dt><dd>${summary.unresolvedOverrideCount}</dd></div>
      </dl>
      <p><strong>Top issue:</strong> ${escapeHtml(topReason)}</p>
      <p><strong>Recommendation:</strong> ${escapeHtml(recommendation)}</p>
      <div class="policy-actions left">
        <button class="secondary-button" data-filter-overrides="${escapeAttribute(summary.ruleKey)}">Review overrides</button>
        <button class="secondary-button" data-edit-policy="${escapeAttribute(summary.policyId)}">Edit policy</button>
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
    return `
      <section class="section empty-scan-state">
        <h3>Override review inbox</h3>
        <p>No unresolved overrides. Your team has no policy exceptions waiting for review.</p>
      </section>
    `;
  }

  return `
    <section class="inbox-list" aria-label="Override review inbox">
      ${overrides.map(renderOverrideRow).join('')}
    </section>
  `;
}

function renderOverrideRow(event: ReviewableOverrideEvent) {
  const label = event.ruleName ?? event.ruleKey;
  const version = event.policyVersionNumber
    ? `Policy v${event.policyVersionNumber}`
    : 'Policy version unavailable';

  return `
    <article class="inbox-row">
      <div class="inbox-row-main">
        <div>
          <h3>${escapeHtml(label)}</h3>
          <p>${formatAction(event.recommendedAction)} recommended; ${formatAction(event.selectedAction)} selected.</p>
        </div>
        <span class="review-pill">${formatAction(event.reviewStatus)}</span>
      </div>
      <dl class="compact-metrics">
        <div><dt>Reason</dt><dd>${formatAction(event.overrideReason)}</dd></div>
        <div><dt>Created</dt><dd>${formatDate(event.createdAt)}</dd></div>
        <div><dt>Version</dt><dd>${escapeHtml(version)}</dd></div>
        <div><dt>Target</dt><dd>${escapeHtml(event.targetThingId ?? 'not captured')}</dd></div>
      </dl>
      ${event.overrideNote ? `<p class="muted">${escapeHtml(event.overrideNote)}</p>` : ''}
      <input class="review-note-input" data-review-note="${escapeAttribute(event.id)}" placeholder="Optional review note" value="${escapeAttribute(event.reviewNote ?? '')}">
      <div class="policy-actions left">
        ${renderReviewButton(event, 'accepted_exception', 'Accept exception')}
        ${renderReviewButton(event, 'policy_needs_update', 'Policy needs update')}
        ${renderReviewButton(event, 'needs_team_discussion', 'Team discussion')}
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
    <button class="secondary-button table-button" data-review-override="${escapeAttribute(event.id)}" data-review-status="${status}" ${governanceState.savingOverrideId === event.id ? 'disabled' : ''}>
      ${label}
    </button>
  `;
}

function renderPolicyVersionSummary() {
  const policies = policyState.policies;
  if (policies.length === 0) {
    return `
      <section class="section empty-scan-state">
        <h3>Policy versions</h3>
        <p>No policies have been created yet. Version history begins with each policy's first saved version.</p>
      </section>
    `;
  }

  return `
    <section class="version-list" aria-label="Policy version history">
      ${policies.map(renderPolicyVersionCard).join('')}
    </section>
  `;
}

function renderPolicyVersionCard(policy: RulePolicy) {
  const versionedPolicy = policy as RulePolicy & {
    activeVersionNumber?: number;
    activeVersionId?: string;
  };
  const versions = governanceState.versionsByPolicy[policy.id] ?? [];
  const latest = versions.at(-1);
  const versionNumber =
    versionedPolicy.activeVersionNumber ?? latest?.versionNumber ?? 1;

  return `
    <article class="version-card">
      <div class="health-card-header">
        <div>
          <h3>${escapeHtml(policy.ruleName)}</h3>
          <p>Current version ${versionNumber}</p>
        </div>
        <span>${policy.active ? 'Active' : 'Inactive'}</span>
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
          : '<p class="muted">Version API not available yet or no versions have been recorded.</p>'
      }
    </article>
  `;
}

function renderPlaceholderPage(page: Page) {
  return `
    <section class="section intro-section" aria-labelledby="current-page-title">
      <div>
        <h3 id="current-page-title">${page.title}</h3>
        <p>${page.body}</p>
      </div>
      <div class="empty-state">
        <strong>${page.id === 'overrides' ? 'Audit summary arrives after Apply Policy' : 'Demo-first workflow ready'}</strong>
        <span>${page.id === 'overrides' ? 'Wave 4 records aggregate policy exceptions without individual blame.' : 'Run demo scan, create Rule 2 policy, then apply it from the policy loop.'}</span>
      </div>
    </section>

    <section class="status-grid" aria-label="Wave status cards">
      ${WAVE_1_FEATURE_STATUSES.map(
        (feature) => `
          <article class="status-card">
            <div class="status-card-header">
              <h3>${feature.name}</h3>
              <span>${formatState(feature.state)}</span>
            </div>
            <p>${feature.description}</p>
            <p class="next-step">${feature.next}</p>
          </article>
        `
      ).join('')}
    </section>

    <section class="section details-grid">
      ${renderHealthCard()}
      ${renderDemoCard()}
    </section>
  `;
}

function renderMirrorScanPage() {
  return `
    <section class="section scan-hero" aria-labelledby="current-page-title">
      <div>
        <h3 id="current-page-title">Mirror Scan</h3>
        <p>Run your first Mirror Scan to see how your team has been enforcing rules.</p>
        <p>No rich history? Try demo mode to create the Rule 2 policy loop from seeded drift.</p>
      </div>
      <div class="scan-actions">
        <button class="primary-button" data-run-scan="live" ${scanState.loading ? 'disabled' : ''}>Run Mirror Scan</button>
        <button class="secondary-button" data-run-scan="demo" ${scanState.loading ? 'disabled' : ''}>Use Demo Data</button>
      </div>
    </section>

    ${renderScanWarnings()}
    ${renderScanBody()}
  `;
}

function renderPoliciesPage() {
  return `
    <section class="section policy-layout" aria-labelledby="current-page-title">
      <div>
        <h3 id="current-page-title">Policy Agreement</h3>
        <p>${pages.find((page) => page.id === 'policies')?.body ?? ''}</p>
        ${renderPolicyMessage()}
      </div>
      <div class="policy-actions">
        <button class="secondary-button" data-load-policies ${policyState.loading ? 'disabled' : ''}>Refresh policies</button>
        <button class="primary-button" data-reset-policy-form>Create manual policy</button>
      </div>
    </section>

    ${renderPolicyFallback()}
    ${renderPolicyList()}
    ${renderDriftPolicyPanel()}
    ${renderPolicyForm()}
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
  const scan = scanState.result;
  if (policyState.policies.length > 0) {
    return '';
  }

  const copy =
    scan && !scan.smallSubredditStatus.meetsThreshold
      ? 'Not enough history for reliable drift detection yet. Set your team policy now; ModMirror will start measuring consistency from today.'
      : 'No team policy exists for this rule yet. Create one now.';

  return `
    <section class="section empty-scan-state">
      <h3>No active policies yet</h3>
      <p>${escapeHtml(copy)}</p>
    </section>
  `;
}

function renderPolicyList() {
  if (policyState.loading) {
    return `
      <section class="section loading-state">
        <h3>Loading policies</h3>
        <p class="muted">Reading the subreddit policy ladder list.</p>
      </section>
    `;
  }

  if (policyState.policies.length === 0) {
    return '';
  }

  return `
    <section class="policy-table-section" aria-label="Saved policies">
      <table class="policy-table">
        <thead>
          <tr>
            <th>Rule</th>
            <th>Steps</th>
            <th>Delivery</th>
            <th>Status</th>
            <th>Updated</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          ${policyState.policies.map(renderPolicyRow).join('')}
        </tbody>
      </table>
    </section>
  `;
}

function renderPolicyRow(policy: RulePolicy) {
  return `
    <tr>
      <td>
        <strong>${escapeHtml(policy.ruleName)}</strong>
        <span>${escapeHtml(policy.ruleKey)}</span>
      </td>
      <td>${policy.steps.length}</td>
      <td>${formatAction(policy.defaultMessageMode)}</td>
      <td>${policy.active ? 'Active' : 'Inactive'}</td>
      <td>${formatDate(policy.updatedAt)}</td>
      <td><button class="secondary-button table-button" data-edit-policy="${escapeHtml(policy.id)}">Edit</button></td>
    </tr>
  `;
}

function renderDriftPolicyPanel() {
  const candidates = scanState.result?.driftCandidates ?? [];
  if (candidates.length === 0) {
    return `
      <section class="section empty-scan-state">
        <h3>Create from drift</h3>
        <p>Run a scan or use demo data to create a policy directly from a drift candidate.</p>
      </section>
    `;
  }

  return `
    <section class="drift-list" aria-label="Create policy from drift candidates">
      ${candidates.map(renderDriftPolicyCard).join('')}
    </section>
  `;
}

function renderDriftPolicyCard(candidate: DriftCandidate, index: number) {
  const existing = policyState.policies.some(
    (policy) => policy.ruleKey === candidate.ruleKey
  );

  return `
    <article class="drift-card">
      <div class="drift-card-header">
        <div>
          <h3>${escapeHtml(candidate.ruleName)}</h3>
          <p>${escapeHtml(candidate.summary)}</p>
        </div>
        <span class="confidence-pill confidence-${candidate.confidence}">${candidate.confidence}</span>
      </div>
      <div class="distribution-grid">
        ${Object.entries(candidate.actionDistribution)
          .map(([action, count]) =>
            renderDistributionItem(action as EnforcementAction, count ?? 0)
          )
          .join('')}
      </div>
      <p class="recommendation">${escapeHtml(candidate.recommendation)}</p>
      <button class="primary-button" data-create-from-drift="${index}" ${existing || policyState.saving ? 'disabled' : ''}>
        ${existing ? 'Policy exists' : 'Create team policy'}
      </button>
    </article>
  `;
}

function renderPolicyForm() {
  const form = policyState.form;

  return `
    <section class="section policy-form-section" aria-label="Policy editor">
      <div class="policy-form-header">
        <div>
          <h3>${form.mode === 'edit' ? 'Edit Policy' : 'Manual Policy Creation'}</h3>
          <p>Use local rule keys because the installed Devvit rule type does not expose stable rule IDs.</p>
        </div>
        <button class="secondary-button" data-reset-policy-form>Reset</button>
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
              (mode) => `
                <option value="${mode}" ${mode === form.defaultMessageMode ? 'selected' : ''}>${formatAction(mode)}</option>
              `
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
            (action) => `
              <option value="${action}" ${action === step.recommendedAction ? 'selected' : ''}>${formatAction(action)}</option>
            `
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

function renderApplyPolicyPage() {
  return `
    <section class="section policy-layout" aria-labelledby="current-page-title">
      <div>
        <h3 id="current-page-title">Apply Policy Simulator</h3>
        <p>${pages.find((page) => page.id === 'apply-policy')?.body ?? ''}</p>
        ${renderApplyMessage()}
      </div>
      <div class="policy-actions">
        <button class="secondary-button" data-load-policies ${policyState.loading ? 'disabled' : ''}>Refresh policies</button>
      </div>
    </section>

    ${renderApplyForm()}
    ${renderApplyPreview()}
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
    return `
      <section class="section empty-scan-state">
        <h3>No policy available</h3>
        <p>No team policy exists for this rule yet. Create one from the Policies page before applying it.</p>
        <button class="primary-button" data-go-policies>Create policy</button>
      </section>
    `;
  }

  return `
    <section class="section policy-form-section" aria-label="Apply Policy simulator">
      <form class="policy-form" data-apply-form>
        <label>
          Policy
          <select name="ruleKey">
            ${policyState.policies
              .filter((policy) => policy.active)
              .map(
                (policy) => `
                  <option value="${policy.ruleKey}">${escapeHtml(policy.ruleName)}</option>
                `
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
              (action) => `
                <option value="${action}">${formatAction(action)}</option>
              `
            ).join('')}
          </select>
        </label>
        <label>
          Override reason
          <select name="overrideReason">
            <option value="">Only required on deviation</option>
            ${OVERRIDE_REASON_VALUES.map(
              (reason) => `
                <option value="${reason}">${formatAction(reason)}</option>
              `
            ).join('')}
          </select>
        </label>
        <label>
          Override note
          <input name="overrideNote" placeholder="Optional context for policy review">
        </label>
        <div class="policy-actions left">
          <button class="secondary-button" type="button" data-apply-preview ${applyState.loading ? 'disabled' : ''}>Preview recommendation</button>
          <button class="primary-button" type="submit" ${applyState.confirming ? 'disabled' : ''}>Confirm log-only action</button>
        </div>
      </form>
    </section>
  `;
}

function renderApplyPreview() {
  const preview = applyState.preview;
  const result = applyState.result;

  if (!preview && !result) {
    return `
      <section class="section empty-scan-state">
        <h3>No preview yet</h3>
        <p>Preview shows the policy recommendation, offense count, delivery mode, and whether an override reason is required.</p>
      </section>
    `;
  }

  const recommendation = result?.recommendation ?? preview?.recommendation;
  if (!recommendation) {
    return '';
  }

  return `
    <section class="section apply-preview">
      <h3>Recommendation</h3>
      <dl class="status-list">
        <div><dt>Rule</dt><dd>${escapeHtml(recommendation.ruleName ?? recommendation.ruleKey)}</dd></div>
        <div><dt>Offense count</dt><dd>${recommendation.offenseCount}</dd></div>
        <div><dt>Recommended action</dt><dd>${formatAction(recommendation.recommendedAction)}</dd></div>
        <div><dt>Delivery mode</dt><dd>${formatAction(recommendation.messageDeliveryMode)}</dd></div>
        <div><dt>Deviation</dt><dd>${recommendation.deviatesFromPolicy ? 'Override required' : 'Matches policy'}</dd></div>
      </dl>
      <p class="muted">${escapeHtml(recommendation.message)}</p>
      ${
        result
          ? `<p class="inline-success">Policy action logged${result.overrideEvent ? ' with override reason' : ''}.</p>
             <button class="secondary-button" data-case-from-action="${escapeAttribute(result.actionEvent.id)}">Generate case packet</button>`
          : ''
      }
    </section>
  `;
}

function renderCasePacketPage() {
  return `
    <section class="section policy-layout" aria-labelledby="current-page-title">
      <div>
        <h3 id="current-page-title">Case Packet / Appeal Context</h3>
        <p>${pages.find((page) => page.id === 'case-packets')?.body ?? ''}</p>
        ${renderCasePacketMessage()}
      </div>
      <div class="policy-actions">
        <button class="primary-button" data-generate-demo-case ${casePacketState.loading ? 'disabled' : ''}>Generate demo packet</button>
      </div>
    </section>

    <section class="section policy-form-section" aria-label="Generate case packet from action">
      <form class="policy-form" data-case-action-form>
        <label>
          Tracked action ID
          <input name="actionId" placeholder="Paste an Apply Policy action ID">
        </label>
        <div class="policy-actions left">
          <button class="secondary-button" type="submit" ${casePacketState.loading ? 'disabled' : ''}>Generate from action</button>
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
    return `
      <section class="section loading-state">
        <h3>Generating packet</h3>
        <p class="muted">Reading action history, policy version context, overrides, and deterministic comparable cases.</p>
      </section>
    `;
  }

  const packet = casePacketState.packet;
  if (!packet) {
    return `
      <section class="section empty-scan-state">
        <h3>No packet generated yet</h3>
        <p>Generate the demo packet for screenshots, or generate from an Apply Policy action ID after recording a log-only action.</p>
      </section>
    `;
  }

  return `
    <section class="scan-summary-grid" aria-label="Case packet summary">
      ${renderMetricCard('Posture', formatAction(packet.appealPosture))}
      ${renderMetricCard('Consistency', formatAction(packet.consistencyStatus))}
      ${renderMetricCard('Policy version', packet.policyContext.policyVersionNumber?.toString() ?? 'Unavailable')}
      ${renderMetricCard('Comparables', packet.comparableCases.length.toString())}
    </section>

    <section class="case-packet-grid" aria-label="Case packet detail">
      ${renderCasePacketAction(packet)}
      ${renderCasePacketPolicy(packet)}
      ${renderCasePacketOverride(packet)}
      ${renderCasePacketLists(packet)}
    </section>

    <section class="section policy-form-section">
      <div class="policy-form-header">
        <div>
          <h3>Markdown Export</h3>
          <p>Copy this into the team review thread or appeal notes. It is deterministic context, not an automated judgment.</p>
        </div>
        <button class="secondary-button" data-copy-case-markdown>Copy Markdown</button>
      </div>
      <textarea class="markdown-export" readonly>${escapeHtml(packet.markdown)}</textarea>
    </section>
  `;
}

function renderCasePacketAction(packet: CasePacket) {
  const action = packet.action;
  return `
    <article class="panel">
      <h3>Action Summary</h3>
      <dl class="status-list">
        <div><dt>Action ID</dt><dd>${escapeHtml(action?.actionId ?? 'Unavailable')}</dd></div>
        <div><dt>Created</dt><dd>${escapeHtml(action?.createdAt ? formatDate(action.createdAt) : 'Unavailable')}</dd></div>
        <div><dt>Rule</dt><dd>${escapeHtml(action?.ruleName ?? action?.ruleKey ?? 'Unavailable')}</dd></div>
        <div><dt>Recommended</dt><dd>${escapeHtml(formatAction(action?.recommendedAction ?? 'unavailable'))}</dd></div>
        <div><dt>Selected</dt><dd>${escapeHtml(formatAction(action?.selectedAction ?? 'unavailable'))}</dd></div>
        <div><dt>Target author</dt><dd>${escapeHtml(action?.targetAuthor ?? 'Not captured')}</dd></div>
      </dl>
    </article>
  `;
}

function renderCasePacketPolicy(packet: CasePacket) {
  const policy = packet.policyContext;
  return `
    <article class="panel">
      <h3>Policy Context</h3>
      <dl class="status-list">
        <div><dt>Policy</dt><dd>${escapeHtml(policy.policyName ?? policy.policyId ?? 'Unavailable')}</dd></div>
        <div><dt>Version</dt><dd>${policy.policyVersionNumber ?? 'Unavailable'}</dd></div>
        <div><dt>Status</dt><dd>${escapeHtml(formatAction(policy.policyVersionStatus ?? 'unavailable'))}</dd></div>
        <div><dt>Changed since action</dt><dd>${policy.changedSinceAction ? 'Yes' : 'No'}</dd></div>
      </dl>
    </article>
  `;
}

function renderCasePacketOverride(packet: CasePacket) {
  const override = packet.overrideContext;
  return `
    <article class="panel">
      <h3>Override Context</h3>
      ${
        override
          ? `<dl class="status-list">
              <div><dt>Reason</dt><dd>${escapeHtml(formatAction(override.reason ?? 'unavailable'))}</dd></div>
              <div><dt>Review</dt><dd>${escapeHtml(formatAction(override.reviewStatus ?? 'unavailable'))}</dd></div>
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
    <article class="panel">
      <h3>History And Comparables</h3>
      <div class="case-list-block">
        <strong>Prior same-rule user history</strong>
        ${
          packet.userHistory.length > 0
            ? `<ul>${packet.userHistory
                .map(
                  (item) =>
                    `<li>${escapeHtml(formatDate(item.createdAt))}: ${escapeHtml(formatAction(item.selectedAction ?? 'unavailable'))}</li>`
                )
                .join('')}</ul>`
            : '<p class="muted">No prior tracked same-rule history for this user.</p>'
        }
      </div>
      <div class="case-list-block">
        <strong>Deterministic comparable cases</strong>
        ${
          packet.comparableCases.length > 0
            ? `<ul>${packet.comparableCases
                .map(
                  (item) =>
                    `<li>${escapeHtml(formatDate(item.createdAt))}: ${escapeHtml(formatAction(item.selectedAction ?? 'unavailable'))} — ${escapeHtml(item.matchReasons.join(', '))}</li>`
                )
                .join('')}</ul>`
            : '<p class="muted">No comparable cases found in the configured window.</p>'
        }
      </div>
      <div class="case-list-block">
        <strong>Caveats</strong>
        <ul>${packet.caveats.map((caveat) => `<li>${escapeHtml(caveat)}</li>`).join('')}</ul>
      </div>
    </article>
  `;
}

function renderScanWarnings() {
  const warnings = scanState.warnings;

  if (warnings.length === 0) {
    return '';
  }

  return `
    <section class="notice-list" aria-label="Scan warnings">
      ${warnings.map((warning) => `<p>${escapeHtml(warning)}</p>`).join('')}
    </section>
  `;
}

function renderScanBody() {
  if (scanState.loading) {
    return `
      <section class="section loading-state">
        <h3>Scanning moderation history</h3>
        <p class="muted">Loading actions, rules, removal reasons, and attribution output.</p>
      </section>
    `;
  }

  if (scanState.error) {
    return `
      <section class="section error-state">
        <h3>Scan could not complete</h3>
        <p>${escapeHtml(scanState.error)}</p>
      </section>
    `;
  }

  if (!scanState.result) {
    return `
      <section class="section empty-scan-state">
        <h3>No scan has run yet</h3>
        <p>Run a live scan or use demo data to see scan summary, confidence breakdown, unmatched count, and drift candidates.</p>
      </section>
    `;
  }

  return `
    ${renderScanSummary(scanState.result)}
    ${renderDriftCandidates(scanState.result.driftCandidates)}
  `;
}

function renderScanSummary(scan: MirrorScan) {
  return `
    <section class="scan-summary-grid" aria-label="Scan summary">
      ${renderMetricCard('Source', scan.source)}
      ${renderMetricCard('Actions scanned', scan.totalActionsScanned.toString())}
      ${renderMetricCard('Attributed', scan.attributedCount.toString())}
      ${renderMetricCard('Unmatched', scan.unmatchedCount.toString())}
    </section>

    <section class="section breakdown-section">
      <div>
        <h3>Confidence Breakdown</h3>
        <p>Inferred rule labels stay confidence-scored because historical mod logs do not expose perfect rule attribution.</p>
      </div>
      <div class="confidence-grid">
        ${CONFIDENCE_VALUES.map((confidence) =>
          renderConfidenceItem(confidence, scan.confidenceBreakdown[confidence])
        ).join('')}
      </div>
    </section>

    <section class="section small-subreddit-section">
      <h3>History Depth</h3>
      <p>${escapeHtml(scan.smallSubredditStatus.message)}</p>
    </section>
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

function renderDriftCandidates(candidates: DriftCandidate[]) {
  if (candidates.length === 0) {
    return `
      <section class="section empty-scan-state">
        <h3>No drift candidates yet</h3>
        <p>Not enough attributed history was found for reliable drift detection.</p>
      </section>
    `;
  }

  return `
    <section class="drift-list" aria-label="Drift candidates">
      ${candidates.map(renderDriftCandidate).join('')}
    </section>
  `;
}

function renderDriftCandidate(candidate: DriftCandidate) {
  return `
    <article class="drift-card">
      <div class="drift-card-header">
        <div>
          <h3>${escapeHtml(candidate.ruleName)}</h3>
          <p>${escapeHtml(candidate.summary)}</p>
        </div>
        <span class="confidence-pill confidence-${candidate.confidence}">${candidate.confidence}</span>
      </div>
      <div class="distribution-grid">
        ${Object.entries(candidate.actionDistribution)
          .map(([action, count]) =>
            renderDistributionItem(action as EnforcementAction, count ?? 0)
          )
          .join('')}
      </div>
      <p class="recommendation">${escapeHtml(candidate.recommendation)}</p>
      <button class="secondary-button" data-open-policy-page>Open policy flow</button>
    </article>
  `;
}

function renderDistributionItem(action: EnforcementAction, count: number) {
  return `
    <div class="distribution-item">
      <span>${escapeHtml(formatAction(action))}</span>
      <strong>${count}</strong>
    </div>
  `;
}

function bindNavigation() {
  document.querySelectorAll<HTMLAnchorElement>('[data-page]').forEach((link) => {
    link.addEventListener('click', () => {
      const nextPage = link.dataset.page;
      if (nextPage && pages.some((page) => page.id === nextPage)) {
        activePage = nextPage as PageId;
        render();
      }
    });
  });
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

  document
    .querySelectorAll<HTMLButtonElement>('[data-open-policy-page]')
    .forEach((button) => {
      button.addEventListener('click', () => {
        activePage = 'policies';
        window.location.hash = '#policies';
        render();
      });
    });
}

function bindPolicyActions() {
  document
    .querySelectorAll<HTMLButtonElement>('[data-load-policies]')
    .forEach((button) => {
      button.addEventListener('click', () => void loadPolicies());
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
        render();
      });
    });

  document
    .querySelectorAll<HTMLButtonElement>('[data-edit-policy]')
    .forEach((button) => {
      button.addEventListener('click', () => {
        const policy = policyState.policies.find(
          (item) => item.id === button.dataset.editPolicy
        );
        if (policy) {
          policyState = {
            ...policyState,
            form: {
              mode: 'edit',
              policyId: policy.id,
              ruleKey: policy.ruleKey,
              ruleName: policy.ruleName,
              defaultMessageMode: policy.defaultMessageMode,
              steps: policy.steps.map((step) => ({ ...step })),
            },
            error: undefined,
            message: undefined,
          };
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
  document
    .querySelectorAll<HTMLButtonElement>('[data-go-policies]')
    .forEach((button) => {
      button.addEventListener('click', () => {
        activePage = 'policies';
        window.location.hash = '#policies';
        render();
      });
    });

  document
    .querySelectorAll<HTMLButtonElement>('[data-apply-preview]')
    .forEach((button) => {
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
  document
    .querySelectorAll<HTMLButtonElement>('[data-generate-demo-case]')
    .forEach((button) => {
      button.addEventListener('click', () => {
        void generateCasePacket({ type: 'demo' });
      });
    });

  document
    .querySelectorAll<HTMLButtonElement>('[data-case-from-action]')
    .forEach((button) => {
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

  document
    .querySelectorAll<HTMLButtonElement>('[data-copy-case-markdown]')
    .forEach((button) => {
      button.addEventListener('click', () => void copyCasePacketMarkdown());
    });
}

function bindGovernanceActions() {
  document
    .querySelectorAll<HTMLButtonElement>('[data-load-governance]')
    .forEach((button) => {
      button.addEventListener('click', () => void loadGovernance());
    });

  document
    .querySelectorAll<HTMLButtonElement>('[data-filter-overrides]')
    .forEach((button) => {
      button.addEventListener('click', () => {
        activePage = 'governance';
        window.location.hash = '#governance';
        void loadGovernance(button.dataset.filterOverrides);
      });
    });

  document
    .querySelectorAll<HTMLButtonElement>('[data-review-override]')
    .forEach((button) => {
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

function formatState(state: FeatureStatusState) {
  return state === 'ready-for-integration' ? 'Ready for integration' : 'Placeholder';
}

function renderHealthCard() {
  if (healthError) {
    return `
      <article class="panel">
        <h3>Health Status</h3>
        <dl class="status-list">
          <div><dt>API</dt><dd>Unavailable</dd></div>
          <div><dt>Detail</dt><dd>${escapeHtml(healthError)}</dd></div>
        </dl>
      </article>
    `;
  }

  if (!health) {
    return `
      <article class="panel">
        <h3>Health Status</h3>
        <p class="muted">Loading server status from /api/health.</p>
      </article>
    `;
  }

  return `
    <article class="panel">
      <h3>Health Status</h3>
      <dl class="status-list">
        <div><dt>App</dt><dd>${escapeHtml(health.app.name)}</dd></div>
        <div><dt>Runtime</dt><dd>${escapeHtml(health.environment.runtime)}</dd></div>
        <div><dt>Playtest</dt><dd>${escapeHtml(health.environment.playtestStatus)}</dd></div>
        <div><dt>Subreddit</dt><dd>${escapeHtml(health.subreddit.name ?? health.subreddit.id ?? 'Unavailable in this context')}</dd></div>
        <div><dt>Redis</dt><dd>${escapeHtml(health.redis.smokeStatus)}</dd></div>
      </dl>
      <p class="muted">${escapeHtml(health.redis.detail)}</p>
    </article>
  `;
}

function renderDemoCard() {
  return `
    <article class="panel">
      <h3>Demo Mode</h3>
      <p>Demo scans use deterministic seeded actions and stay clearly labeled as non-live data.</p>
      <div class="placeholder-row">
        <span>Seed source</span>
        <strong>${escapeHtml(health?.demoMode.source ?? 'placeholder')}</strong>
      </div>
    </article>
  `;
}

async function runScan(mode: ScanMode) {
  scanState = {
    loading: true,
    mode,
    warnings: [],
  };
  activePage = 'mirror-scan';
  render();

  try {
    const response = await fetch(API_ROUTES.scan, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify({ mode }),
    });
    const payload = (await response.json()) as ApiResponse<MirrorScan>;

    if (!payload.ok) {
      throw new Error(payload.error.message);
    }

    scanState = {
      loading: false,
      mode,
      result: payload.data,
      warnings: payload.data.warnings,
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
    const response = await fetch(API_ROUTES.policies);
    const payload = (await response.json()) as ApiResponse<RulePolicy[]>;
    if (!payload.ok) {
      throw new Error(payload.error.message);
    }
    policyState = {
      ...policyState,
      loading: false,
      policies: payload.data,
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
    const [health, policies, overrides] = await Promise.all([
      fetchApi<PolicyHealthOverview>('/api/policy-health'),
      fetchApi<RulePolicy[]>(API_ROUTES.policies),
      fetchApi<ReviewableOverrideEvent[]>(
        ruleKey
          ? `/api/overrides?status=unresolved&ruleKey=${encodeURIComponent(ruleKey)}`
          : '/api/overrides?status=unresolved'
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
      health,
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
      `/api/overrides/${encodeURIComponent(overrideId)}/review`,
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

async function fetchApi<T>(
  url: string,
  init?: RequestInit
): Promise<T> {
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
    const response = await fetch(API_ROUTES.applyPolicyPreview, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(applyFormDataToPayload(formData, false)),
    });
    const payload = (await response.json()) as ApiResponse<ApplyPolicyPreview>;
    if (!payload.ok) {
      throw new Error(payload.error.message);
    }
    applyState = {
      ...applyState,
      loading: false,
      preview: payload.data,
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
    const response = await fetch(API_ROUTES.applyPolicyConfirm, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(applyFormDataToPayload(formData, true)),
    });
    const payload =
      (await response.json()) as ApiResponse<ApplyPolicyConfirmResult>;
    if (!payload.ok) {
      throw new Error(payload.error.message);
    }
    applyState = {
      ...applyState,
      confirming: false,
      preview: {
        recommendation: payload.data.recommendation,
      },
      result: payload.data,
      message: 'Policy action recorded in log-only mode.',
    };
  } catch (error) {
    applyState = {
      ...applyState,
      confirming: false,
      error:
        error instanceof Error ? error.message : 'Apply Policy confirm failed',
    };
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

function formatAction(action: string) {
  return action.replaceAll('_', ' ');
}

function formatDate(value: string) {
  const timestamp = Date.parse(value);
  if (Number.isNaN(timestamp)) {
    return value;
  }
  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(timestamp);
}

function formatHealthStatus(status: PolicyHealthStatus) {
  return status.replaceAll('_', ' ');
}

function formatPercent(value: number) {
  return `${Math.round(value * 100)}%`;
}

function cssEscape(value: string) {
  return window.CSS?.escape ? window.CSS.escape(value) : value.replaceAll('"', '\\"');
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
  render();
});

render();
void loadHealth();
void loadPolicies();
void loadGovernance();
