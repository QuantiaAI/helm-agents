import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  InternalServerErrorException,
  NotFoundException,
  Param,
  Post,
  Res,
} from "@nestjs/common";
import type { Response } from "express";
import type {
  AnalyzeResult,
  CancelRunResponse,
  CreateRunResponse,
  RunDetailResponse,
  RunsListResponse,
} from "@helm-agents/contracts";
import { RunsService } from "../engine/runs.service.js";
import { EngineService } from "../engine/engine.service.js";
import { StoreService } from "../engine/store.service.js";
import { CurrentUser, type AuthUser } from "../auth/current-user.decorator.js";
import { parseAnalyzeBody } from "../lib/validate.js";
import { assembleMarkdown } from "../lib/report.js";

const msg = (e: unknown): string => (e instanceof Error ? e.message : String(e));

// Keep-alive interval for the NDJSON run stream. A multi-agent run can idle for
// minutes between events (the deep model thinking); without periodic bytes an
// idle connection gets dropped by the browser/proxy, surfacing as a spurious
// "network error" client-side while the run actually keeps going. A blank line
// every interval keeps the socket alive; the client skips empty lines.
const heartbeatMs = (): number => Number(process.env.STREAM_HEARTBEAT_MS ?? 15000);

@Controller()
export class RunsController {
  constructor(
    private readonly runs: RunsService,
    private readonly engine: EngineService,
    private readonly store: StoreService,
  ) {}

  /** Synchronous analyze: runs the full pipeline and returns the final result. */
  @Post("analyze")
  @HttpCode(200)
  async analyze(@CurrentUser() user: AuthUser, @Body() body: unknown): Promise<AnalyzeResult> {
    const parsed = parseAnalyzeBody(body);
    if (!parsed.ok) throw new BadRequestException({ error: parsed.error });
    try {
      return await this.engine.getForUser(user.id).propagate(parsed.input);
    } catch (e) {
      throw new InternalServerErrorException({ error: msg(e) });
    }
  }

  /** List this user's run history (newest-first). */
  @Get("runs")
  list(@CurrentUser() user: AuthUser): RunsListResponse {
    return { runs: this.store.runs.list(user.id) as RunsListResponse["runs"] };
  }

  /** Create a streamed run; the client subscribes to /api/runs/:id/stream. */
  @Post("runs")
  @HttpCode(200)
  create(@CurrentUser() user: AuthUser, @Body() body: unknown): CreateRunResponse {
    const parsed = parseAnalyzeBody(body);
    if (!parsed.ok) throw new BadRequestException({ error: parsed.error });
    return { runId: this.runs.manager.create(user.id, parsed.input) };
  }

  /** Live in-memory snapshot if present, else the persisted history row. */
  @Get("runs/:id")
  detail(@CurrentUser() user: AuthUser, @Param("id") id: string): RunDetailResponse {
    const live = this.runs.manager.get(id);
    if (live && live.userId === user.id) {
      return {
        id: live.id,
        status: live.status,
        rating: live.rating,
        error: live.error,
        input: live.input,
        // Include the result for a completed in-memory run so a client that
        // lost the stream can recover by polling /runs/:id (not just on restart).
        ...(live.finalState ? { finalState: live.finalState } : {}),
      };
    }
    const row = this.store.runs.get(id);
    if (!row || row.userId !== user.id) throw new NotFoundException({ error: "run not found" });
    let finalState: unknown = null;
    if (row.finalStateJson) {
      try {
        finalState = JSON.parse(row.finalStateJson);
      } catch {
        finalState = null;
      }
    }
    return { ...row, finalState } as RunDetailResponse;
  }

  /**
   * Stream a run's events as NDJSON (one RunEvent per line). The client drains
   * buffered events then receives live events until the run terminates.
   */
  @Get("runs/:id/stream")
  async stream(
    @CurrentUser() user: AuthUser,
    @Param("id") id: string,
    @Res() res: Response,
  ): Promise<void> {
    const manager = this.runs.manager;
    const live = manager.get(id);
    if (!live || live.userId !== user.id) {
      res.status(404).send("run not found");
      return;
    }
    res.setHeader("content-type", "application/x-ndjson; charset=utf-8");
    res.setHeader("cache-control", "no-cache, no-transform");
    // Disable proxy buffering (nginx) so events flush live, not in one batch.
    res.setHeader("x-accel-buffering", "no");
    // Keep the connection alive through long idle gaps between agent events.
    const beat = setInterval(() => {
      try {
        res.write("\n");
      } catch {
        /* socket already closed */
      }
    }, heartbeatMs());
    try {
      for await (const ev of manager.subscribe(id)) {
        res.write(JSON.stringify(ev) + "\n");
      }
    } catch (e) {
      res.write(JSON.stringify({ type: "error", message: msg(e) }) + "\n");
    } finally {
      clearInterval(beat);
      res.end();
    }
  }

  /** Cancel a running run. */
  @Post("runs/:id/cancel")
  @HttpCode(200)
  cancel(@CurrentUser() user: AuthUser, @Param("id") id: string): CancelRunResponse {
    const live = this.runs.manager.get(id);
    if (!live || live.userId !== user.id) return { cancelled: false };
    return { cancelled: this.runs.manager.cancel(id) };
  }

  /** Full markdown report for a completed run (downloadable). */
  @Get("runs/:id/report")
  report(@CurrentUser() user: AuthUser, @Param("id") id: string, @Res() res: Response): void {
    const row = this.store.runs.get(id);
    if (!row || row.userId !== user.id) {
      res.status(404).send("run not found");
      return;
    }
    let finalState = {};
    if (row.finalStateJson) {
      try {
        finalState = JSON.parse(row.finalStateJson);
      } catch {
        /* leave empty */
      }
    }
    const md = assembleMarkdown(row.ticker, row.tradeDate, row.rating, finalState);
    res.setHeader("content-type", "text/markdown; charset=utf-8");
    res.setHeader(
      "content-disposition",
      `attachment; filename="${row.ticker}_${row.tradeDate}.md"`,
    );
    res.send(md);
  }
}
