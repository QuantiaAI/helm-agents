import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type {
  AuthResponse,
  MeResponse,
  PublicUser,
} from "@helm-agents/contracts";
import {
  apiGet,
  authRequest,
  setAccessToken,
  tryRefresh,
} from "@/api/client";

export type AuthStatus = "loading" | "authed" | "anon";

export interface AuthContextValue {
  user: PublicUser | null;
  status: AuthStatus;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<PublicUser | null>(null);
  const [status, setStatus] = useState<AuthStatus>("loading");

  // On mount: try to resume an existing session via the refresh cookie.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const ok = await tryRefresh();
      if (cancelled) return;
      if (!ok) {
        setStatus("anon");
        return;
      }
      try {
        const me = await apiGet<MeResponse>("/auth/me");
        if (cancelled) return;
        setUser(me);
        setStatus("authed");
      } catch {
        if (cancelled) return;
        setAccessToken(null);
        setStatus("anon");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  async function authenticate(path: string, email: string, password: string) {
    const res = await authRequest<AuthResponse>(path, { email, password });
    setAccessToken(res.accessToken);
    setUser(res.user);
    setStatus("authed");
  }

  const login = (email: string, password: string) =>
    authenticate("/auth/login", email, password);

  const register = (email: string, password: string) =>
    authenticate("/auth/register", email, password);

  async function logout() {
    try {
      await authRequest("/auth/logout");
    } finally {
      setAccessToken(null);
      setUser(null);
      setStatus("anon");
    }
  }

  return (
    <AuthContext.Provider value={{ user, status, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// Safe fallback when a consumer renders outside <AuthProvider> (e.g. component
// tests that mount a page or Layout in isolation). Treated as anonymous; the
// real provider always wins in the running app.
const ANON_FALLBACK: AuthContextValue = {
  user: null,
  status: "anon",
  login: async () => undefined,
  register: async () => undefined,
  logout: async () => undefined,
};

export function useAuth(): AuthContextValue {
  return useContext(AuthContext) ?? ANON_FALLBACK;
}
