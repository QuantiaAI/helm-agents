import { defineConfig } from "vitest/config";

export default defineConfig({
  // The full 13-agent pipeline tests (propagate/streamEvents with a stub LLM)
  // run the real LangGraph workflow and can take several seconds — well over
  // vitest's 5s default. Give them headroom to avoid CI flakiness.
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
    testTimeout: 30000,
  },
});
