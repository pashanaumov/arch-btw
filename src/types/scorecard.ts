import { z } from "zod";

export const verdictSchema = z.enum(["advance", "borderline", "not yet"]);

export const rubricRatingSchema = z.object({
  criterion: z.string(),
  rating: z.enum(["strong", "adequate", "weak", "missing"]),
  comment: z.string(),
});

export const transcriptCallbackSchema = z.object({
  turn: z.number().int().positive(),
  quote: z.string(),
  observation: z.string(),
});

export const scorecardSchema = z.object({
  verdict: verdictSchema,
  rubricRatings: z.array(rubricRatingSchema).min(1),
  transcriptCallbacks: z.array(transcriptCallbackSchema).max(3),
  summary: z.string(),
});

export type Verdict = z.infer<typeof verdictSchema>;
export type RubricRating = z.infer<typeof rubricRatingSchema>;
export type TranscriptCallback = z.infer<typeof transcriptCallbackSchema>;
export type Scorecard = z.infer<typeof scorecardSchema>;
