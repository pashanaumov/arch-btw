"use client";
import { useCallback, useState } from "react";
import {
  Tldraw,
  useEditor,
  createShapeId,
  type TLEditorSnapshot,
} from "tldraw";
import "tldraw/tldraw.css";
import { ComponentShapeUtil } from "./ComponentShapeUtil";
import { ComponentPalette } from "./ComponentPalette";
import { NotesPanel } from "./NotesPanel";
import type { ComponentType } from "./shapes";

const SHAPE_UTILS = [ComponentShapeUtil];

type CanvasProps = {
  snapshot?: TLEditorSnapshot;
  notes?: string;
  onSnapshotChange?: (snapshot: TLEditorSnapshot, notes: string) => void;
};

function CanvasInner({ notes: initialNotes = "", onSnapshotChange }: Omit<CanvasProps, "snapshot">) {
  const editor = useEditor();
  const [notes, setNotes] = useState(initialNotes);

  const handleAddShape = useCallback(
    (componentType: ComponentType) => {
      const id = createShapeId();
      editor.createShape({
        id,
        type: "component" as never,
        x: 100 + Math.random() * 200,
        y: 100 + Math.random() * 200,
        props: {
          w: 160,
          h: 80,
          componentType,
          label: "",
          explanation: "",
        },
      });
      editor.select(id);
    },
    [editor]
  );

  const handleNotesChange = useCallback(
    (value: string) => {
      setNotes(value);
      if (onSnapshotChange) {
        const snapshot = editor.getSnapshot();
        onSnapshotChange(snapshot, value);
      }
    },
    [editor, onSnapshotChange]
  );

  return (
    <>
      <ComponentPalette onAdd={handleAddShape} />
      <NotesPanel notes={notes} onChange={handleNotesChange} />
    </>
  );
}

export function DesignCanvas({ snapshot, notes, onSnapshotChange }: CanvasProps) {
  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <Tldraw
        shapeUtils={SHAPE_UTILS}
        snapshot={snapshot}
        persistenceKey="arch-btw-canvas"
      >
        <CanvasInner notes={notes} onSnapshotChange={onSnapshotChange} />
      </Tldraw>
    </div>
  );
}
