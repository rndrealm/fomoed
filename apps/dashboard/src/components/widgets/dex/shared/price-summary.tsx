import { removeDecimal } from "@/lib/utils";
import { DexQuoteResult } from "@/services/queries/dex/types";
import Image from "next/image";
import React from "react";
import RemoteImage from "../../shared/remote-image";
import { RenderIf } from "@/components/shared";
import ConnectButton from "../connect-button";
import DexTooltip from "./dex-tooltip";
import { DEX_FEE, DEX_FEE_PERCENTAGE } from "@/lib/constants";

interface IProps {
  quoteData?: DexQuoteResult;
}

const PriceSummary = (props: IProps) => {
  const { quoteData } = props;
  const isQuoteReady = quoteData && quoteData.manualRoutes && quoteData.manualRoutes.length > 0;
  const ratio = isQuoteReady ? quoteData.input.priceInUsd / quoteData.manualRoutes[0].output.priceInUsd : undefined;

  return (
    <div className="flex flex-col gap-3 px-0">
      <div className="flex items-center justify-between font-medium">
        <h3 className="text-sm font-medium text-[#878787]">Rate</h3>
        {isQuoteReady ? (
          <p className="text-sm text-white">
            1 {quoteData.input.token.symbol} = {ratio} {quoteData.manualRoutes[0].output.token.symbol}
          </p>
        ) : (
          <p className="text-xxs text-white">0.00</p>
        )}
      </div>
      <div className="flex items-center justify-between font-medium">
        <div className="flex items-center gap-1">
          <h3 className="text-sm font-medium text-[#878787]">Gas Fees</h3>
          <DexTooltip content="Network fee to process your transaction on the blockchain." />
        </div>
        {isQuoteReady ? (
          <p className="text-sm text-white">
            <span className="text-[#878787]">(${quoteData.manualRoutes[0].gasFee.feeInUsd.toFixed(4)}) </span>
            {parseFloat(
              removeDecimal(
                quoteData.manualRoutes[0].gasFee.estimatedFee,
                quoteData.manualRoutes[0].gasFee.gasToken.decimals
              )
            ).toFixed(4)}
            {quoteData.manualRoutes[0].gasFee.gasToken.symbol}
          </p>
        ) : (
          <p className="text-xxs text-white">0.00</p>
        )}
      </div>
      <div className="flex items-center justify-between font-medium">
        <div className="flex items-center gap-1">
          <h3 className="text-sm font-medium text-[#878787]">Fomoed Fees</h3>
          <DexTooltip content="We take a 0.1% fee to keep things running." />
        </div>
        {isQuoteReady ? (
          <p className="text-sm text-white">
            <span className="text-[#878787]">({DEX_FEE_PERCENTAGE}%) </span>
            {(
              parseFloat(
                removeDecimal(
                  quoteData.manualRoutes[0].gasFee.estimatedFee,
                  quoteData.manualRoutes[0].gasFee.gasToken.decimals
                )
              ) * DEX_FEE_PERCENTAGE
            ).toFixed(4)}
            {quoteData.manualRoutes[0].gasFee.gasToken.symbol}
          </p>
        ) : (
          <p className="text-xxs text-white">0.00</p>
        )}
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          <h3 className="text-sm font-medium text-[#878787]">Route</h3>
          <DexTooltip content="The path your trade takes across liquidity sources." />
        </div>
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

            <p className="text-sm font-medium text-white">{quoteData?.manualRoutes[0]?.routeDetails?.name}</p>
          </div>
        </RenderIf>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          <h3 className="text-sm font-medium text-[#878787]">Swap Slippage</h3>
          <DexTooltip content="Price difference in DEX trade execution." />
        </div>
        <p className="text-sm font-medium text-white">{quoteData?.manualRoutes[0]?.slippage}%</p>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-[#878787]">Wallet</p>
        <ConnectButton />
      </div>
    </div>
  );
};

export default PriceSummary;
