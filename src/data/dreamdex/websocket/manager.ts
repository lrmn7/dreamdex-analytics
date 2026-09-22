export type ConnectionState = "connecting" | "connected" | "stale" | "unavailable";

export type WsMessageHandler = (data: any) => void;
export type StateChangeHandler = (state: ConnectionState) => void;

interface Subscription {
  channel: "orderbook" | "trades" | "ohlcv";
  params: Record<string, any>;
}

export class DreamDexWsManager {
  private url: string;
  private ws: WebSocket | null = null;
  private connectionState: ConnectionState = "unavailable";
  private pingTimer: number | null = null;
  private staleTimer: number | null = null;
  private reconnectTimer: number | null = null;
  private reconnectAttempts = 0;
  private subscriptions = new Map<string, Subscription>();
  private messageHandlers = new Set<WsMessageHandler>();
  private stateHandlers = new Set<StateChangeHandler>();
  private isIntentionallyClosed = false;

  constructor(url: string = "wss://api.dreamdex.io/v0/ws/public") {
    this.url = url;
  }

  public connect(): void {
    if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
      return;
    }

    this.isIntentionallyClosed = false;
    this.updateState("connecting");

    try {
      this.ws = new WebSocket(this.url);

      this.ws.onopen = () => {
        this.reconnectAttempts = 0;
        this.updateState("connected");
        this.startHeartbeat();
        this.resubscribeAll();
      };

      this.ws.onmessage = (event) => {
        this.resetStaleTimer();
        try {
          const data = JSON.parse(event.data);
          if (data.type === "pong" || data.operation === "pong") {
            return;
          }
          this.notifyMessage(data);
        } catch (e) {
          console.warn("Failed to parse WebSocket message:", e);
        }
      };

      this.ws.onclose = () => {
        this.cleanupTimers();
        if (!this.isIntentionallyClosed) {
          this.scheduleReconnect();
        } else {
          this.updateState("unavailable");
        }
      };

      this.ws.onerror = (err) => {
        console.warn("DreamDex WebSocket encountered an error:", err);
        this.ws?.close();
      };
    } catch (e) {
      console.warn("Could not initiate WebSocket connection:", e);
      this.scheduleReconnect();
    }
  }

  public disconnect(): void {
    this.isIntentionallyClosed = true;
    this.cleanupTimers();
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.updateState("unavailable");
  }

  public subscribe(channel: "orderbook" | "trades" | "ohlcv", params: Record<string, any>): void {
    const key = `${channel}:${JSON.stringify(params)}`;
    this.subscriptions.set(key, { channel, params });

    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.send({
        operation: "subscribe",
        channel,
        params,
      });
    } else if (this.connectionState === "unavailable") {
      this.connect();
    }
  }

  public unsubscribe(channel: "orderbook" | "trades" | "ohlcv", params: Record<string, any>): void {
    const key = `${channel}:${JSON.stringify(params)}`;
    this.subscriptions.delete(key);

    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.send({
        operation: "unsubscribe",
        channel,
        params,
      });
    }
  }

  public onMessage(handler: WsMessageHandler): () => void {
    this.messageHandlers.add(handler);
    return () => this.messageHandlers.delete(handler);
  }

  public onStateChange(handler: StateChangeHandler): () => void {
    this.stateHandlers.add(handler);
    handler(this.connectionState);
    return () => this.stateHandlers.delete(handler);
  }

  public getState(): ConnectionState {
    return this.connectionState;
  }

  private send(payload: any): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(payload));
    }
  }

  private startHeartbeat(): void {
    if (this.pingTimer) clearInterval(this.pingTimer);
    this.pingTimer = window.setInterval(() => {
      this.send({ operation: "ping" });
    }, 25000);

    this.resetStaleTimer();
  }

  private resetStaleTimer(): void {
    if (this.staleTimer) clearTimeout(this.staleTimer);
    this.staleTimer = window.setTimeout(() => {
      if (this.connectionState === "connected") {
        this.updateState("stale");
        this.ws?.close();
      }
    }, 45000);
  }

  private cleanupTimers(): void {
    if (this.pingTimer) clearInterval(this.pingTimer);
    if (this.staleTimer) clearTimeout(this.staleTimer);
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    this.pingTimer = null;
    this.staleTimer = null;
    this.reconnectTimer = null;
  }

  private scheduleReconnect(): void {
    this.updateState(this.reconnectAttempts > 0 ? "unavailable" : "connecting");
    const delay = Math.min(1000 * Math.pow(1.8, this.reconnectAttempts), 15000);
    this.reconnectAttempts++;

    this.reconnectTimer = window.setTimeout(() => {
      this.connect();
    }, delay);
  }

  private resubscribeAll(): void {
    this.subscriptions.forEach(({ channel, params }) => {
      this.send({
        operation: "subscribe",
        channel,
        params,
      });
    });
  }

  private updateState(newState: ConnectionState): void {
    if (this.connectionState !== newState) {
      this.connectionState = newState;
      this.stateHandlers.forEach((handler) => handler(newState));
    }
  }

  private notifyMessage(data: any): void {
    this.messageHandlers.forEach((handler) => handler(data));
  }
}

export const dreamDexWs = new DreamDexWsManager();
