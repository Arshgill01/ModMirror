# Wave 09: Policy Simulator: Delta Bars & Comparative Diff View

## 🎯 Objective
Render simulation delta results as color-coded horizontal bars representing the alignment percentage changes. List exact case-by-case deltas where the draft changes affect outcomes. Add controls to add or remove steps in-place.

## 📂 Target Files
* **[MODIFY]** `src/client/components/PolicyWorkbench.ts`
* **[MODIFY]** `src/client/styles.css`

## 🛠️ Step-by-Step Implementation Instructions

### 1. Render Horizontal Delta Bars
* Display a stacked progress bar representing cases from `simulationState.result.summary`:
  * Green bar: `same` (cases unchanged)
  * Red bar: `stricter` (cases receiving stricter enforcement)
  * Yellow/Blue bar: `looser` (cases receiving looser enforcement)
* Render percentages inside or alongside the bars (e.g. `Same: 80%`, `Stricter: 15%`, `Looser: 5%`).

### 2. Render Case Difference List
* Below the progress bars, render a scrollable comparative case list:
  ```html
  <div class="diff-list">
    <!-- Loop through simulationState.result.items -->
    <div class="diff-item" data-delta="${item.delta}">
      <div><strong>Action ID:</strong> ${item.actionId}</div>
      <div><strong>Historical:</strong> ${item.historicalAction}</div>
      <div><strong>Draft Recommendation:</strong> ${item.draftRecommendation}</div>
      <div><strong>Reasoning:</strong> ${item.evidence.join(', ')}</div>
    </div>
  </div>
  ```
* Hide items with `delta === 'same'` unless the user checks a "Show Unchanged Cases" filter box.

### 3. Step Editor Operations
* In `renderPolicyForm`, add buttons at the bottom of the steps checklist:
  * `[ + Add Escalation Step ]` and `[ - Remove Step ]`.
* Clicking `[ + Add Escalation Step ]` appends a new empty step object (`{ offenseCount: nextIndex, recommendedAction: 'warn', windowDays: 30 }`) to `policyState.form.steps`.
* Clicking `[ - Remove Step ]` slices the last element from the steps array.
* Trigger `simulatePolicyDraftAction` automatically on form/step changes to keep simulator updates live.

## 🧪 Verification Plan
* Run lint checks and verify styling layouts:
  ```bash
  npm run lint
  ```
* Verify adding/removing steps updates the simulation input structure dynamically.
