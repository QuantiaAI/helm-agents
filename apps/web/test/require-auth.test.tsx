import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import type { AuthContextValue, AuthStatus } from "../src/auth/AuthContext";

// Drive the guard purely off useAuth's status.
const authValue = vi.fn<() => AuthContextValue>();
vi.mock("../src/auth/AuthContext", () => ({
  useAuth: () => authValue(),
}));

import { RequireAuth } from "../src/auth/RequireAuth";

function setStatus(status: AuthStatus) {
  authValue.mockReturnValue({
    status,
    user: status === "authed" ? { id: "u1", email: "a@b.com" } : null,
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
  });
}

function renderGuard() {
  return render(
    <MemoryRouter initialEntries={["/en/settings"]}>
      <Routes>
        <Route path="/:locale" element={<RequireAuth />}>
          <Route path="settings" element={<div>protected page</div>} />
        </Route>
        <Route path="/:locale/login" element={<div>login page</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("RequireAuth", () => {
  it("redirects to /:locale/login when anon", () => {
    setStatus("anon");
    renderGuard();
    expect(screen.getByText("login page")).toBeInTheDocument();
    expect(screen.queryByText("protected page")).not.toBeInTheDocument();
  });

  it("renders the protected route when authed", () => {
    setStatus("authed");
    renderGuard();
    expect(screen.getByText("protected page")).toBeInTheDocument();
  });

  it("shows a loading state while resolving the session", () => {
    setStatus("loading");
    renderGuard();
    expect(screen.queryByText("protected page")).not.toBeInTheDocument();
    expect(screen.queryByText("login page")).not.toBeInTheDocument();
  });
});
