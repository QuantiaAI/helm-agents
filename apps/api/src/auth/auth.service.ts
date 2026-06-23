import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { randomUUID } from "node:crypto";
import { StoreService } from "../engine/store.service.js";
import { AUTH_CONFIG, type AuthConfig } from "./auth.config.js";
import { hashPassword, verifyPassword } from "./password.js";
import { signAccessToken, generateRefreshToken, hashRefreshToken } from "./token.js";

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}
export interface PublicUser {
  id: string;
  email: string;
}
export type AuthResult = { user: PublicUser } & AuthTokens;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Precomputed once: burned on a login miss so timing doesn't reveal whether an
// email is registered.
const DUMMY_HASH = hashPassword("timing-equalizer-placeholder");

function normEmail(email: unknown): string {
  return typeof email === "string" ? email.trim().toLowerCase() : "";
}

@Injectable()
export class AuthService {
  constructor(
    private store: StoreService,
    @Inject(AUTH_CONFIG) private cfg: AuthConfig,
  ) {}

  private issue(user: { id: string; email: string }): AuthTokens {
    const accessToken = signAccessToken(
      { sub: user.id, email: user.email },
      this.cfg.jwtSecret,
      this.cfg.accessTtlSec,
    );
    const { token, tokenHash } = generateRefreshToken();
    this.store.refreshTokens.create({
      id: "rt_" + randomUUID(),
      userId: user.id,
      tokenHash,
      expiresAt: Date.now() + this.cfg.refreshTtlSec * 1000,
      createdAt: Date.now(),
    });
    return { accessToken, refreshToken: token };
  }

  register(emailRaw: unknown, password: unknown): AuthResult {
    const email = normEmail(emailRaw);
    if (!EMAIL_RE.test(email)) throw new BadRequestException({ error: "invalid email" });
    if (typeof password !== "string" || password.length < 8) {
      throw new BadRequestException({ error: "password must be at least 8 characters" });
    }
    if (this.store.users.findByEmail(email)) {
      throw new ConflictException({ error: "email already registered" });
    }
    const user = {
      id: "usr_" + randomUUID(),
      email,
      passwordHash: hashPassword(password),
      createdAt: Date.now(),
    };
    this.store.users.create(user);
    return { user: { id: user.id, email: user.email }, ...this.issue(user) };
  }

  login(emailRaw: unknown, password: unknown): AuthResult {
    const email = normEmail(emailRaw);
    const u = this.store.users.findByEmail(email);
    if (!u || typeof password !== "string") {
      // Equalize timing whether or not the email exists (no enumeration oracle).
      verifyPassword(typeof password === "string" ? password : "", DUMMY_HASH);
      throw new UnauthorizedException({ error: "invalid email or password" });
    }
    if (!verifyPassword(password, u.passwordHash)) {
      throw new UnauthorizedException({ error: "invalid email or password" });
    }
    return { user: { id: u.id, email: u.email }, ...this.issue(u) };
  }

  refresh(refreshToken: unknown): AuthTokens {
    if (typeof refreshToken !== "string" || !refreshToken) {
      throw new UnauthorizedException({ error: "missing refresh token" });
    }
    const row = this.store.refreshTokens.findByHash(hashRefreshToken(refreshToken));
    if (!row || row.expiresAt < Date.now()) {
      throw new UnauthorizedException({ error: "invalid refresh token" });
    }
    // Reuse of an already-rotated token (or losing the atomic claim) signals a
    // possible theft → revoke every session for that user and reject.
    if (row.revoked || !this.store.refreshTokens.revokeIfActive(row.tokenHash)) {
      this.store.refreshTokens.revokeAllForUser(row.userId);
      throw new UnauthorizedException({ error: "invalid refresh token" });
    }
    const u = this.store.users.findById(row.userId);
    if (!u) throw new UnauthorizedException({ error: "invalid refresh token" });
    return this.issue(u);
  }

  logout(refreshToken: unknown): void {
    if (typeof refreshToken === "string" && refreshToken) {
      this.store.refreshTokens.revoke(hashRefreshToken(refreshToken));
    }
  }

  me(userId: string): PublicUser {
    const u = this.store.users.findById(userId);
    if (!u) throw new UnauthorizedException({ error: "user not found" });
    return { id: u.id, email: u.email };
  }
}
