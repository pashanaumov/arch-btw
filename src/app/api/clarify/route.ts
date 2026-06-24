import { ALL_PROBLEMS } from "@/problems/index";

type ClarifyRequest = {
  problemId: string;
  question: string;
};

export async function POST(req: Request) {
  let body: ClarifyRequest;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { problemId, question } = body;
  if (!problemId || !question?.trim()) {
    return Response.json({ error: "Missing problemId or question" }, { status: 400 });
  }

  const problem = ALL_PROBLEMS.find((p) => p.id === problemId);
  if (!problem) {
    return Response.json({ error: `Problem not found: ${problemId}` }, { status: 404 });
  }

  const q = question.toLowerCase();

  // Try to find a matching canned fact via keyword overlap
  const fact = problem.clarificationFacts.find((cf) => {
    const keywords = cf.question.toLowerCase().split(/\W+/).filter((w) => w.length > 3);
    return keywords.some((kw) => q.includes(kw));
  });

  if (fact) {
    return Response.json({ answer: fact.answer });
  }

  // Fallback: return a generic in-character response
  return Response.json({
    answer:
      "That's a reasonable question to clarify. I'd say focus on the core requirements first — " +
      "you can make assumptions and state them explicitly as you go.",
  });
}
