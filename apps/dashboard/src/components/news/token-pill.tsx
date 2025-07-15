import dashboard from "@/lib/assets/dashboard";
import Image from "next/image";
import React from "react";

const TokenPill = () => {
  return (
    <div className="flex items-center gap-2 rounded-[40px] border border-dashed border-[#2A2A2A] bg-[#1A1A1A] py-1 pr-3 pl-2">
      <div>
        <Image src={dashboard.eth} alt="Eth" className="rounded-full" width={20} height={20} />
      </div>
      <p className="text-xs text-[#BBBBBB]">Aave</p>
    </div>
  );
};

export default TokenPill;
