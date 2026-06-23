import type { RunEvent, RefreshResponse } from "@helm-agents/contracts";

// Base URL for the API. Empty in dev (Vite proxies /api → backend); set
// VITE_API_BASE_URL in production where the SPA and API are different origins.
const BASE = import.meta.env.VITE_API_BASE_URL ?? "";

/** Build an absolute API URL from a path like "/runs/:id/stream". */
export function apiUrl(path: string): string {
  return `${BASE}/api${path.startsWith("/") ? path : `/${path}`}`;
}

// ── Access token (in-memory; refresh token lives in an httpOnly cookie) ──────
let accessToken: string | null = null;
export function setAccessToken(t: string | null): void {
  accessToken = t;
}
export function getAccessToken(): string | null {
  return accessToken;
}

function authHeaders(extra?: HeadersInit): HeadersInit {
  return accessToken
    ? { ...extra, Authorization: `Bearer ${accessToken}` }
    : { ...extra };
}

// ── Token refresh (one-time-use rotating refresh token via cookie) ──────────
// Concurrent 401s share a single in-flight refresh so the rotating refresh
// token is only spent once.
let refreshing: Promise<boolean> | null = null;

export function tryRefresh(): Promise<boolean> {
  if (!refreshing) {
    refreshing = (async () => {
      try {
        const res = await fetch(apiUrl("/auth/refresh"), {
          method: "POST",
          credentials: "include",
        });
        if (!res.ok) {
          setAccessToken(null);
          return false;
        }
        const body = (await res.json()) as RefreshResponse;
        setAccessToken(body.accessToken);
        return true;
      } catch {
        setAccessToken(null);
        return false;
      } finally {
        refreshing = null;
      }
    })();
  }
  return refreshing;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const send = () =>
    fetch(apiUrl(path), {
      ...init,
      headers: authHeaders({
        "Content-Type": "application/json",
        ...init?.headers,
      }),
    });

  let res = await send();
  if (res.status === 401 && (await tryRefresh())) {
    res = await send();
  }

  const text = await res.text();
  const body = text ? JSON.parse(text) : undefined;
  if (!res.ok) {
    const message =
      (body && typeof body === "object" && "error" in body && body.error) ||
      `HTTP ${res.status}`;
    throw new Error(String(message));
  }
  return body as T;
}

export function apiGet<T>(path: string): Promise<T> {
  return request<T>(path);
}

export function apiPut<T>(path: string, body: unknown): Promise<T> {
  return request<T>(path, { method: "PUT", body: JSON.stringify(body) });
}

export function apiPost<T>(path: string, body?: unknown): Promise<T> {
  return request<T>(path, {
    method: "POST",
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

/**
 * Auth request: POSTs with `credentials:"include"` so the httpOnly refresh
 * cookie is set (register/login) or sent/cleared (logout). Does NOT attach the
 * Bearer header or trigger refresh-retry — these endpoints establish the session.
 */
export async function authRequest<T>(path: string, body?: unknown): Promise<T> {
  const res = await fetch(apiUrl(path), {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const text = await res.text();
  const parsed = text ? JSON.parse(text) : undefined;
  if (!res.ok) {
    const message =
      (parsed &&
        typeof parsed === "object" &&
        "error" in parsed &&
        parsed.error) ||
      `HTTP ${res.status}`;
    throw new Error(String(message));
  }
  return parsed as T;
}

/** Fetch raw text (used for the docs markdown endpoint). Returns null on 404. */
export async function apiGetText(path: string): Promise<string | null> {
  const send = () => fetch(apiUrl(path), { headers: authHeaders() });
  let res = await send();
  if (res.status === 401 && (await tryRefresh())) {
    res = await send();
  }
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.text();
}

/**
 * Stream a run's NDJSON events as an async generator (one RunEvent per line).
 * Ported from the original analyze page's inline reader.
 */
export async function* streamRun(
  runId: string,
  signal: AbortSignal,
): AsyncGenerator<RunEvent> {
  const send = () =>
    fetch(apiUrl(`/runs/${runId}/stream`), {
      signal,
      headers: authHeaders(),
    });
  let res = await send();
  if (res.status === 401 && (await tryRefresh())) {
    res = await send();
  }
  if (!res.ok || !res.body) throw new Error(`stream failed: HTTP ${res.status}`);
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buf = "";
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    buf += decoder.decode(value, { stream: true });
    let idx: number;
    while ((idx = buf.indexOf("\n")) >= 0) {
      const line = buf.slice(0, idx);
      buf = buf.slice(idx + 1);
      if (line.trim()) yield JSON.parse(line) as RunEvent;
    }
  }
}
