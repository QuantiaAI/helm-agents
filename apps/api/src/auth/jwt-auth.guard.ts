import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { IS_PUBLIC } from "./public.decorator.js";
import { AUTH_CONFIG, type AuthConfig } from "./auth.config.js";
import { verifyAccessToken } from "./token.js";

/** Global guard: requires a valid Bearer access token unless @Public(). */
@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    @Inject(AUTH_CONFIG) private cfg: AuthConfig,
  ) {}

  canActivate(ctx: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC, [
      ctx.getHandler(),
      ctx.getClass(),
    ]);
    if (isPublic) return true;

    const req = ctx.switchToHttp().getRequest();
    const header = req.headers["authorization"];
    const token =
      typeof header === "string" && header.startsWith("Bearer ") ? header.slice(7) : null;
    const claims = token ? verifyAccessToken(token, this.cfg.jwtSecret) : null;
    if (!claims) throw new UnauthorizedException({ error: "authentication required" });
    req.user = { id: claims.sub, email: claims.email };
    return true;
  }
}
