import { Inject, Injectable, type OnModuleInit } from "@nestjs/common";
import { randomUUID } from "node:crypto";
import { StoreService } from "../engine/store.service.js";
import { AUTH_CONFIG, type AuthConfig } from "./auth.config.js";
import { hashPassword } from "./password.js";

/**
 * On boot, seed a first account from AUTH_BOOTSTRAP_EMAIL/PASSWORD if set and not
 * already present. Lets an operator provision the initial user for a fresh
 * deployment without going through the public register endpoint.
 */
@Injectable()
export class BootstrapService implements OnModuleInit {
  constructor(
    @Inject(AUTH_CONFIG) private readonly cfg: AuthConfig,
    private readonly store: StoreService,
  ) {}

  onModuleInit(): void {
    const email = this.cfg.bootstrapEmail?.trim().toLowerCase();
    const password = this.cfg.bootstrapPassword;
    if (!email || !password || password.length < 8) return;
    if (this.store.users.findByEmail(email)) return;
    this.store.users.create({
      id: "usr_" + randomUUID(),
      email,
      passwordHash: hashPassword(password),
      createdAt: Date.now(),
    });
  }
}
