import axios from "axios";
import { HyperLiquidKline } from "./types";

export class HyperliquidAPI {
  private BASE_URL = "https://api.hyperliquid.xyz/info";

  private resolutionToInterval(resolution: string): string {
    const intervalMap: { [key: string]: string } = {
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
    return intervalMap[resolution] || "1d";
  }

  async getExchangeInfo() {}

  async getKlines(symbol: string, interval: string, startTime?: number, endTime?: number) {
    const res = await axios.post(this.BASE_URL, {
      type: "candleSnapshot",
      req: {
        coin: symbol,
        interval: this.resolutionToInterval(interval),
        startTime: startTime,
        endTime: endTime,
      },
    });

    const data = res.data as HyperLiquidKline[];

    const klines = data.map((kline) => ({
      time: kline.t,
      open: kline.o,
      high: kline.h,
      low: kline.l,
      close: kline.c,
      volume: kline.v,
      closeTime: kline.T,
      numberOfTrades: kline.n,
    }));
    return klines;
  }
}
