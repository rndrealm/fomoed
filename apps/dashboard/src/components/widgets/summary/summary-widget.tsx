import React from "react";
import { Ellipsis, Summary } from "@/components/icons/icons";
import { cn, formatSummaryDate } from "@/lib/utils";

const gradientStyle = {
  background:
    "radial-gradient(378.86% 378.86% at -51.09% -33.99%, #ff8970 10.51%, #84ebb4 48.98%, #ffdb43 86.81%)",
};

const percentTextStyle = {
  background:
    "radial-gradient(378.86% 378.86% at -51.09% -33.99%, rgb(255, 137, 112) 10.51%, rgb(132, 235, 180) 48.98%, rgb(255, 219, 67) 86.81%)",
  backgroundClip: "text",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
};

export default function SummaryWidget() {
  const { date, weekday } = formatSummaryDate();

  return (
    <div className="bg-[#000] p-4 flex flex-col gap-4 rounded-[30px] justify-between">
      <div className="flex justify-between items-center">
        <div className="flex gap-2 items-center gap-4">
          <Summary />
          <h3 className="font-semibold text-base text-[#878787] leading-[1.35]">
            SUMMARY
          </h3>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            className="w-[24px] h-[24px] flex items-center justify-between"
          >
            <Ellipsis />
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-[10px]">
        <div className="">
          <p className="text-semibold text-[13px] leading-[1.25] text-[#878787]">
            {date}
          </p>
          <p className="text-semibold text-[13px] leading-[1.25] text-[#4B4B4B]">
            {weekday}
          </p>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="h-[64px] w-[83px] relative">
              <div
                style={gradientStyle}
                className="w-[64px] h-[64px] rounded-[20px]"
              ></div>

              <div
                style={gradientStyle}
                className="w-[56px] h-[56px] rounded-[20px] absolute right-[0px] top-[5px] opacity-[0.2]"
              ></div>
            </div>

            <div className="flex flex-col gap-1">
              <p className="text-medium text-[13px] leading-[1.25] text-[#878787]">
                😶‍🌫️ BIGGEST LOSER
              </p>
              <p className="text-semibold text-base leading-[1.35] text-white">
                Ethereum (ETH)
              </p>
            </div>
          </div>

          <div className="flex flex-col items-end">
            <div className="flex items-center">
              <p className="text-semibold text-[13px] leading-[1.25] text-[#555555]">
                $156 <span className="text-[#1FC16B]">-$180</span>
              </p>
              {/* <p>-$180</p> */}
            </div>
            <h2
              className="text-4xl leading-[1.15] font-bold"
              style={percentTextStyle}
            >
              +69%
            </h2>
          </div>
        </div>
      </div>

      <div className="flex justify-center gap-[2px] items-center mt-2">
        {Array(4)
          .fill(0)
          .map((_, index) => {
            const bg = index === 0 ? "bg-white" : "bg-[#373737]";

            return (
              <div
                key={index}
                className={cn("w-[6px] h-[6px] rounded-[50%]", bg)}
              ></div>
            );
          })}
      </div>
    </div>
  );
}
