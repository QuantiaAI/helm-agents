import { describe, it, expect } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { server, API } from "./msw";
import { renderAt } from "./render";
import { Settings } from "../src/pages/Settings";

const CONFIG = {
  settings: { llmProvider: "openai" },
  defaults: {
    llmProvider: "openai",
    deepThinkLlm: "gpt-5.5",
    quickThinkLlm: "gpt-5.4-mini",
    outputLanguage: "English",
    maxDebateRounds: 1,
    maxRiskDiscussRounds: 1,
    dataVendors: {},
  },
  providers: [{ name: "openai", interface: "openai" }],
  deepModels: [{ label: "GPT-5.5", modelId: "gpt-5.5" }],
  quickModels: [{ label: "GPT-5.4 mini", modelId: "gpt-5.4-mini" }],
};

describe("Settings", () => {
  it("loads config + keys and saves settings via PUT", async () => {
    let putBody: unknown = null;
    server.use(
      http.get(`${API}/config`, () => HttpResponse.json(CONFIG)),
      http.get(`${API}/keys`, () =>
        HttpResponse.json({
          keys: [{ provider: "openai", env: "OPENAI_API_KEY", set: false }],
        }),
      ),
      http.put(`${API}/config`, async ({ request }) => {
        putBody = await request.json();
        return HttpResponse.json({ ok: true, settings: putBody });
      }),
    );

    renderAt("/en/settings", "/:locale/settings", <Settings />);

    expect(await screen.findByText("Provider")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: /Save model/i }));
    expect(await screen.findByText(/Saved/i)).toBeInTheDocument();
    expect(putBody).toMatchObject({ llmProvider: "openai" });
  });
});
