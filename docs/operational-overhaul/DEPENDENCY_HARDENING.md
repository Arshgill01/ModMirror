# Dependency Hardening

Date: 2026-05-21

## Scope

This follow-up reduces the known npm advisory surface without using force
upgrades or moving off the verified Devvit package line.

## Changes

- Upgraded `devvit`, `@devvit/start`, and `@devvit/web` from `0.12.23` to
  `0.12.24`.
- Upgraded `hono` from `4.11.7` to `4.12.21`.
- Upgraded `vite` from `7.3.1` to `7.3.3`.
- Added npm overrides for Devvit-transitive `tmp@0.2.5` and `ws@8.20.1`.
- Regenerated `package-lock.json` through `npm install`.

## Verification

The dependency update passed:

- `git diff --check`
- `npm run type-check`
- `npm run lint`
- `npm run build`
- `npm test`
- `npx devvit --version`
- `npx devvit whoami`

## Audit Result

Before this follow-up, `npm audit --omit=dev` reported:

- `32 vulnerabilities (3 low, 2 moderate, 26 high, 1 critical)`
- direct Hono and Vite findings
- Devvit-transitive `protobufjs`, `tmp`, and `ws` findings

After the direct dependency update, `npm audit --omit=dev` reported:

- `30 vulnerabilities (3 low, 2 moderate, 24 high, 1 critical)`
- remaining Devvit-transitive findings:
  - `protobufjs <=7.5.7`
  - `tmp <=0.2.3`
  - `ws 8.0.0 - 8.20.0`

After the npm override follow-up, `npm audit --omit=dev` reports:

- `26 vulnerabilities (25 high, 1 critical)`
- remaining Devvit-transitive findings:
  - `protobufjs <=7.5.7`

`npm audit fix` does not clear the remaining set. `npm audit fix --force` would
downgrade or otherwise break the Devvit package chain, so it was not run.

## Decision

Direct Hono/Vite findings and the safe Devvit-transitive `tmp`/`ws` findings are
remediated. The remaining npm audit failure is a documented dependency-chain
blocker pending an upstream Devvit/protobufjs fix or an explicit risk decision.
