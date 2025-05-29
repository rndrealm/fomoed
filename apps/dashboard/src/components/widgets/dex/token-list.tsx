import dashboard from "@/lib/assets/dashboard";
import { cn, shortenAddress } from "@/lib/utils";
import { SingleTokenType } from "@/services/queries/dex/types";
import Image from "next/image";
import React from "react";
import RemoteImage from "../shared/remote-image";

interface IProps {
  list: SingleTokenType[];
  updateTokenValue: (token: SingleTokenType) => void;
  className?: string;
  value: SingleTokenType | null;
}

const TokenList = (props: IProps) => {
  const { list, updateTokenValue, className, value } = props;

  return (
    <div className={cn("mt-6 flex flex-col gap-[0.875rem]", className)}>
      {list.map((token, i) => (
        <button
          key={i}
          className="flex justify-between"
          type="button"
          onClick={() => updateTokenValue(token)}
        >
          <div className="flex items-center gap-2">
            <div>
              <RemoteImage
                src={token.logoURI}
                alt={token.name}
                width={28}
                height={28}
                className="rounded-full"
              />
            </div>
            <div>
              <h3 className="text-xs font-medium text-left">{token.name}</h3>
              <p className="text-[#A5A5A5] text-xxxs text-left">
                {token.symbol} {shortenAddress(token.address)}
              </p>
            </div>
          </div>

          {value?.symbol === token.symbol ? (
            <div>
              <Image
                src={dashboard.check}
                alt="Selected icon"
                width={12}
                height={12}
              />
            </div>
          ) : null}
        </button>
      ))}
    </div>
  );
};

export default TokenList;
