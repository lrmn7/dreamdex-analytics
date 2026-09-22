export interface SpreadCalculation {
  bestBid: number;
  bestAsk: number;
  spread: number;
  spreadBps: number;
  midPrice: number;
}

export function calculateSpread(
  bestBidInput: string | number | undefined | null,
  bestAskInput: string | number | undefined | null
): SpreadCalculation | null {
  if (bestBidInput === undefined || bestBidInput === null || bestAskInput === undefined || bestAskInput === null) {
    return null;
  }

  const bestBid = typeof bestBidInput === "string" ? parseFloat(bestBidInput) : bestBidInput;
  const bestAsk = typeof bestAskInput === "string" ? parseFloat(bestAskInput) : bestAskInput;

  if (isNaN(bestBid) || isNaN(bestAsk) || bestBid <= 0 || bestAsk <= 0 || bestBid >= bestAsk) {
    return null;
  }

  const midPrice = (bestBid + bestAsk) / 2;
  const spread = bestAsk - bestBid;
  const spreadBps = ((spread) / midPrice) * 10000;

  return {
    bestBid,
    bestAsk,
    spread,
    spreadBps,
    midPrice,
  };
}

export function calculateProximityWeight(
  orderPrice: number,
  midPrice: number,
  sigma: number = 0.05
): number {
  if (midPrice <= 0 || sigma <= 0) return 0;
  const priceDelta = orderPrice - midPrice;
  const exponent = -Math.pow(priceDelta, 2) / (2 * Math.pow(sigma, 2));
  return Math.exp(exponent);
}

export function calculateProximityScore(
  quantity: number,
  weight: number,
  durationSeconds: number
): number {
  return quantity * weight * durationSeconds;
}

export function calculateDepthAtThreshold(
  levels: Array<{ price: string; quantity: string }>,
  midPrice: number,
  thresholdPercent: number,
  side: "bid" | "ask"
): number {
  if (!midPrice || midPrice <= 0) return 0;

  let cumulativeUsd = 0;

  for (const level of levels) {
    const p = parseFloat(level.price);
    const q = parseFloat(level.quantity);
    if (isNaN(p) || isNaN(q)) continue;

    const diffPercent = side === "bid"
      ? ((midPrice - p) / midPrice) * 100
      : ((p - midPrice) / midPrice) * 100;

    if (diffPercent <= thresholdPercent && diffPercent >= 0) {
      cumulativeUsd += p * q;
    }
  }

  return cumulativeUsd;
}
