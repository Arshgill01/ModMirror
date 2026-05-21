# Wave 13 — Policy Starter Templates And Overwrite Guard

Status: complete

## Objective

Make Policy Workbench starter templates usable without implying that a template
is already an adopted subreddit policy.

## Scope

- Render starter templates as labeled starting points in Policy Workbench.
- Let moderators load a starter ladder into the Policy Editor.
- Confirm before replacing current editor work.
- Preserve the existing draft-only save path, so starter-derived policies must
  still be reviewed and adopted before Apply Policy uses them.

## Acceptance Evidence

- Starter cards show `Starting point` and `Unsaved draft` labels.
- Template application checks the current editor form and asks for confirmation
  before replacing edits.
- The loaded template uses `mode: create`, blank `ruleKey`, and `active: false`
  is still applied by the existing save request builder.
- `policyWorkbench` tests cover that starter templates are returned as
  non-adopted template data, not policy records.
