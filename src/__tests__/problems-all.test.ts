import { describe, it, expect, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { POST } from "@/app/api/clarify/route";

describe("POST /api/clarify", () => {
  it("returns 400 when body is missing question", async () => {
    const req = new Request("http://localhost/api/clarify", {
      method: "POST",
      body: JSON.stringify({ problemId: "url-shortener" }),
      headers: { "Content-Type": "application/json" },
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("returns 404 for unknown problem", async () => {
    const req = new Request("http://localhost/api/clarify", {
      method: "POST",
      body: JSON.stringify({ problemId: "nonexistent", question: "what scale?" }),
      headers: { "Content-Type": "application/json" },
    });
    const res = await POST(req);
    expect(res.status).toBe(404);
  });

  it("returns a canned answer for a matching question", async () => {
    const req = new Request("http://localhost/api/clarify", {
      method: "POST",
      body: JSON.stringify({ problemId: "url-shortener", question: "How many URLs shortened per day?" }),
      headers: { "Content-Type": "application/json" },
    });
    const res = await POST(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.answer).toBeTruthy();
    expect(typeof json.answer).toBe("string");
  });

  it("returns a fallback answer for unrecognized question", async () => {
    const req = new Request("http://localhost/api/clarify", {
      method: "POST",
      body: JSON.stringify({ problemId: "url-shortener", question: "What is the meaning of life?" }),
      headers: { "Content-Type": "application/json" },
    });
    const res = await POST(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.answer).toBeTruthy();
  });
});

describe("seed problems — all 6", () => {
  it("ALL_PROBLEMS has exactly 6 problems", async () => {
    const { ALL_PROBLEMS } = await import("@/problems/index");
    expect(ALL_PROBLEMS).toHaveLength(6);
  });

  it("all problems have unique ids", async () => {
    const { ALL_PROBLEMS } = await import("@/problems/index");
    const ids = ALL_PROBLEMS.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("difficulty distribution: 2 easy, 2 medium, 2 hard", async () => {
    const { ALL_PROBLEMS } = await import("@/problems/index");
    const counts = { easy: 0, medium: 0, hard: 0 };
    for (const p of ALL_PROBLEMS) counts[p.difficulty]++;
    expect(counts.easy).toBe(2);
    expect(counts.medium).toBe(2);
    expect(counts.hard).toBe(2);
  });

  it("every problem has rubric, clarificationFacts, and referenceDesign", async () => {
    const { ALL_PROBLEMS } = await import("@/problems/index");
    for (const p of ALL_PROBLEMS) {
      expect(p.rubric.length).toBeGreaterThan(0);
      expect(p.clarificationFacts.length).toBeGreaterThan(0);
      expect(p.referenceDesign.length).toBeGreaterThan(0);
    }
  });
});
