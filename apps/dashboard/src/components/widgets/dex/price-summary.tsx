import { removeDecimal } from "@/lib/utils";
import { DexQuoteResult } from "@/services/queries/dex/types";
import Image from "next/image";
import React from "react";
import RemoteImage from "../shared/remote-image";
import { RenderIf } from "@/components/shared";

interface IProps {
  quoteData?: DexQuoteResult;
}

const PriceSummary = (props: IProps) => {
  const { quoteData } = props;
  const isQuoteReady =
    quoteData && quoteData.manualRoutes && quoteData.manualRoutes.length > 0;
  const ratio = isQuoteReady
    ? quoteData.input.priceInUsd / quoteData.manualRoutes[0].output.priceInUsd
    : undefined;

  return (
    <div className="flex flex-col gap-2 px-3">
      <div className="flex items-center justify-between font-medium ">
        <h3 className="text-xs ">Price</h3>
        {isQuoteReady ? (
          <p className="text-white text-xxs ">
            1 {quoteData.input.token.symbol} = {ratio}{" "}
            {quoteData.manualRoutes[0].output.token.symbol}
          </p>
        ) : (
          <p className="text-white text-xxs ">0.00</p>
        )}
      </div>
      <div className="flex items-center justify-between ">
        <h3 className="text-xxs text-[#A5A5A5] ">Minimum received</h3>
        <p className="font-medium text-white text-xxs ">
          {isQuoteReady
            ? removeDecimal(
                quoteData.manualRoutes[0].output.minAmountOut,
                quoteData.manualRoutes[0].output.token.decimals
              )
            : "0.00"}
        </p>
      </div>
      <div className="flex items-center justify-between ">
        <h3 className="text-xxs text-[#A5A5A5] ">Dex Provider</h3>
        <RenderIf condition={!!quoteData?.manualRoutes[0]?.routeDetails?.name}>
          <div className="flex items-center gap-1">
            <div>
              <RemoteImage
                src={quoteData?.manualRoutes[0]?.routeDetails?.logoURI}
                alt={quoteData?.manualRoutes[0]?.routeDetails?.name || ""}
                width={16}
                height={16}
              />
            </div>

            <p className="font-medium text-white text-xxs ">
              {quoteData?.manualRoutes[0]?.routeDetails?.name}
            </p>
          </div>
        </RenderIf>
      </div>
    </div>
  );
};

export default PriceSummary;
