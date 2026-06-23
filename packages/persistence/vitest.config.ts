import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
    // node:sqlite is newer than Vite's builtin list; keep it external so the
    // real Node module is used instead of Vite trying to bundle "sqlite".
    server: { deps: { external: [/node:sqlite/] } },
  },
});
