export function formatCurrency(
  value: number | string | undefined | null,
  options?: {
    compact?: boolean;
    decimals?: number;
    showSymbol?: boolean;
  }
): string {
  if (value === undefined || value === null || value === "") return "Unavailable";
  const num = typeof value === "string" ? parseFloat(value) : value;
  if (isNaN(num)) return "Unavailable";

  const { compact = false, decimals, showSymbol = true } = options || {};
  const prefix = showSymbol ? "$" : "";

  if (compact) {
    const abs = Math.abs(num);
    if (abs >= 1_000_000_000) {
      const d = decimals !== undefined ? decimals : 2;
      return `${prefix}${(num / 1_000_000_000).toFixed(d)}B`;
    }
    if (abs >= 1_000_000) {
      const d = decimals !== undefined ? decimals : 2;
      return `${prefix}${(num / 1_000_000).toFixed(d)}M`;
    }
    if (abs >= 1_000) {
      const d = decimals !== undefined ? decimals : 1;
      return `${prefix}${(num / 1_000).toFixed(d)}K`;
    }
  }

  let targetDecimals = decimals;
  if (targetDecimals === undefined) {
    const abs = Math.abs(num);
    if (abs === 0) {
      targetDecimals = 2;
    } else if (abs < 0.001) {
      targetDecimals = 6;
    } else if (abs < 1) {
      targetDecimals = 4;
    } else if (abs >= 1000) {
      targetDecimals = 2;
    } else {
      targetDecimals = 2;
    }
  }

  return `${prefix}${num.toLocaleString("en-US", {
    minimumFractionDigits: targetDecimals,
    maximumFractionDigits: targetDecimals,
  })}`;
}

export function formatPrice(
  value: number | string | undefined | null,
  symbol?: string
): string {
  if (value === undefined || value === null || value === "") return "Unavailable";
  const num = typeof value === "string" ? parseFloat(value) : value;
  if (isNaN(num)) return "Unavailable";

  let decimals = 4;
  if (symbol?.includes("WBTC")) {
    decimals = 2;
  } else if (symbol?.includes("WETH")) {
    decimals = 2;
  } else if (symbol?.includes("USDC")) {
    decimals = 4;
  } else if (num >= 1000) {
    decimals = 2;
  } else if (num < 1) {
    decimals = 4;
  }

  return `$${num.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })}`;
}

export function formatNumber(
  value: number | string | undefined | null,
  decimals: number = 2,
  compact: boolean = false
): string {
  if (value === undefined || value === null || value === "") return "0";
  const num = typeof value === "string" ? parseFloat(value) : value;
  if (isNaN(num)) return "0";

  if (compact) {
    const abs = Math.abs(num);
    if (abs >= 1_000_000_000) {
      return `${(num / 1_000_000_000).toFixed(decimals)}B`;
    }
    if (abs >= 1_000_000) {
      return `${(num / 1_000_000).toFixed(decimals)}M`;
    }
    if (abs >= 1_000) {
      return `${(num / 1_000).toFixed(decimals)}K`;
    }
  }

  return num.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export function formatPercent(
  value: number | string | undefined | null,
  includeSign: boolean = true
): string {
  if (value === undefined || value === null || value === "") return "0.00%";
  const num = typeof value === "string" ? parseFloat(value) : value;
  if (isNaN(num)) return "0.00%";

  const sign = includeSign && num > 0 ? "+" : "";
  return `${sign}${num.toFixed(2)}%`;
}

export function formatBps(value: number | string | undefined | null): string {
  if (value === undefined || value === null || value === "") return "Unavailable";
  const num = typeof value === "string" ? parseFloat(value) : value;
  if (isNaN(num)) return "Unavailable";
  return `${num.toFixed(1)} bps`;
}

export function formatAddress(
  address: string | undefined | null,
  prefixLen: number = 6,
  suffixLen: number = 4
): string {
  if (!address) return "";
  if (address.length <= prefixLen + suffixLen) return address;
  return `${address.slice(0, prefixLen)}...${address.slice(-suffixLen)}`;
}

export function formatTimestamp(timestamp: number | string): string {
  const date = new Date(typeof timestamp === "string" ? parseInt(timestamp, 10) : timestamp);
  if (isNaN(date.getTime())) return "Unknown";
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
}

export function formatRelativeTime(timestamp: number | string): string {
  const time = typeof timestamp === "string" ? parseInt(timestamp, 10) : timestamp;
  if (isNaN(time)) return "Unknown";
  const elapsed = Math.floor((Date.now() - time) / 1000);

  if (elapsed < 5) return "Just now";
  if (elapsed < 60) return `${elapsed}s ago`;
  if (elapsed < 3600) return `${Math.floor(elapsed / 60)}m ago`;
  if (elapsed < 86400) return `${Math.floor(elapsed / 3600)}h ago`;
  return `${Math.floor(elapsed / 86400)}d ago`;
}

export const formatTimeAgo = formatRelativeTime;
