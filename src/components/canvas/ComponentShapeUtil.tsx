"use client";
import {
  ShapeUtil,
  HTMLContainer,
  Rectangle2d,
  T,
  useEditor,
  type RecordProps,
  type TLShape,
} from "tldraw";
import {
  type ComponentType,
  COMPONENT_LABELS,
  COMPONENT_COLORS,
} from "./shapes";
import { COMPONENT_ICONS } from "./ComponentIcons";

declare module "tldraw" {
  interface TLGlobalShapePropsMap {
    component: {
      w: number;
      h: number;
      componentType: ComponentType;
      label: string;
      explanation: string;
    };
  }
}

type ComponentShapeType = TLShape<"component">;

// Connection dots at N/S/E/W
function ConnectionHandle({
  position,
  shapeX,
  shapeY,
  w,
  h,
}: {
  position: "n" | "s" | "e" | "w";
  shapeX: number;
  shapeY: number;
  w: number;
  h: number;
}) {
  const editor = useEditor();

  const offsets: Record<string, { left: number | string; top: number | string; transform: string }> = {
    n: { left: "50%", top: -6, transform: "translateX(-50%)" },
    s: { left: "50%", top: h - 6, transform: "translateX(-50%)" },
    e: { left: w - 6, top: "50%", transform: "translateY(-50%)" },
    w: { left: -6, top: "50%", transform: "translateY(-50%)" },
  };

  // Normalized anchor: where on the shape boundary this handle sits
  const anchors: Record<string, { x: number; y: number }> = {
    n: { x: 0.5, y: 0 },
    s: { x: 0.5, y: 1 },
    e: { x: 1, y: 0.5 },
    w: { x: 0, y: 0.5 },
  };

  const style = offsets[position];
  const anchor = anchors[position];

  function handlePointerDown(e: React.PointerEvent) {
    e.stopPropagation();
    e.preventDefault();

    // Canvas coordinates of this handle
    const canvasPoint = editor.pageToScreen({
      x: shapeX + anchor.x * w,
      y: shapeY + anchor.y * h,
    });

    // Switch to arrow tool and dispatch a pointer_down at this location
    editor.setCurrentTool("arrow");
    editor.dispatch({
      type: "pointer",
      name: "pointer_down",
      target: "canvas",
      point: { x: canvasPoint.x, y: canvasPoint.y, z: 1 },
      pointerId: e.pointerId,
      button: 0,
      isPen: false,
      shiftKey: false,
      altKey: false,
      ctrlKey: false,
      metaKey: false,
      accelKey: false,
    });
  }

  return (
    <div
      onPointerDown={handlePointerDown}
      style={{
        position: "absolute",
        left: style.left,
        top: style.top,
        transform: style.transform,
        width: 12,
        height: 12,
        borderRadius: "50%",
        background: "white",
        border: "2px solid #3b82f6",
        cursor: "crosshair",
        zIndex: 10,
        pointerEvents: "all",
        boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
      }}
    />
  );
}

export class ComponentShapeUtil extends ShapeUtil<ComponentShapeType> {
  static override type = "component" as const;

  static override props: RecordProps<ComponentShapeType> = {
    w: T.number,
    h: T.number,
    componentType: T.string as unknown as RecordProps<ComponentShapeType>["componentType"],
    label: T.string,
    explanation: T.string,
  };

  // Allow arrows to bind to this shape
  override canBind() {
    return true;
  }

  getDefaultProps(): ComponentShapeType["props"] {
    return {
      w: 160,
      h: 80,
      componentType: "service" as ComponentType,
      label: "Service",
      explanation: "",
    };
  }

  getGeometry(shape: ComponentShapeType) {
    return new Rectangle2d({
      width: shape.props.w,
      height: shape.props.h,
      isFilled: true,
    });
  }

  component(shape: ComponentShapeType) {
    const { componentType, label, explanation, w, h } = shape.props;
    const color = COMPONENT_COLORS[componentType as ComponentType] ?? "#6b7280";
    const displayLabel = label || COMPONENT_LABELS[componentType as ComponentType] || componentType;
    const Icon = COMPONENT_ICONS[componentType as ComponentType];

    return (
      <HTMLContainer
        style={{
          width: w,
          height: h,
          backgroundColor: color,
          borderRadius: 8,
          padding: "6px 10px 6px 8px",
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          gap: 8,
          overflow: "visible", // allow handle dots to overflow
          cursor: "default",
          userSelect: "none",
          boxSizing: "border-box",
          position: "relative",
        }}
      >
        {/* Connection handles */}
        {(["n", "s", "e", "w"] as const).map((pos) => (
          <ConnectionHandle
            key={pos}
            position={pos}
            shapeX={shape.x}
            shapeY={shape.y}
            w={w}
            h={h}
          />
        ))}

        {/* Icon */}
        <div style={{ flexShrink: 0, opacity: 0.9 }}>
          <Icon color={color} size={32} />
        </div>

        {/* Text */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              color: "white",
              fontSize: 12,
              fontWeight: 700,
              lineHeight: 1.2,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {displayLabel}
          </div>
          {explanation && (
            <div
              style={{
                color: "rgba(255,255,255,0.75)",
                fontSize: 10,
                marginTop: 2,
                overflow: "hidden",
                textOverflow: "ellipsis",
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                lineHeight: 1.3,
              }}
            >
              {explanation}
            </div>
          )}
        </div>
      </HTMLContainer>
    );
  }

  getIndicatorPath(shape: ComponentShapeType) {
    const path = new Path2D();
    path.rect(0, 0, shape.props.w, shape.props.h);
    return path;
  }
}
