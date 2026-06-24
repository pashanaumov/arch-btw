import "server-only";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createAnthropic } from "@ai-sdk/anthropic";
import { createOpenAI } from "@ai-sdk/openai";
import type { LanguageModel } from "ai";

/**
 * Returns a language model instance based on which API key is present.
 * Priority: Gemini > Anthropic > OpenAI
 * Throws if no key is set or all keys are empty strings.
 */
export function getProvider(): LanguageModel {
  const geminiKey = process.env.GEMINI_API_KEY;
  const anthropicKey = process.env.ANTHROPIC_API_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;

  if (geminiKey) {
    const google = createGoogleGenerativeAI({ apiKey: geminiKey });
    return google("gemini-2.5-pro");
  }

  if (anthropicKey) {
    const anthropic = createAnthropic({ apiKey: anthropicKey });
    return anthropic("claude-3-7-sonnet-20250219");
  }

  if (openaiKey) {
    const openai = createOpenAI({ apiKey: openaiKey });
    return openai("o3");
  }

  throw new Error(
    "No LLM API key configured. Set GEMINI_API_KEY, ANTHROPIC_API_KEY, or OPENAI_API_KEY."
  );
}
