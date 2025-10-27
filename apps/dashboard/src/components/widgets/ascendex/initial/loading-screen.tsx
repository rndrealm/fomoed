"use client";
import React from "react";
import Image from "next/image";
import { useRive } from "@rive-app/react-canvas";
import dashboard from "@/lib/assets/dashboard";

export default function LoadingScreen() {
  const { RiveComponent } = useRive({
    src: "/media/images/dashboard/ascendex/shield-animation.riv",
    autoplay: true,
    stateMachines: "State Machine 1",
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

      {/* Rive animation container */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10" style={{ width: "1187px", height: "660px" }}>
        <RiveComponent style={{ width: "100%", height: "100%", background: 'transparent' }} />
      </div>
    </div>
  );
}
