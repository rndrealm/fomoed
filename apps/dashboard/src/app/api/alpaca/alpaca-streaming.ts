import { LibrarySymbolInfo, SubscribeBarsCallback } from "@/components/widgets/trading-view/chart/trading-view/datafeed";
import { AlpacaWebSocketMessage, AlpacaWebSocketBar } from "./types";

interface AlpacaState {
  socket: WebSocket | null;
  reconnectInterval: NodeJS.Timeout | null;
  isReconnecting: boolean;
  isAuthenticated: boolean;
  channelToSubscription: Map<string, any>;
  pendingSubscriptions: string[];
}

const globalForWs = globalThis as unknown as { alpacaState: AlpacaState };

const state = globalForWs.alpacaState || {
  socket: null,
  reconnectInterval: null,
  isReconnecting: false,
  isAuthenticated: false,
  channelToSubscription: new Map(),
  pendingSubscriptions: [],
};

if (process.env.NODE_ENV !== "production") {
  globalForWs.alpacaState = state;
}

const ALPACA_WS_URL = "wss://stream.data.alpaca.markets/v2/iex";
const API_KEY = process.env.NEXT_PUBLIC_ALPACA_API_KEY || "";
const SECRET_KEY = process.env.NEXT_PUBLIC_ALPACA_SECRET_KEY || "";

function createSocket() {
  if (state.socket) {
    if (state.socket.readyState === WebSocket.OPEN) {
      return state.socket;
    }
    if (state.socket.readyState === WebSocket.CONNECTING) {
      return state.socket;
    }
  }

  state.socket = new WebSocket(ALPACA_WS_URL);

  state.socket.addEventListener("open", () => {
    console.log("[Alpaca socket] Connected");
    state.isReconnecting = false;

    // Authenticate
    const authMsg = {
      action: "auth",
      key: API_KEY,
      secret: SECRET_KEY,
    };
    state.socket?.send(JSON.stringify(authMsg));
  });

  state.socket.addEventListener("close", (event) => {
    console.log("[Alpaca socket] Disconnected", event.code, event.reason);
    state.socket = null;
    state.isAuthenticated = false;
    attemptReconnect();
  });

  state.socket.addEventListener("message", handleMessage);
  state.socket.addEventListener("error", (error) => {
    console.error("[Alpaca socket] Error:", error);
  });

  return state.socket;
}

function attemptReconnect() {
  if (state.isReconnecting) return;

  state.isReconnecting = true;
  console.log("[Alpaca socket] Attempting to reconnect...");

  state.reconnectInterval = setTimeout(() => {
    createSocket();
  }, 3000);
}

function handleMessage(event: MessageEvent) {
  try {
    const messages: AlpacaWebSocketMessage[] = JSON.parse(event.data);

    messages.forEach((msg) => {
      if (msg.T === "success") {
        if (msg.msg === "authenticated") {
          console.log("[Alpaca socket] Authenticated");
          state.isAuthenticated = true;

          // Subscribe to pending symbols
          if (state.pendingSubscriptions.length > 0) {
            const subscribeMsg = {
              action: "subscribe",
              bars: state.pendingSubscriptions,
            };
            state.socket?.send(JSON.stringify(subscribeMsg));
            state.pendingSubscriptions = [];
          }

          // Resubscribe to existing channels
          const symbols = Array.from(state.channelToSubscription.keys());
          if (symbols.length > 0) {
            const subscribeMsg = {
              action: "subscribe",
              bars: symbols,
            };
            state.socket?.send(JSON.stringify(subscribeMsg));
          }
        }
      } else if (msg.T === "error") {
        console.error("[Alpaca socket] Error:", msg.msg);
      } else if (msg.T === "b") {
        handleBarMessage(msg as AlpacaWebSocketBar);
      }
    });
  } catch (error) {
    console.error("[Alpaca socket] Message parse error:", error);
  }
}

function handleBarMessage(bar: AlpacaWebSocketBar) {
  const subscriptionItem = state.channelToSubscription.get(bar.S);

  if (!subscriptionItem) {
    return;
  }

  const newBar = {
    time: new Date(bar.t).getTime(),
    open: bar.o,
    high: bar.h,
    low: bar.l,
    close: bar.c,
    volume: bar.v,
  };

  subscriptionItem.lastBar = newBar;
  subscriptionItem.handlers.forEach((handler: any) => handler.callback(newBar));
}

export function subscribeOnStream(
  symbolInfo: LibrarySymbolInfo,
  resolution: string,
  onRealtimeCallback: SubscribeBarsCallback,
  subscriberUID: string,
  onResetCacheNeededCallback: () => void,
  lastBar?: any
) {
  const symbol = symbolInfo.name;

  const handler = {
    id: subscriberUID,
    callback: onRealtimeCallback,
    resetCache: onResetCacheNeededCallback,
  };

  let subscriptionItem = state.channelToSubscription.get(symbol);

  if (subscriptionItem) {
    subscriptionItem.resolution = resolution;
    subscriptionItem.lastBar = lastBar;
    subscriptionItem.handlers.push(handler);
    return;
  }

  subscriptionItem = {
    subscriberUID,
    resolution,
    lastBar,
    handlers: [handler],
    symbol,
  };

  state.channelToSubscription.set(symbol, subscriptionItem);

  // Create socket if not exists
  createSocket();

  // Subscribe to bars
  if (state.isAuthenticated) {
    const subscribeMsg = {
      action: "subscribe",
      bars: [symbol],
    };
    state.socket?.send(JSON.stringify(subscribeMsg));
  } else {
    // Queue subscription until authenticated
    if (!state.pendingSubscriptions.includes(symbol)) {
      state.pendingSubscriptions.push(symbol);
    }
  }
}

export function unsubscribeFromStream(subscriberUID: string) {
  for (const [symbol, subscriptionItem] of state.channelToSubscription.entries()) {
    const handlerIndex = subscriptionItem.handlers.findIndex(
      (handler: any) => handler.id === subscriberUID
    );

    if (handlerIndex !== -1) {
      subscriptionItem.handlers.splice(handlerIndex, 1);

      if (subscriptionItem.handlers.length === 0) {
        const unsubscribeMsg = {
          action: "unsubscribe",
          bars: [symbol],
        };

        if (state.socket?.readyState === WebSocket.OPEN) {
          state.socket.send(JSON.stringify(unsubscribeMsg));
        }

        state.channelToSubscription.delete(symbol);
        break;
      }
    }
  }
}

export function cleanup() {
  if (state.reconnectInterval) {
    clearTimeout(state.reconnectInterval);
  }
  if (state.socket) {
    state.socket.close(1000);
  }
}

if (typeof window !== "undefined") {
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") {
      const socket = state.socket;
      if (
        !socket ||
        socket.readyState === WebSocket.CLOSED ||
        socket.readyState === WebSocket.CLOSING
      ) {
        console.log("[Alpaca socket] Tab visible, socket disconnected. Reconnecting...");
        state.isReconnecting = false;
        createSocket();
      }
    }
  });
}