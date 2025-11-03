"use client";
import React from "react";
import Image from "next/image";
import { useRive, Layout, Fit, Alignment } from "@rive-app/react-canvas";
import dashboard from "@/lib/assets/dashboard";

export default function LoadingScreen() {
  const { RiveComponent } = useRive({
    src: "/media/images/dashboard/ascendex/shield-animation.riv",
    autoplay: true,
    animations: "Loading Loop",
    layout: new Layout({
      fit: Fit.Contain,
      alignment: Alignment.Center,
    }),
    onLoad: () => {
      console.log("Rive animation loaded successfully!");
    },
    onLoadError: (error) => {
      console.error("Rive loading error:", error);
    },
  });

  return (
    <div className="relative flex h-full w-full justify-center items-center rounded-2xl overflow-hidden bg-white">
      <Image src={dashboard.ascendexAnimation} alt="Loading" fill className="object-cover" priority />

      <div className="absolute left-1/2 -translate-x-1/2 z-10" style={{ width: "1500px", height: "1200px", bottom: "-24rem" }}>
        <RiveComponent style={{ width: "100%", height: "100%", background: 'transparent' }} />
      </div>
    </div>
  );
}