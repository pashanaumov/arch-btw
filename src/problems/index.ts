import "server-only";
import type { Problem } from "@/types/problem";
import { ADDITIONAL_PROBLEMS } from "./additional";

export const urlShortener: Problem = {
  id: "url-shortener",
  title: "Design a URL Shortener",
  difficulty: "easy",
  tags: ["storage", "hashing", "scale"],
  prompt:
    "Design a service that takes a long URL and returns a short one (e.g. short.ly/abc123). " +
    "Users can then use the short URL to be redirected to the original.",
  clarificationFacts: [
    {
      question: "How many URLs need to be shortened per day?",
      answer: "~10 million writes/day, ~1 billion reads/day (read-heavy).",
    },
    {
      question: "How long should short URLs be kept?",
      answer: "Indefinitely — no expiry unless the user deletes them.",
    },
    {
      question: "Do we need custom aliases?",
      answer: "Nice to have, but not required for v1.",
    },
    {
      question: "Does order matter / should shortened URLs be sequential?",
      answer: "No, random short codes are fine.",
    },
  ],
  rubric: [
    "Identifies read-heavy traffic and designs accordingly (e.g. caching layer)",
    "Explains short-code generation (hash + collision handling, or base62 counter)",
    "Discusses storage: what goes in the DB, estimated data size",
    "Handles redirection (HTTP 301 vs 302 and the caching implications)",
    "Considers availability: what happens if the redirect service goes down",
    "Mentions rate limiting / abuse prevention at some point",
  ],
  referenceDesign:
    "A strong approach: API Gateway → App servers → KV store (Redis) for hot URLs + SQL DB for durable storage. " +
    "Short codes generated via base62(atomic_counter) or MD5(long_url)[0:7] with collision retry. " +
    "Redirect service is stateless and sits behind a CDN — 301 for permanent redirects (CDN cacheable), " +
    "302 if analytics are needed. Write path: app server writes to DB, invalidates cache. " +
    "Read path: check Redis first, fall back to DB, repopulate cache.",
};

export const ALL_PROBLEMS: Problem[] = [urlShortener, ...ADDITIONAL_PROBLEMS];
