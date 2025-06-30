"use client";
import { CignalsChart } from "@/charts/cignals-chart/cignalsChart";
import { CignalsChartDataProviderAPI } from "@/charts/cignals-chart/cignalsChartDataProvider";
import { CignalsChartOptions, ParsedCignalsInstrumentArray } from "@/charts/cignals-chart/types";
import { capitalizeFirst, cn } from "@/lib/utils";
import React, { useEffect, useRef, useState } from "react";
import PremiumOverlay from "../shared/premium-overlay";
import Image from "next/image";
import dashboard from "@/lib/assets/dashboard";
import CignalsDropdown from "./cignals-dropdown";
import { LayoutType, updateWidgetPropsAtom } from "@/lib/atoms/layoutAtom";
import { useAtomValue, useSetAtom } from "jotai";
import { activeTabAtom } from "@/lib/atoms/tabsAtom";

interface IProps {
  widget: LayoutType["widgets"][0];
}

const CignalsChartComp = ({ widget }: IProps) => {
  const [openOptionModal, setOpenOptionModal] = useState(false);
  const closeModal = () => setOpenOptionModal(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const chartRef = useRef<CignalsChart | null>(null);

  const updateWidgetPropsFromAtom = useSetAtom(updateWidgetPropsAtom);
  const activeLayout = useAtomValue(activeTabAtom);

  const [chartOptions, setChartOptions] = useState<CignalsChartOptions>({
    instrument: widget?.props?.instrument,
    timeInterval: widget?.props?.timeInterval,
    priceStep: widget?.props?.priceStep,
  });

  const [availableInstruments, setAvailableInstruments] = useState<ParsedCignalsInstrumentArray>([]);

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
    // setChartOptions(chartRef.current.options);

    refreshAvailableInstruments();
  }, []);

  const handleSave = (newOptions: CignalsChartOptions) => {
    if (!chartRef.current) return;
    chartRef.current.options = newOptions;
    setChartOptions(newOptions);
    updateWidgetPropsFromAtom({
      tabId: activeLayout.id,
      widgetId: widget.id,
      widgetProps: newOptions,
    });
    closeModal();
  };

  return (
    <div className={cn("flex h-full w-full flex-col justify-center rounded-sm")}>
      <div className="my-1 flex items-center justify-between">
        <div className="flex flex-col gap-[0.1rem] py-2 text-base font-medium">
          <p className="text-[white]">Volume Footprint Chart</p>
          <h3 className="text-xs text-white">
            {chartOptions?.instrument?.base_currency
              ? (chartOptions?.instrument?.base_currency + "/" + chartOptions?.instrument?.quote_currency).toUpperCase()
              : null}
          </h3>
        </div>
        <div className="relative">
          <button onClick={() => setOpenOptionModal(true)} className="rounded-[6px] bg-[#121212] p-2">
            <Image src={dashboard.settings} alt="settings icon" />
          </button>
          {openOptionModal ? (
            <CignalsDropdown
              availableInstruments={availableInstruments}
              onClose={closeModal}
              onSave={handleSave}
              originalOptions={chartOptions}
            />
          ) : null}
        </div>
      </div>
      {/* <PremiumOverlay> */}
      <div className="relative flex h-full w-full flex-col">
        <div className="flex-grow">
          <canvas className="h-full w-full touch-none rounded-[10px]" ref={canvasRef}></canvas>
        </div>
        <div className="absolute top-0 left-4 mt-4 flex items-center gap-1 rounded-[6px] bg-[#1C1C1C] px-2 py-1">
          <div
            className={cn("h-2 w-2 rounded-full", {
              "bg-[#399F57]": connsectionStatus === "connected",
              "bg-[#FFB800]": connsectionStatus === "connecting",
              "bg-[#FF3D3D]": connsectionStatus === "disconnected",
            })}
          />
          <p className="text-xs font-semibold text-[#9B9FA4]">{capitalizeFirst(connsectionStatus)}</p>
        </div>
      </div>
      {/* </PremiumOverlay> */}
    </div>
  );
};

export default CignalsChartComp;
