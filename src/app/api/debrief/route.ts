import { generateObject } from "ai";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { getProvider } from "@/lib/llm";
import { db } from "@/db";
import { attempt } from "@/db/schema";
import { ALL_PROBLEMS } from "@/problems/index";
import { scorecardSchema } from "@/types/scorecard";
import type { DesignGraph } from "@/lib/serialize";

type TranscriptTurn = { role: "user" | "assistant"; content: string };

type DebriefRequest = {
  problemId: string;
  canvasSnapshot: unknown; // Excalidraw elements + appState JSON
  graphJson: DesignGraph;
  transcript: TranscriptTurn[];
};

export async function POST(req: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: DebriefRequest;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { problemId, canvasSnapshot, graphJson, transcript } = body;
  if (!problemId || !graphJson || !transcript) {
    return Response.json({ error: "Missing required fields" }, { status: 400 });
  }

  const problem = ALL_PROBLEMS.find((p) => p.id === problemId);
  if (!problem) {
    return Response.json({ error: `Problem not found: ${problemId}` }, { status: 404 });
  }

  const transcriptText = transcript
    .map((t) => `[${t.role.toUpperCase()}]: ${t.content}`)
    .join("\n\n");

  const prompt = `You are a senior engineer evaluating a system design interview.

PROBLEM: ${problem.title}
RUBRIC CRITERIA:
${problem.rubric.map((r, i) => `${i + 1}. ${r}`).join("\n")}

CANDIDATE'S FINAL DESIGN:
${JSON.stringify(graphJson, null, 2)}

TRANSCRIPT:
${transcriptText}

Generate a structured scorecard. Reference design (to be revealed): ${problem.referenceDesign}`;

  let scorecard;
  try {
    const result = await generateObject({
      model: getProvider(),
      schema: scorecardSchema,
      prompt,
    });
    scorecard = result.object;
  } catch (err) {
    console.error("[debrief] generateObject failed:", err);
    return Response.json({ error: "Failed to generate scorecard" }, { status: 500 });
  }

  const attemptId = crypto.randomUUID();
  try {
    await db.insert(attempt).values({
      id: attemptId,
      userId: session.user.id,
      problemId,
      canvasSnapshot: canvasSnapshot ?? null,
      graphJson: graphJson as never,
      transcript: transcript as never,
      scorecard: scorecard as never,
      verdict: scorecard.verdict,
    });
  } catch (err) {
    console.error("[debrief] db.insert failed:", err);
    return Response.json({ error: "Failed to persist attempt" }, { status: 500 });
  }

  return Response.json({
    scorecard,
    referenceDesign: problem.referenceDesign,
    attemptId,
  });
}
