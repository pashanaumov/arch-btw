"use client";
import { useState } from "react";
import type { Scorecard, Verdict } from "@/types/scorecard";

const VERDICT_LABELS: Record<Verdict, { label: string; color: string }> = {
  advance: { label: "✓ Advance", color: "#10b981" },
  borderline: { label: "~ Borderline", color: "#f59e0b" },
  "not yet": { label: "✗ Not Yet", color: "#ef4444" },
};

const RATING_COLORS = {
  strong: "#10b981",
  adequate: "#3b82f6",
  weak: "#f59e0b",
  missing: "#ef4444",
};

type DebriefPanelProps = {
  scorecard: Scorecard;
  referenceDesign: string;
  onClose?: () => void;
};

export function DebriefPanel({ scorecard, referenceDesign, onClose }: DebriefPanelProps) {
  const [referenceOpen, setReferenceOpen] = useState(false);
  const verdict = VERDICT_LABELS[scorecard.verdict];

  return (
    <div
      style={{
        fontFamily: "inherit",
        display: "flex",
        flexDirection: "column",
        gap: 16,
        padding: 16,
        overflowY: "auto",
        height: "100%",
        boxSizing: "border-box",
      }}
    >
      {/* Verdict */}
      <div
        style={{
          background: verdict.color,
          color: "white",
          borderRadius: 8,
          padding: "12px 16px",
          fontSize: 18,
          fontWeight: 700,
          textAlign: "center",
        }}
      >
        {verdict.label}
      </div>

      {/* Summary */}
      <div style={{ fontSize: 13, lineHeight: 1.6 }}>{scorecard.summary}</div>

      {/* Rubric ratings */}
      <div>
        <div style={{ fontSize: 11, fontWeight: 600, color: "#6b7280", marginBottom: 8 }}>RUBRIC</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {scorecard.rubricRatings.map((r, i) => (
            <div key={i} style={{ background: "#f9fafb", borderRadius: 6, padding: "8px 12px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 13, fontWeight: 500 }}>{r.criterion}</span>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: RATING_COLORS[r.rating],
                    textTransform: "uppercase",
                  }}
                >
                  {r.rating}
                </span>
              </div>
              <div style={{ fontSize: 12, color: "#6b7280", marginTop: 4 }}>{r.comment}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Transcript callbacks */}
      {scorecard.transcriptCallbacks.length > 0 && (
        <div>
          <div style={{ fontSize: 11, fontWeight: 600, color: "#6b7280", marginBottom: 8 }}>KEY MOMENTS</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {scorecard.transcriptCallbacks.map((cb, i) => (
              <div key={i} style={{ borderLeft: "3px solid #3b82f6", paddingLeft: 10 }}>
                <div style={{ fontSize: 12, fontStyle: "italic", color: "#374151" }}>
                  &ldquo;{cb.quote}&rdquo;
                </div>
                <div style={{ fontSize: 12, color: "#6b7280", marginTop: 3 }}>{cb.observation}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Reference design (collapsed by default) */}
      <div>
        <button
          onClick={() => setReferenceOpen((v) => !v)}
          style={{
            background: "none",
            border: "1px solid #e5e7eb",
            borderRadius: 6,
            padding: "6px 12px",
            fontSize: 12,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 6,
            width: "100%",
          }}
        >
          <span>{referenceOpen ? "▾" : "▸"}</span>
          <span>One Strong Approach</span>
        </button>
        {referenceOpen && (
          <div
            style={{
              marginTop: 8,
              background: "#f0fdf4",
              borderRadius: 6,
              padding: "10px 12px",
              fontSize: 12,
              lineHeight: 1.6,
              color: "#374151",
            }}
          >
            {referenceDesign}
          </div>
        )}
      </div>

      {onClose && (
        <button
          onClick={onClose}
          style={{
            background: "#6b7280",
            color: "white",
            border: "none",
            borderRadius: 6,
            padding: "8px 16px",
            fontSize: 13,
            cursor: "pointer",
          }}
        >
          Close
        </button>
      )}
    </div>
  );
}
