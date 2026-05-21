# Wave 05: "Onboard a New Mod": Quiz Verification & Scorecard

## 🎯 Objective
Connect the onboarding quiz choices to the backend calibration verification endpoint. Show alignment feedback boxes with colored badges and render a detailed scorecard summary upon completion.

## 📂 Target Files
* **[MODIFY]** `src/client/components/CalibrationStudio.ts`
* **[MODIFY]** `src/client/state/actions.ts`

## 🛠️ Step-by-Step Implementation Instructions

### 1. Verification Submit Handler
* In `src/client/state/actions.ts`, implement `submitScenarioAnswer(scenarioId, selectedAction)`.
* Post the selection to the `/api/calibration/answers` endpoint.
* Save the returned `CalibrationAnswerResult` into `v2ProductState.calibrationResult`.

### 2. Alignment Feedback View
* When a scenario is submitted, hide the radio buttons and display the results:
  * Render an alignment alert badge with custom color styling:
    * **Green** (`aligned`): "Aligned with Team Policy"
    * **Orange** (`acceptable_alternative`): "Acceptable Alternative"
    * **Red** (`review_recommended`): "Review Recommended - Differs from Norm"
  * Render the backend-provided explanation text (`explanation`) inside a glassmorphism card block.
  * Provide a "Submit Answer" button that posts to the server, and transforms into a "Continue to Next Scenario" button once verified.

### 3. Summary Scorecard
* When `currentScenarioIndex` reaches the end of the scenarios array, render the final summary scorecard:
  * Large alignment title: "Onboarding Quiz Completed!"
  * Visual score: "You aligned with the team on **X** out of **Y** scenarios."
  * Detail: Show a checklist of all scenario names with checkmarks for aligned answers and warnings for review-recommended answers.
  * Provide a "Retake Quiz" button that resets the local `quizState` variables and routes the user back to scenario index 0.

## 🧪 Verification Plan
* Run lint checks and tests:
  ```bash
  npm run lint
  npm test
  ```
* Complete the quiz in the browser and verify the final alignment details render correctly.
