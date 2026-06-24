import type { ExcalidrawElement } from "@excalidraw/excalidraw/element/types";
import type { ComponentType } from "@/components/canvas/component-types";
import { COMPONENT_LABELS } from "@/components/canvas/component-types";

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

/**
 * Converts Excalidraw elements + notes into a directed graph JSON for LLM consumption.
 *
 * Nodes: non-arrow elements with customData.componentType
 * Label format: "Component Name\noptional explanation on second line"
 * Edges: arrow elements with startBinding.elementId -> endBinding.elementId
 */
export function serializeDesign(elements: readonly ExcalidrawElement[], notes: string): DesignGraph {
  const nodeElements = elements.filter(
    (el) => !el.isDeleted && el.type !== "arrow" && el.type !== "line" && el.type !== "text" && el.type !== "freedraw" && (el.customData as Record<string, unknown> | undefined)?.componentType
  );

  const nodes: GraphNode[] = nodeElements.map((el) => {
    const cd = el.customData as Record<string, unknown>;
    const componentType = cd.componentType as string;
    const rawLabel = (el as { label?: { text?: string }; text?: string }).label?.text ?? (el as { text?: string }).text ?? "";
    const lines = rawLabel.split("\n");
    const displayLabel = lines[0]?.trim() || COMPONENT_LABELS[componentType as ComponentType] || componentType;
    const explanation = lines[1]?.trim() ?? "";

    return {
      id: el.id,
      type: componentType in COMPONENT_LABELS ? (componentType as ComponentType) : "unknown",
      label: displayLabel,
      explanation,
    };
  });

  const nodeIds = new Set(nodes.map((n) => n.id));

  const edges: GraphEdge[] = elements
    .filter((el) => !el.isDeleted && el.type === "arrow")
    .flatMap((el) => {
      const arrow = el as ExcalidrawElement & {
        startBinding: { elementId: string } | null;
        endBinding: { elementId: string } | null;
      };
      const fromId = arrow.startBinding?.elementId;
      const toId = arrow.endBinding?.elementId;

      if (!fromId || !toId || !nodeIds.has(fromId) || !nodeIds.has(toId)) return [];
      return [{ id: arrow.id, from: fromId, to: toId }];
    });

  return { nodes, edges, notes };
}
