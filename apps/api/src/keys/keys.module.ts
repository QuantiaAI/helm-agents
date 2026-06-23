import { Module } from "@nestjs/common";
import { EngineModule } from "../engine/engine.module.js";
import { KeysController } from "./keys.controller.js";

@Module({ imports: [EngineModule], controllers: [KeysController] })
export class KeysModule {}
