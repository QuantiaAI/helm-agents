import { Module } from "@nestjs/common";
import { DocsController } from "./docs.controller.js";

@Module({ controllers: [DocsController] })
export class DocsModule {}
