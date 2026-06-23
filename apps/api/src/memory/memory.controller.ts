import {
  BadRequestException,
  Controller,
  Get,
  HttpCode,
  Post,
  Query,
} from "@nestjs/common";
import type {
  MemoryResponse,
  MemoryResolveResponse,
} from "@helm-agents/contracts";
import { StoreService } from "../engine/store.service.js";
import { EngineService } from "../engine/engine.service.js";
import { resolvePending } from "../lib/reflection.js";
import { CurrentUser, type AuthUser } from "../auth/current-user.decorator.js";

@Controller("memory")
export class MemoryController {
  constructor(
    private readonly store: StoreService,
    private readonly engine: EngineService,
  ) {}

  /** This user's recent resolved memory (+ pending) for the reflection feature. */
  @Get()
  recent(@CurrentUser() user: AuthUser, @Query("ticker") ticker?: string): MemoryResponse {
    return {
      recent: this.store.memory.recent(user.id, ticker, 50) as MemoryResponse["recent"],
      pending: this.store.memory.pending(user.id, ticker) as MemoryResponse["pending"],
    };
  }

  /** Resolve pending decisions for a ticker (fetch returns + alpha, LLM reflect). */
  @Post()
  @HttpCode(200)
  async resolve(
    @CurrentUser() user: AuthUser,
    @Query("ticker") ticker?: string,
  ): Promise<MemoryResolveResponse> {
    if (!ticker) {
      throw new BadRequestException({ error: "ticker query param required" });
    }
    const resolved = await resolvePending({
      userId: user.id,
      ticker,
      engine: this.engine.getForUser(user.id),
      repo: this.store.memory,
    });
    return {
      resolved,
      pending: this.store.memory.pending(
        user.id,
        ticker,
      ) as MemoryResolveResponse["pending"],
    };
  }
}
