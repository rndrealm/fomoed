import dayjs from "dayjs";
import type {
  CignalsDatapointArray,
  CignalsDatapointFetchOptions,
  ParsedCignalsInstrumentArray,
  FootprintData,
  FootprintDataArray,
  PriceData,
  PriceDataArray,
  CignalsInstrument,
} from "./types";
import { capitalize } from "lodash-es";
import { smartRoundPriceStep } from "../helpers";

function normalizeError({
  name = "CignalsError",
  message = "Unknown error",
  status,
  url,
  cause,
}: {
  name?: string;
  message: string;
  status?: number;
  url?: string;
  cause?: any;
}) {
  return {
    name,
    message,
    status,
    url,
    cause,
  };
}


abstract class CignalsChartDataProviderBase {
  lastUsedFootprintPriceStep = 0;

  protected abstract fetchFootprints(options: CignalsDatapointFetchOptions): Promise<FootprintDataArray>;
  protected abstract fetchOHLC(options: CignalsDatapointFetchOptions): Promise<PriceDataArray>;
  abstract fetchDatapoints(options: CignalsDatapointFetchOptions): Promise<CignalsDatapointArray>;
  abstract fetchInstruments(): Promise<ParsedCignalsInstrumentArray>;

  static parsePriceData(data: any): PriceData {
    return {
      close: parseFloat(data.close),
      high: parseFloat(data.high),
      low: parseFloat(data.low),
      open: parseFloat(data.open),
      price_volume: parseFloat(data.price_volume),
      timestamp: data.timestamp,
      volume: parseFloat(data.volume),
      vwap: parseFloat(data.vwap),
    };
  }

  static parseFootprintData(data: any): FootprintData {
    return {
      price: parseFloat(data.price),
      side: data.side,
      size: parseFloat(data.size),
      timestamp: data.timestamp,
    };
  }
}

class CignalsChartDataProviderAPI extends CignalsChartDataProviderBase {
  #cignalsHost = "https://api.cignals.io";

  private async fetchThroughCignalsRelay(cignalsUrl: URL) {
    try {
      const encoded = btoa(cignalsUrl.toString());
      const relayUrl = new URL(window.location.origin + "/api/cignals/relay");
      relayUrl.searchParams.append("path", encoded);

      const response = await fetch(relayUrl);

      if (!response.ok) {
        throw normalizeError({
          message: `Relay failed: ${response.statusText}`,
          status: response.status,
          url: relayUrl.toString(),
        });
      }

      return response.json();
    } catch (err: any) {
      throw normalizeError({
        message: "Unable to fetch via Cignals relay",
        url: cignalsUrl.toString(),
        cause: err,
      });
    }
  }

  async fetchInstruments(): Promise<ParsedCignalsInstrumentArray> {
    const url = new URL(this.#cignalsHost + "/v1/instruments");
    try {
      const raw = (await this.fetchThroughCignalsRelay(url)) as CignalsInstrument[];

      return raw.map((i) => ({
        ...i,
        label: `${capitalize(i.exchange.replace("_", " "))} ${i.base_currency.toUpperCase()}/${i.quote_currency.toUpperCase()}${i.perpetual ? " PERP" : ""}`,
      }));
    } catch (err: any) {
      throw normalizeError({
        message: "Failed to fetch instruments",
        url: url.toString(),
        cause: err,
      });
    }
  }

  async fetchFootprints(options: CignalsDatapointFetchOptions & { price_step: number }): Promise<FootprintDataArray> {
    const url = new URL(window.location.origin + "/api/cignals/footprints");

    url.searchParams.append("instrument_id", options.instrument_id);
    url.searchParams.append("start_range", options.start_range.toString());
    url.searchParams.append("end_range", options.end_range.toString());
    url.searchParams.append("price_step", options.price_step.toString());
    url.searchParams.append("time_step", options.time_step);

    try {
      const response = await fetch(url.toString());

      if (!response.ok) {
        throw normalizeError({
          message: `Footprints API failed: ${response.statusText}`,
          status: response.status,
          url: url.toString(),
        });
      }

      const json = await response.json();
      const parsed = json.map(CignalsChartDataProviderAPI.parseFootprintData);

      this.lastUsedFootprintPriceStep = options.price_step;

      return parsed;
    } catch (err: any) {
      throw normalizeError({
        message: "Failed to fetch footprint data",
        url: url.toString(),
        cause: err,
      });
    }
  }

  async fetchOHLC(options: CignalsDatapointFetchOptions): Promise<PriceDataArray> {
    const url = new URL(this.#cignalsHost + "/v1/ohlc");

    url.searchParams.append("instrument_id", options.instrument_id);
    url.searchParams.append("start_range", options.start_range.toString());
    url.searchParams.append("end_range", options.end_range.toString());
    url.searchParams.append("time_step", options.time_step);

    try {
      const data = await this.fetchThroughCignalsRelay(url);

      if (!Array.isArray(data)) {
        throw normalizeError({
          message: "OHLC returned unexpected data format",
          url: url.toString(),
        });
      }

      return data.map(CignalsChartDataProviderAPI.parsePriceData);
    } catch (err: any) {
      throw normalizeError({
        message: "Failed to fetch OHLC data",
        url: url.toString(),
        cause: err,
      });
    }
  }


  async fetchDatapoints(options: CignalsDatapointFetchOptions): Promise<CignalsDatapointArray> {
    try {
      const candles = await this.fetchOHLC(options);

      if (!candles.length) {
        throw normalizeError({
          message: "No OHLC data returned",
        });
      }

      let priceStepToUse: number;

      if (options.price_step === "auto") {
        const avgRange =
          candles.reduce((acc, c) => acc + (c.high - c.low), 0) / candles.length;

        const preferred = 30;
        priceStepToUse = smartRoundPriceStep(avgRange / preferred);
      } else {
        priceStepToUse = options.price_step;
      }

      const footprints = await this.fetchFootprints({
        ...options,
        price_step: priceStepToUse,
      });

      return candles.map((c) => ({
        candle: c,
        footprints: footprints.filter((f) => f.timestamp == c.timestamp),
      }));
    } catch (err: any) {
      throw normalizeError({
        message: "Failed to fetch merged datapoints",
        cause: err,
      });
    }
  }
}

class CignalsChartDataProviderDummy extends CignalsChartDataProviderBase {
  static now = dayjs();

  fetchInstruments(): Promise<ParsedCignalsInstrumentArray> {
    throw new Error("Method not implemented.");
  }

  async fetchFootprints(): Promise<FootprintDataArray> {
    const res = await fetch("/dummies/footprint_data.json");
    return (await res.json()).map(CignalsChartDataProviderAPI.parseFootprintData);
  }

  async fetchOHLC(): Promise<PriceDataArray> {
    const res = await fetch("/dummies/candle_data.json");
    return (await res.json()).map(CignalsChartDataProviderAPI.parsePriceData);
  }

  fetchDatapoints(): Promise<CignalsDatapointArray> {
    throw new Error("Method not implemented.");
  }
}

export { CignalsChartDataProviderBase, CignalsChartDataProviderAPI, CignalsChartDataProviderDummy };
