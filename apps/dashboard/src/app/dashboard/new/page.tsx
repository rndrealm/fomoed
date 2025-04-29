"use client";
import React, { useEffect, useRef, useState } from "react";
import { DashboardContent, Toolbar } from "@/components/dashboard";
import { ExitFullScreen, FullScreen } from "@/components/icons/icons";
import { RenderIf } from "@/components/shared";

export default function Page() {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const divRef = useRef<HTMLDivElement>(null);

  const handleFullscreen = () => {
    const div = divRef.current;
    if (!div) return;
    if (!isFullscreen) {
      if (div.requestFullscreen) {
        div.requestFullscreen();
      }
    } else {
      document.exitFullscreen();
    }
  };

  useEffect(() => {
    const onFullscreenChange = () => {
      const fullscreenElement = document.fullscreenElement;

      setIsFullscreen(!!fullscreenElement);
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
    <div className="h-screen pt-[96px] px-4 pb-4 overflow-hidden bg-[#0a0a0a]">
      <div
        ref={divRef}
        className="flex flex-col h-full w-full gap-4 bg-[#0a0a0a] relative"
      >
        <div className="px-6">
          <Toolbar />
        </div>
        <div className="flex-1 border border-[#121212] bg-[#080808] overflow-auto rounded-[20px]">
          <DashboardContent />
        </div>

        <div className="absolute bottom-[24px] left-[24px]">
          <button
            onClick={handleFullscreen}
            type="button"
            className="border border-[#1c1c1c] bg-[#111] p-[6px] rounded-md"
          >
            <RenderIf condition={!isFullscreen}>
              <FullScreen />
            </RenderIf>

            <RenderIf condition={isFullscreen}>
              <ExitFullScreen />
            </RenderIf>
          </button>
        </div>
      </div>
    </div>
  );
}
