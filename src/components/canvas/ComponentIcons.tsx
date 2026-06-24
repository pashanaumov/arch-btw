"use client";
import type { ComponentType } from "./shapes";

type IconProps = { color: string; size?: number };

// Cylinder (databases)
export function CylinderIcon({ color: _color, size = 36 }: IconProps) {
  const rx = size * 0.45, ry = size * 0.15;
  return (
    <svg width={size} height={size} viewBox="0 0 36 36">
      <ellipse cx="18" cy="10" rx={rx} ry={ry} fill="rgba(255,255,255,0.25)" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5" />
      <rect x={18 - rx} y="10" width={rx * 2} height="18" fill="rgba(255,255,255,0.1)" />
      <ellipse cx="18" cy="28" rx={rx} ry={ry} fill="rgba(255,255,255,0.2)" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5" />
      <line x1={18 - rx} y1="10" x2={18 - rx} y2="28" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" />
      <line x1={18 + rx} y1="10" x2={18 + rx} y2="28" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" />
    </svg>
  );
}

// Hexagon (queue/stream)
export function HexagonIcon({ color: _color, size = 36 }: IconProps) {
  const pts = Array.from({ length: 6 }, (_, i) => {
    const a = (Math.PI / 3) * i - Math.PI / 6;
    return `${18 + 14 * Math.cos(a)},${18 + 14 * Math.sin(a)}`;
  }).join(" ");
  return (
    <svg width={size} height={size} viewBox="0 0 36 36">
      <polygon points={pts} fill="rgba(255,255,255,0.2)" stroke="rgba(255,255,255,0.7)" strokeWidth="1.5" />
      <line x1="11" y1="18" x2="25" y2="18" stroke="rgba(255,255,255,0.8)" strokeWidth="1.5" strokeLinecap="round" />
      <polygon points="22,14 26,18 22,22" fill="rgba(255,255,255,0.8)" />
    </svg>
  );
}

// Cloud (object storage)
export function CloudIcon({ color: _color, size = 36 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 36 36">
      <path d="M9 24 Q6 24 6 20 Q6 16 10 16 Q10 11 15 11 Q18 8 22 11 Q27 11 27 16 Q31 16 31 20 Q31 24 27 24 Z" fill="rgba(255,255,255,0.25)" stroke="rgba(255,255,255,0.7)" strokeWidth="1.5" />
    </svg>
  );
}

// Box with arrow (service/API)
export function ServiceIcon({ color: _color, size = 36 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 36 36">
      <rect x="6" y="10" width="16" height="16" rx="2" fill="rgba(255,255,255,0.2)" stroke="rgba(255,255,255,0.7)" strokeWidth="1.5" />
      <line x1="22" y1="18" x2="30" y2="18" stroke="rgba(255,255,255,0.8)" strokeWidth="1.5" strokeLinecap="round" />
      <polygon points="27,14 31,18 27,22" fill="rgba(255,255,255,0.8)" />
    </svg>
  );
}

// Gear (worker)
export function WorkerIcon({ color: _color, size = 36 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 36 36">
      <circle cx="18" cy="18" r="6" fill="rgba(255,255,255,0.2)" stroke="rgba(255,255,255,0.7)" strokeWidth="1.5" />
      {[0, 45, 90, 135, 180, 225, 270, 315].map((deg, i) => {
        const rad = (deg * Math.PI) / 180;
        const x1 = 18 + 7 * Math.cos(rad), y1 = 18 + 7 * Math.sin(rad);
        const x2 = 18 + 11 * Math.cos(rad), y2 = 18 + 11 * Math.sin(rad);
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(255,255,255,0.7)" strokeWidth="3" strokeLinecap="round" />;
      })}
    </svg>
  );
}

// Shield (gateway/LB)
export function GatewayIcon({ color: _color, size = 36 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 36 36">
      <path d="M18 6 L28 10 L28 20 Q28 27 18 31 Q8 27 8 20 L8 10 Z" fill="rgba(255,255,255,0.2)" stroke="rgba(255,255,255,0.7)" strokeWidth="1.5" />
      <line x1="18" y1="14" x2="18" y2="24" stroke="rgba(255,255,255,0.8)" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="13" y1="19" x2="23" y2="19" stroke="rgba(255,255,255,0.8)" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

// Globe (third-party)
export function ThirdPartyIcon({ color: _color, size = 36 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 36 36">
      <circle cx="18" cy="18" r="11" fill="rgba(255,255,255,0.1)" stroke="rgba(255,255,255,0.7)" strokeWidth="1.5" />
      <ellipse cx="18" cy="18" rx="6" ry="11" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="1" />
      <line x1="7" y1="18" x2="29" y2="18" stroke="rgba(255,255,255,0.5)" strokeWidth="1" />
      <line x1="10" y1="12" x2="26" y2="12" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
      <line x1="10" y1="24" x2="26" y2="24" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
    </svg>
  );
}

// Brain / neural (LLM provider)
export function LLMIcon({ color: _color, size = 36 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 36 36">
      <circle cx="18" cy="18" r="8" fill="rgba(255,255,255,0.15)" stroke="rgba(255,255,255,0.7)" strokeWidth="1.5" />
      <circle cx="18" cy="18" r="3" fill="rgba(255,255,255,0.5)" />
      <line x1="18" y1="10" x2="18" y2="7" stroke="rgba(255,255,255,0.7)" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="18" y1="26" x2="18" y2="29" stroke="rgba(255,255,255,0.7)" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="10" y1="18" x2="7" y2="18" stroke="rgba(255,255,255,0.7)" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="26" y1="18" x2="29" y2="18" stroke="rgba(255,255,255,0.7)" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="12.3" y1="12.3" x2="10.2" y2="10.2" stroke="rgba(255,255,255,0.7)" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="23.7" y1="23.7" x2="25.8" y2="25.8" stroke="rgba(255,255,255,0.7)" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="23.7" y1="12.3" x2="25.8" y2="10.2" stroke="rgba(255,255,255,0.7)" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="12.3" y1="23.7" x2="10.2" y2="25.8" stroke="rgba(255,255,255,0.7)" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

// Webhook arrow
export function WebhookIcon({ color: _color, size = 36 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 36 36">
      <path d="M8 18 Q8 10 18 10 Q28 10 28 18 Q28 26 18 26" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="1.5" strokeLinecap="round" />
      <polygon points="14,22 18,28 22,22" fill="rgba(255,255,255,0.8)" />
    </svg>
  );
}

// Clock (cron)
export function CronIcon({ color: _color, size = 36 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 36 36">
      <circle cx="18" cy="18" r="12" fill="rgba(255,255,255,0.1)" stroke="rgba(255,255,255,0.7)" strokeWidth="1.5" />
      <line x1="18" y1="10" x2="18" y2="18" stroke="rgba(255,255,255,0.9)" strokeWidth="2" strokeLinecap="round" />
      <line x1="18" y1="18" x2="24" y2="22" stroke="rgba(255,255,255,0.7)" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="18" cy="18" r="1.5" fill="rgba(255,255,255,0.9)" />
    </svg>
  );
}

// Redis-style (cache)
export function CacheIcon({ color: _color, size = 36 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 36 36">
      <ellipse cx="18" cy="14" rx="10" ry="4" fill="rgba(255,255,255,0.2)" stroke="rgba(255,255,255,0.7)" strokeWidth="1.5" />
      <rect x="8" y="14" width="20" height="8" fill="rgba(255,255,255,0.1)" />
      <ellipse cx="18" cy="22" rx="10" ry="4" fill="rgba(255,255,255,0.15)" stroke="rgba(255,255,255,0.7)" strokeWidth="1.5" />
      <line x1="8" y1="14" x2="8" y2="22" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" />
      <line x1="28" y1="14" x2="28" y2="22" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" />
    </svg>
  );
}

// Plus / star (custom)
export function CustomIcon({ color: _color, size = 36 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 36 36">
      <circle cx="18" cy="18" r="12" fill="rgba(255,255,255,0.1)" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" strokeDasharray="3 2" />
      <line x1="18" y1="11" x2="18" y2="25" stroke="rgba(255,255,255,0.8)" strokeWidth="2" strokeLinecap="round" />
      <line x1="11" y1="18" x2="25" y2="18" stroke="rgba(255,255,255,0.8)" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export const COMPONENT_ICONS: Record<ComponentType, React.FC<IconProps>> = {
  service: ServiceIcon,
  worker: WorkerIcon,
  queue: HexagonIcon,
  "sql-db": CylinderIcon,
  "nosql-db": CylinderIcon,
  cache: CacheIcon,
  "object-storage": CloudIcon,
  gateway: GatewayIcon,
  "third-party": ThirdPartyIcon,
  "llm-provider": LLMIcon,
  webhook: WebhookIcon,
  cron: CronIcon,
  custom: CustomIcon,
};
