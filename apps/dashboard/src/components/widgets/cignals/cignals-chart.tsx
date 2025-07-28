"use client";
import { CignalsChart } from "@/charts/cignals-chart/cignalsChart";
import { CignalsChartDataProviderAPI } from "@/charts/cignals-chart/cignalsChartDataProvider";
import { CignalsChartOptions } from "@/charts/cignals-chart/types";
import { cn, getOverlayRoot } from "@/lib/utils";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { LayoutType, updateWidgetPropsAtom } from "@/lib/atoms/layoutAtom";
import { useAtomValue, useSetAtom } from "jotai";
import { activeTabAtom } from "@/lib/atoms/tabsAtom";
import CignalControls from "./cignal-controls";
import ConnectionStatus, { ConnectionStatusProps } from "./ConnectionStatus";
import { motion } from "motion/react";
import FullscreenableCanvas from "./FullscreenableCanvas";
import { opacity } from "html2canvas-pro/dist/types/css/property-descriptors/opacity";
import { useCall } from "wagmi";

interface IProps {
  widget: LayoutType["widgets"][0];
}

const CignalsChartComp = ({ widget }: IProps) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isConnectionStatusVisible, setIsConnectionStatusVisible] = useState(true);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const fullscreenControlsWrapperRef = useRef<HTMLDivElement>(null);
  const connectionStatusRef = useRef<HTMLDivElement>(null);

  const chartRef = useRef<CignalsChart | null>(null);

  const updateWidgetPropsFromAtom = useSetAtom(updateWidgetPropsAtom);
  const activeLayout = useAtomValue(activeTabAtom);

  const [chartOptions, setChartOptions] = useState<CignalsChartOptions>({
    instrument: widget?.props?.instrument,
    timeInterval: widget?.props?.timeInterval,
    priceStep: widget?.props?.priceStep,
  });

  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatusProps["status"]>("disconnected");

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

  useEffect(() => {
    if (!canvasRef.current || chartRef.current) return;

    console.debug("Initializing CignalsChart from within CignalsChartComp");

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
  };

  const overlayRoot = getOverlayRoot();

  const toggleFullscreen = () => {
    setIsFullscreen((prev) => !prev);

    if (!isFullscreen) {
      setIsConnectionStatusVisible(false);
    }
  };

  const handleCanvasReady = (canvas: HTMLCanvasElement) => {
    canvasRef.current = canvas;
  };

  const onAnimationComplete = useCallback(() => {
    if (!isFullscreen) {
      setIsConnectionStatusVisible(true);
    }
  }, [isFullscreen]);

  return (
    <>
      <div className={cn("flex h-full w-full flex-col justify-center rounded-sm")}>
        <div className="my-1 flex items-center justify-between">
          <div className="flex flex-col gap-[0.1rem] py-2 text-base font-medium">
            <p className="text-[white]">Volume Footprint Chart</p>
            <h3 className="text-xs text-white">
              {chartOptions?.instrument?.base_currency
                ? (
                    chartOptions?.instrument?.base_currency +
                    "/" +
                    chartOptions?.instrument?.quote_currency
                  ).toUpperCase()
                : null}
            </h3>
          </div>
          <div className="relative flex items-center gap-2">
            {/* Fullscreen button */}
            <CignalControls onSave={handleSave} chartOptions={chartOptions} toggleFullscreen={toggleFullscreen} />
          </div>
        </div>
        {/* <PremiumOverlay> */}
        <div className="relative flex h-full w-full flex-col" ref={containerRef}>
          <div className="flex-grow">
            <FullscreenableCanvas
              isFullscreen={isFullscreen}
              onCanvasReady={handleCanvasReady}
              onAnimationComplete={onAnimationComplete}
            />
          </div>

          <div
            className={cn("absolute top-2 left-4 duration-500", {
              "opacity-0": !isConnectionStatusVisible,
              "opacity-100": isConnectionStatusVisible,
            })}
            ref={connectionStatusRef}
          >
            <ConnectionStatus status={connectionStatus} />
          </div>
        </div>
        {/* </PremiumOverlay> */}
      </div>

      {/* Fullscreen Controls */}
      {overlayRoot &&
        isFullscreen &&
        createPortal(
          <motion.div
            ref={fullscreenControlsWrapperRef}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="pointer-events-auto fixed top-0 right-0 left-0 z-50 flex h-12 items-center bg-black/20 px-2 backdrop-blur-2xl"
          >
            <ConnectionStatus status={connectionStatus} />
            <div className="flex-grow"></div>
            <CignalControls onSave={handleSave} chartOptions={chartOptions} toggleFullscreen={toggleFullscreen} />
          </motion.div>,
          overlayRoot
        )}
    </>
  );
};

export default CignalsChartComp;
