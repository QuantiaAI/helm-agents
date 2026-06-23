import { Controller, Get, Param, Res } from "@nestjs/common";
import type { Response } from "express";
import { readDoc } from "../lib/docs.js";
import { Public } from "../auth/public.decorator.js";

@Controller("docs")
export class DocsController {
  /** GET /api/docs/<path>.md — returns the raw markdown, or 404. */
  @Public()
  @Get("*path")
  get(@Param("path") path: string | string[], @Res() res: Response): void {
    const slug = Array.isArray(path) ? path : String(path).split("/");
    const md = readDoc(slug);
    if (md === null) {
      res.status(404).send("not found");
      return;
    }
    res.setHeader("content-type", "text/markdown; charset=utf-8");
    res.send(md);
  }
}
