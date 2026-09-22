export type DataSourceType = "live" | "api" | "on-chain" | "indexed" | "calculated";

export interface DataMeta {
  source: DataSourceType;
  updatedAt: string;
  freshnessThresholdSeconds?: number;
  methodologyVersion?: string;
  sourceEndpoint?: string;
}

export interface Market {
  symbol: string;
  baseCurrency: string;
  quoteCurrency: string;
  baseAddress: string;
  quoteAddress: string;
  contractAddress: string; // SpotPool contract address
  stopRegistryAddress?: string;
  baseDecimals: number;
  quoteDecimals: number;
  tickSize: string;
  lotSize: string;
  minQuantity: string;
  makerFeeBps: number;
  takerFeeBps: number;
  status: "active" | "inactive" | "maintenance";
}

export interface Ticker {
  symbol: string;
  timestamp: number;
  open: string;
  high: string;
  low: string;
  close: string;
  volume: string;
  baseVolume?: string;
  quoteVolume?: string;
  change24hPercent?: number;
}

export interface PriceLevel {
  price: string;
  quantity: string;
  totalQuantity?: string;
  cumulativeQuote?: string;
  depthPercent?: number;
}

export interface OrderBook {
  symbol: string;
  timestamp: number;
  bids: PriceLevel[];
  asks: PriceLevel[];
  bestBid?: string;
  bestAsk?: string;
  midPrice?: string;
  spread?: string;
  spreadBps?: string;
  depthBidsUsd?: string;
  depthAsksUsd?: string;
}

export interface Candle {
  timestamp: number;
  open: string;
  high: string;
  low: string;
  close: string;
  volume: string;
}

export type CandleInterval = "1m" | "5m" | "15m" | "1h" | "4h" | "1d";
