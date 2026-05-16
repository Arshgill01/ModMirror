import {
  APP_NAME,
  APP_SUMMARY,
  APP_TAGLINE,
  WAVE_1_FEATURE_STATUSES,
  type HealthResponse,
} from '../shared/status';
import { API_ROUTES, CONFIDENCE_VALUES } from '../shared/constants';
import type {
  ApiResponse,
  Confidence,
  DriftCandidate,
  EnforcementAction,
  MirrorScan,
} from '../shared/schema';
import './styles.css';

type PageId = 'overview' | 'mirror-scan' | 'policies' | 'overrides' | 'demo-mode';
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

const overviewPage: Page = {
  id: 'overview',
  label: 'Overview',
  title: 'Overview',
  body: 'The dashboard shows the ModMirror product shape without claiming policy or audit workflows are live before their waves.',
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
    body: 'Policy Agreement Flow starts in Wave 3. This Wave 2 dashboard only shows drift findings that can inform policy work later.',
  },
  {
    id: 'overrides',
    label: 'Overrides',
    title: 'Overrides',
    body: 'Override Audit remains out of scope until the Apply Policy and consistency nudge workflows exist.',
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

function getPageFromHash(): PageId {
  const candidate = window.location.hash.replace('#', '');
  return pages.some((page) => page.id === candidate)
    ? (candidate as PageId)
    : 'overview';
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
            <span class="muted">Demo data is requested from Mirror Scan, not mixed into live mode.</span>
          </div>
        </header>

        ${
          page.id === 'mirror-scan'
            ? renderMirrorScanPage()
            : renderPlaceholderPage(page)
        }
      </main>
    </div>
  `;

  bindNavigation();
  bindScanActions();
}

function renderPlaceholderPage(page: Page) {
  return `
    <section class="section intro-section" aria-labelledby="current-page-title">
      <div>
        <h3 id="current-page-title">${page.title}</h3>
        <p>${page.body}</p>
      </div>
      <div class="empty-state">
        <strong>No Wave 3 workflow here yet</strong>
        <span>Wave 2 is limited to Mirror Scan, deterministic attribution, and demo data.</span>
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
        <p>No rich history? Try demo mode to see what ModMirror looks like on an active team.</p>
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

function renderScanWarnings() {
  const warnings = [
    ...(scanState.mode === 'demo'
      ? ['Demo data - not real subreddit moderation history.']
      : []),
    ...scanState.warnings,
  ];

  if (warnings.length === 0) {
    return '';
  }

  return `
    <section class="notice-list" aria-label="Scan warnings">
      ${warnings
        .map((warning) => `<p>${escapeHtml(warning)}</p>`)
        .join('')}
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
      <button class="secondary-button" disabled>Create policy - coming in Wave 3</button>
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
  document.querySelectorAll<HTMLButtonElement>('[data-run-scan]').forEach((button) => {
    button.addEventListener('click', () => {
      const mode = button.dataset.runScan === 'demo' ? 'demo' : 'live';
      void runScan(mode);
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
      warnings: [],
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
    healthError = error instanceof Error ? error.message : 'Unknown health fetch error';
  }

  render();
}

function formatAction(action: EnforcementAction) {
  return action.replaceAll('_', ' ');
}

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

window.addEventListener('hashchange', () => {
  activePage = getPageFromHash();
  render();
});

render();
void loadHealth();
