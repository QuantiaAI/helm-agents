# Security Policy

HelmAgents runs LLM-powered financial analysis locally and stores API keys and
run history on your own machine. This document explains the security model and
how to report vulnerabilities.

## Supported versions

Only the latest release line on `main` receives security fixes.

| Version | Supported |
|---|---|
| latest `main` | ✅ |
| older / archived branches (e.g. `archive/*` tags) | ❌ |

## Reporting a vulnerability

**Please do not open a public GitHub issue for security problems.** Instead:

1. Use GitHub's **"Report a vulnerability"** (Security → Advisories → New) for
   the repository, **or**
2. Email the maintainers at **security@helmagents.example**
   *(maintainers: replace this placeholder with a real, monitored address before
   publishing)*.

Include a description, reproduction steps, and the impact. We aim to acknowledge
reports within a few days and to coordinate a fix and disclosure timeline with
you. Responsible disclosures are greatly appreciated.

## Security model

### API keys (encrypted at rest)

- Provider API keys entered on `/settings` are encrypted with **AES-256-GCM**
  before being written to disk, in the per-user SQLite store
  (`~/.tradingagents-web/store/app.db`, `user_keys` table).
- The encryption key (`master.key`) is auto-generated, stored with `0600`
  permissions, and never leaves the machine.
- API responses only ever return a **masked status** (e.g. whether a key is
  set), never the secret itself.

### Local-only storage

- Accounts, runs, memory, settings, and encrypted keys are stored in a local
  SQLite database (`~/.tradingagents-web/store/app.db`), **scoped per user**. No
  telemetry, analytics, or phone-home behavior is included — the app does not send
  data anywhere unless you trigger a run (which calls the LLM/data **vendors you
  configured**).

### Network egress

The only outbound network calls are the ones **you** enable:

- The LLM provider endpoint you configure (OpenAI, Anthropic, Google, DeepSeek,
  Ollama, etc.).
- The data vendors you configure (yfinance, Alpha Vantage, FRED, Polymarket,
  Reddit, StockTwits, …).
- The browser-side referral-link JSON (`https://fangeiwo.net/invite_links.json`)
  fetched only on the tokenized-stock CTA, to resolve mainland-China mirror
  links.

Audit and restrict these with your firewall/DNS as appropriate.

### Out of scope / hardening you may want

- This is a **research/educational** project. It has **not** undergone a formal
  security audit.
- The local store is **not** encrypted as a whole (only API keys are). If your
  machine is shared or compromised, an attacker could read run history. Consider
  full-disk encryption and a dedicated user account.
- The backend is a **standalone NestJS API** (`apps/api`, default port `5171`,
  all routes under `/api`); the frontend is a separate static SPA (`apps/web`).
  The API requires **authentication** (email + password → JWT access token +
  rotating refresh token; every route except health, docs, and `/api/auth/*`
  needs a valid Bearer token) and enforces **per-user isolation** (each account
  only sees its own keys, settings, runs, and memory). It does **not** yet provide
  **rate limiting** or email-based account recovery. Set a strong `AUTH_JWT_SECRET`
  in production, and still front the API with a reverse proxy that adds TLS and
  rate limiting before exposing it to the public internet.
- Cross-origin access is controlled by the `CORS_ORIGIN` allow-list (see
  [`.env.example`](.env.example)). Unset reflects the request origin — fine for
  local dev, but **set an explicit allow-list in any shared/production
  deployment** so arbitrary web origins can't call your API from a browser.

## Not financial advice

HelmAgents produces AI-generated analysis for research and educational purposes
only. It is **not** investment advice and makes no guarantee of correctness or
profitability. Trading and crypto assets carry risk, including loss of
principal. Verify everything independently before acting.
