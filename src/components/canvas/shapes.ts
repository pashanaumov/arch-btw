import type { TLBaseShape } from "tldraw";

export type ComponentType =
  | "service"
  | "worker"
  | "queue"
  | "sql-db"
  | "nosql-db"
  | "cache"
  | "object-storage"
  | "gateway"
  | "third-party"
  | "llm-provider"
  | "webhook"
  | "cron"
  | "custom";

export const COMPONENT_LABELS: Record<ComponentType, string> = {
  service: "Service / API",
  worker: "Worker",
  queue: "Queue / Stream",
  "sql-db": "SQL DB",
  "nosql-db": "NoSQL DB",
  cache: "Cache",
  "object-storage": "Object Storage",
  gateway: "Gateway / LB",
  "third-party": "Third-party API",
  "llm-provider": "LLM Provider",
  webhook: "Webhook Source",
  cron: "Cron",
  custom: "Custom",
};

export const COMPONENT_COLORS: Record<ComponentType, string> = {
  service: "#3b82f6",
  worker: "#8b5cf6",
  queue: "#f59e0b",
  "sql-db": "#10b981",
  "nosql-db": "#06b6d4",
  cache: "#ef4444",
  "object-storage": "#6366f1",
  gateway: "#f97316",
  "third-party": "#84cc16",
  "llm-provider": "#ec4899",
  webhook: "#14b8a6",
  cron: "#a78bfa",
  custom: "#6b7280",
};

export const COMPONENT_TYPES = Object.keys(COMPONENT_LABELS) as ComponentType[];

export type ComponentShapeProps = {
  w: number;
  h: number;
  componentType: ComponentType;
  label: string;
  explanation: string;
};

export type ComponentShape = TLBaseShape<"component", ComponentShapeProps>;
