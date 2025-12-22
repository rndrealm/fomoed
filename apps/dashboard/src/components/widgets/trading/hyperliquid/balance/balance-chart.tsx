import React, { useState, useMemo, useEffect, useRef } from "react";
import Chart from "chart.js/auto";
import { DownwardTriangleIcon, UpwardTriangleIcon } from "@/components/icons/icons";
import { useHyperliquidPortfolio, useHyperliquidClearinghouseState } from "@/services/queries/hyperliquid-dex";

type Timeframe = "1d" | "1w" | "1m" | "All";
type ApiTimeframe = "day" | "week" | "month" | "allTime";

const timeframeMap: Record<Timeframe, ApiTimeframe> = {
  "1d": "day",
  "1w": "week",
  "1m": "month",
  "All": "allTime",
};

const formatXAxis = (timestamp: number, timeframe: Timeframe): string => {
  const date = new Date(timestamp);

  switch (timeframe) {
    case "1d":
      return date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false });
    case "1w":
      return date.toLocaleDateString("en-US", { month: "numeric", day: "numeric" });
    case "1m":
      return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    case "All":
      return date.toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "numeric" });
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
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstanceRef = useRef<Chart | null>(null);
  const timeframes: Timeframe[] = ["1d", "1w", "1m", "All"];

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

    return history.map(([timestamp, value]: [number, string]) => ({
      time: new Date(timestamp),
      balance: parseFloat(value),
      timestamp,
    }));
  }, [portfolioData, timeframe]);

  const fixedLabels = useMemo(() => {
    if (timeframe !== "1d") return [];

    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    const labels: string[] = [];

    for (let hour = 0; hour <= 23; hour++) {
      const time = new Date(startOfDay);
      time.setHours(hour);
      labels.push(formatXAxis(time.getTime(), timeframe));
    }

    return labels;
  }, [timeframe]);

  const processedChartData = useMemo((): number[] => {
    if (timeframe !== "1d") {
      return chartData.map((d) => d.balance);
    }

    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000);
    const yesterdayStart = new Date(startOfDay.getTime() - 24 * 60 * 60 * 1000);

    const dataByHour: number[] = new Array(24).fill(NaN);

    chartData.forEach((point) => {
      const pointDate = new Date(point.timestamp);

      if (pointDate >= startOfDay && pointDate < endOfDay) {
        const hour = pointDate.getHours();
        dataByHour[hour] = point.balance;
      } else if (pointDate >= yesterdayStart && pointDate < startOfDay) {
        const hour = pointDate.getHours();
        if (hour === 23 && isNaN(dataByHour[0])) {
          dataByHour[0] = point.balance;
        }
      }
    });

    return dataByHour;
  }, [chartData, timeframe]);

  const previousDayClosePrice = useMemo(() => {
    if (timeframe !== "1d" || chartData.length === 0) return null;

    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    const yesterdayStart = new Date(startOfDay.getTime() - 24 * 60 * 60 * 1000);

    const yesterdayData = chartData.filter((point) => {
      const pointDate = new Date(point.timestamp);
      return pointDate >= yesterdayStart && pointDate < startOfDay;
    });

    if (yesterdayData.length > 0) {
      return yesterdayData[yesterdayData.length - 1].balance;
    }

    return null;
  }, [chartData, timeframe]);

  const getMaxTicksLimit = (tf: Timeframe): number => {
    switch (tf) {
      case "1d":
        return 24;
      case "1w":
        return 7;
      case "1m":
        return 10;
      case "All":
        return 6;
      default:
        return 10;
    }
  };

  const { minBalance, maxBalance } = useMemo(() => {
    const values =
      timeframe === "1d" ? processedChartData.filter((v): v is number => !isNaN(v)) : chartData.map((d) => d.balance);

    if (values.length === 0) return { minBalance: 0, maxBalance: 0 };

    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min;
    const padding = range * 0.1;

    return {
      minBalance: min - padding,
      maxBalance: max + padding,
    };
  }, [chartData, processedChartData, timeframe]);

  const currentBalance = chartData.length > 0 ? chartData[chartData.length - 1]?.balance : 0;
  const previousBalance = timeframe === "1d" && previousDayClosePrice !== null 
    ? previousDayClosePrice 
    : (chartData.length > 0 ? chartData[0]?.balance : 0);
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

    const drawPreviousDayLine = (chart: Chart) => {
      if (timeframe !== "1d" || previousDayClosePrice === null) return;

      const { ctx, scales } = chart;
      const yAxis = scales.y;
      const xAxis = scales.x;

      const yPixel = yAxis.getPixelForValue(previousDayClosePrice);

      const labelText = `Prev Day Close: $${previousDayClosePrice.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`;

      ctx.save();

      ctx.setLineDash([6, 6]);
      ctx.strokeStyle = "#6B7280";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(xAxis.left, yPixel);
      ctx.lineTo(xAxis.right, yPixel);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.font = "12px Inter, system-ui, sans-serif";
      const paddingX = 8;
      const paddingY = 4;
      const textWidth = ctx.measureText(labelText).width;
      const boxWidth = textWidth + paddingX * 2;
      const boxHeight = 20;

      const boxX = xAxis.right - boxWidth - 6;
      const boxY = yPixel - boxHeight / 2;

      ctx.fillStyle = "#222329";
      ctx.beginPath();
      ctx.roundRect(boxX, boxY, boxWidth, boxHeight, 4);
      ctx.fill();

      ctx.fillStyle = "#9CA3AF";
      ctx.textBaseline = "middle";
      ctx.fillText(labelText, boxX + paddingX, yPixel);

      ctx.restore();
    };

    const labels =
      timeframe === "1d" ? fixedLabels : chartData.map((d: ChartDataPoint) => formatXAxis(d.timestamp, timeframe));
    const dataValues = timeframe === "1d" ? processedChartData : chartData.map((d: ChartDataPoint) => d.balance);

    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
      chartInstanceRef.current = null;
    }

    const chartConfig: any = {
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
            spanGaps: timeframe === "1d",
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
              title: function (context: any) {
                if (timeframe === "1d") {
                  const hourIndex = context[0].dataIndex;
                  const now = new Date();
                  const date = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hourIndex, 0, 0, 0);
                  return date.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  });
                }
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
              label: function (context: any) {
                if (isNaN(context.parsed.y)) return "";
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
            border: { display: false },
            grid: { display: false },
            ticks: {
              color: "#9CA3AF",
              font: { size: 12 },
              maxRotation: 0,
              autoSkip: timeframe !== "1d",
              maxTicksLimit: getMaxTicksLimit(timeframe),
            },
          },
          y: {
            display: false,
            min: minBalance,
            max: maxBalance,
            border: { display: false },
            grid: { display: false },
            ticks: {
              color: "#9CA3AF",
              font: { size: 12 },
              maxTicksLimit: 8,
              callback: function (value: any) {
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
      plugins: timeframe === "1d" && previousDayClosePrice !== null
        ? [
            {
              id: "previousDayLine",
              afterDatasetsDraw: drawPreviousDayLine,
            },
          ]
        : [],
    };

    chartInstanceRef.current = new Chart(ctx, chartConfig);

    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
        chartInstanceRef.current = null;
      }
    };
  }, [chartData, processedChartData, timeframe, lineColor, minBalance, maxBalance, fixedLabels, previousDayClosePrice]);

  if (isLoading) {
    return (
      <div className="bg-[#121317] rounded-[10px] p-4 flex items-center justify-center h-[400px]">
        <span className="text-[#9CA3AF] text-[14px]">Loading chart data...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-[#121317] rounded-[10px] p-4 flex items-center justify-center h-[400px]">
        <span className="text-red-500 text-[14px]">Error loading chart data</span>
      </div>
    );
  }

  if (!portfolioArray || chartData.length === 0) {
    return (
      <div className="bg-[#121317] rounded-[10px] p-4 flex items-center justify-center h-[400px]">
        <span className="text-[#9CA3AF] text-[14px]">No chart data available</span>
      </div>
    );
  }

  return (
    <div className="bg-[#121317] rounded-[10px] p-4 flex flex-col" style={{ height: "400px" }}>
      <div className="mb-4">
        <p className="text-[#9CA3AF] text-[12px] mb-1">Total Value</p>
        <p className="text-white text-[28px] font-semibold leading-none mb-2">
          ${currentBalance.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </p>
        <div className="flex items-center">
          <span className="text-[#9CA3AF] text-[12px] mr-2">Day Change:</span>
          {isPositive ? (
            <div className="flex items-center gap-[6px] text-[#00AF58] text-[11px]">
              <span>
                $
                {Math.abs(pnlChange).toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
              <div className="flex items-center bg-[#222329] rounded-[4px] px-2 py-[3px] gap-[4px]">
                <UpwardTriangleIcon />+{pnlPercentage}%
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-[6px] text-[#DC2626] text-[11px]">
              <span>
                -$
                {Math.abs(pnlChange).toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>

              <div className="flex items-center bg-[#222329] rounded-[4px] px-2 py-[3px] gap-[4px]">
                <DownwardTriangleIcon />
                {pnlPercentage}%
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-12">
          {statsData.map(({ label, value }) => (
            <div key={label} className="flex flex-col">
              <span className="text-[#9CA3AF] text-[11px]">{label}</span>
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

      <div className="flex-1 min-h-0">
        <canvas ref={chartRef} />
      </div>
    </div>
  );
}