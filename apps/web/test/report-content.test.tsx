import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import "../src/i18n";
import { ReportContent } from "../src/components/report-content";

// The rating badge in a structured card (e.g. 最终交易决策 / PortfolioCard) sits in a
// flex row next to taller Stat boxes. It must NOT stretch-and-top-align (the old
// inline-block bug). The badge is a tinted chip: colored mono text on a faint
// fill of the same hue (design system §03) — chosen over a solid swatch + white
// text because the lighter rating tiers (Overweight / Hold) lost contrast.
describe("ReportContent rating badge", () => {
  it("renders a self-centered inline-flex tinted chip in the rating hue", () => {
    render(
      <ReportContent
        field="finalTradeDecision"
        data={{
          rating: "Sell",
          executiveSummary: "x",
          investmentThesis: "y",
          priceTarget: 12.3,
          timeHorizon: "6m",
        }}
      />,
    );
    const badge = screen.getByText("Sell"); // en locale → label is "Sell"
    expect(badge.className).toMatch(/inline-flex/);
    expect(badge.className).toMatch(/items-center/);
    expect(badge.className).toMatch(/self-center/);
    expect(badge.className).toMatch(/font-mono/);
    expect(badge.className).not.toMatch(/inline-block/);
    // Text color = the Sell design hue (#F0496E), applied via inline style.
    expect(badge.style.color).toBe("rgb(240, 73, 110)");
  });

  it("renders an out-of-range sentiment score as a structured card, not a JSON block", () => {
    render(
      <ReportContent
        field="sentimentReport"
        data={{
          overallBand: "Somewhat Bearish",
          overallScore: -25,
          confidence: "low",
          narrative: "Mild bearish tilt with low sample size.",
        }}
      />,
    );
    // Narrative prose renders (structured card), not hidden in a code block.
    expect(screen.getByText(/Mild bearish tilt/)).toBeTruthy();
    // No raw JSON key label leaked (would mean the JsonView/code-block fallback fired).
    expect(screen.queryByText("overallScore")).toBeNull();
    // Out-of-range score shown raw, with no fabricated /10 denominator.
    expect(screen.getByText("-25")).toBeTruthy();
    // The old raw-JSON fallback rendered inside a <pre><code class="hljs"> block;
    // the structured SentimentCard does not. This is what makes the test a real
    // regression guard for the sentiment-structuring fix.
    expect(document.querySelector("pre")).toBeNull();
  });

  it("renders a duplicated trader proposal (null entryPrice) as a structured TraderCard", () => {
    // run_lgeb1rdy: the trader agent persisted the object twice and entryPrice was
    // null. Both the doubled-JSON parse and the null entryPrice must be tolerated
    // so this renders the proper TraderCard, not raw text.
    const doubled =
      '{"action":"Sell","reasoning":"Reduce exposure on weak technicals.","entryPrice":null,"stopLoss":150,"positionSizing":"<=2%"}\n\n' +
      '{"action":"Sell","reasoning":"Reduce exposure on weak technicals.","entryPrice":null,"stopLoss":150,"positionSizing":"<=2%"}';
    render(<ReportContent field="traderInvestmentPlan" body={doubled} />);
    // Rating badge (en locale → "Sell") from the structured TraderCard.
    expect(screen.getByText("Sell")).toBeTruthy();
    // Reasoning prose rendered as a card, not a code block.
    expect(screen.getByText(/Reduce exposure/)).toBeTruthy();
    // A real TraderCard Stat (stopLoss) is shown.
    expect(screen.getByText("150")).toBeTruthy();
    // Not the raw-JSON fallback.
    expect(document.querySelector("pre")).toBeNull();
  });
});
