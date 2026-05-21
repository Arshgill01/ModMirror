# Wave 11: Drift Radar: Scanned Representative Cases & Workbench Links

## 🎯 Objective
Render representative cases inside the Drift Radar expanded rule panel. Provide direct CTAs to "Calibrate Attribution" and "Create/Edit Policy" (pre-populating the Policy Workbench with the rule details).

## 📂 Target Files
* **[MODIFY]** `src/client/components/DriftRadar.ts`
* **[MODIFY]** `src/client/state/store.ts`

## 🛠️ Step-by-Step Implementation Instructions

### 1. Render Representative Cases
* Inside the expanded details drawer, look up cases associated with the target rule in the current scan data (`v2ProductState.driftRadar` or `scanState.result`).
* Render a list of cases with aggregate-safe metadata. Do not show moderator usernames unless a separately runtime-verified full-access visibility gate explicitly allows it.
  ```html
  <div class="drift-cases">
    <!-- Loop through representative cases -->
    <div class="drift-case-card">
      <div class="case-meta">Case ${index + 1} | Target type: ${item.targetThingId?.startsWith('t1_') ? 'comment' : 'post'}</div>
      <div class="case-desc">${item.evidence}</div>
      <div class="case-badge">Inferred Confidence: ${item.confidence}</div>
    </div>
  </div>
  ```
* If a target author is necessary for the moderator workflow, prefer an existing privacy-safe label or redacted display. Keep the core drift story about team consistency, not individual moderator performance.

### 2. Connect Quick CTAs
* Inside each representative case, render navigation links:
  * **[ Calibrate Attribution ]**: Clicking this redirects the user to the Scan page's Attribution Calibration section, automatically focusing on the target case ID.
  * **[ Create/Edit Policy ]**: Clicking this switches the page to the "Agree" tab, updates `policyState.form` with the current rule key/name, and focuses on the policy editor steps.

## 🧪 Verification Plan
* Run lint checks and verify styling layouts:
  ```bash
  npm run lint
  ```
* Verify in browser that clicking "Create/Edit Policy" switches pages to the Workbench and populates form rule inputs.
