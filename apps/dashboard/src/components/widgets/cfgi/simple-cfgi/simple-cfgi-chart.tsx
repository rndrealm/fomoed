"use client";

import { registerChartPluginZoomInBrowser } from "@/charts/helpers";
import { CfgiDataResponse } from "@/services/queries/charts/types";
import type { ChartDataset } from "chart.js/auto";
import Chart from "chart.js/auto";
import "chartjs-adapter-dayjs-4/dist/chartjs-adapter-dayjs-4.esm";
import type { ZoomPluginOptions } from "chartjs-plugin-zoom/types/options";
import dayjs from "dayjs";
import { memo, useCallback, useEffect, useRef } from "react";
import { CrosshairPlugin, CrosshairPluginConfig } from "@/charts/plugins/CrosshairPlugin";
import { signalModalConfigAtom } from "@/lib/atoms/signalModalAtom";
import { useSetAtom } from "jotai";

Chart.register(CrosshairPlugin);

interface ICfgiCard {
  cfgiData: CfgiDataResponse[];
  isFullscreen: boolean;
}

const color = "#47A663";

const SimpleCfgiChart = memo((props: ICfgiCard) => {
  useEffect(() => {
    registerChartPluginZoomInBrowser();
  }, []);

  const { cfgiData: data } = props;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<Chart | null>(null);
  const setSignalModalConfig = useSetAtom(signalModalConfigAtom);

  const chart_init = useCallback(
    (ctx: CanvasRenderingContext2D) => {
      const formatted_data = data.filter((d) => d.cfgi);
      const cfgi_data = formatted_data.map((c) => c.cfgi);
      const labels = formatted_data.map((d) => d.date);

      const cfgiData: ChartDataset<"line"> = {
        type: "line",
        data: cfgi_data,
        label: "Fear and Greed Index",
        order: 1,
        fill: true,
        borderColor: color,
        borderWidth: 1,
        pointRadius: 0,
        xAxisID: "x",
      };

      const minDate = formatted_data[0].date;
      const maxDate = formatted_data[formatted_data.length - 1].date;

      const zoomPluginOptions: ZoomPluginOptions = {
        zoom: {
          wheel: { enabled: true },
          pinch: { enabled: true },
          mode: "x",
          scaleMode: "y",
        },
        pan: { enabled: true, mode: "xy", threshold: 0 },
        limits: {
          x: {
            minRange: 1000 * 60 * 60 * 24 * 1,
            min: minDate as any,
            max: maxDate as any,
          },
          y: { min: 0 },
        },
      };

      const crosshairPluginOptions: CrosshairPluginConfig = {
        labels: [
          {
            scaleId: "x",
            label: "Date & Time",
            getText: () => (val) => dayjs(val).format("DD MMM YYYY"),
          },
          {
            scaleId: "y",
            label: "CFGI",
            getText: () => (val) => val.toFixed(0),
            getTextColor: () => () => "white",
          },
        ],
        crosshairEnableDelay: 200,
        labelStackDirection: "vertical",
      };

      const options = {
        animation: { duration: 0 },
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: "nearest" },
        scales: {
          y: {
            beginAtZero: true,
            grid: { display: true, color: "#272525", offset: false },
            ticks: { display: true, callback: (val: any) => Math.round(val) },
            border: { display: false },
            min: 0,
            max: 100,
          },
          x: {
            type: "time",
            grid: { display: true, color: "#272525", offset: false },
            ticks: { maxRotation: 0, minRotation: 0 },
            border: { display: false },
          },
        },
        onClick: (e: any) => {
          const chart = chartRef.current;
          if (!chart) return;
          const rect = e.native ? e.native.target.getBoundingClientRect() : chart.canvas.getBoundingClientRect();
          const canvasPosition = {
            x: e.native ? e.native.clientX - rect.left : e.x,
            y: e.native ? e.native.clientY - rect.top : e.y,
          };
          const indexYValue = chart.scales.y.getValueForPixel(canvasPosition.y);
          setSignalModalConfig({
            isOpen: true,
            data: [
              {
                dataSource: "cfgi",
                value: Math.round(indexYValue as number),
                topic: `cfgi_${data[0].symbol}`,
              },
            ],
          });
        },
        plugins: {
          legend: { display: false },
          tooltip: { enabled: false },
          zoom: zoomPluginOptions,
          crosshair: crosshairPluginOptions,
        },
      };

      if (!canvasRef.current) return;
      chartRef.current?.destroy();

      chartRef.current = new Chart(canvasRef.current, {
        data: {
          labels,
          datasets: [cfgiData],
        },
        options,
      } as any);

      const gradient = ctx.createLinearGradient(0, 0, 0, 250);
      gradient.addColorStop(0, "rgba(71, 166, 99, 0.4)");
      gradient.addColorStop(1, "rgba(71, 166, 99, 0)");

      chartRef.current.data.datasets[0].backgroundColor = gradient;
      chartRef.current.update();
    },
    [data, setSignalModalConfig],
  );

  useEffect(() => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    chart_init(ctx);
  }, [data, chart_init]);

  return (
    <div className="relative h-full w-full">
      <canvas ref={canvasRef} className="absolute inset-0 !h-full !w-full"></canvas>
    </div>
  );
});

SimpleCfgiChart.displayName = "SimpleCfgiChart";
export default SimpleCfgiChart;