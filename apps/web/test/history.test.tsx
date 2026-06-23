import { describe, it, expect } from "vitest";
import { screen } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { server, API } from "./msw";
import { renderAt } from "./render";
import { History } from "../src/pages/History";

describe("History", () => {
  it("fetches and renders run rows from the API", async () => {
    server.use(
      http.get(`${API}/runs`, () =>
        HttpResponse.json({
          runs: [
            {
              id: "run_1",
              ticker: "NVDA",
              tradeDate: "2024-05-10",
              assetType: "stock",
              status: "done",
              rating: "Buy",
              selectedAnalysts: null,
              finalStateJson: null,
              error: null,
              createdAt: Date.now(),
              updatedAt: Date.now(),
            },
          ],
        }),
      ),
    );
    renderAt("/en/history", "/:locale/history", <History />);
    expect(await screen.findByText("NVDA")).toBeInTheDocument();
    expect(screen.getByText("Buy")).toBeInTheDocument();
  });

  it("renders the empty state when there are no runs", async () => {
    server.use(http.get(`${API}/runs`, () => HttpResponse.json({ runs: [] })));
    renderAt("/en/history", "/:locale/history", <History />);
    expect(await screen.findByText(/Run history/i)).toBeInTheDocument();
  });
});
