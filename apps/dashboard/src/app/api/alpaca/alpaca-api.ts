import axios from "axios";
import { AlpacaBarsResponse } from "./types";

export class AlpacaAPI {
  private BASE_URL = "https://data.alpaca.markets/v2";
  private TRADING_URL = "https://paper-api.alpaca.markets/v2"; 
  private apiKey: string;
  private secretKey: string;

  constructor() {
    this.apiKey = process.env.NEXT_PUBLIC_ALPACA_API_KEY || "";
    this.secretKey = process.env.NEXT_PUBLIC_ALPACA_SECRET_KEY || "";

    if (!this.apiKey || !this.secretKey) {
      console.error("Alpaca API keys not found in environment variables");
    }
  }

  private resolutionToTimeframe(resolution: string): string {
    const timeframeMap: { [key: string]: string } = {
      "1": "1Min",
      "3": "3Min",
      "5": "5Min",
      "15": "15Min",
      "30": "30Min",
      "60": "1Hour",
      "120": "2Hour",
      "240": "4Hour",
      "1D": "1Day",
      "1W": "1Week",
      "1M": "1Month",
    };
    return timeframeMap[resolution] || "1Min";
  }

  async getAllAssets() {
    try {
      const url = `${this.TRADING_URL}/assets`;
      const response = await axios.get(url, {
        params: {
          status: "active", 
          asset_class: "us_equity", 
        },
        headers: {
          "APCA-API-KEY-ID": this.apiKey,
          "APCA-API-SECRET-KEY": this.secretKey,
        },
      });

      return response.data;
    } catch (error) {
      console.error("Alpaca assets API error:", error);
      throw error;
    }
  }

  async getFilteredStocks(filter?: {
    tradable?: boolean;
    minMarketCap?: number;
    exchanges?: string[];
  }) {
    try {
      const allAssets = await this.getAllAssets();

      let filtered = allAssets.filter((asset: any) => {
        if (filter?.tradable && !asset.tradable) return false;

        if (filter?.exchanges && !filter.exchanges.includes(asset.exchange)) {
          return false;
        }

        if (asset.class !== "us_equity") return false;

        if (asset.symbol.includes("TEST")) return false;

        return true;
      });

      return filtered;
    } catch (error) {
      console.error("Alpaca filtered stocks error:", error);
      return [];
    }
  }

  async getBars(symbol: string, resolution: string, startTime: number, endTime: number) {
    try {
      const timeframe = this.resolutionToTimeframe(resolution);
      
      const start = new Date(startTime).toISOString();
      const end = new Date(endTime).toISOString();

      const url = `${this.BASE_URL}/stocks/${symbol}/bars`;
      const params = {
        timeframe,
        start,
        end,
        limit: 10000, 
        adjustment: "raw",
        feed: "iex", 
        sort: "asc", 
      };

      const response = await axios.get<AlpacaBarsResponse>(url, {
        params,
        headers: {
          "APCA-API-KEY-ID": this.apiKey,
          "APCA-API-SECRET-KEY": this.secretKey,
        },
      });

      const bars = response.data.bars?.map((bar) => ({
        time: new Date(bar.t).getTime(),
        open: bar.o.toString(),
        high: bar.h.toString(),
        low: bar.l.toString(),
        close: bar.c.toString(),
        volume: bar.v.toString(),
      })) || [];

      console.log(`[Alpaca] Fetched ${bars.length} bars for ${symbol} (${timeframe})`);

      return bars;
    } catch (error) {
      console.error("Alpaca API error:", error);
      throw error;
    }
  }

  async getLatestQuote(symbol: string) {
    try {
      const url = `${this.BASE_URL}/stocks/${symbol}/quotes/latest`;
      const response = await axios.get(url, {
        params: { feed: "iex" },
        headers: {
          "APCA-API-KEY-ID": this.apiKey,
          "APCA-API-SECRET-KEY": this.secretKey,
        },
      });

      return response.data;
    } catch (error) {
      console.error("Alpaca quote error:", error);
      return null;
    }
  }

  async getSnapshot(symbol: string) {
    try {
      const url = `${this.BASE_URL}/stocks/${symbol}/snapshot`;
      const response = await axios.get(url, {
        params: { feed: "iex" },
        headers: {
          "APCA-API-KEY-ID": this.apiKey,
          "APCA-API-SECRET-KEY": this.secretKey,
        },
      });

      return response.data;
    } catch (error) {
      console.error("Alpaca snapshot error:", error);
      return null;
    }
  }

  async getSnapshots(symbols: string[]) {
    try {
      const symbolsParam = symbols.join(",");
      const url = `${this.BASE_URL}/stocks/snapshots`;
      const response = await axios.get(url, {
        params: { 
          symbols: symbolsParam,
          feed: "iex" 
        },
        headers: {
          "APCA-API-KEY-ID": this.apiKey,
          "APCA-API-SECRET-KEY": this.secretKey,
        },
      });

      return response.data;
    } catch (error) {
      console.error("Alpaca snapshots error:", error);
      return null;
    }
  }
}