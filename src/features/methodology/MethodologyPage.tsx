import React from "react";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { DataPanel } from "@/components/ui/DataPanel";
import { Rule } from "@/components/ui/Rule";

export const MethodologyPage: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      <SectionHeader
        tag="Data Transparency"
        title="Metrics & Calculation Methodology"
        description="Comprehensive formulas, source classifications, and architectural scope definitions used across the platform."
      />

      <div className="space-y-8 text-xs font-sans text-text-secondary leading-relaxed">
        <DataPanel
          title="1. Source Classification System"
          subtitle="Every metric displayed is tagged with its provenance"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs">
            <div className="p-3.5 rounded bg-surface-2 border border-border-subtle space-y-1">
              <span className="text-text-primary font-bold">LIVE</span>
              <p className="font-sans text-text-secondary text-[11px]">
                Real-time streaming feeds from the dreamDEX public WebSocket connection. Updated continuously with sub-second latency.
              </p>
            </div>
            <div className="p-3.5 rounded bg-surface-2 border border-border-subtle space-y-1">
              <span className="text-text-primary font-bold">SOURCE API</span>
              <p className="font-sans text-text-secondary text-[11px]">
                Data polled directly from official dreamDEX HTTP REST endpoints without transformation.
              </p>
            </div>
            <div className="p-3.5 rounded bg-surface-2 border border-border-subtle space-y-1">
              <span className="text-text-primary font-bold">ON-CHAIN</span>
              <p className="font-sans text-text-secondary text-[11px]">
                Smart contract reads (view functions) or verified event logs indexed directly from Somnia Mainnet.
              </p>
            </div>
            <div className="p-3.5 rounded bg-surface-2 border border-border-subtle space-y-1">
              <span className="text-text-primary font-bold">INDEXED / CALCULATED</span>
              <p className="font-sans text-text-secondary text-[11px]">
                Derived metrics aggregated and computed using documented mathematical models and persisted in analytical storage.
              </p>
            </div>
          </div>
        </DataPanel>
        <DataPanel
          title="2. Mathematical Formulations"
          subtitle="Exact definitions used for spreads, mid-prices, and proximity rewards"
        >
          <div className="space-y-6">
            <div className="space-y-2">
              <h4 className="font-sans font-semibold text-text-primary text-sm">
                Market Mid-Price & Spread in Basis Points
              </h4>
              <p>
                When a market has both valid resting bids and asks, the mid-price and spread in basis points are calculated as:
              </p>
              <div className="p-3 rounded bg-surface-2 border border-border-subtle font-mono text-text-primary text-[11px] space-y-1">
                <div>mid_price = (best_bid + best_ask) / 2</div>
                <div>spread = best_ask - best_bid</div>
                <div>spread_bps = ((best_ask - best_bid) / mid_price) * 10,000</div>
              </div>
              <p className="text-text-faint">
                If either the bid or ask side is completely empty, the spread is reported as Unavailable rather than 0.
              </p>
            </div>

            <Rule />

            <div className="space-y-2">
              <h4 className="font-sans font-semibold text-text-primary text-sm">
                Proximity-Weighted Maker Yield
              </h4>
              <p>
                dreamDEX rewards resting open interest according to order proximity to the current market mid-price:
              </p>
              <div className="p-3 rounded bg-surface-2 border border-border-subtle font-mono text-text-primary text-[11px] space-y-1">
                <div>W = exp( - (P_order - P_mid)^2 / (2 * sigma^2) )</div>
                <div>score = quantity * W * seconds_resting</div>
                <div>payout = total_yield_pool * (maker_score / sum_all_maker_scores)</div>
              </div>
              <p className="text-text-faint">
                Orders with limit prices furthest from the mid-price experience exponential decay in yield rewards.
              </p>
            </div>

            <Rule />

            <div className="space-y-2">
              <h4 className="font-sans font-semibold text-text-primary text-sm">
                Global Spot Trading Volume
              </h4>
              <p>
                Total volume over any given time window [since, until) is defined as the sum of the quote values (in USDso)
                of all matched OrderFilled events executed on the exchange contracts.
              </p>
            </div>
          </div>
        </DataPanel>
        <DataPanel
          title="3. Protocol Scope & TVL Boundaries"
          subtitle="Non-conflation of spot order book depth and lending reserves"
        >
          <div className="space-y-3">
            <p>
              To maintain institutional-grade transparency, this platform enforces three strict scope boundaries:
            </p>
            <ol className="list-decimal pl-4 space-y-2">
              <li>
                <span className="text-text-primary font-medium">Spot CLOB Liquidity:</span> Represents genuine resting capital in SpotPool contracts that can be filled immediately by market takers.
              </li>
              <li>
                <span className="text-text-primary font-medium">SomniaLend Reserves:</span> Assets supplied to money-market contracts earning variable interest. These are never aggregated into spot exchange TVL.
              </li>
              <li>
                <span className="text-text-primary font-medium">Event Contracts:</span> Outcome predictions utilizing dedicated event outcome contracts and separate settlement collateral.
              </li>
            </ol>
          </div>
        </DataPanel>
        <div className="p-4 rounded-lg border border-border-subtle bg-surface-1 font-mono text-xs flex items-center justify-between text-text-muted">
          <span>Active Specification: methodology-v1.0</span>
          <span>Last Updated: September 2026</span>
        </div>
      </div>
    </div>
  );
};
