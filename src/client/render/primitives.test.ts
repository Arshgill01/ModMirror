import { describe, expect, it } from 'vitest';

import {
  escapeAttribute,
  escapeHtml,
  renderEmptyState,
  renderLoadingState,
  renderMetricCard,
  renderSettingsCard,
} from './primitives';

describe('client render primitives', () => {
  it('escapes text and attribute values consistently', () => {
    expect(escapeHtml(`<Rule "2" & notes>`)).toBe(
      '&lt;Rule &quot;2&quot; &amp; notes&gt;'
    );
    expect(escapeAttribute(`mod's note`)).toBe('mod&#039;s note');
  });

  it('renders empty and loading states with the existing action contract', () => {
    expect(
      renderEmptyState('No policies', 'Create one.', [
        { label: 'Create Policy', page: 'agree', intent: 'create_policy' },
      ])
    ).toContain('data-action-intent="create_policy"');
    expect(renderLoadingState('Loading', 'Fetching data.')).toContain(
      'Requests time out after 12 seconds'
    );
  });

  it('renders small cards without leaking raw HTML', () => {
    expect(renderSettingsCard('Mode', '<demo>', 'Safe & labeled')).toContain(
      '&lt;demo&gt;'
    );
    expect(renderMetricCard('Scanned', '12')).toContain('Scanned');
  });
});
