import { describe, it, expect } from "vitest";
import { serializeDesign } from "@/lib/serialize";
import type { TLEditorSnapshot } from "tldraw";

// Helpers to build minimal snapshots for testing
function makeSnapshot(records: Record<string, unknown>): TLEditorSnapshot {
  return {
    document: {
      store: records as Record<string, never>,
      schema: { schemaVersion: 2, sequences: {} },
    },
    session: {} as never,
  };
}

function componentRecord(id: string, componentType: string, label = "", explanation = "") {
  return {
    typeName: "shape",
    type: "component",
    id,
    props: { componentType, label, explanation, w: 160, h: 80 },
  };
}

function arrowRecord(id: string) {
  return { typeName: "shape", type: "arrow", id, props: {} };
}

function bindingRecord(
  id: string,
  arrowId: string,
  targetId: string,
  terminal: "start" | "end"
) {
  return {
    typeName: "binding",
    type: "arrow",
    id,
    fromId: arrowId,
    toId: targetId,
    props: { terminal },
  };
}

describe("serializeDesign", () => {
  it("empty store → {nodes:[], edges:[], notes:''}", () => {
    const result = serializeDesign(makeSnapshot({}), "");
    expect(result).toEqual({ nodes: [], edges: [], notes: "" });
  });

  it("single node, no edges", () => {
    const snap = makeSnapshot({ n1: componentRecord("n1", "service", "API", "") });
    const result = serializeDesign(snap, "");
    expect(result.nodes).toHaveLength(1);
    expect(result.edges).toHaveLength(0);
    expect(result.nodes[0].id).toBe("n1");
  });

  it("two nodes connected A→B produces correct edge direction", () => {
    const snap = makeSnapshot({
      a: componentRecord("a", "service"),
      b: componentRecord("b", "sql-db"),
      arrow1: arrowRecord("arrow1"),
      binding1: bindingRecord("binding1", "arrow1", "a", "start"),
      binding2: bindingRecord("binding2", "arrow1", "b", "end"),
    });
    const result = serializeDesign(snap, "");
    expect(result.edges).toHaveLength(1);
    expect(result.edges[0]).toMatchObject({ from: "a", to: "b" });
  });

  it("node explanation is preserved", () => {
    const snap = makeSnapshot({
      n1: componentRecord("n1", "cache", "Redis", "Stores hot URL mappings"),
    });
    const result = serializeDesign(snap, "some notes");
    expect(result.nodes[0].explanation).toBe("Stores hot URL mappings");
    expect(result.notes).toBe("some notes");
  });

  it("notes string is passed through", () => {
    const result = serializeDesign(makeSnapshot({}), "my design notes");
    expect(result.notes).toBe("my design notes");
  });

  it("arrow with only start binding → excluded from edges (no crash)", () => {
    const snap = makeSnapshot({
      a: componentRecord("a", "service"),
      arrow1: arrowRecord("arrow1"),
      binding1: bindingRecord("binding1", "arrow1", "a", "start"),
    });
    const result = serializeDesign(snap, "");
    expect(result.edges).toHaveLength(0);
    expect(result.nodes).toHaveLength(1);
  });

  it("arrow with only end binding → excluded from edges (no crash)", () => {
    const snap = makeSnapshot({
      b: componentRecord("b", "sql-db"),
      arrow1: arrowRecord("arrow1"),
      binding2: bindingRecord("binding2", "arrow1", "b", "end"),
    });
    const result = serializeDesign(snap, "");
    expect(result.edges).toHaveLength(0);
  });

  it("unknown shape type → type: 'unknown'", () => {
    const snap = makeSnapshot({
      n1: componentRecord("n1", "exotic-new-thing"),
    });
    const result = serializeDesign(snap, "");
    expect(result.nodes[0].type).toBe("unknown");
  });

  it("bidirectional arrows → two separate edge entries", () => {
    const snap = makeSnapshot({
      a: componentRecord("a", "service"),
      b: componentRecord("b", "queue"),
      arrow1: arrowRecord("arrow1"),
      arrow2: arrowRecord("arrow2"),
      b1: bindingRecord("b1", "arrow1", "a", "start"),
      b2: bindingRecord("b2", "arrow1", "b", "end"),
      b3: bindingRecord("b3", "arrow2", "b", "start"),
      b4: bindingRecord("b4", "arrow2", "a", "end"),
    });
    const result = serializeDesign(snap, "");
    expect(result.edges).toHaveLength(2);
    const directions = result.edges.map((e) => `${e.from}->${e.to}`).sort();
    expect(directions).toEqual(["a->b", "b->a"].sort());
  });
});
