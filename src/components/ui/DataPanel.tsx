import React from "react";
import { DataMeta } from "@/domain/market";
import { StatusBadge } from "./StatusBadge";
import { formatRelativeTime } from "@/lib/formatters";

export interface DataPanelProps {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  action?: React.ReactNode;
  meta?: DataMeta;
  children: React.ReactNode;
  className?: string;
  bodyClassName?: string;
  noPadding?: boolean;
  showFooter?: boolean;
}

export const DataPanel: React.FC<DataPanelProps> = ({
  title,
  subtitle,
  action,
  meta,
  children,
  className = "",
  bodyClassName = "",
  noPadding = false,
  showFooter = false,
}) => {
  return (
    <div
      className={`bg-surface-1 border border-border rounded-sm overflow-hidden flex flex-col ${className}`}
    >
      {(title || action || meta) && (
        <div className="px-4 py-3 border-b border-border-subtle flex items-center justify-between gap-4">
          <div>
            {title && (
              <h3 className="text-sm font-sans font-medium text-text-primary tracking-tight">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="text-xs text-text-muted mt-0.5">{subtitle}</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            {meta && <StatusBadge source={meta.source} />}
            {action}
          </div>
        </div>
      )}

      <div className={`flex-1 ${noPadding ? "" : "p-4"} ${bodyClassName}`}>
        {children}
      </div>

      {showFooter && meta && meta.updatedAt && (
        <div className="px-4 py-2 border-t border-border-subtle bg-surface-2 text-[11px] font-mono text-text-faint flex items-center justify-between">
          <span>Source: {meta.sourceEndpoint || meta.source.toUpperCase()}</span>
          <span>Updated {formatRelativeTime(new Date(meta.updatedAt).getTime())}</span>
        </div>
      )}
    </div>
  );
};
