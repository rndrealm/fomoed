import dashboard from "@/lib/assets/dashboard";
import { useReadCoinList } from "@/services/queries/charts";
import Image from "next/image";
import React from "react";
import RemoteImage from "../widgets/shared/remote-image";

interface IProps {
  symbol: string;
}

const TokenPill = (props: IProps) => {
  const { symbol } = props;
  const { data } = useReadCoinList();
  const token = data?.find((item) => item.symbol === symbol);
  return (
    <div className="flex items-center gap-2 rounded-[40px] border border-dashed border-[#2A2A2A] bg-[#1A1A1A] py-1 pr-3 pl-2">
      <div>
        <RemoteImage src={token?.icon} alt="Eth" className="rounded-full" width={20} height={20} />
      </div>
      <p className="text-xs text-[#BBBBBB]">{symbol}</p>
    </div>
  );
};

export default TokenPill;
