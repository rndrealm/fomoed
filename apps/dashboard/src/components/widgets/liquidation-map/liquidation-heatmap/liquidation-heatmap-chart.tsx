import React, { useEffect, useRef, useCallback } from "react";
import Chart from "chart.js/auto";

import "chartjs-adapter-dayjs-4/dist/chartjs-adapter-dayjs-4.esm";
import type { ZoomPluginOptions } from "chartjs-plugin-zoom/types/options";
import {
  evaluate_cmap,
  formatRgb,
  registerCandleStickPluginBrowser,
  registerChartPluginZoomInBrowser,
} from "@/charts/helpers";
import { LiquidHeatmapResponse } from "@/services/queries/charts/types";

import { LiqHeatmapController } from "@/charts/plugins/LiqMapPlugin";
import { cn, humanizeNumber } from "@/lib/utils";

Chart.register(LiqHeatmapController);

interface ICfgiCard {
  liquidationData: LiquidHeatmapResponse;
}

const LiquidationHeatmapChart = (props: ICfgiCard) => {
  useEffect(() => {
    registerChartPluginZoomInBrowser();
    registerCandleStickPluginBrowser();
  }, []);
  const { liquidationData } = props;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<Chart | null>(null);
  const [maxValue, setMaxValue] = React.useState(0);

  const chart_init = useCallback(
    (ctx: CanvasRenderingContext2D) => {
      const y = liquidationData.y;
      const prices = liquidationData.prices;
      const liq = liquidationData.liq;

      const liq_values = liq.map((i: any) => i[2]);
      const max_liq = Math.max(...liq_values);

      setMaxValue(max_liq);

      const liqHeatmapData = liq.map((item: any) => {
        const normalized = item[2] / max_liq;
        const [r, g, b] = evaluate_cmap(normalized, "viridis");
        const backgroundColor = formatRgb(r, g, b);

        return {
          x: prices[item[0]][0] * 1000,
          y: y[item[1]],
          backgroundColor,
        };
      });

      for (let i = 1; i < y.length; i++) {
        const yVal = y[i];
        const prevYVal = y[i - 1];

        const pointsWithYVal = liqHeatmapData.filter((i) => i.y == yVal);

        for (const p of pointsWithYVal) {
          // @ts-expect-error HOTFIX
          p.prevYVal = prevYVal;
        }
      }

      const datasets = [
        {
          type: "candlestick",
          data: prices.map(function (item: any) {
            return {
              x: item[0] * 1000,
              o: item[1],
              h: item[2],
              l: item[3],
              c: item[4],
            };
          }),
          borderColors: {
            up: "rgb(26, 152, 129)",
            down: "rgb(239, 57, 74)",
            unchanged: "#999",
          },
          backgroundColors: {
            up: "rgb(26, 152, 129)",
            down: "rgb(239, 57, 74)",
            unchanged: "#999",
          },
          // order: 10,
          yAxisID: "y",
          xAxisID: "x",
          parsing: false,
          barPercentage: 0.5,
          categoryPercentage: 1,
        },
        {
          type: "liqHeatmap",
          data: liqHeatmapData,
          yAxisID: "y",
          xAxisID: "x",
          parsing: false,
        },
      ];

      const minTimestampSeconds = prices[0][0] * 1000;
      const maxTimestampSeconds = prices[prices.length - 1][0] * 1000;
      const minPrice = Math.min(...y);
      const maxPrice = Math.max(...y);

      const zoomPluginOptions: ZoomPluginOptions = {
        zoom: {
          wheel: {
            enabled: true,
            speed: 0.05,
          },
          pinch: {
            enabled: true,
          },
          mode: "xy",
        },
        pan: {
          enabled: true,
          mode: "xy",
          threshold: 0,
        },
        limits: {
          x: {
            minRange: 1000 * 60 * 60 * 4,
            min: minTimestampSeconds,
            max: maxTimestampSeconds,
          },
          y: { minRange: 1000, min: minPrice, max: maxPrice },
        },
      };

      chartRef.current?.destroy();

      if (canvasRef.current) {
        chartRef.current = new Chart(canvasRef.current, {
          data: { datasets: datasets as any },
          // @ts-expect-error HOTFIX
          layout: { padding: 0 },
          options: {
            animation: false,
            responsive: false,
            maintainAspectRatio: false,
            scales: {
              x: {
                type: "time",
                offset: true,
              },
              y: {
                position: "right",
                type: "linear",
                grid: {
                  display: false,
                },
                ticks: {
                  callback: (value: string | number) => {
                    if (typeof value === "string") {
                      return value;
                    }

                    if (value < 0) {
                      return "";
                    }

                    return `$${Math.round(value / 1000)}k`;
                  },
                },
              },
            },
            interaction: {
              mode: "nearest",
              intersect: false,
            },
            plugins: {
              legend: {
                display: false,
              },
              zoom: zoomPluginOptions,
            },
          },
          plugins: [
            {
              id: "bg",
              beforeDraw: (chart: Chart) => {
                // Purple background
                const { ctx, chartArea } = chart;
                const { left, right, top, bottom } = chartArea;

                const gradient = ctx.createLinearGradient(0, top, 0, bottom);
                gradient.addColorStop(0, "#46035c");
                gradient.addColorStop(1, "#46035c");

                ctx.save();

                ctx.fillStyle = gradient;
                ctx.fillRect(left, top, right - left, bottom - top);

                ctx.restore();
              },
            },
          ],
        });
      }

      chartRef.current?.resize();
    },
    [liquidationData, setMaxValue]
  );

  useEffect(() => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    chart_init(ctx);
  }, [liquidationData, chart_init]);

  const humanizedMaxLiqValue = humanizeNumber(maxValue);
  return (
    <div className="relative w-full h-full pb-1 pl-6">
      <div
        className={cn(
          "pl-2 flex flex-col text-[#FFFFFF66] font-paralucent font-medium text-xs gap-y-[5px] duration-500 absolute -top-3 bottom-2 left-0 opacity-100",
          {
            "opacity-0": !humanizedMaxLiqValue,
          }
        )}
      >
        <div className="whitespace-nowrap">{humanizedMaxLiqValue}</div>

        <div
          className="flex-grow w-2 rounded"
          style={{
            background:
              "linear-gradient(180deg, #E7E60B 0%, #63C752 22.5%, #27A77D 47%, #2F5C86 75%, #44095F 100%)",
          }}
        ></div>

        <div>0</div>
      </div>

      <canvas
        width="400"
        // className="bg-no-repeat bg-auto"
        height={0}
        // style={{ backgroundPosition: "50px -30px" }}
        ref={canvasRef}
      ></canvas>
    </div>
  );
};

export default LiquidationHeatmapChart;
