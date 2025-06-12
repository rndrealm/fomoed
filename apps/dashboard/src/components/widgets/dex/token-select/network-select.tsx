import dashboard from "@/lib/assets/dashboard";
import { cn } from "@/lib/utils";
import { useFetchSupportedChains } from "@/services/queries/dex";
import { ChainType } from "@/services/queries/dex/types";
import { ChevronDown } from "lucide-react";
import Image from "next/image";
import React, { Fragment, useEffect, useState } from "react";
import RemoteImage from "../../shared/remote-image";

interface IProps {
  networkValue: ChainType | null;
  updateNetworkValue: (network: ChainType) => void;
}

const NetworkSelect = (props: IProps) => {
  const { networkValue, updateNetworkValue } = props;
  const [isOpen, setIsOpen] = useState(false);
  const toggle = () => setIsOpen(!isOpen);
  const { data: networkList } = useFetchSupportedChains();

  return (
    <div className="relative">
      <button
        className="flex items-center gap-1 rounded-[20px]  px-2"
        onClick={toggle}
      >
        {networkValue ? (
          <div>
            <Image
              src={networkValue.icon || dashboard.token}
              alt={networkValue.name}
              width={24}
              height={24}
              className="rounded-full "
            />
          </div>
        ) : (
          <p className="text-[#A6A6A6] font-medium text-xxs">Network</p>
        )}
        <ChevronDown
          className={cn("w-3 transition-transform text-[#878787]", {
            "rotate-180": isOpen,
          })}
        />
      </button>
      {isOpen ? (
        <>
          <div className="fixed inset-0  z-[100]" onClick={toggle}></div>
          <div className="absolute top-7 right-0 max-h-[200px] w-[166px] overflow-y-auto bg-[#090909] border border-[#191919] rounded-[10px] p-[0.875rem] z-[101]  scrollbar">
            <h1 className="text-[#373737] text-ideal font-semibold py-[0.35rem]">
              Select Network
            </h1>
            <div className="flex flex-col gap-2 mt-2">
              {networkList?.map((network, i) => (
                <button
                  key={i}
                  className="flex items-center justify-between py-[0.4375rem]"
                  onClick={() => {
                    updateNetworkValue(network);
                    setIsOpen(false);
                  }}
                >
                  <div className="flex items-center gap-2 text-[#C3C3C3]">
                    <div>
                      <RemoteImage
                        src={network.icon || dashboard.token}
                        alt={network.name}
                        width={20}
                        height={20}
                        className="rounded-full"
                      />
                    </div>
                    <p className="font-medium text-ideal">{network.name}</p>
                  </div>
                  {networkValue?.chainId === network.chainId ? (
                    <div>
                      <Image
                        src={dashboard.checkV2}
                        alt="Selected icon"
                        width={12}
                        height={12}
                      />
                    </div>
                  ) : null}
                </button>
              ))}
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
};

export default NetworkSelect;
