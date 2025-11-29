import React, { useState, useMemo, useEffect, useRef } from "react";
import Chart from "chart.js/auto";
import { DownwardTriangleIcon, UpwardTriangleIcon } from "@/components/icons/icons";
import { useHyperliquidPortfolio, useHyperliquidClearinghouseState } from "@/services/queries/hyperliquid-dex";

type Timeframe = "1h" | "1d" | "1w" | "1m" | "6m";
type ApiTimeframe = "day" | "week" | "month" | "allTime";

const timeframeMap: Record<Timeframe, ApiTimeframe> = {
  "1h": "day",
  "1d": "day",
  "1w": "week",
  "1m": "month",
  "6m": "allTime",
};

const formatXAxis = (timestamp: number, timeframe: Timeframe): string => {
  const date = new Date(timestamp);

  switch (timeframe) {
    case "1h":
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

interface BalanceChartProps {
  userAddress: string;
}

interface ChartDataPoint {
  time: Date;
  balance: number;
  timestamp: number;
}

export default function BalanceChart({ userAddress }: BalanceChartProps) {
  const [timeframe, setTimeframe] = useState<Timeframe>("1d");
  const [activeTab, setActiveTab] = useState<"overview" | "performance">("overview");
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstanceRef = useRef<Chart | null>(null);
  const timeframes: Timeframe[] = ["1h", "1d", "1w", "1m", "6m"];

  const { data: portfolioArray, isLoading, error } = useHyperliquidPortfolio(userAddress, !!userAddress);
  const { data: clearinghouse } = useHyperliquidClearinghouseState(userAddress, !!userAddress);

  const selectedApiTimeframe = timeframeMap[timeframe];
  
  const portfolioData = useMemo(() => {
    if (!portfolioArray || !Array.isArray(portfolioArray)) return null;
    const found = portfolioArray.find(([tf]: [string, any]) => tf === selectedApiTimeframe);
    return found ? found[1] : null;
  }, [portfolioArray, selectedApiTimeframe]);

  const chartData: ChartDataPoint[] = useMemo(() => {
    if (!portfolioData?.accountValueHistory) return [];

    let history = portfolioData.accountValueHistory;
    
    if (timeframe === "1h" && history.length > 20) {
      history = history.slice(-20);
    }

    return history.map(([timestamp, value]: [number, string]) => ({
      time: new Date(timestamp),
      balance: parseFloat(value),
      timestamp,
    }));
  }, [portfolioData, timeframe]);

  const currentBalance = chartData.length > 0 ? chartData[chartData.length - 1]?.balance : 0;
  const previousBalance = chartData.length > 0 ? chartData[0]?.balance : 0;
  const pnlChange = currentBalance - previousBalance;
  const pnlPercentage = previousBalance > 0 ? ((pnlChange / previousBalance) * 100).toFixed(2) : "0.00";
  const isPositive = pnlChange >= 0;
  const lineColor = isPositive ? "#00AF58" : "#DC2626";

  const formatValue = (value: string | undefined): string => {
    if (!value) return "$0.00";
    const num = parseFloat(value);
    return `$${num.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const netEquity = formatValue(clearinghouse?.marginSummary?.accountValue);
  const availableEquity = formatValue(clearinghouse?.withdrawable);
  
  const openPnl = useMemo(() => {
    if (!clearinghouse?.assetPositions) return "$0.00";
    const totalPnl = clearinghouse.assetPositions.reduce((sum, pos) => {
      return sum + parseFloat(pos.position.unrealizedPnl || "0");
    }, 0);
    return `$${totalPnl.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }, [clearinghouse?.assetPositions]);

  const initialMargin = formatValue(clearinghouse?.marginSummary?.totalMarginUsed);
  const maintenanceMargin = formatValue(clearinghouse?.crossMaintenanceMarginUsed);

  const statsData = [
    { label: "Net Equity", value: netEquity },
    { label: "Available Equity", value: availableEquity },
    { label: "Open PnL", value: openPnl },
    { label: "Initial Margin", value: initialMargin },
    { label: "Maintenance Margin", value: maintenanceMargin },
  ];

  useEffect(() => {
    if (!chartRef.current || chartData.length === 0) return;

    const ctx = chartRef.current.getContext("2d");
    if (!ctx) return;

    const balanceValue = chartData[0]?.balance || 0;
    const labels = chartData.map((d: ChartDataPoint) => formatXAxis(d.timestamp, timeframe));
    const dataValues = chartData.map((d: ChartDataPoint) => d.balance);

    if (chartInstanceRef.current) {
      const chart = chartInstanceRef.current;
      chart.data.labels = labels;
      chart.data.datasets[0].data = dataValues;
      chart.data.datasets[0].borderColor = lineColor;
      chart.data.datasets[0].backgroundColor = lineColor;      
      if (chart.options.scales?.y) {
        chart.options.scales.y.min = balanceValue * 0.95;
        chart.options.scales.y.max = balanceValue * 1.05;
      }
      
      chart.update("none");
      return;
    }

    chartInstanceRef.current = new Chart(ctx, {
      type: "line",
      data: {
        labels,
        datasets: [
          {
            label: "Balance",
            data: dataValues,
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
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: false,
        plugins: {
          legend: { display: false },
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
                return "$" + context.parsed.y.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                });
              },
            },
          },
        },
        scales: {
          x: {
            border: { display: false },
            grid: { display: false },
            ticks: {
              color: "#9CA3AF",
              font: { size: 12 },
              maxRotation: 0,
              autoSkip: true,
              maxTicksLimit: 10,
            },
          },
          y: {
            display: true,
            min: balanceValue * 0.95,
            max: balanceValue * 1.05,
            border: { display: false },
            grid: { color: "rgba(156, 163, 175, 0.1)" },
            ticks: {
              color: "#9CA3AF",
              font: { size: 12 },
              maxTicksLimit: 8,
              callback: function (value) {
                const num = Number(value);
                if (num >= 1000) {
                  return "$" + (num / 1000).toFixed(1) + "k";
                }
                return "$" + num.toFixed(2);
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

  if (isLoading) {
    return (
      <div className="bg-[#121317] rounded-[10px] p-4 flex items-center justify-center h-[394px]">
        <span className="text-[#9CA3AF] text-[14px]">Loading chart data...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-[#121317] rounded-[10px] p-4 flex items-center justify-center h-[394px]">
        <span className="text-red-500 text-[14px]">Error loading chart data</span>
      </div>
    );
  }

  if (!portfolioArray || chartData.length === 0) {
    return (
      <div className="bg-[#121317] rounded-[10px] p-4 flex items-center justify-center h-[394px]">
        <span className="text-[#9CA3AF] text-[14px]">No chart data available</span>
      </div>
    );
  }

  return (
    <div className="bg-[#121317] rounded-[10px] p-4 flex flex-col h-[394px]">
      <div className="flex items-center justify-between h-[24px] mb-3">
        <span className="text-white font-medium text-[14px]">Account 1</span>
        <div className="flex items-center">
          <button
            onClick={() => setActiveTab("overview")}
            className={`text-[12px] px-3 h-[24px] transition ${
              activeTab === "overview" ? "bg-[#2B2C32] text-white" : "bg-[#222329] text-[#84858C]"
            } rounded-l-[6px]`}
          >
            Account Overview
          </button>
          <button
            onClick={() => setActiveTab("performance")}
            className={`text-[12px] px-3 h-[24px] transition ${
              activeTab === "performance" ? "bg-[#2B2C32] text-white" : "bg-[#222329] text-[#84858C]"
            } rounded-r-[6px]`}
          >
            Performance
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-16 h-[36px]">
          {statsData.map(({ label, value }) => (
            <div key={label} className="flex flex-col">
              <span className="text-[#9CA3AF] text-[12px]">{label}</span>
              <span className="text-white text-[12px] font-medium">{value}</span>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-[4px]">
          {timeframes.map((t) => (
            <button
              key={t}
              onClick={() => setTimeframe(t)}
              className={`h-[24px] px-2 text-[12px] rounded-[6px] transition ${
                timeframe === t ? "bg-[#2A2B2E] text-white" : "text-[#9CA3AF] hover:text-white"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-4">
        <p className="text-[#9CA3AF] text-[12px]">Account Balance</p>
        <p className="text-white text-[20px] font-semibold">
          ${currentBalance.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </p>
        {isPositive ? (
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