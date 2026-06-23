import { Module } from "@nestjs/common";
import { EngineModule } from "../engine/engine.module.js";
import { RunsController } from "./runs.controller.js";

@Module({ imports: [EngineModule], controllers: [RunsController] })
export class RunsModule {}
