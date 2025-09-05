"use client";
import React, { ReactNode, useEffect, useRef, useState, useMemo, useCallback, Dispatch, SetStateAction } from "react";
import {
  CandlestickSeries,
  Chart,
  LineSeries,
  SeriesApiRef,
  TimeScale,
  TimeScaleApiRef,
  TimeScaleFitContentTrigger,
} from "lightweight-charts-react-components";
import { CandlestickData, ColorType, Coordinate, LineData, LineType, MouseEventParams, Time } from "lightweight-charts";
import { RenderIf } from "@/components/shared";
import { useFetchBinancePriceData } from "@/services/queries/charts";
import { formatMarketCapNumber, formatPriceSignificant, modalSlide } from "@/lib/utils";
import { useAtomValue } from "jotai";
import { geoLocationAtom } from "@/lib/atoms/geoLocation";
import { AnimatePresence, motion } from "motion/react";
import { Close } from "@/components/icons/icons";
import { useRouter } from "next/navigation";
import { useReadSantimentMarketCap, useReadSantimentVolume } from "@/services/queries/santiment";
import { useSupabaseAuth } from "@/components/providers";
import { Skeleton } from "@/components/ui/skeleton";

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

const tokenMapping: Record<string, string> = {
  btc: "bitcoin",
  eth: "ethereum",
};

function TestChart(props: IProps) {
  const { isCandleStick = false, period, selectedPeriod, showTokenStats, setShowTokenStats, token = "BTC", className = "" } = props;
  
  const location = useAtomValue(geoLocationAtom);
  const { session } = useSupabaseAuth();

  const { data = [] } = useFetchBinancePriceData(
    `${token}USDT`, 
    period?.binanceInterval, 
    1000, 
    location?.country
  );
  const getIntervalMinutes = (interval: string): number => {
    const unit = interval.slice(-1);
    const value = parseInt(interval.slice(0, -1));
    
    switch (unit) {
      case 'm': return value;
      case 'h': return value * 60;
      case 'd': return value * 1440;
      case 'w': return value * 10080;
      default: return 60;
    }
  };  

  const filteredData = useMemo(() => {
    if (!data.length) return [];

    const now = new Date();

    let cutoffDate: Date;

    switch (selectedPeriod) {
      case "1D":
        cutoffDate = new Date(now);
        cutoffDate.setDate(now.getDate() - 1);
        
        let filteredDailyData = data.filter(d => (d.time as number) * 1000 >= cutoffDate.getTime());
        
        const intervalMinutes = getIntervalMinutes(period?.binanceInterval);
        if (intervalMinutes <= 5 && filteredDailyData.length > 288) {
          filteredDailyData = filteredDailyData.slice(-288);
        } else if (intervalMinutes <= 15 && filteredDailyData.length > 96) {
          filteredDailyData = filteredDailyData.slice(-96);
        }
        
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
        return data;
    }

    const cutoff = cutoffDate.getTime();

    return data.filter(d => (d.time as number) * 1000 >= cutoff);
  }, [data, selectedPeriod, period?.binanceInterval]);

  const getSantimentTimeframe = useCallback(() => {
  const getFrom = (days: number) => `utc_now-${days - 1}d`;

  let from: string;
  let interval: "5m" | "1h" | "8h" | "1d" |  "";

  switch (selectedPeriod) {
    case "1D":
      from = getFrom(2);
      interval = "5m";
      break;
    case "1W":
      from = getFrom(7);
      interval = "1d";
      break;
    case "1M":
      from = getFrom(30);
      interval = "1d";
      break;
    case "3M":
      from = getFrom(90);
      interval = "1d";
      break;
    case "6M":
      from = getFrom(180);
      interval = "1d";
      break;
    case "YTD": {
      const now = new Date();
      const startOfYear = new Date(Date.UTC(now.getUTCFullYear(), 0, 1)); 
      
      from = startOfYear.toISOString();
      interval = "1d";
      break;
    }
    case "1Y":
      from = getFrom(365);
      interval = "1d";
      break;
    case "ALL": {
      const totalPoints = filteredData.length;
      const daysBack = totalPoints * 7;
      from = getFrom(daysBack);
      interval = "1d";
      break;
    }
    default:
      from = getFrom(30);
      interval = "1d";
  }

    return { from, to: "utc_now", interval };
  }, [filteredData.length, selectedPeriod]);

  const { from, to, interval } = getSantimentTimeframe();

  const { data: santimentVolumeRaw } = useReadSantimentVolume({
    token: tokenMapping[token.toLowerCase()],
    from,
    to,
    interval,
    auth_token: session?.access_token,
  });

  const santimentVolume = useMemo(() => {
    if (!santimentVolumeRaw) return [];
    if (selectedPeriod === "1D") {
      return santimentVolumeRaw.length > 0
        ? [santimentVolumeRaw[santimentVolumeRaw.length - 1]]
        : [];
    }
    return santimentVolumeRaw;
  }, [santimentVolumeRaw, selectedPeriod]);

  const volumeMetrics = useMemo(() => {
    if (!santimentVolume || santimentVolume.length === 0)
      return { totalVolume: 0, avgVolume: 0 };

    const totalVolume = santimentVolume.reduce((sum, d) => sum + d.value, 0);

    return {
      totalVolume,
      avgVolume: totalVolume / santimentVolume.length,
    };
  }, [santimentVolume]);

    const {data: santimentMarketcap } = useReadSantimentMarketCap({
    token: tokenMapping[token.toLowerCase()],
    interval: "5m",
    auth_token: session?.access_token,
  })

  const formatLargeNumber = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      notation: "compact",
      maximumFractionDigits: 2,
    }).format(value);;
  };
  
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const lineSeriesRef = useRef<SeriesApiRef<"Line">>(null);
  const candleSeriesRef = useRef<SeriesApiRef<"Candlestick">>(null);
  const timeScaleRef = useRef<TimeScaleApiRef>(null);
  const dataRef = useRef<(LineData | CandlestickData)[]>([]);
  const [dimension, setDimension] = useState({ width: 0, height: 0 });
  const wsRef = useRef<WebSocket | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);
  const [isHovering, setIsHovering] = useState(false);
  // Store default zoom range for zoom limits
  const defaultZoomRangeRef = useRef<{ from: number; to: number } | null>(null);

  const router = useRouter();

  const visibleRangeRef = useRef<{
    from?: Time;
    to?: Time;
  } | null>(null);

  const visibleLogicalRangeRef = useRef<{
    from?: number;
    to?: number;
  } | null>(null);

  // Calculate performance metrics
  const performanceMetrics = useMemo(() => {
    if (!filteredData.length) {
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
      ? (filteredData[filteredData.length - 1] as CandlestickData)?.close || 0
      : (filteredData[filteredData.length - 1] as any)?.value || 0;

    const startPrice = isCandleStick 
      ? (filteredData[0] as CandlestickData)?.open || 0
      : (filteredData[0] as any)?.value || 0;

    const change = currentPrice - startPrice;
    const changePercent = startPrice ? (change / startPrice) * 100 : 0;

    return {
      isPositive: change >= 0,
      change,
      changePercent,
      currentPrice,
      startPrice,
      high: Math.max(...filteredData.map(d => isCandleStick ? (d as CandlestickData).high : (d as any).value)),
      low: Math.min(...filteredData.map(d => isCandleStick ? (d as CandlestickData).low : (d as any).value)),
    };
  }, [filteredData, isCandleStick]);

  const oneYearMetrics = useMemo(() => {
    if (!data.length) {
      return { high: 0, low: 0 };
    }

    const now = new Date();
    const cutoffDate = new Date(now);
    cutoffDate.setFullYear(now.getFullYear() - 1);
    const cutoff = cutoffDate.getTime();

    const lastYearData = data.filter(d => (d.time as number) * 1000 >= cutoff);

    if (!lastYearData.length) {
      return { high: 0, low: 0 };
    }

    return {
      high: Math.max(...lastYearData.map(d => isCandleStick ? (d as CandlestickData).high : (d as any).value)),
      low: Math.min(...lastYearData.map(d => isCandleStick ? (d as CandlestickData).low : (d as any).value)),
    };
  }, [data, isCandleStick]);

  // Chart colors based on performance
  const chartColors = useMemo(() => ({
    lineColor: isHovering ? '#6B88CA' : (performanceMetrics.isPositive ? '#17C583' : '#BD2E36'),
    upColor: '#17C583',
    downColor: '#BD2E36',
    borderUpColor: '#17C583',
    borderDownColor: '#BD2E36',
    wickUpColor: '#17C583',
    wickDownColor: '#BD2E36',
  }), [isHovering, performanceMetrics.isPositive]);

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
  const onCrosshairMove = useCallback((param: MouseEventParams<Time>) => {
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

    if (lineSeriesRef.current) {
      const seriesApi = lineSeriesRef.current.api();
      if (seriesApi) {
        const res = param.seriesData.get(seriesApi) as LineData;
        data.time = res.time as number;
        data.value = res.value;
        data.close = res.value;
        coordinate = lineSeriesRef.current.api()?.priceToCoordinate(data.value);
      }
    }

    if (candleSeriesRef.current) {
      const seriesApi = candleSeriesRef.current.api();
      if (seriesApi) {
        const res = param.seriesData.get(seriesApi) as CandlestickData;
        data.time = res.time as number;
        data.value = res.close;
        data.open = res.open;
        data.high = res.high;
        data.low = res.low;
        data.close = res.close;
        coordinate = candleSeriesRef.current.api()?.priceToCoordinate(data.value);
      }
    }

    // Calculate change from start price
    const startPrice = performanceMetrics.startPrice;
    const change = data.close - startPrice;
    const dateObj = new Date(data.time * 1000);
    const formattedDate = dateObj.toLocaleDateString('en-US', { 
      day: 'numeric',
      month: 'short', 
      year: 'numeric' 
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
              <span style="color: ${isGreen ? '#17C583' : '#BD2E36'}; font-weight: 500;">${formatOHLCPrice(data.close)}</span>
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
          <div style="color: ${change >= 0 ? '#17C583' : '#BD2E36'}; font-size: 16px; font-weight: 700; margin-bottom: 4px;">
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
  }, [performanceMetrics.startPrice, isCandleStick]);

  // Set default zoom range when data loads
  useEffect(() => {
    if (filteredData.length > 0 && !defaultZoomRangeRef.current) {
      const defaultFrom = Math.max(0, filteredData.length - 50);
      const defaultTo = filteredData.length - 1;
      defaultZoomRangeRef.current = { from: defaultFrom, to: defaultTo };
    }
  }, [filteredData]);

  // Handle zoom restrictions
  const handleVisibleLogicalRangeChange = useCallback((newRange: { from: number; to: number } | null) => {
    if (!newRange || !defaultZoomRangeRef.current) return;

    const defaultRange = defaultZoomRangeRef.current;
    const dataLength = filteredData.length;
    
    // Calculate current visible data points
    const currentDataPoints = newRange.to - newRange.from;
    const defaultDataPoints = defaultRange.to - defaultRange.from;

    // Allow zoom out up to showing all available data
    const maxAllowedDataPoints = Math.min(dataLength, defaultDataPoints * 2); // Allow zoom out up to 2x default or all data
    
    // Prevent zooming out beyond maximum allowed range
    if (currentDataPoints > maxAllowedDataPoints) {
      // Calculate centered range that shows maximum allowed data points
      const center = (newRange.from + newRange.to) / 2;
      const halfRange = maxAllowedDataPoints / 2;
      
      let adjustedFrom = Math.max(0, center - halfRange);
      let adjustedTo = Math.min(dataLength - 1, center + halfRange);
      
      // If we hit the boundaries, adjust accordingly
      if (adjustedFrom === 0) {
        adjustedTo = Math.min(dataLength - 1, maxAllowedDataPoints);
      } else if (adjustedTo === dataLength - 1) {
        adjustedFrom = Math.max(0, dataLength - maxAllowedDataPoints);
      }

      timeScaleRef.current?.api()?.setVisibleLogicalRange({
        from: adjustedFrom,
        to: adjustedTo
      });
      return;
    }

    // Prevent zooming in too much (minimum 10 data points visible)
    const minDataPoints = 10;
    if (currentDataPoints < minDataPoints) {
      const center = (newRange.from + newRange.to) / 2;
      const halfRange = minDataPoints / 2;
      
      timeScaleRef.current?.api()?.setVisibleLogicalRange({
        from: Math.max(0, center - halfRange),
        to: Math.min(dataLength - 1, center + halfRange)
      });
      return;
    }

    // Prevent scrolling beyond data boundaries
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
        to: adjustedTo
      });
      return;
    }

    // Update the visible range reference for valid ranges
    visibleLogicalRangeRef.current = {
      from: newRange.from,
      to: newRange.to,
    };
  }, [filteredData.length]);

  useEffect(() => {
  if (filteredData.length > 0) {
    // Always recalculate default range when data changes
    const defaultFrom = Math.max(0, filteredData.length - 50);
    const defaultTo = filteredData.length - 1;
    
    defaultZoomRangeRef.current = { from: defaultFrom, to: defaultTo };
    
    // Reset visible range when data changes significantly
    if (!visibleLogicalRangeRef.current) {
      visibleLogicalRangeRef.current = { from: defaultFrom, to: defaultTo };
    }
  }
}, [filteredData.length]);

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
      };

      if (selectedPeriod === '1D') {
        const now = Date.now();
        const dataTime = newData.time * 1000;
        
        // Only update when the data are from the past 24 hours
        if (now - dataTime <= 24 * 60 * 60 * 1000) {
          dataRef.current.push(newData as any);

          if ((lineSeriesRef.current || candleSeriesRef.current) && data?.length) {
            if (isCandleStick) {
              candleSeriesRef.current?.api()?.update(newData as any);
            } else {
              lineSeriesRef?.current?.api()?.update(newData as any);
            }
          }
        }
      } else {
        dataRef.current.push(newData as any);

        if ((lineSeriesRef.current || candleSeriesRef.current) && data?.length) {
          if (isCandleStick) {
            candleSeriesRef.current?.api()?.update(newData as any);
          } else {
            lineSeriesRef?.current?.api()?.update(newData as any);
          }
        }
      }
    };

    const connectEventSourceProxy = () => {
      console.log(`Primary Kline WebSocket failed for ${token}. Attempting fallback...`);
      const eventSource = new EventSource(`/api/websocket-proxy?token=${token}&streamType=kline&period=${period.binanceInterval}`);
      eventSourceRef.current = eventSource;

      eventSource.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          if (message.type !== "heartbeat" && message.k) {
            handleKlineUpdate(message.k);
          }
        } catch (error) {
          console.error("Error parsing kline fallback message:", error);
        }
      };

      eventSource.onerror = (error) => {
        eventSource.close();
      };
    };

    const connectWebSocket = () => {
      const streamName = `${token.toLowerCase()}usdt@kline_${period.binanceInterval}`;
      const endpoint =
        location.country === "US"
          ? `wss://stream.binance.us:9443/ws/${streamName}`
          : `wss://stream.binance.com:9443/ws/${streamName}`;

      const ws = new WebSocket(endpoint);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log(`Direct Kline WebSocket connection established for ${token} with ${period.binanceInterval} interval. ✅`);
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
        connectEventSourceProxy();
      };
    };

    connectWebSocket();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, [token, period.binanceInterval, selectedPeriod, isCandleStick, location?.country, data?.length]);

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

  const formatPrice = (price?: number) => {
    if(price === undefined) return
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className={`bg-[#0C0C0C] rounded-xl px-4 pt-6 ${className} overflow-scroll`}>
      {/* Chart Container */}
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
                color: '#2A2A2A',
                style: 1,
              },
              vertLines: {
                visible: true,
                color: '#2A2A2A',
                style: 1,
              },
            },
            rightPriceScale: {
              visible: true,
              borderColor: 'transparent',
              textColor: '#666',
            },
            leftPriceScale: {
              visible: false,
            },
            handleScroll: true,
            handleScale: true,
            autoSize: false,
            width: dimension.width,
            height: dimension.height,
          }}
          containerProps={{
            style: {
              flexGrow: 1,
            },
          }}
          onCrosshairMove={onCrosshairMove}
        >
          <RenderIf condition={!isCandleStick}>
            <LineSeries
              ref={lineSeriesRef}
              options={{
                color: chartColors.lineColor,
                lineType: LineType.Curved,
                lineWidth: 3,
                pointMarkersVisible: false,
                lastValueVisible: false,
                priceLineVisible: false,
              }}
              data={filteredData as any}
            />
          </RenderIf>

          <RenderIf condition={isCandleStick}>
            <CandlestickSeries 
              ref={candleSeriesRef} 
              data={filteredData as CandlestickData[]} 
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
                // Enhanced formatting untuk daily period
                if (selectedPeriod === '1D') {
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
            visibleLogicalRange={
              data?.length === 0 || !defaultZoomRangeRef.current
                ? undefined
                : (() => {
                    const defaultRange = defaultZoomRangeRef.current!;
                    const from = visibleLogicalRangeRef?.current?.from ?? defaultRange.from;
                    const to = visibleLogicalRangeRef?.current?.to ?? defaultRange.to;
                    return from <= to ? { from, to } : defaultRange;
                  })()
            }
            onVisibleTimeRangeChange={(e) => {
              visibleRangeRef.current = {
                from: e?.from,
                to: e?.to,
              };
            }}
            onVisibleLogicalRangeChange={handleVisibleLogicalRangeChange}
          >
            <TimeScaleFitContentTrigger deps={[filteredData.length, selectedPeriod]} />
          </TimeScale>
        </Chart>
        
        <div
          ref={tooltipRef}
          className="pointer-events-none absolute top-0 left-0 z-[9] overflow-visible whitespace-nowrap"
          style={{ 
            display: 'none',
            width: `${toolTipWidth}px`,
            height: `${toolTipHeight}px`
          }}
        />
        <AnimatePresence>
          {showTokenStats && (
            <div className="absolute top-0 right-[10px] bottom-0 -left-2 z-99 flex items-end">
              <motion.div
                className="scrollbar max-h-full w-9/10 overflow-auto rounded-[22px] bg-[#141414] px-5 py-4"
                variants={modalSlide}
                initial="hidden"
                animate="visible"
                exit="hidden"
              >
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-3">
                    <div className="flex justify-between items-center pb-4.5">
                      <h3 className="text-base leading-[1.35] font-semibold text-white">View Coin Stats</h3>
                      <div className="flex justify-end">
                        <button
                          type="button"
                          className="flex h-[26px] items-center justify-center gap-1 rounded-[40px]"
                          onClick={() => {
                            setShowTokenStats(false);
                          }}
                        >
                          <div className="">
                            <Close fill="#878787" />
                          </div>
                        </button>
                      </div>
                    </div>
                    {/* Statistics Grid */}
                    <div className="grid grid-cols-3 gap-2.5 border-b border-[#242424] text-sm">
                      <div className="space-y-3 pr-2.5 border-r border-[#242424]">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Open</span>
                          {!performanceMetrics.startPrice ? (
                              <Skeleton className="mb-2 w-16 h-4" />
                            ) : (
                              <span className="text-white">{formatPrice(performanceMetrics.startPrice)}</span>
                            )
                          }
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">High</span>
                          {!performanceMetrics.high ? (
                              <Skeleton className="mb-2 w-16 h-4" />
                            ) : (
                              <span className="text-white">{formatPrice(performanceMetrics.high)}</span>
                            )
                          }
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Low</span>
                          {!performanceMetrics.low ? (
                              <Skeleton className="mb-2 w-16 h-4" />
                            ) : (
                              <span className="text-white">{formatPrice(performanceMetrics.low)}</span>
                            )
                          }
                        </div>
                      </div>
                      
                      <div className="space-y-3 pr-2.5 border-r border-[#242424]">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Vol</span>
                          {!volumeMetrics.totalVolume ? (
                              <Skeleton className="mb-2 w-16 h-4" />
                            ) : (
                              <span className="text-white">{formatLargeNumber(volumeMetrics.totalVolume)}</span>
                            )
                          }
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Avg Vol</span>
                          {!volumeMetrics.avgVolume ? (
                              <Skeleton className="mb-2 w-16 h-4" />
                            ) : (
                              <span className="text-white">{formatLargeNumber(volumeMetrics.avgVolume)}</span>
                            )
                          }
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Mkt Cap</span>
                          {!santimentMarketcap ? (
                              <Skeleton className="mb-2 w-16 h-4" />
                            ) : (
                              <span className="text-white">{formatMarketCapNumber(santimentMarketcap || "")}</span>
                            )
                          }
                        </div>
                      </div>
                      
                      <div className="space-y-3 pr-2.5">
                        <div className="flex justify-between">
                          <span className="text-gray-400">52W H</span>
                          {!oneYearMetrics.high ? (
                              <Skeleton className="mb-2 w-16 h-4" />
                            ) : (
                              <span className="text-white">{formatPrice(oneYearMetrics.high)}</span>
                            )
                          }
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">52W L</span>
                          {!oneYearMetrics.low ? (
                              <Skeleton className="mb-2 w-16 h-4" />
                            ) : (
                              <span className="text-white">{formatPrice(oneYearMetrics.low)}</span>
                            )
                          }
                        </div>
                      </div>
                    </div>
                    <div className="py-3">
                      <button
                        className="text-[#167AFD] text-sm"
                        onClick={() => {
                          router.push("/news")
                        }}
                      >
                        In the News &gt;
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default React.memo(TestChart);