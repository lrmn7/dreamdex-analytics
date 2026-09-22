import { Market, Ticker, OrderBook, Candle, CandleInterval } from "@/domain/market";
import { Trade } from "@/domain/trade";

const getBaseUrl = (): string => {
  return "https://api.dreamdex.io/v0";
};

export class DreamDexRestClient {
  private baseUrl: string;

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl || getBaseUrl();
  }

  public setBaseUrl(url: string) {
    this.baseUrl = url;
  }

  async fetchMarkets(): Promise<Market[]> {
    try {
      const response = await fetch(`${this.baseUrl}/markets`, {
        headers: { Accept: "application/json" },
      });
      if (!response.ok) throw new Error(`HTTP error ${response.status}`);
      const data = await response.json();

      if (Array.isArray(data.markets)) {
        return data.markets.map((m: any) => ({
          symbol: m.symbol,
          baseCurrency: m.symbol.split(":")[0],
          quoteCurrency: m.symbol.split(":")[1] || "USDso",
          baseAddress: m.base,
          quoteAddress: m.quote,
          contractAddress: m.contract,
          stopRegistryAddress: m.stopRegistry,
          baseDecimals: m.baseDecimals,
          quoteDecimals: m.quoteDecimals,
          tickSize: m.tickSize,
          lotSize: m.lotSize,
          minQuantity: m.minQuantity,
          makerFeeBps: 0,
          takerFeeBps: 0,
          status: "active" as const,
        }));
      }
      return [];
    } catch (err) {
      console.warn("REST fetchMarkets failed:", err);
      if (!this.baseUrl.startsWith("https://")) {
        try {
          const directRes = await fetch("https://api.dreamdex.io/v0/markets", {
            headers: { Accept: "application/json" },
          });
          if (directRes.ok) {
            const d = await directRes.json();
            if (Array.isArray(d.markets)) {
              return d.markets.map((m: any) => ({
                symbol: m.symbol,
                baseCurrency: m.symbol.split(":")[0],
                quoteCurrency: m.symbol.split(":")[1] || "USDso",
                baseAddress: m.base,
                quoteAddress: m.quote,
                contractAddress: m.contract,
                stopRegistryAddress: m.stopRegistry,
                baseDecimals: m.baseDecimals,
                quoteDecimals: m.quoteDecimals,
                tickSize: m.tickSize,
                lotSize: m.lotSize,
                minQuantity: m.minQuantity,
                makerFeeBps: 0,
                takerFeeBps: 0,
                status: "active" as const,
              }));
            }
          }
        } catch {}
      }
      return [];
    }
  }

  async fetchCurrencies(): Promise<any[]> {
    try {
      const response = await fetch(`${this.baseUrl}/currencies`, {
        headers: { Accept: "application/json" },
      });
      if (!response.ok) throw new Error(`HTTP error ${response.status}`);
      const data = await response.json();
      return Array.isArray(data.currencies) ? data.currencies : [];
    } catch (err) {
      console.warn("REST fetchCurrencies failed:", err);
      return [];
    }
  }

  async fetchTickers(symbols?: string[]): Promise<Ticker[]> {
    const query = symbols && symbols.length > 0
      ? `?${symbols.map((s) => `symbols=${encodeURIComponent(s)}`).join("&")}`
      : "";
    try {
      const response = await fetch(`${this.baseUrl}/tickers${query}`, {
        headers: { Accept: "application/json" },
      });
      if (!response.ok) throw new Error(`HTTP error ${response.status}`);
      const data = await response.json();
      if (Array.isArray(data.symbols)) {
        return data.symbols.map((t: any) => {
          const open = parseFloat(t.open || "0");
          const close = parseFloat(t.close || "0");
          const change24hPercent = open > 0 ? ((close - open) / open) * 100 : 0;
          return {
            symbol: t.symbol,
            timestamp: t.timestamp,
            open: t.open,
            high: t.high,
            low: t.low,
            close: t.close,
            volume: t.volume,
            change24hPercent,
          };
        });
      }
      return [];
    } catch (err) {
      console.warn("REST fetchTickers failed:", err);
      return [];
    }
  }

  async fetchOrderBooks(symbols: string[], depth: number = 50): Promise<OrderBook[]> {
    if (!symbols || symbols.length === 0) return [];
    try {
      const symbolsQuery = symbols.map((s) => `symbols=${encodeURIComponent(s)}`).join("&");
      const response = await fetch(`${this.baseUrl}/orderbooks?${symbolsQuery}&depth=${depth}`, {
        headers: { Accept: "application/json" },
      });
      if (!response.ok) throw new Error(`HTTP error ${response.status}`);
      const data = await response.json();
      if (Array.isArray(data.orderbooks)) {
        return data.orderbooks.map((ob: any) => this.normalizeOrderBook(ob));
      }
      return [];
    } catch (err) {
      console.warn("REST fetchOrderBooks failed:", err);
      return [];
    }
  }


  async fetchRecentTrades(symbol: string, limit: number = 50): Promise<Trade[]> {
    try {
      const response = await fetch(`${this.baseUrl}/markets/${encodeURIComponent(symbol)}/trades?limit=${limit}`, {
        headers: { Accept: "application/json" },
      });
      if (!response.ok) throw new Error(`HTTP error ${response.status}`);
      const data = await response.json();
      if (Array.isArray(data.trades)) {
        return data.trades.map((t: any) => {
          const price = String(t.price || "0");
          const amount = String(t.amount ?? t.quantity ?? "0");
          const cost = t.cost !== undefined && t.cost !== null && t.cost !== ""
            ? String(t.cost)
            : String(parseFloat(price) * parseFloat(amount));

          return {
            id: String(t.id || `trade-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`),
            symbol: t.symbol || symbol,
            timestamp: typeof t.timestamp === "number" ? t.timestamp : (Date.parse(t.timestamp) || Date.now()),
            price,
            amount,
            cost,
            side: t.side === "sell" ? "sell" : "buy",
            maker: t.maker,
            taker: t.taker,
            txHash: t.txHash || t.transactionHash,
          };
        });
      }
      return [];
    } catch (err) {
      console.warn(`REST fetchRecentTrades failed for ${symbol}:`, err);
      return [];
    }
  }


  async fetchCandles(
    symbol: string,
    interval: CandleInterval = "1h",
    limit: number = 100,
    endTime?: number
  ): Promise<Candle[]> {
    try {
      const endQuery = endTime ? `&endTime=${endTime}` : "";
      const response = await fetch(
        `${this.baseUrl}/markets/${encodeURIComponent(symbol)}/candles?interval=${interval}&limit=${limit}${endQuery}`,
        { headers: { Accept: "application/json" } }
      );
      if (!response.ok) throw new Error(`HTTP error ${response.status}`);
      const data = await response.json();
      if (Array.isArray(data.candles)) {
        return data.candles.map((c: any) => ({
          timestamp: c.timestamp,
          open: c.open,
          high: c.high,
          low: c.low,
          close: c.close,
          volume: c.volume,
        }));
      }
      return [];
    } catch (err) {
      console.warn(`REST fetchCandles failed for ${symbol}:`, err);
      return [];
    }
  }

  async fetchMarketVolume(
    symbol: string,
    since?: number,
    until?: number
  ): Promise<{
    symbol: string;
    baseVolume: string;
    baseVolumeRaw: string;
    quoteVolume: string;
    quoteVolumeRaw: string;
    since: number;
    until: number;
  } | null> {
    try {
      const params = new URLSearchParams();
      if (since) params.set("since", since.toString());
      if (until) params.set("until", until.toString());
      const query = params.toString() ? `?${params.toString()}` : "";

      const response = await fetch(`${this.baseUrl}/markets/${encodeURIComponent(symbol)}/volume${query}`, {
        headers: { Accept: "application/json" },
      });
      if (!response.ok) throw new Error(`HTTP error ${response.status}`);
      const data = await response.json();
      return data;
    } catch (err) {
      console.warn(`REST fetchMarketVolume failed for ${symbol}:`, err);
      return null;
    }
  }

  public normalizeOrderBook(ob: any): OrderBook {
    const bids = Array.isArray(ob.bids) ? ob.bids : [];
    const asks = Array.isArray(ob.asks) ? ob.asks : [];

    const bestBid = bids.length > 0 ? bids[0].price : undefined;
    const bestAsk = asks.length > 0 ? asks[0].price : undefined;

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
      symbol: ob.symbol,
      timestamp: ob.timestamp || Date.now(),
      bids,
      asks,
      bestBid,
      bestAsk,
      midPrice,
      spread,
      spreadBps,
    };
  }
}

export const dreamDexRest = new DreamDexRestClient();
