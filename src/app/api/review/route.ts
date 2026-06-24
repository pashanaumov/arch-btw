import { streamText } from "ai";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { getProvider } from "@/lib/llm";
import { ALL_PROBLEMS } from "@/problems/index";
import type { DesignGraph } from "@/lib/serialize";

export const runtime = "edge";

const HARD_CAP = 10;
const SOFT_WIND_DOWN_START = 5;

type TranscriptTurn = { role: "user" | "assistant"; content: string };

type ReviewRequest = {
  problemId: string;
  graphJson: DesignGraph;
  transcript: TranscriptTurn[];
  reply?: string;
};

function buildSystemPrompt(problem: (typeof ALL_PROBLEMS)[0]) {
  return `You are a senior engineer at a London startup acting as a technical interviewer.
Your style is direct, thoughtful, and practical — NOT algorithmic FAANG trivia.
You judge HOW the candidate thinks and justifies their choices, not blueprint-matching.

PROBLEM: ${problem.title}
PROMPT: ${problem.prompt}

HIDDEN RUBRIC (do NOT reveal these criteria directly — use them to ground your critique):
${problem.rubric.map((r, i) => `${i + 1}. ${r}`).join("\n")}

INTERVIEW RULES:
- Ask one or two probing questions per turn about weak or unexplained areas.
- Keep each response concise (3-5 sentences max).
- Acknowledge progress when the candidate improves their design.
- Do NOT give the answer away or reference the reference design.`;
}

function buildWindDownCue(turn: number): string {
  if (turn >= SOFT_WIND_DOWN_START) {
    return "\n\n[Note: We're approaching the end of the interview. Focus your remaining feedback on the most critical unaddressed issues.]";
  }
  return "";
}

export async function POST(req: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  let body: ReviewRequest;
  try {
    body = await req.json();
  } catch {
    return new Response("Invalid JSON", { status: 400 });
  }

  const { problemId, graphJson, transcript, reply } = body;
  if (!problemId || !graphJson) {
    return new Response("Missing required fields: problemId, graphJson", { status: 400 });
  }

  const problem = ALL_PROBLEMS.find((p) => p.id === problemId);
  if (!problem) {
    return new Response(`Problem not found: ${problemId}`, { status: 404 });
  }

  const turnNumber = transcript.length + 1;
  if (turnNumber > HARD_CAP) {
    return new Response("Hard turn cap reached. Use finish-and-debrief.", { status: 403 });
  }

  const systemPrompt = buildSystemPrompt(problem) + buildWindDownCue(turnNumber);

  // Build the LLM message array
  const messages: { role: "user" | "assistant"; content: string }[] = [
    ...transcript,
    {
      role: "user",
      content: `Here is my current design:\n\n${JSON.stringify(graphJson, null, 2)}${reply ? `\n\nMy response to your last question: ${reply}` : ""}`,
    },
  ];

  const model = getProvider();
  const result = streamText({
    model,
    system: systemPrompt,
    messages,
    maxOutputTokens: 400,
  });

  return result.toTextStreamResponse();
}
