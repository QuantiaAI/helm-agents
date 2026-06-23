import { BadRequestException, Body, Controller, Get, Put } from "@nestjs/common";
import type { KeysResponse, KeysUpdateResponse } from "@helm-agents/contracts";
import { KeysService } from "../engine/keys.service.js";
import { EngineService } from "../engine/engine.service.js";
import { CurrentUser, type AuthUser } from "../auth/current-user.decorator.js";

@Controller("keys")
export class KeysController {
  constructor(
    private readonly keys: KeysService,
    private readonly engine: EngineService,
  ) {}

  /** List which provider keys this user has set (masked — never the secret). */
  @Get()
  list(@CurrentUser() user: AuthUser): KeysResponse {
    return { keys: this.keys.listMasked(user.id) };
  }

  /** Set or clear one of this user's provider API keys (by env var name). */
  @Put()
  update(
    @CurrentUser() user: AuthUser,
    @Body() body: { env?: unknown; value?: unknown },
  ): KeysUpdateResponse {
    if (typeof body.env !== "string" || typeof body.value !== "string") {
      throw new BadRequestException({ error: "env and value are required" });
    }
    this.keys.setByEnv(user.id, body.env, body.value);
    this.engine.invalidate(user.id);
    return { ok: true, keys: this.keys.listMasked(user.id) };
  }
}
