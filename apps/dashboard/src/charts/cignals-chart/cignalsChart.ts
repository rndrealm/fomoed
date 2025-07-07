import { indexOf, max, meanBy, min, pickBy } from "lodash-es";
import type {
  CignalsChartOptions,
  CignalsDatapointArray,
  FootprintData,
  FootprintDataArray,
  ParsedCignalsInstrument,
  PriceData,
  PriceDataArray,
} from "./types";
import { type CignalsChartDataProviderBase } from "./cignalsChartDataProvider";
import { CignalsOptionsBuilder } from "./cignalsOptionsBuilder";
import dayjs from "dayjs";
import {
  getNextFromArray,
  getPointerEventDistance,
  mapValueToRgbColor,
  numberToChars,
  formatPriceScaleValue,
  rgbToString,
  type RGB,
} from "../helpers";
import {
  CignalsChartLiveDataProvider,
  type AccUpdateData,
  type FootprintUpdateData,
  type LiveDataProviderOptions,
  type OrderBookUpdateData,
  type OrderBookUpdateDataItem,
} from "./cignalsChartLiveDataProvider";
import { interpolateHsl, scalePow, type ScalePower } from "d3";
import { commaFormatNumber, timeIntervalStringToMs } from "../helpers";
import { humanizeNumber } from "@/lib/utils";

export const DEFAULT_INSTRUMENT_ID = 272;
export const DEFAULT_LIVE_INSTRUMENT_ID = "binance_futures.btc.usdt.perp";

const barAreaDisplayModes = ["delta", "volume", "split-volume"] as const;
type BarAreaDisplayMode = (typeof barAreaDisplayModes)[number];

const footprintDisplayModes = ["buy-sell", "delta", "volume"];
type FootprintDisplayMode = (typeof footprintDisplayModes)[number];

const rightSideVolumeModes = ["stack", "delta", "total"];
type RightSideVolumeMode = (typeof rightSideVolumeModes)[number];

const volColorScaleLow: RGB = {
  r: 48,
  g: 137,
  b: 173,
};

const volColorScaleHigh: RGB = {
  r: 182,
  g: 218,
  b: 242,
};

const obookColorScale = ["#fd4e7a", "#21252b", "#58f36f"] as any;

type TsInfo = {
  candle: PriceData;
  centerX: number;
  ts: number;
};

type DrawReadyFootprintData = {
  buySize: number;
  sellSize: number;
  delta: number;
  totalVol: number;
  price: number;
  timestamp: number;
  isHighestCandleVol: boolean | undefined;
  candleIndexInVisibleCandles: number;
};

type OrderBookBin = {
  dom: number;
  flow: number;
  delta: number;
};

type OrderBookData = {
  [price: number]: OrderBookBin;
};

const LOCAL_STORAGE_KEY = "cignalsChartOptions";

export type CignalsChartConstructorOptions = {
  canvas: HTMLCanvasElement;
  dataProvider: CignalsChartDataProviderBase;
  onSocketConnected?: () => void;
  onSocketConnecting?: () => void;
  onSocketDisconnected?: () => void;
};

type CignalsAcc = {
  n: number;
  size_sq: number;
  volume: number;
};

type nPocData = {
  ts: number;
  vol: number;
  price: number;
};

export class CignalsChart {
  private dataProvider: CignalsChartDataProviderBase;
  private canvas: HTMLCanvasElement;

  _debugText: string = "";
  _tsInfo: TsInfo[] = [];
  _shownMinPrice = 0;
  _shownMaxPrice = 0;
  _data: CignalsDatapointArray = [];
  _nDatapointsShown = 10;
  _nCandlesFetch = 60;
  _candelWidth = 6;
  _highestBuyFootprintSize = 0;
  _lowestBuyFootprintSize = 0;
  _highestSellFootprintSize = 0;
  _lowestSellFootprintSize = 0;
  _visibleCandles = [] as PriceDataArray;
  _filteredFootprints = [] as FootprintDataArray;
  _ctx!: CanvasRenderingContext2D;
  _xPanOffsetPx = 0;
  _nPannedDatapoints = 0;
  _barAreaHeightNormalized = 0.25;
  _rightPadding = 10;
  _tickLineTextSpacing = 10;
  _tickLineWidth = 5;
  _priceTickLineLeftMargin = 2;
  _maxPriceTextWidth = 0;
  _priceTicksToRender: Map<number, string> = new Map();
  _minTickSpacing = 20;
  _bgColor = "#21252b";
  _footprintTextColor = "#0e1612";
  _barAreaDisplayMode: BarAreaDisplayMode = "delta";
  _footprintDisplayMode: FootprintDisplayMode = "buy-sell";
  _cachedFootprintData: FootprintDataArray = [];
  _cachedCandleData: PriceDataArray = [];
  _themeGreen = "#58f36f";
  _themeRed = "#fd4e7a";
  _scaleTextColor = "#a2a5a8";
  _options: CignalsChartOptions;
  _autoAdjustWidthRequested = true;
  _autoAdjustDatapointPixelsTarget = 120;
  _minDatapointsShown = 3;
  _timestempMs = -1;
  _resizeObserver: ResizeObserver | null = null;
  _pointers = new Map<number, PointerEvent>();
  _initialDistance: number | null = null;
  _scaleCenterX: number | null = null;
  _isDragging = false;
  _startY = 0;
  _startMinPrice = 0;
  _startMaxPrice = 0;
  _lastXmoveClientX = 0;
  _lastMousedownX = 0;
  _footprintTextCharWidth = 0;
  _liveDataProvider: CignalsChartLiveDataProvider | null = null;
  _livePrice: number | null = null;
  _highlightFootprintPrice: number | null = null;
  _footprintHighlightColor = "#cb70ff";
  _footprintHighlightSide: "buy" | "sell" = "buy";
  _footprintOrientation: "buy-sell" | "sell-buy" = "buy-sell";
  _redrawScheduled = false;
  _liveRightAreaWidth = 35;
  _rightVolumeAreaWidth = 100;
  _xScaleHeight = 30;
  _rightSideVolumeMode: RightSideVolumeMode = "stack";
  _orderBookData: OrderBookData = {};
  _debugDrawCount = 0;
  _debugDrawCountMax = 100;
  _restingOrderColorScale: ScalePower<string, string>;
  _flowColorScale: ScalePower<string, string>;
  _deltaColorScale: ScalePower<string, string>;
  _timeIntervalMs: number | null = null;
  _constructorOptions: CignalsChartConstructorOptions;
  _acc: CignalsAcc | null = null;
  _last_z: number = 0;
  _pocHelpers: { fromTs: number; toTs: number; price: number; vol: number }[];
  _measurements = {
    restingOrderCellWidth: 0,
    bottomVolumeAreaScaleHeight: 0,
    panOriginatedXOffset: 0,
  };
  _colors = {
    nPocColor: "#352A3E",
    nPocTextColor: "#D653EA",
  };
  _footprintTimestamps: number[];
  _priceStepPx = 20;

  constructor(options: CignalsChartConstructorOptions) {
    this.canvas = options.canvas;
    this.dataProvider = options.dataProvider;
    this._constructorOptions = options;

    this._pocHelpers = [];
    this._footprintTimestamps = [];

    const savedOptions = localStorage.getItem(LOCAL_STORAGE_KEY);
    this._options = savedOptions
      ? JSON.parse(savedOptions)
      : {
          instrument: {
            id: DEFAULT_INSTRUMENT_ID, // BTC/USDT binance_futures perpetual
          } as ParsedCignalsInstrument,
          timeInterval: "5m",
          priceStep: null,
        };

    this._cacheOptionDerived();

    this.initEventHandlers();

    this._restingOrderColorScale = scalePow<string, string>()
      .range(obookColorScale)
      .interpolate(interpolateHsl as any);
    this._flowColorScale = scalePow<string, string>()
      .range(obookColorScale)
      .interpolate(interpolateHsl as any);
    this._deltaColorScale = scalePow<string, string>()
      .range(obookColorScale)
      .interpolate(interpolateHsl as any);
  }

  get options(): CignalsChartOptions {
    return this._options;
  }

  // TODO track refresh data promise and cancel if new options are set
  set options(options: CignalsChartOptions) {
    this._options = options;

    this._cacheOptionDerived();

    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(options));

    console.debug("Set new options", options);

    this.refreshData();
  }

  _cacheOptionDerived() {
    this._timeIntervalMs = timeIntervalStringToMs(this._options.timeInterval);
  }

  get #footprintData(): FootprintDataArray {
    return this._cachedFootprintData;
  }

  get #candleData(): PriceDataArray {
    return this._cachedCandleData;
  }

  get _priceStep() {
    return this._options.priceStep || 1;
  }

  // get _priceStepPx() {
  // 	const priceRange = this._shownMaxPrice - this._shownMinPrice;
  // 	const nPriceSteps = priceRange / this._priceStep;

  // 	return this.chartAreaHeight / nPriceSteps;
  // }

  async refreshData({ keepWsOpen = false }: { keepWsOpen?: boolean } = {}) {
    if (this._liveDataProvider?.isConnected && !keepWsOpen) {
      this._liveDataProvider.destroyWs();
    }

    this._orderBookData = {};

    // Footprint data from HTTP API
    const cignalsOptionsBuilder = new CignalsOptionsBuilder();

    cignalsOptionsBuilder
      .setInstrumentId(this._options.instrument.id)
      .setRange(Date.now(), this._options.timeInterval)
      .setNCandles(this._nCandlesFetch);

    if (this._options.priceStep) {
      cignalsOptionsBuilder.setPriceStep(this._options.priceStep);
    }

    // if (this._data.length) {
    // 	console.log(this._data[this._data.length - 1].candle.timestamp);
    // }

    const fetchOpts = cignalsOptionsBuilder.buildDatapointFetchOptions();
    const data = await this.dataProvider.fetchDatapoints(fetchOpts);

    this._data = data;

    // console.log(this._data[this._data.length - 1].candle.timestamp);

    // Automatically calculated price step
    this._options.priceStep = this.dataProvider.lastUsedFootprintPriceStep;
    this._timestempMs = timeIntervalStringToMs(this._options.timeInterval);

    // Live data provider
    if (!keepWsOpen || !this._liveDataProvider?.isConnected) {
      this.#setupLiveDataProvider();
    }

    this._cacheData();
    this._afterDataUpdate();
  }

  #setupLiveDataProvider() {
    console.log("setup live data provider");

    const i = this._options.instrument;
    const perp = i.perpetual ? ".perp" : "";

    let instrumentLabel: string;

    if (this._options.instrument.id === DEFAULT_INSTRUMENT_ID) {
      instrumentLabel = DEFAULT_LIVE_INSTRUMENT_ID;
    } else {
      instrumentLabel = `${i.exchange}.${i.base_currency}.${i.quote_currency}` + perp;
    }

    const liveDataProviderOptions: LiveDataProviderOptions = {
      instrumentId: this._options.instrument.id,
      instrumentLabel,
      priceStep: this._priceStep,
      onNewPrice: this.#onNewPrice.bind(this),
      onFootprintUpdate: this.#onFootprintUpdate.bind(this),
      onOrderBookUpdate: this.#onOrderBookUpdate.bind(this),
      timeInterval: this._options.timeInterval,
      onSocketConnected: this._constructorOptions.onSocketConnected,
      onSocketConnecting: this._constructorOptions.onSocketConnecting,
      onSocketDisconnected: this._constructorOptions.onSocketDisconnected,
      onSocketReconnected: this.refreshData.bind(this, { keepWsOpen: false }),
      onAccUpdate: this.#onAccUpdate.bind(this),
    };

    this._liveDataProvider = new CignalsChartLiveDataProvider(liveDataProviderOptions);
    this._liveDataProvider.connectWs();
  }

  private _cacheData() {
    this._cachedFootprintData = [];
    this._cachedCandleData = [];

    const allTimestamps = new Set<number>();

    for (const datapoint of this._data) {
      const priceToVolume = new Map<number, number>();

      for (let i = 1; i < datapoint.footprints.length; i++) {
        const footprint = datapoint.footprints[i];
        const currPriceVol = priceToVolume.get(footprint.price) ?? 0;

        priceToVolume.set(footprint.price, currPriceVol + footprint.size);
      }

      // Mark highest volume footprints
      const maxVolume = Math.max(...priceToVolume.values());

      let maxVolPrice = 0;

      for (const [price, volume] of priceToVolume.entries()) {
        if (volume === maxVolume) {
          maxVolPrice = price;
        }
      }

      for (const footprint of datapoint.footprints) {
        footprint.isHighestCandleVol = footprint.price === maxVolPrice;
      }

      this._cachedFootprintData.push(...datapoint.footprints);
      this._cachedCandleData.push(datapoint.candle);

      allTimestamps.add(datapoint.candle.timestamp);
    }

    this._footprintTimestamps = Array.from(allTimestamps);
    this._footprintTimestamps.sort((a, b) => a - b);
  }

  /* --------------- Event handlers --------------- */
  private removeEventHandlers() {
    this.canvas.removeEventListener("click", this._onClick);
    this.canvas.removeEventListener("wheel", this._onWheel);
    this.canvas.removeEventListener("pointerdown", this._onPointerDown);

    window.removeEventListener("pointermove", this._onPointerMove);
    window.removeEventListener("pointerup", this._onPointerUp);
    window.removeEventListener("pointercancel", this._onPointerCancel);

    this._resizeObserver?.disconnect();
  }

  private _onClick = (e: MouseEvent) => {};

  private _onWheel = (event: WheelEvent) => {
    event.preventDefault();

    const xInCanvas = this.canvas.clientWidth / 2;
    const tsAtPointer = this.#pointInTimeFromCanvasX(xInCanvas);

    const multiplier = 0.01;
    const deltaDatapoints = -event.deltaY * multiplier;

    this._nDatapointsShown = Math.max(this._minDatapointsShown, this._nDatapointsShown + deltaDatapoints);

    this.#updateMeasurements();

    // Keep the original center of the screen at the center of the screen,
    // but only if the user has panned away from the original position,
    // e.g. cannot pan more into the future
    if (this._xPanOffsetPx > 0) {
      this.moveTsToPixel(xInCanvas, tsAtPointer);
    }

    this.#updateVisibleData();
    this.#updateFootprintColorScale();

    this.#scheduleRedraw();
  };

  private _onPointerDown = (e: PointerEvent) => {
    this._isDragging = true;
    this._startY = e.clientY;
    this._startMinPrice = this._shownMinPrice;
    this._startMaxPrice = this._shownMaxPrice;
    this._lastXmoveClientX = e.clientX;
    this._lastMousedownX = e.clientX;

    this._pointers.set(e.pointerId, e);

    if (this._pointers.size === 2) {
      const [p1, p2] = [...this._pointers.values()];
      this._initialDistance = getPointerEventDistance(p1, p2);
      this._scaleCenterX = (p1.clientX + p2.clientX) / 2;
    }
  };

  private _onPointerMove = (e: PointerEvent) => {
    if (!this._pointers.has(e.pointerId)) {
      return;
    }

    if (this._pointers.size === 2 && this._initialDistance) {
      const [p1, p2] = [...this._pointers.values()];
      const currentDistance = getPointerEventDistance(p1, p2);

      this._pointers.set(e.pointerId, e);

      const [p1_new, p2_new] = [...this._pointers.values()];
      const newDistance = getPointerEventDistance(p1_new, p2_new);

      const tsAtPointer = this.#pointInTimeFromCanvasX(this._scaleCenterX!);

      const distanceDelta = newDistance - currentDistance;

      const datapointSizeFraction = distanceDelta / this._datapointWidth;
      this._nDatapointsShown = Math.max(1, this._nDatapointsShown - datapointSizeFraction);

      this.#updateMeasurements();

      this.moveTsToPixel(this._scaleCenterX!, tsAtPointer);

      this.#updateVisibleData();
      this.#updateFootprintColorScale();

      this.#scheduleRedraw();
    }

    this._pointers.set(e.pointerId, e);

    if (this._pointers.size === 1) {
      if (!this._isDragging) return;

      const deltaY = e.clientY - this._startY;
      const priceRange = this._startMaxPrice - this._startMinPrice;
      const pricePerPixel = priceRange / this.chartAreaHeight; // Updated line

      this._shownMinPrice = this._startMinPrice + deltaY * pricePerPixel;
      this._shownMaxPrice = this._startMaxPrice + deltaY * pricePerPixel;

      const deltaX = e.clientX - this._lastXmoveClientX;

      this._xPanOffsetPx += deltaX;
      this._xPanOffsetPx = Math.max(this._xPanOffsetPx, 0);

      this._lastXmoveClientX = e.clientX;

      this.#updateMeasurements();

      this.#updateVisibleData();
      this.#updateFootprintColorScale();

      this.#scheduleRedraw();
    }
  };

  private _onPointerUp = (e: PointerEvent) => {
    const isClick = this._lastMousedownX === e.clientX;

    if (isClick) {
      this.#handleModeChange(e);
    }

    this._pointers.delete(e.pointerId);

    if (this._pointers.size < 2) {
      this._initialDistance = null;
      this._scaleCenterX = null;
    }

    this._isDragging = false;

    this._drawAll();
  };

  private _onPointerCancel = (event: PointerEvent) => {
    this._pointers.delete(event.pointerId);
    this._initialDistance = null;
  };

  initEventHandlers() {
    this.removeEventHandlers();

    this.canvas.addEventListener("click", this._onClick);
    this.canvas.addEventListener("wheel", this._onWheel);
    this.canvas.addEventListener("pointerdown", this._onPointerDown);

    window.addEventListener("pointermove", this._onPointerMove);
    window.addEventListener("pointerup", this._onPointerUp);
    window.addEventListener("pointercancel", this._onPointerCancel);

    this._resizeObserver = new ResizeObserver(() => {
      if (this._data) {
        this.#updateMinMaxPrices();
        this._drawAll();
      }

      if (this._autoAdjustWidthRequested) {
        this.#autoAdjustDatapointWidth();
        this._autoAdjustWidthRequested = false;
      }
    });

    this._resizeObserver.observe(this.canvas);
  }

  destroy() {
    this.removeEventHandlers();
    this._liveDataProvider?.destroyWs();
  }

  #prependOhlcWithPlaceholders(ohlcData: PriceDataArray, nPlaceholders: number): PriceDataArray {
    const placeholders = Array.from({ length: nPlaceholders }, () => ({
      close: -1,
      high: -1,
      low: -1,
      open: -1,
      price_volume: -1,
      timestamp: -1,
      volume: -1,
      vwap: -1,
    }));

    return [...placeholders, ...ohlcData];
  }

  #updateVisibleData() {
    const offsetCandlesFromNow = Math.floor(this._xPanOffsetPx / this._datapointWidth);

    this._nPannedDatapoints = offsetCandlesFromNow;

    this.#updateMeasurements();

    const nSelectCandles = Math.ceil(this._nDatapointsShown);

    const candleData = this.#prependOhlcWithPlaceholders(this.#candleData, 10);

    this._visibleCandles = candleData.slice(
      -nSelectCandles - offsetCandlesFromNow - 1,
      candleData.length - offsetCandlesFromNow
    );

    const minCandleTimestamp = this._visibleCandles[0].timestamp;
    const maxCandleTimestamp = this._visibleCandles[this._visibleCandles.length - 1].timestamp;

    this._filteredFootprints = this.#footprintData.filter(
      (fp) => fp.timestamp >= minCandleTimestamp && fp.timestamp <= maxCandleTimestamp
    );
  }

  get estimatedCurrentPrice(): number | null {
    const lastCandleWithFootprints = this._data.findLast((d) => d.footprints.length > 0);

    if (!lastCandleWithFootprints) {
      return null;
    }

    const footprints = lastCandleWithFootprints.footprints;
    const averagePrice = meanBy(footprints, (fp) => fp.price);

    return averagePrice;
  }

  #updateMinMaxPrices() {
    const currentPrice = this.estimatedCurrentPrice;

    if (currentPrice === null) {
      return;
    }

    const chartAreaHeight = this.chartAreaHeight;

    const nFootprints = chartAreaHeight / this._priceStepPx;
    const priceStep = this._priceStep;

    const minPrice = currentPrice - (nFootprints / 2) * priceStep;
    const maxPrice = currentPrice + (nFootprints / 2) * priceStep;

    this._shownMinPrice = minPrice;
    this._shownMaxPrice = maxPrice;
  }

  #updateFootprintColorScale() {
    const buyPrices: number[] = [];
    const sellPrices: number[] = [];

    for (const fp of this._filteredFootprints) {
      if (fp.side === "buy") {
        buyPrices.push(fp.size);
      } else {
        sellPrices.push(fp.size);
      }
    }

    this._highestBuyFootprintSize = max(buyPrices) ?? 0;
    this._lowestBuyFootprintSize = min(buyPrices) ?? 0;
    this._highestSellFootprintSize = max(sellPrices) ?? 0;
    this._lowestSellFootprintSize = min(sellPrices) ?? 0;
  }

  private _afterDataUpdate() {
    this.#updateVisibleData();
    this.#updateMinMaxPrices();
    this.#updateFootprintColorScale();

    this._drawAll();
  }

  get _chartAreaRight() {
    return (
      this.canvas.clientWidth -
      this._rightPadding -
      this._rightVolumeAreaWidth -
      this._liveRightAreaWidth -
      this._maxPriceTextWidth -
      this._tickLineTextSpacing -
      this._tickLineWidth -
      this._priceTickLineLeftMargin
    );
  }

  get chartAreaHeight() {
    return this.canvas.clientHeight * (1 - this._barAreaHeightNormalized);
  }

  get nPeriodsShown() {
    return this._filteredFootprints;
  }

  get _datapointWidth() {
    return this._chartAreaRight / this._nDatapointsShown;
  }

  // TODO cache this
  private _getSmoothScalingChartPositionOffset() {
    const firstRenderedBoxFraction = Math.ceil(this._nDatapointsShown) - this._nDatapointsShown;

    return this._datapointWidth * firstRenderedBoxFraction * -1;
  }

  updatePriceTicksToRender() {
    this._priceTicksToRender = new Map();
    this._maxPriceTextWidth = 0;

    for (
      let price = Math.ceil(this._shownMinPrice / this._priceStep) * this._priceStep;
      price <= this._shownMaxPrice;
      price += this._priceStep
    ) {
      const text = formatPriceScaleValue(price, this._priceStep);
      const textWidth = this._ctx.measureText(text + "__").width; // __ is a hotfix, idk it measures incorrectly
      this._maxPriceTextWidth = Math.max(this._maxPriceTextWidth, textWidth);

      this._priceTicksToRender.set(price, text);
    }
  }

  drawBackground() {
    this._ctx.fillStyle = this._bgColor;
    this._ctx.fillRect(0, 0, this.canvas.clientWidth, this.canvas.clientHeight);
  }

  drawCandlesticks(data: PriceDataArray) {
    const ctx = this._ctx;
    const height = this.chartAreaHeight;
    const candleWidth = this._candelWidth;
    const tsBoxWidth = this._datapointWidth;
    const spacing = tsBoxWidth - candleWidth;
    const smoothScalingChartPositionOffset = this._getSmoothScalingChartPositionOffset();
    const xOffset = this._measurements.panOriginatedXOffset;

    this._tsInfo = [];

    for (let i = 0; i < data.length; i++) {
      const candle = data[i];
      const open = candle.open;
      const close = candle.close;
      const high = candle.high;
      const low = candle.low;

      const positionedClose = ((close - this._shownMinPrice) / (this._shownMaxPrice - this._shownMinPrice)) * height;
      const positionedOpen = ((open - this._shownMinPrice) / (this._shownMaxPrice - this._shownMinPrice)) * height;
      const candleHeight = positionedOpen - positionedClose;
      const isRed = open > close;

      const xPos = i * (candleWidth + spacing) + smoothScalingChartPositionOffset + xOffset;

      ctx.fillStyle = isRed ? this._themeRed : this._themeGreen;
      ctx.fillRect(xPos, height - positionedOpen, candleWidth - 2, candleHeight);

      const positionedHigh = ((high - this._shownMinPrice) / (this._shownMaxPrice - this._shownMinPrice)) * height;
      const positionedLow = ((low - this._shownMinPrice) / (this._shownMaxPrice - this._shownMinPrice)) * height;

      const bodyLow = Math.min(positionedOpen, positionedClose);
      const bodyHigh = Math.max(positionedOpen, positionedClose);

      ctx.fillStyle = isRed ? "#70344b" : "#24452e";

      const topWickHeight = positionedHigh - bodyHigh;
      ctx.fillRect(xPos, height - bodyHigh, candleWidth - 2, -topWickHeight);

      const botWickHeight = bodyLow - positionedLow;
      ctx.fillRect(xPos, height - bodyLow, candleWidth - 2, botWickHeight);

      this._tsInfo.push({
        candle,
        centerX: xPos + tsBoxWidth / 2,
        ts: candle.timestamp,
      });
    }
  }

  drawFootprints() {
    if (this._data.length === 0) {
      return;
    }

    const ctx = this._ctx;
    const candleWidth = this._candelWidth;
    const spacing = this._datapointWidth - candleWidth;
    const rectWidth = spacing - 2;

    const footprintHeight = this._priceStepPx - 2;

    ctx.font = "10px Monospace";
    ctx.textAlign = "right";

    const footprints: (FootprintData & {
      candleIndexInVisibleCandles: number;
    })[] = this._filteredFootprints.map((i) => {
      const candleIndex = this._visibleCandles.findIndex((c) => c.timestamp === i.timestamp);

      return {
        ...i,
        candleIndexInVisibleCandles: candleIndex,
      };
    });

    const parsedFootprints: DrawReadyFootprintData[] = [];

    let maxDelta = -Infinity;
    let minDelta = Infinity;

    let maxVol = -Infinity;
    let minVol = Infinity;

    // This needs to be moved outside the draw loop, preferably move this into _cacheData
    for (const footprint of footprints) {
      let priceTsFootprint = parsedFootprints.find(
        (i) => i.price === footprint.price && i.timestamp === footprint.timestamp
      );

      if (!priceTsFootprint) {
        priceTsFootprint = {
          buySize: 0,
          sellSize: 0,
          delta: 0,
          isHighestCandleVol: false,
          price: footprint.price,
          timestamp: footprint.timestamp,
          candleIndexInVisibleCandles: footprint.candleIndexInVisibleCandles,
          totalVol: 0,
        };

        parsedFootprints.push(priceTsFootprint);
      }

      priceTsFootprint.totalVol += footprint.size;

      if (footprint.side === "buy") {
        priceTsFootprint.buySize += footprint.size;
        priceTsFootprint.delta += footprint.size;
        priceTsFootprint.isHighestCandleVol = footprint.isHighestCandleVol;
      } else {
        priceTsFootprint.sellSize += footprint.size;
        priceTsFootprint.delta -= footprint.size;
      }

      // This has to stay here to account only for visible data
      if (priceTsFootprint.delta > maxDelta) {
        maxDelta = priceTsFootprint.delta;
      }

      if (priceTsFootprint.delta < minDelta) {
        minDelta = priceTsFootprint.delta;
      }

      if (priceTsFootprint.totalVol > maxVol) {
        maxVol = priceTsFootprint.totalVol;
      }

      if (priceTsFootprint.totalVol < minVol) {
        minVol = priceTsFootprint.totalVol;
      }
    }

    this._footprintTextCharWidth = ctx.measureText("0").width;

    const lastCandleTs = this._data[this._data.length - 1].candle.timestamp;

    for (const footprint of parsedFootprints) {
      const top = this.#getPriceTickY(footprint.price) - footprintHeight / 2;
      const left = this.#getDatapointtLeft(footprint.timestamp);

      if (this._footprintDisplayMode === "buy-sell") {
        this.#drawSplitFootprint(left, top, rectWidth, footprintHeight, footprint);
      } else if (this._footprintDisplayMode === "delta") {
        this.#drawDeltaFootprint(left, top, rectWidth, footprintHeight, footprint, minDelta, maxDelta);
      } else {
        this.#drawVolumeFootprint(left, top, rectWidth, footprintHeight, footprint, minVol, maxVol);
      }

      // Draw a mark inicating that this foorpting is the highest volume footprint
      // of the candle
      if (footprint.isHighestCandleVol) {
        ctx.fillStyle = "#82c691";

        ctx.beginPath();
        ctx.moveTo(left, top);
        ctx.lineTo(left, top + footprintHeight);
        ctx.lineTo(left + 5, top + footprintHeight / 2);
        ctx.fill();
      }

      // Draw footprint highlight outline
      if (footprint.timestamp === lastCandleTs && this._highlightFootprintPrice !== null) {
        const lowPriceBound = footprint.price - this._priceStep / 2;
        const highPriceBound = footprint.price + this._priceStep / 2;

        if (lowPriceBound < this._highlightFootprintPrice && this._highlightFootprintPrice < highPriceBound) {
          const highlightRectWidth = this._footprintDisplayMode === "buy-sell" ? rectWidth / 2 : rectWidth;

          let highlightRectX = left;

          const highlightIsOnRightSide =
            (this._footprintOrientation === "buy-sell" && this._footprintHighlightSide === "sell") ||
            (this._footprintOrientation === "sell-buy" && this._footprintHighlightSide === "buy");

          if (this._footprintDisplayMode === "buy-sell" && highlightIsOnRightSide) {
            highlightRectX += rectWidth / 2;
          }

          ctx.strokeStyle = this._footprintHighlightColor;
          ctx.lineWidth = 2;
          ctx.strokeRect(highlightRectX, top, highlightRectWidth, footprintHeight);
        }
      }
    }
  }

  #drawSplitFootprint(left: number, top: number, width: number, height: number, footprint: DrawReadyFootprintData) {
    const halfWidth = width / 2;
    const ctx = this._ctx;

    ctx.fillStyle = this.#mapFootprintSizeToColor(
      footprint.buySize,
      "buy",
      this._lowestBuyFootprintSize,
      this._highestBuyFootprintSize
    );
    ctx.fillRect(left, top, halfWidth - 1, height);

    ctx.fillStyle = this.#mapFootprintSizeToColor(
      footprint.sellSize,
      "sell",
      this._lowestSellFootprintSize,
      this._highestSellFootprintSize
    );
    ctx.fillRect(left + halfWidth + 1, top, halfWidth - 1, height);

    const nChars = ~~(halfWidth / this._footprintTextCharWidth) - 2;

    if (nChars > 2) {
      const sizePaddingRight = 4;
      const textY = top + height / 2 + 3;

      ctx.fillStyle = this._footprintTextColor;

      ctx.fillText(numberToChars(footprint.buySize, nChars), left - 2 + halfWidth - sizePaddingRight, textY);

      ctx.fillText(numberToChars(footprint.sellSize, nChars), left - 2 - sizePaddingRight + width, textY);
    }
  }

  #drawDeltaFootprint(
    left: number,
    top: number,
    width: number,
    height: number,
    footprint: DrawReadyFootprintData,
    minDelta: number,
    maxDelta: number
  ) {
    const delta = footprint.buySize - footprint.sellSize;

    this._ctx.fillStyle = this.#mapFootprintSizeToColor(
      delta,
      delta > 0 ? "buy" : "sell",
      0,
      delta > 0 ? maxDelta : minDelta
    );
    this._ctx.fillRect(left, top, width, height);
    this._ctx.fillStyle = this._footprintTextColor;

    const nChars = ~~(width / this._footprintTextCharWidth / 2);

    this._ctx.fillText(numberToChars(delta, nChars), left + width - 2, top + height / 2 + 3);
  }

  #drawVolumeFootprint(
    left: number,
    top: number,
    width: number,
    height: number,
    footprint: DrawReadyFootprintData,
    minVol: number,
    maxVol: number
  ) {
    this._ctx.fillStyle = this.#mapVolumeToColor(footprint.totalVol, minVol, maxVol);
    this._ctx.fillRect(left, top, width, height);
    this._ctx.fillStyle = this._footprintTextColor;

    const nChars = ~~(width / this._footprintTextCharWidth) - 2;

    this._ctx.fillText(numberToChars(footprint.totalVol, nChars), left + width - 2, top + height / 2 + 3);
  }

  #mapFootprintSizeToColor(size: number, side: "buy" | "sell", low: number, high: number): string {
    const baseColor = side === "buy" ? this._themeGreen : this._themeRed;

    const minOpacity = 0.2;
    const normalizedSize = (size - low) / (high - low);
    const opacity = normalizedSize * (1 - minOpacity) + minOpacity;
    const hexOpacity = Math.round(opacity * 255).toString(16);

    return baseColor + hexOpacity;
  }

  #mapVolumeToColor(volume: number, low: number, high: number): string {
    const normVol = (volume - low) / (high - low);

    const color = mapValueToRgbColor(normVol, volColorScaleLow, volColorScaleHigh);
    // const opacity = normVol < 0.5 ? 0.5 : 1;
    const opacity = 1;
    const asRgbString = rgbToString(color, opacity);

    return asRgbString;
  }

  drawRightAreaBg() {
    const ctx = this._ctx;
    const chAreaRight = this._chartAreaRight;
    const rightAreaWidth = this.canvas.clientWidth - chAreaRight;

    ctx.fillStyle = this._bgColor;
    ctx.fillRect(chAreaRight, 0, rightAreaWidth, this.canvas.clientHeight);
  }

  #getPriceTickY(price: number) {
    const height = this.chartAreaHeight;

    return height - ((price - this._shownMinPrice) / (this._shownMaxPrice - this._shownMinPrice)) * height;
  }

  #getDatapointtLeft(ts: number) {
    // TODO optimize this
    const visibleTimestamps = this._visibleCandles.map((c) => c.timestamp);
    const candleIndex = visibleTimestamps.indexOf(ts);

    const smoothScalingChartPositionOffset = this._getSmoothScalingChartPositionOffset();
    const spacing = this._datapointWidth - this._candelWidth;
    const xOffset = this._measurements.panOriginatedXOffset;

    const left =
      candleIndex * (this._candelWidth + spacing) + this._candelWidth + smoothScalingChartPositionOffset + xOffset;

    return left;
  }

  drawPriceTicks() {
    const height = this.chartAreaHeight;
    const tickHeight = 1;

    this._ctx.save();

    this._ctx.fillStyle = this._scaleTextColor;
    this._ctx.textBaseline = "middle";
    this._ctx.textAlign = "left";

    const lineX = this._chartAreaRight + this._priceTickLineLeftMargin;
    const priceTickLabelX = lineX + this._tickLineWidth + this._tickLineTextSpacing;

    for (const [price, formatted] of this._priceTicksToRender.entries()) {
      const yPos = this.#getPriceTickY(price);
      const tickTop = yPos - tickHeight / 2;

      this._ctx.fillText(formatted, priceTickLabelX, yPos);
      this._ctx.fillRect(lineX, tickTop, this._tickLineWidth, tickHeight);
    }

    // Draw vertical line across all ticks lines

    this._ctx.fillRect(lineX, 0, 1, height);

    this._ctx.restore();
  }

  get priceTickLabelLeft() {
    return this._chartAreaRight + this._tickLineWidth + this._tickLineTextSpacing + this._priceTickLineLeftMargin;
  }

  drawCurrentPrice() {
    const currentPrice = this._livePrice;

    if (currentPrice === null) {
      return;
    }

    const height = this.chartAreaHeight;
    const yPos = height - ((currentPrice - this._shownMinPrice) / (this._shownMaxPrice - this._shownMinPrice)) * height;

    // Line
    // this._ctx.fillStyle = '#ffffff88';
    // this._ctx.fillRect(0, yPos, this.canvas.clientWidth, 1);

    const currentPriceText = formatPriceScaleValue(currentPrice, this._priceStep);
    const currentPriceTextMeasurement = this._ctx.measureText(currentPriceText);
    const currentPriceTextHeight = currentPriceTextMeasurement.emHeightAscent;

    // Background behind current price
    const currentPriceBgHeight = currentPriceTextHeight + 40;
    const currentPriceBgWidth = this._maxPriceTextWidth + this._rightPadding + this._tickLineWidth;

    const currentPriceBgY = yPos - currentPriceBgHeight / 2;
    const currentPriceBgX = this.priceTickLabelLeft;

    this._ctx.fillStyle = this._bgColor + "cc";
    // this._ctx.fillStyle = '#ff0000';
    this._ctx.fillRect(currentPriceBgX, currentPriceBgY, currentPriceBgWidth, currentPriceBgHeight);

    // Draw price line
    this._ctx.fillStyle = "#ffffff";
    this._ctx.textBaseline = "middle";
    this._ctx.textAlign = "left";
    this._ctx.fillText(currentPriceText, this.priceTickLabelLeft, yPos);
  }

  drawPriceExtremes() {
    const minPrice = this._shownMinPrice;
    const maxPrice = this._shownMaxPrice;

    this._ctx.fillStyle = "white";
    this._ctx.fillText(
      `Min: ${commaFormatNumber(minPrice)}`,
      this.canvas.clientWidth - 100,
      this.canvas.clientHeight - 10
    );
    this._ctx.fillText(`Max: ${commaFormatNumber(maxPrice)}`, this.canvas.clientWidth - 100, 20);
  }

  #drawBottomVolumeArea() {
    const ctx = this._ctx;
    const width = this.canvas.clientWidth;
    const height = this.canvas.clientHeight;
    const barAreaHeight = this._barAreaHeightNormalized * height;
    const barAreaBottomOffset = this._xScaleHeight;

    // Background
    ctx.fillStyle = this._bgColor;
    ctx.fillRect(0, height - barAreaHeight, width, barAreaHeight - barAreaBottomOffset);

    // Dashed line separating chart area and bar area
    ctx.strokeStyle = "#ffffff88";
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(0, height - barAreaHeight);
    ctx.lineTo(width, height - barAreaHeight);
    ctx.stroke();

    const maxBarHeight = barAreaHeight - barAreaBottomOffset - 10;
    let drawRes: { min: number; max: number };

    if (this._barAreaDisplayMode === "delta") {
      drawRes = this._drawDeltaVolumeBars({
        barAreaHeight: maxBarHeight,
        barAreaBottomOffset,
      });
    } else if (this._barAreaDisplayMode === "split-volume") {
      drawRes = this._drawSplitVolumeBars({
        barAreaHeight: maxBarHeight,
        buyColor: "#5fe772",
        sellColor: "#f0567c",
        barAreaBottomOffset,
      });
    } else {
      // Total volume
      drawRes = this._drawTotalVolumeBars({
        barAreaHeight: maxBarHeight,
        barAreaBottomOffset,
      });
    }

    const { min, max } = drawRes;

    // Bar area scale bg
    const chartAreaRight = this._chartAreaRight;

    ctx.fillStyle = this._bgColor;
    ctx.fillRect(chartAreaRight, height - barAreaHeight, width - chartAreaRight, barAreaHeight + barAreaBottomOffset);

    this._measurements.bottomVolumeAreaScaleHeight = maxBarHeight;

    // Scale
    this.#drawBottomVolumeAreaScale({
      min,
      max,
      bottomY: height - barAreaBottomOffset,
      height: maxBarHeight,
    });
  }

  #drawBottomVolumeAreaScale({
    min,
    max,
    bottomY,
    height,
  }: {
    min: number;
    max: number;
    bottomY: number;
    height: number;
  }) {
    // Prevents Out of memory error when tickSpacingInValues is negative
    if (height < 0) {
      console.debug("Height is negative, skipping scale rendering");
      return;
    }

    const chartAreaRight = this._chartAreaRight;

    const scaleX = chartAreaRight + 2;

    // Draw vertical line
    this._ctx.fillStyle = this._scaleTextColor;
    this._ctx.fillRect(scaleX, bottomY, 1, -height);

    const tickLength = 10;

    // Draw min max lines
    this._ctx.fillRect(scaleX, bottomY, tickLength, 1);
    this._ctx.fillRect(scaleX, bottomY - height, tickLength, 1);

    // Measure tick text height
    const textHeight = 10;
    const minTextSpacing = 5;

    const nTicks = height / (textHeight + minTextSpacing);
    const tickSpacingInValues = (max - min) / nTicks;

    if (tickSpacingInValues <= 0) {
      return;
    }

    let tickAlignFactor = 1;

    // Align tick spacing in values to tens, hundreds
    if (tickSpacingInValues > 100_000) {
      tickAlignFactor = 100_000;
    } else if (tickSpacingInValues > 10_000) {
      tickAlignFactor = 10_000;
    } else if (tickSpacingInValues > 1000) {
      tickAlignFactor = 1000;
    } else if (tickAlignFactor > 100) {
      tickAlignFactor = 100;
    } else if (tickSpacingInValues > 10) {
      tickAlignFactor = 10;
    }

    const tickSpacing = tickSpacingInValues - (tickSpacingInValues % tickAlignFactor);

    const ticksToTopFromZero: number[] = [];
    const ticksToBottomFromZero: number[] = [];

    for (let i = 0; i < max; i += tickSpacing) {
      ticksToTopFromZero.push(i);
    }

    for (let i = 0; i > min; i -= tickSpacing) {
      ticksToBottomFromZero.push(i);
    }

    // Render ticks, zero always needs to be displayed, hence
    // we are rendering it first.
    const relativeZeroY = (Math.abs(min) / (max + Math.abs(min))) * height;

    const zeroTickY = bottomY - relativeZeroY;
    const textOffsetX = tickLength + 15;
    const totalPositiveHeight = height - relativeZeroY;
    const totalNegativeHeight = relativeZeroY;

    // Render zero tick
    this._ctx.textBaseline = "middle";

    // Render from zero to top, including zero
    for (let tickVal = 0; tickVal <= max; tickVal += tickSpacing) {
      const y = zeroTickY - (tickVal / max) * totalPositiveHeight;

      this._ctx.fillText(humanizeNumber(tickVal), scaleX + textOffsetX, y);
      this._ctx.fillRect(scaleX, y, tickLength, 1);
    }

    // Render from zero to bottom, skip zero
    for (let tickVal = 0 - tickSpacing; tickVal >= min; tickVal -= tickSpacing) {
      const y = zeroTickY + (tickVal / min) * totalNegativeHeight;

      this._ctx.fillText(humanizeNumber(tickVal), scaleX + textOffsetX, y);
      this._ctx.fillRect(scaleX, y, tickLength, 1);
    }
  }

  get liveOrderBookAreaLeft() {
    return (
      this._chartAreaRight +
      this._priceTickLineLeftMargin +
      this._tickLineWidth +
      this._tickLineTextSpacing +
      this._maxPriceTextWidth
    );
  }

  get rightVolAreaLeft() {
    return this.liveOrderBookAreaLeft + this._liveRightAreaWidth;
  }

  #drawRightSideVolumeArea() {
    type VolInfo = {
      buyVolume: number;
      sellVolume: number;
      delta: number;
      total: number;
    };

    const prices = this._filteredFootprints.map((fp) => fp.price);
    const priceToVolInfo: { [price: number]: VolInfo } = {};

    for (const price of prices) {
      priceToVolInfo[price] = {
        buyVolume: 0,
        sellVolume: 0,
        delta: 0,
        total: 0,
      };
    }

    for (const footprint of this._filteredFootprints) {
      const info = priceToVolInfo[footprint.price];

      if (!info) {
        continue;
      }

      const vol = footprint.size;

      if (footprint.side === "buy") {
        info.buyVolume += vol;
        info.delta += vol;
      } else {
        info.sellVolume += vol;
        info.delta -= vol;
      }

      info.total += vol;
    }

    const maxTotalVol = Math.max(...Object.values(priceToVolInfo).map((i) => i.total));
    const minTotalVol = Math.min(...Object.values(priceToVolInfo).map((i) => i.total));
    const maxDelta = Math.max(...Object.values(priceToVolInfo).map((i) => i.delta));
    const minDelta = Math.min(...Object.values(priceToVolInfo).map((i) => i.delta));

    const priceStepPx = this._priceStepPx;
    const left = this.rightVolAreaLeft;

    const totalDeltaRange = maxDelta - minDelta;
    const zeroNormalizedInDeltaRange = -minDelta / totalDeltaRange;
    const zeroX = left + this._rightVolumeAreaWidth * zeroNormalizedInDeltaRange;

    for (const [price, info] of Object.entries(priceToVolInfo)) {
      const top = this.#getPriceTickY(parseFloat(price)) - priceStepPx / 2;

      if (this._rightSideVolumeMode === "stack") {
        const buyWidth = (info.buyVolume / maxTotalVol) * this._rightVolumeAreaWidth;
        const sellWidth = (info.sellVolume / maxTotalVol) * this._rightVolumeAreaWidth;

        this._ctx.fillStyle = this._themeGreen;
        this._ctx.fillRect(left, top + 1, buyWidth, priceStepPx - 2);

        this._ctx.fillStyle = this._themeRed;
        this._ctx.fillRect(left + buyWidth, top + 1, sellWidth, priceStepPx - 2);
      } else if (this._rightSideVolumeMode === "delta") {
        const deltaWidth = (info.delta / totalDeltaRange) * this._rightVolumeAreaWidth;

        this._ctx.fillStyle = info.delta > 0 ? this._themeGreen : this._themeRed;
        this._ctx.fillRect(zeroX, top + 1, deltaWidth, priceStepPx - 2);
      } else {
        const totalWidth = (info.total / maxTotalVol) * this._rightVolumeAreaWidth;

        this._ctx.fillStyle = this.#mapVolumeToColor(info.total, minTotalVol, maxTotalVol);
        this._ctx.fillRect(left, top + 1, totalWidth, priceStepPx - 2);
      }
    }
  }

  private _drawSplitVolumeBars({
    barAreaHeight,
    buyColor,
    sellColor,
    barAreaBottomOffset,
  }: {
    barAreaHeight: number;
    buyColor: string;
    sellColor: string;
    barAreaBottomOffset: number;
  }): { min: number; max: number } {
    const agg: {
      buyVolume: number;
      sellVolume: number;
      relativeBuyHeight: number;
      relativeSellHeight: number;
    }[] = [];

    // Aggregate footprint data before normalization
    for (const candleRenderInfo of this._tsInfo) {
      const footprints = this._filteredFootprints.filter((fp) => fp.timestamp === candleRenderInfo.candle.timestamp);

      const buyFootprints = footprints.filter((fp) => fp.side === "buy");
      const sellFootprints = footprints.filter((fp) => fp.side === "sell");

      const buyVolume = buyFootprints.reduce((acc, cur) => acc + cur.size, 0);
      const sellVolume = sellFootprints.reduce((acc, cur) => acc + cur.size, 0);

      agg.push({
        buyVolume,
        sellVolume,
        relativeBuyHeight: 0,
        relativeSellHeight: 0,
      });
    }

    // Compute relative height for each bar
    const maxVolume = max(agg.map((a) => a.buyVolume + a.sellVolume)) as number;

    for (const a of agg) {
      a.relativeBuyHeight = a.buyVolume / maxVolume;
      a.relativeSellHeight = a.sellVolume / maxVolume;
    }

    // Render bars
    const ctx = this._ctx;
    const height = this.canvas.clientHeight;
    const xOffset = this._measurements.panOriginatedXOffset;
    const smoothScalingChartPositionOffset = this._getSmoothScalingChartPositionOffset();

    const barBbox = this._datapointWidth;
    const barWidth = barBbox * 0.8;
    const barOffsetX = (barBbox - barWidth) / 2;

    for (let i = 0; i < agg.length; i++) {
      const a = agg[i];
      const xPos = i * barBbox + smoothScalingChartPositionOffset + xOffset;

      // The ~~ hack is to prevent antialiasing from ruining the rectangle alignment
      ctx.fillStyle = sellColor;
      ctx.fillRect(
        xPos + barOffsetX,
        ~~(height - (a.relativeBuyHeight + a.relativeSellHeight) * barAreaHeight) + 1 - barAreaBottomOffset,
        barWidth,
        ~~(a.relativeSellHeight * barAreaHeight)
      );

      ctx.fillStyle = buyColor;
      ctx.fillRect(
        xPos + barOffsetX,
        ~~(height - a.relativeBuyHeight * barAreaHeight) - barAreaBottomOffset,
        barWidth,
        ~~(a.relativeBuyHeight * barAreaHeight)
      );
    }

    return { min: 0, max: maxVolume };
  }

  private _drawDeltaVolumeBars({
    barAreaHeight,
    barAreaBottomOffset,
  }: {
    barAreaHeight: number;
    barAreaBottomOffset: number;
  }): { min: number; max: number } {
    const totalVolumes: number[] = [];

    // Aggregate footprint data before normalization
    for (const candleRenderInfo of this._tsInfo) {
      const footprints = this._filteredFootprints.filter((fp) => fp.timestamp === candleRenderInfo.candle.timestamp);

      let totalVolume = 0;

      for (const fp of footprints) {
        totalVolume += fp.size * (fp.side === "buy" ? 1 : -1);
      }

      totalVolumes.push(totalVolume);
    }

    const maxVolume = max(totalVolumes)!;
    const minVolume = min(totalVolumes)!;

    const span = maxVolume - minVolume;
    const zeroRelativeHeight = -minVolume / span;

    // Determine bar dimensions and offset
    const barBbox = this._datapointWidth;
    const barWidth = barBbox * 0.8;
    const barOffsetX = (barBbox - barWidth) / 2;

    for (let i = 0; i < totalVolumes.length; i++) {
      const volume = totalVolumes[i];

      const xPos = i * barBbox + this._getSmoothScalingChartPositionOffset() + this._measurements.panOriginatedXOffset;

      const yPos = this.canvas.clientHeight - zeroRelativeHeight * barAreaHeight - barAreaBottomOffset;

      const barHeight = (volume / span) * barAreaHeight;

      this._ctx.fillStyle = volume > 0 ? "#5fe772" : "#f0567c";
      this._ctx.fillRect(xPos + barOffsetX, yPos, barWidth, -barHeight);

      // Draw size text
      // this._ctx.fillStyle = 'white';
      // this._ctx.font = '10px Monospace';
      // this._ctx.textAlign = 'center';
      // this._ctx.fillText(volume.toFixed(0), xPos + barBbox / 2, yPos - 5);
    }

    return { min: minVolume, max: maxVolume };
  }

  _drawTotalVolumeBars({
    barAreaHeight,
    barAreaBottomOffset,
  }: {
    barAreaHeight: number;
    barAreaBottomOffset: number;
  }): { min: number; max: number } {
    const totalVolumes: number[] = [];

    for (const candleRenderInfo of this._tsInfo) {
      const footprints = this._filteredFootprints.filter((fp) => fp.timestamp === candleRenderInfo.candle.timestamp);

      let totalVolume = 0;

      for (const fp of footprints) {
        totalVolume += fp.size;
      }

      totalVolumes.push(totalVolume);
    }

    const maxTotalVolume = max(totalVolumes)!;
    const minTotalVolume = min(totalVolumes)!;

    const barBbox = this._datapointWidth;
    const barWidth = barBbox * 0.8;
    const barOffsetX = (barBbox - barWidth) / 2;

    for (let i = 0; i < totalVolumes.length; i++) {
      const volume = totalVolumes[i];

      const xPos = i * barBbox + this._getSmoothScalingChartPositionOffset() + this._measurements.panOriginatedXOffset;

      const yPos = this.canvas.clientHeight - barAreaBottomOffset;
      const normalizedVolume = volume / maxTotalVolume;
      const barHeight = normalizedVolume * barAreaHeight;

      this._ctx.fillStyle = this.#mapVolumeToColor(volume, minTotalVolume, maxTotalVolume);
      this._ctx.fillRect(xPos + barOffsetX, yPos, barWidth, -barHeight);
    }

    return { min: 0, max: maxTotalVolume };
  }

  drawScaleX() {
    const height = this._xScaleHeight;

    // Background
    this._ctx.fillStyle = this._bgColor;
    this._ctx.fillRect(0, this.canvas.clientHeight - height, this.canvas.clientWidth, height);

    // Line
    const lineY = this.canvas.clientHeight - height;
    const width = this._chartAreaRight;

    this._ctx.fillStyle = this._scaleTextColor;
    this._ctx.font = "10px sans-serif";
    this._ctx.textAlign = "center";
    this._ctx.textBaseline = "middle";

    this._ctx.fillRect(0, lineY, width, 1);

    // For each timestamp draw a tick and a text
    const textOffsetY = height / 2 + 4;

    for (const tsInfo of this._tsInfo) {
      const { centerX, ts } = tsInfo;

      this._ctx.fillRect(centerX, lineY, 1, 6);

      const gmtFormatted = dayjs.utc(ts).format("hh:mm A");

      this._ctx.fillText(gmtFormatted, centerX, lineY + textOffsetY);
    }
  }

  #drawOrderBook() {
    const left = this.liveOrderBookAreaLeft;
    const squareSpacing = 2;

    const restingOrdersCellWidth = this._liveRightAreaWidth * (4 / 6) - squareSpacing;
    const ofiAndActivityWidth = this._liveRightAreaWidth * (1 / 6) - squareSpacing;
    const binHeight = this._priceStepPx - 2;

    this._measurements.restingOrderCellWidth = restingOrdersCellWidth;

    const visibleObEntries = pickBy(this._orderBookData, (value, key) => {
      const price = parseFloat(key);
      return price >= this._shownMinPrice && price <= this._shownMaxPrice;
    });

    const maxAbsRestingOrder = Math.max(...Object.values(visibleObEntries).map((data) => Math.abs(data.dom)));
    this._restingOrderColorScale.domain([-maxAbsRestingOrder, 0, maxAbsRestingOrder]).exponent(0.5);

    const maxAbsFlow = Math.max(...Object.values(visibleObEntries).map((data) => Math.abs(data.flow)));
    this._flowColorScale.domain([-maxAbsFlow, 0, maxAbsFlow]);

    const maxAbsDelta = Math.max(...Object.values(visibleObEntries).map((data) => Math.abs(data.delta)));
    this._deltaColorScale.domain([-maxAbsDelta, 0, maxAbsDelta]);

    for (const [priceStr, bookData] of Object.entries(this._orderBookData)) {
      const price = parseFloat(priceStr);
      const top = this.#getPriceTickY(price) - binHeight / 2;

      // Resting orders
      this._ctx.fillStyle = this._restingOrderColorScale(bookData.dom);
      this._ctx.fillRect(left, top, restingOrdersCellWidth, binHeight);

      // Order flow
      this._ctx.fillStyle = this._flowColorScale(bookData.flow);
      this._ctx.fillRect(left + restingOrdersCellWidth + squareSpacing, top, ofiAndActivityWidth, binHeight);

      // Delta
      this._ctx.fillStyle = this._deltaColorScale(bookData.delta);
      this._ctx.fillRect(
        left + restingOrdersCellWidth + ofiAndActivityWidth + 2 * squareSpacing,
        top,
        ofiAndActivityWidth,
        binHeight
      );

      // this._ctx.fillStyle = 'red';
      // this._ctx.fillRect(
      // 	this._chartAreaRight +
      // 		this._priceTickLineLeftMargin +
      // 		this._tickLineWidth +
      // 		this._tickLineTextSpacing +
      // 		this._maxPriceTextWidth,
      // 	0,
      // 	1,
      // 	this.canvas.clientHeight
      // );
    }
  }

  #drawDebug() {
    const ctx = this._ctx;

    ctx.fillStyle = "red";
    ctx.font = "10px Monospace";
    ctx.textAlign = "left";
    ctx.textBaseline = "top";

    const lines = this._debugText.split("\n");
    const y = 0;

    for (let i = 0; i < lines.length; i++) {
      ctx.fillText(lines[i], 10, y + i * 10);
    }

    // ctx.fillRect(
    // 	0,
    // 	0,
    // 	this.canvas.clientWidth * (this._debugDrawCount / this._debugDrawCountMax),
    // 	10
    // );
    // this._debugDrawCount += 1;
    // this._debugDrawCount %= this._debugDrawCountMax;
  }

  #drawSigmaScale() {
    const lineX = this.liveOrderBookAreaLeft + this._measurements.restingOrderCellWidth;
    const lineY = this.canvas.clientHeight - this._xScaleHeight;

    const tickLength = 8;
    const tickLineTextSpacing = 8;
    const sigmaValueSpacing = 1;
    const barWidth = 35;

    // Line
    this._ctx.fillStyle = this._scaleTextColor;
    this._ctx.fillRect(lineX, lineY, 1, -this._measurements.bottomVolumeAreaScaleHeight);

    // Calculate tick positions
    const maxSigma = 6;
    const minSigma = -maxSigma;
    const tickPositions = new Map<number, number>();

    const scaleHeight = this._measurements.bottomVolumeAreaScaleHeight;
    const scaleBot = lineY;
    const scaleTop = lineY - scaleHeight;
    const zeroTickY = scaleBot - (scaleBot - scaleTop) * 0.5;

    tickPositions.set(0, zeroTickY);

    for (let i = minSigma; i <= maxSigma; i++) {
      const normalized = (i - minSigma) / (maxSigma - minSigma);
      const y = scaleBot - normalized * (scaleBot - scaleTop);

      tickPositions.set(i, y);
    }

    // Draw ticks
    this._ctx.textBaseline = "middle";

    for (const [sigma, y] of tickPositions) {
      this._ctx.fillRect(lineX, y, -tickLength, 1);
      this._ctx.fillText(sigma.toString(), lineX - tickLength - sigmaValueSpacing - tickLineTextSpacing, y);
    }

    // Draw sigma bar
    const pixelsPerSigma = (scaleBot - scaleTop) / (maxSigma - minSigma);
    const barHeight = this._last_z * pixelsPerSigma * -1;
    const textPaddingY = this._last_z > 0 ? 3 : -5;

    this._ctx.fillStyle = (this._last_z > 0 ? this._themeGreen : this._themeRed) + "99";
    this._ctx.fillRect(lineX + 2, zeroTickY, barWidth, barHeight);

    // Draw sigma text
    this._ctx.fillStyle = this._scaleTextColor;
    this._ctx.textAlign = "center";
    this._ctx.font = "9px Arial";
    this._ctx.textBaseline = this._last_z > 0 ? "top" : "bottom";
    this._ctx.fillText(`${this._last_z.toFixed(2)}\u03C3`, lineX + barWidth / 2, zeroTickY + textPaddingY);
  }

  #drawPocs() {
    if (this._data.length === 0) {
      return;
    }

    const pad = 2;

    this._ctx.textAlign = "right";
    this._ctx.textBaseline = "hanging";

    const lastTs = this._data[this._data.length - 1].candle.timestamp;
    const mostRecentVisibleTs = this._visibleCandles[this._visibleCandles.length - 1].timestamp;

    for (const pocHelper of this._pocHelpers) {
      const y = this.#getPriceTickY(pocHelper.price) - this._priceStepPx / 2;

      const drawAtTimestamps = this._footprintTimestamps.filter((t) => t > pocHelper.fromTs && t < pocHelper.toTs);

      let reachesLastCandle = false;

      this._ctx.fillStyle = this._colors.nPocColor;

      for (const ts of drawAtTimestamps) {
        const x = this.#getDatapointtLeft(ts) - this._candelWidth;

        this._ctx.fillRect(x + pad, y + pad, this._datapointWidth - pad, this._priceStepPx - pad);

        if (ts === lastTs) {
          reachesLastCandle = true;
        }
      }

      if (reachesLastCandle && pocHelper.fromTs < mostRecentVisibleTs) {
        // Draw text with volume
        this._ctx.fillStyle = this._colors.nPocTextColor;

        const text = humanizeNumber(pocHelper.vol) + " nPOC";
        const textY = y + this._priceStepPx / 2;
        const pad = 6;
        const maxW =
          pocHelper.fromTs + this._timestempMs === mostRecentVisibleTs
            ? this._measurements.panOriginatedXOffset * -1 - pad * 2
            : this._datapointWidth;

        this._ctx.fillText(text, this._chartAreaRight - pad, textY - 2, maxW);
      }
    }
  }

  private _drawAll() {
    const canvas = this.canvas;
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      throw new Error("Canvas rendering context not available");
    }

    this._ctx = ctx;

    if (this.canvas.clientWidth === 0 || this.canvas.clientHeight === 0) {
      console.debug("Canvas width or height is 0, skipping rendering");
      return;
    }

    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Resize canvas to its element size and account for device pixel ratio
    const dpr = window.devicePixelRatio || 1;
    canvas.width = canvas.clientWidth * dpr;
    canvas.height = canvas.clientHeight * dpr;
    ctx.scale(dpr, dpr);

    // Update calculations
    this.#updatePocs();

    // Draw stuff
    this.drawBackground();

    this.updatePriceTicksToRender();

    this.drawCandlesticks(this._visibleCandles);
    this.drawFootprints();
    this.#drawPocs();

    this.drawRightAreaBg();
    this.drawPriceTicks();
    this.drawCurrentPrice();

    this.drawScaleX();

    this.#drawRightSideVolumeArea();
    this.#drawOrderBook();

    this.#drawBottomVolumeArea();
    this.#drawSigmaScale();

    this.#drawDebug();
  }

  // ----------- End of drawing functions -----------

  autoAdjustDatapointWidth() {
    this._autoAdjustWidthRequested = true;
  }

  #autoAdjustDatapointWidth() {
    const width = this._chartAreaRight;

    this._nDatapointsShown = width / this._autoAdjustDatapointPixelsTarget;

    this.#updateMeasurements();
  }

  #pointInTimeFromCanvasX(x: number): number {
    const nPannedDatapointsFract = this._xPanOffsetPx / this._datapointWidth;
    const pannedDurationMs = nPannedDatapointsFract * this._timestempMs;
    const rightSideTimestamp =
      this._data[this._data.length - 1].candle.timestamp + Math.floor(this._timestempMs / 2) - pannedDurationMs;
    const leftSideTimestamp = rightSideTimestamp - this._timestempMs * this._nDatapointsShown;

    const normalizedPointerPos = x / this._chartAreaRight;
    const tsAtPointer = (rightSideTimestamp - leftSideTimestamp) * normalizedPointerPos + leftSideTimestamp;

    return tsAtPointer;
  }

  #calcXPanOffsetPx(x: number, tsAtX: number): number {
    // This is just solved equation from pointInTimeFromCanvasX for xPanOffset variable
    const xPanOffsetPx =
      (this._datapointWidth *
        (this._data[this._data.length - 1].candle.timestamp +
          this._timestempMs / 2 -
          this._timestempMs * this._nDatapointsShown +
          (x / this._chartAreaRight) * (this._timestempMs * this._nDatapointsShown) -
          tsAtX)) /
      this._timestempMs;

    return xPanOffsetPx;
  }

  #handleModeChange(event: PointerEvent) {
    const isInsideBarArea = event.clientY > this.canvas.clientHeight * (1 - this._barAreaHeightNormalized);

    if (isInsideBarArea) {
      this.cycleBarAreaDisplayMode();
      return;
    }

    const isInsideChartArea = event.clientY < this.chartAreaHeight && event.clientX < this._chartAreaRight;

    if (isInsideChartArea) {
      this.cycleFootprintDisplayMode();
      return;
    }

    const isInRightVolumeArea = event.clientX > this.rightVolAreaLeft && event.clientY < this.chartAreaHeight;

    if (isInRightVolumeArea) {
      this.cycleRightSideVolumeMode();
    }
  }

  cycleBarAreaDisplayMode() {
    this._barAreaDisplayMode = getNextFromArray(barAreaDisplayModes, this._barAreaDisplayMode);
  }

  cycleFootprintDisplayMode() {
    this._footprintDisplayMode = getNextFromArray(footprintDisplayModes, this._footprintDisplayMode);
  }

  cycleRightSideVolumeMode() {
    this._rightSideVolumeMode = getNextFromArray(rightSideVolumeModes, this._rightSideVolumeMode);
  }

  moveTsToPixel(xPixel: number, ts: number) {
    this._xPanOffsetPx = Math.max(0, this.#calcXPanOffsetPx(xPixel, ts));

    this.#updateMeasurements();
  }

  #onNewPrice(newPrice: number) {
    this._livePrice = newPrice;

    this.#updateLastCandle(newPrice);
    this._highlightFootprintPrice = newPrice;

    this.#scheduleRedraw();
  }

  #onFootprintUpdate(data: FootprintUpdateData) {
    if (!this._data.length) {
      return;
    }

    if (this._timeIntervalMs) {
      const lastCandle = this._data[this._data.length - 1].candle;
      const nextCandleTs = lastCandle.timestamp + this._timeIntervalMs;
      const currentTs = new Date().valueOf();

      const remainingTime = nextCandleTs - currentTs;

      const isLastCandleClosed = lastCandle.close !== lastCandle.open;

      if (remainingTime <= 0 && isLastCandleClosed) {
        this._data.push({
          candle: {
            timestamp: nextCandleTs,
            open: lastCandle.close,
            high: lastCandle.close,
            low: lastCandle.close,
            close: lastCandle.close,
            volume: 0,
            price_volume: 0,
            vwap: 0,
          },
          footprints: [],
        });
        this.#resetAcc();
      }
    }

    const { price, side, volume } = data;

    // Find footprint to update
    const lastDatapoint = this._data[this._data.length - 1];

    let footprintExists = false;

    for (const footprint of lastDatapoint.footprints) {
      if (footprint.price === price && footprint.side === side) {
        footprint.size += volume;
        footprintExists = true;
        break;
      }
    }

    if (!footprintExists) {
      lastDatapoint.footprints.push({
        timestamp: lastDatapoint.candle.timestamp,
        price,
        side,
        size: volume,
      });

      this._cacheData();
      this.#updateVisibleData();
    }

    this._footprintHighlightSide = side;

    this.#scheduleRedraw();
  }

  #onOrderBookUpdate(data: OrderBookUpdateData) {
    const priceBins: { [price: number]: OrderBookUpdateDataItem[] } = {};

    for (const item of data) {
      const binPrice = Math.round(item.price / this._priceStep) * this._priceStep;

      if (!priceBins[binPrice]) {
        priceBins[binPrice] = [];
      }

      priceBins[binPrice].push(item);
    }

    for (const [binPriceStr, items] of Object.entries(priceBins)) {
      const binPrice = parseFloat(binPriceStr);

      let orderBookBin = this._orderBookData[binPrice];

      if (orderBookBin === undefined) {
        orderBookBin = {
          dom: 0,
          flow: 0,
          delta: 0,
        };

        this._orderBookData[binPrice] = orderBookBin;
      }

      orderBookBin.dom *= 0.95;
      orderBookBin.flow = 0;
      orderBookBin.delta = 0;

      for (const item of items) {
        const placedOrders = item.side === "buy" ? item.placedOrders : -item.placedOrders;

        orderBookBin.dom += placedOrders;
        orderBookBin.flow += item.smallOne;
        orderBookBin.delta += item.smallTwo;

        orderBookBin.delta /= 2;
      }
    }

    // console.clear();
    // console.log(this._orderBookData);

    // const debug = this._orderBookData['98200'];

    // console.log(debug?.dom);

    // for (const [price, item] of Object.entries(this._orderBookData)) {
    // 	const firstSide = item.sides[0];

    // 	for (const side of item.sides) {
    // 		if (side !== firstSide) {
    // 			console.log('Mixed on price: ', price);
    // 		}
    // 	}
    // }

    // this._debugText = JSON.stringify(data, null, 4);

    this.#scheduleRedraw();
  }

  #binFootprintsByPrice() {
    const priceBins: { [price: number]: FootprintData[] } = {};

    for (const footprint of this._cachedFootprintData) {
      const binPrice = Math.floor(footprint.price / this._priceStep) * this._priceStep;

      if (!priceBins[binPrice]) {
        priceBins[binPrice] = [];
      }

      priceBins[binPrice].push(footprint);
    }

    return priceBins;
  }

  #updateLastCandle(currentPrice: number) {
    if (!this._data.length) {
      return;
    }

    const candle = this._data[this._data.length - 1].candle;

    candle.close = currentPrice;

    if (currentPrice > candle.high) {
      candle.high = currentPrice;
    }

    if (currentPrice < candle.low) {
      candle.low = currentPrice;
    }

    this._cacheData();
  }

  #scheduleRedraw() {
    if (this._redrawScheduled) {
      return;
    }

    this._redrawScheduled = true;

    requestAnimationFrame(() => {
      this._drawAll();
      this._redrawScheduled = false;
    });
  }

  #resetAcc() {
    this._acc = { n: 0, size_sq: 0, volume: 0 };
  }

  #onAccUpdate(data: AccUpdateData) {
    if (!this._acc) {
      this.#resetAcc();
    }

    const acc = this._acc!;

    acc.n += data.n;
    acc.size_sq += data.size_sq;
    acc.volume += data.vol;

    this.#updateLastZ({ lastVol: data.vol, lastNTrades: data.n });
  }

  #updateLastZ({ lastVol, lastNTrades }: { lastVol: number; lastNTrades: number }) {
    const lastVolPerTrade = lastVol / lastNTrades;

    const acc = this._acc!;
    const mean = acc.volume / acc.n;

    const variance = acc.n > 1 ? (acc.size_sq - acc.volume ** 2 / acc.n) / (acc.n - 1) : null;
    const stddev = variance ? Math.sqrt(variance) : null;

    if (variance && stddev) {
      this._last_z = (lastVolPerTrade - mean) / stddev;
    } else {
      this._last_z = 0;
    }
  }

  #updatePocs() {
    this._pocHelpers = [];

    type TradedVol = nPocData;

    const tradedVols: TradedVol[] = [];

    // Calculate volume matrix: timestamp x price_bin
    for (const datapoint of this._data) {
      for (const fp of datapoint.footprints) {
        let tradedVol: TradedVol | null =
          tradedVols.find((tv) => tv.ts === datapoint.candle.timestamp && tv.price === fp.price) || null;
        if (!tradedVol) {
          tradedVol = {
            ts: datapoint.candle.timestamp,
            price: fp.price,
            vol: 0,
          };
          tradedVols.push(tradedVol);
        }
        tradedVol.vol += fp.size;
      }
    }

    // Keep only items with highest volumes for each timestamp
    const highestVolumes: TradedVol[] = [];

    for (const tradedVol of tradedVols) {
      const existing = highestVolumes.find((tv) => tv.ts === tradedVol.ts);
      if (!existing) {
        highestVolumes.push(tradedVol);
      } else if (tradedVol.vol > existing.vol) {
        existing.vol = tradedVol.vol;
        existing.price = tradedVol.price;
      }
    }

    // For each highest volume, find until which timestamp it was not visited
    for (const highVol of highestVolumes) {
      let revisitedAt = highVol.ts;

      datapointLooper: for (const datapoint of this._data) {
        revisitedAt = datapoint.candle.timestamp;

        for (const fp of datapoint.footprints) {
          if (fp.price === highVol.price && datapoint.candle.timestamp > highVol.ts) {
            break datapointLooper;
          }
        }

        // Extend to last footprint
        revisitedAt += 1;
      }

      this._pocHelpers.push({
        price: highVol.price,
        fromTs: highVol.ts,
        toTs: revisitedAt,
        vol: highVol.vol,
      });
    }
  }

  #updateMeasurements() {
    this._measurements.panOriginatedXOffset = this._xPanOffsetPx - (this._nPannedDatapoints + 1) * this._datapointWidth;
  }
}
