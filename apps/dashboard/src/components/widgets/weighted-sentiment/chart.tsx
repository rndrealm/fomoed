"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useReadWeightedSentiment } from "@/services/queries/santiment";
import { ColorType, Time } from "lightweight-charts";
import {
  AreaSeries,
  Chart,
  TimeScale,
  TimeScaleFitContentTrigger,
} from "lightweight-charts-react-components";
import useSession from "@/lib/hooks/use-session";

export default function WeightedChart() {
  const user = useSession();

  const { data = [] } = useReadWeightedSentiment({
    auth_token: user?.access_token,
  });

  const [dimension, setDimension] = useState({ width: 0, height: 0 });

  const chartContainerRef = useRef<HTMLDivElement>(null);

  const formattedData = useMemo(() => {
    const newData = data?.map((item) => {
      return {
        // time: formatDateToYYYYMMDD(new Date(item?.datetime)),
        time: (new Date(item?.datetime).valueOf() / 1000) as Time,
        value: item?.value,
      };
    });

    return newData;
  }, [data]);

  useEffect(() => {
    if (!chartContainerRef.current) return;
    const observer = new ResizeObserver(() => {
      if (chartContainerRef.current) {
        const width = chartContainerRef.current.clientWidth;
        const height = chartContainerRef.current.clientHeight;

        setDimension({ width, height });
      }
    });

    observer.observe(chartContainerRef.current);
  }, []);

  return (
    <div
      ref={chartContainerRef}
      // app_line_chart_component
      className=" relative flex flex-1 w-full h-full pt-2"
    >
      <Chart
        key={data?.length}
        options={{
          layout: {
            background: { type: ColorType.Solid, color: "transparent" },
            attributionLogo: false,
            textColor: "#C3C3C3",
          },

          grid: {
            horzLines: {
              visible: false,
            },
            vertLines: {
              visible: false,
            },
          },
          rightPriceScale: {
            visible: false,
          },
          leftPriceScale: {
            borderVisible: false,
            visible: true,
          },
          autoSize: false,
          width: dimension.width,
          height: dimension.height,
        }}
        containerProps={{
          style: {
            flexGrow: 1,

            // background: "yellow",
            // height: "100%",
          },
        }}
      >
        <AreaSeries
          data={formattedData}
          options={{
            // baseLineColor: "red",
            topColor: "#47A663",
            lineColor: "#47A663",
            // bottomColor: "transparent",
            bottomColor: "rgba(71,166,99,0.01)",
            lineWidth: 1,
          }}
        />
        <TimeScale
          options={{
            borderVisible: false,
          }}
        >
          <TimeScaleFitContentTrigger deps={[]} />
        </TimeScale>
      </Chart>
    </div>
  );
}
