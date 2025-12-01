import { getNextBarTime } from "@/lib/utils";
import { LibrarySymbolInfo, SubscribeBarsCallback } from "../datafeed";
import { WsClearingHouseStateResponse, WsOpenOrdersResponse, WsSpotStateResponse, WsTradeResponse } from "./types";

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
  orderBookSubscriptions: Map<string, Set<(data: any) => void>>;
  tradesSubscriptions: Map<string, Set<(data: any) => void>>;
  tickerSubscriptions: Map<string, Set<(data: any) => void>>;
  clearingHouseSubscriptions: Map<string, Set<(data: any) => void>>;
  openOrdersSubscriptions: Map<string, Set<(data: any) => void>>;
  spotStateSubscriptions: Map<string, Set<(data: any) => void>>;
  pendingSubscriptions: any[];
}

const globalForWs = globalThis as unknown as { hyperliquidState: HyperliquidState };

const state = globalForWs.hyperliquidState || {
  socket: null,
  reconnectInterval: null,
  pingInterval: null,
  isReconnecting: false,
  channelToSubscription: new Map(),
  orderBookSubscriptions: new Map(),
  tradesSubscriptions: new Map(),
  tickerSubscriptions: new Map(),
  openOrdersSubscriptions: new Map(),
  pendingSubscriptions: [],
  spotStateSubscriptions: new Map(),
  clearingHouseSubscriptions: new Map(),
};

// Save to global object immediately to survive Hot Reloads
if (process.env.NODE_ENV !== "production") {
  globalForWs.hyperliquidState = state;
}

function createSocket() {
  // 1. Return existing socket if Open or Connecting
  if (state.socket) {
    if (state.socket.readyState === WebSocket.OPEN) {
      return state.socket;
    }
    if (state.socket.readyState === WebSocket.CONNECTING) {
      // It's already trying to connect, don't create a new one
      return state.socket;
    }
  }

  // 2. Create new socket and assign to STATE
  state.socket = new WebSocket("wss://api.hyperliquid.xyz/ws");
  // state.socket = new WebSocket("wss://api-ui.hyperliquid-testnet.xyz/ws");

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

    // Resubscribe to Orderbooks/Trades...
    // (Add your existing resubscribe loops here using state.orderBookSubscriptions)

    // Start Ping
    state.pingInterval = setInterval(() => {
      if (state.socket?.readyState === WebSocket.OPEN) {
        state.socket.send(JSON.stringify({ method: "ping" }));
      }
    }, 30000);
  });

  // ... (Keep your existing Close/Error handlers, but update variable references)

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
  } else if (data?.channel === "l2Book") {
    handleOrderBookData(data);
  } else if (data?.channel === "trades") {
    handleTradesData(data);
  } else if (data?.channel === "activeAssetCtx" || data?.channel === "activeSpotAssetCtx") {
    handleTickerData(data);
  } else if (data?.channel === "clearinghouseState") {
    handleClearingHouseData(data);
  } else if (data?.channel === "openOrders") {
    handleOpenOrdersData(data);
  } else if (data?.channel === "spotState") {
    handleSpotStateData(data);
  }
}

function sendMessage(message: any) {
  if (state.socket?.readyState === WebSocket.OPEN) {
    state.socket.send(JSON.stringify(message));
  } else {
    state.pendingSubscriptions.push(message);
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

function handleOrderBookData(data: any) {
  const coin = data.data.coin;
  const callbacks = state.orderBookSubscriptions.get(coin);

  if (callbacks) {
    callbacks.forEach((callback) => callback(data.data));
  }
}

function handleTradesData(data: WsTradeResponse) {
  const coin = data?.data?.[0]?.coin;
  const callbacks = state.tradesSubscriptions.get(coin);

  if (callbacks) {
    callbacks.forEach((callback) => callback(data.data));
  }
}

function handleTickerData(data: any) {
  const coin = data?.data?.coin;
  const callbacks = state.tickerSubscriptions.get(coin);

  if (callbacks) {
    callbacks.forEach((callback) => callback(data?.data));
  }
}

function handleClearingHouseData(data: WsClearingHouseStateResponse) {
  const address = data?.data?.user;

  const callbacks = state.clearingHouseSubscriptions.get(address);

  if (callbacks) {
    callbacks.forEach((callback) => callback(data?.data));
  }
}

function handleOpenOrdersData(data: WsOpenOrdersResponse) {
  const address = data?.data?.user;

  const callbacks = state.openOrdersSubscriptions.get(address);

  if (callbacks) {
    callbacks.forEach((callback) => callback(data?.data));
  }
}

function handleSpotStateData(data: WsSpotStateResponse) {
  const address = data?.data?.user;

  const callbacks = state.spotStateSubscriptions.get(address);

  if (callbacks) {
    callbacks.forEach((callback) => callback(data?.data));
  }
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

export function subscribeToOrderBook(coin: string, callback: (data: any) => void) {
  if (!state.orderBookSubscriptions.has(coin)) {
    state.orderBookSubscriptions.set(coin, new Set());
  }

  const callbacks = state.orderBookSubscriptions.get(coin)!;
  callbacks.add(callback);

  if (callbacks.size === 1) {
    const subRequest = {
      method: "subscribe",
      subscription: {
        type: "l2Book",
        coin: coin,
      },
    };

    createSocket();

    sendMessage(subRequest);
  }
}

export function unsubscribeFromOrderBook(coin: string, callback: (data: any) => void) {
  const callbacks = state.orderBookSubscriptions.get(coin);

  if (callbacks) {
    callbacks.delete(callback);

    if (callbacks.size === 0) {
      state.orderBookSubscriptions.delete(coin);

      const subRequest = {
        method: "unsubscribe",
        subscription: {
          type: "l2Book",
          coin: coin,
        },
      };

      if (state.socket?.readyState === WebSocket.OPEN) {
        state.socket.send(JSON.stringify(subRequest));
      }
    }
  }
}

// window.addEventListener("online", () => {
//   if (!socket || socket.readyState !== WebSocket.OPEN) {
//     createSocket();
//   }
// });

export function subscribeToTrades(coin: string, callback: (data: any) => void) {
  if (!state.tradesSubscriptions.has(coin)) {
    state.tradesSubscriptions.set(coin, new Set());
  }

  const callbacks = state.tradesSubscriptions.get(coin)!;
  callbacks.add(callback);

  if (callbacks.size === 1) {
    const subRequest = {
      method: "subscribe",
      subscription: {
        type: "trades",
        coin: coin,
      },
    };

    createSocket();

    sendMessage(subRequest);
  }
}

export function unsubscribeFromTrades(coin: string, callback: (data: any) => void) {
  const callbacks = state.tradesSubscriptions.get(coin);

  if (callbacks) {
    callbacks.delete(callback);

    if (callbacks.size === 0) {
      state.tradesSubscriptions.delete(coin);

      const subRequest = {
        method: "unsubscribe",
        subscription: {
          type: "trades",
          coin: coin,
        },
      };

      if (state.socket?.readyState === WebSocket.OPEN) {
        state.socket.send(JSON.stringify(subRequest));
      }
    }
  }
}

export function subscribeToTicker(coin: string, callback: (data: any) => void) {
  if (!state.tickerSubscriptions.has(coin)) {
    state.tickerSubscriptions.set(coin, new Set());
  }

  const callbacks = state.tickerSubscriptions.get(coin)!;
  callbacks.add(callback);

  if (callbacks.size === 1) {
    const subRequest = {
      method: "subscribe",
      subscription: {
        type: "activeAssetCtx",
        coin: coin,
      },
    };

    createSocket();

    sendMessage(subRequest);
  }
}

export function unsubscribeFromTicker(coin: string, callback: (data: any) => void) {
  const callbacks = state.tickerSubscriptions.get(coin);

  if (callbacks) {
    callbacks.delete(callback);

    if (callbacks.size === 0) {
      state.tickerSubscriptions.delete(coin);

      const subRequest = {
        method: "unsubscribe",
        subscription: {
          type: "activeAssetCtx",
          coin: coin,
        },
      };

      if (state.socket?.readyState === WebSocket.OPEN) {
        state.socket.send(JSON.stringify(subRequest));
      }
    }
  }
}

export function subscribeToClearingHouse(_address: string, callback: (data: any) => void) {
  const address = _address.toLowerCase();
  if (!state.clearingHouseSubscriptions.has(address)) {
    state.clearingHouseSubscriptions.set(address, new Set());
  }

  const callbacks = state.clearingHouseSubscriptions.get(address)!;
  callbacks.add(callback);

  if (callbacks.size === 1) {
    const subRequest = {
      method: "subscribe",
      subscription: {
        type: "clearinghouseState",
        user: address,
      },
    };

    createSocket();

    sendMessage(subRequest);
  }
}

export function unsubscribeFromClearingHouse(_address: string, callback: (data: any) => void) {
  const address = _address.toLowerCase();
  const callbacks = state.clearingHouseSubscriptions.get(address);

  if (callbacks) {
    callbacks.delete(callback);

    if (callbacks.size === 0) {
      state.clearingHouseSubscriptions.delete(address);

      const subRequest = {
        method: "unsubscribe",
        subscription: {
          type: "clearinghouseState",
          user: address,
        },
      };

      if (state.socket?.readyState === WebSocket.OPEN) {
        state.socket.send(JSON.stringify(subRequest));
      }
    }
  }
}

export function subscribeToOpenOrders(_address: string, callback: (data: any) => void) {
  const address = _address.toLowerCase();
  if (!state.openOrdersSubscriptions.has(address)) {
    state.openOrdersSubscriptions.set(address, new Set());
  }

  const callbacks = state.openOrdersSubscriptions.get(address)!;
  callbacks.add(callback);

  if (callbacks.size === 1) {
    const subRequest = {
      method: "subscribe",
      subscription: {
        type: "openOrders",
        user: address,
      },
    };

    createSocket();

    sendMessage(subRequest);
  }
}

export function unsubscribeFromOpenOrders(_address: string, callback: (data: any) => void) {
  const address = _address.toLowerCase();
  const callbacks = state.openOrdersSubscriptions.get(address);

  if (callbacks) {
    callbacks.delete(callback);

    if (callbacks.size === 0) {
      state.openOrdersSubscriptions.delete(address);

      const subRequest = {
        method: "unsubscribe",
        subscription: {
          type: "openOrders",
          user: address,
        },
      };

      if (state.socket?.readyState === WebSocket.OPEN) {
        state.socket.send(JSON.stringify(subRequest));
      }
    }
  }
}

export function subscribeToSpotState(_address: string, callback: (data: any) => void) {
  const address = _address.toLowerCase();
  if (!state.spotStateSubscriptions.has(address)) {
    state.spotStateSubscriptions.set(address, new Set());
  }

  const callbacks = state.spotStateSubscriptions.get(address)!;
  callbacks.add(callback);

  if (callbacks.size === 1) {
    const subRequest = {
      method: "subscribe",
      subscription: {
        type: "spotState",
        user: address,
      },
    };

    createSocket();

    sendMessage(subRequest);
  }
}

export function unsubscribeFromSpotState(_address: string, callback: (data: any) => void) {
  const address = _address.toLowerCase();
  const callbacks = state.spotStateSubscriptions.get(address);

  if (callbacks) {
    callbacks.delete(callback);

    if (callbacks.size === 0) {
      state.spotStateSubscriptions.delete(address);

      const subRequest = {
        method: "unsubscribe",
        subscription: {
          type: "spotState",
          user: address,
        },
      };

      if (state.socket?.readyState === WebSocket.OPEN) {
        state.socket.send(JSON.stringify(subRequest));
      }
    }
  }
}

// document.addEventListener("visibilitychange", () => {
//   if (document.visibilityState === "visible") {
//     if (!state.socket || state.socket.readyState !== WebSocket.OPEN) {
//       console.log("[socket] Page visible, reconnecting...");
//       createSocket();
//     }
//   }
// });

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
