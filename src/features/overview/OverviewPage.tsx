import React, { useRef } from "react";
import { Link } from "react-router-dom";
import { useOverviewMetrics, useMarkets, useLiveTrades, useVolumeAnalytics } from "@/data/hooks";
import { formatCurrency, formatNumber, formatBps, formatRelativeTime, formatPrice } from "@/lib/formatters";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { MediaBackground } from "@/components/ui/MediaBackground";
import { AreaChart } from "@/components/charts/AreaChart";
import { ArrowRight, ChevronRight, Activity, ShieldCheck, Zap } from "lucide-react";

export const OverviewPage: React.FC = () => {
  const { metrics } = useOverviewMetrics();
  const { markets, tickers } = useMarkets();
  const { trades, wsState } = useLiveTrades("SOMI:USDso");
  const { points: volumePoints } = useVolumeAnalytics("30d");

  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div ref={containerRef}>
      <MediaBackground
        variant="canvas-mesh"
        intensity="medium"
        interactive={true}
        className="border-b border-border"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-28 sm:pt-40 sm:pb-36 lg:pt-44 lg:pb-40">
          <div className="max-w-3xl space-y-8">
            <h1 className="text-text-primary leading-[1.04]">
              <span className="hero-title-line block text-4xl sm:text-5xl lg:text-[3.75rem] font-sans font-bold tracking-[-0.035em]">
                Verifiable Order Book
              </span>
              <span className="hero-title-line block text-4xl sm:text-5xl lg:text-[3.75rem] font-sans font-bold tracking-[-0.035em] text-text-secondary">
                Analytics.
              </span>
            </h1>

            <p className="hero-body text-base sm:text-lg text-text-secondary font-sans leading-relaxed max-w-xl">
              Real-time central limit order book telemetry, resting depth ribbons, validator trade fills, and
              verifiable volume on Somnia. Zero-fee matching with sub-second execution.
            </p>

            <div className="hero-cta-group flex flex-wrap items-center gap-3">
              <Link to="/markets">
                <Button variant="primary" size="lg" icon={<ArrowRight className="w-4 h-4" />}>
                  Explore Markets
                </Button>
              </Link>
              <Link to="/volume">
                <Button variant="secondary" size="lg">
                  Volume Analytics
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </MediaBackground>
      <section className="kpi-strip max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-10">
          <div className="kpi-metric space-y-2 col-span-2 lg:col-span-1 border-l-2 border-text-primary pl-5">
            <div className="text-[11px] font-mono uppercase tracking-[0.15em] text-text-muted">
              24h Spot Volume
            </div>
            <div className="text-4xl sm:text-5xl font-mono font-bold text-text-primary tracking-tight">
              {metrics ? formatCurrency(metrics.totalSpotVolume24h) : "$..."}
            </div>
            <div className="text-xs text-text-muted font-sans">
              Aggregated from live market tickers
            </div>
          </div>

          <div className="kpi-metric space-y-2 border-l border-border pl-5">
            <div className="text-[11px] font-mono uppercase tracking-[0.15em] text-text-muted">
              Visible Book Depth
            </div>
            <div className="text-2xl sm:text-3xl font-mono font-semibold text-text-primary tracking-tight">
              {metrics ? formatCurrency(metrics.aggregateVisibleDepthUsd) : "$..."}
            </div>
            <div className="text-xs text-text-muted font-sans">
              Resting bids & asks
            </div>
          </div>

          <div className="kpi-metric space-y-2 border-l border-border pl-5">
            <div className="text-[11px] font-mono uppercase tracking-[0.15em] text-text-muted">
              Active Markets
            </div>
            <div className="text-2xl sm:text-3xl font-mono font-semibold text-text-primary tracking-tight">
              {metrics?.activeMarketsCount ?? markets.length}
            </div>
            <div className="text-xs text-text-muted font-sans">
              Spot pairs on-chain
            </div>
          </div>

          <div className="kpi-metric space-y-2 border-l border-border pl-5">
            <div className="text-[11px] font-mono uppercase tracking-[0.15em] text-text-muted">
              Average Spread
            </div>
            <div className="text-2xl sm:text-3xl font-mono font-semibold text-text-primary tracking-tight">
              {metrics ? formatBps(metrics.averageSpreadBps) : "..."}
            </div>
            <div className="text-xs text-text-muted font-sans">
              Top of book weighted
            </div>
          </div>
        </div>
        <div className="section-hairline mt-14" />
      </section>
      <section className="markets-section max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-sans font-bold tracking-tight text-text-primary">
              Live Spot Markets
            </h2>
            <p className="text-sm text-text-secondary mt-1.5 font-sans">
              Trading pairs on dreamDEX with real-time ticker quotes and executed volumes.
            </p>
          </div>
          <Link to="/markets" className="text-xs font-mono text-text-muted hover:text-text-primary flex items-center gap-1 transition-colors">
            <span>View All Details</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="border border-border bg-surface-1 overflow-hidden rounded-sm">
          <table className="w-full text-left text-xs font-sans">
            <thead>
              <tr className="border-b border-border bg-surface-2 text-text-muted font-mono uppercase tracking-wider text-[11px]">
                <th className="py-3.5 px-5 font-medium">Market</th>
                <th className="py-3.5 px-5 font-medium text-right">Price</th>
                <th className="py-3.5 px-5 font-medium text-right">24h Change</th>
                <th className="py-3.5 px-5 font-medium text-right">24h Volume</th>
                <th className="py-3.5 px-5 font-medium text-right hidden lg:table-cell">Tick / Lot</th>
                <th className="py-3.5 px-5 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle font-mono">
              {markets.length === 0 ? (
                [1, 2, 3, 4].map((i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="py-4 px-5">
                      <div className="h-4 bg-surface-2 rounded w-28" />
                    </td>
                    <td className="py-4 px-5 text-right">
                      <div className="h-4 bg-surface-2 rounded w-20 ml-auto" />
                    </td>
                    <td className="py-4 px-5 text-right">
                      <div className="h-4 bg-surface-2 rounded w-16 ml-auto" />
                    </td>
                    <td className="py-4 px-5 text-right">
                      <div className="h-4 bg-surface-2 rounded w-24 ml-auto" />
                    </td>
                    <td className="py-4 px-5 text-right hidden lg:table-cell">
                      <div className="h-4 bg-surface-2 rounded w-16 ml-auto" />
                    </td>
                    <td className="py-4 px-5 text-right">
                      <div className="h-4 bg-surface-2 rounded w-12 ml-auto" />
                    </td>
                  </tr>
                ))
              ) : (
                markets.map((m) => {
                const ticker = tickers[m.symbol];
                const price = ticker?.close;
                const change = ticker?.change24hPercent || 0;
                const volume = ticker?.volume;
                const isUp = change >= 0;

                return (
                  <tr key={m.symbol} className="market-row table-row-interactive">
                    <td className="py-4 px-5 font-medium text-text-primary">
                      <Link to={`/markets/${m.symbol}`} className="hover:text-white flex items-center gap-2.5">
                        <span className="font-sans font-semibold text-sm">{m.symbol}</span>
                        {m.baseCurrency === "SOMI" && (
                          <span className="text-[10px] font-mono px-1.5 py-0.5 bg-surface-2 border border-border-subtle text-text-muted">
                            Native
                          </span>
                        )}
                      </Link>
                    </td>
                    <td className="py-4 px-5 text-right font-semibold text-text-primary text-sm">
                      {formatPrice(price, m.symbol)}
                    </td>
                    <td className="py-4 px-5 text-right">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 text-[11px] font-medium ${
                          isUp
                            ? "text-text-primary bg-surface-2 font-semibold"
                            : "text-text-muted"
                        }`}
                      >
                        {isUp ? `+${change.toFixed(2)}%` : `${change.toFixed(2)}%`}
                      </span>
                    </td>
                    <td className="py-4 px-5 text-right text-text-secondary text-sm">
                      {volume ? `${formatNumber(volume, 2, true)} ${m.baseCurrency}` : "0"}
                    </td>
                    <td className="py-4 px-5 text-right text-text-faint text-[11px] hidden lg:table-cell">
                      {m.tickSize} / {m.lotSize}
                    </td>
                    <td className="py-4 px-5 text-right">
                      <Link
                        to={`/markets/${m.symbol}`}
                        className="inline-flex items-center gap-1 text-text-secondary hover:text-text-primary text-xs font-sans transition-colors"
                      >
                        <span>Inspect</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                );
              }))}
            </tbody>
          </table>
        </div>
      </section>
      <section className="volume-section max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="text-[11px] font-mono uppercase tracking-[0.15em] text-text-muted mb-1.5">
              30-Day Series
            </div>
            <h2 className="text-xl sm:text-2xl font-sans font-semibold tracking-tight text-text-primary">
              Trading Volume Overview
            </h2>
            <p className="text-xs text-text-secondary mt-1 font-sans">
              Verified aggregate volume compiled from daily OHLCV candlestick series.
            </p>
          </div>
          <Link to="/volume" className="text-xs font-mono text-text-muted hover:text-text-primary flex items-center gap-1 transition-colors">
            <span>Detailed Analysis</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="border border-border bg-surface-1 p-6 rounded-sm">
          <AreaChart
            data={volumePoints.map((p) => ({
              timestamp: p.timestamp,
              value: p.volumeUsd,
            }))}
            height={280}
            isCurrency={true}
          />
        </div>
      </section>
      <section className="trades-section max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-xl sm:text-2xl font-sans font-semibold tracking-tight text-text-primary">
                Real-Time Fills
              </h2>
              <StatusBadge status={wsState} />
            </div>
            <p className="text-xs text-text-secondary mt-1 font-sans">
              Live trades matching on the order book at validator consensus.
            </p>
          </div>
          <Link to="/activity" className="text-xs font-mono text-text-muted hover:text-text-primary flex items-center gap-1 transition-colors">
            <span>All Executions</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="border border-border bg-surface-1 overflow-hidden rounded-sm">
          <table className="w-full text-left text-xs font-sans">
            <thead>
              <tr className="border-b border-border bg-surface-2 text-text-muted font-mono uppercase tracking-wider text-[11px]">
                <th className="py-3 px-5 font-medium">Side</th>
                <th className="py-3 px-5 font-medium text-right">Price</th>
                <th className="py-3 px-5 font-medium text-right">Amount (SOMI)</th>
                <th className="py-3 px-5 font-medium text-right hidden sm:table-cell">Cost (USDso)</th>
                <th className="py-3 px-5 font-medium text-right">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle font-mono">
              {trades.length === 0 ? (
                [1, 2, 3, 4, 5].map((i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="py-3 px-5">
                      <div className="h-4 bg-surface-2 rounded w-12" />
                    </td>
                    <td className="py-3 px-5 text-right">
                      <div className="h-4 bg-surface-2 rounded w-20 ml-auto" />
                    </td>
                    <td className="py-3 px-5 text-right">
                      <div className="h-4 bg-surface-2 rounded w-16 ml-auto" />
                    </td>
                    <td className="py-3 px-5 text-right hidden sm:table-cell">
                      <div className="h-4 bg-surface-2 rounded w-20 ml-auto" />
                    </td>
                    <td className="py-3 px-5 text-right">
                      <div className="h-4 bg-surface-2 rounded w-16 ml-auto" />
                    </td>
                  </tr>
                ))
              ) : (
                trades.slice(0, 10).map((t, idx) => (
                <tr
                  key={t.id}
                  className={`table-row-interactive ${
                    idx === 0 ? "animate-trade-flash" : ""
                  }`}
                >
                  <td className="py-3 px-5">
                    <span
                      className={t.side === "buy" ? "badge-execution-buy" : "badge-execution-sell"}
                    >
                      {t.side.toUpperCase()}
                    </span>
                  </td>
                  <td className="py-3 px-5 text-right font-medium text-text-primary">
                    {formatPrice(t.price, "SOMI:USDso")}
                  </td>
                  <td className="py-3 px-5 text-right text-text-secondary">
                    {formatNumber(t.amount, 2)}
                  </td>
                  <td className="py-3 px-5 text-right text-text-primary font-medium hidden sm:table-cell">
                    {formatCurrency(t.cost, { compact: false })}
                  </td>
                  <td className="py-3 px-5 text-right text-text-muted">
                    {formatRelativeTime(t.timestamp)}
                  </td>
                </tr>
              )))}
            </tbody>
          </table>
        </div>
      </section>
      <section className="architecture-section max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-32">
        <div className="section-hairline mb-16" />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-16">
          <div className="arch-pillar space-y-4">
            <div className="w-9 h-9 border border-border flex items-center justify-center bg-surface-1">
              <Zap className="w-4 h-4 text-text-primary" />
            </div>
            <h3 className="text-base font-sans font-semibold text-text-primary tracking-tight">
              Zero Fees on Flow
            </h3>
            <p className="text-xs text-text-secondary font-sans leading-[1.7]">
              dreamDEX operates with zero maker and zero taker fees on every pair. Order flow is
              never taxed, making algorithmic market making and programmatic trading economically
              frictionless.
            </p>
          </div>

          <div className="arch-pillar space-y-4">
            <div className="w-9 h-9 border border-border flex items-center justify-center bg-surface-1">
              <Activity className="w-4 h-4 text-text-primary" />
            </div>
            <h3 className="text-base font-sans font-semibold text-text-primary tracking-tight">
              Proximity Yield Allocation
            </h3>
            <p className="text-xs text-text-secondary font-sans leading-[1.7]">
              Resting capital earns yield distributed to active market makers weighted by Gaussian
              proximity to the mid-price. Tighter quotes earn higher yields without balance-sheet
              lockups.
            </p>
          </div>

          <div className="arch-pillar space-y-4">
            <div className="w-9 h-9 border border-border flex items-center justify-center bg-surface-1">
              <ShieldCheck className="w-4 h-4 text-text-primary" />
            </div>
            <h3 className="text-base font-sans font-semibold text-text-primary tracking-tight">
              Strict TVL Boundary
            </h3>
            <p className="text-xs text-text-secondary font-sans leading-[1.7]">
              Spot order book liquidity, SomniaLend pool reserves, and Event Contracts are strictly
              segregated. This analytics hub never conflates lending pools or prediction markets with
              spot depth.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
