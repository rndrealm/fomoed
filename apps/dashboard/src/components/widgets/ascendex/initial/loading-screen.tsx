"use client";
import React from "react";
import Image from "next/image";
import dashboard from "@/lib/assets/dashboard";

export default function LoadingScreen() {
  return (
    <div className="relative flex h-full w-full justify-center items-center rounded-2xl overflow-hidden bg-black">
      <Image 
        src={dashboard.ascendexAnimation}
        alt="Loading"
        fill
        className="object-cover"
        priority
      />
    </div>
  );
}