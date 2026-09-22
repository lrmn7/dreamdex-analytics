import React, { useState, useEffect, useRef } from "react";
import { Trade, TradeSide } from "@/domain/trade";
import { formatAddress, formatRelativeTime, formatPrice, formatNumber, formatCurrency } from "@/lib/formatters";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { dreamDexRest } from "@/data/dreamdex/rest/client";
import { dreamDexWs } from "@/data/dreamdex/websocket/manager";
import { ExternalLink, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

export const ActivityPage: React.FC = () => {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [selectedSide, setSelectedSide] = useState<"all" | TradeSide>("all");
  const [selectedSymbol, setSelectedSymbol] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const tl = gsap.timeline({ defaults: { ease: "power2.out" } });
      tl.from(".activity-header", { opacity: 0, y: 10, duration: 0.35 })
        .from(".activity-filters", { opacity: 0, y: 8, duration: 0.3 }, "-=0.1")
        .from(".activity-table", { opacity: 0, duration: 0.4 }, "-=0.1");
    },
    { scope: containerRef }
  );

  const loadTrades = async () => {
    setLoading(true);
    try {
      const [somiTrades, wethTrades, wbtcTrades, usdcTrades] = await Promise.all([
        dreamDexRest.fetchRecentTrades("SOMI:USDso", 25),
        dreamDexRest.fetchRecentTrades("WETH:USDso", 15),
        dreamDexRest.fetchRecentTrades("WBTC:USDso", 15),
        dreamDexRest.fetchRecentTrades("USDC.e:USDso", 15),
      ]);

      const all = [...somiTrades, ...wethTrades, ...wbtcTrades, ...usdcTrades];
      all.sort((a, b) => b.timestamp - a.timestamp);
      setTrades(all);
    } catch (err) {
      console.warn("Could not load recent trades:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTrades();

    dreamDexWs.subscribe("trades", { symbols: ["SOMI:USDso", "WETH:USDso", "WBTC:USDso"] });

    const unsubMsg = dreamDexWs.onMessage((msg) => {
      if (msg.channel === "trades" && msg.type === "update" && msg.trade) {
        setTrades((prev) => {
          if (prev.some((t) => t.id === msg.trade.id)) return prev;
          return [msg.trade, ...prev.slice(0, 99)];
        });
      }
    });

    const interval = setInterval(loadTrades, 30000);
    return () => {
      dreamDexWs.unsubscribe("trades", { symbols: ["SOMI:USDso", "WETH:USDso", "WBTC:USDso"] });
      unsubMsg();
      clearInterval(interval);
    };
  }, []);

  const filteredTrades = trades.filter((t) => {
    if (selectedSide !== "all" && t.side !== selectedSide) return false;
    if (selectedSymbol !== "all" && t.symbol !== selectedSymbol) return false;
    return true;
  });

  return (
    <div ref={containerRef} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-8 font-sans">
      <div className="activity-header">
        <SectionHeader
          tag="On-Chain Settlement"
          title="Protocol Activity & Verified Fills"
          size="large"
          description="Real executed trades and transaction hashes settled directly on the dreamDEX spot order books."
          action={
            <Button
              variant="outline"
              size="sm"
              onClick={loadTrades}
              disabled={loading}
              className="flex items-center gap-2 text-xs font-mono"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          }
        />
      </div>

      <div className="activity-filters flex flex-wrap items-center justify-between gap-3 py-3 border-y border-border text-xs font-mono">
        <div className="flex items-center gap-2">
          <span className="text-text-muted uppercase text-[11px] tracking-wider">Side</span>
          {(["all", "buy", "sell"] as const).map((side) => (
            <button
              key={side}
              onClick={() => setSelectedSide(side)}
              className={`px-2.5 py-1 rounded-sm transition-colors ${
                selectedSide === side
                  ? "bg-text-primary text-black font-semibold"
                  : "text-text-secondary hover:text-text-primary"
              }`}
            >
              {side.toUpperCase()}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-text-muted uppercase text-[11px] tracking-wider">Market</span>
          {["all", "SOMI:USDso", "WETH:USDso", "WBTC:USDso"].map((sym) => (
            <button
              key={sym}
              onClick={() => setSelectedSymbol(sym)}
              className={`px-2.5 py-1 rounded-sm transition-colors ${
                selectedSymbol === sym
                  ? "bg-text-primary text-black font-semibold"
                  : "text-text-secondary hover:text-text-primary"
              }`}
            >
              {sym === "all" ? "ALL" : sym.split(":")[0]}
            </button>
          ))}
        </div>
      </div>

      <div className="activity-table border border-border bg-surface-1 rounded-sm overflow-hidden">
        <table className="w-full text-left text-xs font-sans">
          <thead>
            <tr className="border-b border-border bg-surface-2 text-text-muted font-mono uppercase tracking-wider text-[11px]">
              <th className="py-3 px-5 font-medium">Side</th>
              <th className="py-3 px-5 font-medium">Market</th>
              <th className="py-3 px-5 font-medium text-right">Execution Price</th>
              <th className="py-3 px-5 font-medium text-right">Amount</th>
              <th className="py-3 px-5 font-medium text-right hidden sm:table-cell">Notional</th>
              <th className="py-3 px-5 font-medium text-right">Time</th>
              <th className="py-3 px-5 font-medium text-right hidden lg:table-cell">Tx</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle font-mono">
            {loading && trades.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-16 text-center text-text-muted">
                  Querying verified executions...
                </td>
              </tr>
            ) : filteredTrades.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-16 text-center text-text-muted">
                  No verified fills recorded for this selection.
                </td>
              </tr>
            ) : (
              filteredTrades.map((t, idx) => (
                <tr key={t.id} className={`table-row-interactive ${idx === 0 ? "animate-trade-flash" : ""}`}>
                  <td className="py-3 px-5">
                    <span className={t.side === "buy" ? "badge-execution-buy" : "badge-execution-sell"}>
                      {t.side.toUpperCase()}
                    </span>
                  </td>
                  <td className="py-3 px-5 font-sans font-medium text-text-primary">
                    {t.symbol}
                  </td>
                  <td className="py-3 px-5 text-right font-medium text-text-primary">
                    {formatPrice(t.price, t.symbol)}
                  </td>
                  <td className="py-3 px-5 text-right text-text-secondary">
                    {formatNumber(t.amount, 4)}
                  </td>
                  <td className="py-3 px-5 text-right text-text-primary font-medium hidden sm:table-cell">
                    {formatCurrency(t.cost, { compact: false })}
                  </td>
                  <td className="py-3 px-5 text-right text-text-muted">
                    {formatRelativeTime(t.timestamp)}
                  </td>
                  <td className="py-3 px-5 text-right hidden lg:table-cell">
                    {t.txHash ? (
                      <a
                        href={`https://explorer.somnia.network/tx/${t.txHash}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-text-secondary hover:text-text-primary text-xs transition-colors"
                      >
                        <span>{formatAddress(t.txHash, 6, 4)}</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    ) : (
                      <span className="text-text-faint text-[11px]">Direct CLOB</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
