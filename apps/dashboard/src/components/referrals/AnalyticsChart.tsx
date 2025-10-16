"use client";

import React, { FC, useState, useEffect, useRef } from "react";
import * as Chart from "chart.js";
import { getReferralChartData } from "@/services/queries/referral/server-actions";
import { ChartData } from "@/services/queries/referral/types";

type TimeRange = "7D" | "4W" | "6M" | "YTD" | "1Y";

interface AnalyticsChartProps {
  initialData: ChartData | null;
}

const AnalyticsChart: FC<AnalyticsChartProps> = ({ initialData }) => {
  const [timeRange, setTimeRange] = useState<TimeRange>("7D");
  const [chartData, setChartData] = useState<ChartData | null>(initialData);
  const [isLoading, setIsLoading] = useState(false);

  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstanceRef = useRef<Chart.Chart | null>(null);

  const timeRanges: TimeRange[] = ["7D", "4W", "6M", "YTD", "1Y"];

  // Helper function to format date labels based on time range
  const formatDateLabel = (dateStr: string, range: TimeRange): string => {
    const date = new Date(dateStr);
    
    if (range === "7D" || range === "4W") {
      // Show month and day (e.g., "Oct 5")
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } else if (range === "6M" || range === "1Y") {
      // Show month and year (e.g., "Oct 2024")
      return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    } else {
      // YTD - show month (e.g., "Oct")
      return date.toLocaleDateString('en-US', { month: 'short' });
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      if (timeRange === "7D" && initialData) {
        setChartData(initialData);
        return;
      }

      setIsLoading(true);
      try {
        const data = await getReferralChartData(timeRange);
        setChartData(data);
      } catch (error) {
        console.error("Error fetching chart data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [timeRange, initialData]);

  useEffect(() => {
    if (!chartRef.current || !chartData) return;

    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
    }

    const {
      Chart: ChartJS,
      LineController,
      LineElement,
      PointElement,
      LinearScale,
      CategoryScale,
      Tooltip,
      Legend,
      Filler,
    } = Chart;

    ChartJS.register(LineController, LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Legend, Filler);

    const ctx = chartRef.current.getContext("2d");
    if (!ctx) return;

    // Format labels based on time range
    const formattedLabels = chartData.labels.map(label => formatDateLabel(label, timeRange));

    const data = {
      labels: formattedLabels,
      datasets: [
        {
          label: "Active Subscribers",
          data: chartData.activeData,
          borderColor: "#10b981",
          backgroundColor: "rgba(16, 185, 129, 0.1)",
          tension: 0.4,
          pointRadius: 4,
          pointBackgroundColor: "#10b981",
        },
        {
          label: "Free Users",
          data: chartData.pendingData,
          borderColor: "#f59e0b",
          backgroundColor: "rgba(245, 158, 11, 0.1)",
          tension: 0.4,
          pointRadius: 4,
          pointBackgroundColor: "#f59e0b",
        },
        {
          label: "Inactive Subscribers",
          data: chartData.inactiveData,
          borderColor: "#ffffff",
          backgroundColor: "rgba(255, 255, 255, 0.1)",
          tension: 0.4,
          pointRadius: 4,
          pointBackgroundColor: "#ffffff",
        }, 
      ],
    };

    chartInstanceRef.current = new ChartJS(ctx, {
      type: "line",
      data: data,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            backgroundColor: "#1f1f1f",
            titleColor: "#fff",
            bodyColor: "#fff",
            borderColor: "#333",
            borderWidth: 1,
            padding: 12,
            displayColors: true,
            callbacks: {
              label: function (context) {
                return `${context.dataset.label}: ${context.parsed.y}`;
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
              color: "#333",
            },
            ticks: {
              color: "#888",
              font: {
                size: 12,
              },
              maxRotation: 0,
              minRotation: 0,
            },
          },
          y: {
            border: {
              display: false,
            },
            grid: {
              color: "#333",
            },
            ticks: {
              color: "#888",
              font: {
                size: 12,
              },
              stepSize: 1,
            },
            beginAtZero: true,
          },
        },
      },
    });

    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }
    };
  }, [chartData, timeRange]);

  return (
    <div className="bg-[#121212] border-[#121212] rounded-xl p-6">
      {/* Header Section - Timeframe Picker */}
      <div className="flex justify-end items-center mb-6">
        <div className="flex items-center gap-4">
          <div className="flex gap-2">
            {timeRanges.map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                disabled={isLoading}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                  timeRange === range ? "bg-zinc-700 text-white" : "bg-transparent text-zinc-400 hover:text-white"
                } ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                {range}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-[#0A0A0A] border-[#0A0A0A] rounded-xl p-6">
        {/* Legend Section */}
        <div className="flex gap-6 mb-6 justify-center">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span className="text-sm text-zinc-300">Active Subscribers</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-white"></div>
            <span className="text-sm text-zinc-300">Inactive Subscribers</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-amber-500"></div>
            <span className="text-sm text-zinc-300">Free Users</span>
          </div>
        </div>

        {/* Chart Section */}
        <div className="h-[400px] relative">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-[#0A0A0A] bg-opacity-50 z-10">
              <div className="text-zinc-400">Loading...</div>
            </div>
          )}
          <canvas ref={chartRef}></canvas>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsChart;