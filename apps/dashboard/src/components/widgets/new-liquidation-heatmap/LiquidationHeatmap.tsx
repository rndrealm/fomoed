import { useState, useEffect, useRef, useMemo } from "react";
import {
  createChart,
  IChartApi,
  ISeriesApi,
  IPriceLine,
  CandlestickData,
  HistogramData,
  LineData,
  Time,
  CrosshairMode,
  CandlestickSeries,
  HistogramSeries,
  LineSeries,
} from "lightweight-charts";
import { MergedBar, HeatmapResult } from "@/services/queries/new-liquidation-heatmap/types";
import {
  getMaxContracts,
  getNormalizedIntensity,
} from "@/services/queries/new-liquidation-heatmap/liquidationCalculator";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Props {
  bars: MergedBar[];
  result: HeatmapResult;
  currentPrice: number;
  width: number;
  height: number;
  isMobile?: boolean;
}

const LONG_COLOR = "#26a69a";
const SHORT_COLOR = "#ef5350";

export function LiquidationHeatmap({ bars, result, currentPrice, width, height, isMobile = false }: Props) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candleSeriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const volumeSeriesRef = useRef<ISeriesApi<"Histogram"> | null>(null);
  const vwapLineRef = useRef<ISeriesApi<"Line"> | null>(null);
  const vwapDeviationRef = useRef<ISeriesApi<"Histogram"> | null>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const liquidationLinesRef = useRef<IPriceLine[]>([]);
  const currentPriceLineRef = useRef<IPriceLine | null>(null);
  const chartInstanceIdRef = useRef(0);
  const priceLineChartIdRef = useRef(0);

  const [showSidebar, setShowSidebar] = useState(!isMobile);

  const sidebarWidth = isMobile ? 200 : 280;
  const mainChartWidth = showSidebar ? width - sidebarWidth : width;

  const { candleData, volumeData, vwapData, vwapDeviationData } = useMemo(() => {
    const candles: CandlestickData<Time>[] = [];
    const volumes: HistogramData<Time>[] = [];
    const vwap: LineData<Time>[] = [];
    const vwapDeviation: HistogramData<Time>[] = [];

    let cumulativePV = 0;
    let cumulativeVolume = 0;

    for (const bar of bars) {
      const time = (bar.timestamp / 1000) as Time;
      const isBullish = bar.close >= bar.open;
      const typicalPrice = (bar.high + bar.low + bar.close) / 3;

      cumulativePV += typicalPrice * bar.volume;
      cumulativeVolume += bar.volume;
      const vwapValue = cumulativeVolume > 0 ? cumulativePV / cumulativeVolume : typicalPrice;

      const deviationPercent = ((bar.close - vwapValue) / vwapValue) * 100;

      candles.push({
        time,
        open: bar.open,
        high: bar.high,
        low: bar.low,
        close: bar.close,
      });

      volumes.push({
        time,
        value: bar.volume,
        color: isBullish ? "rgba(38, 166, 154, 0.5)" : "rgba(239, 83, 80, 0.5)",
      });

      vwap.push({
        time,
        value: vwapValue,
      });

      vwapDeviation.push({
        time,
        value: deviationPercent,
        color: deviationPercent >= 0 ? "rgba(38, 166, 154, 0.8)" : "rgba(239, 83, 80, 0.8)",
      });
    }

    return {
      candleData: candles,
      volumeData: volumes,
      vwapData: vwap,
      vwapDeviationData: vwapDeviation,
    };
  }, [bars]);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    if (mainChartWidth <= 0 || height <= 0) return;

    const container = chartContainerRef.current;
    const rect = container.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return;

    const chart = createChart(chartContainerRef.current, {
      width: mainChartWidth,
      autoSize: true,
      layout: {
        background: { color: "#000000" },
        textColor: "#737373",
        fontSize: isMobile ? 10 : 12,
      },
      grid: {
        vertLines: { color: "rgba(255, 255, 255, 0.05)" },
        horzLines: { color: "rgba(255, 255, 255, 0.05)" },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
        vertLine: {
          color: "rgba(255, 255, 255, 0.4)",
          width: 1,
          style: 2,
          labelBackgroundColor: "#1a1a1a",
        },
        horzLine: {
          color: "rgba(255, 255, 255, 0.4)",
          width: 1,
          style: 2,
          labelBackgroundColor: "#1a1a1a",
        },
      },
      rightPriceScale: {
        borderColor: "#2a2a2a",
        scaleMargins: {
          top: 0.1,
          bottom: 0.2,
        },
      },
      timeScale: {
        borderColor: "#2a2a2a",
        timeVisible: true,
        secondsVisible: false,
        rightOffset: 5,
        barSpacing: 6,
        fixLeftEdge: false,
        fixRightEdge: false,
        lockVisibleTimeRangeOnResize: true,
        rightBarStaysOnScroll: true,
        visible: true,
      },
      handleScale: {
        axisPressedMouseMove: {
          time: !isMobile,
          price: !isMobile,
        },
        axisDoubleClickReset: {
          time: true,
          price: true,
        },
      },
      handleScroll: {
        mouseWheel: !isMobile,
        pressedMouseMove: !isMobile,
        horzTouchDrag: isMobile,
        vertTouchDrag: isMobile,
      },
    });

    chartRef.current = chart;
    chartInstanceIdRef.current += 1;
    console.log(`[Chart] Created new chart instance, id=${chartInstanceIdRef.current}`);

    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: LONG_COLOR,
      downColor: SHORT_COLOR,
      borderUpColor: LONG_COLOR,
      borderDownColor: SHORT_COLOR,
      wickUpColor: LONG_COLOR,
      wickDownColor: SHORT_COLOR,
      lastValueVisible: false,
      priceLineVisible: false,
    });
    candleSeriesRef.current = candleSeries;

    const volumeSeries = chart.addSeries(HistogramSeries, {
      priceFormat: {
        type: "volume",
      },
      priceScaleId: "volume",
    });

    chart.priceScale("volume").applyOptions({
      scaleMargins: {
        top: 0.8,
        bottom: 0.1,
      },
    });

    volumeSeriesRef.current = volumeSeries;

    const vwapLine = chart.addSeries(LineSeries, {
      color: "#ff9800",
      lineWidth: isMobile ? 1 : 2,
      lineStyle: 0,
      priceScaleId: "right",
      title: "VWAP",
    });
    vwapLineRef.current = vwapLine;

    const vwapDeviationSeries = chart.addSeries(HistogramSeries, {
      priceFormat: {
        type: "percent",
      },
      priceScaleId: "vwapDev",
    });

    chart.priceScale("vwapDev").applyOptions({
      scaleMargins: {
        top: 0.9,
        bottom: 0,
      },
    });

    vwapDeviationRef.current = vwapDeviationSeries;

    chart.subscribeCrosshairMove((param) => {
      if (!tooltipRef.current) return;

      if (!param.time || !param.point || param.point.x < 0 || param.point.y < 0) {
        tooltipRef.current.style.display = "none";
        return;
      }

      const candlePrice = param.seriesData.get(candleSeries);
      const volumeValue = param.seriesData.get(volumeSeries);
      const vwapValue = param.seriesData.get(vwapLine);
      const vwapDevValue = param.seriesData.get(vwapDeviationSeries);

      if (!candlePrice) {
        tooltipRef.current.style.display = "none";
        return;
      }

      const data = candlePrice as CandlestickData<Time>;
      const vol = volumeValue as HistogramData<Time>;
      const vwapPoint = vwapValue as LineData<Time>;
      const vwapDev = vwapDevValue as HistogramData<Time>;

      const date = new Date((param.time as number) * 1000);
      const dateStr = isMobile ? date.toLocaleTimeString() : date.toLocaleString();

      const changePercent = (((data.close - data.open) / data.open) * 100).toFixed(2);
      const changeColor = data.close >= data.open ? LONG_COLOR : SHORT_COLOR;
      const vwapDevColor = vwapDev && vwapDev.value >= 0 ? LONG_COLOR : SHORT_COLOR;

      tooltipRef.current.innerHTML = `
        <div style="font-size: ${isMobile ? "10px" : "11px"}; color: #737373; margin-bottom: 4px;">${dateStr}</div>
        <div style="display: grid; grid-template-columns: 60px 1fr; gap: 2px 8px; font-size: ${isMobile ? "11px" : "12px"};">
          <span style="color: #737373;">Open:</span><span>$${data.open.toLocaleString()}</span>
          <span style="color: #737373;">High:</span><span>$${data.high.toLocaleString()}</span>
          <span style="color: #737373;">Low:</span><span>$${data.low.toLocaleString()}</span>
          <span style="color: #737373;">Close:</span><span>$${data.close.toLocaleString()}</span>
          <span style="color: #737373;">Change:</span><span style="color: ${changeColor}">${changePercent}%</span>
          ${vol ? `<span style="color: #737373;">Volume:</span><span>${vol.value.toLocaleString()}</span>` : ""}
          ${vwapPoint && !isMobile ? `<span style="color: #ff9800;">VWAP:</span><span style="color: #ff9800;">${vwapPoint.value.toLocaleString()}</span>` : ""}
          ${vwapDev && !isMobile ? `<span style="color: #737373;">VWAP Dev:</span><span style="color: ${vwapDevColor}">${vwapDev.value >= 0 ? "+" : ""}${vwapDev.value.toFixed(2)}%</span>` : ""}
        </div>
      `;

      tooltipRef.current.style.display = "block";

      const x = param.point.x;
      const y = param.point.y;

      let left = x + 20;
      let top = y + 20;

      const tooltipWidth = isMobile ? 160 : 200;
      const tooltipHeight = isMobile ? 120 : 150;

      if (left + tooltipWidth > mainChartWidth) {
        left = x - tooltipWidth - 20;
      }
      if (top + tooltipHeight > height) {
        top = y - tooltipHeight - 20;
      }

      tooltipRef.current.style.left = `${left}px`;
      tooltipRef.current.style.top = `${top}px`;
    });

    return () => {
      chart.remove();
      chartRef.current = null;
      candleSeriesRef.current = null;
      volumeSeriesRef.current = null;
      vwapLineRef.current = null;
      vwapDeviationRef.current = null;
      liquidationLinesRef.current = [];
      currentPriceLineRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!candleSeriesRef.current || !volumeSeriesRef.current) return;

    candleSeriesRef.current.setData(candleData);
    volumeSeriesRef.current.setData(volumeData);

    if (vwapLineRef.current) {
      vwapLineRef.current.setData(vwapData);
    }
    if (vwapDeviationRef.current) {
      vwapDeviationRef.current.setData(vwapDeviationData);
    }

    if (chartRef.current) {
      chartRef.current.timeScale().fitContent();
    }

    if (chartRef.current && candleSeriesRef.current) {
      const series = candleSeriesRef.current;

      for (const line of liquidationLinesRef.current) {
        try {
          series.removePriceLine(line);
        } catch {
          // Line may have already been removed
        }
      }
      liquidationLinesRef.current = [];

      const allLiqPrices = [
        ...result.longs.map((l) => l.priceTop),
        ...result.longs.map((l) => l.priceBottom),
        ...result.shorts.map((l) => l.priceTop),
        ...result.shorts.map((l) => l.priceBottom),
      ];

      let finalMin = 0;
      let finalMax = 0;

      if (allLiqPrices.length > 0 && bars.length > 0) {
        const minLiqPrice = Math.min(...allLiqPrices);
        const maxLiqPrice = Math.max(...allLiqPrices);

        const barPrices = bars.flatMap((b) => [b.high, b.low]);
        const minBarPrice = Math.min(...barPrices);
        const maxBarPrice = Math.max(...barPrices);

        finalMin = Math.min(minLiqPrice, minBarPrice);
        finalMax = Math.max(maxLiqPrice, maxBarPrice);
      }

      if (finalMin > 0 && finalMax > 0) {
        series.applyOptions({
          autoscaleInfoProvider: () => ({
            priceRange: {
              minValue: finalMin,
              maxValue: finalMax,
            },
          }),
        });
      } else {
        series.applyOptions({
          autoscaleInfoProvider: undefined,
        });
      }

      const maxLongContracts = getMaxContracts(result.longs);
      const maxShortContracts = getMaxContracts(result.shorts);

      const allLongs = [...result.longs].sort((a, b) => b.contracts - a.contracts);

      for (const level of allLongs) {
        const intensity = getNormalizedIntensity(level.contracts, maxLongContracts);
        const priceLine = series.createPriceLine({
          price: level.priceTop,
          color: `rgba(187, 255, 0, ${0.2 + intensity * 0.6})`,
          lineWidth: 1,
          lineStyle: 0,
          axisLabelVisible: false,
          title: "",
        });
        liquidationLinesRef.current.push(priceLine);
      }

      const allShorts = [...result.shorts].sort((a, b) => b.contracts - a.contracts);

      for (const level of allShorts) {
        const intensity = getNormalizedIntensity(level.contracts, maxShortContracts);
        const priceLine = series.createPriceLine({
          price: level.priceBottom,
          color: `rgba(0, 102, 204, ${0.2 + intensity * 0.6})`,
          lineWidth: 1,
          lineStyle: 0,
          axisLabelVisible: false,
          title: "",
        });
        liquidationLinesRef.current.push(priceLine);
      }

      if (chartRef.current) {
        chartRef.current.timeScale().fitContent();
      }
    }
  }, [candleData, volumeData, vwapData, vwapDeviationData, result.longs, result.shorts, isMobile, bars]);

  useEffect(() => {
    if (!candleSeriesRef.current || currentPrice <= 0) return;

    const series = candleSeriesRef.current;
    const currentChartId = chartInstanceIdRef.current;

    console.log(
      `[PriceLine] currentPrice=${currentPrice}, chartId=${currentChartId}, priceLineChartId=${priceLineChartIdRef.current}, hasLine=${!!currentPriceLineRef.current}`,
    );

    if (currentPriceLineRef.current && priceLineChartIdRef.current === currentChartId) {
      try {
        console.log("[PriceLine] Updating existing line");
        currentPriceLineRef.current.applyOptions({
          price: currentPrice,
        });
        return;
      } catch (e) {
        console.log("[PriceLine] Update failed, will recreate:", e);
      }
    }

    console.log("[PriceLine] Creating NEW price line");
    currentPriceLineRef.current = series.createPriceLine({
      price: currentPrice,
      color: "#ffffff",
      lineWidth: 1,
      lineStyle: 2,
      axisLabelVisible: true,
      title: "Current",
    });
    priceLineChartIdRef.current = currentChartId;
  }, [currentPrice]);

  // useEffect(() => {
  //   if (!chartRef.current) return;
  //   if (mainChartWidth <= 0 || height <= 0) return;

  //   chartRef.current.resize(
  //     Math.floor(mainChartWidth),
  //     Math.floor(height)
  //   );
  // }, [mainChartWidth, height]);

  const { densityBuckets, maxDensity } = useMemo(() => {
    if (bars.length === 0) return { densityBuckets: new Map(), maxDensity: 0 };

    const prices = [...bars.map((b) => b.high), ...bars.map((b) => b.low)];
    const priceMin = Math.min(...prices);
    const priceMax = Math.max(...prices);

    let bucketSize: number;
    if (priceMax < 1) {
      bucketSize = Math.max((priceMax - priceMin) * 0.005, 0.0001);
    } else if (priceMax < 10) {
      bucketSize = Math.max((priceMax - priceMin) * 0.01, 0.01);
    } else if (priceMax < 100) {
      bucketSize = Math.max((priceMax - priceMin) * 0.02, 0.1);
    } else if (priceMax < 1000) {
      bucketSize = Math.max((priceMax - priceMin) * 0.02);
    } else {
      bucketSize = Math.max((priceMax - priceMin) * 0.02, 10);
    }

    const buckets: Map<number, { longs: number; shorts: number; price: number }> = new Map();

    for (const level of result.longs) {
      const bucket = Math.floor(level.priceTop / bucketSize) * bucketSize;
      const existing = buckets.get(bucket) || {
        longs: 0,
        shorts: 0,
        price: bucket,
      };
      existing.longs += level.contracts;
      buckets.set(bucket, existing);
    }

    for (const level of result.shorts) {
      const bucket = Math.floor(level.priceBottom / bucketSize) * bucketSize;
      const existing = buckets.get(bucket) || {
        longs: 0,
        shorts: 0,
        price: bucket,
      };
      existing.shorts += level.contracts;
      buckets.set(bucket, existing);
    }

    let max = 0;
    buckets.forEach((d) => {
      max = Math.max(max, d.longs, d.shorts);
    });

    return { densityBuckets: buckets, maxDensity: max };
  }, [bars, result]);

  return (
    <div
      style={{
        display: "flex",
        background: "#000000",
        position: "relative",
        width: "100%",
        height: "100%",
        overflow: "hidden",
      }}
    >
      {/* Main Chart */}
      <div style={{ position: "relative", width: mainChartWidth, height: "100%", flexShrink: 0, overflow: "hidden" }}>
        <div ref={chartContainerRef} style={{ width: "100%", height: "100%" }} />

        {/* Tooltip */}
        <div
          ref={tooltipRef}
          style={{
            display: "none",
            position: "absolute",
            background: "rgba(26, 26, 26, 0.95)",
            border: "1px solid #404040",
            borderRadius: "4px",
            padding: isMobile ? "8px" : "10px",
            pointerEvents: "none",
            zIndex: 100,
            minWidth: isMobile ? "140px" : "180px",
            color: "#fff",
          }}
        />

        {/* Sidebar toggle button for mobile */}
        {isMobile && (
          <button
            onClick={() => setShowSidebar(!showSidebar)}
            style={{
              position: "absolute",
              right: showSidebar ? sidebarWidth : 0,
              top: "50%",
              transform: "translateY(-50%)",
              background: "#1a1a1a",
              border: "1px solid #404040",
              borderRadius: showSidebar ? "4px 0 0 4px" : "0 4px 4px 0",
              padding: "12px 6px",
              color: "#fff",
              cursor: "pointer",
              zIndex: 101,
              display: "flex",
              alignItems: "center",
              touchAction: "manipulation",
            }}
          >
            {showSidebar ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        )}
      </div>

      {/* Sidebar - Liquidation Density */}
      {showSidebar && (
        <div
          className="no-scrollbar"
          style={{
            width: sidebarWidth,
            flexShrink: 0,
            background: "#0a0a0a",
            padding: isMobile ? "8px" : "10px",
            borderLeft: "1px solid #2a2a2a",
            position: isMobile ? "absolute" : "relative",
            right: 0,
            top: 0,
            height: "100%",
            zIndex: 100,
            overflowY: "auto",
          }}
        >
          <h3
            style={{
              margin: "0 0 12px 0",
              fontSize: isMobile ? "12px" : "13px",
              color: "#fff",
              textAlign: "center",
            }}
          >
            Liquidation Density
          </h3>

          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "12px",
              marginBottom: "12px",
              fontSize: isMobile ? "9px" : "10px",
            }}
          >
            <span style={{ color: "#4ade80" }}>Long Liq</span>
            <span style={{ color: "#f87171" }}>Short Liq</span>
          </div>

          {/* Density bars */}
          <div
            className="no-scrollbar"
            style={{
              maxHeight: "100%",
              overflowY: "auto",
            }}
          >
            {Array.from(densityBuckets.entries())
              .sort((a, b) => b[0] - a[0])
              .map(([bucket, data]) => {
                const barWidth = isMobile ? 60 : 80;
                const longWidth = maxDensity > 0 ? (data.longs / maxDensity) * barWidth : 0;
                const shortWidth = maxDensity > 0 ? (data.shorts / maxDensity) * barWidth : 0;

                return (
                  <div
                    key={bucket}
                    style={{
                      display: "grid",
                      gridTemplateColumns: `${barWidth}px auto ${barWidth}px`,
                      alignItems: "center",
                      height: isMobile ? "10px" : "12px",
                      marginBottom: "2px",
                      fontSize: isMobile ? "8px" : "9px",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "flex-end" }}>
                      <div
                        style={{
                          width: `${shortWidth}px`,
                          height: isMobile ? "6px" : "8px",
                          background: "#f87171",
                          borderRadius: "2px 0 0 2px",
                        }}
                      />
                    </div>

                    <div
                      style={{
                        minWidth: isMobile ? "50px" : "70px",
                        textAlign: "center",
                        color: "#e5e5e5",
                        fontSize: isMobile ? "11px" : "13px",
                        fontWeight: 500,
                        fontFamily: "monospace",
                        whiteSpace: "nowrap",
                        letterSpacing: "0.3px",
                      }}
                    >
                      {data.price < 1
                        ? data.price.toFixed(4)
                        : data.price < 10
                          ? data.price.toFixed(2)
                          : data.price < 1000
                            ? data.price.toFixed(1)
                            : Math.round(data.price).toLocaleString()}
                    </div>

                    <div>
                      <div
                        style={{
                          width: `${longWidth}px`,
                          height: isMobile ? "6px" : "8px",
                          background: "#4ade80",
                          borderRadius: "0 2px 2px 0",
                        }}
                      />
                    </div>
                  </div>
                );
              })}
          </div>

          {/* Current price indicator
          {currentPrice > 0 && (
            <div
              style={{
                marginTop: "12px",
                padding: isMobile ? "6px" : "8px",
                background: "rgba(255, 255, 255, 0.1)",
                borderRadius: "4px",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  fontSize: isMobile ? "9px" : "10px",
                  color: "#737373",
                }}
              >
                Current Price
              </div>
              <div
                style={{
                  fontSize: isMobile ? "12px" : "14px",
                  color: "#ffffff",
                  fontWeight: "bold",
                }}
              >
                ${currentPrice.toLocaleString()}
              </div>
            </div>
          )} */}
        </div>
      )}
    </div>
  );
}
