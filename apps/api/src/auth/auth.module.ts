import { Module } from "@nestjs/common";
import { APP_GUARD } from "@nestjs/core";
import { EngineModule } from "../engine/engine.module.js";
import { AuthController } from "./auth.controller.js";
import { AuthService } from "./auth.service.js";
import { BootstrapService } from "./bootstrap.service.js";
import { JwtAuthGuard } from "./jwt-auth.guard.js";
import { AUTH_CONFIG, authConfigFromEnv } from "./auth.config.js";

@Module({
  imports: [EngineModule],
  controllers: [AuthController],
  providers: [
    AuthService,
    BootstrapService,
    { provide: AUTH_CONFIG, useFactory: authConfigFromEnv },
    // Registered globally — protects every route unless marked @Public().
    { provide: APP_GUARD, useClass: JwtAuthGuard },
  ],
})
export class AuthModule {}
