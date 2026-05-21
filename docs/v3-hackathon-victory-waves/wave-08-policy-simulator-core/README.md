# Wave 08: Policy Simulator: Core Console Routing

## 🎯 Objective
Integrate the Policy Simulator panel alongside the Policy editor in the Policy Workbench page. Setup the trigger events and route requests to the `/api/policies/:id/simulate` backend endpoint.

## 📂 Target Files
* **[MODIFY]** `src/client/components/PolicyWorkbench.ts`
* **[MODIFY]** `src/client/state/actions.ts`
* **[MODIFY]** `src/client/state/store.ts`

## 🛠️ Step-by-Step Implementation Instructions

### 1. Declare Simulation State
* In `src/client/state/store.ts`, define the UI state for policy simulations:
  ```typescript
  export interface SimulationUiState {
    loading: boolean;
    error?: string;
    result?: PolicySimulationResult;
  }
  ```
* Register `simulationState` inside the global state store.

### 2. Embed Simulator Panel
* In `src/client/components/PolicyWorkbench.ts`, divide the layout into two columns for the policy form:
  * **Left Column**: The Policy step form.
  * **Right Column**: The Simulator console.
* Render a "Simulate Draft Impact" button inside the simulator console. Display a loading spinner when `simulationState.loading === true`.

### 3. Implement Simulation Action (`actions.ts`)
* Implement `simulatePolicyDraftAction(policyId, scanId, draftPolicy)`:
  * Set `simulationState.loading = true`.
  * Trigger `POST /api/policies/${policyId}/simulate` with the request body containing:
    * `scanId`: current active scan ID.
    * `draftPolicy`: JSON object of the active policy form draft (including edited steps).
  * Save the returned `PolicySimulationResult` to `simulationState.result` and set `loading = false`.
* Bind the button click to execute this action.

## 🧪 Verification Plan
* Run typescript checking:
  ```bash
  npm run type-check
  ```
* Verify simulation requests payload matches active form draft inputs exactly.
