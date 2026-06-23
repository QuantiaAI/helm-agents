/** One backend self-check result (cheap, synchronous, no external calls). */
export interface HealthCheck {
  /** Stable id, e.g. "config" / "store" / "cipher" / "registry". */
  key: string;
  /** Human-friendly label (English; the UI may localize via a key map). */
  label: string;
  ok: boolean;
  latencyMs: number;
  /** Error detail when `ok` is false. */
  detail?: string;
}

/** Response shape of `GET /api/health`. */
export interface HealthResponse {
  /** Overall = every check passed. */
  ok: boolean;
  service: string;
  /** Backend self-checks (config / store / cipher / registry). */
  checks: HealthCheck[];
}
