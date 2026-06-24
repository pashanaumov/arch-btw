"use client";
import { COMPONENT_LABELS, COMPONENT_COLORS, COMPONENT_TYPES, type ComponentType } from "./shapes";

type ComponentPaletteProps = {
  onAdd: (type: ComponentType) => void;
};

export function ComponentPalette({ onAdd }: ComponentPaletteProps) {
  return (
    <div
      style={{
        position: "absolute",
        top: 60,
        left: 8,
        zIndex: 300,
        background: "white",
        borderRadius: 8,
        boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
        padding: 8,
        display: "flex",
        flexDirection: "column",
        gap: 4,
        maxHeight: "calc(100vh - 80px)",
        overflowY: "auto",
        width: 140,
      }}
    >
      <div style={{ fontSize: 11, fontWeight: 600, color: "#6b7280", paddingBottom: 4 }}>
        COMPONENTS
      </div>
      {COMPONENT_TYPES.map((type) => (
        <button
          key={type}
          onClick={() => onAdd(type)}
          style={{
            background: COMPONENT_COLORS[type],
            color: "white",
            border: "none",
            borderRadius: 6,
            padding: "5px 8px",
            fontSize: 11,
            fontWeight: 500,
            cursor: "pointer",
            textAlign: "left",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {COMPONENT_LABELS[type]}
        </button>
      ))}
    </div>
  );
}
