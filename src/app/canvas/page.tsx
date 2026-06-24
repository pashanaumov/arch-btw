"use client";
import dynamic from "next/dynamic";
import { useState } from "react";

const DesignCanvas = dynamic(
  () => import("@/components/canvas/DesignCanvas").then((m) => m.DesignCanvas),
  { ssr: false }
);

export default function CanvasPage() {
  const [notes, setNotes] = useState("");

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden" }}>
      {/* Canvas — 70% */}
      <div style={{ flex: "0 0 70%", position: "relative" }}>
        <DesignCanvas />
      </div>

      {/* Notes — 30% */}
      <div
        style={{
          flex: "0 0 30%",
          display: "flex",
          flexDirection: "column",
          borderLeft: "1px solid #e5e7eb",
          background: "#ffffff",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "14px 20px",
            borderBottom: "1px solid #f3f4f6",
          }}
        >
          <div style={{ fontSize: 12, fontWeight: 600, color: "#111827", letterSpacing: "0.03em" }}>
            Design Notes
          </div>
          <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 1 }}>
            Assumptions · trade-offs · open questions
          </div>
        </div>

        {/* Textarea */}
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder={"What assumptions are you making?\n\nWhat trade-offs are you accepting?\n\nWhat would you ask the interviewer?"}
          style={{
            flex: 1,
            padding: "16px 20px",
            border: "none",
            background: "transparent",
            fontSize: 13,
            lineHeight: 1.7,
            fontFamily: "inherit",
            color: "#111827",
            resize: "none",
            outline: "none",
          }}
        />

        {/* Footer */}
        <div
          style={{
            padding: "8px 20px",
            borderTop: "1px solid #f3f4f6",
            fontSize: 11,
            color: "#9ca3af",
          }}
        >
          {notes.trim() ? `${notes.trim().split(/\s+/).length} words` : "Empty — interviewer will probe unexplained choices"}
        </div>
      </div>
    </div>
  );
}
