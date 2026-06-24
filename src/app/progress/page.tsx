import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { attempt } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { ALL_PROBLEMS } from "@/problems/index";
import type { Scorecard } from "@/types/scorecard";

const VERDICT_BADGE: Record<string, { label: string; bg: string }> = {
  advance: { label: "Advance", bg: "#10b981" },
  borderline: { label: "Borderline", bg: "#f59e0b" },
  "not yet": { label: "Not Yet", bg: "#ef4444" },
};

export default async function ProgressPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/");

  const attempts = await db
    .select()
    .from(attempt)
    .where(eq(attempt.userId, session.user.id))
    .orderBy(desc(attempt.createdAt))
    .limit(50);

  const problemMap = new Map(ALL_PROBLEMS.map((p) => [p.id, p]));

  return (
    <main
      style={{
        maxWidth: 800,
        margin: "0 auto",
        padding: "32px 16px",
        fontFamily: "inherit",
      }}
    >
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>Your Progress</h1>
      <p style={{ color: "#6b7280", marginBottom: 24, fontSize: 14 }}>
        {attempts.length} attempt{attempts.length !== 1 ? "s" : ""} across{" "}
        {new Set(attempts.map((a) => a.problemId)).size} problem
        {new Set(attempts.map((a) => a.problemId)).size !== 1 ? "s" : ""}
      </p>

      {attempts.length === 0 ? (
        <div
          style={{
            background: "#f9fafb",
            borderRadius: 8,
            padding: 32,
            textAlign: "center",
            color: "#6b7280",
            fontSize: 14,
          }}
        >
          No attempts yet. Head to the canvas to start your first design.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {attempts.map((a) => {
            const problem = problemMap.get(a.problemId);
            const scorecard = a.scorecard as Scorecard | null;
            const badge = a.verdict ? VERDICT_BADGE[a.verdict] ?? null : null;

            return (
              <div
                key={a.id}
                style={{
                  background: "white",
                  border: "1px solid #e5e7eb",
                  borderRadius: 8,
                  padding: "16px 20px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  gap: 12,
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 15 }}>
                    {problem?.title ?? a.problemId}
                  </div>
                  <div style={{ fontSize: 12, color: "#9ca3af", marginTop: 2 }}>
                    {new Date(a.createdAt).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                    {problem && (
                      <span
                        style={{
                          marginLeft: 8,
                          background: "#f3f4f6",
                          borderRadius: 4,
                          padding: "1px 6px",
                          fontSize: 11,
                          textTransform: "capitalize",
                        }}
                      >
                        {problem.difficulty}
                      </span>
                    )}
                  </div>
                  {scorecard && (
                    <div style={{ marginTop: 8, display: "flex", gap: 8, flexWrap: "wrap" }}>
                      {scorecard.rubricRatings.map((r, i) => (
                        <span
                          key={i}
                          style={{
                            fontSize: 11,
                            background: "#f3f4f6",
                            borderRadius: 4,
                            padding: "2px 6px",
                            color: "#374151",
                          }}
                          title={r.comment}
                        >
                          {r.criterion}: {r.rating}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                {badge && (
                  <div
                    style={{
                      background: badge.bg,
                      color: "white",
                      borderRadius: 6,
                      padding: "4px 10px",
                      fontSize: 12,
                      fontWeight: 600,
                      whiteSpace: "nowrap",
                      flexShrink: 0,
                    }}
                  >
                    {badge.label}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
