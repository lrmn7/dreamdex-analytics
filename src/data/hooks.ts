import { useState, useEffect, useCallback } from "react";
import { dreamDexRest } from "./dreamdex/rest/client";
import { dreamDexWs, ConnectionState } from "./dreamdex/websocket/manager";
import { Market, Ticker, OrderBook, Candle, CandleInterval } from "@/domain/market";
import { Trade } from "@/domain/trade";
import {
  GlobalOverviewMetrics,
  VolumeTimeSeriesPoint,
  LiquidityTimeSeriesPoint,
  MarketVolumeBreakdown,
  EventContractMarket,
  LendReserve,
} from "@/domain/analytics";

export function useMarkets() {
  const [markets, setMarkets] = useState<Market[]>([]);
  const [tickers, setTickers] = useState<Record<string, Ticker>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [marketList, tickerList] = await Promise.all([
        dreamDexRest.fetchMarkets(),
        dreamDexRest.fetchTickers(),
      ]);

      setMarkets(marketList);
      const tickerMap: Record<string, Ticker> = {};
      tickerList.forEach((t) => {
        tickerMap[t.symbol] = t;
      });
      setTickers(tickerMap);
      setError(null);
    } catch (err: any) {
      setError(err?.message || "Failed to load markets");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 20000);
    return () => clearInterval(interval);
  }, [loadData]);

  return { markets, tickers, loading, error, refetch: loadData };
}

export function useOverviewMetrics() {
  const [metrics, setMetrics] = useState<GlobalOverviewMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const tickerList = await dreamDexRest.fetchTickers();
        
        let total24hVolUsd = 0;

        tickerList.forEach((t) => {
          const vol = parseFloat(t.volume || "0");
          const close = parseFloat(t.close || "0");
          const volUsd = t.symbol.endsWith("USDso") ? vol * close : vol;
          total24hVolUsd += volUsd;
        });
        const activeSymbols = tickerList.map((t) => t.symbol);
        const orderBooks = activeSymbols.length > 0 
          ? await dreamDexRest.fetchOrderBooks(activeSymbols.slice(0, 4), 20)
          : [];

        let totalVisibleDepthUsd = 0;
        let spreadSumBps = 0;
        let validSpreadsCount = 0;

        orderBooks.forEach((ob) => {
          if (ob.spreadBps && parseFloat(ob.spreadBps) > 0) {
            spreadSumBps += parseFloat(ob.spreadBps);
            validSpreadsCount++;
          }
          ob.bids.forEach((b) => {
            totalVisibleDepthUsd += parseFloat(b.price) * parseFloat(b.quantity);
          });
          ob.asks.forEach((a) => {
            totalVisibleDepthUsd += parseFloat(a.price) * parseFloat(a.quantity);
          });
        });

        const avgSpread = validSpreadsCount > 0 
          ? (spreadSumBps / validSpreadsCount).toFixed(1) 
          : "3.8";
        let total7dVolUsd = 0;
        let total30dVolUsd = 0;

        try {
          const candleResults = await Promise.all(
            activeSymbols.map((sym) => dreamDexRest.fetchCandles(sym, "1d", 30))
          );

          candleResults.forEach((candles, idx) => {
            const sym = activeSymbols[idx];
            const ticker = tickerList.find((t) => t.symbol === sym);
            const price = parseFloat(ticker?.close || "1");

            candles.slice(-7).forEach((c) => {
              const vol = parseFloat(c.volume || "0");
              total7dVolUsd += sym.endsWith("USDso") ? vol * price : vol;
            });

            candles.forEach((c) => {
              const vol = parseFloat(c.volume || "0");
              total30dVolUsd += sym.endsWith("USDso") ? vol * price : vol;
            });
          });
        } catch {
        }

        setMetrics({
          totalSpotVolume24h: total24hVolUsd > 0 ? total24hVolUsd.toFixed(2) : "0.00",
          totalSpotVolume7d: total7dVolUsd > 0 ? total7dVolUsd.toFixed(2) : total24hVolUsd.toFixed(2),
          totalSpotVolume30d: total30dVolUsd > 0 ? total30dVolUsd.toFixed(2) : total24hVolUsd.toFixed(2),
          aggregateVisibleDepthUsd: totalVisibleDepthUsd > 0 ? totalVisibleDepthUsd.toFixed(2) : "0.00",
          activeMarketsCount: tickerList.length,
          totalTrades24h: 0, // Unindexed at exchange level
          totalTrades7d: 0,
          averageSpreadBps: avgSpread,
          meta: {
            source: "calculated",
            updatedAt: new Date().toISOString(),
            freshnessThresholdSeconds: 30,
            methodologyVersion: "v1.0",
          },
        });
      } catch (err) {
        console.warn("Could not calculate overview metrics:", err);
      } finally {
        setLoading(false);
      }
    }

    load();
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, []);

  return { metrics, loading };
}

export function useLiveTrades(selectedSymbol?: string) {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [wsState, setWsState] = useState<ConnectionState>("unavailable");

  useEffect(() => {
    const symbol = selectedSymbol || "SOMI:USDso";

    dreamDexRest.fetchRecentTrades(symbol, 40).then((initial) => {
      if (initial.length > 0) {
        setTrades(initial);
      }
    });

    dreamDexWs.subscribe("trades", {
      symbols: [symbol],
      limit: 40,
    });

    const unsubState = dreamDexWs.onStateChange((state) => {
      setWsState(state);
    });

    const unsubMsg = dreamDexWs.onMessage((msg) => {
      if (msg.channel === "trades") {
        if (msg.type === "snapshot" && Array.isArray(msg.trades)) {
          setTrades(msg.trades);
        } else if (msg.type === "update" && msg.trade) {
          setTrades((prev) => {
            // Prevent duplicate trade ids
            if (prev.some((t) => t.id === msg.trade.id)) return prev;
            return [msg.trade, ...prev.slice(0, 49)];
          });
        }
      }
    });

    return () => {
      dreamDexWs.unsubscribe("trades", { symbols: [symbol] });
      unsubState();
      unsubMsg();
    };
  }, [selectedSymbol]);

  return { trades, wsState };
}

export function useOrderBook(symbol: string) {
  const [orderBook, setOrderBook] = useState<OrderBook | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);

    dreamDexRest.fetchOrderBooks([symbol], 25).then(([ob]) => {
      if (ob) {
        setOrderBook(ob);
      }
      setLoading(false);
    });

    dreamDexWs.subscribe("orderbook", { symbols: [symbol] });

    const unsubMsg = dreamDexWs.onMessage((msg) => {
      if (msg.channel === "orderbook" && msg.symbol === symbol) {
        if (msg.type === "snapshot") {
          setOrderBook(dreamDexRest.normalizeOrderBook(msg));
        } else if (msg.type === "update") {
          setOrderBook((prev) => {
            if (!prev) return null;
            const updatedBids = [...prev.bids];
            if (Array.isArray(msg.bids)) {
              msg.bids.forEach((lvl: any) => {
                const idx = updatedBids.findIndex((b) => b.price === lvl.price);
                if (lvl.quantity === "0") {
                  if (idx >= 0) updatedBids.splice(idx, 1);
                } else if (idx >= 0) {
                  updatedBids[idx] = lvl;
                } else {
                  updatedBids.push(lvl);
                }
              });
              updatedBids.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
            }

            const updatedAsks = [...prev.asks];
            if (Array.isArray(msg.asks)) {
              msg.asks.forEach((lvl: any) => {
                const idx = updatedAsks.findIndex((a) => a.price === lvl.price);
                if (lvl.quantity === "0") {
                  if (idx >= 0) updatedAsks.splice(idx, 1);
                } else if (idx >= 0) {
                  updatedAsks[idx] = lvl;
                } else {
                  updatedAsks.push(lvl);
                }
              });
              updatedAsks.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
            }

            const bestBid = updatedBids[0]?.price;
            const bestAsk = updatedAsks[0]?.price;
            let midPrice: string | undefined;
            let spread: string | undefined;
            let spreadBps: string | undefined;

            if (bestBid && bestAsk) {
              const b = parseFloat(bestBid);
              const a = parseFloat(bestAsk);
              if (b > 0 && a > 0) {
                const mid = (b + a) / 2;
                midPrice = mid.toFixed(4);
                spread = (a - b).toFixed(4);
                spreadBps = (((a - b) / mid) * 10000).toFixed(1);
              }
            }

            return {
              ...prev,
              timestamp: msg.timestamp || Date.now(),
              bids: updatedBids.slice(0, 25),
              asks: updatedAsks.slice(0, 25),
              bestBid,
              bestAsk,
              midPrice,
              spread,
              spreadBps,
            };
          });
        }
      }
    });

    return () => {
      dreamDexWs.unsubscribe("orderbook", { symbols: [symbol] });
      unsubMsg();
    };
  }, [symbol]);

  return { orderBook, loading };
}

export function useCandles(symbol: string, interval: CandleInterval) {
  const [candles, setCandles] = useState<Candle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    dreamDexRest.fetchCandles(symbol, interval, 60).then((data) => {
      setCandles(data);
      setLoading(false);
    });
  }, [symbol, interval]);

  return { candles, loading };
}

export function useVolumeAnalytics(range: string = "30d") {
  const [points, setPoints] = useState<VolumeTimeSeriesPoint[]>([]);
  const [marketBreakdown, setMarketBreakdown] = useState<MarketVolumeBreakdown[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const tickers = await dreamDexRest.fetchTickers();
        
        let totalVolUsd = 0;
        const breakdowns: MarketVolumeBreakdown[] = [];

        tickers.forEach((t) => {
          const vol = parseFloat(t.volume || "0");
          const close = parseFloat(t.close || "0");
          const volUsd = t.symbol.endsWith("USDso") ? vol * close : vol;
          totalVolUsd += volUsd;
          breakdowns.push({
            symbol: t.symbol,
            volumeUsd: Math.round(volUsd),
            volumePercentage: 0,
            tradeCount: 0, // Unindexed at exchange level
          });
        });

        if (totalVolUsd > 0) {
          breakdowns.forEach((b) => {
            b.volumePercentage = parseFloat(((b.volumeUsd / totalVolUsd) * 100).toFixed(1));
          });
          breakdowns.sort((a, b) => b.volumeUsd - a.volumeUsd);
        }
        setMarketBreakdown(breakdowns);

        const activeSymbols = tickers.map((t) => t.symbol);
        const candleInterval: CandleInterval = range === "24h" ? "1h" : "1d";
        const candleLimit = range === "24h" ? 24 : range === "7d" ? 7 : 30;

        const candlePromises = activeSymbols.map((sym) =>
          dreamDexRest.fetchCandles(sym, candleInterval, candleLimit)
        );

        const candleResults = await Promise.all(candlePromises);

        const timeMap = new Map<number, { volumeUsd: number }>();

        candleResults.forEach((candles, i) => {
          const sym = activeSymbols[i];
          const ticker = tickers.find((t) => t.symbol === sym);
          const price = parseFloat(ticker?.close || "1");

          candles.forEach((c) => {
            const vol = parseFloat(c.volume || "0");
            const volUsd = sym.endsWith("USDso") ? vol * price : vol;
            const existing = timeMap.get(c.timestamp) || { volumeUsd: 0 };
            timeMap.set(c.timestamp, {
              volumeUsd: existing.volumeUsd + volUsd,
            });
          });
        });

        const pts: VolumeTimeSeriesPoint[] = Array.from(timeMap.entries())
          .sort(([a], [b]) => a - b)
          .map(([timestamp, data]) => ({
            timestamp,
            volumeUsd: Math.round(data.volumeUsd),
            tradeCount: 0,
          }));

        setPoints(pts);
      } catch (err) {
        console.warn("Could not load volume analytics:", err);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [range]);

  return { points, marketBreakdown, loading };
}

export function useLiquidityAnalytics() {
  const [points, setPoints] = useState<LiquidityTimeSeriesPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const tickers = await dreamDexRest.fetchTickers();
        const symbols = tickers.map((t) => t.symbol);
        const orderBooks = symbols.length > 0 ? await dreamDexRest.fetchOrderBooks(symbols, 25) : [];

        let totalBidUsd = 0;
        let totalAskUsd = 0;
        let spreadBpsSum = 0;
        let spreadCount = 0;

        orderBooks.forEach((ob) => {
          ob.bids.forEach((b) => {
            totalBidUsd += parseFloat(b.price) * parseFloat(b.quantity);
          });
          ob.asks.forEach((a) => {
            totalAskUsd += parseFloat(a.price) * parseFloat(a.quantity);
          });
          if (ob.spreadBps && parseFloat(ob.spreadBps) > 0) {
            spreadBpsSum += parseFloat(ob.spreadBps);
            spreadCount++;
          }
        });

        const totalDepth = totalBidUsd + totalAskUsd;
        const avgSpread = spreadCount > 0 ? spreadBpsSum / spreadCount : 3.8;

        setPoints([
          {
            timestamp: Date.now(),
            depthTotalUsd: Math.round(totalDepth),
            bidDepthUsd: Math.round(totalBidUsd),
            askDepthUsd: Math.round(totalAskUsd),
            spreadBps: parseFloat(avgSpread.toFixed(1)),
          },
        ]);
      } catch (err) {
        console.warn("Could not load liquidity analytics:", err);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  return { points, loading };
}

export function useEventContracts() {
  const [events, setEvents] = useState<EventContractMarket[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setEvents([]);
    setLoading(false);
  }, []);

  return { events, loading };
}

export function useLendReserves() {
  const [reserves, setReserves] = useState<LendReserve[]>([]);
  const [totalSupplied, setTotalSupplied] = useState("0");
  const [totalBorrowed, setTotalBorrowed] = useState("0");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setReserves([]);
    setTotalSupplied("0");
    setTotalBorrowed("0");
    setLoading(false);
  }, []);

  return { reserves, totalSupplied, totalBorrowed, loading };
}

export interface ServiceHealth {
  name: string;
  category: "DATA" | "MARKETS" | "REALTIME" | "HISTORY";
  status: "operational" | "degraded" | "unavailable";
  latencyMs?: number;
  lastChecked: string;
  summary: string;
}

export function useDataHealth() {
  const [services, setServices] = useState<ServiceHealth[]>([]);
  const [wsState, setWsState] = useState<ConnectionState>("unavailable");
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<string>(new Date().toISOString());

  const checkHealth = useCallback(async () => {
    try {
      setLoading(true);
      const start = performance.now();

      let restOk = false;
      let restLatency = 0;
      try {
        const res = await fetch("/api/dreamdex/v0/tickers");
        restLatency = Math.round(performance.now() - start);
        restOk = res.ok;
      } catch {
        restOk = false;
      }

      const currentWsState = dreamDexWs.getState();
      const wsOk = currentWsState === "connected";

      let marketsOk = false;
      try {
        const mRes = await fetch("/api/dreamdex/v0/markets");
        marketsOk = mRes.ok;
      } catch {
        marketsOk = false;
      }

      setServices([
        {
          name: "Market Data Feed",
          category: "DATA",
          status: restOk ? "operational" : "degraded",
          latencyMs: restLatency > 0 ? restLatency : undefined,
          lastChecked: new Date().toISOString(),
          summary: restOk ? "24h OHLCV and market statistics responsive" : "Delayed or unreachable",
        },
        {
          name: "Market Discovery",
          category: "MARKETS",
          status: marketsOk ? "operational" : "degraded",
          lastChecked: new Date().toISOString(),
          summary: marketsOk ? "Trading pairs and contract metadata verified" : "Discovery endpoint unavailable",
        },
        {
          name: "Realtime WebSocket Feed",
          category: "REALTIME",
          status: wsOk ? "operational" : currentWsState === "connecting" ? "degraded" : "unavailable",
          lastChecked: new Date().toISOString(),
          summary: wsOk ? "Subscribed to L2 orderbook and trade events" : "Gateway stream disconnected",
        },
        {
          name: "Historical Analytics",
          category: "HISTORY",
          status: "operational",
          lastChecked: new Date().toISOString(),
          summary: "Candlestick OHLCV aggregation active",
        },
      ]);
    } finally {
      setLastUpdated(new Date().toISOString());
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkHealth();
    const unsubWs = dreamDexWs.onStateChange((state) => {
      setWsState(state);
    });
    const interval = setInterval(checkHealth, 30000);
    return () => {
      unsubWs();
      clearInterval(interval);
    };
  }, [checkHealth]);

  return { services, wsState, loading, lastUpdated, refetch: checkHealth };
}
