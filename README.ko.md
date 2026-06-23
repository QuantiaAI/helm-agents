# HelmAgents

[English](README.md) · [简体中文](README.zh-CN.md) · [日本語](README.ja.md) · **[한국어](README.ko.md)** · [Français](README.fr.md) · [Deutsch](README.de.md) · [Español](README.es.md) · [Tiếng Việt](README.vi.md)

[![License: Apache-2.0](https://img.shields.io/badge/license-Apache--2.0-blue.svg)](LICENSE)
[![Node](https://img.shields.io/badge/node-%E2%89%A522-green.svg)](package.json)
[![pnpm](https://img.shields.io/badge/pnpm-11-orange.svg)](package.json)
[![API: NestJS](https://img.shields.io/badge/API-NestJS%2011-e0234e.svg)](https://nestjs.com)
[![Web: React + Vite](https://img.shields.io/badge/Web-React%2019%20%2B%20Vite-646cff.svg)](https://vitejs.dev)

**키를 잡은, 멀티 에이전트 LLM 트레이딩.** 13명의 AI 애널리스트가 조사하고, 토론하며,
리스크를 스트레스 테스트하고, 추적 가능한 단 하나의 거래 결정으로 수렴합니다 — 브라우저에서
실시간으로 스트리밍됩니다.

> **독립적인** TypeScript 네이티브 프로젝트입니다. 독립 실행형 **NestJS API** 와
> **React + Vite** SPA 로 구축한, 브라우저 우선의 완전히 관찰 가능한 트레이딩 데스크 —
> 스트리밍, 추적 가능, 특정 벤더에 종속되지 않음.

---

## 💸 토큰화 미국 주식을 거래하고 — 수수료를 20%+ 절약하세요

**모든 결정을 실행에 옮기고 거래 수수료를 20%+ 절감하세요.** 같은 미국 주식(NVDA,
AAPL, …)을 Binance / OKX / Gate 에서 **토큰화 주식**으로 암호화폐로 매매하세요 —
우리의 초대 코드로 가입하면 **거래마다 수수료의 20%+가 약 1시간 이내에 거래소 계좌로 자동 환급됩니다**:

| 거래소 | 초대 코드 | 가입 |
|---|---|---|
| **Binance** | `FANWO20` | <https://www.binance.com/join?ref=FANWO20> |
| **OKX** | `FANGEIWO` | <https://www.okx.com/join/FANGEIWO> |
| **Gate** | `FANGEIWO` | <https://www.gate.io/share/FANGEIWO> |

> 수수료 리베이트는 후원사 **[rebateto.me](https://rebateto.me/how_to_referral)** 가
> 제공합니다. 전체 내용, 중국 본토 미러 링크, 그리고 받는 방법 →
> [결정을 실행에 옮기기](#결정을-실행에-옮기기--토큰화-미국-주식을-거래하고-수수료-20-절약).
> *추천 링크입니다 — 추가 비용 없이 이 프로젝트를 후원합니다. 투자 조언이 아니며,
> 암호화폐/토큰화 주식은 위험을 수반합니다.*

---

## 왜 HelmAgents 인가?

HelmAgents 는 LLM 기반의 애널리스트, 연구원, 트레이더, 리스크 애널리스트, 포트폴리오
매니저로 하나의 트레이딩 회사 전체를 모델링하고, 완전한 추론에 뒷받침된 5단계 거래 결정으로
수렴하게 합니다. 하지만 CLI 리서치 스크립트에 멈추지 않습니다 — 실제 제품으로서
**관찰 가능하고, 공유 가능하며, 특정 제공자에 종속되지 않고, 계속 개선되도록
만들어졌습니다**:

- **사고 과정을 직접 보세요.** 실시간 스트리밍 타임라인(SSE)이 각 애널리스트와 모든 토론
  턴을 완료되는 즉시 보여줍니다 — 끝날 때까지 터미널만 바라볼 필요가 없습니다.
- **Python 불필요.** NestJS API 가 엔진을 호스팅하고, React/Vite SPA 가 그것을 구동합니다.
  브라우저에서 실행을 설정하고, 버튼을 누르고, 결정을 읽으세요.
- **자신의 모델을 가져오세요.** 20개 제공자 레지스트리(OpenAI 호환 계열 + 네이티브
  Anthropic/Google)로 단일 벤더에 묶이지 않습니다.
- **추적 가능하고 재생 가능한 결정.** 모든 실행은 완전한 추론(애널리스트 보고서, 강세/약세 +
  리스크 토론, 최종 결정)과 함께 영속화되며, Markdown 으로 내보낼 수 있습니다.
- **실행하고 — 더 적게 내세요.** 같은 종목을 Binance / OKX / Gate 에서 **토큰화 주식**으로
  거래하고, 초대 코드 `FANWO20`(Binance) 또는 `FANGEIWO`(OKX / Gate)로 가입해 **20%+ 거래
  수수료 환급**(거래마다 약 1시간 이내에 계좌로 자동 환급)을 받으세요. [결정을 실행에 옮기기](#결정을-실행에-옮기기--토큰화-미국-주식을-거래하고-수수료-20-절약)를
  참고하세요.
- **기본적으로 안전.** API 키는 저장 시 암호화되며(AES-256-GCM), 실행 데이터는 사용자
  기기에 남고, 아무것도 외부로 전송하지 않습니다.

> ⚠️ **투자 조언이 아닙니다.** HelmAgents 는 리서치와 교육 목적의 AI 생성 분석만을
> 산출합니다. 틀릴 수 있습니다. 독립적으로 검증하세요. 거래와 암호화폐 자산은 원금 손실을
> 포함한 위험을 수반합니다.

## 무엇을 하는가

`(티커, 거래일)` 이 주어지면, 13개 에이전트 파이프라인이 완전한 뒷받침 분석과 함께 5단계
거래 결정(**매수 / 비중확대 / 보유 / 비중축소 / 매도**)을 산출합니다:

1. **애널리스트** — 시장 · 심리 · 뉴스 · 펀더멘털 이 데이터를 수집합니다.
2. **투자 토론** — 강세 ⇄ 약세 연구원이 토론하고, 리서치 매니저가 이를 구조화된 투자
   계획으로 판정합니다.
3. **트레이더** — 계획을 진입가, 손절가, 비중을 갖춘 매수/보유/매도 제안으로 변환합니다.
4. **리스크 토론** — 공격 / 보수 / 중립 애널리스트가 이를 스트레스 테스트합니다.
5. **포트폴리오 매니저** — 모든 것을 종합하여 최종 결정을 내립니다.

## 작동 방식

파이프라인은 LangGraph.js `StateGraph` 로 실행되며, 각 에이전트가 완료될 때마다 `nodeEnd`
이벤트를 브라우저로 스트리밍합니다. 애널리스트는 데이터를 인라인으로 사전 페치하고(추가
왕복 없이 원본의 도구 호출 루프와 동등한 출력), 모든 보고서, 토론 전문, 최종 결정이 실행
상태에 포착됩니다.

## 아키텍처

전후단이 **분리된** pnpm 모노레포입니다. 엔진과 모든 비즈니스 로직은 프레임워크에 독립적인
패키지에 있으며, NestJS API 가 이를 호스팅하고, React/Vite SPA 가 HTTP 로 API 와
통신합니다(공유 contracts 패키지로 타입 부여).

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

**데이터 흐름:** `apps/web` (SPA) → HTTP `/api/*` → `apps/api` (NestJS) →
`core.propagate()` → `workflow.buildGraph()` → `agents.*`
(`dataflows.routeToVendor` 호출) + `llm.createLlmClient`. 실행 타임라인은 API 에서 NDJSON 으로
스트리밍됩니다.

## 설치

실행하는 두 가지 원클릭 방법이 있습니다. 둘 다 앱을 일반 모드로 시작합니다 — 그런
다음 앱을 열고 **계정을 생성**(가입은 누구나 가능)한 뒤 **Settings** 로 이동하여,
LLM 제공자를 고르고 API 키를 붙여넣으세요(계정별로 암호화되어 저장됩니다). 아직 키가
없나요? [사용법](#사용법) 아래의 DEMO 옵션을 참고하세요. **Node ≥ 22** 가 필요합니다.

### 방법 A — 로컬 원클릭 스크립트

**Node.js ≥ 22** 가 필요합니다(pnpm 은 corepack 을 통해 자동으로 설정됩니다).

```bash
git clone <repo-url>
cd tradingagents-web
./scripts/install.sh
```

스크립트는 의존성을 설치하고, 전부 빌드한 뒤, API(`:5171`) + 웹 SPA(`:5170`) 를
시작합니다. **<http://localhost:5170>** 을 여세요.

### 방법 B — Docker 원클릭

**Docker**(Compose 포함)가 필요합니다. Node/pnpm 은 필요하지 않습니다.

```bash
git clone <repo-url>
cd tradingagents-web
docker compose up --build
```

이는 두 개의 컨테이너 — NestJS API 와 `/api` 를 그것으로 리버스 프록시하는
nginx 제공 SPA — 를 빌드하고 실행합니다. **<http://localhost:8080>** 을 여세요. 실행,
설정, 암호화된 키는 `helmagents-store` 볼륨에 영속됩니다. 키 없이 시험해 보려면
`docker-compose.yml` 의 `api` 서비스에 `DEMO_LLM=1` 을 설정하세요.

> 수동 설정(개발용): `pnpm install` 후 `pnpm dev`. `pnpm install` 이 무시된 빌드
> 스크립트(esbuild / msw / sharp / @swc/core)에 대해 경고하면, `pnpm-workspace.yaml` 의
> `allowBuilds:` 아래 해당 항목을 `true` 로 설정하거나 `pnpm approve-builds` 를
> 실행하세요.

## 사용법

앱은 **8개 언어**를 지원합니다: `/en /zh /ja /ko /fr /de /es /vi`. 빈 경로 `/` 는 `/en` 으로
리디렉션됩니다.

### 1. 데모 모드 — API 키 불필요

```bash
DEMO_LLM=1 pnpm dev
```

`pnpm dev` 는 Turbo 를 통해 **두 앱을 모두** 시작합니다. NestJS API 는
`http://localhost:5171`, Vite SPA 는 `http://localhost:5170` 에서 실행됩니다(개발 서버가 `/api`
를 API 로 프록시합니다). `DEMO_LLM=1` 은 결정론적 스텁 LLM 으로 **완전한 13개 에이전트
파이프라인**을 구동합니다 — 스트리밍, 영속화, 취소, 리플렉션이 모두 실제로 동작하며, 최종
텍스트 생성만 스텁 처리됩니다. 시연, UI 작업, 로컬 검증에 적합합니다.

`http://localhost:5170/en` 을 열고 **/analyze** 로 이동하여, 실행을 설정한 뒤 **Run analysis**
를 누르세요.

### 2. 실제 LLM 모드

한 제공자의 API 키를 설정하세요 — `/settings`(저장 시 암호화)에서 하거나 환경 변수로 하면
됩니다(see [`.env.example`](.env.example)):

```bash
export OPENAI_API_KEY=sk-...
# optional overrides
export TRADINGAGENTS_LLM_PROVIDER=openai
export TRADINGAGENTS_DEEP_THINK_LLM=gpt-5.5
export TRADINGAGENTS_QUICK_THINK_LLM=gpt-5.4-mini
pnpm dev
```

그런 다음 **/analyze** 에서 분석을 실행하세요. 보고서 언어는 URL 로케일을 따릅니다(예:
`/zh/analyze` → 중국어 보고서). 프로덕션에서는 SPA 와 API 가 별도로 배포됩니다 —
`VITE_API_BASE_URL` 로 SPA 가 API 를 가리키게 하고, `CORS_ORIGIN` 으로 SPA 의 오리진을
허용하세요(see [`.env.example`](.env.example)).

| Path | What |
|---|---|
| `/<locale>` | Home — the pipeline |
| `/<locale>/analyze` | Configure & **stream** an analysis |
| `/<locale>/history` | Past runs |
| `/<locale>/runs/<id>` | Run detail + Markdown export |
| `/<locale>/settings` | Provider / models / data vendors / API keys |

> 전체 실행 가이드(DEMO 모드, 실제 LLM, 문제 해결):
> [`docs/RUNNING.md`](docs/RUNNING.md)

## 결정을 실행에 옮기기 — 토큰화 미국 주식을 거래하고 수수료 20%+ 절약

HelmAgents 는 등급에서 멈추지 않습니다 — **그것을 실행에 옮기고 더 저렴하게 거래하도록**
돕습니다. 같은 미국 주식(NVDA, AAPL, …)이 주요 암호화폐 거래소에서 **토큰화 주식**으로
거래되어, 전통적인 증권사 없이 암호화폐로 하루 종일 매매할 수 있습니다. 앱은 이를 홈
페이지와 모든 실행 상세 페이지("Buy tokenized stocks" 카드)에 표시합니다.

> 💸 **HelmAgents 의 초대 코드로 가입하세요 — Binance 는 `FANWO20`, OKX / Gate 는
> `FANGEIWO` — 거래마다 수수료의 20%+가 약 1시간 이내에 거래소 계좌로 자동
> 환급됩니다.** 거래 수수료는 당신이 완전히 통제할 수 있는 유일한 비용이며, 이 리베이트가
> HelmAgents 를 무료로 유지·관리되게 하는 원천입니다 — 따라서 아래 링크를 사용하면 추가
> 비용 없이 프로젝트를 직접 후원하게 됩니다.

### 지원 거래소 및 리베이트

| Exchange | Sign-up link | Invite code | Fee rebate |
|---|---|---|---|
| **Binance** (`binance.com`) | <https://www.binance.com/join?ref=FANWO20> | `FANWO20` | **20%+ 환급** |
| **OKX** (`okx.com`) | <https://www.okx.com/join/FANGEIWO> | `FANGEIWO` | **20%+ 환급** |
| **Gate** (`gate.io`) | <https://www.gate.io/share/FANGEIWO> | `FANGEIWO` | **20%+ 환급** |

### 수수료 리베이트를 받는 방법

1. **위의 가입 링크를 여세요**(또는 등록 중에 거래소의 초대 코드를 직접 입력하세요 —
   Binance 는 `FANWO20`, OKX / Gate 는 `FANGEIWO`). 환급은 **가입 시** 계정에 바인딩되므로
   처음부터 코드를 사용하세요 — 일반적으로 기존 계정에는 나중에 추가할 수 없습니다.
2. **거래소의 가입 / KYC 를 완료**하고 암호화폐를 입금하세요.
3. **거래하세요** — 해당 주식의 토큰화 심볼을 검색하고 에이전트의 등급(Buy / Overweight /
   Hold / Underweight / Sell)에 따라 실행하세요. 거래 후 약 1시간 이내에 각 거래 수수료의
   20%+가 거래소 계좌로 자동 환급되므로, 그 외에 할 일은 없습니다.

> **앱에서는 가입 시 초대 코드를 입력하세요**(Binance `FANWO20`, OKX/Gate `FANGEIWO`). 놓치기 쉽고 나중에 추가할 수 없습니다.
>
> **신분증당 거래소별 계정 1개.** 이미 등록했다면 가족이 코드로 가입해 리베이트를 받을 수 있습니다.

거래소별 현재 요율과 전체 약관은 **[리베이트 작동 방식 →](https://rebateto.me/how_to_referral)**
을 참고하세요. 앱 내부에서 거래소 카드는 **실시간 초대 링크**도 가져오고, 공식 도메인이 DNS
로 차단된 경우(예: 중국 본토) **백업/미러 링크**를 ("Show backup links" 아래) 노출합니다.

> **공개 및 위험.** 위의 가입 링크는 **추천 링크**입니다 — 당신이 이를 통해 등록하면 작성자가
> 수수료 리베이트를 받으며, 이는 **당신에게 추가 비용이 없습니다**(당신은 수수료의 20%+를
> 환급받고, 거래소가 자신의 몫 일부를 나눕니다). 사용 여부는 전적으로 자발적입니다. 토큰화
> 주식과 암호화폐는 **원금 손실을 포함한** 위험을 수반하며, 모든 관할권에서 이용 가능한 것은
> 아니고, HelmAgents 의 출력은 **리서치/교육 목적의 AI 생성 분석일 뿐 — 투자 조언이
> 아닙니다**. 독립적으로 검증하고, 해당 지역의 법규와 각 거래소의 약관을 준수하세요.

## 인증 및 멀티테넌시

이 앱은 **멀티테넌트**입니다: 각 사용자는 격리된 계정입니다. 가입은 누구나 가능하며(이메일 +
비밀번호로 등록), **인증된 사용자만이 LLM 제공자/키를 구성하거나 분석을 실행할 수
있습니다** — health, docs, `/api/auth/*` 를 제외한 모든 `/api/*` 엔드포인트는 Bearer 토큰을
요구합니다. 각 사용자의 API 키, 설정, 실행, 리플렉션 메모리는 별도로 저장되며(SQLite,
사용자 id 로 스코프됨), 사용자의 키는 실행 시 본인의 엔진에 주입됩니다(전역 환경에는 절대
저장되지 않음). 따라서 계정끼리는 서로의 데이터를 결코 볼 수 없습니다. 토큰 API(JWT 액세스 +
회전 리프레시)는 클라이언트에 독립적입니다 — React SPA 와 향후 네이티브 앱이 이를
공유합니다.

**환경 변수:**

| Var | Default | Purpose |
|---|---|---|
| `AUTH_JWT_SECRET` | dev placeholder | 액세스 토큰용 HMAC 시크릿 — **프로덕션에서는 강력한 값을 설정하세요** |
| `AUTH_ACCESS_TTL_SEC` | `900` | 액세스 토큰 수명 |
| `AUTH_REFRESH_TTL_SEC` | `2592000` | 리프레시 토큰 수명 |
| `AUTH_BOOTSTRAP_EMAIL` / `AUTH_BOOTSTRAP_PASSWORD` | — | 선택: 부팅 시 첫 번째 계정을 시드합니다 |

> **Node ≥ 22** 가 필요합니다(내장 `node:sqlite` 를 사용합니다).

## 구성

엔진은 원본과 동일한 3계층 병합으로 구성을 해석합니다:
`DEFAULT_CONFIG → TRADINGAGENTS_* env vars → runtime overrides (the Settings page)`.

전체 키 목록은 [`packages/config/src/default-config.ts`](packages/config/src/default-config.ts)
를, 각 제공자의 키 변수는 [`packages/llm/src/api-key-env.ts`](packages/llm/src/api-key-env.ts)
를 참고하세요.

## 개발

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

기여는 **블랙박스 TDD**(Red → Green → Refactor)를 따르며 모든 **8개 로케일의 키 일치**를
유지합니다. 설치, 컨벤션, 커밋 스타일은 [**CONTRIBUTING.md**](CONTRIBUTING.md) 를 참고하세요.
CI(`.github/workflows/ci.yml`)는 모든 푸시와 풀 리퀘스트에서 `typecheck`, `test`, `build` 를
실행합니다.

## 상태

**0–4 단계 완료**, 그리고 **전후단 분리**(NestJS API + Vite SPA)까지. 엔진은 스트리밍,
영속화, 설정, 리플렉션과 함께 전체 13개 에이전트 파이프라인을 엔드 투 엔드로 실행합니다. 모든
테스트가 통과하고 `pnpm build` 는 깨끗합니다. 설계 명세는 `docs/superpowers/specs/` 아래를
참고하세요.

## 감사의 말

HelmAgents 는 Tauric Research 의 [**TradingAgents**](https://github.com/TauricResearch/TradingAgents)
(Apache-2.0)**에서 영감을 받았습니다** — 그 멀티 에이전트 거래 결정 설계가 이 프로젝트의 불씨가
되었습니다. HelmAgents 는 그 아이디어를 TypeScript 로 재해석하고 더 발전시키는 것을 목표로 하는
**독립적인** 작업(이식이 아닙니다)이며, 상류 프로젝트에 대한 귀속은 [NOTICE](NOTICE) 에 감사히
보존되어 있습니다. 원본 논문: [arXiv 2412.20138](https://arxiv.org/abs/2412.20138).
[NestJS](https://nestjs.com), [React](https://react.dev) +
[Vite](https://vitejs.dev), [LangGraph.js](https://github.com/langchain-ai/langgraphjs),
[i18next](https://www.i18next.com) 로 구축되었습니다.

## 라이선스

**Apache License, Version 2.0** 으로 라이선스됩니다. HelmAgents 는 TradingAgents(역시
Apache-2.0)에서 영감을 받았으며, 상류 프로젝트에 대한 귀속은 [NOTICE](NOTICE) 에 보존되어
있습니다. 전체 약관은 [LICENSE](LICENSE) 를 참고하세요.

기여함으로써 당신은 자신의 기여가 Apache-2.0 으로 라이선스되며 [행동 강령](CODE_OF_CONDUCT.md)
을 따르는 데 동의하는 것입니다. 보안 이슈를 보고하려면 [SECURITY.md](SECURITY.md) 를
참고하세요.
