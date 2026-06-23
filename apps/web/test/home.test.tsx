import { describe, it, expect } from "vitest";
import { screen } from "@testing-library/react";
import { renderAt } from "./render";
import { Home } from "../src/pages/Home";

describe("Home", () => {
  it("renders the translated hero (i18n reuses messages)", () => {
    renderAt("/en", "/:locale", <Home />);
    expect(screen.getByText(/Take the helm/i)).toBeInTheDocument();
    // {n} interpolation works via the custom delimiters.
    expect(screen.getByText("Phase 1")).toBeInTheDocument();
  });
});
