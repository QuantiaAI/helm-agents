/**
 * Single source of truth for the HelmAgents design-system palette and semantic
 * colors. Pure constants — no imports — so the file is safe to load both at
 * runtime (browser bundle) and at build time (the Tailwind config runs in Node).
 *
 * Values mirror `品牌与设计系统 v1.0` (Brand & Design System). Keeping them here
 * means the design palette lives in exactly one place: the Tailwind theme, the
 * runtime `ratingColor()` helper, and any inline-styled swatch all read these.
 */

/** Brand neutrals + accent (design system §02 配色). */
export const HELM_COLORS = {
  base: "#0A0E14", // 底色 Base — page background
  panel: "#121821", // 面板 Panel — cards / surfaces
  elevated: "#1A2230", // 浮层 Elevated — hover / active
  line: "#2A3445", // inactive border / ring (design's #2A3445)
  accent: "#2DE2E6", // 强调 Accent — brand cyan
  accentHover: "#5BECEF", // lighter cyan for hover/active
  text: "#E6EDF3", // 主文字 primary text
  body: "#B8C2CF", // report/feed body text
  muted: "#8B98A9", // 次文字 descriptions
  faint: "#5A6678", // 弱文字 labels / captions
} as const;

/**
 * 5-tier rating scale (design system §03 评级体系). Continuous green→amber→red;
 * each tier is also shape-coded (▲▲ / ▲ / ＝ / ▼ / ▼▼) to stay colorblind-safe.
 * These are the canonical values — the Tailwind `rating.*` palette and the
 * runtime `ratingColor()` map both come from here, so they can never drift.
 */
export const RATING_COLORS = {
  Buy: "#00D68F",
  Overweight: "#7BD88F",
  Hold: "#E0B43C",
  Underweight: "#F08A4B",
  Sell: "#F0496E",
} as const;

export type Rating = keyof typeof RATING_COLORS;

/** Bull/bear debate semantics (design system §05, stage 2 多空辩论). */
export const DEBATE_COLORS = {
  bull: "#00D68F",
  bear: "#F0496E",
  neutral: "#E6EDF3",
} as const;

/** Live-run status indicator dots (analyze studio status pill). */
export const STATUS_COLORS = {
  idle: "#5A6678",
  running: "#2DE2E6",
  done: "#00D68F",
  error: "#F0496E",
} as const;

/** Semantic feedback colors (success / danger) reused across pages. */
export const SEMANTIC_COLORS = {
  success: "#00D68F",
  danger: "#F0496E",
} as const;
