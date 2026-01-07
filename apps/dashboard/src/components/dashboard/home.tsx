/* eslint-disable react-hooks/exhaustive-deps */
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
import { Fragment, useEffect, useState } from "react";
import CreateSignalFromChartModal from "../signals/create-signal-from-chart-modal";
import { OnboardingModal } from "./shared/onboarding-modal";
import TourContent from "./shared/tour-card";
import TourCard from "./shared/tour-card";
import { useAtom, useSetAtom } from "jotai";
import { setGeoLocationAtom } from "@/lib/atoms/geoLocation";
import { useFetchUserLocation } from "@/services/queries/geolocation";
import { KeyboardShortcuts } from "./shared/keyboard-shortcuts";
import { useGetSupportedxchangePairs, useReadCoinList } from "@/services/queries/charts";
import { Player } from "./shared/player";
import { ComingSoon } from "../modals/coming-soon";
import { TermsAndConditionsModal } from "./shared/terms-and-conditions-modal";
import { GuestSignupModal } from "../modals";
import { updateUserOnboardingStatus } from "@/services/queries/users/server-action";
import { useRouter } from "next/navigation";
import { useGuestTimer } from "@/hooks/useGuestTimer";

interface IProps {
  dashboardData: IDashboardData;
  showTermsModal: boolean;
  isGuest?: boolean;
}

export default function Home({ dashboardData, showTermsModal, isGuest = false }: IProps) {
  const router = useRouter();
  const loadTabsFromApi = useSetAtom(loadTabsFromApiAtom);
  const loadLayoutsFromApi = useSetAtom(loadLayoutsFromApiAtom);
  const loadSettingsFromApi = useSetAtom(loadSettingsFromApiAtom);
  const loadUserGeoLocation = useSetAtom(setGeoLocationAtom);

  const { data: geoLocation } = useFetchUserLocation();
  useReadCoinList();
  useGetSupportedxchangePairs();

  const [isTermsModalOpen, setIsTermsModalOpen] = useState(showTermsModal);
  const [isUpdating, setIsUpdating] = useState(false);

  // Guest timer hook
  const { hasExpired } = useGuestTimer(isGuest);

  useEffect(() => {
    loadTabsFromApi(dashboardData.tabs, dashboardData.settings.active_tab_id);
    loadLayoutsFromApi(dashboardData.layouts);
    loadSettingsFromApi(dashboardData.settings);
  }, []);

  useEffect(() => {
    if (geoLocation) {
      loadUserGeoLocation(geoLocation);
    }
  }, [geoLocation, loadUserGeoLocation]);

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [utils, setUtils] = useAtom(utilsAtom);

  const handleFullscreen = () => {
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

  const handleTermsContinue = async () => {
    if (isUpdating) return;

    setIsUpdating(true);
    try {
      await updateUserOnboardingStatus();
      setIsTermsModalOpen(false);
      router.refresh();
    } catch (error) {
      console.error("Error updating onboarding status:", error);
      setIsTermsModalOpen(false);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Fragment>
      <TermsAndConditionsModal isOpen={isTermsModalOpen} onContinue={handleTermsContinue} isLoading={isUpdating} />

      {/* Guest Signup Modal (Hard Block) */}
      <GuestSignupModal isOpen={isGuest && hasExpired} />

      <div className={cn("h-full overflow-hidden bg-[#000] pb-0 md:px-0 pt-0")}>
        <div className="relative flex h-full w-full flex-col gap-0">
          <div className="px-4 md:px-4 bg-[#0A0A0A] border-b-[1px] border-[#222222]">
            <Toolbar />
          </div>

          <div className="relative scrollbar sm:p4 flex-1 app_dashboard_content overflow-auto rounded-[0px] border-[#222222] bg-[#000] p-2 md:border-0 md:p-0">
            <DashboardContent />
          </div>

          <FullscreenBtn isFullscreen={utils.isFullScreen} handleFullscreen={handleFullscreen} />
        </div>
      </div>
      <KeyboardShortcuts />
      <Player />
      <ComingSoon />
    </Fragment>
  );
}
