import { Module } from "@nestjs/common";
import { EngineModule } from "../engine/engine.module.js";
import { ConfigController } from "./config.controller.js";

@Module({ imports: [EngineModule], controllers: [ConfigController] })
export class ConfigModule {}
