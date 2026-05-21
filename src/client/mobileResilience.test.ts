import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const stylesheet = readFileSync(new URL('./styles.css', import.meta.url), 'utf8');

describe('mobile resilience stylesheet guards', () => {
  it('keeps core workspaces on a single column before narrow WebView width', () => {
    expect(stylesheet).toContain('@media (max-width: 980px)');
    expect(stylesheet).toMatch(
      /act-layout,[\s\S]*prove-layout[\s\S]*grid-template-columns:\s*1fr;/
    );
    expect(stylesheet).toMatch(
      /policy-workbench,[\s\S]*grid-template-columns:\s*1fr;/
    );
  });

  it('collapses dense ledgers, settings, and proof rows at phone width', () => {
    expect(stylesheet).toContain('@media (max-width: 640px)');
    expect(stylesheet).toMatch(
      /settings-grid \.action-card[\s\S]*grid-template-columns:\s*1fr;/
    );
    expect(stylesheet).toMatch(
      /compact-metrics,[\s\S]*status-list[\s\S]*grid-template-columns:\s*1fr;/
    );
    expect(stylesheet).toMatch(/category-checks[\s\S]*grid-template-columns:\s*1fr;/);
  });

  it('uses wrapping and bounded text for narrow runtime data', () => {
    expect(stylesheet).toMatch(/overflow-wrap:\s*anywhere;/);
    expect(stylesheet).toMatch(/flex-wrap:\s*wrap;/);
    expect(stylesheet).toContain('min-width: 320px');
  });

  it('respects reduced-motion preferences across shared UI transitions', () => {
    expect(stylesheet).toContain('@media (prefers-reduced-motion: reduce)');
    expect(stylesheet).toMatch(/transition-duration:\s*0\.01ms !important;/);
    expect(stylesheet).toMatch(/animation-duration:\s*0\.01ms !important;/);
    expect(stylesheet).toMatch(/scroll-behavior:\s*auto !important;/);
  });
});
