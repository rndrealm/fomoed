import React from "react";
import { DownTrend, LoserChart } from "@/components/icons/icons";
import { AnimatedNumber } from "../shared";
import { CoinDataInterface } from "@/services/queries/charts/types";
import { formatPriceSignificant } from "@/lib/utils";

const gradientStyle = {
  background:
    "radial-gradient(378.86% 378.86% at -51.09% -33.99%, #ff8970 10.51%, #84ebb4 48.98%, #ffdb43 86.81%)",
};

interface IProps {
  data?: CoinDataInterface;
}

export function Loser(props: IProps) {
  const { data } = props;

  const percentChange = data?.priceChange || 0;
  const currentPrice = data?.price || 0;
  const oldPrice = currentPrice / (1 + percentChange / 100);

  return (
    <div className="flex items-center justify-between flex-1">
      <div className="flex items-center gap-4 flex-1">
        <div className="h-[64px] w-[83px] relative">
          <div
            style={gradientStyle}
            className="w-[64px] h-[64px] rounded-[20px] flex items-center justify-center"
          >
            <DownTrend />
          </div>

          <div
            style={gradientStyle}
            className="w-[56px] h-[56px] rounded-[20px] absolute right-[0px] top-[5px] opacity-[0.2]"
          ></div>
        </div>

        <div className="flex flex-col gap-1 flex-1">
          <p className="text-medium text-[13px] leading-[1.25] text-[#878787] line-clamp-1">
            😶‍🌫️ BIGGEST LOSER
          </p>
          <p className="text-semibold text-base leading-[1.35] text-white flex-1 line-clamp-1">
            {/* Ethereum (ETH) */}
            {data?.symbol ? `${data?.name} (${data?.symbol})` : "..."}
          </p>
        </div>
      </div>

      <div className="flex flex-col items-end">
        <div className="flex items-center gap-1">
          <p className="text-semibold text-[13px] leading-[1.25] text-[#555555]">
            ${formatPriceSignificant(oldPrice.toString())}
            <span className="text-[#FF8970]">
              -${formatPriceSignificant(currentPrice.toString())}
            </span>
          </p>
          <LoserChart />
        </div>
        <div className="flex items-center h-[41px] overflow-hidden">
          <AnimatedNumber
            value={Number(percentChange.toFixed(2))}
            className="text-4xl leading-[1.15] font-bold text-[#FF8970] font-inter"
          />
          <p className="text-4xl leading-[1.15] font-bold text-[#FF8970] font-inter">
            %
          </p>
        </div>
      </div>
    </div>
  );
}
