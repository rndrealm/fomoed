"use client";
import React, { ReactNode, useEffect, useRef, useState, useMemo, useCallback, Dispatch, SetStateAction } from "react";
import {
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
import { formatPriceSignificant, modalSlide } from "@/lib/utils";
import { useAtomValue } from "jotai";
import { geoLocationAtom } from "@/lib/atoms/geoLocation";
import { AnimatePresence, motion } from "motion/react";
import { Close } from "@/components/icons/icons";
import { useRouter } from "next/navigation";

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

const toolTipWidth = 280;
const toolTipHeight = 80;
const toolTipMargin = 25;

function TestChart(props: IProps) {
  const { isCandleStick = false, period, selectedPeriod, showTokenStats, setShowTokenStats, token = "BTC", className = "" } = props;
  
  const location = useAtomValue(geoLocationAtom);

  const { data = [] } = useFetchBinancePriceData(
    `${token}USDT`, 
    period?.binanceInterval, 
    1000, 
    location?.country
  );

  const filteredData = useMemo(() => {
    if (!data.length) return [];

    const now = new Date();

    let cutoffDate: Date;

    switch (selectedPeriod) {
      case "1D":
        cutoffDate = new Date(now);
        cutoffDate.setDate(now.getDate() - 1);
        break;

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
  }, [data, selectedPeriod]);  

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
    lineColor: isHovering ? '#6B88CA' : (performanceMetrics.isPositive ? '#00AF58' : '#FF8970'),
    upColor: '#00AF58',
    downColor: '#FF8970',
    borderUpColor: '#00AF58',
    borderDownColor: '#FF8970',
    wickUpColor: '#00AF58',
    wickDownColor: '#FF8970',
  }), [isHovering, performanceMetrics.isPositive]);

  useEffect(() => {
    if (!performanceMetrics.startPrice) return;

    let priceLine: any;
    const candleSeriesApiRef = candleSeriesRef.current;
    const lineSeriesApiRef = lineSeriesRef.current;

    if (isCandleStick && candleSeriesApiRef) {
      const api = candleSeriesApiRef.api();
      if (api) {
        priceLine = api.createPriceLine({
          price: performanceMetrics.startPrice,
          color: "#FFFFFF",
          lineWidth: 1,
          lineStyle: 2, // dashed
          axisLabelVisible: false,
        });
      }
    }

    if (!isCandleStick && lineSeriesApiRef) {
      const api = lineSeriesApiRef.api();
      if (api) {
        priceLine = api.createPriceLine({
          price: performanceMetrics.startPrice,
          color: "#FFFFFF",
          lineWidth: 1,
          lineStyle: 2,
          axisLabelVisible: false,
        });
      }
    }

    return () => {
      if (isCandleStick && candleSeriesApiRef && priceLine) {
        candleSeriesApiRef.api()?.removePriceLine(priceLine);
      }
      if (!isCandleStick && lineSeriesApiRef && priceLine) {
        lineSeriesApiRef.api()?.removePriceLine(priceLine);
      }
    };
  }, [performanceMetrics.startPrice, performanceMetrics.isPositive, isCandleStick]);


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
    const changePercent = startPrice ? (change / startPrice) * 100 : 0;
    const dateObj = new Date(data.time * 1000);
    const formattedDate = dateObj.toLocaleDateString('en-US', { 
      day: 'numeric',
      month: 'short', 
      year: 'numeric' 
    });

    tooltip.style.display = "flex";
    tooltip.innerHTML = `
      <div style="background: #1C1C1E; border-radius: 12px; padding: 12px; border: 1px solid #333; box-shadow: 0 8px 32px rgba(0,0,0,0.4);">
        <div style="color: ${changePercent >= 0 ? '#00AF58' : '#FF8970'}; font-size: 16px; font-weight: 700; margin-bottom: 4px;">
          ${formatPriceSignificant(data.close)}
        </div>
        <div style="color: #888; font-size: 12px; text-align: center; margin-bottom: -4px">
          ${formattedDate}
        </div>
      </div>
    `;

    if (!coordinate) return;

    let shiftedCoordinate = param.point.x - toolTipWidth / 2;
    shiftedCoordinate = Math.max(0, Math.min(container.clientWidth - toolTipWidth, shiftedCoordinate));

    const coordinateY =
      coordinate - toolTipHeight - toolTipMargin > 0
        ? coordinate - toolTipHeight - toolTipMargin
        : coordinate + toolTipMargin;

    tooltip.style.left = `${shiftedCoordinate}px`;
    tooltip.style.top = `${coordinateY}px`;
  }, [performanceMetrics.startPrice]);

  const len = data?.length;

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

      dataRef.current.push(newData as any);

      if ((lineSeriesRef.current || candleSeriesRef.current) && data?.length) {
        if (isCandleStick) {
          candleSeriesRef.current?.api()?.update(newData as any);
        } else {
          lineSeriesRef?.current?.api()?.update(newData as any);
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
        console.log(`Direct Kline WebSocket connection established for ${token}. ✅`);
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
  }, [token, period.binanceInterval, isCandleStick, location?.country, data?.length]);

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
        onMouseLeave={() => setIsHovering(false)}
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

          {/* <RenderIf condition={isCandleStick}>
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
          </RenderIf> */}
          
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
              data?.length === 0
                ? undefined
                : (() => {
                    const from = visibleLogicalRangeRef?.current?.from ?? Math.max(0, len - 50);
                    const to = visibleLogicalRangeRef?.current?.to ?? len - 1;
                    return from <= to ? { from, to } : { from: 0, to: len - 1 };
                  })()
            }
            onVisibleTimeRangeChange={(e) => {
              visibleRangeRef.current = {
                from: e?.from,
                to: e?.to,
              };
            }}
            onVisibleLogicalRangeChange={(e) => {
              visibleLogicalRangeRef.current = {
                from: e?.from,
                to: e?.to,
              };
            }}
          >
            <TimeScaleFitContentTrigger deps={[filteredData]} />
          </TimeScale>
        </Chart>
        
        <div
          ref={tooltipRef}
          className="pointer-events-none absolute top-0 left-0 z-[9] h-[80px] w-[280px] overflow-visible whitespace-nowrap"
          style={{ display: 'none' }}
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
                    <div className="grid grid-cols-4 gap-2.5 border-b border-[#242424] text-sm">
                      <div className="space-y-3 pr-2.5 border-r border-[#242424]">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Open</span>
                          <span className="text-white">{formatPrice(performanceMetrics.startPrice)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">High</span>
                          <span className="text-white">{formatPrice(performanceMetrics.high)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Low</span>
                          <span className="text-white">{formatPrice(performanceMetrics.low)}</span>
                        </div>
                      </div>
                      
                      <div className="space-y-3 pr-2.5 border-r border-[#242424]">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Vol</span>
                          <span className="text-white">71.89B</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">P/E</span>
                          <span className="text-white">—</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Mkt Cap</span>
                          <span className="text-white">2.21T</span>
                        </div>
                      </div>
                      
                      <div className="space-y-3 pr-2.5 border-r border-[#242424]">
                        <div className="flex justify-between">
                          <span className="text-gray-400">1Y H</span>
                          <span className="text-white">{formatPrice(oneYearMetrics.high)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">1Y L</span>
                          <span className="text-white">{formatPrice(oneYearMetrics.low)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Avg Vol</span>
                          <span className="text-white">60.79B</span>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Yield</span>
                          <span className="text-white">-</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Beta</span>
                          <span className="text-white">-</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">EPS</span>
                          <span className="text-white">-</span>
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