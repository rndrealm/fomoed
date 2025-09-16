import React, { useEffect, useRef, useCallback, memo } from "react";
import Chart from "chart.js/auto";
import "chartjs-adapter-dayjs-4/dist/chartjs-adapter-dayjs-4.esm";
import type { ZoomPluginOptions } from "chartjs-plugin-zoom/types/options";
import { commaFormatNumber, registerChartPluginZoomInBrowser } from "@/charts/helpers";
import { FormatExcLiquidationDataResult } from "@/services/queries/charts/types";
import { CrosshairPluginConfig, CrosshairPlugin } from "@/charts/plugins/CrosshairPlugin";
import { humanizeNumber, cn } from "@/lib/utils";
import { FullscreenableContainer } from "../../shared";

Chart.register(CrosshairPlugin);

interface ICfgiCard {
  liquidationData: FormatExcLiquidationDataResult;
  viewOption?: string;
  token?: string;
  isFullscreen: boolean;
  onAnimationComplete?: () => void;
}

const getScaleFormatter = (maxValue: number) => {
  if (maxValue >= 1000000000) {
    return {
      divisor: 1000000000,
      suffix: "B",
    };
  } else if (maxValue >= 1000000) {
    return {
      divisor: 1000000,
      suffix: "M",
    };
  } else if (maxValue >= 1000) {
    return {
      divisor: 1000,
      suffix: "K",
    };
  } else {
    return {
      divisor: 1,
      suffix: "",
    };
  }
};

const getPriceBucketSize = (currentPrice: number): number => {
  if (currentPrice >= 10000) return 116;
  if (currentPrice >= 1000) return 4.8;
  if (currentPrice >= 100) return 0.9;
  if (currentPrice >= 10) return 0.03;
  if (currentPrice >= 1) return 0.003;
  if (currentPrice >= 0.1) return 0.0003;
  if (currentPrice >= 0.01) return 0.00003;
  if (currentPrice >= 0.001) return 0.00003;
  if (currentPrice >= 0.0001) return 0.000003;
  return 0.00000003;
};

const getDecimalPlaces = (bucketSize: number): number => {
  let decimals = 0;
  let size = bucketSize;

  while (size < 1) {
    size *= 10;
    decimals++;
  }

  if (decimals <= 0) {
    decimals = 1;
  }

  return decimals - 1; 
};

const LiquidationChart = memo((props: ICfgiCard) => {
  const { liquidationData, viewOption, token, isFullscreen, onAnimationComplete } = props;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<Chart | null>(null);
  const zoomStateRef = useRef<{ min?: number; max?: number } | null>(null);

  const chart_init = useCallback(
    (ctx: CanvasRenderingContext2D) => {
      const gradientLong = ctx.createLinearGradient(0, 0, 0, 400);
      gradientLong.addColorStop(0, "#22AB9422");
      gradientLong.addColorStop(1, "#22AB9400");

      const gradientShort = ctx.createLinearGradient(0, 0, 0, 400);
      gradientShort.addColorStop(0, "#FF3B1022");
      gradientShort.addColorStop(1, "#FF3B1000");

      const minPricePoint = liquidationData.minPrice;
      const maxPricePoint = liquidationData.maxPrice;
      const priceRange = maxPricePoint - minPricePoint;

      const dynamicMinRange = Math.max(
        priceRange * 0.05,
        priceRange / (liquidationData.exchangeData.binance.length * 2),
      );

      const maxShownCumulativeValue = liquidationData.maxCumulativeValue * 1.15;

      const pricePadding = priceRange * 0.02;
      const adjustedMinPrice = Math.max(0, minPricePoint - pricePadding);
      const adjustedMaxPrice = maxPricePoint + pricePadding;

      const zoomPluginOptions: ZoomPluginOptions = {
        zoom: {
          wheel: {
            enabled: true,
            speed: 0.1,
            modifierKey: undefined,
          },
          pinch: {
            enabled: true,
          },
          mode: "x",
          onZoom: ({ chart }) => {
            const xScale = chart.scales.x;
            zoomStateRef.current = {
              min: xScale.min,
              max: xScale.max,
            };
          },
        },
        pan: {
          enabled: true,
          mode: "x",
          threshold: 0,
        },
        limits: {
          x: {
            minRange: dynamicMinRange,
            min: minPricePoint,
            max: maxPricePoint,
          },
          y: { min: 0 },
          cumulative: { min: 0, max: maxShownCumulativeValue },
        },
      };

      const crosshairPluginOptions: CrosshairPluginConfig = {
        labels: [
          {
            scaleId: "x",
            label: "Price",
            getText: () => (val) => {
              const bucket = getPriceBucketSize(liquidationData.maxPrice);
              const decimals = getDecimalPlaces(bucket);
              return "$" + Number(val).toFixed(decimals);
            },
          },
          {
            scaleId: "y",
            label: "At price",
            getText: () => (val) => humanizeNumber(val),
            getTextColor: () => () => "white",
            drawPoint: false,
          },
          {
            scaleId: "cumulative",
            label: "Cumulative",
            getText: () => (val) => humanizeNumber(val),
            getTextColor: () => () => "white",
          },
        ],
        crosshairEnableDelay: 50,
        labelStackDirection: "vertical",
      };

      const customPriceIndicatorPlugin = {
        id: "customPriceIndicator",
        afterDraw: (chart: Chart) => {
          if (liquidationData.currentPrice !== null) {
            const {
              ctx,
              chartArea: { top, bottom, left, right },
              scales: { x },
            } = chart;

            const currentPriceInRange = liquidationData.currentPrice >= x.min && liquidationData.currentPrice <= x.max;
            if (!currentPriceInRange) return;

            const xCoord = x.getPixelForValue(liquidationData.currentPrice);

            if (xCoord < left || xCoord > right) return;

            // --- Draw Dashed Line ---
            ctx.save();
            ctx.beginPath();
            ctx.setLineDash([6, 6]);
            ctx.moveTo(xCoord, top);
            ctx.lineTo(xCoord, bottom);
            ctx.lineWidth = 2;
            ctx.strokeStyle = "red";
            ctx.stroke();
            ctx.restore();

            // --- Draw Arrowhead ---
            ctx.beginPath();
            ctx.moveTo(xCoord, top);
            ctx.lineTo(xCoord - 5, top + 8);
            ctx.lineTo(xCoord + 5, top + 8);
            ctx.closePath();
            ctx.fillStyle = "red";
            ctx.fill();

            // --- Draw Label ---
            const labelText = `Current Price: $${commaFormatNumber(liquidationData.currentPrice)}`;
            ctx.font = "bold 12px sans-serif";
            const textMetrics = ctx.measureText(labelText);
            const textWidth = textMetrics.width;
            const textHeight = 12;

            // Label box properties
            const padding = { x: 5, y: 4 };
            const boxWidth = textWidth + padding.x * 2;
            const boxHeight = textHeight + padding.y * 2;
            const boxY = top - boxHeight - 10;
            let boxX = xCoord - boxWidth / 2;

            // Ensure label stays within chart bounds
            if (boxX < left) boxX = left;
            if (boxX + boxWidth > right) boxX = right - boxWidth;

            // Draw label background
            ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
            ctx.fillRect(boxX, boxY, boxWidth, boxHeight);

            // Draw label text
            ctx.fillStyle = "white";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(labelText, boxX + boxWidth / 2, boxY + boxHeight / 2);
          }
        },
      };

      chartRef.current?.destroy();

      if (canvasRef.current) {
        chartRef.current = new Chart(canvasRef.current, {
          data: {
            datasets: [
              {
                type: "bar",
                label: "Bybit",
                data: liquidationData.exchangeData.bybit,
                backgroundColor: "#73D8DA",
                xAxisID: "x",
                yAxisID: "y",
                barPercentage: 0.85,
                categoryPercentage: 1.0,
                stack: "liquidation-stack",
                order: 23, 
              },
              {
                type: "bar",
                label: "OKX",
                data: liquidationData.exchangeData.okx,
                backgroundColor: "#FFC403",
                xAxisID: "x",
                yAxisID: "y",
                barPercentage: 0.85,
                categoryPercentage: 1.0,
                stack: "liquidation-stack",
                order: 22,
              },
              {
                type: "bar",
                label: "Binance",
                data: liquidationData.exchangeData.binance,
                backgroundColor: "#ff5e00ff",
                xAxisID: "x",
                yAxisID: "y",
                barPercentage: 0.85,
                categoryPercentage: 1.0,
                stack: "liquidation-stack",
                order: 21, 
              },
              {
                type: "line",
                label: "Cumulative Long Liquidation",
                data: liquidationData.cumulativeLongLiqLeverage,
                borderColor: "#22AB94",
                spanGaps: true,
                pointRadius: 0,
                yAxisID: "cumulative",
                borderWidth: 2,
                order: 10,
                backgroundColor: gradientLong,
                fill: true,
                xAxisID: "x",
              },
              {
                type: "line",
                label: "Cumulative Short Liquidation",
                data: liquidationData.cumulativeShortLiqLeverage,
                borderColor: "#FF3B10",
                spanGaps: true,
                pointRadius: 0,
                yAxisID: "cumulative",
                borderWidth: 2,
                order: 10,
                backgroundColor: gradientShort,
                fill: true,
                xAxisID: "x",
              },
            ],
          },
          options: {
            layout: {
              padding: {
                top: 40,
              },
            },
            spanGaps: true,
            animation: false,
            responsive: true,
            maintainAspectRatio: false,
            onResize: (chart) => {},
            scales: {
              x: {
                type: "linear",
                stacked: true,
                ticks: {
                  maxTicksLimit: 15,
                  callback: (val: any) => {
                    const formatter = getScaleFormatter(liquidationData.maxPrice);

                    if (formatter.suffix === "K" || formatter.suffix === "M") {
                      return Math.round(val / formatter.divisor) + formatter.suffix;
                    } else {
                      const bucket = getPriceBucketSize(liquidationData.maxPrice);
                      const decimals = getDecimalPlaces(bucket);
                      return (val / formatter.divisor).toFixed(decimals) + formatter.suffix;
                    }
                  },
                },
                grid: {
                  display: false,
                },
                min: zoomStateRef.current?.min !== undefined ? zoomStateRef.current.min : adjustedMinPrice,
                max: zoomStateRef.current?.max !== undefined ? zoomStateRef.current.max : adjustedMaxPrice,
                offset: false,
              },
              cumulative: {
                type: "linear",
                grid: {
                  color: "#fff2",
                },
                position: "right",
                max: maxShownCumulativeValue,
                min: 0,
                border: {
                  dash: [8, 4],
                },
                ticks: {
                  maxTicksLimit: 15,
                  callback: (val: any) => {
                    const formatter = getScaleFormatter(liquidationData.maxCumulativeValue);
                    return `$${Math.round(val / formatter.divisor)}${formatter.suffix}`;
                  },
                },
              },
              y: {
                type: "linear",
                stacked: true,
                grid: {
                  color: "#fff1",
                },
                border: {
                  dash: [4, 2],
                },
                min: 0,
                ticks: {
                  maxTicksLimit: 15,
                  callback: (val: any) => {
                    const maxBarValue = Math.max(
                      ...liquidationData.exchangeData.binance.map((item) => item.y),
                      ...liquidationData.exchangeData.okx.map((item) => item.y),
                      ...liquidationData.exchangeData.bybit.map((item) => item.y),
                    );
                    const formatter = getScaleFormatter(maxBarValue);
                    return `$${Math.round(val / formatter.divisor)}${formatter.suffix}`;
                  },
                },
              },
            },
            interaction: {
              intersect: false,
              mode: "index",
              axis: "x",
            },
            plugins: {
              // @ts-expect-error HOTFIX
              crosshair: crosshairPluginOptions,
              legend: {
                display: false,
              },
              tooltip: {
                enabled: false,
              },
              zoom: zoomPluginOptions,
            },
            elements: {
              point: {
                radius: 0,
                hoverRadius: 0,
              },
              line: {
                tension: 0,
              },
            },
          },
          plugins: [customPriceIndicatorPlugin],
        });
      }

      chartRef.current?.resize();
    },
    [liquidationData],
  );

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && chartRef.current) {
        if (zoomStateRef.current && zoomStateRef.current.min !== undefined && zoomStateRef.current.max !== undefined) {
          setTimeout(() => {
            if (chartRef.current && zoomStateRef.current) {
              const chart = chartRef.current;
              chart.zoomScale(
                "x",
                {
                  min: zoomStateRef.current.min!,
                  max: zoomStateRef.current.max!,
                },
                "none",
              );
            }
          }, 100);
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  useEffect(() => {
    zoomStateRef.current = null;
  }, [token]);

  useEffect(() => {
    const initChart = async () => {
      await registerChartPluginZoomInBrowser();
      if (!canvasRef.current) return;
      const ctx = canvasRef.current?.getContext("2d");
      if (!ctx) return;
      chart_init(ctx);
    };

    initChart();
  }, [liquidationData, viewOption, chart_init, token]);

  return (
    //<FullscreenableContainer isFullscreen={isFullscreen} onAnimationComplete={onAnimationComplete}>
      <div className={cn("relative h-full w-full pb-1", isFullscreen && "pt-[50px]")}>
        <canvas width="400" height={0} ref={canvasRef}></canvas>
      </div>
    //</FullscreenableContainer>
  );
});

LiquidationChart.displayName = "LiquidationChart";

export default LiquidationChart;
