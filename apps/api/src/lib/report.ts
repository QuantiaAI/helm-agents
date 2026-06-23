/** Assemble a complete markdown report from a run's final state (ports
 * cli/main.save_report_to_disk / display_complete_report). */

interface FinalState {
  companyOfInterest?: string;
  tradeDate?: string;
  assetType?: string;
  marketReport?: string;
  sentimentReport?: string;
  newsReport?: string;
  fundamentalsReport?: string;
  investmentPlan?: string;
  traderInvestmentPlan?: string;
  finalTradeDecision?: string;
  investmentDebateState?: { history?: string };
  riskDebateState?: { history?: string };
}

export function assembleMarkdown(
  ticker: string,
  tradeDate: string,
  rating: string | null,
  finalState: FinalState,
): string {
  const s = (v?: string) => (v && v.trim() ? v : "_(not produced)_");
  return [
    `# HelmAgents Report — ${ticker} (${tradeDate})`,
    "",
    `**Rating:** ${rating ?? "n/a"}`,
    "",
    "## I. Analysts",
    "",
    "### Market",
    s(finalState.marketReport),
    "",
    "### Sentiment",
    s(finalState.sentimentReport),
    "",
    "### News",
    s(finalState.newsReport),
    "",
    "### Fundamentals",
    s(finalState.fundamentalsReport),
    "",
    "## II. Research",
    "",
    "### Investment debate",
    s(finalState.investmentDebateState?.history),
    "",
    "### Investment plan",
    s(finalState.investmentPlan),
    "",
    "## III. Trading",
    "",
    "### Trader proposal",
    s(finalState.traderInvestmentPlan),
    "",
    "## IV. Risk management",
    "",
    "### Risk debate",
    s(finalState.riskDebateState?.history),
    "",
    "## V. Portfolio decision",
    "",
    "### Final trade decision",
    s(finalState.finalTradeDecision),
    "",
  ].join("\n");
}
