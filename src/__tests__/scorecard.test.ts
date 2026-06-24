import { describe, it, expect } from "vitest";
import { scorecardSchema } from "@/types/scorecard";

const validScorecard = {
  verdict: "advance" as const,
  rubricRatings: [
    { criterion: "Scalability", rating: "strong" as const, comment: "Good reasoning" },
  ],
  transcriptCallbacks: [
    { turn: 1, quote: "I'd use Redis", observation: "Good instinct for caching" },
  ],
  summary: "Solid design with clear trade-off reasoning.",
};

describe("scorecardSchema", () => {
  it("accepts a valid scorecard", () => {
    expect(() => scorecardSchema.parse(validScorecard)).not.toThrow();
  });

  it("throws when verdict is missing", () => {
    const { verdict: _verdict, ...noVerdict } = validScorecard;
    expect(() => scorecardSchema.parse(noVerdict)).toThrow();
  });

  it("throws when verdict is an unknown value", () => {
    expect(() =>
      scorecardSchema.parse({ ...validScorecard, verdict: "maybe" })
    ).toThrow();
  });

  it("throws when rubricRatings is empty", () => {
    expect(() =>
      scorecardSchema.parse({ ...validScorecard, rubricRatings: [] })
    ).toThrow();
  });

  it("accepts all three verdict values", () => {
    for (const v of ["advance", "borderline", "not yet"] as const) {
      expect(() => scorecardSchema.parse({ ...validScorecard, verdict: v })).not.toThrow();
    }
  });
});
