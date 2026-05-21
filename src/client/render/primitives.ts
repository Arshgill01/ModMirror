import type { CommandCenterAction } from '../../shared/productization';
import type { Confidence } from '../../shared/schema';
import { API_TIMEOUT_MS } from '../state/actions';

export function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

export function escapeAttribute(value: string) {
  return escapeHtml(value);
}

export function renderEmptyState(
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

export function renderLoadingState(title: string, body: string) {
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

export function renderSettingsCard(title: string, value: string, detail: string) {
  return `
    <article class="action-card">
      <h3>${escapeHtml(title)}</h3>
      <strong class="settings-value">${escapeHtml(value)}</strong>
      <p>${escapeHtml(detail)}</p>
    </article>
  `;
}

export function renderMetricCard(label: string, value: string) {
  return `
    <article class="metric-card">
      <span>${escapeHtml(label)}</span>
      <strong>${escapeHtml(value)}</strong>
    </article>
  `;
}

export function renderConfidenceItem(confidence: Confidence, count: number) {
  return `
    <div class="confidence-item confidence-${confidence}">
      <span>${confidence}</span>
      <strong>${count}</strong>
    </div>
  `;
}
