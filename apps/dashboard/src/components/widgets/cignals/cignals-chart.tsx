"use client";
import { CignalsChart } from "@/charts/cignals-chart/cignalsChart";
import { CignalsChartDataProviderAPI } from "@/charts/cignals-chart/cignalsChartDataProvider";
import {
  CignalsChartOptions,
  ParsedCignalsInstrumentArray,
} from "@/charts/cignals-chart/types";
import { capitalizeFirst, cn } from "@/lib/utils";
import React, { useEffect, useRef, useState } from "react";
import CignalsModal from "./cignals-modal";

interface IProps {
  modalOpen: boolean;
  onClose: () => void;
}

const CignalsChartComp = (props: IProps) => {
  const { modalOpen, onClose } = props;
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const chartRef = useRef<CignalsChart | null>(null);

  const [chartOptions, setChartOptions] = useState<CignalsChartOptions | null>(
    null
  );
  const [availableInstruments, setAvailableInstruments] =
    useState<ParsedCignalsInstrumentArray>([]);

  const [connsectionStatus, setConnectionStatus] = useState("disconnected");

  const onSocketConnecting = () => {
    console.log("Connecting to socket...");
    setConnectionStatus("connecting");
  };
  const onSocketDisconnected = () => {
    console.log("Socket disconnected");
    setConnectionStatus("disconnected");
  };
  const onSocketConnected = () => {
    console.log("Socket connected");
    setConnectionStatus("connected");
  };

  async function refreshAvailableInstruments() {
    const dataProvider = new CignalsChartDataProviderAPI();
    const currInstruments = await dataProvider.fetchInstruments();
    setAvailableInstruments(currInstruments);
  }

  useEffect(() => {
    if (!canvasRef.current) return;

    const provider = new CignalsChartDataProviderAPI();

    chartRef.current = new CignalsChart({
      canvas: canvasRef.current,
      dataProvider: provider,
      onSocketConnecting: onSocketConnecting,
      onSocketDisconnected: onSocketDisconnected,
      onSocketConnected: onSocketConnected,
    });
    chartRef.current.autoAdjustDatapointWidth();
    chartRef.current.refreshData();
    setChartOptions(chartRef.current.options);

    refreshAvailableInstruments();
  }, []);

  const handleSave = (newOptions: CignalsChartOptions) => {
    console.log("Saving new options", newOptions);
    if (!chartRef.current) return;
    chartRef.current.options = newOptions;
    setChartOptions(chartRef.current.options);
    onClose();
  };

  return (
    <div className="relative flex flex-col w-full h-full">
      {modalOpen && chartOptions ? (
        <CignalsModal
          availableInstruments={availableInstruments}
          onClose={onClose}
          onSave={handleSave}
          originalOptions={chartOptions}
        />
      ) : null}
      <div className="flex-grow">
        <canvas className="w-full h-full touch-none" ref={canvasRef}></canvas>
      </div>
      <div className="absolute top-0 left-4 flex items-center gap-1 mt-4 bg-[#1C1C1C] rounded-[6px] px-2 py-1">
        <div
          className={cn("w-2 h-2 rounded-full", {
            "bg-[#399F57]": connsectionStatus === "connected",
            "bg-[#FFB800]": connsectionStatus === "connecting",
            "bg-[#FF3D3D]": connsectionStatus === "disconnected",
          })}
        />
        <p className="text-[#9B9FA4] text-xs font-semibold ">
          {capitalizeFirst(connsectionStatus)}
        </p>
      </div>
    </div>
  );
};

export default CignalsChartComp;
