# HelmAgents

[简体中文](README.md) · [English](README.en.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · **[Español](README.es.md)** · [Tiếng Việt](README.vi.md)

[![License: Apache-2.0](https://img.shields.io/badge/license-Apache--2.0-blue.svg)](LICENSE)
[![Node](https://img.shields.io/badge/node-%E2%89%A522-green.svg)](package.json)
[![pnpm](https://img.shields.io/badge/pnpm-11-orange.svg)](package.json)
[![API: NestJS](https://img.shields.io/badge/API-NestJS%2011-e0234e.svg)](https://nestjs.com)
[![Web: React + Vite](https://img.shields.io/badge/Web-React%2019%20%2B%20Vite-646cff.svg)](https://vitejs.dev)

**Trading multiagente con LLM, al timón.** Trece analistas de IA investigan,
debaten, someten el riesgo a pruebas de estrés y convergen en una única decisión
de trading trazable — transmitida en vivo en tu navegador.

> Un proyecto **independiente** y nativo de TypeScript: una mesa de trading
> centrada en el navegador y totalmente observable, construida sobre una **API
> NestJS** autónoma + una SPA **React + Vite** — con streaming, trazable e
> independiente de cualquier proveedor.

---

## 💸 Opera acciones de EE. UU. tokenizadas — ahorra 20%+ en comisiones

**Actúa sobre cada decisión y recupera el 20%+ de tus comisiones de trading.** Compra
las mismas acciones de EE. UU. (NVDA, AAPL, …) como **acciones tokenizadas** en
Binance / OKX / Gate, pagadas con cripto — regístrate con nuestro código de
invitación y **el 20%+ de la comisión de cada operación se devuelve automáticamente
a tu cuenta del exchange en aproximadamente una hora**:

| Exchange | Código de invitación | Registro |
|---|---|---|
| **Binance** | `FANWO20` | <https://www.binance.com/join?ref=FANWO20> |
| **OKX** | `FANGEIWO` | <https://www.okx.com/join/FANGEIWO> |
| **Gate** | `FANGEIWO` | <https://www.gate.io/share/FANGEIWO> |

> Reembolsos de comisiones impulsados por nuestro patrocinador **[rebateto.me](https://rebateto.me/how_to_referral)**.
> Detalles completos, enlaces espejo para China continental y cómo reclamarlo →
> [Ejecuta la decisión](#ejecuta-la-decisión--opera-acciones-de-ee-uu-tokenizadas-y-ahorra-20-en-comisiones).
> *Enlaces de referido — apoyan este proyecto sin coste adicional para ti. No es
> asesoramiento de inversión; la cripto y las acciones tokenizadas conllevan riesgo.*

---

## ¿Por qué HelmAgents?

HelmAgents modela toda una firma de trading con analistas, investigadores, un
trader, analistas de riesgo y un gestor de cartera impulsados por LLM, y hace que
converjan en una decisión de trading de 5 niveles respaldada por un razonamiento
completo. Pero no se queda en un script de investigación por CLI — es un producto
real, **observable, compartible, independiente del proveedor y pensado para seguir
mejorando**:

- **Míralo pensar.** Una cronología en vivo y en streaming (SSE) muestra cada
  analista y cada turno de debate a medida que se completa — se acabó mirar fijamente
  una terminal hasta el final.
- **Sin necesidad de Python.** Una API NestJS aloja el motor; una SPA React/Vite
  lo controla. Configura una ejecución en el navegador, pulsa un botón, lee la
  decisión.
- **Trae tu propio modelo.** Un registro de 20 proveedores (familia compatible
  con OpenAI + Anthropic/Google nativos) significa que no estás atado a un único
  proveedor.
- **Decisiones trazables y reproducibles.** Cada ejecución se persiste con su
  razonamiento completo (informes de analistas, debates alcista/bajista + de
  riesgo, decisión final) y puede exportarse como Markdown.
- **Actúa sobre ella — y paga menos.** Opera los mismos nombres como **acciones
  tokenizadas** en Binance / OKX / Gate, y regístrate con el código de invitación
  `FANWO20` (Binance) o `FANGEIWO` (OKX / Gate): el **20%+ de la comisión de cada
  operación se devuelve automáticamente a tu cuenta en ~1 h**. Consulta la sección
  «Ejecuta la decisión» más abajo.
- **Seguro por defecto.** Las claves API se cifran en reposo (AES-256-GCM); los
  datos de las ejecuciones permanecen en tu máquina; nada se envía a casa.

> ⚠️ **No es asesoramiento financiero.** HelmAgents produce análisis generado por
> IA solo para investigación y educación. Puede equivocarse. Verifica de forma
> independiente; el trading y los criptoactivos conllevan riesgo, incluida la
> pérdida del capital.

## Qué hace

Dado un `(ticker, tradeDate)`, un pipeline de 13 agentes produce una decisión de
trading de 5 niveles (**Comprar / Sobreponderar / Mantener / Infraponderar /
Vender**) con análisis de apoyo completo:

1. **Analistas** — Mercado · Sentimiento · Noticias · Fundamentales recopilan datos.
2. **Debate de inversión** — Investigadores alcista ⇄ bajista debaten; un Gestor
   de investigación lo dictamina en un plan de inversión estructurado.
3. **Trader** — traduce el plan en una propuesta de compra/mantenimiento/venta
   con entrada, stop-loss y sizing.
4. **Debate de riesgo** — Analistas agresivo / conservador / neutral lo someten a
   pruebas de estrés.
5. **Gestor de cartera** — sintetiza todo en la decisión final.

## Cómo funciona

El pipeline se ejecuta como un `StateGraph` de LangGraph.js y transmite eventos
`nodeEnd` al navegador a medida que cada agente termina. Los analistas pre-cargan
sus datos en línea (salida equivalente al bucle de tool-calling original, sin las
idas y vueltas adicionales), y cada informe, transcripción de debate y la
decisión final quedan capturados en el estado de la ejecución.

## Arquitectura

Monorepo pnpm con **frontend y backend separados**. El motor y toda la lógica de
negocio viven en paquetes independientes del framework; la API NestJS los aloja,
y la SPA React/Vite habla con la API por HTTP (tipada por un paquete de contratos
compartido).

```
apps/
  api           NestJS (ESM) — aloja el motor; endpoints REST bajo /api (incl. auth)
  web           React 19 + Vite SPA — react-router, react-i18next (8 locales)
packages/
  contracts     tipos DTO HTTP compartidos (tipos puros — sin runtime) para api ↔ web
  core          createEngine() / propagate() / streamEvents()  — punto de entrada único
  workflow      LangGraph.js StateGraph: topología + enrutado condicional de debate/riesgo
  agents        13 fábricas de agentes (analistas/investigadores/trader/riesgo/gestores)
  dataflows     enrutado de proveedores (routeToVendor) + jerarquía de errores + yfinance
  llm           registro de 20 proveedores + cliente compatible con OpenAI
  config        DEFAULT_CONFIG + fusión de tres capas (env → runtime)
  persistence   almacén SQLite (node:sqlite) — cuentas, tokens de auth, claves/ajustes/ejecuciones/memoria por usuario
  shared        esquemas Zod, AgentState, valoración, utilidades de símbolos
```

**Flujo de datos:** `apps/web` (SPA) → HTTP `/api/*` → `apps/api` (NestJS) →
`core.propagate()` → `workflow.buildGraph()` → `agents.*`
(llama a `dataflows.routeToVendor`) + `llm.createLlmClient`. La cronología de la
ejecución se transmite desde la API como NDJSON.

## Instalación

Dos formas de un clic para ponerlo en marcha. Ambas inician la aplicación en modo
normal — luego abre la aplicación, **crea una cuenta** (el registro es abierto), ve
a **Settings**, elige un proveedor de LLM y pega tu clave API (almacenada cifrada
por cuenta). ¿Aún no tienes clave? Consulta la opción DEMO en [Uso](#uso). Requiere
**Node ≥ 22**.

### Opción A — script local de un clic

Requiere **Node.js ≥ 22** (pnpm se configura automáticamente vía corepack).

```bash
git clone <repo-url>
cd tradingagents-web
./scripts/install.sh
```

El script instala las dependencias, compila todo e inicia la API (`:5171`) + la
SPA web (`:5170`). Abre **<http://localhost:5170>**.

### Opción B — Docker de un clic

Requiere **Docker** (con Compose). No se necesita Node/pnpm.

```bash
git clone <repo-url>
cd tradingagents-web
docker compose up --build
```

Esto compila y ejecuta dos contenedores — la API NestJS y una SPA servida por
nginx que hace de proxy inverso de `/api` hacia ella. Abre
**<http://localhost:8080>**. Las ejecuciones, los ajustes y las claves cifradas
persisten en el volumen `helmagents-store`. Para probar sin clave, establece
`DEMO_LLM=1` para el servicio `api` en `docker-compose.yml`.

> Configuración manual (para desarrollo): `pnpm install` y luego `pnpm dev`. Si
> `pnpm install` advierte sobre scripts de build ignorados (esbuild / msw / sharp /
> @swc/core), pon la entrada correspondiente en `true` bajo `allowBuilds:` en
> `pnpm-workspace.yaml` o ejecuta `pnpm approve-builds`.

## Uso

La aplicación admite **8 idiomas**: `/en /zh /ja /ko /fr /de /es /vi`. La ruta
desnuda `/` redirige a `/en`.

### 1. Modo demo — sin clave API

```bash
DEMO_LLM=1 pnpm dev
```

`pnpm dev` inicia **ambas** apps vía Turbo: la API NestJS en
`http://localhost:5171` y la SPA Vite en `http://localhost:5170` (el servidor de
desarrollo hace de proxy de `/api` → la API). `DEMO_LLM=1` impulsa el **pipeline
completo de 13 agentes** con un LLM stub determinista — streaming, persistencia,
cancelación y reflexión se ejecutan de verdad; solo se simula la generación de
texto final. Perfecto para demos, trabajo de UI y verificación local.

Abre `http://localhost:5170/en`, ve a **/analyze**, configura una ejecución y pulsa
**Ejecutar análisis**.

### 2. Modo LLM real

Configura la clave API de un proveedor — ya sea en `/settings` (cifrada en reposo)
o mediante variables de entorno (consulta [`.env.example`](.env.example)):

```bash
export OPENAI_API_KEY=sk-...
# overrides opcionales
export TRADINGAGENTS_LLM_PROVIDER=openai
export TRADINGAGENTS_DEEP_THINK_LLM=gpt-5.5
export TRADINGAGENTS_QUICK_THINK_LLM=gpt-5.4-mini
pnpm dev
```

Luego ejecuta un análisis en **/analyze**. El idioma del informe sigue el locale
de la URL (p. ej. `/zh/analyze` → informe en chino). En producción, la SPA y la
API se despliegan por separado — apunta la SPA a la API con `VITE_API_BASE_URL` y
permite su origen vía `CORS_ORIGIN` (consulta [`.env.example`](.env.example)).

| Ruta | Qué |
|---|---|
| `/<locale>` | Inicio — el pipeline |
| `/<locale>/analyze` | Configura y **transmite** un análisis |
| `/<locale>/history` | Ejecuciones pasadas |
| `/<locale>/runs/<id>` | Detalle de ejecución + exportación a Markdown |
| `/<locale>/settings` | Proveedor / modelos / fuentes de datos / claves API |

> Guía completa de ejecución (modo DEMO, LLM real, resolución de problemas):
> [`docs/RUNNING.md`](docs/RUNNING.md)

## Ejecuta la decisión — opera acciones de EE. UU. tokenizadas y ahorra 20%+ en comisiones

HelmAgents no se detiene en una valoración — te ayuda a **actuar sobre ella y
operar más barato**. Las mismas acciones estadounidenses (NVDA, AAPL, …) se
operan como **acciones tokenizadas** en los principales exchanges de cripto, se
compran y venden a toda hora con cripto, sin necesidad de un bróker tradicional.
La aplicación lo muestra en la página de inicio y en cada página de detalle de
ejecución (la tarjeta «Comprar acciones tokenizadas»).

> 💸 **Regístrate con los códigos de invitación de HelmAgents — `FANWO20` en
> Binance, `FANGEIWO` en OKX / Gate — y el 20%+ de la comisión de cada operación
> se devuelve automáticamente a tu cuenta del exchange en aproximadamente una
> hora.** Las comisiones de trading son el único coste que controlas por
> completo, y este reembolso es lo que mantiene a HelmAgents gratuito y con
> mantenimiento — así que usar los enlaces de abajo apoya directamente al proyecto
> sin coste adicional para ti.

### Exchanges admitidos y reembolso

| Exchange | Enlace de registro | Código de invitación | Reembolso de comisiones |
|---|---|---|---|
| **Binance** (`binance.com`) | <https://www.binance.com/join?ref=FANWO20> | `FANWO20` | **20%+ devuelto** |
| **OKX** (`okx.com`) | <https://www.okx.com/join/FANGEIWO> | `FANGEIWO` | **20%+ devuelto** |
| **Gate** (`gate.io`) | <https://www.gate.io/share/FANGEIWO> | `FANGEIWO` | **20%+ devuelto** |

### Cómo reclamar el reembolso de comisiones

1. **Abre un enlace de registro de arriba** (o introduce manualmente el código de
   invitación de tu exchange durante el registro — `FANWO20` para Binance,
   `FANGEIWO` para OKX / Gate). El reembolso se vincula a la cuenta **en el
   registro**, así que usa el código desde el principio — por lo general no puede
   añadirse a una cuenta existente.
2. **Completa el registro / KYC del exchange** y deposita cripto.
3. **Opera** — busca el símbolo tokenizado de la acción y actúa según la
   valoración de los agentes (Comprar / Sobreponderar / Mantener / Infraponderar /
   Vender). El 20%+ de las comisiones se devuelve automáticamente a tu cuenta en
   ~1 h tras cada operación; no hay nada más que hacer.

> **En la app, introduce el código de invitación al registrarte** (`FANWO20` Binance · `FANGEIWO` OKX/Gate) — fácil de olvidar y no se puede añadir después.
>
> **Una cuenta por documento en cada exchange.** ¿Ya registrado? Un familiar puede inscribirse con el código para obtener el reembolso.

Consulta **[cómo funciona el reembolso →](https://rebateto.me/how_to_referral)**
para conocer las tarifas actuales por exchange y los términos completos. Dentro de
la aplicación, las tarjetas de los exchanges también obtienen **enlaces de
invitación en vivo** y exponen **enlaces de respaldo/espejo** (bajo «Mostrar
enlaces de respaldo») cuando el dominio oficial está bloqueado por DNS (p. ej. en
China continental).

> **Divulgación y riesgo.** Los enlaces de registro de arriba son **enlaces de
> referido** — el autor recibe un reembolso de comisiones cuando te registras a
> través de ellos, **sin coste adicional para ti** (tú obtienes las comisiones
> con descuento; el exchange comparte parte de su parte). Usarlos es totalmente
> voluntario. Las acciones tokenizadas y la cripto conllevan riesgo **incluida la
> pérdida del capital**, no están disponibles en todas las jurisdicciones, y la
> salida de HelmAgents es **análisis generado por IA solo para
> investigación/educación — no es asesoramiento de inversión**. Verifica de forma
> independiente y cumple las leyes de tu localidad y los términos de cada exchange.

## Autenticación y multiinquilino

La aplicación es **multiinquilino**: cada usuario es una cuenta aislada. El registro
es abierto (regístrate con correo electrónico + contraseña) y **solo los usuarios
autenticados pueden configurar proveedores/claves de LLM o ejecutar análisis** — cada
endpoint `/api/*`, salvo health, docs y `/api/auth/*`, requiere un token Bearer. Las
claves API, los ajustes, las ejecuciones y la memoria de reflexión de cada usuario se
almacenan por separado (SQLite, delimitados por id de usuario); las claves de un
usuario se inyectan en su propio motor en tiempo de ejecución (nunca en el entorno
global), de modo que las cuentas nunca ven los datos de las demás. La API de tokens
(JWT de acceso + refresh rotativo) es agnóstica respecto al cliente — la SPA de React
y una futura app nativa la comparten.

**Env:**

| Var | Default | Propósito |
|---|---|---|
| `AUTH_JWT_SECRET` | dev placeholder | Secreto HMAC para los tokens de acceso — **establece un valor fuerte en producción** |
| `AUTH_ACCESS_TTL_SEC` | `900` | Tiempo de vida del token de acceso |
| `AUTH_REFRESH_TTL_SEC` | `2592000` | Tiempo de vida del token de refresh |
| `AUTH_BOOTSTRAP_EMAIL` / `AUTH_BOOTSTRAP_PASSWORD` | — | Opcional: inicializa una primera cuenta al arrancar |

> Requiere **Node ≥ 22** (usa el `node:sqlite` integrado).

## Configuración

El motor resuelve la configuración con la misma fusión de tres capas que el
original:
`DEFAULT_CONFIG → variables de entorno TRADINGAGENTS_* → overrides en runtime (la página de Ajustes)`.

Consulta [`packages/config/src/default-config.ts`](packages/config/src/default-config.ts)
para la lista completa de claves y
[`packages/llm/src/api-key-env.ts`](packages/llm/src/api-key-env.ts) para la
variable de clave de cada proveedor.

## Desarrollo

```bash
pnpm install
pnpm dev             # inicia la API (NestJS) + SPA (Vite) juntas vía Turbo
pnpm test            # ejecuta todos los tests de paquetes + apps (TDD de caja negra)
pnpm typecheck       # tsc --noEmit en todo el workspace
pnpm build           # compila cada paquete + ambas apps
pnpm --filter api dev          # solo API (nest start --watch, :5171)
pnpm --filter web dev          # solo SPA (vite, :5170)
pnpm --filter <pkg> test       # un solo paquete
```

Las contribuciones siguen **TDD de caja negra** (Red → Green → Refactor) y
mantienen los **8 locales en paridad de claves**. Consulta
[**CONTRIBUTING.md**](CONTRIBUTING.md) para la configuración, las convenciones y el
estilo de commits. CI (`.github/workflows/ci.yml`) ejecuta `typecheck`, `test` y
`build` en cada push y pull request.

## Estado

**Fases 0–4 completas**, más una **división frontend/backend** (API NestJS + SPA
Vite). El motor ejecuta el pipeline completo de 13 agentes de extremo a extremo
con streaming, persistencia, ajustes y reflexión. Todos los tests pasan y
`pnpm build` está limpio. Consulta las especificaciones de diseño en
`docs/superpowers/specs/`.

## Agradecimientos

HelmAgents está **inspirado por** [**TradingAgents**](https://github.com/TauricResearch/TradingAgents)
de Tauric Research (Apache-2.0) — su diseño multiagente de decisión de trading dio
origen a este proyecto. HelmAgents es una obra **independiente** (no es un port)
que reimagina la idea en TypeScript y aspira a llevarla más lejos; la atribución al
proyecto upstream se conserva con gratitud en [NOTICE](NOTICE). El paper
original: [arXiv 2412.20138](https://arxiv.org/abs/2412.20138). Construido con
[NestJS](https://nestjs.com), [React](https://react.dev) +
[Vite](https://vitejs.dev), [LangGraph.js](https://github.com/langchain-ai/langgraphjs)
e [i18next](https://www.i18next.com).

## Licencia

Bajo la **Apache License, Versión 2.0**. HelmAgents está inspirado por
TradingAgents (también Apache-2.0); la atribución upstream se conserva en
[NOTICE](NOTICE). Consulta [LICENSE](LICENSE) para los términos completos.

Al contribuir, aceptas que tus contribuciones se licencian bajo Apache-2.0 y que
sigues el [Código de Conducta](CODE_OF_CONDUCT.md). Para reportar un problema de
seguridad, consulta [SECURITY.md](SECURITY.md).
