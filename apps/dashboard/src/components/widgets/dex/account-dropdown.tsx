/* eslint-disable @next/next/no-img-element */
"use client";

import * as React from "react";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CoinDataInterface } from "@/services/queries/charts/types";
import Image from "next/image";
import { ChevronDown } from "lucide-react";
import { cfgi_supported_tokens } from "@/constant/cfgi-data";
import { useGetUserPlans } from "@/services/queries/subscriptions";
import { RenderIf } from "@/components/shared";
import dashboard from "@/lib/assets/dashboard";
import {
  useAccount,
  useChainId,
  useChains,
  useConnections,
  useConnectorClient,
  useConnectors,
  useDisconnect,
  useWalletClient,
} from "wagmi";
import { shortenAddress } from "@/lib/utils";
import WalletImage from "./wallet-image";
import Link from "next/link";

interface IAccountDropdownProps {
  account?: {
    address: string;
    balanceDecimals?: number;
    balanceFormatted?: string;
    balanceSymbol?: string;
    displayBalance?: string;
    displayName: string;
    ensAvatar?: string;
    ensName?: string;
    hasPendingTransactions: boolean;
  };
}

const AccountDropdown = (props: IAccountDropdownProps) => {
  const { account } = props;
  const connections = useConnections();
  const { disconnect } = useDisconnect();
  const chainId = useChainId();
  const chains = useChains();
  const activeChain = chains.find((chain) => chain.id === chainId);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-1 bg-[#121212] border border-[#141414] px-2 h-8 rounded-[6px]">
          <WalletImage icon={connections[0].connector.icon} />
          <p className="font-medium text-xxs">{account?.displayBalance}</p>
          <p className="text-[#A6A6A6] font-medium text-xxs bg-[#080808] rounded-[3px] p-1">
            {account?.displayName}
          </p>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className=" h-9 bg-[#121212] flex items-center gap-2 border-[1.5px] border-[#1E1E1E]">
        <div>
          <div className="flex items-center gap-1">
            <WalletImage
              icon={connections[0].connector.icon}
              width={24}
              height={24}
            />
            <div>
              <h3 className="font-medium text-white text-xxs">
                {connections[0]?.connector.name}
              </h3>
              <div>
                <p className="text-[#A6A6A6] text-xxxs font-medium">
                  {account?.displayName}
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Link
            className="bg-[#080808] rounded-[3px] w-7 h-7 flex justify-center items-center"
            href={`${activeChain?.blockExplorers?.default.url}/address/${account?.address}`}
            title={`View wallet on ${activeChain?.blockExplorers?.default.name}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image src={dashboard.explore} alt="Explore icon" />
          </Link>
          <button
            className="text-xxs font-medium text-[#C3C3C3] bg-[#080808] rounded-[3px] h-7 w-[4.375rem]"
            onClick={() => disconnect()}
            title="Disconnect wallet"
          >
            Disconnect
          </button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default AccountDropdown;
