# Wave 10: Drift Radar: Interactive Action Distribution Spread

## 🎯 Objective
Convert static Drift Radar rule cards into interactive expandable drawers. Show action distribution spreads as horizontal progress bars (e.g. Warn: 40%, Remove: 60%) to visually illustrate policy drift.

## 📂 Target Files
* **[MODIFY]** `src/client/components/DriftRadar.ts`
* **[MODIFY]** `src/client/styles.css`

## 🛠️ Step-by-Step Implementation Instructions

### 1. Make Drift Cards Clickable
* In `DriftRadar.ts`, bind a click listener to each rule candidate card.
* When clicked, toggle the rule name inside local UI state `driftRadarExpandedRule`.

### 2. Render Action Spread Progress Bars
* When a rule card is expanded, render an details panel:
  * Title: "Enforcement Action Spread"
  * Calculate the total actions associated with this rule.
  * For each action type (e.g., `warn`, `remove`, `ban`), render a horizontal bar container:
    ```html
    <div class="distribution-row">
      <span class="action-label">${actionName}</span>
      <div class="progress-track">
        <div class="progress-fill" style="width: ${percentage}%"></div>
      </div>
      <span class="count-label">${count} (${percentage}%)</span>
    </div>
    ```
* Style progress fills with modern HSL color gradients in `styles.css`.

## 🧪 Verification Plan
* Run typescript validation:
  ```bash
  npm run type-check
  ```
* Open the drawer inside the browser and check that distribution values sum to 100%.
