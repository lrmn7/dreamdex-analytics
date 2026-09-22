import React, { useState, useRef } from "react";
import { useVolumeAnalytics } from "@/data/hooks";
import { formatCurrency } from "@/lib/formatters";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { DataPanel } from "@/components/ui/DataPanel";
import { AreaChart } from "@/components/charts/AreaChart";
import { Link } from "react-router-dom";

export const VolumePage: React.FC = () => {
  const [range, setRange] = useState<"24h" | "7d" | "30d" | "90d">("30d");
  const { points, marketBreakdown } = useVolumeAnalytics(range);
  const containerRef = useRef<HTMLDivElement>(null);

  const ranges: Array<"24h" | "7d" | "30d" | "90d"> = ["24h", "7d", "30d", "90d"];
  const totalRangeVolume = points.reduce((sum, p) => sum + p.volumeUsd, 0);

  return (
    <div ref={containerRef} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-14 font-sans">
      <div className="volume-header">
        <SectionHeader
          tag="Volume Analytics"
          title="Protocol Trading Volume"
          size="large"
          description="Historical quote-volume of executed spot trades on dreamDEX across all active markets."
          action={
            <div className="flex items-center gap-1 bg-surface-2 p-0.5 rounded-sm border border-border">
              {ranges.map((r) => (
                <button
                  key={r}
                  onClick={() => setRange(r)}
                  className={`px-3 py-1.5 text-xs font-mono rounded-sm transition-colors ${
                    range === r
                      ? "bg-text-primary text-black font-semibold"
                      : "text-text-secondary hover:text-text-primary"
                  }`}
                >
                  {r.toUpperCase()}
                </button>
              ))}
            </div>
          }
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-8 gap-y-6">
        <div className="volume-kpi-item space-y-1.5 border-l-2 border-text-primary pl-5">
          <div className="text-[11px] font-mono uppercase tracking-[0.15em] text-text-muted">Total Volume ({range.toUpperCase()})</div>
          <div className="text-3xl sm:text-4xl font-mono font-bold text-text-primary tracking-tight">
            {formatCurrency(totalRangeVolume, { compact: false })}
          </div>
          <div className="text-xs text-text-muted">Aggregated quote-flow across all spot markets</div>
        </div>
        <div className="volume-kpi-item space-y-1.5 border-l border-border pl-5">
          <div className="text-[11px] font-mono uppercase tracking-[0.15em] text-text-muted">Active Spot Pairs</div>
          <div className="text-2xl sm:text-3xl font-mono font-semibold text-text-primary tracking-tight">
            {marketBreakdown.length}
          </div>
          <div className="text-xs text-text-muted">On-chain CLOB order books</div>
        </div>
        <div className="volume-kpi-item space-y-1.5 border-l border-border pl-5">
          <div className="text-[11px] font-mono uppercase tracking-[0.15em] text-text-muted">Daily Average</div>
          <div className="text-2xl sm:text-3xl font-mono font-semibold text-text-primary tracking-tight">
            {points.length > 0 ? formatCurrency(totalRangeVolume / points.length) : "$0.00"}
          </div>
          <div className="text-xs text-text-muted">Normalized 24-hour throughput</div>
        </div>
      </div>

      <div className="volume-chart">
        <DataPanel
          title={`Volume Over Time (${range.toUpperCase()})`}
          subtitle="Aggregated from real daily OHLCV candlestick series across active spot markets"
        >
          <AreaChart
            data={points.map((p) => ({
              timestamp: p.timestamp,
              value: p.volumeUsd,
            }))}
            height={320}
            showSecondary={false}
            primaryLabel="Total Volume"
          />
        </DataPanel>
      </div>

      <div className="volume-breakdown">
        <DataPanel
          title="Volume Concentration by Market"
          subtitle="Distribution of spot trading flow across active pairs"
        >
          <div className="space-y-5 font-mono">
            {(() => {
              const total24hBreakdown = marketBreakdown.reduce((sum, m) => sum + m.volumeUsd, 0);
              return marketBreakdown.map((m) => {
                const pct = total24hBreakdown > 0 ? (m.volumeUsd / total24hBreakdown) * 100 : 0;
                return (
                  <div key={m.symbol} className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <Link
                        to={`/markets/${m.symbol}`}
                        className="text-text-primary hover:text-white font-medium font-sans"
                      >
                        {m.symbol}
                      </Link>
                      <div className="flex items-center gap-5 text-text-secondary">
                        <span>{formatCurrency(m.volumeUsd, { compact: true })}</span>
                        <span className="w-12 text-right text-text-muted tabular-nums">{pct.toFixed(1)}%</span>
                      </div>
                    </div>
                    <div className="h-1 w-full bg-surface-2 overflow-hidden">
                      <div
                        className="breakdown-bar h-full bg-text-primary"
                        style={{ width: `${Math.max(pct, 2)}%` }}
                      />
                    </div>
                  </div>
                );
              });
            })()}
          </div>
        </DataPanel>
      </div>
    </div>
  );
};
