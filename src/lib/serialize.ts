import type { TLEditorSnapshot, TLArrowBinding, TLShape } from "tldraw";
import type { ComponentType } from "@/components/canvas/shapes";
import { COMPONENT_LABELS } from "@/components/canvas/shapes";

export type GraphNode = {
  id: string;
  type: ComponentType | "unknown";
  label: string;
  explanation: string;
};

export type GraphEdge = {
  id: string;
  from: string;
  to: string;
};

export type DesignGraph = {
  nodes: GraphNode[];
  edges: GraphEdge[];
  notes: string;
};

type ComponentShapeProps = {
  componentType: string;
  label: string;
  explanation: string;
  w: number;
  h: number;
};

type StoreRecord = { typeName: string; type?: string; props?: unknown; id: string };

function isComponentRecord(r: StoreRecord): r is StoreRecord & { props: ComponentShapeProps } {
  return r.typeName === "shape" && (r as { type?: string }).type === "component";
}

function isArrowBindingRecord(r: StoreRecord): r is TLArrowBinding & StoreRecord {
  return r.typeName === "binding" && (r as { type?: string }).type === "arrow";
}

/**
 * Converts a tldraw editor snapshot + notes into a clean directed graph JSON
 * for LLM consumption. Arrows in tldraw v5 use separate binding records
 * (TLArrowBinding) with fromId = arrow shape, toId = connected shape,
 * terminal = 'start' | 'end'.
 */
export function serializeDesign(snapshot: TLEditorSnapshot, notes: string): DesignGraph {
  const store = snapshot.document.store as Record<string, StoreRecord>;
  const records = Object.values(store);

  const nodes: GraphNode[] = records
    .filter(isComponentRecord)
    .map((r) => {
      const props = r.props;
      const componentType = props.componentType as ComponentType;
      return {
        id: r.id,
        type: componentType in COMPONENT_LABELS ? componentType : "unknown",
        label: props.label || COMPONENT_LABELS[componentType as keyof typeof COMPONENT_LABELS] || componentType,
        explanation: props.explanation,
      };
    });

  const nodeIds = new Set(nodes.map((n) => n.id));

  // Group arrow bindings by the arrow shape they belong to
  const bindingsByArrow = new Map<string, { start?: string; end?: string }>();

  for (const record of records) {
    if (!isArrowBindingRecord(record)) continue;
    const binding = record as TLArrowBinding;
    const arrowId = binding.fromId;
    const targetId = binding.toId;
    const terminal = binding.props.terminal;

    if (!nodeIds.has(targetId)) continue; // target must be a component

    const entry = bindingsByArrow.get(arrowId) ?? {};
    if (terminal === "start") entry.start = targetId;
    else if (terminal === "end") entry.end = targetId;
    bindingsByArrow.set(arrowId, entry);
  }

  const edges: GraphEdge[] = [];
  for (const [arrowId, { start, end }] of bindingsByArrow) {
    if (start && end) {
      edges.push({ id: arrowId, from: start, to: end });
    }
    // Arrow with only one terminal bound = excluded (no crash)
  }

  return { nodes, edges, notes };
}

/**
 * Returns the snapshot as-is for durable storage (reload/edit use).
 */
export function extractSnapshot(snapshot: TLEditorSnapshot): TLEditorSnapshot {
  return snapshot;
}

// Re-export types needed by consumers
export type { TLShape };
