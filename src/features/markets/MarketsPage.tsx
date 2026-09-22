import React, { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { useMarkets } from "@/data/hooks";
import { formatCurrency } from "@/lib/formatters";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Button } from "@/components/ui/Button";
import { Search, ArrowUpDown } from "lucide-react";

export const MarketsPage: React.FC = () => {
  const { markets, tickers } = useMarkets();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<"symbol" | "price" | "change" | "volume">("volume");
  const [sortAsc, setSortAsc] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const filteredMarkets = markets
    .filter((m) => {
      const q = searchQuery.toLowerCase();
      return (
        m.symbol.toLowerCase().includes(q) ||
        m.baseCurrency.toLowerCase().includes(q) ||
        (m.contractAddress && m.contractAddress.toLowerCase().includes(q))
      );
    })
    .sort((a, b) => {
      const tickerA = tickers[a.symbol];
      const tickerB = tickers[b.symbol];

      if (sortField === "symbol") {
        return sortAsc ? a.symbol.localeCompare(b.symbol) : b.symbol.localeCompare(a.symbol);
      }
      if (sortField === "price") {
        const pA = parseFloat(tickerA?.close || "0");
        const pB = parseFloat(tickerB?.close || "0");
        return sortAsc ? pA - pB : pB - pA;
      }
      if (sortField === "change") {
        const cA = tickerA?.change24hPercent || 0;
        const cB = tickerB?.change24hPercent || 0;
        return sortAsc ? cA - cB : cB - cA;
      }
      if (sortField === "volume") {
        const vA = parseFloat(tickerA?.volume || "0");
        const vB = parseFloat(tickerB?.volume || "0");
        return sortAsc ? vA - vB : vB - vA;
      }
      return 0;
    });

  const toggleSort = (field: "symbol" | "price" | "change" | "volume") => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  return (
    <div ref={containerRef} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div className="markets-header">
        <SectionHeader
          tag="Directory"
          title="Spot Trading Markets"
          description="All on-chain central limit order book trading pairs active on Somnia mainnet."
          action={
            <div className="relative w-full sm:w-64">
              <input
                type="text"
                placeholder="Search markets or address..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs font-mono bg-surface-2 border border-border rounded-sm text-text-primary placeholder:text-text-muted focus:border-border-strong focus:outline-none"
              />
              <Search className="w-4 h-4 text-text-muted absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          }
        />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 border border-border bg-surface-1 rounded-sm border-l-2 border-l-text-primary">
          <div className="text-[11px] font-mono uppercase tracking-wider text-text-muted">Listed Pairs</div>
          <div className="text-2xl font-mono font-bold text-text-primary mt-1">{markets.length}</div>
          <div className="text-[11px] text-text-muted mt-0.5">Active spot CLOBs</div>
        </div>
        <div className="p-4 border border-border bg-surface-1 rounded-sm border-l border-l-border">
          <div className="text-[11px] font-mono uppercase tracking-wider text-text-muted">Settlement Standard</div>
          <div className="text-xl font-mono font-bold text-text-primary mt-1">ERC-20 CLOB</div>
          <div className="text-[11px] text-text-muted mt-0.5">Atomic execution</div>
        </div>
        <div className="p-4 border border-border bg-surface-1 rounded-sm border-l border-l-border">
          <div className="text-[11px] font-mono uppercase tracking-wider text-text-muted">Network Protocol</div>
          <div className="text-xl font-mono font-bold text-text-primary mt-1">Somnia L1</div>
          <div className="text-[11px] text-text-muted mt-0.5">Multistream consensus</div>
        </div>
        <div className="p-4 border border-border bg-surface-1 rounded-sm border-l border-l-border">
          <div className="text-[11px] font-mono uppercase tracking-wider text-text-muted">Matching Latency</div>
          <div className="text-xl font-mono font-bold text-text-primary mt-1">&lt; 100ms</div>
          <div className="text-[11px] text-text-muted mt-0.5">Sub-second finality</div>
        </div>
      </div>

      <div className="markets-table space-y-4">
        <div className="hidden md:block border border-border bg-surface-1 rounded-sm overflow-hidden">
        <table className="w-full text-left text-xs font-sans">
          <thead>
            <tr className="border-b border-border bg-surface-2 text-text-muted font-mono uppercase tracking-wider text-[11px]">
              <th className="py-3 px-4 font-medium cursor-pointer" onClick={() => toggleSort("symbol")}>
                <div className="flex items-center gap-1.5">
                  <span>Pair</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="py-3 px-4 font-medium text-right cursor-pointer" onClick={() => toggleSort("price")}>
                <div className="flex items-center justify-end gap-1.5">
                  <span>Price</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="py-3 px-4 font-medium text-right cursor-pointer" onClick={() => toggleSort("change")}>
                <div className="flex items-center justify-end gap-1.5">
                  <span>24h Change</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="py-3 px-4 font-medium text-right cursor-pointer" onClick={() => toggleSort("volume")}>
                <div className="flex items-center justify-end gap-1.5">
                  <span>24h Volume</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="py-3 px-4 font-medium text-right">Spread</th>
              <th className="py-3 px-4 font-medium text-right">Tick / Lot</th>
              <th className="py-3 px-4 font-medium text-right">Status</th>
              <th className="py-3 px-4 font-medium text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle font-mono">
            {filteredMarkets.map((m) => {
              const ticker = tickers[m.symbol];
              const price = ticker?.close || "0.00";
              const change = ticker?.change24hPercent || 0;
              const baseVol = parseFloat(ticker?.volume || "0");
              const closePrice = parseFloat(price);
              const volumeUsd = m.symbol.endsWith("USDso") ? baseVol * closePrice : baseVol;
              const isUp = change >= 0;

              return (
                <tr key={m.symbol} className="table-row-interactive hover:bg-surface-2/60 transition-colors">
                  <td className="py-3.5 px-4 font-sans font-medium text-text-primary">
                    <Link to={`/markets/${m.symbol}`} className="hover:text-white flex items-center gap-2">
                      <span>{m.symbol}</span>
                      {m.baseCurrency === "SOMI" && (
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-sm bg-surface-3 text-text-muted border border-border-subtle">
                          Native
                        </span>
                      )}
                    </Link>
                  </td>
                  <td className="py-3.5 px-4 text-right text-text-primary font-medium">
                    {formatCurrency(price, { decimals: m.symbol.includes("WBTC") ? 2 : 4 })}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <span
                      className={`inline-flex items-center px-1.5 py-0.5 rounded text-[11px] ${
                        isUp
                          ? "text-text-primary bg-surface-3 font-semibold"
                          : "text-text-muted border border-border-subtle"
                      }`}
                    >
                      {isUp ? `+${change.toFixed(2)}%` : `${change.toFixed(2)}%`}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right text-text-secondary">
                    {formatCurrency(volumeUsd, { compact: true })}
                  </td>
                  <td className="py-3.5 px-4 text-right text-text-muted text-[11px]">
                    {m.tickSize} / {m.lotSize}
                  </td>
                  <td className="py-3.5 px-4 text-right text-text-faint text-[11px]">
                    Active CLOB
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <StatusBadge status="connected" label="Active" />
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <Link to={`/markets/${m.symbol}`}>
                      <Button variant="ghost" size="sm">
                        Inspect
                      </Button>
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="md:hidden space-y-3">
        {filteredMarkets.map((m) => {
          const ticker = tickers[m.symbol];
          const price = ticker?.close || "0.00";
          const change = ticker?.change24hPercent || 0;
          const baseVol = parseFloat(ticker?.volume || "0");
          const closePrice = parseFloat(price);
          const volumeUsd = m.symbol.endsWith("USDso") ? baseVol * closePrice : baseVol;
          const isUp = change >= 0;

          return (
            <Link
              key={m.symbol}
              to={`/markets/${m.symbol}`}
              className="block p-4 border border-border bg-surface-1 rounded-sm hover:border-border-strong transition-colors"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="font-sans font-semibold text-text-primary text-sm flex items-center gap-2">
                  <span>{m.symbol}</span>
                  {m.baseCurrency === "SOMI" && (
                    <span className="text-[10px] font-mono px-1 py-0.2 rounded bg-surface-3 text-text-muted">
                      Native
                    </span>
                  )}
                </div>
                <div className="font-mono text-text-primary font-medium text-sm">
                  {formatCurrency(price, { decimals: m.symbol.includes("WBTC") ? 2 : 4 })}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs font-mono text-text-secondary pt-2 border-t border-border-subtle">
                <div>
                  <span className="text-text-muted">24h Vol: </span>
                  <span>{formatCurrency(volumeUsd, { compact: true })}</span>
                </div>
                <div className="text-right">
                  <span className="text-text-muted">24h Chg: </span>
                  <span className={isUp ? "text-text-primary font-semibold" : "text-text-muted"}>
                    {isUp ? `+${change.toFixed(2)}%` : `${change.toFixed(2)}%`}
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
        </div>
      </div>
    </div>
  );
};
