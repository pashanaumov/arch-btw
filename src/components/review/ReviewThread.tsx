"use client";
import { useState, useRef, useEffect } from "react";
import type { DesignGraph } from "@/lib/serialize";

type TranscriptTurn = { role: "user" | "assistant"; content: string };

type ReviewThreadProps = {
  problemId: string;
  graphJson: DesignGraph;
  onTranscriptUpdate: (transcript: TranscriptTurn[]) => void;
  onFinish: () => void;
  maxTurns?: number;
};

const HARD_CAP = 10;

export function ReviewThread({
  problemId,
  graphJson,
  onTranscriptUpdate,
  onFinish,
  maxTurns = HARD_CAP,
}: ReviewThreadProps) {
  const [transcript, setTranscript] = useState<TranscriptTurn[]>([]);
  const [reply, setReply] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [transcript, isStreaming]);

  const turnCount = transcript.filter((t) => t.role === "assistant").length;
  const atCap = turnCount >= maxTurns;

  async function requestReview() {
    if (isStreaming || atCap) return;
    setIsStreaming(true);
    setError(null);

    const newUserTurn: TranscriptTurn = {
      role: "user",
      content: reply || "(submitted design for review)",
    };

    try {
      const res = await fetch("/api/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ problemId, graphJson, transcript, reply }),
      });

      if (!res.ok) {
        const text = await res.text();
        setError(text || `Error ${res.status}`);
        setIsStreaming(false);
        return;
      }

      if (!res.body) {
        setError("No response body");
        setIsStreaming(false);
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let assistantContent = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        // Parse AI SDK data stream format (lines starting with "0:")
        for (const line of chunk.split("\n")) {
          if (line.startsWith('0:"')) {
            const text = line.slice(3, -1).replace(/\\n/g, "\n").replace(/\\"/g, '"');
            assistantContent += text;
          }
        }
      }

      const newTranscript = [
        ...transcript,
        newUserTurn,
        { role: "assistant" as const, content: assistantContent },
      ];
      setTranscript(newTranscript);
      onTranscriptUpdate(newTranscript);
      setReply("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Request failed");
    } finally {
      setIsStreaming(false);
    }
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        padding: 12,
        gap: 8,
        fontFamily: "inherit",
      }}
    >
      <div style={{ fontSize: 12, fontWeight: 600, color: "#6b7280" }}>
        REVIEW THREAD — Turn {turnCount}/{maxTurns}
      </div>

      <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 10 }}>
        {transcript.length === 0 && (
          <p style={{ color: "#9ca3af", fontSize: 13 }}>
            Press &quot;Request Review&quot; to submit your design for critique.
          </p>
        )}
        {transcript.map((turn, i) => (
          <div
            key={i}
            style={{
              background: turn.role === "assistant" ? "#f3f4f6" : "#eff6ff",
              borderRadius: 8,
              padding: "8px 12px",
              fontSize: 13,
              lineHeight: 1.5,
            }}
          >
            <div style={{ fontWeight: 600, fontSize: 11, color: "#6b7280", marginBottom: 4 }}>
              {turn.role === "assistant" ? "REVIEWER" : "YOU"}
            </div>
            {turn.content}
          </div>
        ))}
        {isStreaming && (
          <div style={{ background: "#f3f4f6", borderRadius: 8, padding: "8px 12px", fontSize: 13 }}>
            <div style={{ fontWeight: 600, fontSize: 11, color: "#6b7280", marginBottom: 4 }}>REVIEWER</div>
            <span style={{ color: "#9ca3af" }}>Thinking…</span>
          </div>
        )}
        {error && (
          <div style={{ background: "#fef2f2", borderRadius: 8, padding: "8px 12px", fontSize: 13, color: "#dc2626" }}>
            {error}
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <textarea
        value={reply}
        onChange={(e) => setReply(e.target.value)}
        placeholder="Optional: respond to the reviewer's question before re-submitting…"
        disabled={isStreaming || atCap}
        style={{
          border: "1px solid #e5e7eb",
          borderRadius: 6,
          padding: 8,
          fontSize: 12,
          resize: "vertical",
          minHeight: 60,
          fontFamily: "inherit",
          boxSizing: "border-box",
        }}
      />

      <div style={{ display: "flex", gap: 8 }}>
        <button
          onClick={requestReview}
          disabled={isStreaming || atCap}
          style={{
            flex: 1,
            background: "#3b82f6",
            color: "white",
            border: "none",
            borderRadius: 6,
            padding: "8px 16px",
            fontSize: 13,
            fontWeight: 600,
            cursor: isStreaming || atCap ? "not-allowed" : "pointer",
            opacity: isStreaming || atCap ? 0.5 : 1,
          }}
        >
          {isStreaming ? "Reviewing…" : "Request Review"}
        </button>
        <button
          onClick={onFinish}
          disabled={isStreaming}
          style={{
            background: "#10b981",
            color: "white",
            border: "none",
            borderRadius: 6,
            padding: "8px 16px",
            fontSize: 13,
            fontWeight: 600,
            cursor: isStreaming ? "not-allowed" : "pointer",
            opacity: isStreaming ? 0.5 : 1,
          }}
        >
          Finish &amp; Get Verdict
        </button>
      </div>
    </div>
  );
}
