"use client";
import dashboard from "@/lib/assets/dashboard";
import { ChevronDown } from "lucide-react";
import Image from "next/image";
import TokenSelect from "./token-select";
import { useFetchSupportedChains } from "@/services/queries/dex";
import { useState } from "react";
import { ChainType, SingleTokenType } from "@/services/queries/dex/types";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import ConnectButton from "./connect-button";
import { useBalance } from "wagmi";

interface SwapData {
  from: {
    token: SingleTokenType | null;
    network: ChainType | null;
  };
  to: {
    token: SingleTokenType | null;
    network: ChainType | null;
  };
}

const DexWidget = () => {
  useFetchSupportedChains();
  const [swapData, setSwapData] = useState<SwapData>({
    from: {
      token: null,
      network: null,
    },
    to: {
      token: null,
      network: null,
    },
  });
  const updateSwapData = (
    type: "from" | "to",
    slug: "token" | "network",
    value: SingleTokenType | ChainType | null
  ) => {
    setSwapData((prevData) => ({
      ...prevData,
      [type]: {
        ...prevData[type],
        [slug]: value,
      },
    }));
  };

  const { openConnectModal } = useConnectModal();
  const balance = useBalance();

  return (
    <div className="text-white border border-[#1E1E1E] rounded-[15px] p-3 font-inter font-semibold bg-[#080808] h-full relative">
      {/* Header */}
      <div className="flex items-center justify-between ">
        <h1 className="text-mid">Swap</h1>
        <div className="flex items-center gap-2">
          <ConnectButton />
          <button className="bg-[#121212] px-2 h-8 border border-[#141414] rounded-[6px]">
            <Image src={dashboard.settings} alt="Settings icon" />
          </button>
        </div>
      </div>

      {/* Main */}
      <div className="bg-[#121212] rounded-[16px]  py-4 mt-2">
        {/* Transfer section */}
        <div className="px-3 pb-4">
          {/* From */}
          <div>
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium">From:</p>
              <p className="font-normal text-xxs">Balance: 0:00</p>
            </div>
            <div className="flex items-center justify-between mt-1 rounded-[8px] bg-[#080808] px-3 py-sm">
              <p className="text-xs font-medium">0.0</p>
              <TokenSelect
                tokenData={swapData.from}
                otherTokenData={swapData.to}
                updateTokenData={updateSwapData}
                slug="from"
              />
            </div>
          </div>

          <div className="flex items-center justify-center my-sm">
            <div className="w-8 h-8 flex items-center justify-center rounded-full bg-[#202020] ">
              <Image src={dashboard.swap} alt="Swap icon" />
            </div>
          </div>

          {/* To */}
          <div>
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium">From:</p>
              <p className="font-normal text-xxs">Balance: 0:00</p>
            </div>
            <div className="flex items-center justify-between mt-1 rounded-[8px] bg-[#080808] px-3 py-sm">
              <p className="text-xs font-medium">0.0</p>
              <TokenSelect
                tokenData={swapData.to}
                otherTokenData={swapData.from}
                updateTokenData={updateSwapData}
                slug="to"
              />
            </div>
          </div>
        </div>

        {/* Summary section */}
        <div className="border-t border-[#1E1E1E] pt-4 flex flex-col justify-between">
          <div className="flex flex-col px-3 gap-sm">
            <div className="flex items-center justify-between font-medium ">
              <h3 className="text-xs ">Price</h3>
              <p className="text-xxs text-[#A5A5A5] ">0.00</p>
            </div>
            <div className="flex items-center justify-between  text-[#A5A5A5]">
              <h3 className="text-xxs ">Minimum received</h3>
              <p className="font-medium text-xxs ">0.00</p>
            </div>
          </div>

          {/* Connect button */}
          <div className="px-3 mt-7">
            <button
              className="w-full h-10 text-xs font-medium bg-[#202020] rounded-[6px]"
              onClick={openConnectModal}
            >
              Connect Wallet
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DexWidget;
