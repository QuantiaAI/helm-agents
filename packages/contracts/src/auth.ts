// Auth HTTP contract types shared by apps/api, apps/web, and a future native app.

export interface PublicUser {
  id: string;
  email: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
}
export type LoginRequest = RegisterRequest;

/** Response of register/login. `refreshToken` is for non-browser clients (the
 *  web app receives it as an httpOnly cookie and can ignore this field). */
export interface AuthResponse {
  user: PublicUser;
  accessToken: string;
  refreshToken: string;
}

/** Response of `POST /api/auth/refresh`. */
export interface RefreshResponse {
  accessToken: string;
  refreshToken: string;
}

/** Response of `GET /api/auth/me`. */
export type MeResponse = PublicUser;
