/**
 * Encrypted API-key store for the single-user local tool. Keys are sealed with
 * AES-256-GCM; the master key lives in a file next to the data store. Stored
 * keys are applied to process.env at engine-build time so createLlmClient picks
 * them up exactly as if they were set in the shell.
 */
import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { PROVIDER_API_KEY_ENV } from "@helm-agents/llm";

const STORE_FILE = "keys.json";
const MASTER_FILE = "master.key";

interface Sealed {
  iv: string;
  tag: string;
  ct: string;
}
type KeyMap = Record<string, Sealed>; // env var name -> sealed key

function masterKeyPath(storeDir: string): string {
  return join(storeDir, MASTER_FILE);
}

function getMasterKey(storeDir: string): Buffer {
  mkdirSync(storeDir, { recursive: true });
  const p = masterKeyPath(storeDir);
  if (existsSync(p)) {
    return Buffer.from(readFileSync(p, "utf8").trim(), "base64");
  }
  const key = randomBytes(32);
  writeFileSync(p, key.toString("base64"), { mode: 0o600 });
  return key;
}

function encrypt(key: Buffer, plaintext: string): Sealed {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const ct = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return { iv: iv.toString("base64"), tag: tag.toString("base64"), ct: ct.toString("base64") };
}

function decrypt(key: Buffer, sealed: Sealed): string {
  const decipher = createDecipheriv(
    "aes-256-gcm",
    key,
    Buffer.from(sealed.iv, "base64"),
  );
  decipher.setAuthTag(Buffer.from(sealed.tag, "base64"));
  return Buffer.concat([
    decipher.update(Buffer.from(sealed.ct, "base64")),
    decipher.final(),
  ]).toString("utf8");
}

export class KeyStore {
  private key: Buffer;
  private keys: KeyMap;
  private file: string;

  constructor(private storeDir: string) {
    this.key = getMasterKey(storeDir);
    this.file = join(storeDir, STORE_FILE);
    this.keys = existsSync(this.file)
      ? (JSON.parse(readFileSync(this.file, "utf8")) as KeyMap)
      : {};
  }

  /** Provider key status (masked — only providers that actually use a key). */
  listMasked(): Array<{ env: string; provider: string; set: boolean }> {
    return Object.entries(PROVIDER_API_KEY_ENV)
      .filter(([, env]) => env !== null)
      .map(([provider, env]) => ({
        provider,
        env: env as string,
        set: this.keys[env as string] !== undefined,
      }));
  }

  setByEnv(env: string, value: string): void {
    if (!value) {
      delete this.keys[env];
    } else {
      this.keys[env] = encrypt(this.key, value);
    }
    this.persist();
  }

  /** Apply all stored keys to process.env (idempotent, called at engine build). */
  applyToEnv(): void {
    for (const [env, sealed] of Object.entries(this.keys)) {
      process.env[env] = decrypt(this.key, sealed);
    }
  }

  /** Returns true if the provider's key is stored. */
  hasProviderKey(provider: string): boolean {
    const env = PROVIDER_API_KEY_ENV[provider];
    return env != null && this.keys[env] !== undefined;
  }

  private persist(): void {
    writeFileSync(this.file, JSON.stringify(this.keys, null, 2), { mode: 0o600 });
  }
}
