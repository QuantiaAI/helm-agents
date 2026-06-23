/** Single source of truth for HelmAgents brand strings (importable in node tests + RSC). */
export const BRAND = {
  name: "HelmAgents",
  wordmark: { primary: "Helm", accent: "Agents" },
  tagline: "Multi-agent LLM trading, at the helm.",
  metaTitle: "HelmAgents · Multi-Agent LLM Trading Desk",
  metaDescription:
    "Multi-agent LLM trading desk — thirteen AI analysts research, debate, stress-test risk, and converge on a single traceable trade decision, streamed live in your browser.",
  footer: "HelmAgents · Multi-agent LLM trading desk · Built on TradingAgents",
  builtOn: "TradingAgents",
} as const;
