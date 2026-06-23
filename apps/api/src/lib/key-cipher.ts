/**
 * AES-256-GCM string sealer. The master key lives next to the data store; each
 * ciphertext is a self-contained JSON blob (iv/tag/ct). Used to encrypt per-user
 * API keys at rest.
 */
import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

export class KeyCipher {
  private key: Buffer;

  constructor(storeDir: string) {
    mkdirSync(storeDir, { recursive: true });
    const p = join(storeDir, "master.key");
    if (existsSync(p)) {
      this.key = Buffer.from(readFileSync(p, "utf8").trim(), "base64");
    } else {
      this.key = randomBytes(32);
      writeFileSync(p, this.key.toString("base64"), { mode: 0o600 });
    }
  }

  encrypt(plaintext: string): string {
    const iv = randomBytes(12);
    const cipher = createCipheriv("aes-256-gcm", this.key, iv);
    const ct = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
    return JSON.stringify({
      iv: iv.toString("base64"),
      tag: cipher.getAuthTag().toString("base64"),
      ct: ct.toString("base64"),
    });
  }

  decrypt(blob: string): string {
    const { iv, tag, ct } = JSON.parse(blob) as { iv: string; tag: string; ct: string };
    const d = createDecipheriv("aes-256-gcm", this.key, Buffer.from(iv, "base64"));
    d.setAuthTag(Buffer.from(tag, "base64"));
    return Buffer.concat([d.update(Buffer.from(ct, "base64")), d.final()]).toString("utf8");
  }
}
