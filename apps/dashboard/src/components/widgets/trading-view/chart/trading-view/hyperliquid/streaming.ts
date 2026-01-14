import { getNextBarTime } from "@/lib/utils";
import { LibrarySymbolInfo, SubscribeBarsCallback } from "../datafeed";

const resolutionToIntervalMap: { [key: string]: string } = {
  "1": "1m",
  "3": "3m",
  "5": "5m",
  "15": "15m",
  "30": "30m",
  "60": "1h",
  "120": "2h",
  "240": "4h",
  "480": "8h",
  "720": "12h",
  "1D": "1d",
  "3D": "3d",
  "1W": "1w",
  "1M": "1M",
};

interface HyperliquidState {
  socket: WebSocket | null;
  reconnectInterval: NodeJS.Timeout | null;
  pingInterval: NodeJS.Timeout | null;
  isReconnecting: boolean;
  channelToSubscription: Map<string, any>;
  pendingSubscriptions: any[];
}

const globalForWs = globalThis as unknown as { hyperliquidState: HyperliquidState };

const state = globalForWs.hyperliquidState || {
  socket: null,
  reconnectInterval: null,
  pingInterval: null,
  isReconnecting: false,
  channelToSubscription: new Map(),
  pendingSubscriptions: [],
};

// Save to global object immediately to survive Hot Reloads
if (process.env.NODE_ENV !== "production") {
  globalForWs.hyperliquidState = state;
}

function createSocket() {
  if (state.socket) {
    if (state.socket.readyState === WebSocket.OPEN) {
      return state.socket;
    }
    if (state.socket.readyState === WebSocket.CONNECTING) {
      return state.socket;
    }
  }

  // const socketUrl = isTestnet ? "wss://api-ui.hyperliquid-testnet.xyz/ws" : "wss://api.hyperliquid.xyz/ws";
  const socketUrl = "wss://api.hyperliquid.xyz/ws";
  state.socket = new WebSocket(socketUrl);

  state.socket.addEventListener("open", () => {
    console.log("[socket] Connected");
    state.isReconnecting = false;

    // Process Pending Subscriptions
    while (state.pendingSubscriptions.length > 0) {
      const subRequest = state.pendingSubscriptions.shift();
      state.socket?.send(JSON.stringify(subRequest));
    }

    // Resubscribe to Candles
    for (const [channelString, subscriptionItem] of state.channelToSubscription.entries()) {
      subscriptionItem.handlers.forEach((handler: any) => {
        if (handler.resetCache) {
          handler.resetCache();
        }
      });

      const subRequest = {
        method: "subscribe",
        subscription: {
          type: "candle",
          coin: subscriptionItem.symbol,
          interval: subscriptionItem.interval,
        },
      };
      state.socket?.send(JSON.stringify(subRequest));
    }

    // Start Ping
    if (state.pingInterval) clearInterval(state.pingInterval);
    state.pingInterval = setInterval(() => {
      if (state.socket?.readyState === WebSocket.OPEN) {
        state.socket.send(JSON.stringify({ method: "ping" }));
      }
    }, 30000);
  });

  state.socket.addEventListener("close", (event) => {
    console.log("[socket] Disconnected", event.code, event.reason);
    state.socket = null; // Clear the instance
    if (state.pingInterval) clearInterval(state.pingInterval);

    attemptReconnect();
  });


  state.socket.addEventListener("message", handleMessage); // Ensure handleMessage is used
  return state.socket;
}
function attemptReconnect() {
  if (state.isReconnecting) return;

  state.isReconnecting = true;
  console.log("[socket] Attempting to reconnect...");

  state.reconnectInterval = setTimeout(() => {
    createSocket();
  }, 3000);
}

function handleMessage(event: MessageEvent) {
  const data = JSON.parse(event.data);

  if (data?.channel === "candle") {
    handleCandleData(data);
  }
}

function sendMessage(message: any) {
  if (state.socket?.readyState === WebSocket.OPEN) {
    state.socket.send(JSON.stringify(message));
  } else {
    // state.pendingSubscriptions.push(message);
  }
}

function handleCandleData(data: any) {
  const channelString = `0~${data?.data?.s}~${data?.data?.i}`;
  const subscriptionItem = state.channelToSubscription.get(channelString);

  if (subscriptionItem === undefined) {
    return;
  }

  const lastBar = subscriptionItem.lastBar;
  const nextBarTime = getNextBarTime(lastBar.time, subscriptionItem.resolution);

  let bar;

  if (Date.now() >= nextBarTime) {
    bar = {
      time: data.data.t,
      open: parseFloat(data.data.o),
      high: parseFloat(data.data.h),
      low: parseFloat(data.data.l),
      close: parseFloat(data.data.c),
      volume: parseFloat(data.data.v),
    };
  } else {
    bar = {
      ...lastBar,
      high: Math.max(lastBar.high, parseFloat(data.data.h)),
      low: Math.min(lastBar.low, parseFloat(data.data.l)),
      close: parseFloat(data.data.c),
      volume: (lastBar.volume || 0) + parseFloat(data.data.v),
    };
  }

  subscriptionItem.lastBar = bar;
  subscriptionItem.handlers.forEach((handler: any) => handler.callback(bar));
}



export function subscribeOnStream(
  symbolInfo: LibrarySymbolInfo,
  resolution: string,
  onRealtimeCallback: SubscribeBarsCallback,
  subscriberUID: string,
  onResetCacheNeededCallback: () => void,
  lastBar?: any,
) {
  const interval = resolutionToIntervalMap[resolution] || "1d";

  if (!symbolInfo || !symbolInfo.name) {
    console.error("[subscribeBars]: Invalid symbolInfo:", symbolInfo);
    return;
  }

  const channelString = `0~${symbolInfo.name}~${interval}`;
  const handler = {
    id: subscriberUID,
    callback: onRealtimeCallback,
    resetCache: onResetCacheNeededCallback,
  };

  let subscriptionItem = state.channelToSubscription.get(channelString);
  if (subscriptionItem) {
    subscriptionItem.resolution = resolution;
    subscriptionItem.lastBar = lastBar;
    subscriptionItem.handlers.push(handler);
    return;
  }

  subscriptionItem = {
    subscriberUID,
    interval,
    lastBar,
    handlers: [handler],
    symbol: symbolInfo.name,
  };

  state.channelToSubscription.set(channelString, subscriptionItem);

  const subRequest = {
    method: "subscribe",
    subscription: {
      type: "candle",
      coin: symbolInfo.name,
      interval: interval,
    },
  };

  createSocket();
  sendMessage(subRequest);
}

export function unsubscribeFromStream(subscriberUID: string) {
  for (const channelString of Array.from(state.channelToSubscription.keys())) {
    const subscriptionItem = state.channelToSubscription.get(channelString);
    const handlerIndex = subscriptionItem.handlers.findIndex((handler: any) => handler.id === subscriberUID);

    if (handlerIndex !== -1) {
      subscriptionItem.handlers.splice(handlerIndex, 1);

      if (subscriptionItem.handlers.length === 0) {
        const subRequest = {
          method: "unsubscribe",
          subscription: {
            type: "candle",
            coin: subscriptionItem?.symbol,
            interval: subscriptionItem?.interval,
          },
        };

        if (state.socket?.readyState === WebSocket.OPEN) {
          state.socket.send(JSON.stringify(subRequest));
        }

        state.channelToSubscription.delete(channelString);
        break;
      }
    }
  }
}


export function cleanup() {
  if (state.reconnectInterval) {
    clearTimeout(state.reconnectInterval);
  }
  if (state.pingInterval) {
    clearInterval(state.pingInterval);
  }
  if (state.socket) {
    state.socket.close(1000);
  }
}

if (typeof window !== "undefined") {
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") {
      const socket = state.socket;
      // If socket doesn't exist, is closed, or is closing -> Reconnect immediately
      if (!socket || socket.readyState === WebSocket.CLOSED || socket.readyState === WebSocket.CLOSING) {
        console.log("[socket] Tab visible, socket disconnected. Reconnecting...");
        state.isReconnecting = false; // Reset flag to allow immediate reconnect
        createSocket();
      }
    }
  });
}