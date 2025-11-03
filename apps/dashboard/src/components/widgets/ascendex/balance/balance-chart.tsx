import React, { useState, useMemo, useEffect, useRef } from "react";
import Chart from "chart.js/auto";
import { DownwardTriangleIcon, UpwardTriangleIcon } from "@/components/icons/icons";

type Timeframe = "1h" | "1d" | "1w" | "1m" | "6m";

const generateChartData = (timeframe: Timeframe) => {
  const now = new Date();
  const dataPoints = {
    "1h": 20, 
    "1d": 24,
    "1w": 7,
    "1m": 30,
    "6m": 60,
  };

  const intervals = {
    "1h": 180000, 
    "1d": 3600000,
    "1w": 86400000,
    "1m": 86400000,
    "6m": 259200000, 
  };

  const points = dataPoints[timeframe];
  const interval = intervals[timeframe];
  const data = [];

  let baseBalance = 27000;

  for (let i = 0; i < points; i++) {
    const time = new Date(now.getTime() - (points - i - 1) * interval);
    const variation = (Math.random() - 0.5) * 3000;
    baseBalance = Math.max(baseBalance + variation, 20000);

    data.push({
      time: time,
      balance: Math.round(baseBalance * 100) / 100,
      timestamp: time.getTime(),
    });
  }

  return data;
};

const formatXAxis = (timestamp: number, timeframe: Timeframe) => {
  const date = new Date(timestamp);

  switch (timeframe) {
    case "1h":
      return date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false });
    case "1d":
      return date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false });
    case "1w":
      return date.toLocaleDateString("en-US", { weekday: "short" });
    case "1m":
      return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    case "6m":
      return date.toLocaleDateString("en-US", { month: "short" });
    default:
      return "";
  }
};

export default function BalanceChart() {
  const [timeframe, setTimeframe] = useState<Timeframe>("1d");
  const [activeTab, setActiveTab] = useState<"overview" | "performance">("overview");

  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstanceRef = useRef<Chart | null>(null);

  const chartData = useMemo(() => generateChartData(timeframe), [timeframe]);

  const currentBalance = chartData[chartData.length - 1]?.balance || 29302;
  const previousBalance = chartData[0]?.balance || 28000;
  const pnlChange = currentBalance - previousBalance;
  const pnlPercentage = ((pnlChange / previousBalance) * 100).toFixed(2);
  const isPositive = pnlChange >= 0;

  const lineColor = isPositive ? "#00AF58" : "#DC2626";

  const timeframes: Timeframe[] = ["1h", "1d", "1w", "1m", "6m"];

  useEffect(() => {
    if (!chartRef.current) return;

    const ctx = chartRef.current.getContext("2d");
    if (!ctx) return;

    if (chartInstanceRef.current) {
      const chart = chartInstanceRef.current;
      chart.data.labels = chartData.map((d) => formatXAxis(d.timestamp, timeframe));
      chart.data.datasets[0].data = chartData.map((d) => d.balance);
      chart.data.datasets[0].borderColor = lineColor;
      chart.data.datasets[0].backgroundColor = lineColor;
      chart.data.datasets[0].hoverBackgroundColor = lineColor;
      chart.update("none");
      return;
    }

    const data = {
      labels: chartData.map((d) => formatXAxis(d.timestamp, timeframe)),
      datasets: [
        {
          label: "Balance",
          data: chartData.map((d) => d.balance),
          borderColor: lineColor,
          backgroundColor: lineColor,
          tension: 0.4,
          borderWidth: 2,
          pointRadius: 0,
          pointHoverRadius: 6,
          pointHoverBackgroundColor: lineColor,
          pointHoverBorderColor: "#121317",
          pointHoverBorderWidth: 2,
        },
      ],
    };

    chartInstanceRef.current = new Chart(ctx, {
      type: "line",
      data: data,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: false, 
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            backgroundColor: "#1a1b1f",
            borderColor: "#2a2b2f",
            borderWidth: 1,
            titleColor: "#9CA3AF",
            bodyColor: "#ffffff",
            padding: 12,
            displayColors: false,
            callbacks: {
              title: function (context) {
                const dataIndex = context[0].dataIndex;
                const date = new Date(chartData[dataIndex].timestamp);
                return date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                });
              },
              label: function (context) {
                return (
                  "$" +
                  context.parsed.y.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })
                );
              },
            },
          },
        },
        scales: {
          x: {
            border: {
              display: false,
            },
            grid: {
              display: false,
            },
            ticks: {
              color: "#9CA3AF",
              font: {
                size: 12,
              },
              maxRotation: 0,
              autoSkip: true,
              maxTicksLimit: 10, 
            },
          },
          y: {
            display: false,
            border: {
              display: false,
            },
            grid: {
              display: false,
            },
            ticks: {
              color: "#9CA3AF",
              font: {
                size: 12,
              },
              maxTicksLimit: 8, 
              callback: function (value) {
                const num = Number(value);
                return "$" + (num / 1000).toFixed(0) + "k";
              },
            },
          },
        },
        interaction: {
          intersect: false,
          mode: "index",
        },
      },
    });

    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
        chartInstanceRef.current = null;
      }
    };
  }, [chartData, timeframe, lineColor]);

  return (
    <div className="bg-[#121317] rounded-[10px] p-4 flex flex-col h-[394px]">
      <div className="flex items-center justify-between h-[24px] mb-3">
        <span className="text-white font-medium text-[14px]">Account 1</span>
        <div className="flex items-center">
          {/* Overview Button */}
          <button
            onClick={() => setActiveTab("overview")}
            className={`text-[12px] px-3 h-[24px] transition 
        ${activeTab === "overview" ? "bg-[#2B2C32] text-white" : "bg-[#222329] text-[#84858C]"}
        rounded-l-[6px]`}
          >
            Account Overview
          </button>
          {/* Performance Button */}
          <button
            onClick={() => setActiveTab("performance")}
            className={`text-[12px] px-3 h-[24px] transition 
        ${activeTab === "performance" ? "bg-[#2B2C32] text-white" : "bg-[#222329] text-[#84858C]"}
        rounded-r-[6px]`}
          >
            Performance
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between mb-4">
        {/* Stats */}
        <div className="flex items-center gap-16 h-[36px]">
          {["Net Equity", "Available Equity", "Open PnL", "Initial Margin", "Maintenance Margin"].map((label) => (
            <div key={label} className="flex flex-col">
              <span className="text-[#9CA3AF] text-[12px]">{label}</span>
              <span className="text-white text-[12px] font-medium">$0.00</span>
            </div>
          ))}
        </div>

        {/* Timeframe Picker */}
        <div className="flex items-center gap-[4px]">
          {timeframes.map((t) => (
            <button
              key={t}
              onClick={() => setTimeframe(t)}
              className={`h-[24px] px-2 text-[12px] rounded-[6px] transition
        ${timeframe === t ? "bg-[#2A2B2E] text-white" : "text-[#9CA3AF] hover:text-white"}`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-4">
        <p className="text-[#9CA3AF] text-[12px]">Account Balance</p>
        <p className="text-white text-[20px] font-semibold">${currentBalance.toLocaleString("en-US")}</p>
        {pnlChange >= 0 ? (
          <div className="flex items-center bg-[#222329] text-[#00AF58] text-[10px] rounded-[4px] px-2 py-[2px] w-fit gap-[4px] mt-1">
            <UpwardTriangleIcon />+{pnlPercentage}%
          </div>
        ) : (
          <div className="flex items-center bg-[#222329] text-[#DC2626] text-[10px] rounded-[4px] px-2 py-[2px] w-fit gap-[4px] mt-1">
            <DownwardTriangleIcon />
            {pnlPercentage}%
          </div>
        )}
      </div>
      <div className="flex-1 min-h-0">
        <canvas ref={chartRef} />
      </div>
    </div>
  );
}
