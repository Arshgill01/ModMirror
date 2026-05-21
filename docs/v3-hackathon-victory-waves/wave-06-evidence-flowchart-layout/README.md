# Wave 06: Evidence Graph: 4-Lane Layout & Node Styling

## 🎯 Objective
Replace the flat, raw text list visualization of graph edges with a visually stunning 4-column lane flowchart representing the case progression.

## 📂 Target Files
* **[MODIFY]** `src/client/components/EvidenceGraph.ts`
* **[MODIFY]** `src/client/styles.css`

## 🛠️ Step-by-Step Implementation Instructions

### 1. Build the 4-Lane Columns Grid
* In `src/client/components/EvidenceGraph.ts`, set up a CSS grid container structure with four lanes:
  ```html
  <div class="evidence-lanes">
    <div class="evidence-lane" data-lane="context">
      <div class="lane-header">Context</div>
      <!-- Nodes: content_snapshot, case_packet -->
    </div>
    <div class="evidence-lane" data-lane="decisions">
      <div class="lane-header">Decisions</div>
      <!-- Nodes: receipt -->
    </div>
    <div class="evidence-lane" data-lane="policies">
      <div class="lane-header">Policy Reference</div>
      <!-- Nodes: policy -->
    </div>
    <div class="evidence-lane" data-lane="audits">
      <div class="lane-header">Audit & Review</div>
      <!-- Nodes: override, evidence_board -->
    </div>
  </div>
  ```

### 2. Group Nodes by Type
* Filter `v2ProductState.evidenceGraph.nodes` into the lanes:
  * **Context**: `node.type === 'content_snapshot' || node.type === 'case_packet'`
  * **Decisions**: `node.type === 'receipt'`
  * **Policies**: `node.type === 'policy'`
  * **Audits**: `node.type === 'override' || node.type === 'evidence_board'`

### 3. Style Cards & Add Icons
* Map each node type to specific styling selectors in `styles.css`:
  * `content_snapshot`: Subtle blue left-border (`border-left: 4px solid var(--mm-info)`), document icon.
  * `receipt`: Subtle green left-border (`border-left: 4px solid var(--mm-good)`), checkmark/stamp icon.
  * `policy`: Orange left-border (`border-left: 4px solid var(--mm-accent)`), scale/balance icon.
  * `override`: Red/yellow left-border (`border-left: 4px solid var(--mm-risk)`), exclamation/alert icon.

## 🧪 Verification Plan
* Run typescript validation:
  ```bash
  npm run type-check
  ```
* Resize viewport to verify that the grid columns scale down and wrap gracefully on tablet screens.
