import {
  APP_NAME,
  APP_SUMMARY,
  APP_TAGLINE,
  WAVE_1_FEATURE_STATUSES,
  type HealthResponse,
} from '../shared/status';
import './styles.css';

type PageId = 'overview' | 'mirror-scan' | 'policies' | 'overrides' | 'demo-mode';

type Page = {
  id: PageId;
  label: string;
  title: string;
  body: string;
};

const overviewPage: Page = {
  id: 'overview',
  label: 'Overview',
  title: 'Overview',
  body: 'The Wave 1 shell shows the product shape without claiming scan, policy, or audit data is live.',
};

const pages: Page[] = [
  overviewPage,
  {
    id: 'mirror-scan',
    label: 'Mirror Scan',
    title: 'Mirror Scan',
    body: 'Wave 2 will implement live scan. Until then, this page reserves the scan summary, confidence breakdown, and drift candidate areas.',
  },
  {
    id: 'policies',
    label: 'Policies',
    title: 'Policies',
    body: 'Policy Agreement placeholders are ready for rule policy ladders once shared contracts and Redis persistence land.',
  },
  {
    id: 'overrides',
    label: 'Overrides',
    title: 'Overrides',
    body: 'Override Audit will show aggregate deviations after the Apply Policy and consistency nudge flows exist.',
  },
  {
    id: 'demo-mode',
    label: 'Demo Mode',
    title: 'Demo Mode',
    body: 'Demo mode is required for the submission, but seeded data is not wired in this Wave 1 dashboard shell.',
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
          <div class="demo-control" aria-label="Demo mode placeholder">
            <span class="demo-state">${health?.demoMode.enabled ? 'Demo on' : 'Demo off'}</span>
            <label>
              <input type="checkbox" disabled ${health?.demoMode.enabled ? 'checked' : ''} />
              Demo mode placeholder
            </label>
          </div>
        </header>

        <section class="section intro-section" aria-labelledby="current-page-title">
          <div>
            <h3 id="current-page-title">${page.title}</h3>
            <p>${page.body}</p>
          </div>
          <div class="empty-state">
            <strong>No live moderation data yet</strong>
            <span>Wave 1 is the app shell. Later waves will connect scans, policies, and audit events.</span>
          </div>
        </section>

        <section class="status-grid" aria-label="Wave 1 status cards">
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
      </main>
    </div>
  `;

  bindNavigation();
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

function formatState(state: FeatureStatusState) {
  return state === 'ready-for-integration' ? 'Ready for integration' : 'Placeholder';
}

type FeatureStatusState = (typeof WAVE_1_FEATURE_STATUSES)[number]['state'];

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
      <p>
        Demo seed data is mandatory for the final submission. This shell exposes the indicator now and leaves the toggle disabled until the demo data layer is integrated.
      </p>
      <div class="placeholder-row">
        <span>Seed source</span>
        <strong>${escapeHtml(health?.demoMode.source ?? 'placeholder')}</strong>
      </div>
    </article>
  `;
}

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

async function loadHealth() {
  try {
    const response = await fetch('/api/health');
    if (!response.ok) {
      throw new Error(`Health endpoint returned ${response.status}`);
    }
    health = (await response.json()) as HealthResponse;
  } catch (error) {
    healthError = error instanceof Error ? error.message : 'Unknown health fetch error';
  }

  render();
}

window.addEventListener('hashchange', () => {
  activePage = getPageFromHash();
  render();
});

render();
void loadHealth();
