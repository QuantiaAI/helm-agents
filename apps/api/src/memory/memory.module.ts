import { Module } from "@nestjs/common";
import { EngineModule } from "../engine/engine.module.js";
import { MemoryController } from "./memory.controller.js";

@Module({ imports: [EngineModule], controllers: [MemoryController] })
export class MemoryModule {}
