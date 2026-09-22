import React from "react";
import { DataSourceType } from "@/domain/market";
import { Tooltip } from "./Tooltip";

export interface StatusBadgeProps {
  source?: DataSourceType;
  status?: "connected" | "connecting" | "stale" | "unavailable" | "healthy" | "degraded";
  label?: string;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  source,
  status,
  label,
  className = "",
}) => {
  const sourceDescriptions: Record<DataSourceType, string> = {
    live: "Streaming in real time via dreamDEX public WebSocket.",
    api: "Polled directly from the official dreamDEX HTTP REST API.",
    "on-chain": "Direct smart contract read or event log from Somnia network.",
    indexed: "Stored and aggregated historically in analytical rollups.",
    calculated: "Mathematically derived using documented exchange formulas.",
  };

  if (source) {
    const badgeText = label || source.toUpperCase();
    const tooltipText = sourceDescriptions[source];

    return (
      <Tooltip content={tooltipText}>
        <span
          className={`inline-flex items-center px-1.5 py-0.5 rounded-sm text-[10px] font-mono tracking-wider uppercase font-semibold border ${
            source === "live"
              ? "bg-text-primary text-black border-text-primary"
              : source === "calculated"
              ? "bg-surface-3 text-text-secondary border-border-strong"
              : "bg-surface-2 text-text-secondary border-border"
          } ${className}`}
        >
          {badgeText}
        </span>
      </Tooltip>
    );
  }

  const statusStyles: Record<string, { indicator: string; text: string; label: string }> = {
    connected: {
      indicator: "w-1.5 h-1.5 rounded-full bg-text-primary shadow-[0_0_8px_rgba(255,255,255,0.4)]",
      text: "text-text-primary",
      label: "LIVE",
    },
    connecting: {
      indicator: "w-1.5 h-1.5 rounded-full bg-text-muted animate-pulse",
      text: "text-text-muted",
      label: "CONNECTING",
    },
    stale: {
      indicator: "w-1.5 h-1.5 rounded-full border border-text-faint",
      text: "text-text-faint",
      label: "STALE",
    },
    unavailable: {
      indicator: "w-1.5 h-1.5 rounded-full bg-text-faint",
      text: "text-text-faint",
      label: "OFFLINE",
    },
    healthy: {
      indicator: "w-1.5 h-1.5 rounded-full bg-text-primary",
      text: "text-text-primary",
      label: "HEALTHY",
    },
    degraded: {
      indicator: "w-1.5 h-1.5 rounded-full border border-text-muted",
      text: "text-text-muted",
      label: "DEGRADED",
    },
  };

  const current = status ? statusStyles[status] || statusStyles.unavailable : statusStyles.connected;
  const displayLabel = label || current.label;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-mono border border-border bg-surface-1 ${current.text} ${className}`}
    >
      <span className={current.indicator} aria-hidden="true" />
      <span>{displayLabel}</span>
    </span>
  );
};
