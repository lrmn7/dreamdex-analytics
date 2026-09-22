import { DataMeta } from "./market";

export interface GlobalOverviewMetrics {
  totalSpotVolume24h: string;
  totalSpotVolume7d: string;
  totalSpotVolume30d: string;
  aggregateVisibleDepthUsd: string;
  activeMarketsCount: number;
  totalTrades24h: number;
  totalTrades7d: number;
  averageSpreadBps: string;
  meta: DataMeta;
}

export interface VolumeTimeSeriesPoint {
  timestamp: number;
  volumeUsd: number;
  tradeCount: number;
  buyVolumeUsd?: number;
  sellVolumeUsd?: number;
}

export interface LiquidityTimeSeriesPoint {
  timestamp: number;
  depthTotalUsd: number;
  bidDepthUsd: number;
  askDepthUsd: number;
  spreadBps: number;
}

export interface MarketVolumeBreakdown {
  symbol: string;
  volumeUsd: number;
  volumePercentage: number;
  tradeCount: number;
}

export interface EventContractMarket {
  id: string;
  symbol: string;
  title: string;
  category: string;
  status: "active" | "closed" | "resolved";
  timeToCloseMs: number;
  upPrice: number; // Implied probability 0.00 - 1.00
  downPrice: number;
  volumeUsd: number;
  tradeCount: number;
  outcome?: "UP" | "DOWN" | "CANCELLED";
  resolvedAt?: number;
  meta: DataMeta;
}

export interface LendReserve {
  asset: string;
  name: string;
  symbol: string;
  tokenAddress: string;
  decimals: number;
  suppliedAmount: string;
  suppliedUsd: string;
  borrowedAmount: string;
  borrowedUsd: string;
  availableLiquidityUsd: string;
  utilizationRate: number; // 0.00 - 1.00
  supplyApy: number; // percentage, e.g. 4.85
  borrowApy: number; // percentage, e.g. 7.20
  reserveStatus: "active" | "frozen";
  meta: DataMeta;
}

export interface DataHealthInfo {
  source: string;
  status: "connected" | "connecting" | "stale" | "healthy" | "degraded" | "unavailable";
  latencyMs?: number;
  lastSuccessTimestamp: number;
  errorCount24h: number;
  message?: string;
}
