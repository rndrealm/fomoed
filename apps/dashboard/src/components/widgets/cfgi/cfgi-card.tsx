import { FakeCgiData } from "@/constant/fake-cgi-data";
import React, { useEffect, useRef } from "react";
import Chart from "chart.js/auto";
import type {
  ChartDataset,
  CoreChartOptions,
  DatasetChartOptions,
  ElementChartOptions,
  LineControllerChartOptions,
  PluginChartOptions,
  ScaleChartOptions,
} from "chart.js/auto";
import "chartjs-adapter-dayjs-4/dist/chartjs-adapter-dayjs-4.esm";
import type { ZoomPluginOptions } from "chartjs-plugin-zoom/types/options";
import { CrosshairPluginConfig } from "@/charts/types";
import dayjs from "dayjs";
import { commaFormatNumber } from "@/charts/helpers";
import type { _DeepPartialObject } from "chart.js/dist/types/utils";
import { CfgiDataResponse } from "@/services/queries/charts/types";

interface ICfgiCard {
  cfgiData: CfgiDataResponse[];
}

const CfgiCard = ({ cfgiData }: ICfgiCard) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<Chart | null>(null);

  function get_data_color(data: number) {
    return data <= 25
      ? "#FF3B10"
      : data <= 50
        ? "#EA9924"
        : data <= 75
          ? "#399F57"
          : "#05A5A6";
  }

  function chart_init(ctx: CanvasRenderingContext2D) {
    const data = cfgiData.filter((d) => d.price && d.cfgi);

    const prices_data = data.map((d) => {
      return { x: d.date, y: Math.round(d.price) };
    });
    const cfgi_data = data.map((c) => {
      return { x: c.date, y: c.cfgi };
    });

    const gradient = ctx.createLinearGradient(0, 0, 0, 200);
    gradient.addColorStop(0, "rgba(71, 166, 99, 0.4)");
    gradient.addColorStop(1, "rgba(71, 166, 99, 0)");

    const chart_bar_data: ChartDataset<"bar"> = {
      type: "bar",
      data: cfgi_data,
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
      data: prices_data,
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
        x: { minRange: periodSeconds * 1000, min: minDate, max: maxDate },
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
          getText: () => (val) => "$" + commaFormatNumber(Math.round(val)),
        },
      ],
      crosshairEnableDelay: 200,
    };

    const options: _DeepPartialObject<
      CoreChartOptions<"bar"> &
        ElementChartOptions<"bar"> &
        PluginChartOptions<"bar"> &
        DatasetChartOptions<"bar"> &
        ScaleChartOptions<"bar"> &
        LineControllerChartOptions
    > = {
      interaction: false,
      responsive: false,
      maintainAspectRatio: false,
      animations: false,
      scales: {
        priceY: {
          beginAtZero: false,
          ticks: {
            font: { family: "Manrope", size: 10 },
            source: "data",
            stepSize: 5000,
            callback: (value: number) => {
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
            font: { family: "Manrope", size: 10 },
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
            font: { family: "Manrope", size: 10 },
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

    if (canvasRef.current) {
      chartRef.current = new Chart(canvasRef.current, {
        data: { datasets: [chart_bar_data, chart_line_data] },
        options,
      });
    }

    chartRef.current?.resize();
  }

  useEffect(() => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    chart_init(ctx);
  }, []);
  return <canvas width="400" ref={canvasRef}></canvas>;
};

export default CfgiCard;
