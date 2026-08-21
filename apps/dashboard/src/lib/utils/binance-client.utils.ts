export type BinanceSource = "binance" | "proxy";

const binanceWsServerUrlWorld = "wss://stream.binance.com:9443";
const binanceWsServerUrlUS = "wss://stream.binance.us:9443";

const proxyWsServerUrl = process.env.NEXT_PUBLIC_FALLBACK_BINANCE_PROXY_URL || "ws://localhost:8081";

export function getBinanceWsServerUrl(source: BinanceSource, location: { country?: string }): string {
  if (source === "binance") {
    if (location?.country === "US") {
      return binanceWsServerUrlUS;
    } else {
      return binanceWsServerUrlWorld;
    }
  }

  return proxyWsServerUrl;
}

export function throwFailedToConnectBinanceWsError() {
  throw new Error("Failed to connect to both Binance and Proxy WebSocket servers111.");
}
