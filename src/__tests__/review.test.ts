import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("server-only", () => ({}));
vi.mock("next/headers", () => ({ headers: vi.fn(() => new Headers()) }));
vi.mock("better-auth", () => ({
  betterAuth: vi.fn(() => ({ api: { getSession: vi.fn() }, $Infer: {} })),
}));
vi.mock("better-auth/adapters/drizzle", () => ({ drizzleAdapter: vi.fn() }));
vi.mock("@/db", () => ({ db: {} }));
vi.mock("@/db/schema", () => ({
  user: {}, session: {}, account: {}, verification: {}, attempt: {},
}));
vi.mock("@ai-sdk/google", () => ({
  createGoogleGenerativeAI: vi.fn(() => vi.fn(() => ({}))),
}));
vi.mock("@ai-sdk/anthropic", () => ({
  createAnthropic: vi.fn(() => vi.fn(() => ({}))),
}));
vi.mock("@ai-sdk/openai", () => ({
  createOpenAI: vi.fn(() => vi.fn(() => ({}))),
}));
vi.mock("@/lib/auth", () => ({
  auth: { api: { getSession: vi.fn() } },
}));
vi.mock("@/lib/llm", () => ({ getProvider: vi.fn(() => ({})) }));

const mockStream = {
  toTextStreamResponse: vi.fn(() => new Response("streamed", { status: 200 })),
};
vi.mock("ai", () => ({
  streamText: vi.fn(() => mockStream),
  generateObject: vi.fn(),
}));

import { POST } from "@/app/api/review/route";
import { auth } from "@/lib/auth";
import { streamText } from "ai";

const validBody = {
  problemId: "url-shortener",
  graphJson: { nodes: [{ id: "n1", type: "service", label: "API", explanation: "" }], edges: [], notes: "" },
  transcript: [],
  reply: "",
};

describe("POST /api/review", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.GEMINI_API_KEY = "test-key";
    vi.mocked(streamText).mockReturnValue(mockStream as never);
  });

  it("returns 401 when unauthenticated", async () => {
    vi.mocked(auth.api.getSession).mockResolvedValueOnce(null);
    const req = new Request("http://localhost/api/review", {
      method: "POST",
      body: JSON.stringify(validBody),
      headers: { "Content-Type": "application/json" },
    });
    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it("returns 400 when body is missing problemId", async () => {
    vi.mocked(auth.api.getSession).mockResolvedValueOnce({ user: { id: "u1" } } as never);
    const req = new Request("http://localhost/api/review", {
      method: "POST",
      body: JSON.stringify({ graphJson: validBody.graphJson, transcript: [] }),
      headers: { "Content-Type": "application/json" },
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("returns 400 on malformed JSON", async () => {
    vi.mocked(auth.api.getSession).mockResolvedValueOnce({ user: { id: "u1" } } as never);
    const req = new Request("http://localhost/api/review", {
      method: "POST",
      body: "not-json",
      headers: { "Content-Type": "application/json" },
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("returns 403 when turn count >= hard cap (10)", async () => {
    vi.mocked(auth.api.getSession).mockResolvedValueOnce({ user: { id: "u1" } } as never);
    const transcript = Array(10).fill({ role: "assistant", content: "q" });
    const req = new Request("http://localhost/api/review", {
      method: "POST",
      body: JSON.stringify({ ...validBody, transcript }),
      headers: { "Content-Type": "application/json" },
    });
    const res = await POST(req);
    expect(res.status).toBe(403);
  });

  it("returns 200 stream for valid authenticated request", async () => {
    vi.mocked(auth.api.getSession).mockResolvedValueOnce({ user: { id: "u1" } } as never);
    const req = new Request("http://localhost/api/review", {
      method: "POST",
      body: JSON.stringify(validBody),
      headers: { "Content-Type": "application/json" },
    });
    const res = await POST(req);
    expect(res.status).toBe(200);
  });

  it("system prompt includes rubric for the problem", async () => {
    vi.mocked(auth.api.getSession).mockResolvedValueOnce({ user: { id: "u1" } } as never);
    const req = new Request("http://localhost/api/review", {
      method: "POST",
      body: JSON.stringify(validBody),
      headers: { "Content-Type": "application/json" },
    });
    await POST(req);
    const call = vi.mocked(streamText).mock.calls[0][0];
    expect(call.system).toContain("RUBRIC");
    expect(call.system).toContain("read-heavy");
  });

  it("graphJson is included in the user turn", async () => {
    vi.mocked(auth.api.getSession).mockResolvedValueOnce({ user: { id: "u1" } } as never);
    const req = new Request("http://localhost/api/review", {
      method: "POST",
      body: JSON.stringify(validBody),
      headers: { "Content-Type": "application/json" },
    });
    await POST(req);
    const call = vi.mocked(streamText).mock.calls[0][0];
    const messages = call.messages as { role: string; content: string }[];
    const lastUser = messages.findLast((m) => m.role === "user");
    expect(lastUser?.content).toContain("service");
  });

  it("soft wind-down cue appears at turn 5+", async () => {
    vi.mocked(auth.api.getSession).mockResolvedValueOnce({ user: { id: "u1" } } as never);
    const transcript = Array(5).fill({ role: "assistant", content: "q" });
    const req = new Request("http://localhost/api/review", {
      method: "POST",
      body: JSON.stringify({ ...validBody, transcript }),
      headers: { "Content-Type": "application/json" },
    });
    await POST(req);
    const call = vi.mocked(streamText).mock.calls[0][0];
    expect(call.system).toContain("approaching the end");
  });
});
