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
        <DesignCanvas notes={notes} onSnapshotChange={(_snap, n) => setNotes(n)} />
      </div>

      {/* Notes — 30% */}
      <div
        style={{
          flex: "0 0 30%",
          display: "flex",
          flexDirection: "column",
          borderLeft: "1px solid #e5e7eb",
          background: "#fefce8", // warm notebook yellow
          fontFamily: "Georgia, 'Times New Roman', serif",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "16px 20px 12px",
            borderBottom: "1px solid #d1d5db",
            background: "#fef9c3",
          }}
        >
          <div style={{ fontSize: 13, fontWeight: 700, color: "#78350f", letterSpacing: "0.05em" }}>
            📓 Design Notes
          </div>
          <div style={{ fontSize: 11, color: "#92400e", marginTop: 2 }}>
            Trade-offs, assumptions, open questions
          </div>
        </div>

        {/* Lined textarea area */}
        <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>
          {/* Lined paper effect */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              backgroundImage: "repeating-linear-gradient(transparent, transparent 27px, #fde68a 27px, #fde68a 28px)",
              backgroundPositionY: "20px",
              pointerEvents: "none",
              zIndex: 0,
            }}
          />
          {/* Red margin line */}
          <div
            style={{
              position: "absolute",
              top: 0,
              bottom: 0,
              left: 48,
              width: 1,
              background: "#fca5a5",
              opacity: 0.5,
              pointerEvents: "none",
              zIndex: 1,
            }}
          />
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder={"Start writing...\n\nWhat assumptions are you making?\nWhat trade-offs are you accepting?\nWhat questions would you ask the interviewer?"}
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              padding: "20px 16px 16px 56px",
              border: "none",
              background: "transparent",
              fontSize: 14,
              lineHeight: "28px",
              fontFamily: "Georgia, 'Times New Roman', serif",
              color: "#1c1917",
              resize: "none",
              outline: "none",
              boxSizing: "border-box",
              zIndex: 2,
            }}
          />
        </div>

        {/* Footer - word count */}
        <div
          style={{
            padding: "6px 20px",
            borderTop: "1px solid #d1d5db",
            background: "#fef9c3",
            fontSize: 11,
            color: "#92400e",
          }}
        >
          {notes.trim() ? `${notes.trim().split(/\s+/).length} words` : "Empty — the interviewer can probe unexplained choices"}
        </div>
      </div>
    </div>
  );
}
