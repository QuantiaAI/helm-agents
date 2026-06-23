# HelmAgents 运行说明

本项目 **HelmAgents** 是一个多智能体 LLM 金融交易决策框架的 TypeScript 实现，采用**前后端分离**架构——独立的 NestJS API 托管引擎，React + Vite 单页应用（SPA）提供完整 Web UI（基于开源项目 [TradingAgents](https://github.com/TauricResearch/TradingAgents) 复刻）。本文档说明如何在本地把它跑起来。

> 下文 **项目根** 指你 clone 仓库后的根目录（含 `package.json`、`apps/`、`packages/`）。所有命令默认在该目录下执行。

---

## 1. 环境要求

| 依赖 | 版本 | 说明 |
|---|---|---|
| Node.js | ≥ 22（开发机为 v26） | 需内置 `node:sqlite`（Node 22+）|
| pnpm | ≥ 10（仓库锁定 11.5） | 包管理器；`allowBuilds` 需 pnpm 10+ |
| 网络 | 可选 | DEMO 模式无需外网；真实运行需能访问所选 LLM 与数据源 |

检查环境：

```bash
node -v
pnpm -v
```

---

## 2. 安装依赖

在项目根执行：

```bash
pnpm install
```

> **首次安装可能提示 "Ignored build scripts"**（esbuild / msw / sharp 等原生/构建脚本）。pnpm 11 默认不自动运行第三方构建脚本。如需批准，编辑 `pnpm-workspace.yaml` 的 `allowBuilds:` 把对应项设为 `true`（或运行 `pnpm approve-builds`）。本项目已预置常用项。

---

## 3. 开发模式（最常用）

```bash
pnpm dev
```

`pnpm dev` 经由 Turbo **同时**启动两个 app：

- **NestJS API**：`http://localhost:5171`（环境变量 `API_PORT` 可改），所有 REST 端点在统一前缀 `/api` 下。
- **Vite SPA**：`http://localhost:5170`，dev server 会把 `/api` 代理到后端 `:5171`，因此浏览器只需访问 `:5170`。

也可分别启动（调试时常用）：

```bash
pnpm --filter api dev   # 仅启后端（nest start --watch，:5171）
pnpm --filter web dev   # 仅启前端（vite，:5170）
```

> 指定端口：后端用 `API_PORT=4010 pnpm --filter api dev`；前端用 `pnpm --filter web dev --port 5180`（Vite 端口被占用时也会自动顺延并在控制台打印实际端口）。

打开浏览器访问：

- `http://localhost:5170/en` —— 英文界面
- `http://localhost:5170/zh` —— 中文界面
- 支持 8 语：`/en /zh /ja /ko /fr /de /es /vi`（也可用页面右上角 🌐 切换器）
- 裸路径 `/` 会自动重定向到默认语言 `/en`

主要页面：

| 路径 | 功能 |
|---|---|
| `/<locale>` | 首页（流程介绍） |
| `/<locale>/analyze` | 配置并**流式运行**一次分析（实时时间线 + 评级） |
| `/<locale>/history` | 运行历史 |
| `/<locale>/runs/<id>` | 单次运行详情 + 下载报告 |
| `/<locale>/settings` | LLM provider/模型/数据源/API 密钥设置 |
| `/<locale>/login`、`/<locale>/register` | 登录 / 注册（**开放注册**）|

> **需要登录**：`analyze / history / settings / runs` 等页面均需先登录；未登录访问会自动跳转 `/<locale>/login`。首页、文档、健康检查为公开页。每个账户的数据（密钥/设置/运行/记忆）相互隔离。
>
> 这些是 SPA 的前端路由（带语言前缀），由前端 `:5170` 提供。后端 API 是独立服务，挂在 `:5171` 的 `/api/*` 下（不参与语言路由），开发时由 Vite dev server 代理；健康检查为 `GET /api/health`。

---

## 4. 两种运行方式：DEMO 模式 vs 真实 LLM

一次完整分析会调用 LLM 13+ 次。**没有 LLM API key 时用 DEMO 模式；有 key 时用真实模式。**

### 4.1 DEMO 模式（无需任何 key，开箱跑通）

设置环境变量 `DEMO_LLM=1` 启动（同时拉起 API + SPA）：

```bash
DEMO_LLM=1 pnpm dev
```

- 用确定性 stub LLM 跑通**完整 13-agent 流水线**（状态图编排、辩论、结构化输出、评级提取、流式、持久化、取消、反思全链路），仅"文本生成"被 stub。运行时间线以 **NDJSON** 流式从 API 推送到前端。
- 适合：本地验证、演示、UI 调试、无需付费 key。
- 界面/交互与真实模式完全一致，`/analyze` 会产出评级（如 Overweight）并写入历史。

### 4.2 真实 LLM 模式（产出真实决策报告）

不设 `DEMO_LLM`，并通过任一方式配置一个 LLM provider 的 API key：

**方式 A：环境变量**（启动前在 shell 设置，或写入项目根 `.env`）

```bash
export OPENAI_API_KEY=sk-...
# 可选覆盖：
export TRADINGAGENTS_LLM_PROVIDER=openai
export TRADINGAGENTS_DEEP_THINK_LLM=gpt-5.5
export TRADINGAGENTS_QUICK_THINK_LLM=gpt-5.4-mini
pnpm dev
```

**方式 B：Web UI 设置页**（推荐，密钥加密落盘）

> 需先**注册并登录**：访问 `/<locale>/register` 注册（开放注册）→ 登录后才能进入设置/分析页。密钥与设置均按账户隔离存储。

1. 打开 `/<locale>/settings`。
2. 在 **API keys** 区填入 provider 的 key（如 `OPENAI_API_KEY`）并保存——AES-256-GCM 加密存储，API 响应只返回脱敏状态。
3. 在 **Language model** 区选择 provider 与 quick/deep 模型并保存。

然后到 `/<locale>/analyze` 配置 ticker/日期/分析师并点 **Run analysis**，报告语言跟随 URL locale（如 `/zh/analyze` → 中文报告）。

支持的 provider key 环境变量见 `packages/llm/src/api-key-env.ts`（OpenAI / Anthropic / Google / DeepSeek / 通义 / 智谱 / MiniMax / OpenRouter / Mistral / Moonshot / Groq / NVIDIA / xAI 等；Ollama 本地免 key）。

> 真实模式下若用 Ollama：先本地启动 ollama 并拉取模型（如 `ollama pull qwen3`），provider 选 `ollama` 即可，无需 key。

---

## 5. 配置体系（三层合并）

引擎配置按优先级合并：`DEFAULT_CONFIG → TRADINGAGENTS_* 环境变量 → 运行时覆盖（Web 设置页）`。

- 默认值：`packages/config/src/default-config.ts`
- 环境变量白名单：`TRADINGAGENTS_LLM_PROVIDER`、`TRADINGAGENTS_DEEP_THINK_LLM`、`TRADINGAGENTS_QUICK_THINK_LLM`、`TRADINGAGENTS_OUTPUT_LANGUAGE`、`TRADINGAGENTS_MAX_DEBATE_ROUNDS`、`TRADINGAGENTS_MAX_RISK_ROUNDS`、`TRADINGAGENTS_CHECKPOINT_ENABLED`、`TRADINGAGENTS_TEMPERATURE` 等。
- 界面语言与报告语言：跟随 URL locale（`/<locale>/...`），经 `LOCALE_TO_LANG_NAME` 映射为 agent 报告语言；`/settings` 不再有独立语言下拉。

---

## 6. 生产构建与启动

```bash
pnpm build               # 构建所有 package + 两个 app（api 与 web）
pnpm --filter api start  # 启动生产 API 服务器（默认 :5171）

# 若 SPA 与 API 部署在不同源，构建前端时注入 API 地址（构建期生效）：
VITE_API_BASE_URL=https://api.example.com pnpm --filter web build
```

构建后：

- **后端**：`apps/api` 产出可独立运行的 NestJS 服务，`pnpm --filter api start` 启动（端口由 `API_PORT` 控制，默认 5171）。生产模式同样支持 `DEMO_LLM=1`：`DEMO_LLM=1 API_PORT=4010 pnpm --filter api start`。
- **前端**：`apps/web` 产出纯静态 SPA（`apps/web/dist`），可托管在任意静态服务器/CDN。本地预览用 `pnpm --filter web preview`。

> **认证相关环境变量**：生产务必设置强 `AUTH_JWT_SECRET`（HMAC 密钥）。可选：`AUTH_ACCESS_TTL_SEC`（默认 900）、`AUTH_REFRESH_TTL_SEC`（默认 30 天）、`AUTH_BOOTSTRAP_EMAIL` / `AUTH_BOOTSTRAP_PASSWORD`（首次启动自动建一个账户）。整个后端需 **Node ≥ 22**（内置 `node:sqlite`）。拆分跨源部署时，refresh cookie 走同源；不同源还需配置 CORS 凭证。

> **SPA history fallback（重要）**：这是客户端路由的单页应用，`/en/runs/:id` 这类深链接由前端路由处理。静态托管时必须把所有未命中静态资源的请求**重写到 `index.html`**，否则用户在深链接处刷新会 404。`vite preview` 已自动处理；生产托管需配置：nginx `try_files $uri /index.html;`、Netlify `_redirects`（`/* /index.html 200`）、或 Vercel `rewrites`。
**前后端可分开部署。** 部署 SPA 时用环境变量 `VITE_API_BASE_URL`（构建期注入）把它指向 API 地址；部署 API 时用 `CORS_ORIGIN` 允许 SPA 的源（逗号分隔多个，见 `.env.example`）。

---

## 7. 测试、类型检查、Lint

```bash
pnpm test            # 运行全部 package + app 测试（黑盒 TDD）
pnpm typecheck       # 全工作区 tsc --noEmit
pnpm --filter api test        # 单个 app 测试
pnpm --filter web test
pnpm --filter @helm-agents/core test
```

期望：全部测试通过、类型检查无错误。

---

## 8. 本地数据存放位置

账户、运行历史、记忆、设置、加密密钥等落盘在 SQLite 数据库（均**按用户隔离**）：

```
~/.tradingagents-web/store/
  ├── app.db        SQLite 库：users / refresh_tokens / user_keys / user_settings / runs / memory_log
  └── master.key    主密钥（自动生成，权限 0600；用于 AES-256-GCM 加密各用户的 API 密钥）
```

如需重置，删除该目录即可（会丢失全部账户、历史与已存 key）。

---

## 9. 后台运行 / 停止

后台启动（日志写文件，一条命令同时拉起 API + SPA）：

```bash
DEMO_LLM=1 pnpm dev > /tmp/taweb.log 2>&1 &
```

查看是否就绪：

```bash
grep -E "Local:|Nest application successfully started|ready" /tmp/taweb.log
curl -s http://localhost:5171/api/health   # 后端健康检查，期望 {"ok":true,...}
```

停止：

```bash
pnpm dev:clean          # 杀掉占用 dev 端口 5170/5171 的残留进程（推荐）
```

> 上一次 `pnpm dev` 若因关闭终端而未正常退出，turbo 未必能回收子进程，下次启动会
> `EADDRINUSE`（后端崩、turbo 连带停掉前端，看起来像"只起了 api、没起 web"）。
> `pnpm dev:clean` 只精确清理**监听 5170/5171** 的进程，不影响其他项目；也可直接
> `pnpm dev:clean && pnpm dev` 一步重启。
> （不要用 `pkill -f vite`——它会误杀其他项目的 Vite。）

---

## 10. 常见问题

| 现象 | 原因 / 处理 |
|---|---|
| 端口 5170 / 5171 已被占用（`EADDRINUSE`）| 多半是上次 `pnpm dev` 未正常退出留下孤儿进程。先 `pnpm dev:clean` 清理（仅杀 5170/5171）；确需换端口：后端 `API_PORT=xxxx`、前端 `pnpm --filter web dev --port xxxx` |
| 前端请求 `/api/*` 404 或跨域报错 | 确认后端 `:5171` 已启动；本地走 Vite 代理（用 `:5170` 访问）；生产环境检查 `VITE_API_BASE_URL` 与后端 `CORS_ORIGIN` |
| `pnpm install` 提示 ignored build scripts | 编辑 `pnpm-workspace.yaml` 的 `allowBuilds:` 设为 `true`，或 `pnpm approve-builds` |
| `better-sqlite3` 编译失败 | 本项目使用内置 `node:sqlite`（**Node 22+**），**不**依赖 better-sqlite3。报错通常是 Node 版本过低——升级到 Node ≥ 22 |
| 接口报 401 | 多数是**未登录**（先 `/<locale>/register` 注册并登录）；登录后若真实运行仍报错，则是所选 provider 未配置 key（在 `/settings` 配置）|
| 行情/反思收益为 0 或空 | Yahoo 数据源被限流（HTTP 429）或该日期无数据；数据层会降级为 sentinel，非崩溃 |
| DEMO 模式报告是英文 `Analysis complete.` | demo stub LLM 不遵守语言指令；locale→报告语言注入链本身正确（真实 LLM 下会产出对应语言） |
| `/<locale>` 之外路径 404 | 所有页面均在 `/<locale>/` 下；API 在 `/api/`（无 locale 前缀） |

---

## 11. 快速开始（一键复制）

```bash
# 1. 安装
pnpm install

# 2. DEMO 模式启动（无需任何 key，同时拉起 API:5171 + SPA:5170）
DEMO_LLM=1 pnpm dev

# 3. 浏览器打开
#    http://localhost:5170/en        英文
#    http://localhost:5170/zh        中文
#    先到 /<locale>/register 注册并登录（开放注册），再进 /<locale>/analyze 点 Run analysis 跑一次
```

跑通后，若要真实决策：登录后在 `/settings` 填一个 LLM key（或设环境变量），去掉 `DEMO_LLM=1` 重启即可。
