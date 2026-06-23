# HelmAgents

[简体中文](README.md) · [English](README.en.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [Español](README.es.md) · **[Tiếng Việt](README.vi.md)**

[![License: Apache-2.0](https://img.shields.io/badge/license-Apache--2.0-blue.svg)](LICENSE)
[![Node](https://img.shields.io/badge/node-%E2%89%A522-green.svg)](package.json)
[![pnpm](https://img.shields.io/badge/pnpm-11-orange.svg)](package.json)
[![API: NestJS](https://img.shields.io/badge/API-NestJS%2011-e0234e.svg)](https://nestjs.com)
[![Web: React + Vite](https://img.shields.io/badge/Web-React%2019%20%2B%20Vite-646cff.svg)](https://vitejs.dev)

**Giao dịch LLM đa tác nhân, do bạn cầm lái.** Mười ba nhà phân tích AI nghiên
cứu, tranh luận, kiểm tra rủi ro và hội tụ về một quyết định giao dịch duy nhất,
có thể truy vết — phát trực tiếp ngay trong trình duyệt của bạn.

> Một dự án **độc lập**, thuần TypeScript: một bàn giao dịch ưu tiên trình duyệt và hoàn toàn có thể quan sát, xây dựng trên **API NestJS** độc lập + SPA **React + Vite** — truyền phát trực tiếp, có thể truy vết và không phụ thuộc nhà cung cấp.

---

## 💸 Giao dịch cổ phiếu Mỹ token hóa — tiết kiệm hơn 20% phí

**Hành động theo mọi quyết định và được hoàn lại hơn 20% phí giao dịch của bạn.** Mua
chính những cổ phiếu Mỹ đó (NVDA, AAPL, …) dưới dạng **cổ phiếu token hóa** trên
Binance / OKX / Gate, thanh toán bằng crypto — đăng ký bằng mã mời của chúng tôi
và **20%+ phí của mỗi giao dịch sẽ được tự động hoàn về tài khoản sàn của bạn
trong khoảng một giờ**:

| Exchange | Invite code | Sign up |
|---|---|---|
| **Binance** | `FANWO20` | <https://www.binance.com/join?ref=FANWO20> |
| **OKX** | `FANGEIWO` | <https://www.okx.com/join/FANGEIWO> |
| **Gate** | `FANGEIWO` | <https://www.gate.io/share/FANGEIWO> |

> Hoàn phí được tài trợ bởi nhà tài trợ của chúng tôi **[rebateto.me](https://rebateto.me/how_to_referral)**.
> Chi tiết đầy đủ, liên kết mirror cho Trung Quốc đại lục, và cách nhận →
> [Hành động theo quyết định](#hành-động-theo-quyết-định--giao-dịch-cổ-phiếu-mỹ-token-hóa-và-tiết-kiệm-20-phí).
> *Liên kết giới thiệu — chúng hỗ trợ dự án này mà không phát sinh thêm chi phí cho
> bạn. Không phải lời khuyên đầu tư; crypto/cổ phiếu token hóa có rủi ro.*

---

## Vì sao có HelmAgents?

HelmAgents mô phỏng cả một công ty giao dịch với các nhà phân tích, nghiên cứu
viên, một trader, các nhà phân tích rủi ro và một quản lý danh mục được LLM dẫn
dắt, rồi để họ hội tụ về một quyết định giao dịch 5 mức được hậu thuẫn bởi lập
luận đầy đủ. Nhưng nó không dừng lại ở một kịch bản nghiên cứu chạy bằng CLI — đây
là một sản phẩm thực thụ, **có thể quan sát, có thể chia sẻ, không phụ thuộc nhà
cung cấp và được xây để liên tục cải thiện**:

- **Nhìn nó tư duy.** Một dòng thời gian phát trực tiếp (SSE) hiển thị từng nhà
  phân tích và mỗi lượt tranh luận ngay khi hoàn thành — không còn phải nhìn chằm
  chằm vào terminal cho tới cuối.
- **Không cần Python.** Một NestJS API lưu trữ engine; một SPA React/Vite điều
  khiển nó. Cấu hình một lần chạy trong trình duyệt, nhấn một nút, đọc quyết định.
- **Tự mang mô hình của bạn.** Một registry 20 nhà cung cấp (họ tương thích
  OpenAI + Anthropic/Google gốc) nghĩa là bạn không bị khóa vào một nhà cung cấp.
- **Quyết định có thể truy vết, có thể phát lại.** Mỗi lần chạy được lưu cùng toàn
  bộ lập luận (báo cáo phân tích, tranh luận tăng/giảm + rủi ro, quyết định cuối),
  và có thể xuất ra Markdown.
- **Hành động — và trả ít hơn.** Giao dịch chính những mã đó dưới dạng **cổ phiếu
  token hóa** trên Binance / OKX / Gate, và đăng ký bằng mã mời `FANWO20` (Binance)
  hoặc `FANGEIWO` (OKX / Gate) để được **hoàn 20%+ phí giao dịch** (hoàn về tài
  khoản của bạn trong ~1h sau mỗi giao dịch). Xem [Hành động
  theo quyết định](#hành-động-theo-quyết-định--giao-dịch-cổ-phiếu-mỹ-token-hóa-và-tiết-kiệm-20-phí).
- **An toàn theo mặc định.** Khóa API được mã hóa khi lưu (AES-256-GCM); dữ liệu
  lần chạy nằm trên máy của bạn; không có gì gửi về máy chủ.

> ⚠️ **Không phải lời khuyên tài chính.** HelmAgents tạo ra phân tích do AI sinh
> ra chỉ nhằm mục đích nghiên cứu và giáo dục. Nó có thể sai. Hãy kiểm chứng độc
> lập; giao dịch và tài sản crypto có rủi ro, kể cả mất vốn.

## Nó làm gì

Cho một `(ticker, tradeDate)`, một pipeline 13 tác nhân tạo ra một quyết định
giao dịch 5 mức (**Buy / Overweight / Hold / Underweight / Sell**) kèm phân tích
hỗ trợ đầy đủ:

1. **Nhà phân tích** — Thị trường · Cảm xúc · Tin tức · Cơ bản thu thập dữ liệu.
2. **Tranh luận đầu tư** — Nghiên cứu viên Tăng ⇄ Giảm tranh luận; một Quản lý
   nghiên cứu phân xử thành một kế hoạch đầu tư có cấu trúc.
3. **Trader** — chuyển kế hoạch thành đề xuất mua/giữ/bán kèm giá vào, cắt lỗ và
   quy mô vị thế.
4. **Tranh luận rủi ro** — Các nhà phân tích Tích cực / Bảo thủ / Trung lập kiểm
   tra áp lực cho nó.
5. **Quản lý danh mục** — tổng hợp tất cả thành quyết định cuối cùng.

## Cách hoạt động

Pipeline chạy như một `StateGraph` của LangGraph.js và phát các sự kiện `nodeEnd`
tới trình duyệt khi mỗi tác nhân hoàn thành. Các nhà phân tích nạp trước dữ liệu
của họ ngay trong luồng (đầu ra tương đương vòng lặp gọi công cụ của bản gốc, mà
không cần các vòng đi-về bổ sung), và mọi báo cáo, biên bản tranh luận cùng quyết
định cuối đều được ghi lại trong trạng thái lần chạy.

## Kiến trúc

Monorepo pnpm với **frontend và backend tách biệt**. Engine và toàn bộ logic
nghiệp vụ nằm trong các package không phụ thuộc framework; NestJS API lưu trữ
chúng, và SPA React/Vite trò chuyện với API qua HTTP (được định kiểu bởi một
package contracts dùng chung).

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

**Luồng dữ liệu:** `apps/web` (SPA) → HTTP `/api/*` → `apps/api` (NestJS) →
`core.propagate()` → `workflow.buildGraph()` → `agents.*`
(gọi `dataflows.routeToVendor`) + `llm.createLlmClient`. Dòng thời gian lần chạy
được phát từ API dưới dạng NDJSON.

## Cài đặt

Hai cách một-cú-nhấp để chạy. Cả hai đều khởi động ứng dụng ở chế độ thường — sau
đó mở ứng dụng, **tạo một tài khoản** (đăng ký mở), vào **Settings**, chọn một nhà
cung cấp LLM và dán khóa API của bạn (được lưu mã hóa theo từng tài khoản). Chưa có
khóa? Xem tùy chọn DEMO ở mục [Sử dụng](#sử-dụng). Yêu cầu **Node ≥ 22**.

### Cách A — script một-cú-nhấp cục bộ

Yêu cầu **Node.js ≥ 22** (pnpm được thiết lập tự động qua corepack).

```bash
git clone <repo-url>
cd tradingagents-web
./scripts/install.sh
```

Script này cài đặt phụ thuộc, build mọi thứ, và khởi động API (`:5171`) + web SPA
(`:5170`). Mở **<http://localhost:5170>**.

### Cách B — Docker một-cú-nhấp

Yêu cầu **Docker** (kèm Compose). Không cần Node/pnpm.

```bash
git clone <repo-url>
cd tradingagents-web
docker compose up --build
```

Lệnh này build và chạy hai container — NestJS API và một SPA do nginx phục vụ,
reverse-proxy `/api` tới nó. Mở **<http://localhost:8080>**. Các lần chạy, cài đặt,
và khóa đã mã hóa được lưu bền trong volume `helmagents-store`. Để thử mà không cần
khóa, đặt `DEMO_LLM=1` cho service `api` trong `docker-compose.yml`.

> Thiết lập thủ công (cho phát triển): `pnpm install` rồi `pnpm dev`. Nếu `pnpm
> install` cảnh báo về các build script bị bỏ qua (esbuild / msw / sharp /
> @swc/core), hãy đặt mục tương ứng thành `true` dưới `allowBuilds:` trong
> `pnpm-workspace.yaml` hoặc chạy `pnpm approve-builds`.

## Sử dụng

Ứng dụng hỗ trợ **8 ngôn ngữ**: `/en /zh /ja /ko /fr /de /es /vi`. Đường dẫn trống
`/` chuyển hướng tới `/en`.

### 1. Chế độ Demo — không cần khóa API

```bash
DEMO_LLM=1 pnpm dev
```

`pnpm dev` khởi động **cả hai** ứng dụng qua Turbo: NestJS API tại
`http://localhost:5171` và SPA Vite tại `http://localhost:5170` (dev server proxy
`/api` → API). `DEMO_LLM=1` chạy **toàn bộ pipeline 13 tác nhân** với một LLM stub
tất định — phát trực tiếp, lưu trữ, hủy và phản tư đều chạy thật; chỉ phần sinh
văn bản cuối là được stub. Hoàn hảo cho trình diễn, làm việc UI và kiểm chứng cục
bộ.

Mở `http://localhost:5170/en`, vào **/analyze**, cấu hình một lần chạy, và nhấn
**Run analysis**.

### 2. Chế độ LLM thật

Cấu hình khóa API của một nhà cung cấp — hoặc trong `/settings` (mã hóa khi lưu)
hoặc qua biến môi trường (xem [`.env.example`](.env.example)):

```bash
export OPENAI_API_KEY=sk-...
# optional overrides
export TRADINGAGENTS_LLM_PROVIDER=openai
export TRADINGAGENTS_DEEP_THINK_LLM=gpt-5.5
export TRADINGAGENTS_QUICK_THINK_LLM=gpt-5.4-mini
pnpm dev
```

Sau đó chạy một phân tích trên **/analyze**. Ngôn ngữ báo cáo theo locale của URL
(vd. `/zh/analyze` → báo cáo tiếng Trung). Trong môi trường production, SPA và API
được triển khai riêng — trỏ SPA tới API bằng `VITE_API_BASE_URL` và cho phép nguồn
gốc của nó qua `CORS_ORIGIN` (xem [`.env.example`](.env.example)).

| Path | Chức năng |
|---|---|
| `/<locale>` | Trang chủ — pipeline |
| `/<locale>/analyze` | Cấu hình & **phát trực tiếp** một phân tích |
| `/<locale>/history` | Các lần chạy trước |
| `/<locale>/runs/<id>` | Chi tiết lần chạy + xuất Markdown |
| `/<locale>/settings` | Nhà cung cấp / mô hình / nguồn dữ liệu / khóa API |

> Hướng dẫn chạy đầy đủ (chế độ DEMO, LLM thật, khắc phục sự cố):
> [`docs/RUNNING.md`](docs/RUNNING.md)

## Hành động theo quyết định — giao dịch cổ phiếu Mỹ token hóa và tiết kiệm 20%+ phí

HelmAgents không dừng ở một đánh giá — nó giúp bạn **hành động theo đó và giao
dịch rẻ hơn**. Chính những cổ phiếu Mỹ đó (NVDA, AAPL, …) giao dịch dưới dạng **cổ
phiếu token hóa** trên các sàn crypto lớn, mua bán suốt ngày đêm bằng crypto,
không cần môi giới truyền thống. Ứng dụng làm nổi bật điều này trên trang chủ và
mọi trang chi tiết lần chạy (thẻ "Buy tokenized stocks").

> 💸 **Đăng ký bằng các mã mời của HelmAgents — `FANWO20` trên Binance, `FANGEIWO`
> trên OKX / Gate — và 20%+ phí của mỗi giao dịch sẽ được tự động hoàn về tài khoản
> sàn của bạn trong khoảng một giờ sau mỗi giao dịch.** Phí giao dịch là khoản chi phí duy nhất bạn hoàn toàn kiểm
> soát, và khoản hoàn phí này chính là thứ giữ cho HelmAgents miễn phí và được duy
> trì — vì vậy dùng các liên kết dưới đây trực tiếp hỗ trợ dự án mà không phát sinh
> thêm chi phí cho bạn.

### Các sàn được hỗ trợ & hoàn phí

| Exchange | Sign-up link | Invite code | Fee rebate |
|---|---|---|---|
| **Binance** (`binance.com`) | <https://www.binance.com/join?ref=FANWO20> | `FANWO20` | **hoàn 20%+** |
| **OKX** (`okx.com`) | <https://www.okx.com/join/FANGEIWO> | `FANGEIWO` | **hoàn 20%+** |
| **Gate** (`gate.io`) | <https://www.gate.io/share/FANGEIWO> | `FANGEIWO` | **hoàn 20%+** |

### Cách nhận hoàn phí

1. **Mở một liên kết đăng ký ở trên** (hoặc nhập thủ công mã mời của sàn trong lúc
   đăng ký — `FANWO20` cho Binance, `FANGEIWO` cho OKX / Gate). Khoản hoàn phí gắn với
   tài khoản **tại lúc đăng ký**, nên hãy dùng mã ngay từ đầu — nói chung nó không
   thể thêm vào một tài khoản đã có.
2. **Hoàn tất đăng ký / KYC của sàn** và nạp crypto.
3. **Giao dịch** — tìm ký hiệu token hóa của cổ phiếu và hành động theo đánh giá
   của các tác nhân (Buy / Overweight / Hold / Underweight / Sell). 20%+ phí của
   mỗi giao dịch sẽ được tự động hoàn về tài khoản sàn của bạn trong khoảng một
   giờ; không cần làm gì thêm.

> **Trong app, nhập mã mời khi đăng ký** (`FANWO20` Binance · `FANGEIWO` OKX/Gate) — rất dễ bỏ sót và không thể thêm sau.
>
> **Mỗi giấy tờ một tài khoản trên mỗi sàn.** Đã đăng ký? Người thân có thể đăng ký bằng mã mời để nhận hoàn phí.

Xem **[cách hoàn phí hoạt động →](https://rebateto.me/how_to_referral)** để biết
mức theo từng sàn hiện hành và điều khoản đầy đủ. Bên trong ứng dụng, các thẻ sàn
cũng kéo về **liên kết mời trực tiếp** và hiển thị **liên kết dự phòng/mirror**
(dưới "Show backup links") khi tên miền chính thức bị chặn DNS (vd. ở Trung Quốc
đại lục).

> **Tiết lộ & rủi ro.** Các liên kết đăng ký ở trên là **liên kết giới thiệu** —
> tác giả nhận được khoản hoàn phí khi bạn đăng ký qua chúng, **không phát sinh
> thêm chi phí cho bạn** (bạn được hoàn lại 20%+ phí của mình; sàn chia một phần khoản cắt của
> mình). Việc sử dụng chúng hoàn toàn tự nguyện. Cổ phiếu token hóa và crypto có
> rủi ro **kể cả mất vốn**, không khả dụng ở mọi khu vực pháp lý, và đầu ra của
> HelmAgents là **phân tích do AI sinh ra chỉ nhằm nghiên cứu/giáo dục — không
> phải lời khuyên đầu tư**. Hãy kiểm chứng độc lập và tuân thủ pháp luật địa phương
> cùng điều khoản của mỗi sàn.

## Xác thực và đa người thuê

Ứng dụng là **đa người thuê**: mỗi người dùng là một tài khoản tách biệt. Việc đăng
ký là mở (đăng ký bằng email + mật khẩu) và **chỉ người dùng đã xác thực mới có thể
cấu hình nhà cung cấp/khóa LLM hoặc chạy phân tích** — mọi endpoint `/api/*` ngoại
trừ health, docs và `/api/auth/*` đều yêu cầu một Bearer token. Khóa API, cài đặt,
các lần chạy và bộ nhớ phản tư của mỗi người dùng được lưu riêng biệt (SQLite, được
phạm vi hóa theo id người dùng); khóa của một người dùng được tiêm vào engine của
chính họ tại thời điểm chạy (không bao giờ vào môi trường toàn cục), nên các tài
khoản không bao giờ thấy dữ liệu của nhau. API token (JWT access + refresh xoay
vòng) không phụ thuộc client — SPA React và một ứng dụng native trong tương lai dùng
chung nó.

**Env:**

| Var | Default | Mục đích |
|---|---|---|
| `AUTH_JWT_SECRET` | dev placeholder | Khóa bí mật HMAC cho access token — **đặt một giá trị mạnh trong production** |
| `AUTH_ACCESS_TTL_SEC` | `900` | Thời gian sống của access token |
| `AUTH_REFRESH_TTL_SEC` | `2592000` | Thời gian sống của refresh token |
| `AUTH_BOOTSTRAP_EMAIL` / `AUTH_BOOTSTRAP_PASSWORD` | — | Tùy chọn: tạo sẵn tài khoản đầu tiên khi khởi động |

> Yêu cầu **Node ≥ 22** (dùng `node:sqlite` tích hợp sẵn).

## Cấu hình

Engine giải quyết cấu hình bằng cùng cơ chế hợp nhất ba lớp như bản gốc:
`DEFAULT_CONFIG → TRADINGAGENTS_* env vars → runtime overrides (the Settings page)`.

Xem [`packages/config/src/default-config.ts`](packages/config/src/default-config.ts)
để biết danh sách khóa đầy đủ và
[`packages/llm/src/api-key-env.ts`](packages/llm/src/api-key-env.ts) để biết biến
khóa của từng nhà cung cấp.

## Phát triển

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

Đóng góp tuân theo **black-box TDD** (Red → Green → Refactor) và giữ tất cả **8
locale ngang bằng về khóa**. Xem [**CONTRIBUTING.md**](CONTRIBUTING.md) để biết
thiết lập, quy ước và phong cách commit. CI (`.github/workflows/ci.yml`) chạy
`typecheck`, `test` và `build` trên mỗi lần push và pull request.

## Trạng thái

**Hoàn tất các giai đoạn 0–4**, cùng với một **tách frontend/backend** (NestJS API
+ Vite SPA). Engine chạy toàn bộ pipeline 13 tác nhân từ đầu đến cuối với phát
trực tiếp, lưu trữ, cài đặt và phản tư. Tất cả test đều qua và `pnpm build` sạch.
Xem các đặc tả thiết kế dưới `docs/superpowers/specs/`.

## Lời cảm ơn

HelmAgents được **lấy cảm hứng từ** [**TradingAgents**](https://github.com/TauricResearch/TradingAgents)
bởi Tauric Research (Apache-2.0) — thiết kế quyết định giao dịch đa tác nhân của nó
đã thắp lên dự án này. HelmAgents là một tác phẩm **độc lập** (không phải bản port)
tái hình dung ý tưởng đó bằng TypeScript và hướng tới đưa nó đi xa hơn; phần ghi
nhận dành cho dự án thượng nguồn được trân trọng giữ lại trong [NOTICE](NOTICE).
Bài báo gốc: [arXiv 2412.20138](https://arxiv.org/abs/2412.20138). Được xây dựng với
[NestJS](https://nestjs.com), [React](https://react.dev) +
[Vite](https://vitejs.dev), [LangGraph.js](https://github.com/langchain-ai/langgraphjs),
và [i18next](https://www.i18next.com).

## Giấy phép

Được cấp phép theo **Apache License, Version 2.0**. HelmAgents được lấy cảm hứng
từ TradingAgents (cũng Apache-2.0); phần ghi nhận dành cho dự án thượng nguồn được
giữ lại trong [NOTICE](NOTICE). Xem [LICENSE](LICENSE) để biết các điều khoản đầy
đủ.

Bằng việc đóng góp, bạn đồng ý rằng các đóng góp của mình được cấp phép theo
Apache-2.0 và rằng bạn tuân theo [Quy tắc Ứng xử](CODE_OF_CONDUCT.md). Để báo cáo
một vấn đề bảo mật, xem [SECURITY.md](SECURITY.md).
