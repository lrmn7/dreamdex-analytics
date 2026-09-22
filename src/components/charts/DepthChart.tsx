import React from "react";
import { OrderBook } from "@/domain/market";
import { formatNumber } from "@/lib/formatters";

export interface DepthChartProps {
  orderBook: OrderBook;
  height?: number;
  className?: string;
}

export const DepthChart: React.FC<DepthChartProps> = ({
  orderBook,
  height = 200,
  className = "",
}) => {
  if (!orderBook || (!orderBook.bids.length && !orderBook.asks.length)) {
    return (
      <div
        className={`w-full flex items-center justify-center border border-border-subtle rounded text-text-faint text-xs font-mono ${className}`}
        style={{ height }}
      >
        No order book depth available
      </div>
    );
  }

  const chartWidth = 500;
  const paddingLeft = 10;
  const paddingRight = 10;
  const paddingTop = 10;
  const paddingBottom = 20;

  const innerWidth = chartWidth - paddingLeft - paddingRight;
  const innerHeight = height - paddingTop - paddingBottom;
  const halfWidth = innerWidth / 2;

  let cumBid = 0;
  const bidPoints = [...orderBook.bids]
    .sort((a, b) => parseFloat(b.price) - parseFloat(a.price))
    .slice(0, 15)
    .map((lvl) => {
      cumBid += parseFloat(lvl.quantity);
      return { price: parseFloat(lvl.price), cum: cumBid };
    });

  let cumAsk = 0;
  const askPoints = [...orderBook.asks]
    .sort((a, b) => parseFloat(a.price) - parseFloat(b.price))
    .slice(0, 15)
    .map((lvl) => {
      cumAsk += parseFloat(lvl.quantity);
      return { price: parseFloat(lvl.price), cum: cumAsk };
    });

  const maxCum = Math.max(cumBid, cumAsk) * 1.05 || 1;

  const revBids = [...bidPoints].reverse();
  const bidSvgPoints = revBids.map((b, i) => {
    const x = paddingLeft + (i / Math.max(revBids.length - 1, 1)) * halfWidth;
    const y = paddingTop + innerHeight - (b.cum / maxCum) * innerHeight;
    return `${x},${y}`;
  });

  const bidPath = bidSvgPoints.length > 0
    ? `M ${bidSvgPoints.join(" L ")} L ${paddingLeft + halfWidth},${paddingTop + innerHeight} L ${paddingLeft},${paddingTop + innerHeight} Z`
    : "";

  const askSvgPoints = askPoints.map((a, i) => {
    const x = paddingLeft + halfWidth + (i / Math.max(askPoints.length - 1, 1)) * halfWidth;
    const y = paddingTop + innerHeight - (a.cum / maxCum) * innerHeight;
    return `${x},${y}`;
  });

  const askPath = askSvgPoints.length > 0
    ? `M ${paddingLeft + halfWidth},${paddingTop + innerHeight} L ${askSvgPoints.join(" L ")} L ${paddingLeft + innerWidth},${paddingTop + innerHeight} Z`
    : "";

  return (
    <div className={`w-full select-none ${className}`}>
      <div className="flex justify-between text-[11px] font-mono text-text-muted mb-1 px-1">
        <span>Bids ({formatNumber(cumBid, 0, true)})</span>
        <span>Mid: {orderBook.midPrice || "N/A"}</span>
        <span>Asks ({formatNumber(cumAsk, 0, true)})</span>
      </div>

      <svg viewBox={`0 0 ${chartWidth} ${height}`} className="w-full" style={{ height }}>
        {bidPath && (
          <path d={bidPath} fill="rgba(255, 255, 255, 0.15)" stroke="#ffffff" strokeWidth="1.75" />
        )}
        {askPath && (
          <path
            d={askPath}
            fill="rgba(255, 255, 255, 0.06)"
            stroke="var(--text-secondary)"
            strokeWidth="1.5"
            strokeDasharray="4 3"
          />
        )}
        <line
          x1={paddingLeft}
          y1={paddingTop + innerHeight}
          x2={paddingLeft + innerWidth}
          y2={paddingTop + innerHeight}
          stroke="var(--border-strong)"
          strokeWidth="1"
        />
        <line
          x1={paddingLeft + halfWidth}
          y1={paddingTop}
          x2={paddingLeft + halfWidth}
          y2={paddingTop + innerHeight}
          stroke="var(--text-faint)"
          strokeDasharray="3 3"
        />
      </svg>
    </div>
  );
};
