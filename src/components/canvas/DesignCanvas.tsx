"use client";
import { useEffect, useRef, useState } from "react";
import { Excalidraw } from "@excalidraw/excalidraw";
import type { ExcalidrawImperativeAPI, AppState } from "@excalidraw/excalidraw/types";
import type { ExcalidrawElement } from "@excalidraw/excalidraw/element/types";
import "@excalidraw/excalidraw/index.css";

export type CanvasSnapshot = {
  elements: readonly ExcalidrawElement[];
  appState: Partial<AppState>;
};

type DesignCanvasProps = {
  snapshot?: CanvasSnapshot;
  notes?: string;
  onSnapshotChange?: (snapshot: CanvasSnapshot, notes: string) => void;
};

export function DesignCanvas({ snapshot, notes = "", onSnapshotChange }: DesignCanvasProps) {
  const [excalidrawAPI, setExcalidrawAPI] = useState<ExcalidrawImperativeAPI | null>(null);
  const notesRef = useRef(notes);

  useEffect(() => {
    notesRef.current = notes;
  }, [notes]);

  useEffect(() => {
    if (!excalidrawAPI) return;
    fetch("/arch-btw-library.excalidrawlib")
      .then((r) => r.json())
      .then((lib) => {
        excalidrawAPI.updateLibrary({
          libraryItems: lib.libraryItems,
          merge: false,
          openLibraryMenu: false,
        });
      })
      .catch(console.error);
  }, [excalidrawAPI]);

  function handleChange(elements: readonly ExcalidrawElement[], appState: AppState) {
    if (!onSnapshotChange) return;
    onSnapshotChange({ elements, appState }, notesRef.current);
  }

  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <Excalidraw
        excalidrawAPI={(api) => setExcalidrawAPI(api)}
        initialData={snapshot ? { elements: snapshot.elements as never, appState: snapshot.appState } : undefined}
        onChange={handleChange}
        UIOptions={{
          canvasActions: { loadScene: false, export: false, saveToActiveFile: false },
        }}
      />
    </div>
  );
}
