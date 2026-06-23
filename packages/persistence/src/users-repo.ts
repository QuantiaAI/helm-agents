/** Repository for application users (one row per account). */
import type { Db } from "./sqlite.js";

export interface UserRow {
  id: string;
  email: string;
  passwordHash: string;
  createdAt: number;
}

export class UsersRepo {
  constructor(private db: Db) {}

  /** Insert a user. Email is stored lower-cased; throws on duplicate email. */
  create(u: UserRow): void {
    this.db
      .prepare(`INSERT INTO users (id, email, passwordHash, createdAt) VALUES (?, ?, ?, ?)`)
      .run(u.id, u.email.toLowerCase(), u.passwordHash, u.createdAt);
  }

  findByEmail(email: string): UserRow | undefined {
    return this.db
      .prepare(`SELECT * FROM users WHERE email = ?`)
      .get(email.toLowerCase()) as UserRow | undefined;
  }

  findById(id: string): UserRow | undefined {
    return this.db.prepare(`SELECT * FROM users WHERE id = ?`).get(id) as UserRow | undefined;
  }

  count(): number {
    const r = this.db.prepare(`SELECT COUNT(*) AS c FROM users`).get() as { c: number };
    return r.c;
  }
}
