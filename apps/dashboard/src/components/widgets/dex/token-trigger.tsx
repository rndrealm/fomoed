import dashboard from "@/lib/assets/dashboard";
import { cn } from "@/lib/utils";
import { SingleTokenType } from "@/services/queries/dex/types";
import { ChevronDown } from "lucide-react";
import Image from "next/image";
import React from "react";
import RemoteImage from "../shared/remote-image";

interface IProps {
  value: SingleTokenType | null;
  toggle: () => void;
}

const TokenTrigger = (props: IProps) => {
  const { value, toggle } = props;
  console.log("ttt:", value?.logoURI);
  return (
    <button
      className={cn(
        " text-xxxs border border-[#202020] px-1 h-6 rounded-[20px] font-medium flex items-center justify-between ",
        {
          "bg-[#202020]": !!value,
        }
      )}
      onClick={toggle}
    >
      {value ? (
        <div className="flex items-center gap-1">
          <div>
            <RemoteImage
              src={value.logoURI}
              alt={value.name}
              width={16}
              height={16}
              className="rounded-full"
            />
          </div>
          <p className="font-medium text-xxxs">{value.symbol}</p>
        </div>
      ) : (
        <p> Select a token</p>
      )}
      <ChevronDown className="w-3" />
    </button>
  );
};

export default TokenTrigger;
