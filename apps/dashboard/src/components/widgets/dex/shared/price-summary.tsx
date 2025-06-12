import { removeDecimal } from "@/lib/utils";
import { DexQuoteResult } from "@/services/queries/dex/types";
import Image from "next/image";
import React from "react";
import RemoteImage from "../../shared/remote-image";
import { RenderIf } from "@/components/shared";
import ConnectButton from "../connect-button";

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
    <div className="flex flex-col gap-3 px-0">
      <div className="flex items-center justify-between font-medium ">
        <h3 className="text-sm text-[#878787] ">Rate</h3>
        {isQuoteReady ? (
          <p className="text-sm text-white ">
            1 {quoteData.input.token.symbol} = {ratio}{" "}
            {quoteData.manualRoutes[0].output.token.symbol}
          </p>
        ) : (
          <p className="text-white text-xxs ">0.00</p>
        )}
      </div>
      <div className="flex items-center justify-between font-medium ">
        <h3 className="text-sm text-[#878787] ">Gas Fees</h3>
        {isQuoteReady ? (
          <p className="text-sm text-white ">
            <span className="text-[#878787]">
              (${quoteData.manualRoutes[0].gasFee.feeInUsd.toFixed(4)}){" "}
            </span>
            {parseFloat(
              removeDecimal(
                quoteData.manualRoutes[0].gasFee.estimatedFee,
                quoteData.manualRoutes[0].gasFee.gasToken.decimals
              )
            ).toFixed(4)}
            {quoteData.manualRoutes[0].gasFee.gasToken.symbol}
          </p>
        ) : (
          <p className="text-white text-xxs ">0.00</p>
        )}
      </div>
      <div className="flex items-center justify-between font-medium ">
        <h3 className="text-sm text-[#878787] ">Fomoed Fees</h3>
        {isQuoteReady ? (
          <p className="text-sm text-white ">
            <span className="text-[#878787]">(0.02%) </span>
            {(
              parseFloat(
                removeDecimal(
                  quoteData.manualRoutes[0].gasFee.estimatedFee,
                  quoteData.manualRoutes[0].gasFee.gasToken.decimals
                )
              ) * 0.02
            ).toFixed(4)}
            {quoteData.manualRoutes[0].gasFee.gasToken.symbol}
          </p>
        ) : (
          <p className="text-white text-xxs ">0.00</p>
        )}
      </div>

      <div className="flex items-center justify-between ">
        <h3 className="text-sm text-[#878787] ">Route</h3>
        <RenderIf condition={!!quoteData?.manualRoutes[0]?.routeDetails?.name}>
          <div className="flex items-center gap-1">
            <div>
              <RemoteImage
                src={quoteData?.manualRoutes[0]?.routeDetails?.logoURI}
                alt={quoteData?.manualRoutes[0]?.routeDetails?.name || ""}
                width={24}
                height={24}
              />
            </div>

            <p className="text-sm font-medium text-white ">
              {quoteData?.manualRoutes[0]?.routeDetails?.name}
            </p>
          </div>
        </RenderIf>
      </div>

      <div className="flex items-center justify-between ">
        <h3 className="text-sm text-[#878787] ">Slippage</h3>
        <p className="text-sm font-medium text-white ">
          {quoteData?.manualRoutes[0]?.slippage}%
        </p>
      </div>

      <div className="flex items-center justify-between ">
        <p className="text-[#878787] font-medium text-sm">Wallet</p>
        <ConnectButton />
      </div>
    </div>
  );
};

export default PriceSummary;
