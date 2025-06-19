"use client";

import {
  commaFormatNumber,
  registerChartPluginZoomInBrowser,
} from "@/charts/helpers";
import Chart from "chart.js/auto";
import "chartjs-adapter-dayjs-4/dist/chartjs-adapter-dayjs-4.esm";
import type { ZoomPluginOptions } from "chartjs-plugin-zoom/types/options";
import dayjs from "dayjs";
import { useCallback, useEffect, useRef, useState } from "react";

import {
  CrosshairPlugin,
  CrosshairPluginConfig,
} from "@/charts/plugins/CrosshairPlugin";

Chart.register(CrosshairPlugin);

// Custom plugin to draw zero line for sentiment
const ZeroLinePlugin = {
  id: "zeroLine",
  afterDraw: (chart: any) => {
    const { ctx, chartArea, scales } = chart;
    const sentimentScale = scales.sentimentY;

    if (!sentimentScale || !chartArea) return;

    const zeroY = sentimentScale.getPixelForValue(0);

    // Only draw if zero line is within chart area
    if (zeroY >= chartArea.top && zeroY <= chartArea.bottom) {
      ctx.save();
      ctx.strokeStyle = "rgba(255, 255, 255, 0.5)";
      ctx.lineWidth = 1;
      ctx.setLineDash([5, 5]);

      ctx.beginPath();
      ctx.moveTo(chartArea.left, zeroY);
      ctx.lineTo(chartArea.right, zeroY);
      ctx.stroke();

      ctx.restore();
    }
  },
};

const PlusButtonPlugin = {
  id: "plusButton",
  afterEvent: (chart: any, args: any) => {
    const { event } = args;

    if (!chart.options.plugins?.plusButton?.onUpdate) {
      return;
    }

    if (event.type === "mousemove") {
      const chartArea = chart.chartArea;
      const yAxis = chart.scales.sentimentY;
      if (!chartArea || !yAxis) {
        chart.custom_plusButton = { visible: false };
        return;
      }

      const { x, y } = event;
      if (
        x >= chartArea.left &&
        x <= chartArea.right &&
        y >= chartArea.top &&
        y <= chartArea.bottom
      ) {
        const value = yAxis.getValueForPixel(y);
        chart.custom_plusButton = {
          visible: true,
          top: y,
          left: yAxis.left,
          value: value,
        };
      } else {
        if (chart.custom_plusButton) {
          chart.custom_plusButton.visible = false;
        }
      }
      args.changed = true;
    }

    if (event.type === "click") {
      const button = chart.custom_plusButton;
      if (button && button.visible && button.hitbox) {
        const { x, y } = event;
        const { x: hx, y: hy, width: hw, height: hh } = button.hitbox;
        if (x >= hx && x <= hx + hw && y >= hy && y <= hy + hh) {
          chart.options.plugins.plusButton.onUpdate({
            visible: true,
            top: button.top,
            left: button.left,
            value: button.value,
          });
          button.visible = false;
          args.changed = true;
        }
      }
    }
  },
  afterDraw: (chart: any) => {
    const button = chart.custom_plusButton;
    if (button && button.visible) {
      const { ctx } = chart;
      const yAxis = chart.scales.sentimentY;
      if (!yAxis) return;

      const size = 24;
      const btnLeft = yAxis.left - size - 8;
      const btnTop = button.top - size / 2;

      ctx.save();
      // Draw button background
      ctx.fillStyle = "#2a2e39";
      ctx.strokeStyle = "#434651";
      ctx.lineWidth = 1;
      const cornerRadius = 4;
      ctx.beginPath();
      ctx.moveTo(btnLeft + cornerRadius, btnTop);
      ctx.lineTo(btnLeft + size - cornerRadius, btnTop);
      ctx.quadraticCurveTo(
        btnLeft + size,
        btnTop,
        btnLeft + size,
        btnTop + cornerRadius
      );
      ctx.lineTo(btnLeft + size, btnTop + size - cornerRadius);
      ctx.quadraticCurveTo(
        btnLeft + size,
        btnTop + size,
        btnLeft + size - cornerRadius,
        btnTop + size
      );
      ctx.lineTo(btnLeft + cornerRadius, btnTop + size);
      ctx.quadraticCurveTo(
        btnLeft,
        btnTop + size,
        btnLeft,
        btnTop + size - cornerRadius
      );
      ctx.lineTo(btnLeft, btnTop + cornerRadius);
      ctx.quadraticCurveTo(btnLeft, btnTop, btnLeft + cornerRadius, btnTop);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Draw plus icon
      ctx.fillStyle = "white";
      ctx.font = "16px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("+", btnLeft + size / 2, btnTop + size / 2 - 1.5); //s

      ctx.restore();

      button.hitbox = { x: btnLeft, y: btnTop, width: size, height: size };
    }
  },
};

// Plugin to set vertical gradient for sentiment line
const GradientLinePlugin = {
  id: "gradientLinePlugin",
  beforeDatasetsDraw: (chart: any) => {
    const ctx = chart.ctx;
    const yScale = chart.scales["sentimentY"];
    if (
      !yScale ||
      typeof yScale.top !== "number" ||
      typeof yScale.bottom !== "number"
    )
      return;

    const yZero = yScale.getPixelForValue(0);
    if (typeof yZero !== "number" || isNaN(yZero)) return;
    if (yScale.top === yScale.bottom) return;

    const gradient = ctx.createLinearGradient(0, yScale.top, 0, yScale.bottom);
    const zeroRel = (yZero - yScale.top) / (yScale.bottom - yScale.top);

    // Green to gray to red for the line (wider transition)
    gradient.addColorStop(0, "#47A663"); // green
    gradient.addColorStop(Math.max(0, Math.min(1, zeroRel - 0.2)), "#47A663");
    gradient.addColorStop(Math.max(0, Math.min(1, zeroRel - 0.05)), "#1d4529"); // gray starts
    gradient.addColorStop(Math.max(0, Math.min(1, zeroRel + 0.05)), "#521305"); // gray ends
    gradient.addColorStop(Math.max(0, Math.min(1, zeroRel + 0.2)), "#FF3B10");
    gradient.addColorStop(1, "#FF3B10"); // red

    // Set the gradient as borderColor for the sentiment dataset
    const sentimentDataset = chart.data.datasets.find(
      (ds: any) => ds.label === "Sentiment"
    );
    if (sentimentDataset) {
      sentimentDataset.borderColor = gradient;

      // Background gradient: green above zero, subtle red below zero
      const bgGradient = ctx.createLinearGradient(
        0,
        yScale.top,
        0,
        yScale.bottom
      );
      bgGradient.addColorStop(0, "rgba(71, 166, 99, 0.4)"); // green
      bgGradient.addColorStop(
        Math.max(0, Math.min(1, zeroRel)),
        "rgba(71, 166, 99, 0.0)"
      ); // fade out green at zero
      bgGradient.addColorStop(
        Math.max(0, Math.min(1, zeroRel)),
        "rgba(255, 59, 16, 0.08)"
      ); // subtle red starts at zero
      bgGradient.addColorStop(1, "rgba(255, 59, 16, 0.18)"); // subtle red at bottom
      sentimentDataset.backgroundColor = bgGradient;
    }
  },
};

Chart.register(ZeroLinePlugin);
Chart.register(GradientLinePlugin);
Chart.register(PlusButtonPlugin);

interface SentimentDataPoint {
  value: number;
  datetime: string;
}

interface PriceDataPoint {
  price: number;
  datetime: string;
}

interface IWeightedSentimentChart {
  sentimentData: SentimentDataPoint[];
  priceData: PriceDataPoint[];
  period: string;
}

const WeightedSentimentChart = (props: IWeightedSentimentChart) => {
  useEffect(() => {
    registerChartPluginZoomInBrowser();
  }, []);

  const { sentimentData, priceData, period } = props;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<Chart | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [menu, setMenu] = useState<{
    visible: boolean;
    top: number;
    left: number;
    value: number;
  }>({ visible: false, top: 0, left: 0, value: 0 });

  useEffect(() => {
    if (!canvasRef.current) return;

    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;

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
          minRange: 15 * 60 * 1000,
        },
      },
    };

    const crosshairPluginOptions: CrosshairPluginConfig = {
      labels: [
        {
          scaleId: "x",
          label: "Date & Time",
          getText: () => (val) => {
            return dayjs(val).format("DD MMM YYYY HH:mm");
          },
        },
        {
          scaleId: "sentimentY",
          label: "Sentiment",
          getText: () => (val) => val.toFixed(4),
          getTextColor: () => (val) => (val >= 0 ? "#47A663" : "#FF3B10"),
        },
        {
          scaleId: "priceY",
          label: "Price",
          getText: () => (val) => "$" + commaFormatNumber(Math.round(val)),
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
              return `$${Math.round(value / 1000)}k`;
            },
          },
          position: "left",
          grid: {
            display: true,
            color: "rgba(255, 255, 255, 0.1)",
          },
        },
        sentimentY: {
          beginAtZero: false,
          grid: {
            display: true,
            color: "rgba(255, 255, 255, 0.1)",
            lineWidth: 0.5,
          },
          ticks: {
            font: { family: "sans-serif", size: 10 },
            callback: function (value: any) {
              if (Math.abs(value) >= 10) {
                return value.toFixed(0);
              } else if (Math.abs(value) >= 1) {
                return value.toFixed(1);
              } else {
                return value.toFixed(2);
              }
            },
            color: function (value: any) {
              return value.tick.value === 0
                ? "rgba(255, 255, 255, 0.5)"
                : value.tick.value > 0 //
                  ? "#47A663"
                  : "#FF3B10";
            },
          },
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
            displayFormats: {
              minute: "HH:mm",
              hour: "DD MMM HH:mm",
              day: "DD MMM YY",
            },
          },
          offset: false,
          type: "time",
          grid: {
            display: true,
            color: "rgba(255, 255, 255, 0.1)",
          },
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
        plusButton: {
          onUpdate: (data: any) => {
            setMenu(data);
          },
        },
      },
    };

    chartRef.current = new Chart(ctx, {
      data: { datasets: [] },
      options: options as any,
    });

    return () => {
      chartRef.current?.destroy();
    };
  }, []);

  useEffect(() => {
    const chart = chartRef.current;
    if (!chart || !sentimentData || !priceData) return;

    // Only filter out completely invalid data.
    const filteredSentimentData = sentimentData.filter(
      (d) => d.value !== null && d.value !== undefined && !isNaN(d.value)
    );
    const filteredPriceData = priceData.filter(
      (d) => d.price !== null && d.price !== undefined && !isNaN(d.price)
    );

    // Sort data by date to ensure correct rendering
    filteredSentimentData.sort(
      (a, b) => new Date(a.datetime).getTime() - new Date(b.datetime).getTime()
    );
    filteredPriceData.sort(
      (a, b) => new Date(a.datetime).getTime() - new Date(b.datetime).getTime()
    );

    if (filteredSentimentData.length === 0 || filteredPriceData.length === 0) {
      chart.data.datasets = [];
      chart.update();
      return;
    }

    const sentiment_chart_data = filteredSentimentData.map((d) => {
      return { x: new Date(d.datetime), y: d.value };
    });

    const price_chart_data = filteredPriceData.map((d) => {
      return { x: new Date(d.datetime), y: Math.round(d.price) };
    });

    // Single dataset for sentiment with dynamic segment coloring
    const sentiment_dataset: any = {
      type: "line",
      data: sentiment_chart_data as any,
      borderColor: "#47A663", // fallback, will be overridden by plugin
      borderWidth: 2,
      fill: true,
      yAxisID: "sentimentY",
      xAxisID: "x",
      label: "Sentiment",
      order: 2,
      spanGaps: true,
      pointRadius: 0,
      parsing: false,
    };

    const price_dataset: any = {
      type: "line",
      data: price_chart_data as any,
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

    chart.data.datasets = [price_dataset, sentiment_dataset];

    const minDate = Math.min(
      sentiment_chart_data[0]?.x?.getTime() || Date.now(),
      price_chart_data[0]?.x?.getTime() || Date.now()
    );
    const maxDate = Math.max(
      sentiment_chart_data[sentiment_chart_data.length - 1]?.x?.getTime() ||
        Date.now(),
      price_chart_data[price_chart_data.length - 1]?.x?.getTime() || Date.now()
    );

    // Calculate period in seconds for zoom limits
    const periodSeconds =
      period === "15m"
        ? 15 * 60
        : period === "1h"
          ? 60 * 60
          : period === "4h"
            ? 4 * 60 * 60
            : period === "1d"
              ? 24 * 60 * 60
              : 15 * 60;

    if (chart.options.plugins?.zoom?.limits?.x) {
      chart.options.plugins.zoom.limits.x.minRange = periodSeconds * 1000;
      chart.options.plugins.zoom.limits.x.min = minDate;
      chart.options.plugins.zoom.limits.x.max = maxDate;
    }

    if (chart.options.scales?.x && chart.options.scales.x.type === "time") {
      chart.options.scales.x.min = minDate;
      chart.options.scales.x.max = maxDate;
      if (chart.options.scales.x.time) {
        chart.options.scales.x.time.unit =
          period === "15m"
            ? "minute"
            : period === "1h"
              ? "hour"
              : period === "4h"
                ? "hour"
                : period === "1d"
                  ? "day"
                  : "minute";
      }
    }

    chart.update();
  }, [sentimentData, priceData, period]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menu.visible &&
        !event.composedPath().some((el: any) => el.dataset?.menu)
      ) {
        setMenu((m) => ({ ...m, visible: false }));
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menu.visible]);

  return (
    <div style={{ position: "relative", height: "100%" }} ref={containerRef}>
      <canvas ref={canvasRef}></canvas>
      {menu.visible && (
        <div
          data-menu
          style={{
            position: "absolute",
            top: `${menu.top}px`,
            left: `${menu.left}px`,
            transform: "translate(calc(-100% - 40px), -50%)",
            backgroundColor: "#2a2e39",
            border: "1px solid #434651",
            borderRadius: "8px",
            color: "white",
            zIndex: 20,
            width: "250px",
            padding: "8px",
            boxShadow: "0 2px 10px rgba(0,0,0,0.5)",
          }}
        >
          <button
            style={{
              all: "unset",
              display: "block",
              width: "calc(100% - 16px)",
              padding: "8px",
              cursor: "pointer",
              borderRadius: "4px",
              textAlign: "left",
            }}
            onMouseOver={(e) =>
              (e.currentTarget.style.backgroundColor = "#434651")
            }
            onMouseOut={(e) =>
              (e.currentTarget.style.backgroundColor = "transparent")
            }
          >
            Add smart signal on Sentiment at {menu.value.toFixed(2)}
          </button>
        </div>
      )}
    </div>
  );
};

export default WeightedSentimentChart;
