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
}

const LiquidationChart = (props: ICfgiCard) => {
  useEffect(() => {
    registerChartPluginZoomInBrowser();
  }, []);
  const { liquidationData, viewOption } = props;
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
          // scaleMode: 'y'
        },
        pan: {
          enabled: true,
          mode: "x",
          threshold: 0,
        },
        limits: {
          x: { minRange: 100, min: minPricePoint, max: maxPricePoint },
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
            getTextColor: () => (val) => "white",
          },
          {
            scaleId: "cumulative",
            label: "Cumulative",
            getText: () => (val) => humanizeNumber(val),
            getTextColor: () => (val) => "white",
          },
        ],
        crosshairEnableDelay: 200,
        labelStackDirection: "vertical",
      };

      chartRef.current?.destroy();

      if (canvasRef.current) {
        chartRef.current = new Chart(canvasRef.current, {
          data: {
            datasets: [
              {
                type: "bar",
                data: liquidationData.liqBars,
                barThickness: 0.5,
                order: 20,
                backgroundColor: liquidationData.liqBars.map((i) => i.color),
                xAxisID: "x",
                yAxisID: "y",
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
            spanGaps: true,
            animation: false,
            responsive: false,
            maintainAspectRatio: false,
            scales: {
              x: {
                type: "linear",
                ticks: {
                  callback: (val: any) => {
                    return Math.round(val / 1000) + "K";
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
                  color: "#fff2",
                },
                border: {
                  dash: [4, 2],
                },
                min: 0,
                ticks: {
                  callback: (val: any) => `${Math.round(val / 1000000)}M`,
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
                  callback: (val: any) => `${Math.round(val / 1000000)}M`,
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
              annotation: {
                annotations: {
                  currentPriceLine: {
                    type: "line",
                    yMin: 0,
                    yMax: liquidationData.maxCumulativeValue * 1.15,
                    yScaleID: "cumulative",
                    borderColor: "red",
                    borderWidth: 2,
                    xMin: liquidationData.currentPrice,
                    xMax: liquidationData.currentPrice,
                    borderDash: [8, 4],
                    arrowHeads: {
                      end: {
                        backgroundColor: "red",
                        display: true,
                        fill: true,
                        borderDash: [0, 0],
                      },
                    },
                  },
                },
              },
              zoom: zoomPluginOptions,
            },
          },
        });
      }

      chartRef.current?.resize();
    },
    [liquidationData]
  );

  useEffect(() => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    chart_init(ctx);
  }, [liquidationData, viewOption, chart_init]);

  return (
    <div className="relative h-full w-full pb-1">
      <canvas width="400" height={0} ref={canvasRef}></canvas>
    </div>
  );
};

export default LiquidationChart;
