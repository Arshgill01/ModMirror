# Wave 03: CommandCenter Dashboard & Setup Wizard

## 🎯 Objective
Port the CommandCenter view to a modular component, displaying the overall subreddit Policy Health scores directly on the launch dashboard to capture the judge's attention in under 4 seconds.

## 📂 Target Files
* **[MODIFY]** `src/client/components/CommandCenter.ts`
* **[MODIFY]** `src/client/components/Common.ts`

## 🛠️ Step-by-Step Implementation Instructions

### 1. Structure the Health Scorecard
* In `src/client/components/CommandCenter.ts`, implement a `renderPolicyHealthCard` helper.
* Read the consistency metrics from `v2ProductState.commandCenter` or `governanceState.health`.
* Output a visual consistency panel. If the subreddit contains policies, display:
  * A large circular progress meter (or visual percentage container) showing overall consistency.
  * A list of rule-by-rule breakdowns:
    * Green badge (e.g. `92% consistent`): Stable
    * Yellow badge (e.g. `65% consistent`): At Risk / Watch
    * Red badge (e.g. `38% consistent`): Critical / Drift Detected
* Provide a direct `[View Drift]` link next to problematic rules that redirects the user to the Drift Radar drill-down.

### 2. Implement the Setup Wizard Stepper
* Render a 3-step timeline wizard showing the onboarding lifecycle:
  * **Step 1: Mirror Scan**: Scan historical moderation logs.
  * **Step 2: Team Policy Quiz**: Check alignment on rules.
  * **Step 3: Workbench**: Formulate policy steps and resolve drift.
* Highlight the active step in green, with completed steps showing checkmarks.

### 3. DOM Event Binding
* In `bindCommandCenter(container, state, actions)`, attach click listeners to the tab triggers and scan button redirects. Ensure clicking the navigation switches pages without reloading.

## 🧪 Verification Plan
* Run typescript validation:
  ```bash
  npm run type-check
  ```
* Verify on mobile viewports (down to 390px) that the scorecard wraps cleanly.
