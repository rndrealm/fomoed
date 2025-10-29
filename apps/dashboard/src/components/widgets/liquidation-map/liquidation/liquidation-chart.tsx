import React, { useEffect, useRef, useCallback, memo } from "react";
import Chart from "chart.js/auto";
import "chartjs-adapter-dayjs-4/dist/chartjs-adapter-dayjs-4.esm";
import type { ZoomPluginOptions } from "chartjs-plugin-zoom/types/options";
import { commaFormatNumber, registerChartPluginZoomInBrowser } from "@/charts/helpers";
import { FormatLiquidationDataResult } from "@/services/queries/charts/types";
import { CrosshairPluginConfig, CrosshairPlugin } from "@/charts/plugins/CrosshairPlugin";
import { humanizeNumber, cn } from "@/lib/utils";

Chart.register(CrosshairPlugin);

interface ICfgiCard {
  liquidationData: FormatLiquidationDataResult;
  viewOption?: string;
  token?: string;
  isFullscreen: boolean;
}

const getScaleFormatter = (maxValue: number) => {
  if (maxValue >= 1000000) {
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
  if (currentPrice >= 10000) return 78;
  if (currentPrice >= 1000) return 3;
  if (currentPrice >= 100) return 0.5;
  if (currentPrice >= 10) return 0.02;
  if (currentPrice >= 1) return 0.002;
  if (currentPrice >= 0.1) return 0.0002;
  if (currentPrice >= 0.01) return 0.00002;
  if (currentPrice >= 0.001) return 0.000002;
  if (currentPrice >= 0.0001) return 0.0000002;
  return 0.000000002;
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
  const { liquidationData, viewOption, token, isFullscreen } = props;
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
      const dynamicMinRange = (maxPricePoint - minPricePoint) * 0.01 || 0.001;
      const maxShownCumulativeValue = liquidationData.maxCumulativeValue * 1.15;

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
              chartArea: { top, bottom },
              scales: { x },
            } = chart;
            const xCoord = x.getPixelForValue(liquidationData.currentPrice);

            // Draw Dashed Line
            ctx.save();
            ctx.beginPath();
            ctx.setLineDash([6, 6]);
            ctx.moveTo(xCoord, top);
            ctx.lineTo(xCoord, bottom);
            ctx.lineWidth = 2;
            ctx.strokeStyle = "red";
            ctx.stroke();
            ctx.restore();

            // Draw Arrowhead
            ctx.beginPath();
            ctx.moveTo(xCoord, top);
            ctx.lineTo(xCoord - 5, top + 8);
            ctx.lineTo(xCoord + 5, top + 8);
            ctx.closePath();
            ctx.fillStyle = "red";
            ctx.fill();

            // Draw Label
            const labelText = `Current Price: $${commaFormatNumber(liquidationData.currentPrice)}`;
            ctx.font = "bold 12px sans-serif";
            const textMetrics = ctx.measureText(labelText);
            const textWidth = textMetrics.width;
            const textHeight = 12;

            const padding = { x: 5, y: 4 };
            const boxWidth = textWidth + padding.x * 2;
            const boxHeight = textHeight + padding.y * 0;
            const boxY = top - boxHeight - 10;
            const boxX = xCoord - boxWidth / 2;

            ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
            ctx.fillRect(boxX, boxY, boxWidth, boxHeight);

            ctx.fillStyle = "white";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(labelText, xCoord, boxY + boxHeight / 2);
          }
        },
      };

      chartRef.current?.destroy();

      if (canvasRef.current) {
        chartRef.current = new Chart(canvasRef.current, {
          data: {
            datasets: [
              {
                type: "line",
                data: liquidationData.liqBars.map((bar) => ({ x: bar.x, y: 0 })),
                borderColor: "rgba(0,0,0,0)",
                backgroundColor: "rgba(0,0,0,0)",
                pointRadius: 0,
                borderWidth: 0,
                xAxisID: "x",
                yAxisID: "y",
                order: 0,
                label: "",
                parsing: false,
                hidden: true,
              },
              {
                type: "bar",
                data: liquidationData.liqBars.filter((bar) => bar.color === "#73D8DA"),
                order: 21,
                backgroundColor: "#73D8DA",
                xAxisID: "x",
                yAxisID: "y",
                barPercentage: 1.0,
                categoryPercentage: 0.9,
                stack: "liquidation-bars",
                label: "Long Liquidations",
                parsing: false,
              },
              {
                type: "bar",
                data: liquidationData.liqBars.filter((bar) => bar.color === "#FFC403"),
                order: 22,
                backgroundColor: "#FFC403",
                xAxisID: "x",
                yAxisID: "y",
                barPercentage: 1.0,
                categoryPercentage: 0.9,
                stack: "liquidation-bars",
                label: "Mid Liquidations",
                parsing: false,
              },
              {
                type: "bar",
                data: liquidationData.liqBars.filter((bar) => bar.color === "#ff5e00ff"),
                order: 23,
                backgroundColor: "#ff5e00ff",
                xAxisID: "x",
                yAxisID: "y",
                barPercentage: 1.0,
                categoryPercentage: 0.9,
                stack: "liquidation-bars",
                label: "High Liquidations",
                parsing: false,
              },
              {
                type: "bar",
                data: liquidationData.liqBars.filter((bar) => bar.color === "#6EC2F0"),
                order: 20,
                backgroundColor: "#6EC2F0",
                xAxisID: "x",
                yAxisID: "y",
                barPercentage: 1.0,
                categoryPercentage: 0.9,
                stack: "liquidation-bars",
                label: "10x Liquidations",
                parsing: false,
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
                min: zoomStateRef.current?.min !== undefined ? zoomStateRef.current.min : liquidationData.minPrice,
                max: zoomStateRef.current?.max !== undefined ? zoomStateRef.current.max : liquidationData.maxPrice,
                offset: false,
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
                    const maxBarValue = Math.max(...liquidationData.liqBars.map((bar) => bar.y));
                    const formatter = getScaleFormatter(maxBarValue);
                    return `${Math.round(val / formatter.divisor)}${formatter.suffix}`;
                  },
                },
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
      if (!document.hidden && chartRef.current && zoomStateRef.current) {
        setTimeout(() => {
          if (chartRef.current && zoomStateRef.current) {
            const chart = chartRef.current;
            if (zoomStateRef.current.min !== undefined && zoomStateRef.current.max !== undefined) {
              chart.zoomScale(
                "x",
                {
                  min: zoomStateRef.current.min,
                  max: zoomStateRef.current.max,
                },
                "none",
              );
            }
          }
        }, 50);
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

  useEffect(() => {
    if (!isFullscreen && chartRef.current) {
      const timeoutId = setTimeout(() => {
        chartRef.current?.resize();
      }, 100);

      return () => clearTimeout(timeoutId);
    }
  }, [isFullscreen]);

  return (
    <div className={cn("relative h-full w-full pb-1")}>
      <canvas width="400" height={0} ref={canvasRef}></canvas>
    </div>
  );
});

LiquidationChart.displayName = "LiquidationChart";

export default LiquidationChart;