# Wave 14: Comprehensive Verification & Golden Run

## 🎯 Objective
Run final quality checks, type checks, lint formatting, and full backend and frontend unit tests. Ensure the production build finishes without warnings or errors, making the app deployable.

## 📂 Target Files
* **[NEW]** `src/client/state/store.test.ts`
* **[MODIFY]** `package.json`

## 🛠️ Step-by-Step Implementation Instructions

### 1. Write Client Store Unit Tests
* Create `src/client/state/store.test.ts` to test state mutations and listeners:
  ```typescript
  import { describe, it, expect, vi } from 'vitest';
  import { getGlobalState, updateState, registerListener } from './store';

  describe('Client Store', () => {
    it('initializes with default state values', () => {
      const state = getGlobalState();
      expect(state.activePage).toBe('act');
    });

    it('triggers listener callbacks on state update', () => {
      const callback = vi.fn();
      registerListener(callback);
      updateState((state) => {
        state.activePage = 'scan';
      });
      expect(callback).toHaveBeenCalled();
      expect(getGlobalState().activePage).toBe('scan');
    });
  });
  ```

### 2. Run Comprehensive Quality Sweeps
* Run typescript validation:
  ```bash
  npm run type-check
  ```
* Run formatting check:
  ```bash
  npm run prettier
  ```
* Run linter suite:
  ```bash
  npm run lint
  ```
* Run all unit test files:
  ```bash
  npm test
  ```
* Compile production bundle assets:
  ```bash
  npm run build
  ```

## 🧪 Verification Plan
* Verify all 235+ tests pass with 100% green indicators.
* Verify `dist/` contains the minified HTML, JS, and CSS static bundles.
