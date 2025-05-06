"use client";
import React, { Fragment, useEffect, useRef, useState } from "react";
import {
  AddWidgetModal,
  DashboardContent,
  FullscreenBtn,
  Toolbar,
} from "@/components/dashboard";
import { ModalContainer } from "@/components/shared";
import { useAtom } from "jotai";
import { utilsAtom } from "@/lib/atoms/utilsAtom";
import { cn } from "@/lib/utils";

export default function Home() {
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
      document.removeEventListener(
        "webkitfullscreenchange",
        onFullscreenChange
      );
      document.removeEventListener("mozfullscreenchange", onFullscreenChange);
      document.removeEventListener("MSFullscreenChange", onFullscreenChange);
    };
  }, []);

  return (
    <Fragment>
      <div
        className={cn(
          "h-screen pt-[96px] px-4 pb-4 overflow-hidden bg-[#0C0C0C]",
          !utils.isFullScreen ? "pt-[96px] px-4 pb-4" : "p-1"
        )}
      >
        <div className="relative flex flex-col w-full h-full gap-4">
          <div className="px-6">
            <Toolbar />
          </div>
          <div className="flex-1 border border-[#333333] bg-[#0F0F0F] overflow-auto rounded-[20px] scrollbar">
            <DashboardContent />
          </div>
          <FullscreenBtn
            isFullscreen={utils.isFullScreen}
            handleFullscreen={handleFullscreen}
          />
          <ModalContainer
            open={false}
            handleClose={() => {}}
            className="h-full"
            title="Add New Widget"
          >
            <AddWidgetModal />
          </ModalContainer>
        </div>
      </div>
    </Fragment>
  );
}
