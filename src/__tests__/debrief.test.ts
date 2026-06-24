import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("server-only", () => ({}));
vi.mock("next/headers", () => ({ headers: vi.fn(() => new Headers()) }));
vi.mock("better-auth", () => ({
  betterAuth: vi.fn(() => ({ api: { getSession: vi.fn() }, $Infer: {} })),
}));
vi.mock("better-auth/adapters/drizzle", () => ({ drizzleAdapter: vi.fn() }));
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

const validScorecard = {
  verdict: "advance",
  rubricRatings: [{ criterion: "Scalability", rating: "strong", comment: "Good" }],
  transcriptCallbacks: [],
  summary: "Nice work.",
};

vi.mock("ai", () => ({
  streamText: vi.fn(),
  generateObject: vi.fn(() => Promise.resolve({ object: validScorecard })),
}));

const mockValues = vi.fn().mockResolvedValue(undefined);
vi.mock("@/db", () => ({
  db: { insert: vi.fn(() => ({ values: mockValues })) },
}));

import { POST } from "@/app/api/debrief/route";
import { auth } from "@/lib/auth";
import { generateObject } from "ai";
import { db } from "@/db";

const validBody = {
  problemId: "url-shortener",
  tlDrawSnapshot: null,
  graphJson: { nodes: [], edges: [], notes: "" },
  transcript: [{ role: "user", content: "Here is my design" }],
};

describe("POST /api/debrief", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.GEMINI_API_KEY = "test-key";
    vi.mocked(generateObject).mockResolvedValue({ object: validScorecard } as never);
    mockValues.mockResolvedValue(undefined);
    vi.mocked(db.insert).mockReturnValue({ values: mockValues } as never);
  });

  it("returns 401 when unauthenticated", async () => {
    vi.mocked(auth.api.getSession).mockResolvedValueOnce(null);
    const req = new Request("http://localhost/api/debrief", {
      method: "POST",
      body: JSON.stringify(validBody),
      headers: { "Content-Type": "application/json" },
    });
    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it("returns 400 when body is missing required fields", async () => {
    vi.mocked(auth.api.getSession).mockResolvedValueOnce({ user: { id: "u1" } } as never);
    const req = new Request("http://localhost/api/debrief", {
      method: "POST",
      body: JSON.stringify({ problemId: "url-shortener" }),
      headers: { "Content-Type": "application/json" },
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("returns 200 with scorecard and referenceDesign on success", async () => {
    vi.mocked(auth.api.getSession).mockResolvedValueOnce({ user: { id: "u1" } } as never);
    const req = new Request("http://localhost/api/debrief", {
      method: "POST",
      body: JSON.stringify(validBody),
      headers: { "Content-Type": "application/json" },
    });
    const res = await POST(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.scorecard.verdict).toBe("advance");
    expect(json.referenceDesign).toBeTruthy();
  });

  it("scorecard satisfies the Zod schema", async () => {
    const { scorecardSchema } = await import("@/types/scorecard");
    expect(() => scorecardSchema.parse(validScorecard)).not.toThrow();
  });

  it("calls db.insert once with required columns", async () => {
    vi.mocked(auth.api.getSession).mockResolvedValueOnce({ user: { id: "u1" } } as never);
    const req = new Request("http://localhost/api/debrief", {
      method: "POST",
      body: JSON.stringify(validBody),
      headers: { "Content-Type": "application/json" },
    });
    await POST(req);
    expect(db.insert).toHaveBeenCalledOnce();
    expect(mockValues).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: "u1",
        problemId: "url-shortener",
        verdict: "advance",
      })
    );
  });

  it("returns 500 when generateObject throws", async () => {
    vi.mocked(generateObject).mockRejectedValueOnce(new Error("LLM error"));
    vi.mocked(auth.api.getSession).mockResolvedValueOnce({ user: { id: "u1" } } as never);
    const req = new Request("http://localhost/api/debrief", {
      method: "POST",
      body: JSON.stringify(validBody),
      headers: { "Content-Type": "application/json" },
    });
    const res = await POST(req);
    expect(res.status).toBe(500);
  });

  it("returns 500 when db.insert throws", async () => {
    mockValues.mockRejectedValueOnce(new Error("DB error"));
    vi.mocked(auth.api.getSession).mockResolvedValueOnce({ user: { id: "u1" } } as never);
    const req = new Request("http://localhost/api/debrief", {
      method: "POST",
      body: JSON.stringify(validBody),
      headers: { "Content-Type": "application/json" },
    });
    const res = await POST(req);
    expect(res.status).toBe(500);
  });
});
