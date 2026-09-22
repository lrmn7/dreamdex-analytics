import React, { useState, useRef } from "react";
import { formatCurrency, formatNumber } from "@/lib/formatters";

export interface DataPoint {
  timestamp: number;
  value: number;
  secondaryValue?: number;
  label?: string;
}

export interface AreaChartProps {
  data: DataPoint[];
  height?: number;
  valuePrefix?: string;
  isCurrency?: boolean;
  showSecondary?: boolean;
  primaryLabel?: string;
  secondaryLabel?: string;
  className?: string;
}

export const AreaChart: React.FC<AreaChartProps> = ({
  data,
  height = 240,
  valuePrefix = "$",
  isCurrency = true,
  showSecondary = false,
  primaryLabel = "Total",
  secondaryLabel = "Secondary",
  className = "",
}) => {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  if (!data || data.length === 0) {
    return (
      <div
        className={`w-full flex flex-col items-center justify-center border border-border-subtle rounded relative overflow-hidden bg-surface-1/40 ${className}`}
        style={{ height }}
      >
        <svg className="w-full h-full opacity-20 animate-pulse" preserveAspectRatio="none" viewBox="0 0 400 100">
          <path
            d="M0,80 Q50,40 100,60 T200,30 T300,50 T400,20 L400,100 L0,100 Z"
            fill="currentColor"
            className="text-text-muted"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center text-text-muted text-xs font-mono">
          <span className="animate-pulse">Loading telemetry series...</span>
        </div>
      </div>
    );
  }

  const values = data.map((d) => d.value);
  const secondaryValues = showSecondary ? data.map((d) => d.secondaryValue || 0) : [];
  const allValues = [...values, ...secondaryValues];

  const rawMin = Math.min(...allValues);
  const rawMax = Math.max(...allValues);
  const spread = rawMax - rawMin;
  const pad = spread > 0 ? spread * 0.15 : (rawMax > 0 ? rawMax * 0.08 : 10);
  const minValue = Math.max(0, rawMin - pad);
  const maxValue = rawMax + pad;
  const range = maxValue - minValue || 1;

  const paddingLeft = 14;
  const paddingRight = 62;
  const paddingTop = 20;
  const paddingBottom = 28;

  const chartWidth = 720;
  const chartHeight = height;

  const innerWidth = chartWidth - paddingLeft - paddingRight;
  const innerHeight = chartHeight - paddingTop - paddingBottom;

  const getX = (index: number) => {
    if (data.length <= 1) return paddingLeft + innerWidth / 2;
    return paddingLeft + (index / (data.length - 1)) * innerWidth;
  };

  const getY = (val: number) => {
    return paddingTop + innerHeight - ((val - minValue) / range) * innerHeight;
  };

  const primaryPoints = data.map((d, i) => `${getX(i)},${getY(d.value)}`);
  const primaryLinePath = `M ${primaryPoints.join(" L ")}`;
  const primaryAreaPath = `${primaryLinePath} L ${getX(data.length - 1)},${paddingTop + innerHeight} L ${getX(0)},${paddingTop + innerHeight} Z`;

  let secondaryLinePath = "";
  if (showSecondary) {
    const secPoints = data.map((d, i) => `${getX(i)},${getY(d.secondaryValue || 0)}`);
    secondaryLinePath = `M ${secPoints.join(" L ")}`;
  }

  const activeIndex = hoverIndex !== null ? hoverIndex : data.length - 1;
  const activePoint = data[activeIndex] || data[0];

  const updateHoverFromClientX = (clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const relativeX = clientX - rect.left;
    const normalizedX = (relativeX / rect.width) * chartWidth;

    let closestIdx = 0;
    let minDiff = Infinity;
    data.forEach((_, i) => {
      const diff = Math.abs(getX(i) - normalizedX);
      if (diff < minDiff) {
        minDiff = diff;
        closestIdx = i;
      }
    });

    setHoverIndex(closestIdx);
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
    setHoverIndex(null);
  };

  const gridLevels = [
    maxValue,
    minValue + range * 0.66,
    minValue + range * 0.33,
    minValue,
  ];

  const activeY = getY(activePoint.value);
  const activeX = getX(activeIndex);

  return (
    <div ref={containerRef} className={`w-full relative select-none font-sans ${className}`}>
      <div className="flex flex-wrap items-baseline justify-between gap-4 mb-3 border-b border-border pb-3">
        <div className="flex items-baseline gap-3">
          <span className="text-2xl sm:text-3xl font-mono font-bold text-text-primary tracking-tight">
            {isCurrency
              ? formatCurrency(activePoint.value, { compact: false })
              : `${valuePrefix}${formatNumber(activePoint.value, 2)}`}
          </span>
          <span className="text-xs font-mono text-text-muted">
            {new Date(activePoint.timestamp).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>

        {showSecondary && (
          <div className="flex items-center gap-4 text-xs font-mono text-text-secondary">
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-0.5 bg-text-primary inline-block" />
              <span>{primaryLabel}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-0.5 border-t border-dashed border-text-muted inline-block" />
              <span>{secondaryLabel}</span>
            </div>
          </div>
        )}
      </div>

      <svg
        viewBox={`0 0 ${chartWidth} ${chartHeight}`}
        className="w-full overflow-visible touch-none"
        style={{ height }}
        onMouseMove={handleMouseMove}
        onTouchMove={handleTouchMove}
        onTouchStart={handleTouchMove}
        onMouseLeave={handleMouseLeave}
      >
        <defs>
          <linearGradient id="areaGradientMono" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.20" />
            <stop offset="60%" stopColor="#ffffff" stopOpacity="0.04" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0.00" />
          </linearGradient>
        </defs>
        {gridLevels.map((lvl, i) => {
          const y = getY(lvl);
          return (
            <g key={i}>
              <line
                x1={paddingLeft}
                y1={y}
                x2={chartWidth - paddingRight}
                y2={y}
                stroke="rgba(255, 255, 255, 0.08)"
                strokeDasharray="3 4"
                strokeWidth="1"
              />
              <text
                x={chartWidth - paddingRight + 8}
                y={y + 3.5}
                className="text-[10px] fill-text-muted font-mono font-medium"
              >
                {isCurrency ? formatCurrency(lvl, { compact: true }) : formatNumber(lvl, 0, true)}
              </text>
            </g>
          );
        })}
        <line
          x1={paddingLeft}
          y1={paddingTop + innerHeight}
          x2={chartWidth - paddingRight}
          y2={paddingTop + innerHeight}
          stroke="var(--border-strong)"
          strokeWidth="1.25"
        />
        <path d={primaryAreaPath} fill="url(#areaGradientMono)" />
        <path
          d={primaryLinePath}
          fill="none"
          stroke="#ffffff"
          strokeWidth="2.2"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        {showSecondary && (
          <path
            d={secondaryLinePath}
            fill="none"
            stroke="var(--text-secondary)"
            strokeWidth="1.75"
            strokeDasharray="5 3"
            strokeLinejoin="round"
          />
        )}
        {hoverIndex !== null && (
          <g>
            <line
              x1={activeX}
              y1={paddingTop}
              x2={activeX}
              y2={paddingTop + innerHeight}
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
            <circle
              cx={activeX}
              cy={activeY}
              r="6"
              fill="rgba(255, 255, 255, 0.2)"
              stroke="var(--text-primary)"
              strokeWidth="1.5"
            />
            <circle
              cx={activeX}
              cy={activeY}
              r="2.5"
              fill="var(--background)"
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
                {isCurrency ? formatCurrency(activePoint.value, { compact: true }) : formatNumber(activePoint.value, 1)}
              </text>
            </g>
            <g transform={`translate(${Math.max(paddingLeft + 35, Math.min(chartWidth - paddingRight - 35, activeX)) - 35}, ${paddingTop + innerHeight + 6})`}>
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
                {new Date(activePoint.timestamp).toLocaleDateString("en-US", {
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
