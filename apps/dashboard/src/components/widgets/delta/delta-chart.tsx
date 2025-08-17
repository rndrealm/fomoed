import React, { useEffect, useMemo, useRef, useState } from "react";
import { OrderBookDeltaResponse } from "@/services/queries/charts/types";
import { humanizeNumber } from "@/lib/utils";
import { ColorType, Time } from "lightweight-charts";
import {
  Chart,
  HistogramSeries,
  TimeScale,
  TimeScaleFitContentTrigger,
} from "lightweight-charts-react-components";

interface IOrderbookDeltaChartProps {
  chartData: OrderBookDeltaResponse;
}

const OrderbookDeltaChart = ({ chartData }: IOrderbookDeltaChartProps) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const [dimension, setDimension] = useState({ width: 0, height: 0 });

  const processedData = useMemo(() => {
    if (!chartData || !chartData.orderBookData?.length) {
      return [];
    }

    return chartData.orderBookData.map((item) => {
      const delta = item.bids_usd - item.asks_usd;
      return {
        time: (item.time / 1000) as Time, // Lightweight Charts expects seconds
        value: delta,
        color: delta >= 0 ? "#26a69a" : "#ef5350",
      };
    });
  }, [chartData]);

  useEffect(() => {
    if (!chartContainerRef.current) return;
    const observer = new ResizeObserver(() => {
      if (chartContainerRef.current) {
        const { clientWidth, clientHeight } = chartContainerRef.current;
        setDimension({ width: clientWidth, height: clientHeight });
      }
    });

    observer.observe(chartContainerRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={chartContainerRef} className="relative h-full w-full">
      <Chart
        options={{
          layout: {
            background: { type: ColorType.Solid, color: "transparent" },
            textColor: "rgba(255, 255, 255, 0.7)",
            attributionLogo: false,
          },
          grid: {
            horzLines: { visible: false },
            vertLines: { visible: false },
          },
          rightPriceScale: {
            borderVisible: false,
          },
          timeScale: {
            borderVisible: false,
          },
          autoSize: false,
          width: dimension.width,
          height: dimension.height,
        }}
      >
        <HistogramSeries
          data={processedData}
          options={{
            priceFormat: {
              type: "volume",
            },
          }}
        />
        <TimeScale options={{ }}></TimeScale>
      </Chart>
    </div>
  );
};

export default OrderbookDeltaChart;
