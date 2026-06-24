import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

vi.mock("server-only", () => ({}));

// Mock AI SDK provider factories
vi.mock("@ai-sdk/google", () => ({
  createGoogleGenerativeAI: vi.fn(() => vi.fn((model: string) => ({ provider: "google", model }))),
}));
vi.mock("@ai-sdk/anthropic", () => ({
  createAnthropic: vi.fn(() => vi.fn((model: string) => ({ provider: "anthropic", model }))),
}));
vi.mock("@ai-sdk/openai", () => ({
  createOpenAI: vi.fn(() => vi.fn((model: string) => ({ provider: "openai", model }))),
}));

describe("getProvider", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    vi.resetModules();
    // Clear all LLM keys before each test
    delete process.env.GEMINI_API_KEY;
    delete process.env.ANTHROPIC_API_KEY;
    delete process.env.OPENAI_API_KEY;
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it("returns Gemini model when GEMINI_API_KEY is set", async () => {
    process.env.GEMINI_API_KEY = "gkey-123";
    const { getProvider } = await import("@/lib/llm");
    const model = getProvider() as { provider: string };
    expect(model.provider).toBe("google");
  });

  it("returns Anthropic model when ANTHROPIC_API_KEY is set", async () => {
    process.env.ANTHROPIC_API_KEY = "akey-123";
    const { getProvider } = await import("@/lib/llm");
    const model = getProvider() as { provider: string };
    expect(model.provider).toBe("anthropic");
  });

  it("returns OpenAI model when OPENAI_API_KEY is set", async () => {
    process.env.OPENAI_API_KEY = "okey-123";
    const { getProvider } = await import("@/lib/llm");
    const model = getProvider() as { provider: string };
    expect(model.provider).toBe("openai");
  });

  it("prefers Gemini over Anthropic when both keys are set", async () => {
    process.env.GEMINI_API_KEY = "gkey-123";
    process.env.ANTHROPIC_API_KEY = "akey-123";
    const { getProvider } = await import("@/lib/llm");
    const model = getProvider() as { provider: string };
    expect(model.provider).toBe("google");
  });

  it("prefers Anthropic over OpenAI when Gemini is absent", async () => {
    process.env.ANTHROPIC_API_KEY = "akey-123";
    process.env.OPENAI_API_KEY = "okey-123";
    const { getProvider } = await import("@/lib/llm");
    const model = getProvider() as { provider: string };
    expect(model.provider).toBe("anthropic");
  });

  it("throws a clear error when no key is set", async () => {
    const { getProvider } = await import("@/lib/llm");
    expect(() => getProvider()).toThrow(/No LLM API key configured/);
  });

  it("treats empty string as not set", async () => {
    process.env.GEMINI_API_KEY = "";
    process.env.ANTHROPIC_API_KEY = "";
    process.env.OPENAI_API_KEY = "";
    const { getProvider } = await import("@/lib/llm");
    expect(() => getProvider()).toThrow(/No LLM API key configured/);
  });
});
