import dashboard from "@/lib/assets/dashboard";
import { cn } from "@/lib/utils";
import { SingleTokenType } from "@/services/queries/dex/types";
import { ChevronDown } from "lucide-react";
import Image from "next/image";
import React from "react";
import RemoteImage from "../../shared/remote-image";

interface IProps {
  value: SingleTokenType | null;
  toggle: () => void;
}

const TokenTrigger = (props: IProps) => {
  const { value, toggle } = props;
  return (
    <button
      className={cn(" flex items-center justify-between gap-[0.375rem]", {
        "": !!value,
      })}
      onClick={toggle}
    >
      <ChevronDown className="w-4 text-[#878787]" />
      {value ? (
        <div className="flex items-center gap-2">
          <div>
            <RemoteImage
              src={value.logoURI}
              alt={value.name}
              width={24}
              height={24}
              className="rounded-full"
            />
          </div>
          <p className="text-xl font-bold ">{value.symbol}</p>
        </div>
      ) : (
        <div className="flex items-center gap-1">
          <div className="rounded-full bg-[#1D1D1D] w-6 h-6 flex items-center justify-center">
            <Image src={dashboard.plus} alt="Plus Icon" />
          </div>
          <p className="text-xl font-bold">***</p>
        </div>
      )}
      {/* <ChevronDown className="w-3" /> */}
    </button>
  );
};

export default TokenTrigger;
