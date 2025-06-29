"use client";
import { DashboardContent, FullscreenBtn, Toolbar } from "@/components/dashboard";
import { NextStepProvider, NextStep } from "nextstepjs";
import { loadLayoutsFromApiAtom } from "@/lib/atoms/layoutAtom";
import { loadSettingsFromApiAtom } from "@/lib/atoms/settingsAtom";
import { loadTabsFromApiAtom } from "@/lib/atoms/tabsAtom";
import { utilsAtom } from "@/lib/atoms/utilsAtom";
import { tourSteps } from "@/lib/static";
import { cn } from "@/lib/utils";
import { IDashboardData } from "@/services/queries/home/types";
import { TourProvider } from "@reactour/tour";
import { useEffect, useState } from "react";
import CreateSignalFromChartModal from "../signals/create-signal-from-chart-modal";
import { OnboardingModal } from "./shared/onboarding-modal";
import TourContent from "./shared/tour-card";
import TourCard from "./shared/tour-card";
import { useAtom, useSetAtom } from "jotai";
import { setGeoLocationAtom } from "@/lib/atoms/geoLocation";
import { useFetchUserLocation } from "@/services/queries/geolocation";
import { useGetSupportedxchangePairs, useReadCoinList } from "@/services/queries/charts";

interface IProps {
  dashboardData: IDashboardData;
}
export default function Home({ dashboardData }: IProps) {
  const loadTabsFromApi = useSetAtom(loadTabsFromApiAtom);
  const loadLayoutsFromApi = useSetAtom(loadLayoutsFromApiAtom);
  const loadSettingsFromApi = useSetAtom(loadSettingsFromApiAtom);
  const loadUserGeoLocation = useSetAtom(setGeoLocationAtom);

  const { data: geoLocation } = useFetchUserLocation();
  useReadCoinList();
  useGetSupportedxchangePairs();

  // const { data: newsData } = useFetchTokenNews();

  useEffect(() => {
    loadTabsFromApi(dashboardData.tabs, dashboardData.settings.active_tab_id);
    loadLayoutsFromApi(dashboardData.layouts);
    loadSettingsFromApi(dashboardData.settings);
    // loadUserGeoLocation(dashboardData.location);
  }, [
    dashboardData.tabs,
    dashboardData.layouts,
    dashboardData.settings,
    dashboardData.location,
    loadTabsFromApi,
    loadLayoutsFromApi,
    loadSettingsFromApi,
  ]);

  useEffect(() => {
    if (geoLocation) {
      loadUserGeoLocation(geoLocation);
    }
  }, [geoLocation, loadUserGeoLocation]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [utils, setUtils] = useAtom(utilsAtom);

  const handleFullscreen = () => {
    // const div = divRef.current;
    const element = document.documentElement;
    if (!element) return;
    if (!isFullscreen) {
      if (element.requestFullscreen) {
        element.requestFullscreen();
      }
    } else {
      document.exitFullscreen();
    }
  };

  useEffect(() => {
    const onFullscreenChange = () => {
      const fullscreenElement = document.fullscreenElement;

      setIsFullscreen(!!fullscreenElement);
      setUtils({ ...utils, isFullScreen: !!fullscreenElement });
    };

    document.addEventListener("fullscreenchange", onFullscreenChange);
    document.addEventListener("webkitfullscreenchange", onFullscreenChange);
    document.addEventListener("mozfullscreenchange", onFullscreenChange);
    document.addEventListener("MSFullscreenChange", onFullscreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", onFullscreenChange);
      document.removeEventListener("webkitfullscreenchange", onFullscreenChange);
      document.removeEventListener("mozfullscreenchange", onFullscreenChange);
      document.removeEventListener("MSFullscreenChange", onFullscreenChange);
    };
  }, [utils, setUtils]);

  const [isOpen, setIsOpen] = useState(true);
  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
  };

  return (
    <NextStepProvider>
      <NextStep steps={tourSteps} cardComponent={TourCard}>
        {/* <OnboardingModal isOpen={isOpen} onOpenChange={handleOpenChange} /> */}
        <div
          className={cn(
            "h-screen overflow-hidden bg-[#0C0C0C] pt-[66px] pb-4 md:px-4"
            // !utils.isFullScreen
            //   ? "pt-[66px] md:pt-[72px] md:px-4 pb-4"
            //   : "p-1 md:pt-1"
          )}
        >
          <div className="relative flex flex-col w-full h-full gap-2">
            <div className="px-4 md:px-6">
              <Toolbar />
            </div>
            <div className="scrollbar app_dashboard_content sm:p4 flex-1 overflow-auto rounded-[20px] border-[#333333] bg-[#0F0F0F] p-2 md:border md:p-0">
              <DashboardContent />
            </div>
            <FullscreenBtn isFullscreen={utils.isFullScreen} handleFullscreen={handleFullscreen} />
          </div>
        </div>
      </NextStep>
    </NextStepProvider>
  );
}
