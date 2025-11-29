import { HyperliquidAPI } from "./hyperliquid/api";
import { subscribeOnStream, unsubscribeFromStream } from "./hyperliquid/streaming";
import { HyperLiquidSymbol } from "./hyperliquid/types";

// Use a Map to store the last bar for each symbol subscription.
// This is essential for the streaming logic to update the chart correctly.
const lastBarsCache = new Map();

function getPriceScaleAndMinmov(price: number) {
  let tickSize = 0.000001; // default
  let pricescale = 1000000;
  const minmov = 1;

  if (price < 0.0001) tickSize = 0.00000001;
  else if (price < 0.001) tickSize = 0.00000001;
  else if (price < 0.01) tickSize = 0.0000001;
  else if (price < 0.1) tickSize = 0.000001;
  else if (price < 1) tickSize = 0.00001;
  else if (price < 100) tickSize = 0.001;
  else if (price < 10000) tickSize = 0.01;
  else tickSize = 0.1;

  pricescale = Math.round(1 / tickSize);

  return { pricescale, minmov };
}

interface DatafeedConfiguration {
  supports_marks: boolean;
  supports_timescale_marks: boolean;
  supports_time: boolean;
  supported_resolutions: string[];
}

export interface LibrarySymbolInfo {
  ticker: string;
  name: string;
  description: string;
  type: string;
  session: string;
  timezone: string;
  exchange: string;
  minmov: number;
  pricescale: number;
  has_intraday: boolean;
  has_no_volume: boolean;
  has_weekly_and_monthly: boolean;
  supported_resolutions: string[];
  volume_precision: number;
  data_status: string;
  variable_tick_size?: string;
}

interface Bar {
  time: number;
  low: string | number;
  high: string | number;
  open: string | number;
  close: string | number;
  volume: string | number;
}

interface HistoryMetadata {
  noData: boolean;
}

type HistoryCallback = (bars: Bar[], meta: HistoryMetadata) => void;
type ErrorCallback = (error: string) => void;
export type SubscribeBarsCallback = (bar: Bar) => void;

interface PeriodParams {
  from: number;
  to: number;
  firstDataRequest: boolean;
}

export class Datafeed {
  private api: HyperliquidAPI;

  constructor() {
    this.api = new HyperliquidAPI();
  }

  onReady(callback: (configuration: DatafeedConfiguration) => void): void {
    setTimeout(() => {
      callback({
        supports_marks: false,
        supports_timescale_marks: false,
        supports_time: true,
        supported_resolutions: ["1", "3", "5", "15", "30", "60", "120", "240", "480", "720", "1D", "3D", "1W", "1M"],
      });
    });
  }

  async searchSymbols() {
    console.log("[searchSymbols] called");
  }

  async resolveSymbol(
    symbolName: string,
    onSymbolResolvedCallback: (symbolInfo: LibrarySymbolInfo) => void,
    onResolveErrorCallback: ErrorCallback,
  ): Promise<void> {
    try {
      const symbol: HyperLiquidSymbol = JSON.parse(symbolName);
      const description = symbol?.isSpot
        ? `${symbol.baseTokenName}/${symbol.quoteTokenName}`
        : `${symbol.baseTokenName}${symbol.quoteTokenName}`;

      const { pricescale, minmov } = getPriceScaleAndMinmov(parseFloat(symbol.price));

      const symbolInfo: LibrarySymbolInfo = {
        ticker: symbol.name,
        name: symbol.name,
        description,
        type: "crypto",
        session: "24x7",
        timezone: "Etc/UTC",
        exchange: "Hyperliquid",
        minmov,
        pricescale, // 8 decimal places for crypto
        variable_tick_size: "0.000001 1 0.00001 10 0.0001 100 0.001 1000 0.01 10000",
        has_intraday: true,
        has_no_volume: false,
        has_weekly_and_monthly: true,
        supported_resolutions: ["1", "3", "5", "15", "30", "60", "120", "240", "480", "720", "1D", "3D", "1W", "1M"],
        volume_precision: 8,
        data_status: "streaming",
      };

      setTimeout(() => onSymbolResolvedCallback(symbolInfo));
    } catch (error) {
      onResolveErrorCallback("Symbol not found");
    }
  }

  async getBars(
    symbolInfo: LibrarySymbolInfo,
    resolution: string,
    periodParams: PeriodParams,
    onHistoryCallback: HistoryCallback,
    onErrorCallback: ErrorCallback,
  ): Promise<void> {
    try {
      const { from, to, firstDataRequest } = periodParams;

      const data = await this.api.getKlines(symbolInfo.ticker, resolution, from * 1000, to * 1000);

      const bars: Bar[] = data.map((item) => ({
        time: item.time,
        low: parseFloat(item.low),
        high: parseFloat(item.high),
        open: parseFloat(item.open),
        close: parseFloat(item.close),
        volume: parseFloat(item.volume),
      }));

      const meta: HistoryMetadata = {
        noData: bars.length === 0,
      };

      if (firstDataRequest) {
        lastBarsCache.set(symbolInfo.name, { ...bars[bars.length - 1] });
      }

      onHistoryCallback(bars, meta);
    } catch (error) {
      onErrorCallback(error instanceof Error ? error.message : "Unknown error");
    }
  }

  subscribeBars(
    symbolInfo: LibrarySymbolInfo,
    resolution: string,
    onRealtimeCallback: SubscribeBarsCallback,
    subscriberUID: string,
    onResetCacheNeededCallback: () => void,
  ) {
    subscribeOnStream(
      symbolInfo,
      resolution,
      onRealtimeCallback,
      subscriberUID,
      onResetCacheNeededCallback,
      lastBarsCache.get(symbolInfo.name),
    );
  }
  unsubscribeBars(subscriberUID: string) {
    unsubscribeFromStream(subscriberUID);
  }
}
