/** Password hashing with node:crypto scrypt (zero native deps). */
import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

const KEYLEN = 64;
const COST = 16384; // scrypt N; 128*N*r*p ≈ 16MB < default 32MB maxmem

/** Returns `scrypt$<saltHex>$<hashHex>`. */
export function hashPassword(plain: string): string {
  const salt = randomBytes(16);
  const dk = scryptSync(plain, salt, KEYLEN, { N: COST });
  return `scrypt$${salt.toString("hex")}$${dk.toString("hex")}`;
}

export function verifyPassword(plain: string, stored: string): boolean {
  const parts = stored.split("$");
  if (parts.length !== 3 || parts[0] !== "scrypt") return false;
  const [, saltHex, hashHex] = parts as [string, string, string];
  const salt = Buffer.from(saltHex, "hex");
  const expected = Buffer.from(hashHex, "hex");
  if (expected.length === 0) return false;
  const dk = scryptSync(plain, salt, expected.length, { N: COST });
  return dk.length === expected.length && timingSafeEqual(dk, expected);
}
