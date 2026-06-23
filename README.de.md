# HelmAgents

[English](README.md) · [简体中文](README.zh-CN.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Français](README.fr.md) · **[Deutsch](README.de.md)** · [Español](README.es.md) · [Tiếng Việt](README.vi.md)

[![License: Apache-2.0](https://img.shields.io/badge/license-Apache--2.0-blue.svg)](LICENSE)
[![Node](https://img.shields.io/badge/node-%E2%89%A522-green.svg)](package.json)
[![pnpm](https://img.shields.io/badge/pnpm-11-orange.svg)](package.json)
[![API: NestJS](https://img.shields.io/badge/API-NestJS%2011-e0234e.svg)](https://nestjs.com)
[![Web: React + Vite](https://img.shields.io/badge/Web-React%2019%20%2B%20Vite-646cff.svg)](https://vitejs.dev)

**Multi-Agenten-LLM-Trading, am Steuer.** Dreizehn KI-Analysten recherchieren,
debattieren, stresstesten das Risiko und konvergieren zu einer einzigen,
nachvollziehbaren Handelsentscheidung — live in deinem Browser gestreamt.

> Ein **eigenständiges**, TypeScript-natives Projekt: ein browser-first, vollständig beobachtbarer Trading-Desk auf Basis einer eigenständigen **NestJS-API** + **React + Vite**-SPA — streamend, nachvollziehbar und anbieterunabhängig.

---

## 💸 Tokenisierte US-Aktien handeln — 20%+ Gebühren sparen

**Setze jede Entscheidung um und erhalte 20%+ deiner Handelsgebühren zurück.** Kaufe
dieselben US-Aktien (NVDA, AAPL, …) als **tokenisierte Aktien** auf Binance / OKX /
Gate, bezahlt mit Krypto — registriere dich mit unserem Einladungscode, und **20%+
der Gebühr jeder Transaktion werden innerhalb von etwa einer Stunde automatisch auf
dein Börsenkonto zurückerstattet**:

| Börse | Einladungscode | Registrieren |
|---|---|---|
| **Binance** | `FANWO20` | <https://www.binance.com/join?ref=FANWO20> |
| **OKX** | `FANGEIWO` | <https://www.okx.com/join/FANGEIWO> |
| **Gate** | `FANGEIWO` | <https://www.gate.io/share/FANGEIWO> |

> Gebührenrabatte ermöglicht durch unseren Sponsor **[rebateto.me](https://rebateto.me/how_to_referral)**.
> Alle Details, Spiegel-Links für Festlandchina und wie du sie einlöst →
> [Setze die Entscheidung um](#setze-die-entscheidung-um--tokenisierte-us-aktien-handeln-und-20-gebühren-sparen).
> *Empfehlungslinks — sie unterstützen dieses Projekt ohne Mehrkosten für dich. Keine
> Anlageberatung; Krypto/tokenisierte Aktien bergen Risiken.*

---

## Warum HelmAgents?

**HelmAgents** modelliert eine ganze Handelsfirma mit LLM-gestützten Analysten,
Researchern, einem Trader, Risikoanalysten und einem Portfolio-Manager und lässt sie zu einer
5-stufigen Handelsentscheidung konvergieren, gestützt auf eine vollständige Argumentation. Doch es
hört nicht bei einem CLI-Research-Skript auf — es ist ein echtes Produkt, **beobachtbar, teilbar,
anbieterunabhängig und darauf ausgelegt, sich stetig zu verbessern**:

- **Beim Denken zusehen.** Eine live gestreamte Zeitleiste (SSE) zeigt jeden Analysten und
  jeden Debattenbeitrag, sobald er abgeschlossen ist — kein Starren mehr auf ein Terminal bis zum
  Ende.
- **Kein Python erforderlich.** Eine NestJS-API hostet die Engine; eine React/Vite-SPA steuert
  sie. Konfiguriere einen Lauf im Browser, drücke einen Knopf, lies die Entscheidung.
- **Bring dein eigenes Modell mit.** Eine Registry mit 20 Anbietern (OpenAI-kompatible Familie +
  natives Anthropic/Google) bedeutet, dass du nicht an einen einzigen Anbieter gebunden bist.
- **Nachvollziehbare, wiederholbare Entscheidungen.** Jeder Lauf wird mit seiner vollständigen
  Argumentation (Analystenberichte, Bullen-/Bären- + Risikodebatten, finale Entscheidung) persistiert und kann
  als Markdown exportiert werden.
- **Setze sie um — und zahle weniger.** Handle dieselben Titel als **tokenisierte Aktien** auf
  Binance / OKX / Gate und registriere dich mit dem Einladungscode `FANWO20` (Binance) oder
  `FANGEIWO` (OKX / Gate) für einen **20%+ Rabatt auf die Handelsgebühren**. Siehe [Setze die Entscheidung
  um](#setze-die-entscheidung-um--tokenisierte-us-aktien-handeln-und-20-gebühren-sparen).
- **Standardmäßig sicher.** API-Schlüssel werden im Ruhezustand verschlüsselt (AES-256-GCM); Laufdaten
  bleiben auf deinem Rechner; nichts funkt nach Hause.

> ⚠️ **Keine Finanzberatung.** HelmAgents erzeugt KI-generierte Analysen nur für
> Forschungs- und Bildungszwecke. Sie können falsch sein. Überprüfe unabhängig; Trading
> und Krypto-Assets bergen Risiken, einschließlich des Verlusts des eingesetzten Kapitals.

## Was es tut

Bei gegebenem `(ticker, tradeDate)` erzeugt eine 13-Agenten-Pipeline eine 5-stufige Handels-
entscheidung (**Kaufen / Übergewichten / Halten / Untergewichten / Verkaufen**) mit vollständiger unterstützender
Analyse:

1. **Analysten** — Markt · Stimmung · Nachrichten · Fundamentaldaten sammeln Daten.
2. **Investitionsdebatte** — Bullen- ⇄ Bären-Researcher debattieren; ein Research-Manager
   urteilt darüber in einen strukturierten Investitionsplan.
3. **Trader** — übersetzt den Plan in einen Kauf/Halten/Verkauf-Vorschlag mit Einstieg,
   Stop-Loss und Positionierung.
4. **Risikodebatte** — Aggressive / Konservative / Neutrale Analysten stresstesten ihn.
5. **Portfolio-Manager** — fasst alles zur finalen Entscheidung zusammen.

## Wie es funktioniert

Die Pipeline läuft als LangGraph.js-`StateGraph` und streamt `nodeEnd`-Events an den
Browser, sobald jeder Agent fertig ist. Analysten holen ihre Daten inline vorab
(ergebnisgleich zur ursprünglichen Tool-Calling-Schleife, ohne die zusätzlichen
Roundtrips), und jeder Bericht, jedes Debattentranskript und die finale Entscheidung werden
im Laufzustand erfasst.

## Architektur

pnpm-Monorepo mit **getrenntem Frontend und Backend**. Die Engine und die gesamte
Geschäftslogik liegen in framework-unabhängigen Paketen; die NestJS-API hostet sie,
und die React/Vite-SPA kommuniziert mit der API über HTTP (typisiert durch ein gemeinsames Contracts-
Paket).

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

**Datenfluss:** `apps/web` (SPA) → HTTP `/api/*` → `apps/api` (NestJS) →
`core.propagate()` → `workflow.buildGraph()` → `agents.*`
(rufen `dataflows.routeToVendor` auf) + `llm.createLlmClient`. Die Lauf-Zeitleiste
streamt von der API als NDJSON.

## Installation

Zwei Ein-Klick-Wege, um loszulegen. Beide starten die App im Normalmodus — öffne
dann die App, **erstelle ein Konto** (offene Registrierung), gehe zu **Settings**,
wähle einen LLM-Anbieter und füge deinen API-Schlüssel ein (pro Konto verschlüsselt
gespeichert). Noch kein Schlüssel? Siehe die DEMO-Option unter
[Verwendung](#verwendung). Erfordert **Node ≥ 22**.

### Option A — lokales Ein-Klick-Skript

Erfordert **Node.js ≥ 22** (pnpm wird automatisch über corepack eingerichtet).

```bash
git clone <repo-url>
cd tradingagents-web
./scripts/install.sh
```

Das Skript installiert die Abhängigkeiten, baut alles und startet die API
(`:5171`) + Web-SPA (`:5170`). Öffne **<http://localhost:5170>**.

### Option B — Docker-Ein-Klick

Erfordert **Docker** (mit Compose). Kein Node/pnpm nötig.

```bash
git clone <repo-url>
cd tradingagents-web
docker compose up --build
```

Dies baut und startet zwei Container — die NestJS-API und eine per nginx
ausgelieferte SPA, die `/api` per Reverse-Proxy an sie weiterleitet. Öffne
**<http://localhost:8080>**. Läufe, Einstellungen und verschlüsselte Schlüssel
bleiben im Volume `helmagents-store` erhalten. Um es ohne Schlüssel auszuprobieren,
setze `DEMO_LLM=1` für den `api`-Dienst in `docker-compose.yml`.

> Manuelle Einrichtung (für die Entwicklung): `pnpm install`, dann `pnpm dev`. Falls
> `pnpm install` vor ignorierten Build-Skripten warnt (esbuild / msw / sharp / @swc/core),
> setze den passenden Eintrag unter `allowBuilds:` in `pnpm-workspace.yaml` auf `true`
> oder führe `pnpm approve-builds` aus.

## Verwendung

Die App unterstützt **8 Sprachen**: `/en /zh /ja /ko /fr /de /es /vi`. Der nackte
Pfad `/` leitet auf `/en` um.

### 1. Demo-Modus — kein API-Schlüssel erforderlich

```bash
DEMO_LLM=1 pnpm dev
```

`pnpm dev` startet via Turbo **beide** Apps: die NestJS-API auf
`http://localhost:5171` und die Vite-SPA auf `http://localhost:5170` (der Dev-
Server proxyt `/api` → die API). `DEMO_LLM=1` treibt die **vollständige 13-Agenten-
Pipeline** mit einem deterministischen Stub-LLM an — Streaming, Persistenz, Abbruch
und Reflexion laufen allesamt echt; nur die finale Textgenerierung ist gestubbt.
Perfekt für Demos, UI-Arbeit und lokale Verifikation.

Öffne `http://localhost:5170/en`, gehe zu **/analyze**, konfiguriere einen Lauf und drücke
**Run analysis**.

### 2. Echter LLM-Modus

Konfiguriere den API-Schlüssel eines Anbieters — entweder in `/settings` (im Ruhezustand verschlüsselt) oder
über Umgebungsvariablen (siehe [`.env.example`](.env.example)):

```bash
export OPENAI_API_KEY=sk-...
# optional overrides
export TRADINGAGENTS_LLM_PROVIDER=openai
export TRADINGAGENTS_DEEP_THINK_LLM=gpt-5.5
export TRADINGAGENTS_QUICK_THINK_LLM=gpt-5.4-mini
pnpm dev
```

Führe dann eine Analyse auf **/analyze** aus. Die Berichtssprache folgt der URL-Locale
(z. B. `/zh/analyze` → chinesischer Bericht). In der Produktion werden SPA und API
getrennt bereitgestellt — richte die SPA mit `VITE_API_BASE_URL` auf die API aus und erlaube deren
Origin über `CORS_ORIGIN` (siehe [`.env.example`](.env.example)).

| Pfad | Was |
|---|---|
| `/<locale>` | Startseite — die Pipeline |
| `/<locale>/analyze` | Eine Analyse konfigurieren & **streamen** |
| `/<locale>/history` | Frühere Läufe |
| `/<locale>/runs/<id>` | Laufdetails + Markdown-Export |
| `/<locale>/settings` | Anbieter / Modelle / Datenquellen / API-Schlüssel |

> Vollständige Lauf-Anleitung (DEMO-Modus, echtes LLM, Fehlerbehebung):
> [`docs/RUNNING.md`](docs/RUNNING.md)

## Setze die Entscheidung um — tokenisierte US-Aktien handeln und 20%+ Gebühren sparen

HelmAgents hört nicht bei einer Bewertung auf — es hilft dir, **sie umzusetzen und günstiger zu handeln**.
Dieselben US-Aktien (NVDA, AAPL, …) werden als **tokenisierte Aktien** an großen Krypto-
Börsen gehandelt, rund um die Uhr mit Krypto gekauft und verkauft, ohne dass ein traditionelles Brokerage
nötig ist. Die App zeigt dies auf der Startseite und auf jeder Laufdetail-Seite (die
„Buy tokenized stocks"-Karte).

> 💸 **Registriere dich mit den Einladungscodes von HelmAgents — `FANWO20` auf Binance, `FANGEIWO`
> auf OKX / Gate — und 20%+ der Gebühr jeder Transaktion werden innerhalb von etwa einer Stunde
> automatisch auf dein Börsenkonto zurückerstattet.** Handelsgebühren sind der eine Kostenpunkt, den du vollständig kontrollierst,
> und diese Rückerstattung ist es, die HelmAgents kostenlos und gepflegt hält — die Nutzung der
> Links unten unterstützt also direkt das Projekt, ohne Mehrkosten für dich.

### Unterstützte Börsen & Rabatt

| Exchange | Sign-up link | Invite code | Fee rebate |
|---|---|---|---|
| **Binance** (`binance.com`) | <https://www.binance.com/join?ref=FANWO20> | `FANWO20` | **20%+ zurück** |
| **OKX** (`okx.com`) | <https://www.okx.com/join/FANGEIWO> | `FANGEIWO` | **20%+ zurück** |
| **Gate** (`gate.io`) | <https://www.gate.io/share/FANGEIWO> | `FANGEIWO` | **20%+ zurück** |

### So sicherst du dir den Gebührenrabatt

1. **Öffne einen Registrierungslink oben** (oder gib den Einladungscode deiner Börse manuell
   bei der Registrierung ein — `FANWO20` für Binance, `FANGEIWO` für OKX / Gate). Der
   Rabatt bindet sich **bei der Registrierung** an das Konto, nutze den Code also von Anfang an —
   er lässt sich in der Regel nicht zu einem bestehenden Konto hinzufügen.
2. **Schließe die Registrierung / das KYC der Börse ab** und zahle Krypto ein.
3. **Handle** — suche das tokenisierte Symbol der Aktie und setze die Bewertung der Agenten
   um (Buy / Overweight / Hold / Underweight / Sell). 20%+ der Gebühren werden nach jeder
   Transaktion innerhalb von ~1 Std. automatisch auf dein Börsenkonto zurückerstattet; sonst
   gibt es nichts zu tun.

> **In der App den Einladungscode bei der Anmeldung eingeben** (`FANWO20` Binance · `FANGEIWO` OKX/Gate) — leicht zu übersehen und nachträglich nicht möglich.
>
> **Ein Konto pro Ausweis und Börse.** Schon registriert? Ein Familienmitglied kann sich mit dem Code anmelden und die Rückerstattung erhalten.

Siehe **[wie der Rabatt funktioniert →](https://rebateto.me/how_to_referral)** für die
aktuellen Sätze pro Börse und die vollständigen Bedingungen. Innerhalb der App ziehen die Börsenkarten zudem
**Live-Einladungslinks** und legen **Backup-/Spiegel-Links** offen (unter „Show backup
links"), wenn die offizielle Domain per DNS blockiert ist (z. B. in Festlandchina).

> **Offenlegung & Risiko.** Die Registrierungslinks oben sind **Empfehlungslinks** — der
> Autor erhält einen Gebührenrabatt, wenn du dich über sie registrierst, **ohne Mehrkosten
> für dich** (du erhältst die rabattierten Gebühren; die Börse teilt einen Teil ihres Anteils).
> Ihre Nutzung ist völlig freiwillig. Tokenisierte Aktien und Krypto bergen Risiken
> **einschließlich des Verlusts des eingesetzten Kapitals**, sind nicht in jeder Jurisdiktion verfügbar, und
> die Ausgabe von HelmAgents ist **KI-generierte Analyse nur für Forschung/Bildung — keine
> Anlageberatung**. Überprüfe unabhängig und befolge die für dich geltenden Gesetze sowie
> die Bedingungen jeder Börse.

## Authentifizierung und Mandantenfähigkeit

Die App ist **mandantenfähig (multi-tenant)**: Jeder Benutzer ist ein isoliertes
Konto. Die Registrierung ist offen (Anmeldung mit E-Mail + Passwort), und **nur
authentifizierte Benutzer können LLM-Anbieter/-Schlüssel konfigurieren oder Analysen
ausführen** — jeder `/api/*`-Endpoint außer health, docs und `/api/auth/*` erfordert
einen Bearer-Token. Die API-Schlüssel, Einstellungen, Läufe und der Reflexions-
speicher jedes Benutzers werden getrennt gespeichert (SQLite, nach Benutzer-ID
abgegrenzt); die Schlüssel eines Benutzers werden zur Laufzeit in seine eigene Engine
injiziert (niemals in die globale Umgebung), sodass Konten niemals die Daten der
anderen sehen. Die Token-API (JWT-Access + rotierender Refresh) ist client-unabhängig
— die React-SPA und eine künftige native App teilen sie sich.

**Env:**

| Var | Default | Zweck |
|---|---|---|
| `AUTH_JWT_SECRET` | dev placeholder | HMAC-Secret für Access-Tokens — **setze in der Produktion einen starken Wert** |
| `AUTH_ACCESS_TTL_SEC` | `900` | Lebensdauer des Access-Tokens |
| `AUTH_REFRESH_TTL_SEC` | `2592000` | Lebensdauer des Refresh-Tokens |
| `AUTH_BOOTSTRAP_EMAIL` / `AUTH_BOOTSTRAP_PASSWORD` | — | Optional: ein erstes Konto beim Start anlegen |

> Erfordert **Node ≥ 22** (nutzt das eingebaute `node:sqlite`).

## Konfiguration

Die Engine löst die Konfiguration mit demselben dreischichtigen Merge wie das Original auf:
`DEFAULT_CONFIG → TRADINGAGENTS_* env vars → runtime overrides (the Settings page)`.

Siehe [`packages/config/src/default-config.ts`](packages/config/src/default-config.ts)
für die vollständige Schlüsselliste und
[`packages/llm/src/api-key-env.ts`](packages/llm/src/api-key-env.ts) für die Schlüssel-
variable jedes Anbieters.

## Entwicklung

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

Beiträge folgen **Black-Box-TDD** (Red → Green → Refactor) und halten alle
**8 Locales in Schlüssel-Parität**. Siehe [**CONTRIBUTING.md**](CONTRIBUTING.md) für
Einrichtung, Konventionen und Commit-Stil. CI (`.github/workflows/ci.yml`) führt
`typecheck`, `test` und `build` bei jedem Push und Pull Request aus.

## Status

**Phasen 0–4 abgeschlossen**, plus eine **Frontend-/Backend-Trennung** (NestJS-API + Vite-
SPA). Die Engine führt die vollständige 13-Agenten-Pipeline durchgängig mit Streaming,
Persistenz, Einstellungen und Reflexion aus. Alle Tests bestehen und `pnpm build` ist sauber.
Siehe die Designspezifikationen unter `docs/superpowers/specs/`.

## Danksagungen

HelmAgents wurde **inspiriert von** [**TradingAgents**](https://github.com/TauricResearch/TradingAgents)
von Tauric Research (Apache-2.0) — sein Multi-Agenten-Design für Handelsentscheidungen hat
dieses Projekt entfacht. HelmAgents ist ein **eigenständiges** Werk (keine Portierung), das
die Idee in TypeScript neu denkt und sie weiter führen will; die Zuschreibung an das
Upstream-Projekt wird dankbar in [NOTICE](NOTICE) beibehalten.
Das Originalpapier: [arXiv 2412.20138](https://arxiv.org/abs/2412.20138). Erstellt
mit [NestJS](https://nestjs.com), [React](https://react.dev) +
[Vite](https://vitejs.dev), [LangGraph.js](https://github.com/langchain-ai/langgraphjs)
und [i18next](https://www.i18next.com).

## Lizenz

Lizenziert unter der **Apache License, Version 2.0**. HelmAgents wurde von
TradingAgents inspiriert (ebenfalls Apache-2.0); die Upstream-Zuschreibung wird
in [NOTICE](NOTICE) beibehalten. Siehe [LICENSE](LICENSE) für die vollständigen Bedingungen.

Durch das Beitragen stimmst du zu, dass deine Beiträge unter Apache-2.0 lizenziert sind und
dass du den [Code of Conduct](CODE_OF_CONDUCT.md) befolgst. Um ein Sicherheitsproblem zu melden,
siehe [SECURITY.md](SECURITY.md).
