export type TradeSide = "buy" | "sell";

export interface Trade {
  id: string;
  symbol: string;
  timestamp: number;
  price: string;
  amount: string;
  cost: string;
  side: TradeSide;
  maker?: string;
  taker?: string;
  txHash?: string;
}

export type SpotEventType =
  | "OrderPlaced"
  | "OrderRested"
  | "OrderFilled"
  | "OrderCancelled"
  | "OrderExpired"
  | "OrderReduced";

export interface ProtocolActivityEvent {
  id: string;
  blockNumber: number;
  transactionHash: string;
  logIndex: number;
  eventType: SpotEventType;
  marketSymbol: string;
  marketAddress: string;
  orderId: string;
  walletAddress?: string;
  details: {
    quantity?: string;
    price?: string;
    takerOrderId?: string;
    makerOrderId?: string;
    quantityFilled?: string;
    remainingQuantity?: string;
    side?: "buy" | "sell";
  };
  blockTimestamp: number;
}
