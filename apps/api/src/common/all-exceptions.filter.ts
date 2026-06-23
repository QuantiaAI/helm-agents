import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from "@nestjs/common";
import type { Response } from "express";
import type { ErrorResponse } from "@helm-agents/contracts";

/**
 * Normalizes every error to the contract's `{ error: string }` shape. Our
 * controllers already throw `{ error }`; Nest's built-in errors (e.g. malformed
 * JSON body) use `{ statusCode, message, error }`, which would otherwise leak a
 * different shape ("Bad Request") to clients. This keeps the wire contract
 * consistent with the old Next.js handlers.
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const res = host.switchToHttp().getResponse<Response>();

    // A raw streaming/file response (@Res) may already be partway sent; don't
    // try to re-send JSON over it.
    if (res.headersSent) return;

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let error = "Internal server error";

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const body = exception.getResponse();
      if (typeof body === "string") {
        error = body;
      } else if (body && typeof body === "object") {
        const b = body as Record<string, unknown>;
        if (typeof b.error === "string") error = b.error;
        else if (typeof b.message === "string") error = b.message;
        else if (Array.isArray(b.message)) error = b.message.join(", ");
        else error = exception.message;
      }
    } else if (exception instanceof Error) {
      error = exception.message;
    }

    const payload: ErrorResponse = { error };
    res.status(status).json(payload);
  }
}
