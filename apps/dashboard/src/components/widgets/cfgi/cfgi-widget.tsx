"use client";

import CfgiCard from "@/components/widgets/cfgi/cfgi-card";
import { useReadCfgiData, useReadCoinList } from "@/services/queries/charts";
import CoinDropdown from "./coin-dropdown";

const colorToCfgi = {
  25: "#FF3B10",
  50: "#EA9924",
  75: "#399F57",
  100: "#05A5A6",
};

export default function CfgiWidget() {
  const { data } = useReadCfgiData();
  const { data: coinData } = useReadCoinList();

  return (
    <>
      {data ? (
        <div className="w-[670px] h-full flex flex-col justify-center ">
          <div className="mb-5">
            <CoinDropdown />
          </div>
          <CfgiCard cfgiData={data} />

          <div className="flex items-center justify-center gap-5 border-t border-t-[grey] mt-1">
            {Object.entries(colorToCfgi).map(([cfgi, color], index) => (
              <div className="flex items-center mt-2" key={index}>
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: color }}
                ></div>
                <div className="ml-2 text-[#A0A0A0] text-xs">
                  {index * 25}-{(index + 1) * 25}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </>
  );
}
