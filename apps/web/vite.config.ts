import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "node:path";

const API_TARGET = process.env.VITE_API_PROXY ?? "http://localhost:5171";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { "@": path.resolve(__dirname, "src") },
  },
  server: {
    port: 5170,
    // Dev convenience: proxy /api to the NestJS backend so the SPA can use
    // same-origin relative URLs locally (production sets VITE_API_BASE_URL).
    proxy: { "/api": { target: API_TARGET, changeOrigin: true } },
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./test/setup.ts"],
    include: ["test/**/*.test.{ts,tsx}", "src/**/*.test.{ts,tsx}"],
    // Absolute base so the api client emits absolute URLs MSW can intercept.
    env: { VITE_API_BASE_URL: "http://localhost:5171" },
  },
});
