import React, { useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { useMarkets, useOrderBook, useLiveTrades, useCandles } from "@/data/hooks";
import { formatCurrency, formatNumber, formatBps, formatAddress, formatRelativeTime } from "@/lib/formatters";
import { CandleInterval } from "@/domain/market";
import { CandleChart } from "@/components/charts/CandleChart";
import { DepthChart } from "@/components/charts/DepthChart";
import { DataPanel } from "@/components/ui/DataPanel";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { ArrowLeft, ExternalLink } from "lucide-react";

export const MarketDetailPage: React.FC = () => {
  const { symbol: rawSymbol = "SOMI:USDso" } = useParams<{ symbol: string }>();
  const symbol = decodeURIComponent(rawSymbol).includes(":")
    ? decodeURIComponent(rawSymbol)
    : decodeURIComponent(rawSymbol).replace("-", ":");
  const [selectedInterval, setSelectedInterval] = useState<CandleInterval>("1h");
  const containerRef = useRef<HTMLDivElement>(null);

  const { markets, tickers } = useMarkets();
  const { orderBook } = useOrderBook(symbol);
  const { trades, wsState } = useLiveTrades(symbol);
  const { candles } = useCandles(symbol, selectedInterval);

  const market = markets.find((m) => m.symbol === symbol) || {
    symbol,
    baseCurrency: symbol.split(":")[0] || "SOMI",
    quoteCurrency: symbol.split(":")[1] || "USDso",
    baseAddress: "0x035De7403eac6872787779CCA7CCF1b4CDb61379",
    quoteAddress: "0x0000000000000000000000000000000000000001",
    contractAddress: "0x035De7403eac6872787779CCA7CCF1b4CDb61379",
    stopRegistryAddress: "0x68c8f6fb1EA19A28F25358Ff00b8Ed8E1216df30",
    baseDecimals: 18,
    quoteDecimals: 18,
    tickSize: "0.0001",
    lotSize: "1",
    minQuantity: "1",
    makerFeeBps: 0,
    takerFeeBps: 0,
    status: "active" as const,
  };

  const ticker = tickers[symbol];
  const price = ticker?.close;
  const change = ticker?.change24hPercent || 0;
  const isUp = change >= 0;

  const intervals: CandleInterval[] = ["1m", "5m", "15m", "1h", "4h", "1d"];

  return (
    <div ref={containerRef} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 font-sans">
      <div className="flex items-center gap-4 text-xs font-mono text-text-muted">
        <Link to="/markets" className="flex items-center gap-1 hover:text-text-primary transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>All Markets</span>
        </Link>
        <span>/</span>
        <span className="text-text-primary">{symbol}</span>
      </div>
      <div className="detail-header flex flex-col lg:flex-row lg:items-center justify-between gap-6 p-6 border border-border bg-surface-1 rounded-sm">
        <div className="flex flex-wrap items-center gap-4">
          <div className="w-10 h-10 rounded-sm bg-surface-2 border border-border flex items-center justify-center font-mono font-bold text-base text-text-primary">
            {market.baseCurrency.slice(0, 3)}
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-sans font-bold text-text-primary tracking-tight">
                {symbol}
              </h1>
              <StatusBadge status={wsState} />
            </div>
            <div className="text-xs font-mono text-text-muted mt-1 flex items-center gap-3">
              <span>Pool: {formatAddress(market.contractAddress)}</span>
              <a
                href={`https://explorer.somnia.network/address/${market.contractAddress}`}
                target="_blank"
                rel="noreferrer"
                className="text-text-secondary hover:text-text-primary flex items-center gap-1"
              >
                <span>Explorer</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-xs font-mono border-t lg:border-t-0 pt-4 lg:pt-0 border-border-subtle">
          <div>
            <div className="text-text-muted uppercase text-[10px]">Price</div>
            <div className="text-lg font-semibold text-text-primary mt-0.5">
              {formatCurrency(price, { decimals: symbol.includes("WBTC") ? 2 : 4 })}
            </div>
          </div>
          <div>
            <div className="text-text-muted uppercase text-[10px]">24h Change</div>
            <div className={`text-lg font-semibold mt-0.5 ${isUp ? "text-text-primary" : "text-text-muted"}`}>
              {isUp ? `+${change.toFixed(2)}%` : `${change.toFixed(2)}%`}
            </div>
          </div>
          <div>
            <div className="text-text-muted uppercase text-[10px]">24h Volume</div>
            <div className="text-lg font-semibold text-text-primary mt-0.5">
              {ticker ? formatCurrency(parseFloat(ticker.volume || "0") * parseFloat(price || "1"), { compact: true }) : "$0.00"}
            </div>
          </div>
          <div>
            <div className="text-text-muted uppercase text-[10px]">Spread</div>
            <div className="text-lg font-semibold text-text-primary mt-0.5">
              {orderBook?.spreadBps ? formatBps(orderBook.spreadBps) : "..."}
            </div>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="detail-charts lg:col-span-2 space-y-6">
          <DataPanel
            title="OHLCV Candlestick Action"
            subtitle="Price movement and volume intervals"
            meta={{
              source: "api",
              updatedAt: new Date().toISOString(),
              sourceEndpoint: `/v0/markets/${symbol}/candles`,
            }}
            action={
              <div className="flex items-center gap-1 bg-surface-2 p-0.5 rounded border border-border">
                {intervals.map((int) => (
                  <button
                    key={int}
                    onClick={() => setSelectedInterval(int)}
                    className={`px-2 py-1 text-[11px] font-mono rounded ${
                      selectedInterval === int
                        ? "bg-text-primary text-black font-semibold"
                        : "text-text-secondary hover:text-text-primary"
                    }`}
                  >
                    {int}
                  </button>
                ))}
              </div>
            }
          >
            <CandleChart candles={candles} height={380} symbol={market.symbol} />
          </DataPanel>
          {orderBook && (
            <DataPanel
              title="Order Book Depth Visualizer"
              subtitle="Cumulative resting bids and asks relative to mid-price"
              meta={{
                source: "live",
                updatedAt: new Date().toISOString(),
                sourceEndpoint: `/v0/orderbooks`,
              }}
            >
              <DepthChart orderBook={orderBook} height={180} />
            </DataPanel>
          )}
          <DataPanel
            title="Contract & Matching Parameters"
            subtitle="Canonical specifications initialized on the SpotPool contract"
            meta={{
              source: "on-chain",
              updatedAt: new Date().toISOString(),
              sourceEndpoint: "SpotPool.getPoolParams()",
            }}
          >
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs font-mono">
              <div className="p-3 rounded-sm border border-border-subtle bg-surface-2">
                <span className="text-text-muted block text-[10px] uppercase">Tick Size</span>
                <span className="text-text-primary font-medium">{market.tickSize}</span>
              </div>
              <div className="p-3 rounded-sm border border-border-subtle bg-surface-2">
                <span className="text-text-muted block text-[10px] uppercase">Lot Size</span>
                <span className="text-text-primary font-medium">{market.lotSize}</span>
              </div>
              <div className="p-3 rounded-sm border border-border-subtle bg-surface-2">
                <span className="text-text-muted block text-[10px] uppercase">Min Quantity</span>
                <span className="text-text-primary font-medium">{market.minQuantity}</span>
              </div>
              <div className="p-3 rounded-sm border border-border-subtle bg-surface-2">
                <span className="text-text-muted block text-[10px] uppercase">Maker Fee</span>
                <span className="text-text-primary font-medium">0% (Subsidized)</span>
              </div>
              <div className="p-3 rounded-sm border border-border-subtle bg-surface-2">
                <span className="text-text-muted block text-[10px] uppercase">Taker Fee</span>
                <span className="text-text-primary font-medium">0% (Subsidized)</span>
              </div>
              <div className="p-3 rounded-sm border border-border-subtle bg-surface-2">
                <span className="text-text-muted block text-[10px] uppercase">Settlement</span>
                <span className="text-text-primary font-medium">Atomic On-Chain</span>
              </div>
            </div>
          </DataPanel>
        </div>
        <div className="detail-book space-y-6">
          <DataPanel
            title="Order Book"
            subtitle={`Mid: ${orderBook?.midPrice || "..."} | Spread: ${orderBook?.spreadBps || "..."} bps`}
            meta={{
              source: "live",
              updatedAt: new Date().toISOString(),
              sourceEndpoint: "wss://api.dreamdex.io/v0/ws/public",
            }}
            noPadding
          >
            <div className="p-3 text-[11px] font-mono text-text-muted border-b border-border-subtle grid grid-cols-2">
              <span>Price (USDso)</span>
              <span className="text-right">Quantity</span>
            </div>
            <div className="divide-y divide-border-subtle/40 max-h-48 overflow-y-auto">
              {(orderBook?.asks.slice(0, 7).reverse() || []).map((a, i) => {
                const maxQty = Math.max(
                  ...(orderBook?.asks.slice(0, 7).map((x) => parseFloat(x.quantity)) || [1]),
                  ...(orderBook?.bids.slice(0, 7).map((x) => parseFloat(x.quantity)) || [1]),
                  1
                );
                const pct = Math.min(100, (parseFloat(a.quantity) / maxQty) * 100);
                return (
                  <div key={i} className="relative px-3 py-1.5 flex items-center justify-between text-xs font-mono overflow-hidden">
                    <div
                      className="absolute right-0 top-0 bottom-0 bg-white/[0.04] depth-bar-transition pointer-events-none"
                      style={{ width: `${pct}%` }}
                    />
                    <span className="relative z-10 text-text-muted">{formatNumber(a.price, 4)}</span>
                    <span className="relative z-10 text-text-secondary">{formatNumber(a.quantity, 2)}</span>
                  </div>
                );
              })}
            </div>
            <div className="py-2 px-3 bg-surface-2 border-y border-border-subtle text-center text-xs font-mono text-text-secondary flex justify-between">
              <span>Spread: {orderBook?.spread ? formatNumber(orderBook.spread, 4) : "..."}</span>
              <span>{orderBook?.spreadBps ? `${orderBook.spreadBps} bps` : "..."}</span>
            </div>
            <div className="divide-y divide-border-subtle/40 max-h-48 overflow-y-auto">
              {(orderBook?.bids.slice(0, 7) || []).map((b, i) => {
                const maxQty = Math.max(
                  ...(orderBook?.asks.slice(0, 7).map((x) => parseFloat(x.quantity)) || [1]),
                  ...(orderBook?.bids.slice(0, 7).map((x) => parseFloat(x.quantity)) || [1]),
                  1
                );
                const pct = Math.min(100, (parseFloat(b.quantity) / maxQty) * 100);
                return (
                  <div key={i} className="relative px-3 py-1.5 flex items-center justify-between text-xs font-mono overflow-hidden">
                    <div
                      className="absolute right-0 top-0 bottom-0 bg-white/[0.12] depth-bar-transition pointer-events-none"
                      style={{ width: `${pct}%` }}
                    />
                    <span className="relative z-10 text-text-primary font-medium">{formatNumber(b.price, 4)}</span>
                    <span className="relative z-10 text-text-secondary">{formatNumber(b.quantity, 2)}</span>
                  </div>
                );
              })}
            </div>
          </DataPanel>
          <DataPanel
            title="Recent Trades"
            subtitle="Executed fills on-chain"
            meta={{
              source: "live",
              updatedAt: new Date().toISOString(),
              sourceEndpoint: `/v0/markets/${symbol}/trades`,
            }}
            noPadding
          >
            <div className="divide-y divide-border-subtle max-h-72 overflow-y-auto">
              {trades.map((t, idx) => (
                <div
                  key={t.id}
                  className={`px-3 py-2 flex items-center justify-between text-xs font-mono hover:bg-surface-2/40 transition-colors ${
                    idx === 0 ? "animate-trade-flash" : ""
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className={t.side === "buy" ? "badge-execution-buy" : "badge-execution-sell"}>
                      {t.side.toUpperCase()}
                    </span>
                    <span className="text-text-secondary">{formatNumber(t.price, 4)}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-text-primary">{formatNumber(t.amount, 2)}</span>
                    <span className="text-[10px] text-text-faint ml-2">{formatRelativeTime(t.timestamp)}</span>
                  </div>
                </div>
              ))}
            </div>
          </DataPanel>
        </div>
      </div>
    </div>
  );
};
