import { describe, it, expect } from "vitest";

// Mock server-only so the import doesn't fail in test environment
vi.mock("server-only", () => ({}));

import { vi } from "vitest";

describe("seed problems", () => {
  it("url-shortener has required fields", async () => {
    const { urlShortener } = await import("@/problems/index");
    expect(urlShortener.id).toBe("url-shortener");
    expect(urlShortener.difficulty).toBe("easy");
    expect(urlShortener.rubric.length).toBeGreaterThan(0);
    expect(urlShortener.clarificationFacts.length).toBeGreaterThan(0);
    expect(urlShortener.referenceDesign).toBeTruthy();
  });

  it("all problems in ALL_PROBLEMS have unique ids", async () => {
    const { ALL_PROBLEMS } = await import("@/problems/index");
    const ids = ALL_PROBLEMS.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
