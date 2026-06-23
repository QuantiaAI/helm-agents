# HelmAgents

[English](README.md) · [简体中文](README.zh-CN.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · **[Français](README.fr.md)** · [Deutsch](README.de.md) · [Español](README.es.md) · [Tiếng Việt](README.vi.md)

[![License: Apache-2.0](https://img.shields.io/badge/license-Apache--2.0-blue.svg)](LICENSE)
[![Node](https://img.shields.io/badge/node-%E2%89%A522-green.svg)](package.json)
[![pnpm](https://img.shields.io/badge/pnpm-11-orange.svg)](package.json)
[![API: NestJS](https://img.shields.io/badge/API-NestJS%2011-e0234e.svg)](https://nestjs.com)
[![Web: React + Vite](https://img.shields.io/badge/Web-React%2019%20%2B%20Vite-646cff.svg)](https://vitejs.dev)

**Trading multi-agents par LLM, à la barre.** Treize analystes IA recherchent,
débattent, testent le risque sous stress et convergent vers une décision de
trading unique et traçable — diffusée en direct dans votre navigateur.

> Un projet **indépendant**, nativement TypeScript : un poste de trading orienté
> navigateur et entièrement observable, bâti sur une **API NestJS** autonome + une
> SPA **React + Vite** — streaming, traçable et indépendant de tout fournisseur.

---

## 💸 Tradez des actions américaines tokenisées — économisez 20%+ sur les frais

**Passez à l'acte sur chaque décision et récupérez 20%+ de vos frais de trading.**
Achetez les mêmes actions américaines (NVDA, AAPL, …) en tant qu'**actions
tokenisées** sur Binance / OKX / Gate, réglées en crypto — inscrivez-vous avec
notre code d'invitation et **20%+ des frais de chaque transaction sont
automatiquement reversés sur votre compte d'échange sous environ une heure** :

| Plateforme | Code d'invitation | Inscription |
|---|---|---|
| **Binance** | `FANWO20` | <https://www.binance.com/join?ref=FANWO20> |
| **OKX** | `FANGEIWO` | <https://www.okx.com/join/FANGEIWO> |
| **Gate** | `FANGEIWO` | <https://www.gate.io/share/FANGEIWO> |

> Ristournes sur les frais propulsées par notre sponsor **[rebateto.me](https://rebateto.me/how_to_referral)**.
> Tous les détails, les liens miroir pour la Chine continentale et comment en
> profiter →
> [Passer la décision à l'acte](#passer-la-décision-à-lacte--trader-des-actions-américaines-tokenisées-et-économiser-20-sur-les-frais).
> *Liens de parrainage — ils soutiennent ce projet sans coût supplémentaire pour
> vous. Pas un conseil en investissement ; les actions tokenisées et la crypto
> comportent des risques.*

---

## Pourquoi HelmAgents ?

HelmAgents modélise toute une société de trading avec des analystes, des
chercheurs, un trader, des analystes de risque et un manager de portefeuille
propulsés par LLM, et les fait converger vers une décision de trading à 5 niveaux
étayée par un raisonnement complet. Mais il ne s'arrête pas à un script de
recherche en CLI — c'est un véritable produit, **observable, partageable,
indépendant du fournisseur et conçu pour ne cesser de s'améliorer** :

- **Voyez-le réfléchir.** Une chronologie en direct et en streaming (SSE) montre
  chaque analyste et chaque tour de débat à mesure qu'il se termine — fini de
  fixer un terminal jusqu'à la fin.
- **Aucun Python requis.** Une API NestJS héberge le moteur ; une SPA React/Vite
  le pilote. Configurez une exécution dans le navigateur, appuyez sur un bouton,
  lisez la décision.
- **Apportez votre propre modèle.** Un registre de 20 fournisseurs (famille
  compatible OpenAI + Anthropic/Google natifs) signifie que vous n'êtes pas
  enfermé chez un seul fournisseur.
- **Des décisions traçables et rejouables.** Chaque exécution est persistée avec
  l'intégralité de son raisonnement (rapports d'analystes, débats
  haussier/baissier + risque, décision finale), et peut être exportée en
  Markdown.
- **Passez à l'acte — et payez moins.** Tradez les mêmes valeurs en tant
  qu'**actions tokenisées** sur Binance / OKX / Gate, et inscrivez-vous avec le
  code d'invitation `FANWO20` (Binance) ou `FANGEIWO` (OKX / Gate) : **20%+ des
  frais sont reversés** sur votre compte sous ~1 h après chaque transaction. Voir [Passer la décision à
  l'acte](#passer-la-décision-à-lacte--trader-des-actions-américaines-tokenisées-et-économiser-20-sur-les-frais).
- **Sûr par défaut.** Les clés API sont chiffrées au repos (AES-256-GCM) ; les
  données d'exécution restent sur votre machine ; rien n'est renvoyé ailleurs.

> ⚠️ **Pas un conseil financier.** HelmAgents produit une analyse générée par IA
> à des fins de recherche et d'éducation uniquement. Elle peut se tromper.
> Vérifiez de manière indépendante ; le trading et les actifs crypto comportent
> des risques, y compris la perte du capital.

## Ce qu'il fait

À partir d'un `(ticker, tradeDate)`, un pipeline à 13 agents produit une décision
de trading à 5 niveaux (**Acheter / Surpondérer / Conserver / Sous-pondérer /
Vendre**) avec une analyse de soutien complète :

1. **Analystes** — Marché · Sentiment · Actualités · Fondamentaux collectent les
   données.
2. **Débat d'investissement** — les chercheurs Haussier ⇄ Baissier débattent ; un
   Manager de recherche tranche pour en faire un plan d'investissement structuré.
3. **Trader** — traduit le plan en une proposition d'achat/conservation/vente avec
   entrée, stop-loss et dimensionnement.
4. **Débat de risque** — les analystes Agressif / Conservateur / Neutre le testent
   sous stress.
5. **Manager de portefeuille** — synthétise le tout en la décision finale.

## Comment ça marche

Le pipeline s'exécute comme un `StateGraph` LangGraph.js et diffuse des
événements `nodeEnd` vers le navigateur à mesure que chaque agent termine. Les
analystes pré-récupèrent leurs données en ligne (sortie équivalente à la boucle
d'appels d'outils originale, sans les allers-retours supplémentaires), et chaque
rapport, transcription de débat et la décision finale sont capturés dans l'état
de l'exécution.

## Architecture

Monorepo pnpm avec un **frontend et un backend séparés**. Le moteur et toute la
logique métier vivent dans des packages indépendants du framework ; l'API NestJS
les héberge, et la SPA React/Vite parle à l'API via HTTP (typée par un package de
contrats partagé).

```
apps/
  api           NestJS (ESM) — héberge le moteur ; endpoints REST sous /api (auth incl.)
  web           React 19 + Vite SPA — react-router, react-i18next (8 locales)
packages/
  contracts     shared HTTP DTO types (pure types — no runtime) for api ↔ web
  core          createEngine() / propagate() / streamEvents()  — single entry point
  workflow      LangGraph.js StateGraph: topology + conditional debate/risk routing
  agents        13 agent factories (analysts/researchers/trader/risk/managers)
  dataflows     vendor routing (routeToVendor) + error hierarchy + yfinance
  llm           20-provider registry + OpenAI-compatible client
  config        DEFAULT_CONFIG + three-layer merge (env → runtime)
  persistence   stockage SQLite (node:sqlite) — comptes, jetons d'auth, clés/paramètres/exécutions/mémoire par utilisateur
  shared        Zod schemas, AgentState, rating, symbol utils
```

**Flux de données :** `apps/web` (SPA) → HTTP `/api/*` → `apps/api` (NestJS) →
`core.propagate()` → `workflow.buildGraph()` → `agents.*`
(appellent `dataflows.routeToVendor`) + `llm.createLlmClient`. La chronologie
d'exécution est diffusée depuis l'API en NDJSON.

## Installation

Deux manières en un clic pour démarrer. Les deux lancent l'application en mode
normal — ouvrez ensuite l'application, **créez un compte** (inscription ouverte),
puis allez dans **Settings**, choisissez un fournisseur LLM et collez votre clé
API (stockée chiffrée par compte). Pas encore de clé ? Voir l'option DEMO sous
[Utilisation](#utilisation). Nécessite **Node ≥ 22**.

### Option A — script local en un clic

Nécessite **Node.js ≥ 22** (pnpm est configuré automatiquement via corepack).

```bash
git clone <repo-url>
cd tradingagents-web
./scripts/install.sh
```

Le script installe les dépendances, construit le tout et démarre l'API (`:5171`)
+ la SPA web (`:5170`). Ouvrez **<http://localhost:5170>**.

### Option B — Docker en un clic

Nécessite **Docker** (avec Compose). Aucun Node/pnpm requis.

```bash
git clone <repo-url>
cd tradingagents-web
docker compose up --build
```

Cela construit et exécute deux conteneurs — l'API NestJS et une SPA servie par
nginx qui relaie `/api` vers elle en reverse-proxy. Ouvrez
**<http://localhost:8080>**. Les exécutions, paramètres et clés chiffrées
persistent dans le volume `helmagents-store`. Pour essayer sans clé, définissez
`DEMO_LLM=1` pour le service `api` dans `docker-compose.yml`.

> Installation manuelle (pour le développement) : `pnpm install` puis `pnpm dev`.
> Si `pnpm install` avertit au sujet de scripts de build ignorés (esbuild / msw /
> sharp / @swc/core), passez l'entrée correspondante à `true` sous `allowBuilds:`
> dans `pnpm-workspace.yaml` ou exécutez `pnpm approve-builds`.

## Utilisation

L'application prend en charge **8 langues** : `/en /zh /ja /ko /fr /de /es /vi`.
Le chemin nu `/` redirige vers `/en`.

### 1. Mode démo — aucune clé API requise

```bash
DEMO_LLM=1 pnpm dev
```

`pnpm dev` démarre **les deux** apps via Turbo : l'API NestJS sur
`http://localhost:5171` et la SPA Vite sur `http://localhost:5170` (le serveur de
dev proxifie `/api` → l'API). `DEMO_LLM=1` pilote le **pipeline complet à 13
agents** avec un LLM stub déterministe — streaming, persistance, annulation et
réflexion s'exécutent tous pour de vrai ; seule la génération de texte finale est
stubbée. Parfait pour les démos, le travail sur l'UI et la vérification locale.

Ouvrez `http://localhost:5170/en`, allez sur **/analyze**, configurez une
exécution et appuyez sur **Run analysis**.

### 2. Mode LLM réel

Configurez la clé API d'un fournisseur — soit dans `/settings` (chiffrée au
repos), soit via des variables d'environnement (voir
[`.env.example`](.env.example)) :

```bash
export OPENAI_API_KEY=sk-...
# optional overrides
export TRADINGAGENTS_LLM_PROVIDER=openai
export TRADINGAGENTS_DEEP_THINK_LLM=gpt-5.5
export TRADINGAGENTS_QUICK_THINK_LLM=gpt-5.4-mini
pnpm dev
```

Lancez ensuite une analyse sur **/analyze**. La langue du rapport suit la locale
de l'URL (ex. `/zh/analyze` → rapport en chinois). En production, la SPA et l'API
se déploient séparément — pointez la SPA vers l'API avec `VITE_API_BASE_URL` et
autorisez son origine via `CORS_ORIGIN` (voir [`.env.example`](.env.example)).

| Chemin | Quoi |
|---|---|
| `/<locale>` | Accueil — le pipeline |
| `/<locale>/analyze` | Configurer & **diffuser** une analyse |
| `/<locale>/history` | Exécutions passées |
| `/<locale>/runs/<id>` | Détail d'exécution + export Markdown |
| `/<locale>/settings` | Fournisseur / modèles / sources de données / clés API |

> Guide complet d'exécution (mode DEMO, LLM réel, dépannage) :
> [`docs/RUNNING.md`](docs/RUNNING.md)

## Passer la décision à l'acte — trader des actions américaines tokenisées et économiser 20%+ sur les frais

HelmAgents ne s'arrête pas à une notation — il vous aide à **passer à l'acte et à
trader moins cher**. Les mêmes actions américaines (NVDA, AAPL, …) se négocient en
tant qu'**actions tokenisées** sur les grandes plateformes d'échange crypto,
achetées et vendues 24h/24 en crypto, sans courtier traditionnel. L'application met
cela en avant sur la page d'accueil et sur chaque page de détail d'exécution (la
carte « Acheter des actions tokenisées »).

> 💸 **Inscrivez-vous avec les codes d'invitation de HelmAgents — `FANWO20` sur
> Binance, `FANGEIWO` sur OKX / Gate — et 20%+ des frais de chaque transaction
> sont automatiquement reversés sur votre compte d'échange sous environ une heure
> après chaque transaction.** Les frais de trading sont le seul coût que vous maîtrisez
> entièrement, et cette ristourne est ce qui permet à HelmAgents de rester gratuit
> et maintenu — utiliser les liens ci-dessous soutient donc directement le projet,
> sans coût supplémentaire pour vous.

### Plateformes prises en charge & ristourne

| Plateforme | Lien d'inscription | Code d'invitation | Ristourne sur les frais |
|---|---|---|---|
| **Binance** (`binance.com`) | <https://www.binance.com/join?ref=FANWO20> | `FANWO20` | **20%+ reversés** |
| **OKX** (`okx.com`) | <https://www.okx.com/join/FANGEIWO> | `FANGEIWO` | **20%+ reversés** |
| **Gate** (`gate.io`) | <https://www.gate.io/share/FANGEIWO> | `FANGEIWO` | **20%+ reversés** |

### Comment obtenir la ristourne sur les frais

1. **Ouvrez un lien d'inscription ci-dessus** (ou saisissez manuellement le code
   d'invitation de votre plateforme lors de l'inscription — `FANWO20` pour
   Binance, `FANGEIWO` pour OKX / Gate). La ristourne est liée au compte **à
   l'inscription**, alors utilisez le code dès le départ — il ne peut généralement
   pas être ajouté à un compte existant.
2. **Terminez l'inscription / le KYC de la plateforme** et déposez des
   cryptomonnaies.
3. **Tradez** — recherchez le symbole tokenisé de l'action et agissez selon la
   notation des agents (Acheter / Surpondérer / Conserver / Sous-pondérer /
   Vendre). 20%+ des frais sont ensuite reversés automatiquement sur votre compte
   d'échange, sous environ une heure après chaque transaction — il n'y a rien
   d'autre à faire.

> **Dans l'app, saisissez le code de parrainage à l'inscription** (`FANWO20` Binance · `FANGEIWO` OKX/Gate) — facile à oublier, et impossible à ajouter ensuite.
>
> **Un compte par pièce d'identité et par plateforme.** Déjà inscrit ? Un proche peut s'inscrire avec le code pour obtenir la remise.

Voir **[comment fonctionne la ristourne →](https://rebateto.me/how_to_referral)**
pour les taux actuels par plateforme et les conditions complètes. Dans
l'application, les cartes de plateformes récupèrent aussi des **liens d'invitation
en direct** et exposent des **liens de secours/miroir** (sous « Afficher les liens
de secours ») lorsque le domaine officiel est bloqué par DNS (par ex. en Chine
continentale).

> **Divulgation & risque.** Les liens d'inscription ci-dessus sont des **liens de
> parrainage** — l'auteur reçoit une ristourne sur les frais lorsque vous vous
> inscrivez par leur intermédiaire, **sans coût supplémentaire pour vous** (vous
> récupérez 20%+ de vos frais ; la plateforme partage une partie de sa commission).
> Leur utilisation est entièrement facultative. Les actions tokenisées et la
> crypto comportent des risques **y compris la perte du capital**, ne sont pas
> disponibles dans toutes les juridictions, et la sortie de HelmAgents est une
> **analyse générée par IA à des fins de recherche/éducation uniquement — pas un
> conseil en investissement**. Vérifiez de manière indépendante et respectez les
> lois en vigueur dans votre pays ainsi que les conditions de chaque plateforme.

## Authentification et multi-tenance

L'application est **multi-tenant** : chaque utilisateur est un compte isolé.
L'inscription est ouverte (créez un compte avec e-mail + mot de passe) et **seuls
les utilisateurs authentifiés peuvent configurer des fournisseurs/clés LLM ou
lancer des analyses** — chaque endpoint `/api/*`, hormis health, docs et
`/api/auth/*`, exige un jeton Bearer. Les clés API, paramètres, exécutions et la
mémoire de réflexion de chaque utilisateur sont stockés séparément (SQLite,
cloisonnés par identifiant d'utilisateur) ; les clés d'un utilisateur sont
injectées dans son propre moteur au moment de l'exécution (jamais dans
l'environnement global), de sorte que les comptes ne voient jamais les données des
autres. L'API de jetons (accès JWT + refresh à rotation) est indépendante du
client — la SPA React et une future application native la partagent.

**Env :**

| Var | Défaut | Rôle |
|---|---|---|
| `AUTH_JWT_SECRET` | dev placeholder | Secret HMAC pour les jetons d'accès — **définissez une valeur forte en production** |
| `AUTH_ACCESS_TTL_SEC` | `900` | Durée de vie du jeton d'accès |
| `AUTH_REFRESH_TTL_SEC` | `2592000` | Durée de vie du jeton de refresh |
| `AUTH_BOOTSTRAP_EMAIL` / `AUTH_BOOTSTRAP_PASSWORD` | — | Optionnel : amorcer un premier compte au démarrage |

> Nécessite **Node ≥ 22** (utilise le `node:sqlite` intégré).

## Configuration

Le moteur résout la configuration avec la même fusion à trois couches que
l'original :
`DEFAULT_CONFIG → variables d'env TRADINGAGENTS_* → surcharges d'exécution (la page Paramètres)`.

Voir [`packages/config/src/default-config.ts`](packages/config/src/default-config.ts)
pour la liste complète des clés et
[`packages/llm/src/api-key-env.ts`](packages/llm/src/api-key-env.ts) pour la
variable de clé de chaque fournisseur.

## Développement

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

Les contributions suivent le **TDD en boîte noire** (Red → Green → Refactor) et
maintiennent la parité des clés sur les **8 locales**. Voir
[**CONTRIBUTING.md**](CONTRIBUTING.md) pour l'installation, les conventions et le
style de commit. La CI (`.github/workflows/ci.yml`) exécute `typecheck`, `test` et
`build` à chaque push et pull request.

## État

**Phases 0–4 terminées**, plus une **séparation frontend/backend** (API NestJS +
SPA Vite). Le moteur exécute le pipeline complet à 13 agents de bout en bout avec
streaming, persistance, paramètres et réflexion. Tous les tests passent et
`pnpm build` est propre. Voir les spécifications de conception sous
`docs/superpowers/specs/`.

## Remerciements

HelmAgents a été **inspiré par** [**TradingAgents**](https://github.com/TauricResearch/TradingAgents)
de Tauric Research (Apache-2.0) — c'est sa conception multi-agents de décision de
trading qui a fait naître ce projet. HelmAgents est une œuvre **indépendante**
(ce n'est pas un portage) qui réinvente cette idée en TypeScript et vise à aller
plus loin ; l'attribution au projet amont est conservée avec gratitude dans
[NOTICE](NOTICE).
L'article original : [arXiv 2412.20138](https://arxiv.org/abs/2412.20138).
Construit avec [NestJS](https://nestjs.com), [React](https://react.dev) +
[Vite](https://vitejs.dev), [LangGraph.js](https://github.com/langchain-ai/langgraphjs),
et [i18next](https://www.i18next.com).

## Licence

Sous licence **Apache License, Version 2.0**. HelmAgents a été inspiré par
TradingAgents (également Apache-2.0) ; l'attribution au projet amont est
conservée dans [NOTICE](NOTICE). Voir [LICENSE](LICENSE) pour les conditions
complètes.

En contribuant, vous acceptez que vos contributions soient sous licence Apache-2.0
et que vous suivez le [Code de conduite](CODE_OF_CONDUCT.md). Pour signaler un
problème de sécurité, voir [SECURITY.md](SECURITY.md).
