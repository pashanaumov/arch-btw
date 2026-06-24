"use client";
import {
  ShapeUtil,
  HTMLContainer,
  Rectangle2d,
  T,
  type RecordProps,
  type TLShape,
} from "tldraw";
import {
  type ComponentType,
  COMPONENT_LABELS,
  COMPONENT_COLORS,
} from "./shapes";

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

export class ComponentShapeUtil extends ShapeUtil<ComponentShapeType> {
  static override type = "component" as const;

  static override props: RecordProps<ComponentShapeType> = {
    w: T.number,
    h: T.number,
    componentType: T.string as unknown as RecordProps<ComponentShapeType>["componentType"],
    label: T.string,
    explanation: T.string,
  };

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

    return (
      <HTMLContainer
        style={{
          width: w,
          height: h,
          backgroundColor: color,
          borderRadius: 8,
          padding: "6px 10px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          overflow: "hidden",
          cursor: "default",
          userSelect: "none",
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            color: "white",
            fontSize: 13,
            fontWeight: 600,
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
              color: "rgba(255,255,255,0.8)",
              fontSize: 11,
              marginTop: 3,
              overflow: "hidden",
              textOverflow: "ellipsis",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
            }}
          >
            {explanation}
          </div>
        )}
      </HTMLContainer>
    );
  }

  getIndicatorPath(shape: ComponentShapeType) {
    const path = new Path2D();
    path.rect(0, 0, shape.props.w, shape.props.h);
    return path;
  }
}
