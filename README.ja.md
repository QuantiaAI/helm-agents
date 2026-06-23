# HelmAgents

[English](README.md) · [简体中文](README.zh-CN.md) · **[日本語](README.ja.md)** · [한국어](README.ko.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [Español](README.es.md) · [Tiếng Việt](README.vi.md)

[![License: Apache-2.0](https://img.shields.io/badge/license-Apache--2.0-blue.svg)](LICENSE)
[![Node](https://img.shields.io/badge/node-%E2%89%A522-green.svg)](package.json)
[![pnpm](https://img.shields.io/badge/pnpm-11-orange.svg)](package.json)
[![API: NestJS](https://img.shields.io/badge/API-NestJS%2011-e0234e.svg)](https://nestjs.com)
[![Web: React + Vite](https://img.shields.io/badge/Web-React%2019%20%2B%20Vite-646cff.svg)](https://vitejs.dev)

**マルチエージェント LLM トレーディング、その舵を握る。** 13 体の AI アナリストが
調査し、議論し、リスクをストレステストして、追跡可能なひとつの取引判断へ収束する——
すべてブラウザでライブにストリーミングされます。

> **独立した** TypeScript ネイティブのプロジェクト。スタンドアロンの **NestJS API** と **React + Vite** SPA で構築した、ブラウザファーストで完全に観測可能なトレーディングデスク — ストリーミング対応・追跡可能・特定ベンダー非依存。

---

## 💸 トークン化米国株を取引して、手数料を 20%+ 節約

**すべての判断を実行に移しつつ、取引手数料を 20%+ カット。** 同じ米国株
（NVDA、AAPL……）を、暗号資産で支払う **トークン化株式** として Binance / OKX / Gate
で買えます——私たちの招待コードで登録すれば、取引ごとに手数料の 20%+ が約1時間以内に取引所の口座へ自動で返還されます。

| 取引所 | 招待コード | 登録 |
|---|---|---|
| **Binance** | `FANWO20` | <https://www.binance.com/join?ref=FANWO20> |
| **OKX** | `FANGEIWO` | <https://www.okx.com/join/FANGEIWO> |
| **Gate** | `FANGEIWO` | <https://www.gate.io/share/FANGEIWO> |

> 手数料リベートはスポンサー **[rebateto.me](https://rebateto.me/how_to_referral)** の
> 提供によるものです。詳細、中国本土向けのミラーリンク、受け取り方は →
> [判断を実行する](#判断を実行する--トークン化米国株を取引し手数料を-20-節約)。
> *リファラルリンクです——あなたに追加コストなしで本プロジェクトを支援できます。
> 投資助言ではありません。暗号資産/トークン化株式にはリスクがあります。*

---

## なぜ HelmAgents なのか？

HelmAgents は、LLM 駆動のアナリスト、リサーチャー、トレーダー、リスク
アナリスト、ポートフォリオマネージャーで一つの取引会社全体をモデル化し、
完全な推論に裏付けられた 5 段階の取引判断へと収束させます。しかも CLI の
研究用スクリプトで止まりません——**観察可能・共有可能・プロバイダー非依存で、
改善を続けられるように作られた** 実際のプロダクトです:

- **思考を見る。** ライブのストリーミングタイムライン（SSE）が、各アナリストと
  すべての議論ターンを完了するそばから表示します——終わるまでターミナルを
  見つめ続ける必要はもうありません。
- **Python は不要。** NestJS API がエンジンをホストし、React/Vite の SPA が
  それを駆動します。ブラウザで実行を設定し、ボタンを押し、判断を読むだけです。
- **好きなモデルを使える。** 20 プロバイダーのレジストリ（OpenAI 互換ファミリー +
  ネイティブの Anthropic/Google）により、特定ベンダーに縛られません。
- **追跡・再生できる判断。** すべての実行はその完全な推論（アナリストレポート、
  強気/弱気 + リスク議論、最終判断）とともに永続化され、Markdown として
  エクスポートできます。
- **実行へ、しかも安く。** 同じ銘柄を **トークン化株式** として
  Binance / OKX / Gate で取引し、招待コード `FANWO20`（Binance）または
  `FANGEIWO`（OKX / Gate）で登録すれば、取引ごとに手数料の **20%+ が約1時間以内に口座へ自動返還** されます。
  [判断を実行する](#判断を実行する--トークン化米国株を取引し手数料を-20-節約) を参照。
- **デフォルトで安全。** API キーは保存時に暗号化され（AES-256-GCM）、実行データは
  あなたのマシンに留まり、外部に送信されるものは何もありません。

> ⚠️ **投資助言ではありません。** HelmAgents が生成するのは研究・教育のみを目的とした
> AI 生成の分析です。誤ることがあります。独立して検証してください。取引と暗号資産には
> 元本損失を含むリスクがあります。

## 何をするのか

`(ticker, tradeDate)` を与えると、13 エージェントのパイプラインが完全な裏付け
分析つきで 5 段階の取引判断（**買い / 増し玉 / 保有 / 減らし / 売り**）を生成します。

1. **アナリスト** — 市場 · センチメント · ニュース · ファンダメンタルがデータを収集。
2. **投資議論** — 強気 ⇄ 弱気のリサーチャーが議論し、リサーチマネージャーが
   構造化された投資計画へと裁定します。
3. **トレーダー** — 計画を、エントリー・ストップロス・サイジングを伴う
   買い/保有/売りの提案に変換します。
4. **リスク議論** — 積極 / 保守 / 中立のアナリストが提案をストレステストします。
5. **ポートフォリオマネージャー** — すべてを総合して最終判断にまとめます。

## 仕組み

パイプラインは LangGraph.js の `StateGraph` として動作し、各エージェントが完了する
たびに `nodeEnd` イベントをブラウザへストリーミングします。アナリストはデータを
インラインで先読み取得し（オリジナルのツール呼び出しループと同等の出力を、余計な
往復なしで実現します）、すべてのレポート、議論の書き起こし、最終判断は実行状態に
キャプチャされます。

## アーキテクチャ

pnpm モノレポで、**フロントエンドとバックエンドを分離** しています。エンジンと
すべてのビジネスロジックはフレームワーク非依存の package に置かれ、NestJS API が
それらをホストし、React/Vite の SPA が（共有 contracts package で型付けされた）
HTTP 経由で API と通信します。

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

**データフロー:** `apps/web`（SPA）→ HTTP `/api/*` → `apps/api`（NestJS）→
`core.propagate()` → `workflow.buildGraph()` → `agents.*`
（`dataflows.routeToVendor` を呼ぶ）+ `llm.createLlmClient`。実行タイムラインは
API から NDJSON でストリーミングされます。

## インストール

ワンクリックで動かす方法が 2 通りあります。どちらも通常モードでアプリを起動します——
起動したらアプリを開き、**アカウントを作成**（オープンなサインアップ）してから
**Settings** へ進んで LLM プロバイダーを選び、API キーを貼り付けてください
（アカウントごとに暗号化して保存されます）。まだキーがない場合は
[使い方](#使い方) の DEMO オプションを参照してください。**Node ≥ 22** が必要です。

### オプション A — ローカルのワンクリックスクリプト

**Node.js ≥ 22** が必要です（pnpm は corepack 経由で自動的にセットアップされます）。

```bash
git clone <repo-url>
cd tradingagents-web
./scripts/install.sh
```

このスクリプトは依存関係をインストールし、すべてをビルドして、API（`:5171`）+
web SPA（`:5170`）を起動します。**<http://localhost:5170>** を開いてください。

### オプション B — Docker のワンクリック

**Docker**（Compose 付き）が必要です。Node/pnpm は不要です。

```bash
git clone <repo-url>
cd tradingagents-web
docker compose up --build
```

これは 2 つのコンテナをビルドして実行します——NestJS API と、`/api` をそれへ
リバースプロキシする nginx 配信の SPA です。**<http://localhost:8080>** を開いて
ください。実行データ、設定、暗号化されたキーは `helmagents-store` ボリュームに
永続化されます。キーなしで試すには、`docker-compose.yml` の `api` サービスに対して
`DEMO_LLM=1` を設定してください。

> 手動セットアップ（開発用）: `pnpm install` のあと `pnpm dev`。`pnpm install` が
> 無視されたビルドスクリプト（esbuild / msw / sharp / @swc/core）について警告する
> 場合は、`pnpm-workspace.yaml` の `allowBuilds:` 配下で該当エントリを `true` に
> 設定するか、`pnpm approve-builds` を実行してください。

## 使い方

アプリは **8 言語** に対応します: `/en /zh /ja /ko /fr /de /es /vi`。素のパス `/` は
`/en` にリダイレクトされます。

### 1. デモモード — API キー不要

```bash
DEMO_LLM=1 pnpm dev
```

`pnpm dev` は Turbo 経由で **両方** のアプリを起動します。NestJS API は
`http://localhost:5171`、Vite SPA は `http://localhost:5170` で動作します（dev サーバー
が `/api` を API へプロキシします）。`DEMO_LLM=1` は決定論的なスタブ LLM で
**13 エージェントのパイプライン全体** を駆動します——ストリーミング、永続化、
キャンセル、リフレクションはすべて実際に動作し、スタブされるのは最終的なテキスト
生成だけです。デモ、UI 作業、ローカル検証に最適です。

`http://localhost:5170/en` を開き、**/analyze** へ進み、実行を設定して
**Run analysis** を押します。

### 2. 実 LLM モード

いずれか一つのプロバイダーの API キーを設定します——`/settings`（保存時暗号化）か、
環境変数経由（[`.env.example`](.env.example) を参照）のいずれかです。

```bash
export OPENAI_API_KEY=sk-...
# optional overrides
export TRADINGAGENTS_LLM_PROVIDER=openai
export TRADINGAGENTS_DEEP_THINK_LLM=gpt-5.5
export TRADINGAGENTS_QUICK_THINK_LLM=gpt-5.4-mini
pnpm dev
```

その後 **/analyze** で分析を実行します。レポートの言語は URL のロケールに従います
（例: `/zh/analyze` → 中国語レポート）。本番では SPA と API を別々にデプロイします——
`VITE_API_BASE_URL` で SPA を API に向け、`CORS_ORIGIN` でその origin を許可します
（[`.env.example`](.env.example) を参照）。

| パス | 内容 |
|---|---|
| `/<locale>` | ホーム — パイプライン |
| `/<locale>/analyze` | 設定して分析を **ストリーミング** |
| `/<locale>/history` | 過去の実行 |
| `/<locale>/runs/<id>` | 実行詳細 + Markdown エクスポート |
| `/<locale>/settings` | プロバイダー / モデル / データベンダー / API キー |

> 完全な実行ガイド（DEMO モード、実 LLM、トラブルシューティング）:
> [`docs/RUNNING.md`](docs/RUNNING.md)

## 判断を実行する — トークン化米国株を取引し、手数料を 20%+ 節約

HelmAgents は評価で終わりません——**実行に移し、より安く取引する** ことを助けます。
同じ米国株（NVDA、AAPL……）が主要な暗号資産取引所で **トークン化株式** として取引でき、
暗号資産を使って 24 時間いつでも売買でき、従来の証券会社は不要です。アプリはこれを
ホームページとすべての実行詳細ページ（「トークン化株式を購入」カード）に表示します。

> 💸 **HelmAgents の招待コードで登録してください——Binance では `FANWO20`、
> OKX / Gate では `FANGEIWO`——これで、取引ごとに手数料の 20%+ が約1時間以内に
> 取引所の口座へ自動で返還されます。** 取引手数料はあなたが完全にコントロールできる
> 唯一のコストであり、このリベートこそ HelmAgents を無料で維持し続けられる源です——
> 下記のリンクから登録すれば、追加コストなしでそのままこのプロジェクトを支援する
> ことになります。

### 対応取引所とリベート

| 取引所 | 登録リンク | 招待コード | 手数料リベート |
|---|---|---|---|
| **Binance** (`binance.com`) | <https://www.binance.com/join?ref=FANWO20> | `FANWO20` | **20%+ 返還** |
| **OKX** (`okx.com`) | <https://www.okx.com/join/FANGEIWO> | `FANGEIWO` | **20%+ 返還** |
| **Gate** (`gate.io`) | <https://www.gate.io/share/FANGEIWO> | `FANGEIWO` | **20%+ 返還** |

### 手数料リベートの受け取り方

1. **上記の登録リンクを開く**（または登録時に取引所の招待コードを手動で入力する——
   Binance なら `FANWO20`、OKX / Gate なら `FANGEIWO`）。リベートは **登録時** に
   アカウントへ紐付くため、必ず最初からコードを使ってください——一般に、既存の
   アカウントに後から追加することはできません。
2. **取引所の登録 / KYC を完了** し、暗号資産を入金します。
3. **取引する** — その株式のトークン化シンボルを検索し、エージェントの評価
   （Buy / Overweight / Hold / Underweight / Sell）に従って行動します。各取引後、
   約1時間以内に手数料の 20%+ が取引所の口座へ自動で返還されるので、他に何もする
   ことはありません。

> **アプリでは登録時に招待コードを入力**（Binance `FANWO20`、OKX/Gate `FANGEIWO`）。見落としやすく、後からの追加はできません。
>
> **本人確認書類1つにつき各取引所で1口座。** 登録済みなら、ご家族が招待コードで登録して還元を受けられます。

各取引所の現在のレートと完全な条件は
**[リベートの仕組み →](https://rebateto.me/how_to_referral)** を参照してください。
アプリ内では、取引所カードが **ライブの招待リンク** も取得し、公式ドメインが DNS で
遮断されている場合（例: 中国本土）には（「バックアップリンクを表示」の下に）
**バックアップ/ミラーリンク** を提示します。

> **開示とリスク。** 上記の登録リンクは **リファラルリンク** です——あなたがそこから
> 登録すると、作者は手数料リベートを受け取りますが、**あなたに追加コストはありません**
> （あなたは手数料の 20%+ の返還を受け取り、取引所は自分の取り分の一部を分けます）。利用は
> 完全に任意です。トークン化株式と暗号資産には **元本損失を含む** リスクがあり、
> すべての法域で利用できるわけではなく、HelmAgents の出力は
> **研究/教育のみを目的とした AI 生成の分析であり、投資助言ではありません**。
> 独立して検証し、お住まいの地域の法律と各取引所の規約を遵守してください。

## 認証とマルチテナンシー

このアプリは **マルチテナント** です。各ユーザーは隔離されたアカウントです。
サインアップはオープンで（メール + パスワードで登録）、**認証済みユーザーだけが LLM
プロバイダー/キーを設定したり分析を実行したりできます**——ヘルスチェック、ドキュメント、
`/api/auth/*` を除くすべての `/api/*` エンドポイントは Bearer トークンを必要とします。
各ユーザーの API キー、設定、実行、リフレクションメモリは別々に保存されます
（SQLite、ユーザー id でスコープされます）。ユーザーのキーは実行時に本人のエンジンへ
注入され（グローバル環境には決して書き込まれません）、アカウント同士が互いのデータを
見ることはありません。トークン API（JWT アクセス + ローテーションするリフレッシュ）は
クライアント非依存です——React SPA と将来のネイティブアプリが共有します。

**環境変数:**

| 変数 | デフォルト | 用途 |
|---|---|---|
| `AUTH_JWT_SECRET` | dev placeholder | アクセストークン用の HMAC シークレット——**本番では強い値を設定してください** |
| `AUTH_ACCESS_TTL_SEC` | `900` | アクセストークンの有効期間 |
| `AUTH_REFRESH_TTL_SEC` | `2592000` | リフレッシュトークンの有効期間 |
| `AUTH_BOOTSTRAP_EMAIL` / `AUTH_BOOTSTRAP_PASSWORD` | — | 任意: 起動時に最初のアカウントをシードします |

> **Node ≥ 22** が必要です（組み込みの `node:sqlite` を使用します）。

## 設定

エンジンはオリジナルと同じ三層マージで設定を解決します:
`DEFAULT_CONFIG → TRADINGAGENTS_* 環境変数 → 実行時オーバーライド（設定ページ）`。

完全なキー一覧は
[`packages/config/src/default-config.ts`](packages/config/src/default-config.ts) を、
各プロバイダーのキー変数は
[`packages/llm/src/api-key-env.ts`](packages/llm/src/api-key-env.ts) を参照してください。

## 開発

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

コントリビューションは **ブラックボックス TDD**（Red → Green → Refactor）に従い、
**8 ロケールすべてのキーパリティ** を保ちます。セットアップ、規約、コミットスタイルは
[**CONTRIBUTING.md**](CONTRIBUTING.md) を参照してください。CI
（`.github/workflows/ci.yml`）はすべての push とプルリクエストで `typecheck`、`test`、
`build` を実行します。

## ステータス

**フェーズ 0–4 完了**、加えて **フロントエンド/バックエンドの分離**（NestJS API + Vite
SPA）を実施。エンジンはストリーミング、永続化、設定、リフレクションを伴って
13 エージェントのパイプライン全体をエンドツーエンドで実行します。すべてのテストが通り、
`pnpm build` はクリーンです。設計仕様は `docs/superpowers/specs/` 配下を参照してください。

## 謝辞

HelmAgents は、Tauric Research による
[**TradingAgents**](https://github.com/TauricResearch/TradingAgents)（Apache-2.0）に
**触発されて** 生まれました——そのマルチエージェント取引判断の設計が本プロジェクトの
きっかけです。HelmAgents は、そのアイデアを TypeScript で捉え直し、さらに先を目指す
**独立した** 作品です（移植ではありません）。上流プロジェクトへの帰属表示は
[NOTICE](NOTICE) に感謝とともに保持されています。オリジナル論文:
[arXiv 2412.20138](https://arxiv.org/abs/2412.20138)。
[NestJS](https://nestjs.com)、[React](https://react.dev) +
[Vite](https://vitejs.dev)、[LangGraph.js](https://github.com/langchain-ai/langgraphjs)、
[i18next](https://www.i18next.com) を用いて構築されています。

## ライセンス

**Apache License, Version 2.0** の下でライセンスされています。HelmAgents は
TradingAgents（同じく Apache-2.0）に **触発されて** 生まれており、上流プロジェクトへの
帰属表示は [NOTICE](NOTICE) に保持されています。完全な条件は [LICENSE](LICENSE) を
参照してください。

コントリビュートすることで、あなたは自分のコントリビューションが Apache-2.0 の下で
ライセンスされること、および [行動規範](CODE_OF_CONDUCT.md) に従うことに同意します。
セキュリティ問題の報告については [SECURITY.md](SECURITY.md) を参照してください。
