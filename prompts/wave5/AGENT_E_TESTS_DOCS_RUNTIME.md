# AGENT_E_TESTS_DOCS_RUNTIME.md — Tests, Docs, Runtime QA

## Mission

Make Wave 5 stable, documented, and reviewable.

## Read First

- AGENTS.md
- PLAN.md
- TODO.md
- RESEARCH.md
- docs/PRODUCT.md
- docs/DECISIONS.md
- docs/DATA_MODEL.md
- docs/DEMO_SCRIPT.md
- prompts/wave5/WAVE5_ORCHESTRATOR.md

## Tasks

### 1. Test Audit

Inspect existing tests.

Ensure Wave 5 has coverage for:

- policy version creation/editing,
- policy snapshot stamping,
- legacy policy fallback,
- policy health statuses,
- override review transitions,
- empty/sparse data states.

Add missing tests.

### 2. Command Verification

Run every available check:

```bash
npm install
npm run build
npm run type-check
npm run lint
npm test
```

If a script does not exist, document that it does not exist.

### 3. Runtime/Devvit QA

Run if environment supports it:

```bash
npx devvit whoami
npm run dev
```

If runtime is blocked by app identity/playtest config, do not hide it. Update RESEARCH.md/TODO.md with exact blocker.

### 4. Docs Update

Update:

- PLAN.md
- TODO.md
- README.md
- docs/PRODUCT.md
- docs/DECISIONS.md
- docs/DATA_MODEL.md
- docs/DEMO_SCRIPT.md

Add Wave 5 sections describing:

- policy version history,
- policy health,
- override review inbox,
- governance loop.

### 5. Submission Narrative Note

Update docs/SUBMISSION_NOTES.md with this expanded thesis:

> ModMirror does not just detect inconsistency. It gives teams a feedback loop: detect drift, set policy, enforce, review exceptions, and improve policy.

### 6. Known Limitations

Document honestly:

- historical attribution remains confidence-based,
- policy health depends on tracked action volume,
- per-mod analytics are intentionally avoided/gated,
- scheduler/digest and case packets are future waves.

## Acceptance Criteria

- All available local checks pass.
- Runtime blocker, if any, is documented.
- Docs accurately reflect implemented behavior.
- No unsupported claims are introduced.
- TODO.md identifies Wave 6 as Case Packet / Appeal Context.
