"use client";

type NotesPanelProps = {
  notes: string;
  onChange: (value: string) => void;
};

export function NotesPanel({ notes, onChange }: NotesPanelProps) {
  return (
    <div
      style={{
        position: "absolute",
        bottom: 8,
        right: 8,
        zIndex: 300,
        background: "white",
        borderRadius: 8,
        boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
        padding: 10,
        width: 280,
      }}
    >
      <div style={{ fontSize: 11, fontWeight: 600, color: "#6b7280", marginBottom: 6 }}>
        TRAIN OF THOUGHT
      </div>
      <textarea
        value={notes}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Design notes, trade-offs, open questions…"
        style={{
          width: "100%",
          height: 100,
          border: "1px solid #e5e7eb",
          borderRadius: 4,
          padding: 6,
          fontSize: 12,
          resize: "vertical",
          fontFamily: "inherit",
          boxSizing: "border-box",
        }}
      />
    </div>
  );
}
