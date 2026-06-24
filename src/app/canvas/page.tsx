"use client";
import dynamic from "next/dynamic";
import { useState } from "react";

const DesignCanvas = dynamic(
  () => import("@/components/canvas/DesignCanvas").then((m) => m.DesignCanvas),
  { ssr: false }
);

export default function CanvasPage() {
  const [notes, setNotes] = useState("");
  const wordCount = notes.trim() ? notes.trim().split(/\s+/).length : 0;

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Canvas — 70% */}
      <div className="relative flex-[0_0_70%]">
        <DesignCanvas />
      </div>

      {/* Notes panel — 30% */}
      <div className="flex flex-[0_0_30%] flex-col border-l border-border bg-background">
        <div className="border-b border-border px-5 py-3.5">
          <p className="text-sm font-semibold tracking-tight">Design Notes</p>
          <p className="text-xs text-muted-foreground">Assumptions · trade-offs · open questions</p>
        </div>

        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder={"What assumptions are you making?\n\nWhat trade-offs are you accepting?\n\nWhat would you ask the interviewer?"}
          className="flex-1 resize-none bg-transparent p-5 text-sm leading-relaxed outline-none placeholder:text-muted-foreground/50"
        />

        <div className="border-t border-border px-5 py-2 text-xs text-muted-foreground">
          {wordCount > 0 ? `${wordCount} words` : "Empty — interviewer will probe unexplained choices"}
        </div>
      </div>
    </div>
  );
}
