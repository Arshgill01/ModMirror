# Wave 13: Entrypoint Bootstrap Refactoring

## 🎯 Objective
Refactor the client's entrypoint script (`src/client/main.ts`) from a massive monolithic rendering code block into a clean, lightweight bootstrap file. The bootloader imports the modular components and state store, and wires up event listeners.

## 📂 Target Files
* **[MODIFY]** `src/client/main.ts`

## 🛠️ Step-by-Step Implementation Instructions

### 1. Strip Rendering Logic
* Delete all local rendering helpers from `src/client/main.ts` (e.g. `render()`, `renderActPage()`, `renderV2CommandCenterPanel()`, `renderV2DriftRadarPanel()`, etc.).
* Delete local state variables and replace them with imports from `src/client/state/store.ts`.

### 2. Set Up Component Imports
* Import the modular component rendering packages:
  ```typescript
  import { renderCommon } from './components/Common';
  import { renderCommandCenter, bindCommandCenter } from './components/CommandCenter';
  import { renderDriftRadar, bindDriftRadar } from './components/DriftRadar';
  import { renderPolicyWorkbench, bindPolicyWorkbench } from './components/PolicyWorkbench';
  import { renderCalibrationStudio, bindCalibrationStudio } from './components/CalibrationStudio';
  import { renderEvidenceGraph, bindEvidenceGraph } from './components/EvidenceGraph';
  import { registerListener } from './state/store';
  ```

### 3. Initialize the Rendering Cycle
* Define the central bootstrapping entrypoint:
  ```typescript
  function render() {
    const state = getGlobalState();
    let pageHtml = '';
    switch (state.activePage) {
      case 'act': pageHtml = renderCommandCenter(state); break;
      case 'scan': pageHtml = renderDriftRadar(state); break;
      case 'agree': pageHtml = renderPolicyWorkbench(state); break;
      case 'prove': pageHtml = renderEvidenceGraph(state); break;
      // other page render cases
    }
    appRoot.innerHTML = renderCommon(state, pageHtml);
    bindEvents(appRoot, state);
  }
  ```
* Register `render` as a listener in the state store: `registerListener(render)`.
* Run the initial `render()` call on browser load.

## 🧪 Verification Plan
* Run typescript validation and compilation build:
  ```bash
  npm run type-check
  npm run build
  ```
* Check console logs in the dev server for any circular dependency errors.
