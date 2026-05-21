# Wave 12: Policy Workbench: Starter Templates Integration

## 🎯 Objective
Render and apply starter policy templates (e.g. "Civility Escalation Ladder") inside the policy editor form. Protect active user modifications using a validation confirmation dialog.

## 📂 Target Files
* **[MODIFY]** `src/client/components/PolicyWorkbench.ts`
* **[MODIFY]** `src/client/styles.css`

## 🛠️ Step-by-Step Implementation Instructions

### 1. Render Starter Templates Catalog
* Under the policy editor steps form, render a template selector panel.
* Display cards representing the starter templates available in `v2ProductState.policyWorkbench.starterTemplates`:
  * Title (e.g., "Standard Civility Ladder")
  * Summary (e.g., "1st: Remove + Warn, 2nd: Temp Ban")
  * A "Use Template" CTA button.

### 2. Implement the Confirmation Overwrite Guard
* Create a global overlay modal or confirm dialog utility function.
* When the user clicks "Use Template" in the form:
  * Check if `policyState.form.steps` contains modifications from the original saved policy.
  * If changes exist, display a visual confirmation modal overlay:
    * Title: "Overwrite Policy Steps?"
    * Warning details: "Applying this template will discard your current unsaved steps. This action cannot be undone."
    * Buttons: `[ Overwrite Steps ]` and `[ Cancel ]`.
  * If the user confirms or if the form is empty, replace the `policyState.form.steps` array with the template steps, and trigger a simulator refresh.

## 🧪 Verification Plan
* Run vitest tests:
  ```bash
  npm test
  ```
* Verify in the browser that clicking "Use Template" triggers the warning dialog only when local changes exist, and correctly populates the step editor inputs.
