import dashboard from "@/lib/assets/dashboard";
import { cn, removeDecimal, shortenAddress } from "@/lib/utils";
import { ChainType, SingleTokenType } from "@/services/queries/dex/types";
import Image from "next/image";
import React from "react";
import RemoteImage from "../../shared/remote-image";

interface IProps {
  list: SingleTokenType[];
  updateTokenValue: (token: SingleTokenType) => void;
  className?: string;
  value: SingleTokenType | null;
}

const TokenList = (props: IProps) => {
  const { list, updateTokenValue, className, value } = props;

  return (
    <div className={cn(" flex flex-col gap-1", className)}>
      {list.map((token, i) => (
        <button
          key={i}
          className={cn("flex justify-between py-4 px-2 rounded-[12px]", {
            "bg-[#161616]": value?.address === token.address,
          })}
          type="button"
          onClick={() => updateTokenValue(token)}
        >
          <div className="flex items-center gap-2">
            <div>
              <RemoteImage
                src={token.logoURI}
                alt={token.name}
                width={32}
                height={32}
                className="rounded-full"
              />
            </div>
            <div>
              <h3 className="text-base font-bold text-left leading-[1rem]">
                {token.symbol}
              </h3>
              <p className="text-[#878787] text-xs font-medium text-left">
                {token.name}
              </p>
              {/* <p className="text-[#A5A5A5] text-xxxs text-left">
                {token.symbol} {shortenAddress(token.address)}
              </p> */}
            </div>
          </div>

          <div>
            <h3 className="text-base font-bold text-right leading-[1rem]">
              {parseFloat(removeDecimal(token.balance, token.decimals)).toFixed(
                2
              )}
            </h3>
            <p className="text-[#878787] text-xs font-medium text-right">
              Available Balance
            </p>
          </div>

          {/* {value?.address === token.address ? (
            <div>
              <Image
                src={dashboard.check}
                alt="Selected icon"
                width={12}
                height={12}
              />
            </div>
          ) : null} */}
        </button>
      ))}
    </div>
  );
};

export default TokenList;
