import { CanvasClientWrapper } from "@/components/canvas/CanvasClientWrapper";

export default function CanvasPage() {
  return (
    <div style={{ position: "fixed", inset: 0 }}>
      <CanvasClientWrapper />
    </div>
  );
}
