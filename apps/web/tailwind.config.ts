import type { Config } from "tailwindcss";
import { RATING_COLORS, HELM_COLORS } from "./src/lib/theme-tokens";

// Design system: `品牌与设计系统 v1.0`. The palette's single source of truth
// is src/lib/theme-tokens.ts — the Tailwind theme reads from it so runtime
// helpers (ratingColor) and CSS utilities can never drift apart.
//
// NOTE on the remapped `zinc` scale: the prior UI used Tailwind's stock zinc
// neutrals everywhere (bg-zinc-950, border-zinc-800, text-zinc-400 …, ~150
// call sites). Rather than hand-editing every one, zinc is remapped below to
// the HelmAgents dark neutrals so the whole app adopts the new look from one
// place. `helm.*` holds the brand/semantic tokens (accent, success, danger);
// new code should prefer `helm-*` for anything brand-colored.
const config: Config = {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Brand + semantic tokens (design system §02 + §03 + §05).
        helm: {
          base: HELM_COLORS.base,
          panel: HELM_COLORS.panel,
          elevated: HELM_COLORS.elevated,
          line: HELM_COLORS.line,
          // `primary` / `hover` are back-comat aliases for the cyan accent —
          // existing bg-helm-primary / text-helm-primary usages recolor to
          // cyan automatically. Prefer `helm-accent` in new code.
          primary: HELM_COLORS.accent,
          accent: HELM_COLORS.accent,
          hover: HELM_COLORS.accentHover,
          accentHover: HELM_COLORS.accentHover,
          text: HELM_COLORS.text,
          body: HELM_COLORS.body,
          muted: HELM_COLORS.muted,
          faint: HELM_COLORS.faint,
          success: "#00D68F",
          danger: "#F0496E",
        },
        // 5-tier rating scale — single source (theme-tokens), shared with
        // ratingColor() so swatches and the rating.* utilities always match.
        rating: { ...RATING_COLORS },
        // Remapped neutral scale → HelmAgents dark neutrals. Monotonic dark→light.
        zinc: {
          50: "#F2F6FA",
          100: HELM_COLORS.text, // #E6EDF3 — primary text
          200: "#C9D2DD",
          300: HELM_COLORS.body, // #B8C2CF — body / feed text
          400: HELM_COLORS.muted, // #8B98A9 — descriptions
          500: "#6A7585",
          600: HELM_COLORS.faint, // #5A6678 — labels / captions
          700: "#3A4760",
          800: HELM_COLORS.elevated, // #1A2230 — borders / hover
          900: HELM_COLORS.panel, // #121821 — panels / cards
          950: HELM_COLORS.base, // #0A0E14 — page base
        },
      },
      fontFamily: {
        mono: [
          '"IBM Plex Mono"',
          "ui-monospace",
          "SFMono-Regular",
          "Menlo",
          "monospace",
        ],
        sans: [
          '"Noto Sans SC"',
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "sans-serif",
        ],
      },
      keyframes: {
        "ha-pulse": {
          "0%, 100%": { opacity: ".45" },
          "50%": { opacity: "1" },
        },
        "ha-in": {
          from: { transform: "translateY(9px)", opacity: "0" },
          to: { transform: "none", opacity: "1" },
        },
        "ha-dot": {
          "0%, 80%, 100%": { opacity: ".25", transform: "translateY(0)" },
          "40%": { opacity: "1", transform: "translateY(-3px)" },
        },
        "ha-glow": {
          "0%, 100%": { boxShadow: "0 0 0 rgba(45,226,230,0)" },
          "50%": { boxShadow: "0 0 22px rgba(45,226,230,0.35)" },
        },
        "ha-spin": { to: { transform: "rotate(360deg)" } },
      },
      animation: {
        "ha-pulse": "ha-pulse 1.4s ease-in-out infinite",
        "ha-in": "ha-in 0.45s cubic-bezier(0.2, 0.7, 0.2, 1)",
        "ha-dot": "ha-dot 1s infinite",
        "ha-glow": "ha-glow 2.4s ease-in-out infinite",
        "ha-spin": "ha-spin 1s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
