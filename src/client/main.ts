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
} from '../shared/constants';
import type {
  ApiResponse,
  Confidence,
  DriftCandidate,
  EnforcementAction,
  MessageDeliveryMode,
  MirrorScan,
  PolicyStep,
  RulePolicy,
} from '../shared/schema';
import './styles.css';

type PageId =
  | 'overview'
  | 'mirror-scan'
  | 'policies'
  | 'overrides'
  | 'demo-mode';
type ScanMode = 'live' | 'demo';
type FeatureStatusState = (typeof WAVE_1_FEATURE_STATUSES)[number]['state'];

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

const overviewPage: Page = {
  id: 'overview',
  label: 'Overview',
  title: 'Overview',
  body: 'The dashboard shows scan, policy, and audit readiness without claiming unverified enforcement delivery.',
};

const pages: Page[] = [
  overviewPage,
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
}

function renderPage(page: Page) {
  if (page.id === 'mirror-scan') {
    return renderMirrorScanPage();
  }
  if (page.id === 'policies') {
    return renderPoliciesPage();
  }

  return renderPlaceholderPage(page);
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
