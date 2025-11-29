"use client";
import React from "react";
import Image from "next/image";
import dashboard from "@/lib/assets/dashboard";

export default function NewsTab() {
  return (
    <div className="flex flex-col min-h-[375px] h-full items-center justify-center bg-[#191B20] rounded-[6px] my-1">
      <Image src={dashboard.noOpenOrders} alt="No News" width={168} height={168} className="mb-4" />
      <p className="text-white text-[20px] font-semibold">No News</p>
    </div>
  );
}
