import React from "react";
import { useDataHealth } from "@/data/hooks";
import { formatTimeAgo } from "@/lib/formatters";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/Button";

export const StatusPage: React.FC = () => {
  const { services, loading, lastUpdated, refetch } = useDataHealth();

  const allOperational = services.every((s) => s.status === "operational");

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 border-b border-border pb-8">
        <div>
          <h1 className="text-3xl font-sans font-semibold tracking-tight text-text-primary">
            Service Availability
          </h1>
          <p className="mt-2 text-sm text-text-secondary font-sans leading-relaxed max-w-xl">
            Verified operational status of public market feeds, realtime order book streams,
            and analytics aggregation across dreamDEX.
          </p>
        </div>

        <div className="shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={refetch}
            disabled={loading}
            className="flex items-center gap-2 font-mono text-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            Run Verification
          </Button>
        </div>
      </div>
      <div className="py-4 px-5 border border-border bg-surface-1 rounded-sm border-l-2 border-text-primary flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <span className="w-2 h-2 rounded-full bg-text-primary animate-pulse" />
            <span className="text-sm font-sans font-medium text-text-primary">
              {allOperational ? "All Protocol Feeds Operational" : "Service Interruption Detected"}
            </span>
          </div>
          <p className="text-xs text-text-secondary font-sans">
            {allOperational
              ? "Market discovery, realtime order book streaming, and historical aggregations are operating normally."
              : "One or more telemetry endpoints are experiencing elevated response times or transport drops."}
          </p>
        </div>

        <div className="text-xs font-mono text-text-muted whitespace-nowrap">
          Verified {formatTimeAgo(Date.parse(lastUpdated))}
        </div>
      </div>

      <div className="space-y-6">
        <h2 className="text-xs font-mono uppercase tracking-wider text-text-muted font-semibold">
          Verified Capabilities
        </h2>

        <div className="divide-y divide-border border border-border bg-surface-1 rounded-sm overflow-hidden">
          {services.map((svc) => (
            <div
              key={svc.category}
              className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-surface-2/40 transition-colors"
            >
              <div className="space-y-1 max-w-lg">
                <div className="flex items-center gap-2.5">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-text-muted">
                    {svc.category}
                  </span>
                  <span className="text-xs text-text-muted">·</span>
                  <span className="text-sm font-sans font-medium text-text-primary">
                    {svc.name}
                  </span>
                </div>
                <p className="text-xs text-text-secondary font-sans leading-relaxed">
                  {svc.summary}
                </p>
              </div>

              <div className="flex items-center gap-4 shrink-0 sm:self-center">
                {svc.latencyMs !== undefined && (
                  <span className="text-xs font-mono text-text-muted">
                    {svc.latencyMs} ms
                  </span>
                )}
                <span
                  className={`px-2.5 py-1 text-[11px] font-mono rounded-sm uppercase font-semibold border ${
                    svc.status === "operational"
                      ? "bg-surface-2 text-text-primary border-border"
                      : svc.status === "degraded"
                      ? "bg-surface-3 text-text-primary border-border-strong"
                      : "bg-surface-1 text-text-muted border-border-subtle"
                  }`}
                >
                  {svc.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="pt-4 border-t border-border-subtle text-xs text-text-muted font-sans leading-relaxed space-y-2">
        <p>
          Status indicators reflect actual end-to-end probes executed directly from your browser session
          against dreamDEX public gateway endpoints. Realtime checks evaluate WebSocket packet exchange
          and keepalive heartbeats.
        </p>
      </div>
    </div>
  );
};
