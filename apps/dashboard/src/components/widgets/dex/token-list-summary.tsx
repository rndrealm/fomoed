import dashboard from "@/lib/assets/dashboard";
import { cn } from "@/lib/utils";
import { SingleTokenType } from "@/services/queries/dex/types";
import Image from "next/image";
import React from "react";

interface IProps {
  list: SingleTokenType[];
  updateTokenValue: (token: SingleTokenType) => void;
  value: SingleTokenType | null;
}

const TokenListSummary = (props: IProps) => {
  const { list, updateTokenValue, value } = props;
  return (
    <div className="flex items-center justify-center w-full gap-1">
      {list.map((token, i) => (
        <button
          key={i}
          className={cn(
            "flex flex-col items-center gap-1 bg-[#1A1A1A] rounded-[8px] flex-1 py-2",
            {
              "border-2 border-[grey]": value?.symbol === token.symbol,
            }
          )}
          type="button"
          onClick={() => updateTokenValue(token)}
        >
          <div>
            <Image
              src={token.logoURI || dashboard.logo}
              alt={token.name}
              width={28}
              height={28}
              className="rounded-full"
            />
          </div>
          <p className="font-medium text-xxs">{token.symbol}</p>
        </button>
      ))}
    </div>
  );
};

export default TokenListSummary;
