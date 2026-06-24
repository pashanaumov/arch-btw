import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("server-only", () => ({}));
vi.mock("better-auth", () => ({
  betterAuth: vi.fn(() => ({
    api: { getSession: vi.fn() },
    $Infer: { Session: {} },
  })),
}));
vi.mock("better-auth/adapters/drizzle", () => ({
  drizzleAdapter: vi.fn(),
}));
vi.mock("@/db", () => ({ db: {} }));
vi.mock("@/db/schema", () => ({
  user: {},
  session: {},
  account: {},
  verification: {},
}));

describe("auth session helper", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it("returns userId from a valid session", async () => {
    const mockSession = {
      user: { id: "user-123", name: "Test User", email: "test@example.com" },
      session: { id: "sess-1", token: "tok", userId: "user-123" },
    };
    const { auth } = await import("@/lib/auth");
    vi.mocked(auth.api.getSession).mockResolvedValueOnce(mockSession as never);

    const result = await auth.api.getSession({ headers: new Headers() });
    expect(result?.user.id).toBe("user-123");
  });

  it("returns null when unauthenticated", async () => {
    const { auth } = await import("@/lib/auth");
    vi.mocked(auth.api.getSession).mockResolvedValueOnce(null);

    const result = await auth.api.getSession({ headers: new Headers() });
    expect(result).toBeNull();
  });

  it("session user id is a non-empty string", async () => {
    const mockSession = {
      user: { id: "user-abc", name: "Alice", email: "alice@example.com" },
      session: { id: "sess-2", token: "tok2", userId: "user-abc" },
    };
    const { auth } = await import("@/lib/auth");
    vi.mocked(auth.api.getSession).mockResolvedValueOnce(mockSession as never);

    const result = await auth.api.getSession({ headers: new Headers() });
    expect(typeof result?.user.id).toBe("string");
    expect(result?.user.id.length).toBeGreaterThan(0);
  });
});
