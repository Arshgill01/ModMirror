# AGENT H — QA + Docs + Submission Readiness

Goal: verify the productized app and update docs.

Required checks: npm install, npm run build, npm run type-check, npm test, npm run lint, npm run dev.

Browser/screenshot QA: if browser automation/playwright/agent-browser exists, capture screenshots of inline card, command center, setup/demo, scan, policies, review inbox, case packet, digest, settings, and mobile width.

UI review: if uncodexify exists, use it and apply critique. If Gemini CLI exists, request design critique and save summary to docs/UI_REVIEW.md.

Docs: update README.md, TODO.md, docs/PRODUCT.md, docs/DEMO_SCRIPT.md, docs/SUBMISSION_NOTES.md, docs/PRODUCTIZATION_ACCEPTANCE_CHECKLIST.md, and RESEARCH.md if needed.

Acceptance: all checks pass or exact blocker documented; visual QA recorded; docs reflect productized UI.
