"use client";
import dynamic from "next/dynamic";
import type { ComponentProps } from "react";
import type { DesignCanvas as DesignCanvasType } from "@/components/canvas/DesignCanvas";

const DesignCanvas = dynamic(
  () => import("@/components/canvas/DesignCanvas").then((m) => m.DesignCanvas),
  { ssr: false }
);

export function CanvasClientWrapper(props: ComponentProps<typeof DesignCanvasType>) {
  return <DesignCanvas {...props} />;
}
