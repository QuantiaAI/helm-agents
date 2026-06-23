import { Module } from "@nestjs/common";
import { AuthModule } from "./auth/auth.module.js";
import { HealthModule } from "./health/health.module.js";
import { ModelsModule } from "./models/models.module.js";
import { ConfigModule } from "./config/config.module.js";
import { KeysModule } from "./keys/keys.module.js";
import { RunsModule } from "./runs/runs.module.js";
import { MemoryModule } from "./memory/memory.module.js";
import { DocsModule } from "./docs/docs.module.js";

@Module({
  imports: [
    AuthModule,
    HealthModule,
    ModelsModule,
    ConfigModule,
    KeysModule,
    RunsModule,
    MemoryModule,
    DocsModule,
  ],
})
export class AppModule {}
