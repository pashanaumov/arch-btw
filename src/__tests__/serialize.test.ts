import { describe, it, expect } from "vitest";
import { serializeDesign } from "@/lib/serialize";
import type { ExcalidrawElement } from "@excalidraw/excalidraw/element/types";

// Helpers to build minimal Excalidraw elements for testing
function nodeEl(id: string, componentType: string, label = "", isDeleted = false): ExcalidrawElement {
  return {
    id,
    type: "rectangle",
    x: 0, y: 0, width: 160, height: 80,
    angle: 0, strokeColor: "#000", backgroundColor: "#fff",
    fillStyle: "hachure", strokeWidth: 1, strokeStyle: "solid",
    roughness: 1, opacity: 100, groupIds: [],
    roundness: null, seed: 1, version: 1, versionNonce: 1,
    isDeleted, boundElements: null, updated: 0, link: null, locked: false,
    frameId: null, index: "a0",
    customData: { componentType },
    label: label ? { text: label } : undefined,
  } as unknown as ExcalidrawElement;
}

function arrowEl(
  id: string,
  startId: string | null,
  endId: string | null,
  isDeleted = false
): ExcalidrawElement {
  return {
    id,
    type: "arrow",
    x: 0, y: 0, width: 100, height: 0,
    angle: 0, strokeColor: "#000", backgroundColor: "transparent",
    fillStyle: "solid", strokeWidth: 1, strokeStyle: "solid",
    roughness: 1, opacity: 100, groupIds: [],
    roundness: null, seed: 1, version: 1, versionNonce: 1,
    isDeleted, boundElements: null, updated: 0, link: null, locked: false,
    frameId: null, index: "a1",
    startBinding: startId ? { elementId: startId, focus: 0, gap: 0 } : null,
    endBinding: endId ? { elementId: endId, focus: 0, gap: 0 } : null,
    points: [[0, 0], [100, 0]],
    lastCommittedPoint: null,
    startArrowhead: null,
    endArrowhead: "arrow",
    customData: undefined,
  } as unknown as ExcalidrawElement;
}

describe("serializeDesign", () => {
  it("empty elements → {nodes:[], edges:[], notes:''}", () => {
    expect(serializeDesign([], "")).toEqual({ nodes: [], edges: [], notes: "" });
  });

  it("single node, no edges", () => {
    const result = serializeDesign([nodeEl("n1", "service", "API")], "");
    expect(result.nodes).toHaveLength(1);
    expect(result.edges).toHaveLength(0);
    expect(result.nodes[0].id).toBe("n1");
  });

  it("two nodes connected A→B produces correct edge direction", () => {
    const result = serializeDesign([
      nodeEl("a", "service"),
      nodeEl("b", "sql-db"),
      arrowEl("arrow1", "a", "b"),
    ], "");
    expect(result.edges).toHaveLength(1);
    expect(result.edges[0]).toMatchObject({ from: "a", to: "b" });
  });

  it("explanation extracted from second line of label", () => {
    const result = serializeDesign([nodeEl("n1", "cache", "Redis\nStores hot URL mappings")], "some notes");
    expect(result.nodes[0].label).toBe("Redis");
    expect(result.nodes[0].explanation).toBe("Stores hot URL mappings");
    expect(result.notes).toBe("some notes");
  });

  it("notes string is passed through", () => {
    expect(serializeDesign([], "my design notes").notes).toBe("my design notes");
  });

  it("arrow with only start binding → excluded (no crash)", () => {
    const result = serializeDesign([nodeEl("a", "service"), arrowEl("arrow1", "a", null)], "");
    expect(result.edges).toHaveLength(0);
  });

  it("arrow with only end binding → excluded (no crash)", () => {
    const result = serializeDesign([nodeEl("b", "sql-db"), arrowEl("arrow1", null, "b")], "");
    expect(result.edges).toHaveLength(0);
  });

  it("unknown componentType → type: 'unknown'", () => {
    const result = serializeDesign([nodeEl("n1", "exotic-thing")], "");
    expect(result.nodes[0].type).toBe("unknown");
  });

  it("bidirectional arrows → two separate edge entries", () => {
    const result = serializeDesign([
      nodeEl("a", "service"),
      nodeEl("b", "queue"),
      arrowEl("arrow1", "a", "b"),
      arrowEl("arrow2", "b", "a"),
    ], "");
    expect(result.edges).toHaveLength(2);
    const dirs = result.edges.map((e) => `${e.from}->${e.to}`).sort();
    expect(dirs).toEqual(["a->b", "b->a"].sort());
  });

  it("deleted elements are excluded", () => {
    const result = serializeDesign([nodeEl("n1", "service", "", true)], "");
    expect(result.nodes).toHaveLength(0);
  });

  it("non-component elements (text, freedraw) are excluded from nodes", () => {
    const textEl = { id: "t1", type: "text", isDeleted: false, customData: undefined } as unknown as ExcalidrawElement;
    const result = serializeDesign([textEl, nodeEl("n1", "service")], "");
    expect(result.nodes).toHaveLength(1);
    expect(result.nodes[0].id).toBe("n1");
  });
});
