# AGENT_E_TESTS_DOCS_RUNTIME.md

## Role

You own integration tests, docs synchronization, and runtime verification for Wave 3/4.

## Read First

- `AGENTS.md`
- `PLAN.md`
- `RESEARCH.md`
- `TODO.md`
- `docs/WAVE3_4_EXECUTION_NOTES.md`
- all Wave 3/4 prompts

## Goal

Ensure Wave 3/4 is testable, documented, and does not regress Wave 2.

## Required Work

### 1. Test Coverage

Add/update tests for:

- policy creation/update,
- policy recommendation,
- no-policy fallback,
- apply-policy preview,
- apply-policy confirm with `log_only`,
- deviation detection,
- override reason required,
- override aggregate summary,
- demo mode policy/apply flow.

### 2. Integration Smoke

Create a documented manual QA checklist:

- load dashboard,
- run demo scan,
- create policy from drift,
- edit policy,
- apply policy using simulator or menu action,
- select matching action,
- select deviating action,
- record override,
- view override summary.

### 3. Documentation

Update:

- `TODO.md`
- `RESEARCH.md`
- `docs/PRODUCT.md`
- `docs/DATA_MODEL.md`
- `docs/DEMO_SCRIPT.md`
- `docs/SUBMISSION_NOTES.md`

Reflect actual Wave 3/4 implementation.

### 4. Runtime Verification

Run:

```bash
npm install
npm run build
npm test
npm run type-check || true
npm run lint || true
npx devvit whoami
npm run dev
```

Document exact result.

If `npm run dev` remains blocked:
- document why,
- do not pretend playtest passed.

### 5. Audit Vulnerabilities

Wave 2 reported 31 audit vulnerabilities.

Run:

```bash
npm audit
```

Do not blindly run `npm audit fix --force`.

Document:
- severity,
- whether they affect dev dependencies,
- whether safe fix is available,
- whether to defer.

## Do Not Build

- new product features beyond Wave 3/4 scope,
- Devpost final submission,
- LLM/AI features.

## Completion Report

Write a Wave 3/4 completion report in `TODO.md` or `docs/WAVE3_4_EXECUTION_NOTES.md` with:

- summary,
- files changed,
- commands run,
- pass/fail status,
- runtime status,
- known risks,
- next recommended wave.
