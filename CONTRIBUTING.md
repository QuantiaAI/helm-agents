# Contributing to HelmAgents

Thanks for your interest in improving HelmAgents! This guide covers how to set
up the project locally and the conventions every contribution is expected to
follow. The short version: **black-box TDD**, **DRY without over-abstraction**,
and **keep the 8 locales in sync**.

## Prerequisites

| Tool | Version |
|---|---|
| Node.js | ≥ 22 (uses the built-in `node:sqlite`) |
| pnpm | ≥ 11 (the repo pins `pnpm@11.5.0` via `packageManager`) |

## Setup

```bash
git clone <repo-url>
cd tradingagents-web
pnpm install
```

If `pnpm install` warns about ignored build scripts, set the matching entry to
`true` under `allowBuilds:` in `pnpm-workspace.yaml` (or run `pnpm approve-builds`).

### Run the app (no API key required)

```bash
DEMO_LLM=1 pnpm dev
# starts the NestJS API (:5171) + Vite SPA (:5170) together via Turbo
# → http://localhost:5170/en  (also /zh /ja /ko /fr /de /es /vi)
```

`DEMO_LLM=1` drives the full 13-agent pipeline with a deterministic stub LLM,
so you can exercise streaming, persistence, and the UI end-to-end without any
paid key. For a real run, configure a provider key on `/settings` or via env
(see `.env.example`).

## Repository layout

pnpm + turbo monorepo with a separated frontend and backend. The engine and
business logic are framework-agnostic packages; the NestJS API hosts them and
the React/Vite SPA talks to it over HTTP (typed by a shared contracts package).

```
apps/
  api            NestJS (ESM) — hosts the engine; REST endpoints under /api
  web            React 19 + Vite SPA — react-router, react-i18next (8 locales)
packages/
  contracts      shared HTTP DTO types (pure types) for api ↔ web
  core           createEngine() / propagate() / streamEvents()
  workflow       LangGraph.js StateGraph
  agents         13 agent factories
  dataflows      vendor routing + error hierarchy
  llm            provider registry + OpenAI-compatible client
  config         DEFAULT_CONFIG + three-layer merge
  persistence    SQLite store (node:sqlite) — users, auth tokens, per-user keys/settings/runs/memory
  shared         Zod schemas, AgentState, utils
docs/            design specs + implementation plans + RUNNING.md
```

## Development conventions

### 1. Black-box TDD (Red → Green → Refactor)

Every new feature or fix starts with a test against **external behavior**
(input/output, API contract) — not internal implementation details.

1. **Red** — write a failing test; confirm it fails for the expected reason.
2. **Green** — write the minimal code to make it pass; do not over-design.
3. **Refactor** — clean up while keeping tests green.

Do not write implementation first and backfill tests afterward. Tests live in
each project's `tests/` or `test/` directory (e.g. `packages/core/tests/`,
`apps/api/test/` e2e specs, `apps/web/test/` component specs) and target
contracts like `propagate` I/O, vendor fallback chains, provider resolution,
config merge, and HTTP endpoint behavior. The API is tested end-to-end with
supertest; the SPA mocks HTTP with MSW; LLM calls use injectable stubs, so the
suite runs fully offline.

### 2. DRY, no premature abstraction

Extract shared logic/config into a single source of truth, but do not couple
semantically different code just because it looks similar. Keep the brand
strings in `apps/web/src/lib/brand.ts` and link-resolution logic in pure modules.

### 3. Internationalization (8 locales)

UI copy lives in `apps/web/messages/{en,zh,ja,ko,fr,de,es,vi}.json`. A test
(`apps/web/test/messages.test.ts`) enforces **key-set parity** across all eight
files — any new key must be added to all of them or CI fails. Rules:

- Add the key to `en.json` first (the reference), then to the other seven.
- Preserve ICU placeholders verbatim (`{name}`, `{code}`, `{n}`, `{ticker}`).
- Brand names (`Binance`, `OKX`, `Gate`, `HelmAgents`) are **never** translated.

### 4. Commits

Conventional Commits, scoped:

```
feat(web): add tokenized-stock CTA to home page
fix(core): handle null vendor response in propagate
i18n(tokenized): localize rebate term across locales
docs(readme): expand installation section
refactor(brand): unify primary color token
test(web): add license metadata assertions
chore(deps): bump vitest
```

End commit bodies with:

```
Co-Authored-By: <author>
```

## Useful commands

```bash
pnpm install                      # install all workspace deps
pnpm test                         # run all package tests (turbo)
pnpm typecheck                    # tsc --noEmit across the workspace
pnpm build                        # build all packages + both apps
pnpm dev                          # API (:5171) + SPA (:5170) together
pnpm dev:clean                    # free dev ports 5170/5171 held by stale procs
pnpm --filter web test            # one project only
pnpm --filter web exec vitest run test/foo.test.ts    # one test file
pnpm --filter api dev             # API only (nest --watch, :5171)
pnpm --filter web dev             # SPA only (vite, :5170)
```

CI (`.github/workflows/ci.yml`) runs `typecheck`, `test`, and `build` on every
push and pull request — make sure all three are green before requesting review.

## Pull requests

1. Open a PR against `main` with a clear description of **what** and **why**.
2. New behavior ships with black-box tests.
3. Any user-facing copy is added to all 8 locales.
4. `pnpm test && pnpm typecheck && pnpm build` pass locally.
5. Reference the issue if applicable.

By contributing, you agree your contributions are licensed under the Apache
License, Version 2.0 (see [LICENSE](LICENSE)) and that you adhere to the
[Code of Conduct](CODE_OF_CONDUCT.md).
