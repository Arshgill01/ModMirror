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
- Upgraded safe direct dev-tool patch/minor dependencies:
  - `globals` from `17.2.0` to `17.6.0`;
  - `prettier` from `3.8.1` to `3.8.3`;
  - `typescript-eslint` from `8.54.0` to `8.59.4`;
  - `vitest` from `4.0.15` to `4.1.7`.
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
- `npm run deploy`

The safe dev-tool bump follow-up passed:

- `git diff --check`
- `npm run type-check`
- `npm run lint`
- `npm test` with `62` files and `263` tests on `vitest 4.1.7`
- `npm run build`
- `npx devvit --version`
- `npx devvit whoami`

`npm run deploy` passed after the hardening work and uploaded Devvit app version
`0.0.2` with `4` new WebView assets. This proves deploy/upload readiness for the
current build; it does not prove authenticated route-level WebView behavior.

`npx devvit view --json` after the upload returned version `0.0.2` with
`buildStatus: 1`, `publicApiVersion: "0.12.24"`, and app capabilities
`[10, 11]`. Installed Devvit protos map those capability values to `MODERATOR`
and `WEBVIEW`.

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

After the safe dev-tool bump follow-up, `npm audit --omit=dev` still reports the
same remaining Devvit-transitive `protobufjs <=7.5.7` advisory chain:

- `26 vulnerabilities (25 high, 1 critical)`

## Decision

Direct Hono/Vite findings and the safe Devvit-transitive `tmp`/`ws` findings are
remediated. Safe patch/minor dev-tool bumps were validated and kept exact-pinned.
Major Dependabot proposals for TypeScript 6, ESLint 10, Vite 8, and Node 25
types remain unmerged until they are separately proven against the Devvit
toolchain. The remaining npm audit failure is a documented dependency-chain
blocker pending an upstream Devvit/protobufjs fix or an explicit risk decision.
