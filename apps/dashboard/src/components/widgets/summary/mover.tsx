import React from "react";
import { MoverChart, Trophy } from "@/components/icons/icons";
import { AnimatedNumber } from "../shared";
import { CoinDataInterface } from "@/services/queries/charts/types";
import { formatPriceSignificant } from "@/lib/utils";

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

interface IProps {
  data?: CoinDataInterface;
}

export function Mover(props: IProps) {
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
            <Trophy />
          </div>

          <div
            style={gradientStyle}
            className="w-[56px] h-[56px] rounded-[20px] absolute right-[0px] top-[5px] opacity-[0.2]"
          ></div>
        </div>

        <div className="flex flex-col gap-1 flex-1">
          <p className="text-medium text-[13px] leading-[1.25] text-[#878787] line-clamp-1">
            🔥 BIGGEST MOVER
          </p>
          <p className="text-semibold text-base leading-[1.35] text-white line-clamp-1">
            {/* Ethereum (ETH) */}
            {data?.symbol ? `${data?.name} (${data?.symbol})` : "..."}
          </p>
        </div>
      </div>

      <div className="flex flex-col items-end">
        <div className="flex items-center gap-1">
          <p className="text-semibold text-[13px] leading-[1.25] text-[#555555]">
            ${formatPriceSignificant(oldPrice.toString())}
            <span className="text-[#1FC16B]">
              -${formatPriceSignificant(currentPrice.toString())}
            </span>
          </p>
          <MoverChart />
        </div>
        <div className="flex items-center h-[41px] overflow-hidden">
          <AnimatedNumber
            value={Number(percentChange.toFixed(2))}
            className="text-4xl leading-[1.15] font-bold font-inter"
            style={percentTextStyle}
          />
          <p
            className="text-4xl leading-[1.15] font-bold font-inter"
            style={percentTextStyle}
          >
            %
          </p>
        </div>
      </div>
    </div>
  );
}
