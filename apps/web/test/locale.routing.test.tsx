import { describe, it, expect } from "vitest";
import { screen } from "@testing-library/react";
import { render } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import "../src/i18n";
import { Layout } from "../src/components/Layout";
import { Home } from "../src/pages/Home";

function renderApp(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/:locale" element={<Layout />}>
          <Route index element={<Home />} />
        </Route>
      </Routes>
    </MemoryRouter>,
  );
}

describe("locale routing", () => {
  it("renders the page for a valid locale", () => {
    renderApp("/en");
    expect(screen.getByText(/Take the helm/i)).toBeInTheDocument();
  });

  it("404s an unknown locale instead of clamping to English content", () => {
    renderApp("/xx");
    expect(screen.getByText("404")).toBeInTheDocument();
    expect(screen.queryByText(/Take the helm/i)).not.toBeInTheDocument();
  });
});
