import React, { memo } from "react";
import { TokenTag } from "./token-tag";

interface ITokenProps {
  isSpot?: boolean;
  baseTokenName?: string;
  quoteTokenName?: string;
  maxLeverage?: number;
}

export const Token = memo(function Token(props: ITokenProps) {
  const { isSpot = false, baseTokenName = "HYPE", quoteTokenName = "USDT", maxLeverage = 40 } = props;
  const tokenName = isSpot ? `${baseTokenName}/${quoteTokenName}` : `${baseTokenName}-${quoteTokenName}`;

  return (
    <div className="flex gap-1 items-center">
      <p className="text-[10px] tracking-[-0.2%] leading-[1.0] whitespace-nowrap text-white">{tokenName}</p>

      <TokenTag isSpot={isSpot} maxLeverage={maxLeverage} />
    </div>
  );
});
