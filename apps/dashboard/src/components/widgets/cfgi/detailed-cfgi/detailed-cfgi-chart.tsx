"use client";

import {
  commaFormatNumber,
  registerChartPluginZoomInBrowser,
} from "@/charts/helpers";
import { CfgiDataResponse } from "@/services/queries/charts/types";
import type { ChartDataset } from "chart.js/auto";
import Chart from "chart.js/auto";
import "chartjs-adapter-dayjs-4/dist/chartjs-adapter-dayjs-4.esm";
import type { ZoomPluginOptions } from "chartjs-plugin-zoom/types/options";
import dayjs from "dayjs";
import { useCallback, useEffect, useRef } from "react";

import {
  CrosshairPlugin,
  CrosshairPluginConfig,
} from "@/charts/plugins/CrosshairPlugin";
import { TabOptions } from "@/constant/cfgi-data";
import { signalModalConfigAtom } from "@/lib/atoms/signalModalAtom";
import { useAtom } from "jotai";

Chart.register(CrosshairPlugin);

interface ICfgiCard {
  cfgiData: CfgiDataResponse[];
  viewOption: string;
}

const DetailedCfgiChart = (props: ICfgiCard) => {
  useEffect(() => {
    registerChartPluginZoomInBrowser();
  }, []);
  const { cfgiData, viewOption } = props;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<Chart | null>(null);
  const [_, setSignalModalConfig] = useAtom(signalModalConfigAtom);

  function get_data_color(data: number) {
    return data <= 25
      ? "#FF3B10"
      : data <= 50
        ? "#EA9924"
        : data <= 75
          ? "#399F57"
          : "#05A5A6";
  }

  const chart_init = useCallback(
    (ctx: CanvasRenderingContext2D) => {
      const data = cfgiData.filter((d) => d.price && d.cfgi);
      console.log("cfgiData", cfgiData);
      const prices_data = data.map((d) => {
        return { x: d.date, y: d.price };
        // return { x: d.date, y: Math.round(d.price) };
      });
      const cfgi_data = data.map((c) => {
        return { x: c.date, y: c.cfgi };
      });

      const gradient = ctx.createLinearGradient(0, 0, 0, 200);
      gradient.addColorStop(0, "rgba(71, 166, 99, 0.4)");
      gradient.addColorStop(1, "rgba(71, 166, 99, 0)");

      const chart_bar_data: ChartDataset<"bar"> = {
        type: "bar",
        data: cfgi_data as any,
        backgroundColor: cfgi_data.map((c) => get_data_color(c.y)),
        yAxisID: "indexY",
        xAxisID: "x",
        label: "Fear and Greed Index",
        order: 2,
        categoryPercentage: 1,
        barPercentage: 1,
        barThickness: "flex",
        parsing: false,
      };

      const chart_line_data: ChartDataset<"line"> = {
        type: "line",
        data: prices_data as any,
        yAxisID: "priceY",
        xAxisID: "x",
        label: "Price",
        order: 1,
        spanGaps: true,
        pointRadius: 0,
        borderColor: "white",
        borderWidth: 2,
        parsing: false,
      };

      const minDate = data[0].date;
      const maxDate = data[data.length - 1].date;

      // On homepage, period of 24 hours is fetched
      const periodSeconds = 24 * 60 * 60;

      const zoomPluginOptions: ZoomPluginOptions = {
        zoom: {
          wheel: {
            enabled: true,
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
          x: {
            minRange: periodSeconds * 1000,
            min: minDate as any,
            max: maxDate as any,
          },
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
            scaleId: "indexY",
            label: "CFGI",
            getText: () => (val) => val.toFixed(0),
            getTextColor: () => (val) => get_data_color(val),
          },
          {
            scaleId: "priceY",
            label: "Price",
            getText: () => (val) => {
              if (val < 1000) {
                return "$" + commaFormatNumber(val);
              }
              return "$" + commaFormatNumber(Math.round(val));
            },
          },
        ],
        crosshairEnableDelay: 200,
        labelStackDirection: "vertical",
      };

      const options = {
        interaction: {
          mode: "nearest",
        },
        responsive: true,
        maintainAspectRatio: false,
        animations: false,
        scales: {
          priceY: {
            beginAtZero: false,
            ticks: {
              font: { family: "sans-serif", size: 10 },
              source: "data",
              stepSize: 5000,
              callback: (value: number) => {
                // return `$${Math.round(value / 1000)}k`;
                if (value < 1000) return `$${value.toFixed(2)}`;
                return `$${Math.round(value / 1000)}k`;
              },
            },
            // Uncomment this to make the price scale fixed
            // min: minPrice,
            // max: maxPrice,
            position: "left",
          },
          indexY: {
            beginAtZero: true,
            grid: {
              display: true,
              drawOnChartArea: true,
              color: function (value: any, data: any) {
                return value.tick.value === 0
                  ? "rgba(255, 255, 255, 0.3)"
                  : get_data_color(value.tick.value);
              },
              lineWidth: 0.1,
              drawTicks: true,
            },
            ticks: {
              font: { family: "sans-serif", size: 10 },
              stepSize: 25,
              color: function (value: any, data: any) {
                return value.tick.value === 0
                  ? "rgba(255, 255, 255, 0.3)"
                  : get_data_color(value.tick.value);
              },
              display: true,
            },
            max: 100,
            position: "right",
          },
          x: {
            ticks: {
              minRotation: 0,
              maxRotation: 0,
              offset: false,
              source: "data",
              padding: 10,
              sampleSize: 1,
              font: { family: "sans-serif", size: 10 },
            },
            time: {
              unit: "month",
              displayFormats: {
                day: "DD MMM YY",
              },
              min: minDate,
              max: maxDate,
            },
            offset: false,
            type: "time",
          },
        },
        onClick: (e: any) => {
          const chart = chartRef.current;
          if (!chart) return;

          const rect = e.native
            ? e.native.target.getBoundingClientRect()
            : chart.canvas.getBoundingClientRect();

          const canvasPosition = {
            x: e.native ? e.native.clientX - rect.left : e.x,
            y: e.native ? e.native.clientY - rect.top : e.y,
          };

          // Get the y-axis values at the click position for both datasets
          const indexYValue = chart.scales.indexY.getValueForPixel(
            canvasPosition.y,
          );
          let priceYValue = null;

          // Only get price value if the price dataset is shown
          if (viewOption !== TabOptions[0].value) {
            priceYValue = chart.scales.priceY.getValueForPixel(
              canvasPosition.y,
            );
          }

          setSignalModalConfig({
            isOpen: true,
            data: [
              {
                dataSource: "cfgi",
                value: Math.round(indexYValue as number),
                topic: `cfgi_${data[0].symbol}`,
              },
              {
                dataSource: "price",
                value: priceYValue ? Math.round(priceYValue as number) : 0,
                topic: `${data[0].symbol}-USD`,
              },
            ],
          });
        },
        plugins: {
          legend: {
            display: false,
          },
          zoom: zoomPluginOptions,
          tooltip: {
            enabled: false,
            mode: "nearest",
            intersect: false,
          },
          crosshair: crosshairPluginOptions,
          doubleTapResetZoom: true,
        },
      };

      chartRef.current?.destroy();
      const chartType =
        viewOption === TabOptions[0].value
          ? [chart_bar_data]
          : [chart_bar_data, chart_line_data];
      if (canvasRef.current) {
        chartRef.current = new Chart(canvasRef.current, {
          data: { datasets: chartType as any },
          options: options as any,
        });
      }

      chartRef.current?.resize();
    },
    [cfgiData, viewOption, setSignalModalConfig],
  );

  useEffect(() => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    chart_init(ctx);
  }, [cfgiData, viewOption, chart_init]);

  return (
    <canvas
      width="400"
      height={0}
      ref={canvasRef}
      className="absolute top-0 left-0 right-0 bottom-0 !w-full !h-full"
    ></canvas>
  );
};

export default DetailedCfgiChart;
