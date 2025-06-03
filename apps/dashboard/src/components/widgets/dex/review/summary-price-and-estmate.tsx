import { removeDecimal } from "@/lib/utils";
import { DexQuoteResult } from "@/services/queries/dex/types";
import React from "react";

interface IProps {
  value: DexQuoteResult["manualRoutes"][0]["output"] | DexQuoteResult["input"];
}

const SummaryPriceAndEstimate = (props: IProps) => {
  const { value } = props;
  const valueAmount = parseFloat(
    removeDecimal(value.amount, value.token.decimals)
  );

  const valueRate = valueAmount * value.priceInUsd;
  return (
    <div className="flex flex-col items-end">
      {/* Todo: Improve remove decimal function so tha */}
      <p className="pb-1 text-xl tracking-normal font-lg">
        {valueAmount.toFixed(3)}
        {value.token.symbol}
      </p>
      <p className="text-[#A5A5A5] text-xs">≈${valueRate.toFixed(4)}</p>
    </div>
  );
};

export default SummaryPriceAndEstimate;
