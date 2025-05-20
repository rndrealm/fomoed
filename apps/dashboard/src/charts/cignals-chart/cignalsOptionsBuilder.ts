import type { CignalsDatapointFetchOptions, CignalsTimestep } from "./types";
import dayjs from "dayjs";
import dayjsUtc from "dayjs/plugin/utc";
import { timeIntervalStringToMs } from "../helpers";

dayjs.extend(dayjsUtc);

export interface CignalsOptions {
  end_range: number | undefined;
  n_candles: number | undefined;
  price_step: number | "auto";
  time_step: string | undefined;
  instrument_id: number | undefined;
}

export class CignalsOptionsBuilder {
  #options: CignalsOptions;

  constructor() {
    this.#options = {
      end_range: undefined,
      n_candles: undefined,
      price_step: "auto",
      time_step: undefined,
      instrument_id: undefined,
    };
  }

  get #timestep() {
    if (this.#options.time_step === undefined) {
      throw new Error("Missing time_step");
    }

    return this.#options.time_step;
  }

  get #nCandles() {
    if (this.#options.n_candles === undefined) {
      throw new Error("Missing n_candles");
    }

    return this.#options.n_candles;
  }

  get instrumentId() {
    if (this.#options.instrument_id === undefined) {
      throw new Error("Missing instrument_id");
    }

    return this.#options.instrument_id;
  }

  get startRange() {
    console.log("timestemp", this.#timestep);

    const endRange = this.endRange;
    const timeStepMs = timeIntervalStringToMs(this.#timestep);
    const startRange = endRange - timeStepMs * this.#nCandles;
    const startRangeRounded = Math.floor(startRange / 60000) * 60000;

    return startRangeRounded;
  }

  get endRange() {
    // Need to align based on specified timestamp
    // The alignment is done relative to GMT
    // For example 4h timestep needs to be aligned to 12:00, 16:00, 20:00, 00:00, etc.
    // End range needs to be aligned to next such value
    // Possible timestep values are 1m, 5m, 15m, 30m, 60m, 1h, 4h, 8h, 12h, 1D, 3D, 1W, 1M

    if (this.#options.end_range === undefined) {
      throw new Error("Missing end_range");
    }

    const endTimestamp = this.#options.end_range;

    // return Math.floor(endTimestamp / 60000) * 60000;

    // Parse the timestep (e.g., "4h" -> { unit: 'hours', value: 4 })
    const timestepRegex = /^(\d+)([mhdwM])$/;
    const match = this.#timestep.match(timestepRegex);
    if (!match) {
      throw new Error("Invalid timestep format");
    }

    const [, stepValue, unit] = match;
    const value = parseInt(stepValue, 10);

    // Determine the alignment unit and value
    const alignUnitMap: { [key: string]: dayjs.UnitType } = {
      m: "minute",
      h: "hour",
      d: "day",
      // w: 'week', // TODO implement
      M: "month",
    };

    const alignUnit = alignUnitMap[unit];
    if (!alignUnit) {
      throw new Error("Unsupported timestep unit");
    }

    // Align the timestamp to GMT
    const endTimeGMT = dayjs.utc(endTimestamp); // Ensure the timestamp is in UTC
    const alignedTimeGMT = endTimeGMT
      .startOf(alignUnit) // Start of the current alignment unit
      .add(value - (endTimeGMT.get(alignUnit) % value), alignUnit as any); // Move to the next alignment point

    return alignedTimeGMT.valueOf();
  }

  setInstrumentId(id: number): CignalsOptionsBuilder {
    this.#options.instrument_id = id;

    return this;
  }

  setRange(end: number, timeStep: string): CignalsOptionsBuilder {
    this.#options.end_range = end;
    this.#options.time_step = timeStep;

    return this;
  }

  setPriceStep(step: number | "auto"): CignalsOptionsBuilder {
    if (step !== "auto" && step <= 0) {
      throw new Error(
        "price_step can't be less than or equal to 0. Got: " + step
      );
    }

    this.#options.price_step = step;

    return this;
  }

  setNCandles(n: number): CignalsOptionsBuilder {
    if (n <= 0) {
      throw new Error("n_candles can't be less than or equal to 0. Got: " + n);
    }

    if (Math.floor(n) !== n) {
      throw new Error("n_candles can't be a floating point number. Got: " + n);
    }

    this.#options.n_candles = n;

    return this;
  }

  buildDatapointFetchOptions(): CignalsDatapointFetchOptions {
    const options: CignalsDatapointFetchOptions = {
      instrument_id: this.instrumentId.toString(),
      start_range: this.startRange,
      end_range: this.endRange,
      price_step: this.#options.price_step,
      time_step: this.#timestep as CignalsTimestep,
    };

    console.log({ options });

    return options;
  }
}
