import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module.js";
import { AllExceptionsFilter } from "./common/all-exceptions.filter.js";

const DEFAULT_PORT = 5171;

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  // All routes live under /api to match the prior Next.js API surface.
  app.setGlobalPrefix("api");
  // Uniform { error } body for every failure (matches the contract).
  app.useGlobalFilters(new AllExceptionsFilter());
  // The SPA is served from a different origin in production. CORS_ORIGIN is a
  // comma-separated allow-list; unset means reflect the request origin (dev).
  const origins = process.env.CORS_ORIGIN?.split(",").map((s) => s.trim());
  app.enableCors({ origin: origins && origins.length ? origins : true });
  const port = Number(process.env.API_PORT ?? process.env.PORT ?? DEFAULT_PORT);
  await app.listen(port);
  // eslint-disable-next-line no-console
  console.log(`[api] listening on http://localhost:${port}/api`);
}

void bootstrap();
