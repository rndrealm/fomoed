import React from "react";
import Image from "next/image";

export default function News() {
  return (
    <div className="w-[450px] h-[450px] rounded-[16px] app_news_widget relative overflow-hidden">
      {/* <div className="absolute top-0 left-0 w-full h-full">
        <Image
          src="/media/images/dashboard/news-bg.png"
          width={450}
          height={450}
          alt="news"
          className="w-full h-full"
          style={{
            objectFit: "cover",
          }}
        />
      </div> */}
      <div className="relative z-[9] h-full flex flex-col gap-2 justify-end px-4 py-6">
        <div className="flex justify-between w-full">
          <p className="text-[#A4A4A4] font-semibold text-xs leading-[1.25]">
            BITCOIN
          </p>

          <div className="flex items-center gap-[3px]">
            <div className="w-[3px] h-[3px] rounded-[50%] bg-[#FF3B10]"></div>

            <p className="text-[#A5A5A5] font-semibold text-xs leading-[1.35]">
              APR 5, 2025
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <h3 className="text-white font-semibold text-[18px] leading-[1.25]">
            BITCOIN LEDGER BUG PATCHED AFTER ‘SERIOUS’ FLAW SPOTTED IN XRPL
            LIBRARY
          </h3>

          <p className="text-[#A4A4A4] font-medium text-[15px] leading-[1.25]">
            KULR Technology Group is stepping deeper into the Bitcoin game. The
            energy storage company has picked up 118 more BTC this week and
            signed on to the Bitcoin for Corporations initiative.
          </p>
        </div>
      </div>
    </div>
  );
}
