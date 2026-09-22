import React, { useState, useRef } from "react";
import { useLiveTrades, useMarkets } from "@/data/hooks";
import { formatNumber, formatCurrency, formatTimestamp, formatRelativeTime } from "@/lib/formatters";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

export const TradesPage: React.FC = () => {
  const { markets } = useMarkets();
  const [selectedSymbol, setSelectedSymbol] = useState("SOMI:USDso");
  const [sideFilter, setSideFilter] = useState<"all" | "buy" | "sell">("all");
  const [minUsdFilter, setMinUsdFilter] = useState<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const { trades, wsState } = useLiveTrades(selectedSymbol);

  useGSAP(
    () => {
      const tl = gsap.timeline({ defaults: { ease: "power2.out" } });
      tl.from(".trades-header", { opacity: 0, y: 10, duration: 0.35 })
        .from(".trades-filter", { opacity: 0, y: 8, duration: 0.3 }, "-=0.1")
        .from(".trades-table", { opacity: 0, duration: 0.4 }, "-=0.1");
    },
    { scope: containerRef }
  );

  const filteredTrades = trades.filter((t) => {
    if (sideFilter !== "all" && t.side !== sideFilter) return false;
    const cost = parseFloat(t.cost || "0");
    if (minUsdFilter > 0 && cost < minUsdFilter) return false;
    return true;
  });

  return (
    <div ref={containerRef} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-8 font-sans">
      <div className="trades-header">
        <SectionHeader
        tag="Real-Time Feed"
        title="Live Executed Fills"
        size="large"
        description="Streaming trade execution events direct from dreamDEX public WebSocket on Somnia."
        action={
          <div className="flex flex-wrap items-center gap-3">
            <StatusBadge status={wsState} />
            <select
              value={selectedSymbol}
              onChange={(e) => setSelectedSymbol(e.target.value)}
              className="bg-surface-2 border border-border text-text-primary text-xs font-mono rounded-sm px-3 py-1.5 focus:outline-none focus:border-border-strong"
            >
              {markets.map((m) => (
                <option key={m.symbol} value={m.symbol}>
                  {m.symbol}
                </option>
              ))}
            </select>
          </div>
        }
      />
      </div>
      <div className="trades-filter flex flex-wrap items-center justify-between gap-4 py-3 border-y border-border text-xs font-mono">
        <div className="flex items-center gap-2">
          <span className="text-text-muted uppercase text-[11px] tracking-wider">Side</span>
          {(["all", "buy", "sell"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setSideFilter(s)}
              className={`px-2.5 py-1 rounded-sm transition-colors uppercase ${
                sideFilter === s
                  ? "bg-text-primary text-black font-semibold"
                  : "text-text-secondary hover:text-text-primary"
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-text-muted uppercase text-[11px] tracking-wider">Min Value</span>
          {[0, 100, 1000, 10000].map((amt) => (
            <button
              key={amt}
              onClick={() => setMinUsdFilter(amt)}
              className={`px-2.5 py-1 rounded-sm transition-colors ${
                minUsdFilter === amt
                  ? "bg-text-primary text-black font-semibold"
                  : "text-text-secondary hover:text-text-primary"
              }`}
            >
              {amt === 0 ? "All" : `≥ $${amt >= 1000 ? `${amt / 1000}k` : amt}`}
            </button>
          ))}
        </div>
      </div>
      <div className="trades-table border border-border bg-surface-1 overflow-hidden rounded-sm">
        <table className="w-full text-left text-xs font-sans">
          <thead>
            <tr className="border-b border-border bg-surface-2 text-text-muted font-mono uppercase tracking-wider text-[11px]">
              <th className="py-3 px-5 font-medium">Time</th>
              <th className="py-3 px-5 font-medium">Market</th>
              <th className="py-3 px-5 font-medium">Side</th>
              <th className="py-3 px-5 font-medium text-right">Price (USDso)</th>
              <th className="py-3 px-5 font-medium text-right">Amount</th>
              <th className="py-3 px-5 font-medium text-right hidden sm:table-cell">Value (USD)</th>
              <th className="py-3 px-5 font-medium text-right hidden lg:table-cell">Trade ID</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle font-mono">
            {filteredTrades.map((t, idx) => (
              <tr key={t.id} className={`table-row-interactive ${idx === 0 ? "animate-trade-flash" : ""}`}>
                <td className="py-3 px-5 text-text-secondary">
                  <span>{formatTimestamp(t.timestamp)}</span>
                  <span className="text-[10px] text-text-faint ml-2 hidden sm:inline">
                    ({formatRelativeTime(t.timestamp)})
                  </span>
                </td>
                <td className="py-3 px-5 text-text-primary font-medium font-sans">{t.symbol}</td>
                <td className="py-3 px-5">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 text-[10px] font-semibold uppercase ${
                      t.side === "buy"
                        ? "bg-text-primary text-black"
                        : "bg-surface-3 text-text-secondary border border-border-subtle"
                    }`}
                  >
                    {t.side}
                  </span>
                </td>
                <td className="py-3 px-5 text-right text-text-primary font-medium">
                  {formatCurrency(t.price, { decimals: t.symbol.includes("WBTC") ? 2 : 4 })}
                </td>
                <td className="py-3 px-5 text-right text-text-secondary">
                  {formatNumber(t.amount, 4)}
                </td>
                <td className="py-3 px-5 text-right text-text-primary hidden sm:table-cell">
                  {formatCurrency(t.cost || parseFloat(t.price) * parseFloat(t.amount))}
                </td>
                <td className="py-3 px-5 text-right text-text-faint text-[11px] hidden lg:table-cell">
                  {t.id.slice(0, 12)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
