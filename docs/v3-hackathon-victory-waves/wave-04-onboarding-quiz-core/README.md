# Wave 04: "Onboard a New Mod": Quiz Core

## 🎯 Objective
Create a step-by-step scenario selector for the onboarding quiz ("Team Policy Quiz"). Instead of showing all scenarios flat, the user must navigate scenario-by-scenario and choose an enforcement action.

## 📂 Target Files
* **[MODIFY]** `src/client/components/CalibrationStudio.ts`
* **[MODIFY]** `src/client/state/store.ts`

## 🛠️ Step-by-Step Implementation Instructions

### 1. Define Local Quiz State
* In `src/client/state/store.ts`, define `quizState`:
  ```typescript
  export interface QuizState {
    currentScenarioIndex: number;
    selectedActions: Record<string, EnforcementAction>;
    submittedAnswers: Record<string, boolean>;
  }
  ```
* Initialize `quizState` inside the global store.

### 2. Scenario-by-Scenario Layout (`CalibrationStudio.ts`)
* Implement the core rendering function `renderCalibrationStudio` (renamed from `renderTeamCalibrationPanel`).
* Read `v2ProductState.calibration.scenarios`.
* Render *only* the scenario corresponding to the `quizState.currentScenarioIndex`.
* The quiz card should display:
  * Scenario Title & description prompt.
  * The rule being calibrated.
  * A list of radio button options for action selections. Render standard enforcement options:
    * `remove`
    * `approve`
    * `warn`
    * `note`
    * `temporary_ban_suggested`
    * `permanent_ban_suggested`
  * Add navigation buttons: `[ Prev ]` and `[ Next ]` to change indices. Disable `Next` if no option is selected for the current scenario.

### 3. Event Binds
* In `bindCalibrationStudio`, listen for change events on the radio buttons.
* Save the user's selected choice to `quizState.selectedActions[scenario.id]`.
* Bind navigation button clicks to update `quizState.currentScenarioIndex`.

## 🧪 Verification Plan
* Run typescript validation:
  ```bash
  npm run type-check
  ```
* Click navigation buttons in the dev server and verify scenario index increments/decrements.
