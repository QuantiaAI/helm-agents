import { Inject, Injectable } from "@nestjs/common";
import {
  openDb,
  SqliteRunsRepo,
  SqliteMemoryRepo,
  UsersRepo,
  RefreshTokensRepo,
  UserKeysRepo,
  UserSettingsRepo,
  type Db,
} from "@helm-agents/persistence";
import { STORE_DIR } from "./tokens.js";

/** Opens the SQLite store once (Nest singleton) and exposes per-user repos. */
@Injectable()
export class StoreService {
  readonly db: Db;
  readonly runs: SqliteRunsRepo;
  readonly memory: SqliteMemoryRepo;
  readonly users: UsersRepo;
  readonly refreshTokens: RefreshTokensRepo;
  readonly userKeys: UserKeysRepo;
  readonly userSettings: UserSettingsRepo;

  constructor(@Inject(STORE_DIR) storeDir: string) {
    this.db = openDb(storeDir);
    this.runs = new SqliteRunsRepo(this.db);
    this.memory = new SqliteMemoryRepo(this.db);
    this.users = new UsersRepo(this.db);
    this.refreshTokens = new RefreshTokensRepo(this.db);
    this.userKeys = new UserKeysRepo(this.db);
    this.userSettings = new UserSettingsRepo(this.db);
    // A fresh process has no in-memory runs, so any persisted "running" row was
    // orphaned by a prior restart/crash — reconcile so the UI never hangs.
    this.runs.reconcileInterrupted();
    // Bound refresh-token table growth (keeps revoked-but-unexpired for reuse detection).
    this.refreshTokens.pruneExpired(Date.now());
  }
}
