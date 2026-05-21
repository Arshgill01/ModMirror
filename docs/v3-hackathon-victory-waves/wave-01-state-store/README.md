# Wave 01: State Store & Action Extraction

## 🎯 Objective
Extract global UI states and API request wrappers from `src/client/main.ts` into a dedicated state container (`src/client/state/store.ts`) and centralized action triggers (`src/client/state/actions.ts`). This decouples business logic from rendering and resolves monolith fragility.

## 📂 Target Files
* **[NEW]** `src/client/state/store.ts`
* **[NEW]** `src/client/state/actions.ts`
* **[NEW]** `src/client/components/Common.ts`
* **[NEW]** `src/client/components/CommandCenter.ts`
* **[NEW]** `src/client/components/DriftRadar.ts`
* **[NEW]** `src/client/components/PolicyWorkbench.ts`
* **[NEW]** `src/client/components/CalibrationStudio.ts`
* **[NEW]** `src/client/components/EvidenceGraph.ts`

## 🛠️ Step-by-Step Implementation Instructions

### 1. Initialize State Store (`store.ts`)
* Define an interface `GlobalState` containing all UI variables:
  * `dashboardOpen: boolean`
  * `activePage: ProductPageId`
  * `themePreference: ThemePreference`
  * `scanState: ScanUiState`
  * `policyState: PolicyUiState`
  * `policyReplayState: PolicyReplayUiState`
  * `applyState: ApplyUiState`
  * `casePacketState: CasePacketUiState`
  * `governanceState: GovernanceUiState`
  * `receiptLedgerState: ReceiptLedgerUiState`
  * `digestState: DigestUiState`
  * `v2ProductState: V2ProductState`
* Implement a state listener registry:
  ```typescript
  type RenderCallback = () => void;
  const listeners: RenderCallback[] = [];
  export function registerListener(cb: RenderCallback) { listeners.push(cb); }
  export function notifyListeners() { listeners.forEach(cb => cb()); }
  ```
* Export a wrapper `updateState(updater: (state: GlobalState) => void)` that modifies the global state and triggers `notifyListeners()`.

### 2. Extract API Helpers (`actions.ts`)
* Implement the custom `fetchApi` function with proper timeout limits:
  ```typescript
  export async function fetchApi<T>(route: string, init?: RequestInit): Promise<T> {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), 12000);
    const res = await fetch(route, { ...init, signal: controller.signal });
    clearTimeout(id);
    if (!res.ok) throw new Error(`HTTP Error ${res.status}`);
    return (await res.json()) as T;
  }
  ```
* Extract async action dispatchers:
  * `runScanAction()`: hits `/api/scans`, updates `scanState`.
  * `resetDemoAction()`: hits `/api/demo/reset`, clears state.
  * `loadDashboardData()`: retrieves initial metrics.

### 3. Component Shell Setup
* Inside `src/client/components/`, initialize files that will contain the rendering methods.
* Each file should export a `render(state)` method returning HTML template strings and a `bind(container, state)` method that attaches event listeners.

## 🧪 Verification Plan
* Run typescript type checking:
  ```bash
  npm run type-check
  ```
* Ensure no regressions in existing tests:
  ```bash
  npm test
  ```
