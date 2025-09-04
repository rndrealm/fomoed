import React, { useEffect, useRef, useCallback } from "react";
import Chart from "chart.js/auto";

import "chartjs-adapter-dayjs-4/dist/chartjs-adapter-dayjs-4.esm";
import type { ZoomPluginOptions } from "chartjs-plugin-zoom/types/options";
import { commaFormatNumber, registerChartPluginZoomInBrowser } from "@/charts/helpers";
import { FormatLiquidationDataResult } from "@/services/queries/charts/types";

import { CrosshairPluginConfig, CrosshairPlugin } from "@/charts/plugins/CrosshairPlugin";
import { humanizeNumber } from "@/lib/utils";

Chart.register(CrosshairPlugin);

interface ICfgiCard {
  liquidationData: FormatLiquidationDataResult;
  viewOption?: string;
  token?: string;
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

const LiquidationChart = (props: ICfgiCard) => {
  useEffect(() => {
    registerChartPluginZoomInBrowser();
  }, []);
  const { liquidationData, viewOption, token } = props;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<Chart | null>(null);

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
            speed: 0.05,
          },
          pinch: {
            enabled: true,
          },
          mode: "x",
        },
        pan: {
          enabled: true,
          mode: "x",
          threshold: 0,
        },
        limits: {
          x: { minRange: dynamicMinRange, min: minPricePoint, max: maxPricePoint },
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
              return "$" + commaFormatNumber(val);
            },
          },
          {
            scaleId: "y",
            label: "At price",
            getText: () => (val) => humanizeNumber(val),
            getTextColor: () => () => "white",
          },
          {
            scaleId: "cumulative",
            label: "Cumulative",
            getText: () => (val) => humanizeNumber(val),
            getTextColor: () => () => "white",
          },
        ],
        crosshairEnableDelay: 200,
        labelStackDirection: "vertical",
      };

      const isAltcoin = token && token !== "BTC" && token !== "ETH";

      // Define the custom plugin to draw the price indicator
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
            const labelText = `Current Price: ${commaFormatNumber(liquidationData.currentPrice)}`;
            ctx.font = "bold 12px sans-serif";
            const textMetrics = ctx.measureText(labelText);
            const textWidth = textMetrics.width;
            const textHeight = 12;

            // Label box properties
            const padding = { x: 5, y: 4 };
            const boxWidth = textWidth + padding.x * 2;
            const boxHeight = textHeight + padding.y * 0;
            const boxY = top - boxHeight - 10;
            const boxX = xCoord - boxWidth / 2;

            // Draw label background
            ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
            ctx.fillRect(boxX, boxY, boxWidth, boxHeight);

            // Draw label text
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
                type: "bar",
                data: liquidationData.liqBars,
                order: 20,
                backgroundColor: liquidationData.liqBars.map((i) => i.color),
                xAxisID: "x",
                yAxisID: "y",
                // barPercentage: isAltcoin ? 1.0 : undefined,
                // categoryPercentage: isAltcoin ? 1.0 : undefined,
              },
              {
                type: "line",
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
                ticks: {
                  callback: (val: any) => {
                    const formatter = getScaleFormatter(liquidationData.maxPrice);
                    if (formatter.suffix === "K" || formatter.suffix === "M") {
                      return Math.round(val / formatter.divisor) + formatter.suffix;
                    } else {
                      return (val / formatter.divisor).toFixed(3) + formatter.suffix;
                    }
                  },
                },
                grid: {
                  display: false,
                },
                min: liquidationData.minPrice,
                max: liquidationData.maxPrice,
                offset: false,
              },
              y: {
                type: "linear",
                grid: {
                  color: "#fff1",
                },
                border: {
                  dash: [4, 2],
                },
                min: 0,
                ticks: {
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
                  callback: (val: any) => {
                    const formatter = getScaleFormatter(liquidationData.maxCumulativeValue);
                    return `${Math.round(val / formatter.divisor)}${formatter.suffix}`;
                  },
                },
              },
            },
            // @ts-expect-error HOTFIX
            interaction: false,
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
          },
          plugins: [customPriceIndicatorPlugin],
        });
      }

      chartRef.current?.resize();
    },
    [liquidationData, token],
  );

  useEffect(() => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    chart_init(ctx);
  }, [liquidationData, viewOption, chart_init, token]);

  return (
    <div className="relative h-full w-full pb-1">
      <canvas width="400" height={0} ref={canvasRef}></canvas>
    </div>
  );
};

export default LiquidationChart;
