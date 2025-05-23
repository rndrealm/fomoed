import React, { useEffect, useRef, useCallback } from "react";
import Chart from "chart.js/auto";
import type { ChartDataset } from "chart.js/auto";
import "chartjs-adapter-dayjs-4/dist/chartjs-adapter-dayjs-4.esm";
import type { ZoomPluginOptions } from "chartjs-plugin-zoom/types/options";
import dayjs from "dayjs";
import { registerChartPluginZoomInBrowser } from "@/charts/helpers";
import { CfgiDataResponse } from "@/services/queries/charts/types";

import {
  CrosshairPluginConfig,
  CrosshairPlugin,
} from "@/charts/plugins/CrosshairPlugin";

Chart.register(CrosshairPlugin);

interface ICfgiCard {
  cfgiData: CfgiDataResponse[];
  viewOption: string;
}

const color = "#47A663";

const SimpleCfgiChart = (props: ICfgiCard) => {
  useEffect(() => {
    registerChartPluginZoomInBrowser();
  }, []);
  const { cfgiData: data, viewOption } = props;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<Chart | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const chart_init = useCallback(
    (ctx: CanvasRenderingContext2D) => {
      const formatted_data = data.filter((d) => d.cfgi);
      const cfgi_data = formatted_data.map((c) => c.cfgi);

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

      const labels = formatted_data.map((d) => d.date);

      const minDate = formatted_data[0].date;
      const maxDate = formatted_data[formatted_data.length - 1].date;

      const zoomPluginOptions: ZoomPluginOptions = {
        zoom: {
          wheel: {
            enabled: true,
          },
          pinch: {
            enabled: true,
          },
          mode: "x",
          scaleMode: "y",
        },
        pan: {
          enabled: true,
          mode: "xy",
          threshold: 0,
        },
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
            getText: () => (val) => {
              return dayjs(val).format("DD MMM YYYY");
            },
          },
          {
            scaleId: "y",
            label: "CFGI",
            getText: () => (val) => val.toFixed(0),
            getTextColor: () => (val) => "white",
          },
        ],
        crosshairEnableDelay: 200,
        labelStackDirection: "vertical",
      };

      const options = {
        animation: {
          duration: 0,
        },
        responsive: false,
        maintainAspectRatio: false,
        interaction: false,
        scales: {
          y: {
            beginAtZero: true,
            grid: {
              display: true,
              color: "#272525",
              offset: false,
            },
            ticks: {
              display: true,
              callback: (val: any) => {
                return Math.round(val);
              },
            },
            border: {
              display: false,
            },
            min: 0,
            max: 100,
            step: 20,
            color: "#FFFFFF",
          },
          x: {
            type: "time",
            // beginAtZero: true,
            grid: {
              display: true,
              color: "#272525",
              offset: false,
            },
            ticks: {
              maxRotation: 0,
              minRotation: 0,
              // autoSkipPadding: 10
            },
            border: {
              display: false,
            },
            // beforeFit: function (axis: any) {
            // 	var l = axis.getLabels();
            // 	axis.ticks.push({ value: axis.max, label: l[axis.max] });
            // }
          },
        },
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            enabled: false,
          },
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
      if (!containerRef.current) return;
      const gradient = ctx.createLinearGradient(
        0,
        0,
        0,
        Math.round(containerRef.current.clientHeight)
      );

      gradient.addColorStop(0, "rgba(71, 166, 99, 0.4)");
      gradient.addColorStop(1, "rgba(71, 166, 99, 0)");

      chartRef.current.data.datasets[0].backgroundColor = gradient;
      chartRef.current.update();

      chartRef.current.resize();
    },
    [data]
  );

  useEffect(() => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    chart_init(ctx);
  }, [data, viewOption, chart_init]);
  return (
    <div ref={containerRef} className="w-full h-full pb-1">
      <canvas width="400" height={0} ref={canvasRef}></canvas>
    </div>
  );
};

export default SimpleCfgiChart;
