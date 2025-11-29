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
import { cn, shortenAddress } from "@/lib/utils";
import WalletImage from "./shared/wallet-image";
import Link from "next/link";

interface IAccountDropdownProps {
  dropdownClassName?: string;
  dropdownTextClassName?: string;
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
  const { account, dropdownClassName, dropdownTextClassName } = props;
  const connections = useConnections();
  const { disconnect } = useDisconnect();
  const chainId = useChainId();
  const chains = useChains();
  const activeChain = chains.find((chain) => chain.id === chainId);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className={cn(
            "flex items-center gap-1 bg-[#161616] border border-[#141414] pl-1 pr-2 py-1 rounded-[10px]",
            dropdownClassName,
          )}
        >
          <WalletImage icon={connections[0]?.connector?.icon} width={24} height={24} />
          {/* <p className="font-medium text-xxs">{account?.displayBalance}</p> */}
          <p className={cn("text-[#4B4B4B] font-semibold text-sm pl-2 ", dropdownTextClassName)}>
            {account?.displayName}
          </p>
          {/* <ChevronDown className="w-4 text-[#878787]" /> */}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="bg-[#161616] flex flex-col gap-1 border border-[#222222] w-[13.4375rem]">
        <Link
          className="flex items-center justify-between bg-[#121212] rounded-[6px] p-2"
          href={`${activeChain?.blockExplorers?.default.url}/address/${account?.address}`}
          title={`View wallet on ${activeChain?.blockExplorers?.default.name}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <div className="flex items-center gap-1 ">
            <WalletImage icon={connections[0]?.connector?.icon} width={24} height={24} />
            <h3 className="font-medium text-white text-ideal">{connections[0]?.connector?.name}</h3>
          </div>
          <div>
            <p className="text-[#4B4B4B] text-sm  font-medium">{account?.displayName}</p>
          </div>
        </Link>
        <div className="flex items-center gap-1 p-3">
          {/* <Link
            className=" rounded-[3px] w-7 h-7 flex justify-center items-center"
            href={`${activeChain?.blockExplorers?.default.url}/address/${account?.address}`}
            title={`View wallet on ${activeChain?.blockExplorers?.default.name}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image src={dashboard.explore} alt="Explore icon" />
          </Link> */}
          <div className="">
            <Image src={dashboard.disconnect} alt="Disconnect icon" />
          </div>
          <button
            className="text-sm font-medium text-[#4B4B4B]  "
            onClick={() => disconnect()}
            title="Disconnect wallet"
          >
            Disconnect Wallet
          </button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default AccountDropdown;
