# Wave 07: Evidence Graph: Link Lines & Reference Auditing

## 🎯 Objective
Visualize relationships between nodes inside the flowchart lanes using connection tags and outgoing/incoming markers. Call out missing references and privacy retention warnings cleanly.

## 📂 Target Files
* **[MODIFY]** `src/client/components/EvidenceGraph.ts`
* **[MODIFY]** `src/client/styles.css`

## 🛠️ Step-by-Step Implementation Instructions

### 1. Process Connection Edges
* For each node in `nodes`, scan `v2ProductState.evidenceGraph.edges` to find links:
  * **Incoming links** (`edge.to === node.id`): Capture the origin node label and display a badge: `⬅ [Origin Label]`.
  * **Outgoing links** (`edge.from === node.id`): Capture the destination node label and display a badge: `➡ [Dest Label]`.
* Render these connection badges at the bottom of each node card.

### 2. Format Edge Action Labels
* Style the relationship markers with a font-size of `11px`, high contrast, and rounded background pills (e.g. "Uses Policy", "Triggers Audit").

### 3. Display Audit Alerts & Missing Nodes
* Style `graph.missingReferences` inside a prominent alert banner at the top of the graph:
  * Warning icon + "Audit Warning: Gaps detected in action receipts! The following nodes are referenced but missing from this trace: [Node IDs]".
* Render `graph.privacyNotes` in a dedicated sidebar/footer notification panel detailing data retention limits.

## 🧪 Verification Plan
* Run vitest tests:
  ```bash
  npm test
  ```
* Verify in the browser that missing references render in red callouts and connection badges accurately match incoming/outgoing lines.
