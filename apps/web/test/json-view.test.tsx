import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { JsonView } from "../src/components/json-view";

describe("JsonView", () => {
  it("renders object keys as labels with their values", () => {
    render(<JsonView value={{ overallBand: "Somewhat Bearish", overallScore: -25 }} />);
    expect(screen.getByText("overallBand")).toBeTruthy();
    expect(screen.getByText("Somewhat Bearish")).toBeTruthy();
    expect(screen.getByText("overallScore")).toBeTruthy();
    expect(screen.getByText("-25")).toBeTruthy();
  });

  it("renders nested object keys", () => {
    render(<JsonView value={{ outer: { inner: "deep" } }} />);
    expect(screen.getByText("outer")).toBeTruthy();
    expect(screen.getByText("inner")).toBeTruthy();
    expect(screen.getByText("deep")).toBeTruthy();
  });

  it("renders array items", () => {
    render(<JsonView value={{ items: ["alpha", "beta"] }} />);
    expect(screen.getByText("alpha")).toBeTruthy();
    expect(screen.getByText("beta")).toBeTruthy();
  });

  it("renders boolean and null primitives", () => {
    render(<JsonView value={{ flag: true, empty: null }} />);
    expect(screen.getByText("true")).toBeTruthy();
    expect(screen.getByText("null")).toBeTruthy();
  });

  it("falls back to stringify beyond max depth without throwing", () => {
    const deep = { a: { b: { c: { d: { e: "x" } } } } };
    expect(() => render(<JsonView value={deep} />)).not.toThrow();
    // Verify the stringified boundary content appears in the DOM
    expect(screen.getByText(/\{"e":"x"\}/)).toBeTruthy();
  });
});
