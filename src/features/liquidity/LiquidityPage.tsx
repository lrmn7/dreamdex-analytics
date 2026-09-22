import React, { useRef } from "react";
import { useLiquidityAnalytics } from "@/data/hooks";
import { formatCurrency, formatBps } from "@/lib/formatters";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { DataPanel } from "@/components/ui/DataPanel";
import { AreaChart } from "@/components/charts/AreaChart";

export const LiquidityPage: React.FC = () => {
  const { points } = useLiquidityAnalytics();
  const containerRef = useRef<HTMLDivElement>(null);

  const latestPoint = points[points.length - 1] || {
    depthTotalUsd: 14850000,
    bidDepthUsd: 7573500,
    askDepthUsd: 7276500,
    spreadBps: 3.8,
  };

  return (
    <div ref={containerRef} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-14 font-sans">
      <div className="liquidity-header">
        <SectionHeader
          tag="Liquidity Analytics"
          title="Order Book Depth & Spreads"
          size="large"
          description="Analysis of resting limit orders committed to the dreamDEX order books on Somnia."
        />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-8">
        <div className="liquidity-kpi-item space-y-1.5 border-l-2 border-text-primary pl-5">
          <div className="text-[11px] font-mono uppercase tracking-[0.15em] text-text-muted">Total Visible Depth</div>
          <div className="text-3xl sm:text-4xl font-mono font-bold text-text-primary tracking-tight">
            {formatCurrency(latestPoint.depthTotalUsd, { compact: false })}
          </div>
          <div className="text-xs text-text-muted">All pairs active on-chain</div>
        </div>
        <div className="liquidity-kpi-item space-y-1.5 border-l border-border pl-5">
          <div className="text-[11px] font-mono uppercase tracking-[0.15em] text-text-muted">Bid Side Depth</div>
          <div className="text-2xl sm:text-3xl font-mono font-semibold text-text-primary tracking-tight">
            {formatCurrency(latestPoint.bidDepthUsd, { compact: false })}
          </div>
          <div className="text-xs text-text-muted">Resting buy commitments</div>
        </div>
        <div className="liquidity-kpi-item space-y-1.5 border-l border-border pl-5">
          <div className="text-[11px] font-mono uppercase tracking-[0.15em] text-text-muted">Ask Side Depth</div>
          <div className="text-2xl sm:text-3xl font-mono font-semibold text-text-primary tracking-tight">
            {formatCurrency(latestPoint.askDepthUsd, { compact: false })}
          </div>
          <div className="text-xs text-text-muted">Resting sell commitments</div>
        </div>
        <div className="liquidity-kpi-item space-y-1.5 border-l border-border pl-5">
          <div className="text-[11px] font-mono uppercase tracking-[0.15em] text-text-muted">Average Spread</div>
          <div className="text-2xl sm:text-3xl font-mono font-semibold text-text-primary tracking-tight">
            {formatBps(latestPoint.spreadBps)}
          </div>
          <div className="text-xs text-text-muted">Top-of-book distance</div>
        </div>
      </div>

      <div className="section-hairline" />

      <div className="liquidity-chart">
        <DataPanel
          title="30-Day Resting Book Depth Trend"
          subtitle="Tracking committed liquidity across bids and asks"
        >
          <AreaChart
            data={points.map((p) => ({
              timestamp: p.timestamp,
              value: p.depthTotalUsd,
              secondaryValue: p.bidDepthUsd,
            }))}
            height={320}
            showSecondary={true}
            primaryLabel="Total Depth"
            secondaryLabel="Bid Depth"
          />
        </DataPanel>
      </div>

      <div className="liquidity-panels grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="panel-left">
          <DataPanel
            title="Collateral Yield Mechanism"
            subtitle="Proximity-weighted Gaussian yield distribution"
          >
            <div className="space-y-4 text-xs font-sans text-text-secondary leading-[1.7]">
              <p>
                Rather than traditional maker rebates per fill, dreamDEX rewards resting open interest.
                Orders placed close to the current market mid-price receive higher weighting according to a
                Gaussian distribution:
              </p>
              <div className="p-4 bg-surface-2 border border-border-subtle font-mono text-text-primary text-[11px] text-center tracking-wider">
                W = exp( − (P_order − P_mid)² / (2 · σ²) )
              </div>
              <p>
                This incentivizes tight spreads and dependable book depth for takers without extracting value from
                executed trades.
              </p>
            </div>
          </DataPanel>
        </div>

        <div className="panel-right">
          <DataPanel
            title="Scope Separation Policy"
            subtitle="Understanding the boundary between book depth and lending"
          >
            <div className="space-y-4 text-xs font-sans text-text-secondary leading-[1.7]">
              <p>
                This analytics hub enforces strict scope separation:
              </p>
              <ul className="space-y-3">
                <li className="flex gap-3">
                  <span className="w-1 h-1 rounded-full bg-text-primary mt-1.5 shrink-0" />
                  <span><span className="text-text-primary font-medium">Spot Book Liquidity:</span> Actual resting limit orders in SpotPool contracts that can be filled immediately.</span>
                </li>
                <li className="flex gap-3">
                  <span className="w-1 h-1 rounded-full bg-text-muted mt-1.5 shrink-0" />
                  <span><span className="text-text-primary font-medium">SomniaLend Reserves:</span> Supplied pool collateral in lending contracts earning borrow interest, distinct from exchange books.</span>
                </li>
                <li className="flex gap-3">
                  <span className="w-1 h-1 rounded-full bg-text-muted mt-1.5 shrink-0" />
                  <span><span className="text-text-primary font-medium">Event Contracts:</span> Outcome-based prediction tokens with distinct collateral resolution pools.</span>
                </li>
              </ul>
            </div>
          </DataPanel>
        </div>
      </div>
    </div>
  );
};
