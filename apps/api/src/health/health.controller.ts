import { Controller, Get } from "@nestjs/common";
import type { HealthResponse } from "@helm-agents/contracts";
import { Public } from "../auth/public.decorator.js";
import { runHealthChecks, defaultStoreDir } from "./checks.js";

@Controller("health")
export class HealthController {
  @Public()
  @Get()
  health(): HealthResponse {
    const checks = runHealthChecks(defaultStoreDir());
    return {
      ok: checks.every((c) => c.ok),
      service: "tradingagents-api",
      checks,
    };
  }
}
