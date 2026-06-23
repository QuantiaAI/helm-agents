import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

// Mock the api client: AuthContext only talks to the server through these.
const authRequest = vi.fn();
const apiGet = vi.fn();
const tryRefresh = vi.fn();
const setAccessToken = vi.fn();

vi.mock("@/api/client", () => ({
  authRequest: (...a: unknown[]) => authRequest(...a),
  apiGet: (...a: unknown[]) => apiGet(...a),
  tryRefresh: (...a: unknown[]) => tryRefresh(...a),
  setAccessToken: (...a: unknown[]) => setAccessToken(...a),
}));

import { AuthProvider, useAuth } from "../src/auth/AuthContext";

function Probe() {
  const { status, user, login, logout } = useAuth();
  return (
    <div>
      <span data-testid="status">{status}</span>
      <span data-testid="email">{user?.email ?? ""}</span>
      <button onClick={() => void login("a@b.com", "password123")}>login</button>
      <button onClick={() => void logout()}>logout</button>
    </div>
  );
}

function renderProvider() {
  return render(
    <AuthProvider>
      <Probe />
    </AuthProvider>,
  );
}

beforeEach(() => {
  authRequest.mockReset();
  apiGet.mockReset();
  tryRefresh.mockReset();
  setAccessToken.mockReset();
});

describe("AuthContext", () => {
  it("starts anon when there is no resumable session", async () => {
    tryRefresh.mockResolvedValue(false);
    renderProvider();
    await waitFor(() =>
      expect(screen.getByTestId("status")).toHaveTextContent("anon"),
    );
  });

  it("resumes an authed session via refresh + me on mount", async () => {
    tryRefresh.mockResolvedValue(true);
    apiGet.mockResolvedValue({ id: "u1", email: "me@x.com" });
    renderProvider();
    await waitFor(() =>
      expect(screen.getByTestId("status")).toHaveTextContent("authed"),
    );
    expect(screen.getByTestId("email")).toHaveTextContent("me@x.com");
    expect(apiGet).toHaveBeenCalledWith("/auth/me");
  });

  it("login sets status authed + user", async () => {
    tryRefresh.mockResolvedValue(false);
    authRequest.mockResolvedValue({
      user: { id: "u1", email: "a@b.com" },
      accessToken: "tok",
      refreshToken: "r",
    });
    renderProvider();
    await waitFor(() =>
      expect(screen.getByTestId("status")).toHaveTextContent("anon"),
    );

    await userEvent.click(screen.getByText("login"));

    await waitFor(() =>
      expect(screen.getByTestId("status")).toHaveTextContent("authed"),
    );
    expect(screen.getByTestId("email")).toHaveTextContent("a@b.com");
    expect(setAccessToken).toHaveBeenCalledWith("tok");
    expect(authRequest).toHaveBeenCalledWith("/auth/login", {
      email: "a@b.com",
      password: "password123",
    });
  });

  it("logout resets to anon and clears the token", async () => {
    tryRefresh.mockResolvedValue(true);
    apiGet.mockResolvedValue({ id: "u1", email: "me@x.com" });
    authRequest.mockResolvedValue({ ok: true });
    renderProvider();
    await waitFor(() =>
      expect(screen.getByTestId("status")).toHaveTextContent("authed"),
    );

    await userEvent.click(screen.getByText("logout"));

    await waitFor(() =>
      expect(screen.getByTestId("status")).toHaveTextContent("anon"),
    );
    expect(screen.getByTestId("email")).toHaveTextContent("");
    expect(setAccessToken).toHaveBeenCalledWith(null);
    expect(authRequest).toHaveBeenCalledWith("/auth/logout");
  });
});
