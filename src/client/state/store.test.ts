import { describe, expect, it, vi } from 'vitest';

import { getGlobalState, registerListener, saveThemePreference, updateState } from './store';

describe('client state store', () => {
  it('initializes with compact dashboard defaults outside the Devvit WebView', () => {
    const state = getGlobalState();

    expect(state.dashboardOpen).toBe(false);
    expect(state.activePage).toBe('act');
    expect(state.scanState.loading).toBe(false);
  });

  it('notifies registered listeners after state updates', () => {
    const listener = vi.fn();
    registerListener(listener);

    updateState((state) => {
      state.activePage = 'scan';
    });

    expect(listener).toHaveBeenCalledOnce();
    expect(getGlobalState().activePage).toBe('scan');
  });

  it('updates the theme preference without requiring browser storage', () => {
    saveThemePreference('dark');

    expect(getGlobalState().themePreference).toBe('dark');
  });
});
