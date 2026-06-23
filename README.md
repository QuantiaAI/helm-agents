# HelmAgents

**[English](README.md)** · [简体中文](README.zh-CN.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [Español](README.es.md) · [Tiếng Việt](README.vi.md)

[![License: Apache-2.0](https://img.shields.io/badge/license-Apache--2.0-blue.svg)](LICENSE)
[![Node](https://img.shields.io/badge/node-%E2%89%A522-green.svg)](package.json)
[![pnpm](https://img.shields.io/badge/pnpm-11-orange.svg)](package.json)
[![API: NestJS](https://img.shields.io/badge/API-NestJS%2011-e0234e.svg)](https://nestjs.com)
[![Web: React + Vite](https://img.shields.io/badge/Web-React%2019%20%2B%20Vite-646cff.svg)](https://vitejs.dev)

**Multi-agent LLM trading, at the helm.** Thirteen AI analysts research, debate,
stress-test risk, and converge on a single, traceable trade decision — streamed
live in your browser.

> An **independent**, TypeScript-native project: a browser-first, fully
> observable trading desk built on a standalone **NestJS API** + **React + Vite**
> SPA — streaming, traceable, and provider-agnostic.

---

## 💸 Trade tokenized US stocks — save 20%+ on fees

**Act on every decision and get 20%+ of your trading fees back.** Buy the same US
stocks (NVDA, AAPL, …) as **tokenized stocks** on Binance / OKX / Gate, paid with
crypto — register with our invite code and **20%+ of every trade's fee is
automatically returned to your exchange account within about an hour**:

| Exchange | Invite code | Sign up |
|---|---|---|
| **Binance** | `FANWO20` | <https://www.binance.com/join?ref=FANWO20> |
| **OKX** | `FANGEIWO` | <https://www.okx.com/join/FANGEIWO> |
| **Gate** | `FANGEIWO` | <https://www.gate.io/share/FANGEIWO> |

> Fee rebates powered by our sponsor **[rebateto.me](https://rebateto.me/how_to_referral)**.
> Full details, mainland-China mirror links, and how to claim →
> [Act on the decision](#act-on-the-decision--trade-tokenized-us-stocks-and-save-20-on-fees).
> *Referral links — they support this project at no extra cost to you. Not
> investment advice; crypto/tokenized stocks carry risk.*

---

## Why HelmAgents?

HelmAgents models a whole trading firm with LLM-powered analysts, researchers, a
trader, risk analysts, and a portfolio manager, and has them converge on a 5-tier
trade decision backed by full reasoning. But it doesn't stop at a CLI research
script — it's a real product, **observable, shareable, provider-agnostic, and
built to keep improving**:

- **Watch it think.** A live, streaming timeline (SSE) shows each analyst and
  every debate turn as it completes — no more staring at a terminal until the
  end.
- **No Python required.** A NestJS API hosts the engine; a React/Vite SPA drives
  it. Configure a run in the browser, press a button, read the decision.
- **Bring your own model.** A 20-provider registry (OpenAI-compatible family +
  native Anthropic/Google) means you are not locked to one vendor.
- **Traceable, replayable decisions.** Every run is persisted with its full
  reasoning (analyst reports, bull/bear + risk debates, final decision), and can
  be exported as Markdown.
- **Act on it — and pay less.** Trade the same names as **tokenized stocks** on
  Binance / OKX / Gate, and register with invite code `FANWO20` (Binance) or
  `FANGEIWO` (OKX / Gate) for a **20%+ fee rebate** (returned to your account
  within ~1h of each trade). See [Act on the
  decision](#act-on-the-decision--trade-tokenized-us-stocks-and-save-20-on-fees).
- **Safe by default.** API keys are encrypted at rest (AES-256-GCM); run data
  stays on your machine; nothing phones home.

> ⚠️ **Not financial advice.** HelmAgents produces AI-generated analysis for
> research and education only. It can be wrong. Verify independently; trading
> and crypto assets carry risk, including loss of principal.

## What it does

Given a `(ticker, tradeDate)`, a 13-agent pipeline produces a 5-tier trade
decision (**Buy / Overweight / Hold / Underweight / Sell**) with full supporting
analysis:

1. **Analysts** — Market · Sentiment · News · Fundamentals gather data.
2. **Investment debate** — Bull ⇄ Bear researchers debate; a Research Manager
   judges it into a structured investment plan.
3. **Trader** — translates the plan into a buy/hold/sell proposal with entry,
   stop-loss and sizing.
4. **Risk debate** — Aggressive / Conservative / Neutral analysts stress-test it.
5. **Portfolio Manager** — synthesizes everything into the final decision.

## How it works

The pipeline runs as a LangGraph.js `StateGraph` and streams `nodeEnd` events to
the browser as each agent finishes. Analysts pre-fetch their data inline
(equivalent output to the original tool-calling loop, without the extra
round-trips), and every report, debate transcript, and the final decision are
captured in the run state.

## Architecture

pnpm monorepo with a **separated frontend and backend**. The engine and all
business logic live in framework-agnostic packages; the NestJS API hosts them,
and the React/Vite SPA talks to the API over HTTP (typed by a shared contracts
package).

```
apps/
  api           NestJS (ESM) — hosts the engine; REST endpoints under /api (incl. auth)
  web           React 19 + Vite SPA — react-router, react-i18next (8 locales)
packages/
  contracts     shared HTTP DTO types (pure types — no runtime) for api ↔ web
  core          createEngine() / propagate() / streamEvents()  — single entry point
  workflow      LangGraph.js StateGraph: topology + conditional debate/risk routing
  agents        13 agent factories (analysts/researchers/trader/risk/managers)
  dataflows     vendor routing (routeToVendor) + error hierarchy + yfinance
  llm           20-provider registry + OpenAI-compatible client
  config        DEFAULT_CONFIG + three-layer merge (env → runtime)
  persistence   SQLite store (node:sqlite) — accounts, auth tokens, per-user keys/settings/runs/memory
  shared        Zod schemas, AgentState, rating, symbol utils
```

**Data flow:** `apps/web` (SPA) → HTTP `/api/*` → `apps/api` (NestJS) →
`core.propagate()` → `workflow.buildGraph()` → `agents.*`
(call `dataflows.routeToVendor`) + `llm.createLlmClient`. The run timeline
streams from the API as NDJSON.

## Installation

Two one-click ways to get running. Both start the app in normal mode — then open
the app, **create an account** (open sign-up), go to **Settings**, pick an LLM
provider and paste your API key (stored encrypted per account). No key yet? See
the DEMO option under [Usage](#usage). Requires **Node ≥ 22**.

### Option A — local one-click script

Requires **Node.js ≥ 22** (pnpm is set up automatically via corepack).

```bash
git clone <repo-url>
cd tradingagents-web
./scripts/install.sh
```

The script installs dependencies, builds everything, and starts the API
(`:5171`) + web SPA (`:5170`). Open **<http://localhost:5170>**.

### Option B — Docker one-click

Requires **Docker** (with Compose). No Node/pnpm needed.

```bash
git clone <repo-url>
cd tradingagents-web
docker compose up --build
```

This builds and runs two containers — the NestJS API and an nginx-served SPA that
reverse-proxies `/api` to it. Open **<http://localhost:8080>**. Runs, settings,
and encrypted keys persist in the `helmagents-store` volume. To try without a key,
set `DEMO_LLM=1` for the `api` service in `docker-compose.yml`.

> Manual setup (for development): `pnpm install` then `pnpm dev`. If `pnpm
> install` warns about ignored build scripts (esbuild / msw / sharp / @swc/core),
> set the matching entry to `true` under `allowBuilds:` in `pnpm-workspace.yaml`
> or run `pnpm approve-builds`.

## Usage

The app supports **8 languages**: `/en /zh /ja /ko /fr /de /es /vi`. The bare
path `/` redirects to `/en`.

### 1. Demo mode — no API key required

```bash
DEMO_LLM=1 pnpm dev
```

`pnpm dev` starts **both** apps via Turbo: the NestJS API on
`http://localhost:5171` and the Vite SPA on `http://localhost:5170` (the dev
server proxies `/api` → the API). `DEMO_LLM=1` drives the **full 13-agent
pipeline** with a deterministic stub LLM — streaming, persistence, cancellation,
and reflection all run for real; only the final text generation is stubbed.
Perfect for demos, UI work, and local verification.

Open `http://localhost:5170/en`, go to **/analyze**, configure a run, and press
**Run analysis**.

### 2. Real LLM mode

Configure one provider's API key — either in `/settings` (encrypted at rest) or
via environment variables (see [`.env.example`](.env.example)):

```bash
export OPENAI_API_KEY=sk-...
# optional overrides
export TRADINGAGENTS_LLM_PROVIDER=openai
export TRADINGAGENTS_DEEP_THINK_LLM=gpt-5.5
export TRADINGAGENTS_QUICK_THINK_LLM=gpt-5.4-mini
pnpm dev
```

Then run an analysis on **/analyze**. The report language follows the URL locale
(e.g. `/zh/analyze` → Chinese report). In production the SPA and API deploy
separately — point the SPA at the API with `VITE_API_BASE_URL` and allow its
origin via `CORS_ORIGIN` (see [`.env.example`](.env.example)).

| Path | What |
|---|---|
| `/<locale>` | Home — the pipeline |
| `/<locale>/analyze` | Configure & **stream** an analysis |
| `/<locale>/history` | Past runs |
| `/<locale>/runs/<id>` | Run detail + Markdown export |
| `/<locale>/settings` | Provider / models / data vendors / API keys |

> Full run guide (DEMO mode, real LLM, troubleshooting):
> [`docs/RUNNING.md`](docs/RUNNING.md)

## Act on the decision — trade tokenized US stocks and save 20%+ on fees

HelmAgents doesn't stop at a rating — it helps you **act on it and trade cheaper**.
The same US equities (NVDA, AAPL, …) trade as **tokenized stocks** on major crypto
exchanges, bought and sold around the clock with crypto, no traditional brokerage
needed. The app surfaces this on the home page and every run-detail page (the
"Buy tokenized stocks" card).

> 💸 **Register with HelmAgents' invite codes — `FANWO20` on Binance, `FANGEIWO`
> on OKX / Gate — and 20%+ of every trade's fee is automatically returned to your
> exchange account within about an hour of each trade.** Trading fees are the one
> cost you fully control, and this rebate is what keeps HelmAgents free and
> maintained — so using the links below directly supports the project at no extra
> cost to you.

### Supported exchanges & rebate

| Exchange | Sign-up link | Invite code | Fee rebate |
|---|---|---|---|
| **Binance** (`binance.com`) | <https://www.binance.com/join?ref=FANWO20> | `FANWO20` | **20%+ back** |
| **OKX** (`okx.com`) | <https://www.okx.com/join/FANGEIWO> | `FANGEIWO` | **20%+ back** |
| **Gate** (`gate.io`) | <https://www.gate.io/share/FANGEIWO> | `FANGEIWO` | **20%+ back** |

### How to claim the fee rebate

1. **Open a sign-up link above** (or enter your exchange's invite code manually
   during registration — `FANWO20` for Binance, `FANGEIWO` for OKX / Gate). The
   rebate binds to the account **at signup**, so use the code from the start —
   it generally can't be added to an existing account.
2. **Finish the exchange's signup / KYC** and deposit crypto.
3. **Trade** — search the stock's tokenized symbol and act on the agents' rating
   (Buy / Overweight / Hold / Underweight / Sell). 20%+ of each trade's fee is
   then returned to your exchange account automatically, within about an hour —
   there's nothing else to do.

> **In the app, enter the invite code at signup** (`FANWO20` Binance · `FANGEIWO` OKX/Gate) — it's easy to skip, and the rebate can't be added afterward.
>
> **One account per ID per exchange.** Already registered? A family member can sign up with the code to claim the rebate.

See **[how the rebate works →](https://rebateto.me/how_to_referral)** for the
current per-exchange rates and full terms. Inside the app, the exchange cards also
pull **live invite links** and expose **backup/mirror links** (under "Show backup
links") when the official domain is DNS-blocked (e.g. in mainland China).

> **Disclosure & risk.** The sign-up links above are **referral links** — the
> author receives a fee rebate when you register through them, at **no extra cost
> to you** (you get 20%+ of your fees back; the exchange shares part of its cut).
> Using them is entirely voluntary. Tokenized stocks and crypto carry risk
> **including loss of principal**, are not available in every jurisdiction, and
> HelmAgents' output is **AI-generated analysis for research/education only — not
> investment advice**. Verify independently and comply with your local laws and
> each exchange's terms.

## Authentication & multi-tenancy

The app is **multi-tenant**: each user is an isolated account. Sign-up is open
(register with email + password) and **only authenticated users can configure LLM
providers/keys or run analyses** — every `/api/*` endpoint except health, docs, and
`/api/auth/*` requires a Bearer token. Each user's API keys, settings, runs, and
reflection memory are stored separately (SQLite, scoped by user id); a user's keys
are injected into their own engine at run time (never the global environment), so
accounts never see each other's data. The token API (JWT access + rotating refresh)
is client-agnostic — the React SPA and a future native app share it.

**Env:**

| Var | Default | Purpose |
|---|---|---|
| `AUTH_JWT_SECRET` | dev placeholder | HMAC secret for access tokens — **set a strong value in production** |
| `AUTH_ACCESS_TTL_SEC` | `900` | Access-token lifetime |
| `AUTH_REFRESH_TTL_SEC` | `2592000` | Refresh-token lifetime |
| `AUTH_BOOTSTRAP_EMAIL` / `AUTH_BOOTSTRAP_PASSWORD` | — | Optional: seed a first account on boot |

> Requires **Node ≥ 22** (uses the built-in `node:sqlite`).

## Configuration

The engine resolves config with the same three-layer merge as the original:
`DEFAULT_CONFIG → TRADINGAGENTS_* env vars → runtime overrides (the Settings page)`.

See [`packages/config/src/default-config.ts`](packages/config/src/default-config.ts)
for the full key list and
[`packages/llm/src/api-key-env.ts`](packages/llm/src/api-key-env.ts) for every
provider's key variable.

## Development

```bash
pnpm install
pnpm dev             # start the API (NestJS) + SPA (Vite) together via Turbo
pnpm test            # run all package + app tests (black-box TDD)
pnpm typecheck       # tsc --noEmit across the workspace
pnpm build           # build every package + both apps
pnpm --filter api dev          # API only (nest start --watch, :5171)
pnpm --filter web dev          # SPA only (vite, :5170)
pnpm --filter <pkg> test       # one package
```

Contributions follow **black-box TDD** (Red → Green → Refactor) and keep all
**8 locales in key parity**. See [**CONTRIBUTING.md**](CONTRIBUTING.md) for
setup, conventions, and commit style. CI (`.github/workflows/ci.yml`) runs
`typecheck`, `test`, and `build` on every push and pull request.

## Status

**Phases 0–4 complete**, plus a **frontend/backend split** (NestJS API + Vite
SPA). The engine runs the full 13-agent pipeline end-to-end with streaming,
persistence, settings, and reflection. All tests pass and `pnpm build` is clean.
See the design specs under `docs/superpowers/specs/`.

## Acknowledgements

HelmAgents was **inspired by** [**TradingAgents**](https://github.com/TauricResearch/TradingAgents)
by Tauric Research (Apache-2.0) — its multi-agent trading-decision design sparked
this project. HelmAgents is an **independent** work (not a port) that reimagines
the idea in TypeScript and aims to take it further; attribution to the upstream
project is gratefully retained in [NOTICE](NOTICE).
The original paper: [arXiv 2412.20138](https://arxiv.org/abs/2412.20138). Built
with [NestJS](https://nestjs.com), [React](https://react.dev) +
[Vite](https://vitejs.dev), [LangGraph.js](https://github.com/langchain-ai/langgraphjs),
and [i18next](https://www.i18next.com).

## License

Licensed under the **Apache License, Version 2.0**. HelmAgents was inspired by
TradingAgents (also Apache-2.0); attribution to the upstream project is retained
in [NOTICE](NOTICE). See [LICENSE](LICENSE) for the full terms.

By contributing, you agree your contributions are licensed under Apache-2.0 and
that you follow the [Code of Conduct](CODE_OF_CONDUCT.md). To report a security
issue, see [SECURITY.md](SECURITY.md).
