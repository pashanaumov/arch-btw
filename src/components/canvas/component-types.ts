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
