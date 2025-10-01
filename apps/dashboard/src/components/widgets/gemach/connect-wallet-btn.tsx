import React from "react";
import { ConnectButton as RainbowConnectButton } from "@rainbow-me/rainbowkit";
import { ConnectWallet, Deposit, DollarSign, Globe, Power } from "@/components/icons/icons";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import WalletImage from "../dex/shared/wallet-image";
import { useChainId, useChains, useConnections, useDisconnect } from "wagmi";
import { I } from "vitest/dist/chunks/reporters.nr4dxCkA.js";
import { shortenAddress } from "@/lib/utils";
import { Copy, Send } from "lucide-react";
import { toast } from "sonner";
import { toggleShowFundGdexAtom, toggleShowStatsAtom, toggleWithdrawAtom } from "@/lib/atoms/gemach";
import { useSetAtom } from "jotai";

interface IConnectedWalletBtnProps {
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

function ConnectedWalletBtn(props: IConnectedWalletBtnProps) {
  const { account } = props;

  const toggleWithdraw = useSetAtom(toggleWithdrawAtom);
  const toggleShowFundex = useSetAtom(toggleShowFundGdexAtom);
  const toggleShowStats = useSetAtom(toggleShowStatsAtom);

  const connections = useConnections();
  const { disconnect } = useDisconnect();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <div className="flex items-center gap-1 bg-[#1C1C1C] border border-[#242424] p-[6px] rounded-lg">
          <WalletImage icon={connections[0]?.connector?.icon} width={16} height={16} />
          {/* <p className="font-medium text-xxs">{account?.displayBalance}</p> */}
          <p className="text-[#FAFAFA] font-medium text-xs leading-[16px] tracking-[-0.4%]">
            {shortenAddress(account?.address || "")}
          </p>
          {/* <ChevronDown className="w-4 text-[#878787]" /> */}
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-[#FFFFFF] flex flex-col gap-1 border border-[#222222] w-[170px]">
        <DropdownMenuItem
          className="p-2 cursor-pointer flex items-center gap-2 bg-white focus:bg-[#E3E3E3]"
          onSelect={() => {
            disconnect();
          }}
        >
          <div className="w-[14px] h-[14px] flex justify-center items-center">
            <Power />
          </div>
          <p className="text-[#0C0C0C] text-xs leading-[1.25] font-medium">Disconnect Wallet</p>
        </DropdownMenuItem>

        <DropdownMenuItem
          className="p-2 cursor-pointer flex items-center gap-2 bg-white focus:bg-[#E3E3E3]"
          onSelect={() => {
            toggleShowFundex(true);
          }}
        >
          <div className="w-[14px] h-[14px] flex justify-center items-center">
            <Deposit />
          </div>
          <p className="text-[#0C0C0C] text-xs leading-[1.25] font-medium">Deposit</p>
        </DropdownMenuItem>

        <DropdownMenuItem
          className="p-2 cursor-pointer flex items-center gap-2 bg-white focus:bg-[#E3E3E3]"
          onSelect={() => {
            toggleWithdraw(true);
          }}
        >
          <div className="w-[14px] h-[14px] flex justify-center items-center">
            <Send color="#A6AEB2" size={13} />
          </div>
          <p className="text-[#0C0C0C] text-xs leading-[1.25] font-medium">Withdraw</p>
        </DropdownMenuItem>

        <DropdownMenuItem
          className="p-2 cursor-pointer flex items-center gap-2 bg-white focus:bg-[#E3E3E3]"
          onSelect={async () => {
            await navigator.clipboard.writeText(account?.address || "");
            toast("Copied!");
          }}
        >
          <div className="w-[14px] h-[14px] flex justify-center items-center">
            <Copy color="#A6AEB2" size={13} />
          </div>
          <p className="text-[#0C0C0C] text-xs leading-[1.25] font-medium">Copy Address</p>
        </DropdownMenuItem>

        <DropdownMenuItem
          className="p-2 cursor-pointer flex items-center gap-2 bg-white focus:bg-[#E3E3E3]"
          onSelect={() => {
            toggleShowStats(true);
          }}
        >
          <div className="w-[14px] h-[14px] flex justify-center items-center">
            <DollarSign fill="#A6AEB2" />
          </div>
          <p className="text-[#0C0C0C] text-xs leading-[1.25] font-medium">Copy Trades PnL</p>
        </DropdownMenuItem>

        <DropdownMenuItem className="p-2 cursor-pointer flex items-center gap-2 bg-white focus:bg-[#E3E3E3]">
          <div className="w-[14px] h-[14px] flex justify-center items-center">
            <Globe fill="#A6AEB2" />
          </div>
          <p className="text-[#0C0C0C] text-xs leading-[1.25] font-medium">View Activity</p>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function ConnectWalletBtn() {
  return (
    <RainbowConnectButton.Custom>
      {({ account, chain, openAccountModal, openChainModal, openConnectModal, mounted }) => {
        const ready = mounted;
        const connected = ready && account && chain;
        return (
          <div
            className="flex items-center h-auto lg:h-10"
            {...(!ready && {
              "aria-hidden": true,
              style: {
                opacity: 0,
                pointerEvents: "none",
                userSelect: "none",
              },
            })}
          >
            {(() => {
              if (!connected) {
                return (
                  <button
                    type="button"
                    className="px-2 py-[6px] rounded-lg bg-[#406AC5] flex items-center gap-1"
                    onClick={openConnectModal}
                  >
                    <ConnectWallet />
                    <p className="text-xs font-medium text-[#FAFAFA] leading-[16px] tracking-[-0.4%]">Connect Wallet</p>
                  </button>
                );
              }
              if (chain.unsupported) {
                return (
                  <button
                    className="text-[#A6A6A6] text-xxs border border-[#202020] px-2 h-8 rounded-[6px]"
                    onClick={openChainModal}
                  >
                    Wrong Wallet
                  </button>
                );
              }

              return <ConnectedWalletBtn account={account} />;
            })()}
          </div>
        );
      }}
    </RainbowConnectButton.Custom>
  );
}
