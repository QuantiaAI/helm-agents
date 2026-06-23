import { Inject, Injectable } from "@nestjs/common";
import { PROVIDER_API_KEY_ENV } from "@helm-agents/llm";
import { KeyCipher } from "../lib/key-cipher.js";
import { StoreService } from "./store.service.js";
import { STORE_DIR } from "./tokens.js";

/** Per-user encrypted API-key management. */
@Injectable()
export class KeysService {
  private readonly cipher: KeyCipher;

  constructor(
    @Inject(STORE_DIR) storeDir: string,
    private readonly store: StoreService,
  ) {
    this.cipher = new KeyCipher(storeDir);
  }

  /** Provider key status for a user (masked — never returns secret material). */
  listMasked(userId: string): Array<{ env: string; provider: string; set: boolean }> {
    const have = new Set(this.store.userKeys.list(userId).map((k) => k.env));
    return Object.entries(PROVIDER_API_KEY_ENV)
      .filter(([, env]) => env !== null)
      .map(([provider, env]) => ({
        provider,
        env: env as string,
        set: have.has(env as string),
      }));
  }

  setByEnv(userId: string, env: string, value: string): void {
    if (!value) {
      this.store.userKeys.delete(userId, env);
      return;
    }
    this.store.userKeys.set(userId, env, this.cipher.encrypt(value), Date.now());
  }

  /** Decrypted { envVar: key } map for building this user's engine. */
  envMap(userId: string): Record<string, string> {
    const out: Record<string, string> = {};
    for (const row of this.store.userKeys.list(userId)) {
      try {
        out[row.env] = this.cipher.decrypt(row.ciphertext);
      } catch {
        /* skip undecryptable rows */
      }
    }
    return out;
  }
}
