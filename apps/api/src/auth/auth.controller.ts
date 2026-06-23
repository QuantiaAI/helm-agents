import { Body, Controller, Get, HttpCode, Inject, Post, Req, Res } from "@nestjs/common";
import type { Request, Response } from "express";
import { AuthService } from "./auth.service.js";
import { Public } from "./public.decorator.js";
import { CurrentUser, type AuthUser } from "./current-user.decorator.js";
import { AUTH_CONFIG, type AuthConfig } from "./auth.config.js";

const COOKIE = "ta_refresh";
const COOKIE_PATH = "/api/auth";

function readCookie(req: Request, name: string): string | undefined {
  const header = req.headers.cookie;
  if (!header) return undefined;
  for (const part of header.split(";")) {
    const eq = part.indexOf("=");
    if (eq === -1) continue;
    if (part.slice(0, eq).trim() === name) return decodeURIComponent(part.slice(eq + 1).trim());
  }
  return undefined;
}

@Controller("auth")
export class AuthController {
  constructor(
    private auth: AuthService,
    @Inject(AUTH_CONFIG) private cfg: AuthConfig,
  ) {}

  private setRefreshCookie(res: Response, token: string) {
    res.cookie(COOKIE, token, {
      httpOnly: true,
      secure: this.cfg.cookieSecure,
      sameSite: "lax",
      maxAge: this.cfg.refreshTtlSec * 1000,
      path: COOKIE_PATH,
    });
  }

  @Public()
  @Post("register")
  @HttpCode(200)
  register(@Body() body: { email?: string; password?: string }, @Res({ passthrough: true }) res: Response) {
    const r = this.auth.register(body?.email, body?.password);
    this.setRefreshCookie(res, r.refreshToken);
    return { user: r.user, accessToken: r.accessToken, refreshToken: r.refreshToken };
  }

  @Public()
  @Post("login")
  @HttpCode(200)
  login(@Body() body: { email?: string; password?: string }, @Res({ passthrough: true }) res: Response) {
    const r = this.auth.login(body?.email, body?.password);
    this.setRefreshCookie(res, r.refreshToken);
    return { user: r.user, accessToken: r.accessToken, refreshToken: r.refreshToken };
  }

  @Public()
  @Post("refresh")
  @HttpCode(200)
  refresh(@Req() req: Request, @Body() body: { refreshToken?: string }, @Res({ passthrough: true }) res: Response) {
    const rt = body?.refreshToken ?? readCookie(req, COOKIE);
    const r = this.auth.refresh(rt);
    this.setRefreshCookie(res, r.refreshToken);
    return { accessToken: r.accessToken, refreshToken: r.refreshToken };
  }

  @Public()
  @Post("logout")
  @HttpCode(200)
  logout(@Req() req: Request, @Body() body: { refreshToken?: string }, @Res({ passthrough: true }) res: Response) {
    this.auth.logout(body?.refreshToken ?? readCookie(req, COOKIE));
    res.clearCookie(COOKIE, { path: COOKIE_PATH });
    return { ok: true };
  }

  @Get("me")
  me(@CurrentUser() user: AuthUser) {
    return this.auth.me(user.id);
  }
}
