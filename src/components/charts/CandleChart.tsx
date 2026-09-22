import React, { useState, useRef } from "react";
import { Candle } from "@/domain/market";
import { formatNumber, formatPrice } from "@/lib/formatters";

export interface CandleChartProps {
  candles: Candle[];
  height?: number;
  symbol?: string;
  className?: string;
}

export const CandleChart: React.FC<CandleChartProps> = ({
  candles,
  height = 340,
  symbol = "SOMI:USDso",
  className = "",
}) => {
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  if (!candles || candles.length === 0) {
    return (
      <div
        className={`w-full flex items-center justify-center border border-border-subtle rounded text-text-faint text-xs font-mono ${className}`}
        style={{ height }}
      >
        No candle data available
      </div>
    );
  }

  const chartWidth = 720;
  const paddingLeft = 14;
  const paddingRight = 62;
  const paddingTop = 24;
  const volumeHeight = 64;
  const priceHeight = height - volumeHeight - paddingTop - 32;

  const prices = candles.flatMap((c) => [parseFloat(c.high), parseFloat(c.low)]);
  const minPrice = Math.min(...prices) * 0.997;
  const maxPrice = Math.max(...prices) * 1.003;
  const priceRange = maxPrice - minPrice || 1;

  const volumes = candles.map((c) => parseFloat(c.volume));
  const maxVolume = Math.max(...volumes) || 1;

  const innerWidth = chartWidth - paddingLeft - paddingRight;
  const candleCount = candles.length;
  const candleSlotWidth = innerWidth / candleCount;
  const candleBodyWidth = Math.max(Math.min(candleSlotWidth * 0.7, 12), 3);

  const getX = (idx: number) => paddingLeft + idx * candleSlotWidth + candleSlotWidth / 2;
  const getY = (price: number) =>
    paddingTop + priceHeight - ((price - minPrice) / priceRange) * priceHeight;

  const activeIndex = hoverIdx !== null ? hoverIdx : candles.length - 1;
  const activeCandle = candles[activeIndex] || candles[0];

  const openNum = parseFloat(activeCandle.open);
  const closeNum = parseFloat(activeCandle.close);
  const changePercent = openNum > 0 ? ((closeNum - openNum) / openNum) * 100 : 0;
  const isUpActive = closeNum >= openNum;

  const updateHoverFromClientX = (clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const relativeX = clientX - rect.left;
    const normalizedX = (relativeX / rect.width) * chartWidth;

    const idx = Math.floor((normalizedX - paddingLeft) / candleSlotWidth);
    if (idx >= 0 && idx < candleCount) {
      setHoverIdx(idx);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    updateHoverFromClientX(e.clientX);
  };

  const handleTouchMove = (e: React.TouchEvent<SVGSVGElement>) => {
    if (e.touches.length > 0) {
      updateHoverFromClientX(e.touches[0].clientX);
    }
  };

  const handleMouseLeave = () => {
    setHoverIdx(null);
  };

  const priceLevels = [
    maxPrice,
    minPrice + priceRange * 0.66,
    minPrice + priceRange * 0.33,
    minPrice,
  ];

  const activeY = getY(closeNum);
  const activeX = getX(activeIndex);

  return (
    <div ref={containerRef} className={`w-full relative select-none font-sans ${className}`}>
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-mono mb-3 border-b border-border pb-3 text-text-secondary">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="text-text-muted">O</span>
            <span className="text-text-primary font-medium">{formatPrice(openNum, symbol)}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-text-muted">H</span>
            <span className="text-text-primary font-medium">{formatPrice(parseFloat(activeCandle.high), symbol)}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-text-muted">L</span>
            <span className="text-text-primary font-medium">{formatPrice(parseFloat(activeCandle.low), symbol)}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-text-muted">C</span>
            <span className="text-text-primary font-bold">{formatPrice(closeNum, symbol)}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-text-muted">Chg</span>
            <span className={`font-semibold ${isUpActive ? "text-text-primary" : "text-text-muted"}`}>
              {changePercent >= 0 ? `+${changePercent.toFixed(2)}%` : `${changePercent.toFixed(2)}%`}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-text-muted">Vol</span>
            <span className="text-text-primary">{formatNumber(activeCandle.volume, 2, true)}</span>
          </div>
        </div>

        <div className="text-text-faint text-[11px] ml-auto hidden md:block">
          {new Date(activeCandle.timestamp).toLocaleString("en-US", {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </div>
      </div>

      <svg
        viewBox={`0 0 ${chartWidth} ${height}`}
        className="w-full overflow-visible touch-none"
        style={{ height }}
        onMouseMove={handleMouseMove}
        onTouchMove={handleTouchMove}
        onTouchStart={handleTouchMove}
        onMouseLeave={handleMouseLeave}
      >
        {priceLevels.map((p, i) => {
          const y = getY(p);
          return (
            <g key={i}>
              <line
                x1={paddingLeft}
                y1={y}
                x2={chartWidth - paddingRight}
                y2={y}
                stroke="var(--border)"
                strokeDasharray="2 4"
                strokeWidth="1"
              />
              <text
                x={chartWidth - paddingRight + 8}
                y={y + 3.5}
                className="text-[10px] fill-text-faint font-mono"
              >
                {formatPrice(p, symbol)}
              </text>
            </g>
          );
        })}
        <line
          x1={paddingLeft}
          y1={paddingTop + priceHeight + 10}
          x2={chartWidth - paddingRight}
          y2={paddingTop + priceHeight + 10}
          stroke="var(--border-strong)"
          strokeWidth="1"
        />
        <line
          x1={paddingLeft}
          y1={height - 20}
          x2={chartWidth - paddingRight}
          y2={height - 20}
          stroke="var(--border-subtle)"
          strokeWidth="1"
        />
        {candles.map((c, i) => {
          const open = parseFloat(c.open);
          const close = parseFloat(c.close);
          const high = parseFloat(c.high);
          const low = parseFloat(c.low);
          const isUp = close >= open;

          const x = getX(i);
          const yHigh = getY(high);
          const yLow = getY(low);
          const yOpen = getY(open);
          const yClose = getY(close);

          const bodyTop = Math.min(yOpen, yClose);
          const bodyHeight = Math.max(Math.abs(yOpen - yClose), 1.5);

          const vol = parseFloat(c.volume);
          const volBarHeight = Math.max((vol / maxVolume) * (volumeHeight - 14), 1);
          const volY = height - 20 - volBarHeight;

          return (
            <g key={c.timestamp}>
              <line
                x1={x}
                y1={yHigh}
                x2={x}
                y2={yLow}
                stroke={isUp ? "var(--text-primary)" : "var(--text-muted)"}
                strokeWidth="1"
              />
              <rect
                x={x - candleBodyWidth / 2}
                y={bodyTop}
                width={candleBodyWidth}
                height={bodyHeight}
                fill={isUp ? "var(--background)" : "var(--surface-3)"}
                stroke={isUp ? "var(--text-primary)" : "var(--border-strong)"}
                strokeWidth="1"
              />
              <rect
                x={x - candleBodyWidth / 2}
                y={volY}
                width={candleBodyWidth}
                height={volBarHeight}
                fill={isUp ? "rgba(255, 255, 255, 0.28)" : "rgba(255, 255, 255, 0.10)"}
              />
            </g>
          );
        })}
        {hoverIdx !== null && (
          <g>
            <line
              x1={activeX}
              y1={paddingTop}
              x2={activeX}
              y2={height - 20}
              stroke="var(--text-faint)"
              strokeDasharray="3 3"
              strokeWidth="1"
            />
            <line
              x1={paddingLeft}
              y1={activeY}
              x2={chartWidth - paddingRight}
              y2={activeY}
              stroke="var(--text-faint)"
              strokeDasharray="3 3"
              strokeWidth="1"
            />
            <g transform={`translate(${chartWidth - paddingRight + 4}, ${activeY - 9})`}>
              <rect
                x="0"
                y="0"
                width="54"
                height="18"
                fill="var(--surface-3)"
                stroke="var(--border-strong)"
                rx="2"
              />
              <text
                x="27"
                y="12"
                textAnchor="middle"
                className="text-[9px] fill-text-primary font-mono font-semibold"
              >
                {formatPrice(closeNum, symbol)}
              </text>
            </g>
            <g transform={`translate(${Math.max(paddingLeft + 35, Math.min(chartWidth - paddingRight - 35, activeX)) - 35}, ${height - 16})`}>
              <rect
                x="0"
                y="0"
                width="70"
                height="16"
                fill="var(--surface-3)"
                stroke="var(--border-strong)"
                rx="2"
              />
              <text
                x="35"
                y="11"
                textAnchor="middle"
                className="text-[9px] fill-text-primary font-mono"
              >
                {new Date(activeCandle.timestamp).toLocaleDateString("en-US", {
                  month: "numeric",
                  day: "numeric",
                })}
              </text>
            </g>
          </g>
        )}
      </svg>
    </div>
  );
};
