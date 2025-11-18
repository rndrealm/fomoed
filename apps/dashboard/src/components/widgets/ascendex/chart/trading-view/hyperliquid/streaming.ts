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

const socket = new WebSocket("wss://api.hyperliquid.xyz/ws");

const channelToSubscription = new Map();

const pendingSubscriptions: any[] = [];

socket.addEventListener("open", () => {
  console.log("[socket] Connected");

  while (pendingSubscriptions.length > 0) {
    const subRequest = pendingSubscriptions.shift();
    socket.send(JSON.stringify(subRequest));
  }
});

socket.addEventListener("close", (reason) => {
  console.log("[socket] Disconnected:", reason);
});

socket.addEventListener("error", (error) => {
  console.log("[socket] Error:", error);
});

export function subscribeOnStream(
  symbolInfo: LibrarySymbolInfo,
  resolution: string,
  onRealtimeCallback: SubscribeBarsCallback,
  subscriberUID: string,
  onResetCacheNeededCallback: () => void,
  lastBar?: any,
) {
  console.log("Subscribing to stream:", symbolInfo, resolution, subscriberUID);

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

  let subscriptionItem = channelToSubscription.get(channelString);
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

  channelToSubscription.set(channelString, subscriptionItem);

  const subRequest = {
    method: "subscribe",
    subscription: {
      type: "candle",
      coin: symbolInfo.name,
      interval: interval,
    },
  };

  if (socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify(subRequest));
  } else {
    pendingSubscriptions.push(subRequest);
  }
}

export function unsubscribeFromStream(subscriberUID: string) {
  for (const channelString of Array.from(channelToSubscription.keys())) {
    const subscriptionItem = channelToSubscription.get(channelString);
    const handlerIndex = subscriptionItem.handlers.findIndex((handler: any) => handler.id === subscriberUID);

    if (handlerIndex !== -1) {
      subscriptionItem.handlers.splice(handlerIndex, 1);

      if (subscriptionItem.handlers.length === 0) {
        // console.log(
        //   "[unsubscribeBars]: Unsubscribe from streaming. Channel:",
        //   channelString,
        //   subscriptionItem
        // );
        const subRequest = {
          method: "unsubscribe",
          subscription: {
            type: "candle",
            coin: subscriptionItem?.symbol,
            interval: subscriptionItem?.interval,
          },
        };

        socket.send(JSON.stringify(subRequest));
        channelToSubscription.delete(channelString);
        break;
      }
    }
  }
}

socket.addEventListener("message", (event) => {
  const data = JSON.parse(event.data);

  if (data?.channel !== "candle") {
    return;
  }
  const channelString = `0~${data?.data?.s}~${data?.data?.i}`;

  const subscriptionItem = channelToSubscription.get(channelString);

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
});
