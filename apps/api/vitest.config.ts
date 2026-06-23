import { defineConfig } from "vitest/config";
import swc from "unplugin-swc";

// NestJS relies on emitDecoratorMetadata for constructor DI. Vitest's default
// esbuild transform drops decorator metadata, so we transform tests with SWC
// (legacy decorators + decorator metadata enabled by unplugin-swc by default).
export default defineConfig({
  test: {
    environment: "node",
    include: ["test/**/*.e2e-spec.ts", "src/**/*.spec.ts"],
    globals: true,
    // A full multi-agent run (analyze/memory) can take a while even with the
    // demo LLM; keep the default generous.
    testTimeout: 30_000,
  },
  plugins: [swc.vite()],
});
