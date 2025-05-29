import dashboard from "@/lib/assets/dashboard";
import { cn } from "@/lib/utils";
import { useFetchSupportedChains } from "@/services/queries/dex";
import { ChainType } from "@/services/queries/dex/types";
import { ChevronDown } from "lucide-react";
import Image from "next/image";
import React, { Fragment, useEffect, useState } from "react";
import RemoteImage from "../shared/remote-image";

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
        className="flex items-center border-[#121212] bg-[#080808] rounded-[20px]  px-2"
        onClick={toggle}
      >
        {networkValue ? (
          <div>
            <Image
              src={networkValue.icon || dashboard.token}
              alt={networkValue.name}
              width={16}
              height={16}
              className="rounded-full "
            />
          </div>
        ) : (
          <p className="text-[#A6A6A6] font-medium text-xxs">Network</p>
        )}
        <ChevronDown
          className={cn("w-3 transition-transform", {
            "rotate-180": isOpen,
          })}
        />
      </button>
      {isOpen ? (
        <>
          <div
            className="fixed inset-0 bg-black opacity-0 z-[100]"
            onClick={toggle}
          ></div>
          <div className="absolute top-7 right-0 max-h-[200px] w-[110px] overflow-y-auto bg-[#080808] px-2 py-4 z-[101] flex flex-col gap-4 scrollbar">
            {networkList?.map((network, i) => (
              <button
                key={i}
                className="flex items-center justify-between "
                onClick={() => {
                  updateNetworkValue(network);
                  setIsOpen(false);
                }}
              >
                <div className="flex items-center gap-1">
                  <div>
                    <RemoteImage
                      src={network.icon || dashboard.token}
                      alt={network.name}
                      width={16}
                      height={16}
                      className="rounded-full"
                    />
                  </div>
                  <p className="font-medium text-xxs">{network.name}</p>
                </div>
                {networkValue?.chainId === network.chainId ? (
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
        </>
      ) : null}
    </div>
  );
};

export default NetworkSelect;
