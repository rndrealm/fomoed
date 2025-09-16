"use client";
import React, {
  ReactNode,
  useEffect,
  useRef,
  useState,
  useMemo,
  useCallback,
  Dispatch,
  SetStateAction,
  Fragment,
} from "react";
import {
  CandlestickSeries,
  Chart,
  HistogramSeries,
  SeriesApiRef,
  TimeScale,
  TimeScaleApiRef,
  TimeScaleFitContentTrigger,
  AreaSeries,
} from "lightweight-charts-react-components";
import {
  CandlestickData,
  ColorType,
  Coordinate,
  LineData,
  LineType,
  MouseEventParams,
  Time,
  HistogramData,
} from "lightweight-charts";
import { RenderIf } from "@/components/shared";
import { useFetchBinancePriceData } from "@/services/queries/charts";
import { formatPriceSignificant } from "@/lib/utils";
import { useAtomValue } from "jotai";
import { geoLocationAtom } from "@/lib/atoms/geoLocation";
import { AnimatePresence } from "motion/react";
import PriceChartCoinStats from "./coin-stats";
import { Spinner } from "@/components/ui/shadcn-io/spinner";
import { getBinanceWsServerUrl, throwFailedToConnectBinanceWsError } from "@/lib/utils/binance-client.utils";

const logKey = "[TestChart]:"

export interface BinanceKlineFormatted {
  time: number; // seconds
  open: number;
  high: number;
  low: number;
  close: number;
}

interface ITooltip {
  x: number | null;
  y: number | null;
  show: boolean;
  children: ReactNode;
  width: number;
  height: number;
}

interface IProps {
  isCandleStick?: boolean;
  token?: string;
  period?: any;
  selectedPeriod: string;
  showTokenStats: boolean;
  setShowTokenStats: Dispatch<SetStateAction<boolean>>;
  className?: string;
}

const toolTipWidth = 320;
const toolTipHeight = 80;
const toolTipMargin = 25;

function TestChart(props: IProps) {
  const {
    isCandleStick = false,
    period,
    selectedPeriod,
    showTokenStats,
    setShowTokenStats,
    token = "BTC",
    className = "",
  } = props;

  const location = useAtomValue(geoLocationAtom);
  const { data: historicalData = [], isLoading } = useFetchBinancePriceData(`${token}USDT`, period?.binanceInterval, 1000, location?.country);

  // State management
  const [dimension, setDimension] = useState({ width: 0, height: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const [lastPeriod, setLastPeriod] = useState(selectedPeriod);
  const [additionalData, setAdditionalData] = useState<(LineData | CandlestickData)[]>([]);
  const [isWebSocketPaused, setIsWebSocketPaused] = useState(false);
  const [userHasZoomed, setUserHasZoomed] = useState(false);

  // Handle period change
  useEffect(() => {
    if (lastPeriod !== selectedPeriod) {
      // Reset chart state
      setUserHasZoomed(false);
      setIsWebSocketPaused(true);
      defaultZoomRangeRef.current = null;
      visibleLogicalRangeRef.current = null;
      setAdditionalData([]);
      setLastPeriod(selectedPeriod);
    }
  }, [selectedPeriod, lastPeriod]);

  useEffect(() => {
    if (!isLoading && historicalData.length > 0) {
      setIsWebSocketPaused(false);
    }
  }, [isLoading, historicalData]);

  // Refs
  const chartContainerRef = useRef<HTMLDivElement>(null);
  // const volumeContainerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const lineSeriesRef = useRef<SeriesApiRef<"Area">>(null);
  const candleSeriesRef = useRef<SeriesApiRef<"Candlestick">>(null);
  // const volumeSeriesRef = useRef<SeriesApiRef<"Histogram">>(null);
  const timeScaleRef = useRef<TimeScaleApiRef>(null);
  // const volumeTimeScaleRef = useRef<TimeScaleApiRef>(null);
  const dataRef = useRef<(LineData | CandlestickData)[]>([]);
  const wsRef = useRef<WebSocket | null>(null);
  
  // Range management refs
  const defaultZoomRangeRef = useRef<{ from: number; to: number } | null>(null);
  const visibleRangeRef = useRef<{ from?: Time; to?: Time; } | null>(null);
  const visibleLogicalRangeRef = useRef<{ from?: number; to?: number; } | null>(null);

  // Utility functions
  const getIntervalMinutes = (interval: string) => {
    const unit = interval.slice(-1);
    const value = parseInt(interval.slice(0, -1));
    switch (unit) {
      case "m": return value;
      case "h": return value * 60;
      case "d": return value * 1440;
      default: return 60;
    }
  };

  const fullData = useMemo(() => {
    const combined = [...historicalData, ...additionalData];
    // Sort by time and remove duplicates (keep the latest entry for each time)
    return combined
      .sort((a, b) => (a.time as number) - (b.time as number))
      .filter((item, index, self) =>
        index === self.findIndex((t) => (t.time as number) === (item.time as number))
      );
  }, [historicalData, additionalData]);

  // Data filtering
  const filteredData = useMemo(() => {
    if (!fullData.length) return [];

    const now = new Date();

    let cutoffDate: Date;

    switch (selectedPeriod) {
      case "1D":
        cutoffDate = new Date(now);
        cutoffDate.setHours(0, 0, 0, 0);
        const filteredDailyData = fullData
          .filter((d) => (d.time as number) * 1000 >= cutoffDate.getTime())
          .sort((a, b) => (a.time as number) - (b.time as number)); // Ensure sorted

        // const intervalMinutes = getIntervalMinutes(period?.binanceInterval);
        // if (intervalMinutes <= 5 && filteredDailyData.length > 288) {
        //   filteredDailyData = filteredDailyData.slice(-288); // Take last 288 after sorting
        // } else if (intervalMinutes <= 15 && filteredDailyData.length > 96) {
        //   filteredDailyData = filteredDailyData.slice(-96);
        // }

        return filteredDailyData;

      case "1W":
        cutoffDate = new Date(now);
        cutoffDate.setDate(now.getDate() - 7);
        break;

      case "1M":
        cutoffDate = new Date(now);
        cutoffDate.setMonth(now.getMonth() - 1);
        break;

      case "3M":
        cutoffDate = new Date(now);
        cutoffDate.setMonth(now.getMonth() - 3);
        break;

      case "6M":
        cutoffDate = new Date(now);
        cutoffDate.setMonth(now.getMonth() - 6);
        break;

      case "1Y":
        cutoffDate = new Date(now);
        cutoffDate.setFullYear(now.getFullYear() - 1);
        break;

      case "YTD":
        cutoffDate = new Date(now.getFullYear(), 0, 1);
        break;

      default:
        return fullData.sort((a, b) => (a.time as number) - (b.time as number)); // Sort all data
    }

    const cutoff = cutoffDate.getTime();
    return fullData
      .filter((d) => (d.time as number) * 1000 >= cutoff)
      .sort((a, b) => (a.time as number) - (b.time as number)); // Ensure sorted
  }, [fullData, selectedPeriod]);

  // Volume data
  const volumeData: HistogramData<Time>[] = useMemo(() => {
    if (!filteredData || filteredData.length === 0) return [];

    return filteredData.map((candle) => ({
      time: candle.time as Time,
      value: Number((candle as any).volume || 0),
      color: "#5C5C5C",
    }));
  }, [filteredData]);

  // Aggregated or thinned data for 1D with small intervals
  const aggregatedData = useMemo(() => {
    if (selectedPeriod !== "1D") return filteredData;

    const intervalMin = getIntervalMinutes(period?.binanceInterval || "1m");
    const maxPoints = 1000;
    const theoreticalPoints = Math.ceil(1440 / intervalMin);

    // Only thin if the interval is larger than 1m or points exceed maxPoints
    if (intervalMin === 1 && theoreticalPoints <= maxPoints) {
      return filteredData; // No thinning for 1m if within 300 points
    }

    const thinningFactor = theoreticalPoints > maxPoints ? Math.ceil(theoreticalPoints / maxPoints) : 1;

    if (!isCandleStick) {
      // For line/area, thin by taking every thinningFactor point
      return filteredData.filter((_, i) => i % thinningFactor === 0);
    } else {
      // For candlestick, aggregate OHLC
      const aggregated: CandlestickData[] = [];
      for (let i = 0; i < filteredData.length; i += thinningFactor) {
        const bin = filteredData.slice(i, i + thinningFactor) as CandlestickData[];
        if (bin.length === 0) break;
        const open = bin[0].open;
        const close = bin[bin.length - 1].close;
        const high = Math.max(...bin.map((d) => d.high));
        const low = Math.min(...bin.map((d) => d.low));
        const time = bin[0].time;
        aggregated.push({ time, open, high, low, close });
      }
      return aggregated;
    }
  }, [filteredData, selectedPeriod, period?.binanceInterval, isCandleStick]);

  // Transform aggregatedData to BinanceKlineFormatted for PriceChartCoinStats
  const statsData: BinanceKlineFormatted[] = useMemo(() => {
    return aggregatedData.map((item) => {
      if (isCandleStick) {
        const candlestick = item as CandlestickData;
        return {
          time: candlestick.time as number,
          open: candlestick.open,
          high: candlestick.high,
          low: candlestick.low,
          close: candlestick.close,
        };
      } else {
        const lineData = item as LineData;
        return {
          time: lineData.time as number,
          open: lineData.value,
          high: lineData.value,
          low: lineData.value,
          close: lineData.value,
        };
      }
    });
  }, [aggregatedData, isCandleStick]);

  // Calculate performance metrics
  const performanceMetrics = useMemo(() => {
    if (!aggregatedData.length) {
      return {
        isPositive: true,
        change: 0,
        changePercent: 0,
        currentPrice: 0,
        startPrice: 0,
        high: 0,
        low: 0,
      };
    }

    const currentPrice = isCandleStick
      ? (aggregatedData[aggregatedData.length - 1] as CandlestickData)?.close || 0
      : (aggregatedData[aggregatedData.length - 1] as any)?.value || 0;

    const startPrice = isCandleStick
      ? (aggregatedData[0] as CandlestickData)?.open || 0
      : (aggregatedData[0] as any)?.value || 0;

    const change = currentPrice - startPrice;
    const changePercent = startPrice ? (change / startPrice) * 100 : 0;

    return {
      isPositive: change >= 0,
      change,
      changePercent,
      currentPrice,
      startPrice,
      high: Math.max(...aggregatedData.map((d) => (isCandleStick ? (d as CandlestickData).high : (d as any).value))),
      low: Math.min(...aggregatedData.map((d) => (isCandleStick ? (d as CandlestickData).low : (d as any).value))),
    };
  }, [aggregatedData, isCandleStick]);

  const oneYearMetrics = useMemo(() => {
    if (!historicalData.length) return { high: 0, low: 0 };

    const now = new Date();
    const cutoffDate = new Date(now);
    cutoffDate.setFullYear(now.getFullYear() - 1);
    const cutoff = cutoffDate.getTime();

    const lastYearData = historicalData.filter((d) => (d.time as number) * 1000 >= cutoff);
    if (!lastYearData.length) return { high: 0, low: 0 };

    return {
      high: Math.max(...lastYearData.map((d) => (isCandleStick ? (d as CandlestickData).high : (d as any).value))),
      low: Math.min(...lastYearData.map((d) => (isCandleStick ? (d as CandlestickData).low : (d as any).value))),
    };
  }, [historicalData, isCandleStick]);

  // Chart colors based on performance
  const chartColors = useMemo(() => ({
    lineColor: isHovering ? "#6B88CA" : performanceMetrics.isPositive ? "#17C583" : "#BD2E36",
    upColor: "#17C583",
    downColor: "#BD2E36",
    borderUpColor: "#17C583",
    borderDownColor: "#BD2E36",
    wickUpColor: "#17C583",
    wickDownColor: "#BD2E36",
  }), [isHovering, performanceMetrics.isPositive]);

  // const syncVolumeRange = useCallback((newRange: { from: number; to: number } | null) => {
  //   if (newRange && volumeTimeScaleRef.current?.api()) {
  //     volumeTimeScaleRef.current.api()?.setVisibleLogicalRange(newRange);
  //   }
  // }, []);

  // Calculate initial range on mount and when period changes
  useEffect(() => {
    if (!aggregatedData.length) return;

    const calculateRange = () => {
      if (selectedPeriod === "1D") {
        const intervalMin = getIntervalMinutes(period?.binanceInterval || "1m");
        const maxPoints = 300;
        const theoreticalPoints = Math.ceil(1440 / intervalMin);
        const thinningFactor = theoreticalPoints > maxPoints ? Math.ceil(theoreticalPoints / maxPoints) : 1;
        const effectiveInterval = intervalMin * thinningFactor;
        const totalPoints = Math.ceil(1440 / effectiveInterval);
        return {
          from: 0,
          to: totalPoints
        };
      } else {
        return {
          from: 0,
          to: aggregatedData.length
        };
      }
    };

    const range = calculateRange();
    defaultZoomRangeRef.current = range;
    visibleLogicalRangeRef.current = range;

    requestAnimationFrame(() => {
      if (timeScaleRef.current?.api()) {
        timeScaleRef.current.api()?.setVisibleLogicalRange(range);
      }
      // if (volumeTimeScaleRef.current?.api()) {
      //   volumeTimeScaleRef.current.api()?.setVisibleLogicalRange(range);
      // }
    });
  }, [selectedPeriod, aggregatedData.length, period?.binanceInterval]);

  // Update visible range periodically for daily chart
  useEffect(() => {
    if (selectedPeriod !== "1D") return;

    const updateRange = () => {
      if (userHasZoomed) {
        return;
      }
      const intervalMin = getIntervalMinutes(period?.binanceInterval || "1m");
      const maxPoints = 300;
      const theoreticalPoints = Math.ceil(1440 / intervalMin);
      const thinningFactor = theoreticalPoints > maxPoints ? Math.ceil(theoreticalPoints / maxPoints) : 1;
      const effectiveInterval = intervalMin * thinningFactor;
      const totalPoints = Math.ceil(1440 / effectiveInterval);

      const defaultFrom = 0;
      const defaultTo = totalPoints;

      defaultZoomRangeRef.current = { from: defaultFrom, to: defaultTo };
      visibleLogicalRangeRef.current = { from: defaultFrom, to: defaultTo };

      requestAnimationFrame(() => {
        if (timeScaleRef.current?.api()) {
          timeScaleRef.current.api()?.setVisibleLogicalRange({
            from: defaultFrom,
            to: defaultTo
          });
        }
        // if (volumeTimeScaleRef.current?.api()) {
        //   volumeTimeScaleRef.current.api()?.setVisibleLogicalRange({
        //     from: defaultFrom,
        //     to: defaultTo
        //   });
        // }
      });
    };

    updateRange();

    const intervalId = setInterval(updateRange, 1000);

    return () => clearInterval(intervalId);
  }, [selectedPeriod, period?.binanceInterval, userHasZoomed]);

  // Handle zoom restrictions
  const handleVisibleLogicalRangeChange = useCallback(
    (newRange: { from: number; to: number } | null) => {
      if (!newRange || !defaultZoomRangeRef.current) return;

      if (selectedPeriod === "1D") {
        const dataLength = aggregatedData.length;
        if (dataLength === 0) return;

        const intervalMin = getIntervalMinutes(period?.binanceInterval || "1m");
        const maxPoints = 300;
        const theoreticalPoints = Math.ceil(1440 / intervalMin);
        const thinningFactor = theoreticalPoints > maxPoints ? Math.ceil(theoreticalPoints / maxPoints) : 1;
        const effectiveInterval = intervalMin * thinningFactor;
        const totalPoints = Math.ceil(1440 / effectiveInterval);

        const isDefaultRange = newRange.from === 0 && newRange.to === totalPoints;
        if (!isDefaultRange) {
          setUserHasZoomed(true);
        }

        const minVisibleRange = 10;
        const maxVisibleRange = totalPoints;

        let adjustedFrom = newRange.from;
        let adjustedTo = newRange.to;
        let currentRange = adjustedTo - adjustedFrom;

        if (currentRange < minVisibleRange) {
          const center = (adjustedFrom + adjustedTo) / 2;
          adjustedFrom = Math.max(0, center - minVisibleRange / 2);
          adjustedTo = adjustedFrom + minVisibleRange;
          currentRange = minVisibleRange;
        }

        if (currentRange > maxVisibleRange) {
          const center = (adjustedFrom + adjustedTo) / 2;
          adjustedFrom = Math.max(0, center - maxVisibleRange / 2);
          adjustedTo = adjustedFrom + maxVisibleRange;
        }

        if (adjustedFrom < 0) {
          adjustedTo -= adjustedFrom;
          adjustedFrom = 0;
        }

        if (adjustedTo > maxVisibleRange) {
          adjustedFrom -= (adjustedTo - maxVisibleRange);
          adjustedTo = maxVisibleRange;
          if (adjustedFrom < 0) {
            adjustedFrom = 0;
            adjustedTo = Math.min(maxVisibleRange, adjustedFrom + currentRange);
          }
        }

        timeScaleRef.current?.api()?.setVisibleLogicalRange({
          from: adjustedFrom,
          to: adjustedTo,
        });
        // syncVolumeRange({ from: adjustedFrom, to: adjustedTo });
        visibleLogicalRangeRef.current = { from: adjustedFrom, to: adjustedTo };
        return;
      }

      // Logic for other timeframes
      const dataLength = aggregatedData.length;
      const currentDataPoints = newRange.to - newRange.from;
      const maxAllowedDataPoints = dataLength;

      if (currentDataPoints > maxAllowedDataPoints) {
        const center = (newRange.from + newRange.to) / 2;
        const halfRange = maxAllowedDataPoints / 2;

        let adjustedFrom = Math.max(0, center - halfRange);
        let adjustedTo = Math.min(dataLength - 1, center + halfRange);

        if (adjustedFrom === 0) {
          adjustedTo = Math.min(dataLength - 1, maxAllowedDataPoints);
        } else if (adjustedTo === dataLength - 1) {
          adjustedFrom = Math.max(0, dataLength - maxAllowedDataPoints);
        }

        timeScaleRef.current?.api()?.setVisibleLogicalRange({
          from: adjustedFrom,
          to: adjustedTo,
        });
        // syncVolumeRange({ from: adjustedFrom, to: adjustedTo });
        return;
      }

      const minDataPoints = 10;
      if (currentDataPoints < minDataPoints) {
        const center = (newRange.from + newRange.to) / 2;
        const halfRange = minDataPoints / 2;

        timeScaleRef.current?.api()?.setVisibleLogicalRange({
          from: Math.max(0, center - halfRange),
          to: Math.min(dataLength - 1, center + halfRange),
        });
        // syncVolumeRange({
        //   from: Math.max(0, center - halfRange),
        //   to: Math.min(dataLength - 1, center + halfRange),
        // });
        return;
      }

      if (newRange.from < 0 || newRange.to >= dataLength) {
        const rangeSize = newRange.to - newRange.from;
        let adjustedFrom = newRange.from;
        let adjustedTo = newRange.to;

        if (newRange.from < 0) {
          adjustedFrom = 0;
          adjustedTo = rangeSize;
        }

        if (newRange.to >= dataLength) {
          adjustedTo = dataLength - 1;
          adjustedFrom = Math.max(0, adjustedTo - rangeSize);
        }

        timeScaleRef.current?.api()?.setVisibleLogicalRange({
          from: adjustedFrom,
          to: adjustedTo,
        });
        // syncVolumeRange({ from: adjustedFrom, to: adjustedTo });
        return;
      }

      visibleLogicalRangeRef.current = { from: newRange.from, to: newRange.to };
      // syncVolumeRange({ from: newRange.from, to: newRange.to });
    },
    [
      selectedPeriod,
      aggregatedData.length,
      period?.binanceInterval,
      // syncVolumeRange
    ],
  );

  useEffect(() => {
    if (!performanceMetrics.startPrice) return;

    let priceLine: any;
    const candleApi = candleSeriesRef.current?.api();
    const lineApi = lineSeriesRef.current?.api();

    if (isCandleStick && candleApi) {
      priceLine = candleApi.createPriceLine({
        price: performanceMetrics.startPrice,
        color: "#FFFFFF",
        lineWidth: 1,
        lineStyle: 2,
        axisLabelVisible: false,
      });
    }

    if (!isCandleStick && lineApi) {
      priceLine = lineApi.createPriceLine({
        price: performanceMetrics.startPrice,
        color: "#FFFFFF",
        lineWidth: 1,
        lineStyle: 2,
        axisLabelVisible: false,
      });
    }

    return () => {
      if (isCandleStick && candleApi && priceLine) {
        candleApi.removePriceLine(priceLine);
      }
      if (!isCandleStick && lineApi && priceLine) {
        lineApi.removePriceLine(priceLine);
      }
    };
  }, [performanceMetrics.startPrice, isCandleStick]);

  // Format price for OHLC display
  const formatOHLCPrice = (price: number) => {
    return formatPriceSignificant(price);
  };

  // Enhanced crosshair move handler with OHLC tooltip
  const onCrosshairMove = useCallback(
    (param: MouseEventParams<Time>) => {
      const container = chartContainerRef.current!;
      const tooltip = tooltipRef.current!;

      if (
        !param.point ||
        !param.time ||
        param.point.x < 0 ||
        param.point.x > container.clientWidth ||
        param.point.y < 0 ||
        param.point.y > container.clientHeight
      ) {
        tooltip.style.display = "none";
        setIsHovering(false);
        return;
      }

      setIsHovering(true);

      const data = {
        value: 0,
        time: Date.now(),
        open: 0,
        high: 0,
        low: 0,
        close: 0,
      };
      let coordinate: Coordinate | null | undefined;
      let hasValidData = false;

      if (lineSeriesRef.current) {
        const seriesApi = lineSeriesRef.current.api();
        if (seriesApi) {
          const res = param.seriesData.get(seriesApi) as LineData;
          if (res && res.time !== undefined && res.value !== undefined) {
            data.time = res.time as number;
            data.value = res.value;
            data.close = res.value;
            data.open = res.value;
            data.high = res.value;
            data.low = res.value;
            coordinate = lineSeriesRef.current.api()?.priceToCoordinate(data.value);
            hasValidData = true;
          }
        }
      }

      if (candleSeriesRef.current) {
        const seriesApi = candleSeriesRef.current.api();
        if (seriesApi) {
          const res = param.seriesData.get(seriesApi) as CandlestickData;
          if (res && res.time !== undefined && res.close !== undefined) {
            data.time = res.time as number;
            data.value = res.close;
            data.open = res.open;
            data.high = res.high;
            data.low = res.low;
            data.close = res.close;
            coordinate = candleSeriesRef.current.api()?.priceToCoordinate(data.value);
            hasValidData = true;
          }
        }
      }

      // Calculate change from start price
      if (!hasValidData) {
        tooltip.style.display = "none";
        setIsHovering(false);
        return;
      }
      const startPrice = performanceMetrics.startPrice;
      const change = data.close - startPrice;
      const dateObj = new Date(data.time * 1000);
      const formattedDate = dateObj.toLocaleDateString("en-US", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });

      tooltip.style.display = "flex";

      // Different tooltip for candlestick vs line chart
      if (isCandleStick) {
        // OHLC Tooltip for Candlestick
        const isGreen = data.close >= data.open;
        tooltip.innerHTML = `
        <div style="background: #1C1C1E; border-radius: 12px; padding: 14px; border: 1px solid #333; box-shadow: 0 8px 32px rgba(0,0,0,0.4); min-width: 280px;">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 13px;">
            <div style="display: flex; justify-content: space-between;">
              <span style="color: #888;">Open:</span>
              <span style="color: white; font-weight: 500;">${formatOHLCPrice(data.open)}</span>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span style="color: #888;">High:</span>
              <span style="color: #17C583; font-weight: 500;">${formatOHLCPrice(data.high)}</span>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span style="color: #888;">Close:</span>
              <span style="color: ${isGreen ? "#17C583" : "#BD2E36"}; font-weight: 500;">${formatOHLCPrice(data.close)}</span>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span style="color: #888;">Low:</span>
              <span style="color: #BD2E36; font-weight: 500;">${formatOHLCPrice(data.low)}</span>
            </div>
          </div>
        </div>
      `;
      } else {
        // Simple tooltip for line chart
        tooltip.innerHTML = `
        <div style="background: #1C1C1E; border-radius: 12px; padding: 12px; border: 1px solid #333; box-shadow: 0 8px 32px rgba(0,0,0,0.4);">
          <div style="color: ${change >= 0 ? "#17C583" : "#BD2E36"}; font-size: 16px; font-weight: 700; margin-bottom: 4px;">
            ${formatPriceSignificant(data.close)}
          </div>
          <div style="color: #888; font-size: 12px; text-align: center; margin-bottom: -4px">
            ${formattedDate}
          </div>
        </div>
      `;
      }

      if (!coordinate) return;

      let shiftedCoordinate = param.point.x - toolTipWidth / 2;
      shiftedCoordinate = Math.max(0, Math.min(container.clientWidth - toolTipWidth, shiftedCoordinate));

      const coordinateY =
        coordinate - toolTipHeight - toolTipMargin > 0
          ? coordinate - toolTipHeight - toolTipMargin
          : coordinate + toolTipMargin;

      tooltip.style.left = `${shiftedCoordinate}px`;
      tooltip.style.top = `${coordinateY}px`;
    },
    [performanceMetrics.startPrice, isCandleStick],
  );

  // Set default zoom range when data loads
  useEffect(() => {
    if (aggregatedData.length > 0 && !defaultZoomRangeRef.current) {
      const defaultFrom = Math.max(0, aggregatedData.length - 50);
      const defaultTo = aggregatedData.length - 1;
      defaultZoomRangeRef.current = { from: defaultFrom, to: defaultTo };
    }
  }, [aggregatedData]);

  useEffect(() => {
    if (aggregatedData.length > 0) {
      // Always recalculate default range when data changes
      const defaultFrom = Math.max(0, aggregatedData.length - 50);
      const defaultTo = aggregatedData.length - 1;

      defaultZoomRangeRef.current = { from: defaultFrom, to: defaultTo };

      // Reset visible range when data changes significantly
      if (!visibleLogicalRangeRef.current) {
        visibleLogicalRangeRef.current = { from: defaultFrom, to: defaultTo };
      }
    }
  }, [aggregatedData.length]);

  const handleMouseEnter = useCallback(() => {
    setIsHovering(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    if (tooltipRef.current) {
      tooltipRef.current.style.display = "none";
    }
    setIsHovering(false);
  }, []);

  useEffect(() => {
    // Guard clause to ensure all dependencies are available.
    if (!token || !period.binanceInterval || !location?.country) return;

    const handleKlineUpdate = (klineData: any) => {
      if (isWebSocketPaused || isLoading || !historicalData.length) {
        console.log("Update paused: loading or no historical data");
        return;
      }
      if (!klineData || !klineData.t) {
        console.warn("handleKlineUpdate received invalid kline data:", klineData);
        return;
      }

      const newData = {
        time: Math.floor(klineData.t / 1000),
        open: parseFloat(klineData.o),
        high: parseFloat(klineData.h),
        low: parseFloat(klineData.l),
        close: parseFloat(klineData.c),
        value: parseFloat(klineData.c),
        // volume: parseFloat(klineData.v),
      };

      if (selectedPeriod === "1D") {
        const now = Date.now();
        const dataTime = newData.time * 1000;

        if (newData.time > (now/1000) + 3600) { // Reject data more than 1 hour in the future
          console.warn("Rejecting future data:", newData.time);
          return;
        }

        if (now - dataTime <= 24 * 60 * 60 * 1000) {
          setAdditionalData((prev) => {
            if (prev.length && prev[prev.length - 1].time === newData.time) {
              return [...prev.slice(0, -1), newData as any];
            } else {
              return [...prev, newData as any];
            }
          });

          if ((lineSeriesRef.current || candleSeriesRef.current) && historicalData?.length) {
            if (isCandleStick) {
              candleSeriesRef.current?.api()?.update(newData as any);
            } else {
              lineSeriesRef?.current?.api()?.update(newData as any);
            }
            // volumeSeriesRef.current?.api()?.update({
            //   time: newData.time as Time,
            //   value: newData.volume,
            //   color: "#5C5C5C",
            // });
          }
        }
      } else {
        setAdditionalData((prev) => {
          if (prev.length && prev[prev.length - 1].time === newData.time) {
            return [...prev.slice(0, -1), newData as any];
          } else {
            return [...prev, newData as any];
          }
        });

        if ((lineSeriesRef.current || candleSeriesRef.current) && historicalData?.length) {
          if (isCandleStick) {
            candleSeriesRef.current?.api()?.update(newData as any);
          } else {
            lineSeriesRef?.current?.api()?.update(newData as any);
          }
          // volumeSeriesRef.current?.api()?.update({
          //   time: newData.time as Time,
          //   value: newData.volume,
          //   color: "#5C5C5C",
          // });
        }
      }
    };

    function connectWebSocket(wsServerUrl: string, onError: () => void) {
      const streamName = `${token.toLowerCase()}usdt@kline_${period.binanceInterval}`;
      const endpoint = wsServerUrl + "/ws/" + streamName;

      console.log(endpoint);

      const ws = new WebSocket(endpoint);
      wsRef.current = ws;

      ws.onopen = () => {
        console.info(logKey, `WS connection to ${endpoint} estabilished.`)
      };

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          if (message && message.k) {
            handleKlineUpdate(message.k);
          }
        } catch (error) {
          console.error("Error parsing kline WebSocket message:", error);
        }
      };

      ws.onerror = (error) => {
        ws.close();
        onError();
      };
    }

    connectWebSocket(getBinanceWsServerUrl("binance", location), () => {
      connectWebSocket(getBinanceWsServerUrl("proxy", location), () => {
        throwFailedToConnectBinanceWsError();
      });
    });

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [
    token,
    period.binanceInterval,
    selectedPeriod,
    isCandleStick,
    location,
    historicalData.length,
    isWebSocketPaused,
    isLoading,
  ]);

  useEffect(() => {
    if (!chartContainerRef.current) return;
    const observer = new ResizeObserver(() => {
      if (chartContainerRef.current) {
        const width = chartContainerRef.current.clientWidth;
        const height = chartContainerRef.current.clientHeight;
        setDimension({ width, height });
      }
    });

    observer.observe(chartContainerRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <Fragment>
      {/* Chart Container */}
      {isLoading ? (
        <div className="flex items-center h-[345px] justify-center bg-[#0C0C0C] rounded-xl px-4 ">
          <Spinner size={60} variant="circle" color="#272727" />
        </div>
      ) : (
      <div className={`bg-[#0C0C0C] rounded-xl px-4 ${className} overflow-auto`}>
        <div
          ref={chartContainerRef}
          style={{ width: "100%", height: "320px" }}
          className="app_line_chart_component relative flex flex-1 mb-6"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <Chart
            options={{
              layout: {
                background: { type: ColorType.Solid, color: "#0C0C0C" },
                attributionLogo: false,
                textColor: "#666",
              },
              grid: {
                horzLines: {
                  visible: true,
                  color: "#2A2A2A",
                  style: 1,
                },
                vertLines: {
                  visible: true,
                  color: "#2A2A2A",
                  style: 1,
                },
              },
              rightPriceScale: {
                visible: true,
                borderColor: "transparent",
                textColor: "#666",
              },
              leftPriceScale: {
                visible: false,
              },
              handleScroll: true,
              handleScale: true,
              autoSize: true,
              localization: {
                timeFormatter: (time: number) => {
                  const date = new Date(time * 1000);
                  return date.toLocaleString(undefined, {
                    year: "2-digit",
                    month: "short",
                    day: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: false,
                  });
                },
              },
            }}
            containerProps={{
              style: {
                width: '100%',
                height: '100%',
                flexGrow: 1,
              },
            }}
            onCrosshairMove={onCrosshairMove}
          >
            <RenderIf condition={!isCandleStick}>
              <AreaSeries
                ref={lineSeriesRef}
                options={{
                  topColor: chartColors.lineColor,
                  bottomColor: "#08090B",
                  lineColor: chartColors.lineColor,
                  lineType: LineType.Curved,
                  lineWidth: 3,
                  pointMarkersVisible: false,
                  lastValueVisible: false,
                  priceLineVisible: false,
                }}
                data={aggregatedData as any}
              />
            </RenderIf>

            <RenderIf condition={isCandleStick}>
              <CandlestickSeries
                ref={candleSeriesRef}
                data={aggregatedData as CandlestickData[]}
                reactive
                options={{
                  upColor: chartColors.upColor,
                  downColor: chartColors.downColor,
                  borderUpColor: chartColors.borderUpColor,
                  borderDownColor: chartColors.borderDownColor,
                  wickUpColor: chartColors.wickUpColor,
                  wickDownColor: chartColors.wickDownColor,
                }}
              />
            </RenderIf>

            <TimeScale
              ref={timeScaleRef}
              options={{
                borderColor: "transparent",
                timeVisible: true,
                secondsVisible: false,
                tickMarkFormatter: (time: number) => {
                  const date = new Date(time * 1000);
                  const range = timeScaleRef.current?.api()?.getVisibleRange();
                  const rangeDuration = Number(range?.to) - Number(range?.from);
                  // Enhanced formatting for daily period
                  if (selectedPeriod === "1D") {
                    return date.toLocaleTimeString("en-US", {
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: false,
                    });
                  }
                  const TWO_DAYS_IN_SECONDS = 2 * 24 * 60 * 60;
                  if (rangeDuration < TWO_DAYS_IN_SECONDS) {
                    return date.toLocaleTimeString("en-US", {
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: false,
                    });
                  } else {
                    return date.toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    });
                  }
                },
              }}
              onVisibleTimeRangeChange={(e) => {
                visibleRangeRef.current = {
                  from: e?.from,
                  to: e?.to,
                };
              }}
              onVisibleLogicalRangeChange={handleVisibleLogicalRangeChange}
            >
              <TimeScaleFitContentTrigger deps={[aggregatedData.length, selectedPeriod]} />
            </TimeScale>
          </Chart>

          <div
            ref={tooltipRef}
            className="pointer-events-none absolute top-0 left-0 z-[9] overflow-visible whitespace-nowrap"
            style={{
              display: "none",
              width: `${toolTipWidth}px`,
              height: `${toolTipHeight}px`,
            }}
          />
          <AnimatePresence>
            {showTokenStats && (
              <PriceChartCoinStats
                filteredData={statsData}
                oneYearMetrics={oneYearMetrics}
                performanceMetrics={performanceMetrics}
                selectedPeriod={selectedPeriod}
                setShowTokenStats={setShowTokenStats}
                token={token}
              />
            )}
          </AnimatePresence>
        </div>
      {/* Volume Chart Container */}
      {/* <div
        ref={volumeContainerRef}
        style={{ width: "100%", height: "15px", marginTop: -20 }}
      >
        <Chart
          options={{
            layout: {
              background: { type: ColorType.Solid, color: "#0C0C0C" },
              attributionLogo: false,
              textColor: "transparent",
            },
            handleScroll: false,
            handleScale: false,
            autoSize: false,
            width: dimension.width && dimension.width - 85,
            height: 40,
            rightPriceScale: {
              visible: false,
              minimumWidth: 85,
            },
            crosshair: {
              vertLine: { visible: false },
              horzLine: { visible: false },
            },
            grid: {
              horzLines: {
                visible: false,
              },
              vertLines: {
                visible: false,
              },
            },
          }}
          containerProps={{
            style: {
              flexGrow: 1,
            },
          }}
        >
          <RenderIf condition={volumeData.length > 0}>
            <HistogramSeries
              ref={volumeSeriesRef}
              data={volumeData}
              options={{
                priceLineVisible: false,
                color: "#5C5C5C",
                priceScaleId: 'volume-price-scale', // Separate price scale for volume
              }}
            />
          </RenderIf>
          <TimeScale
            ref={volumeTimeScaleRef}
            options={{
              borderColor: "transparent",
              timeVisible: true,
              secondsVisible: false,
              tickMarkFormatter: (time: number) => {
                const date = new Date(time * 1000);
                const range = timeScaleRef.current?.api()?.getVisibleRange();
                const rangeDuration = Number(range?.to) - Number(range?.from);
                if (selectedPeriod === "1D") {
                  return date.toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: false,
                  });
                }
                const TWO_DAYS_IN_SECONDS = 2 * 24 * 60 * 60;
                if (rangeDuration < TWO_DAYS_IN_SECONDS) {
                  return date.toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: false,
                  });
                } else {
                  return date.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  });
                }
              },
            }}
            visibleLogicalRange={getDailyVisibleLogicalRange()}
            onVisibleLogicalRangeChange={(newRange) => {
              // Sync back to main chart if needed
              if (newRange && timeScaleRef.current?.api()) {
                timeScaleRef.current.api()?.setVisibleLogicalRange(newRange);
              }
            }}
          >
            <TimeScaleFitContentTrigger deps={[aggregatedData.length, selectedPeriod]} />
          </TimeScale>
        </Chart>
      </div> */}
      </div>
      )}
    </Fragment>
  );
}

export default React.memo(TestChart);
