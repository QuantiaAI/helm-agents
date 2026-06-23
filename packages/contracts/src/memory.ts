/** One decision-memory row for the reflection feature. */
export interface MemoryItem {
  id: number;
  ticker: string;
  tradeDate: string;
  rating: string;
  status: string;
  decision: string;
  reflection: string | null;
  returnPct: number | null;
  alpha: number | null;
  createdAt: number;
  resolvedAt: number | null;
}

/** Response of `GET /api/memory`. */
export interface MemoryResponse {
  recent: MemoryItem[];
  pending: MemoryItem[];
}

/** Response of `POST /api/memory` (resolve pending). */
export interface MemoryResolveResponse {
  resolved: number;
  pending: MemoryItem[];
}
