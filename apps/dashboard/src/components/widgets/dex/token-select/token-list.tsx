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
    <div className={cn("flex flex-col gap-1", className)}>
      {list.map((token, i) => (
        <button
          key={i}
          className={cn("flex justify-between rounded-[12px] px-2 py-4", {
            "bg-[#161616]": value?.address === token.address,
          })}
          type="button"
          onClick={() => updateTokenValue(token)}
        >
          <div className="flex items-center gap-2">
            <div className="h-8 w-8">
              <RemoteImage
                src={token.logoURI}
                alt={token.name}
                width={32}
                height={32}
                className="rounded-full object-cover"
              />
            </div>
            <div className="flex-1">
              <h3 className="text-left text-base leading-[1rem] font-bold">{token.symbol}</h3>
              <p className="text-left text-xs font-medium text-[#878787]">{token.name}</p>
              {/* <p className="text-[#A5A5A5] text-xxxs text-left">
                {token.symbol} {shortenAddress(token.address)}
              </p> */}
            </div>
          </div>

          <div>
            <h3 className="text-right text-base leading-[1rem] font-bold">
              {parseFloat(removeDecimal(token.balance, token.decimals)).toFixed(2)}
            </h3>
            <p className="text-right text-xs font-medium text-[#878787]">Available Balance</p>
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
