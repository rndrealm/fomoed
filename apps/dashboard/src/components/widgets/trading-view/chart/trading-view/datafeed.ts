import { HyperliquidAPI } from "./hyperliquid/api";
import { AlpacaAPI } from "@/app/api/alpaca/alpaca-api";
import { 
  subscribeOnStream as subscribeHyperliquid, 
  unsubscribeFromStream as unsubscribeHyperliquid 
} from "./hyperliquid/streaming";
import { 
  subscribeOnStream as subscribeAlpaca, 
  unsubscribeFromStream as unsubscribeAlpaca 
} from "@/app/api/alpaca/alpaca-streaming";
import { HyperLiquidSymbol } from "./hyperliquid/types";
import { StockSymbol } from "@/lib/atoms/tradingViewWidget";

const lastBarsCache = new Map();

function getPriceScaleAndMinmov(price: number) {
  let tickSize = 0.000001;
  let pricescale = 1000000;
  const minmov = 1;

  if (price < 0.0001) tickSize = 0.00000001;
  else if (price < 0.001) tickSize = 0.00000001;
  else if (price < 0.01) tickSize = 0.0001;
  else if (price < 0.1) tickSize = 0.000001;
  else if (price < 1) tickSize = 0.00001;
  else if (price < 100) tickSize = 0.01;
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
  asset_type?: "crypto" | "stock";
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
  private hyperliquidAPI: HyperliquidAPI;
  private alpacaAPI: AlpacaAPI;

  constructor() {
    this.hyperliquidAPI = new HyperliquidAPI();
    this.alpacaAPI = new AlpacaAPI();
  }

  onReady(callback: (configuration: DatafeedConfiguration) => void): void {
    setTimeout(() => {
      callback({
        supports_marks: false,
        supports_timescale_marks: false,
        supports_time: true,
        supported_resolutions: ["1", "3", "5", "15", "30", "60", "120", "240", "480", "720", "1D", "1W", "1M"],
      });
    });
  }

  async searchSymbols() {
    console.log("[searchSymbols] called");
  }

  async resolveSymbol(
    symbolName: string,
    onSymbolResolvedCallback: (symbolInfo: LibrarySymbolInfo) => void,
    onResolveErrorCallback: ErrorCallback
  ): Promise<void> {
    try {
      const symbolData = JSON.parse(symbolName);
      
      // Check if it's a stock
      if (symbolData.type === "stock") {
        const stock = symbolData as StockSymbol;
        const { pricescale, minmov } = getPriceScaleAndMinmov(parseFloat(stock.price || "100"));

        const symbolInfo: LibrarySymbolInfo = {
          ticker: symbolName,
          name: stock.symbol,
          description: stock.name,
          type: "stock",
          session: "0930-1600", // NYSE hours
          timezone: "America/New_York",
          exchange: stock.exchange,
          minmov,
          pricescale,
          has_intraday: true,
          has_no_volume: false,
          has_weekly_and_monthly: true,
          supported_resolutions: ["1", "3", "5", "15", "30", "60", "120", "240", "480", "720", "1D", "1W", "1M"],
          volume_precision: 0,
          data_status: "streaming",
          asset_type: "stock",
        };

        setTimeout(() => onSymbolResolvedCallback(symbolInfo));
        return;
      }

      // Otherwise, it's crypto (existing logic)
      const symbol: HyperLiquidSymbol = symbolData;
      const description = symbol?.isSpot
        ? `${symbol.baseTokenName}/${symbol.quoteTokenName}`
        : `${symbol.baseTokenName}${symbol.quoteTokenName}`;

      const { price, ...rest } = symbol;
      const newSymbolName = JSON.stringify(rest);

      const { pricescale, minmov } = getPriceScaleAndMinmov(parseFloat(symbol.price));

      const symbolInfo: LibrarySymbolInfo = {
        ticker: newSymbolName,
        name: symbol.name,
        description,
        type: "crypto",
        session: "24x7",
        timezone: "Etc/UTC",
        exchange: "Hyperliquid",
        minmov,
        pricescale,
        variable_tick_size: "0.000001 1 0.00001 10 0.0001 100 0.001 1000 0.01 10000",
        has_intraday: true,
        has_no_volume: false,
        has_weekly_and_monthly: true,
        supported_resolutions: ["1", "3", "5", "15", "30", "60", "120", "240", "480", "720", "1D", "1W", "1M"],
        volume_precision: 8,
        data_status: "streaming",
        asset_type: "crypto",
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
    onErrorCallback: ErrorCallback
  ): Promise<void> {
    try {
      const { from, to, firstDataRequest } = periodParams;

      let bars: Bar[] = [];

      // Fetch from appropriate API based on asset type
      if (symbolInfo.asset_type === "stock") {
        const data = await this.alpacaAPI.getBars(
          symbolInfo.name,
          resolution,
          from * 1000,
          to * 1000
        );
        bars = data.map((item) => ({
          time: item.time,
          low: parseFloat(item.low as string),
          high: parseFloat(item.high as string),
          open: parseFloat(item.open as string),
          close: parseFloat(item.close as string),
          volume: parseFloat(item.volume as string),
        }));
      } else {
        // Crypto - existing logic
        const data = await this.hyperliquidAPI.getKlines(
          symbolInfo.name,
          resolution,
          from * 1000,
          to * 1000
        );
        bars = data.map((item) => ({
          time: item.time,
          low: parseFloat(item.low),
          high: parseFloat(item.high),
          open: parseFloat(item.open),
          close: parseFloat(item.close),
          volume: parseFloat(item.volume),
        }));
      }

      const meta: HistoryMetadata = {
        noData: bars.length === 0,
      };

      if (firstDataRequest && bars.length > 0) {
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
    onResetCacheNeededCallback: () => void
  ) {
    // Subscribe to appropriate stream based on asset type
    if (symbolInfo.asset_type === "stock") {
      subscribeAlpaca(
        symbolInfo,
        resolution,
        onRealtimeCallback,
        subscriberUID,
        onResetCacheNeededCallback,
        lastBarsCache.get(symbolInfo.name)
      );
    } else {
      subscribeHyperliquid(
        symbolInfo,
        resolution,
        onRealtimeCallback,
        subscriberUID,
        onResetCacheNeededCallback,
        lastBarsCache.get(symbolInfo.name)
      );
    }
  }

  unsubscribeBars(subscriberUID: string) {
    // Unsubscribe from both (they handle internally if not subscribed)
    unsubscribeHyperliquid(subscriberUID);
    unsubscribeAlpaca(subscriberUID);
  }
}