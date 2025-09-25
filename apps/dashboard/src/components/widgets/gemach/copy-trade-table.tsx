import React from "react";
import { toast } from "sonner";
import { useAtomValue, useSetAtom } from "jotai";
import { useAccount } from "wagmi";
import { Copy, ExternalLink } from "@/components/icons/icons";
import { RenderIf } from "@/components/shared";
import { Spinner } from "@/components/ui/shadcn-io/spinner";
import { cn, CryptoUtils, formatDateMMDDYYFromUnix, shortenAddress, shortenString } from "@/lib/utils";
import { useReadGemachCopyTrades, useReadHyperLiquidLeaderboard } from "@/services/queries/gemach";
import { useSupabaseAuth } from "@/components/providers";
import {
  copyTradeTraderWalletAtom,
  gemachUserLoggedInAtom,
  singleCopyTradeAtom,
  toggleCreateCopyTradeAtom,
  toggleEditCopyTradeAtom,
} from "@/lib/atoms/gemach";

interface ITableHeaderProps {
  onClick?: () => void;
  title?: string;
  isActive?: boolean;
}

interface IStatusPillProps {
  status: boolean;
}

export function StatusPill(props: IStatusPillProps) {
  const { status } = props;

  return (
    <div
      className={cn(
        "w-[68px] h-[24px] rounded-[20px] flex items-center justify-center",
        status ? "bg-[#00AF58]" : "bg-[#404241]",
      )}
    >
      <p
        className={cn(
          "text-xs leading-[16px] tracking-[-0.4%] text-center",
          status ? "text-[#A4FFD2]" : "text-[#A6AEB2]",
        )}
      >
        {status ? "Running" : "Paused"}
      </p>
    </div>
  );
}

function TableHeader(props: ITableHeaderProps) {
  const { isActive, onClick, title } = props;

  return (
    <th className=" bg-[#1C1C1C]">
      <button type="button" onClick={onClick} className="px-2 py-3 w-full">
        <p className="text-left text-xs leading-[16px] tracking-[-0.4%] whitespace-nowrap text-[#A6AEB2]">{title}</p>
      </button>
    </th>
  );
}

export function CopyTradeTable() {
  const { session } = useSupabaseAuth();

  const { address } = useAccount();

  const gemachUserLoggedIn = useAtomValue(gemachUserLoggedInAtom);

  const { data, isLoading } = useReadGemachCopyTrades(address, gemachUserLoggedIn, session?.access_token);

  const setSingleCopyTrade = useSetAtom(singleCopyTradeAtom);

  const toggleShowEditCopyTrade = useSetAtom(toggleEditCopyTradeAtom);

  return (
    <div className="flex-1 mb-4 w-full h-full scrollbar">
      <table className="w-full table-auto rounded-lg borde border-[#262626] border-separate border-spacing-0">
        <thead className="sticky top-0 z-[3] bg-[#1C1C1C]">
          <tr>
            <th className="px-2 py-3 text-left text-xs leading-[16px] tracking-[-0.4%] whitespace-nowrap text-[#A6AEB2] bg-[#1C1C1C] rounded-tl-lg bordr-r border-[#262626]">
              Label
            </th>

            <th className="px-2 py-3 text-left text-xs leading-[16px] tracking-[-0.4%] whitespace-nowrap text-[#A6AEB2] bg-[#1C1C1C]">
              Wallet Address
            </th>
            <TableHeader title="Status" />
            <TableHeader title="Date" />
            <TableHeader title="PnL" />
            <TableHeader title="Vol" />

            <th className="px-2 py-3 text-left text-xs leading-[16px] tracking-[-0.4%] whitespace-nowrap text-[#A6AEB2] bg-[#1C1C1C] rounded-tr-lg"></th>
          </tr>
        </thead>
        <tbody>
          <RenderIf condition={isLoading}>
            <tr>
              <td colSpan={7}>
                <div className="flex justify-center py-4 w-full">
                  <Spinner />
                </div>
              </td>
            </tr>
          </RenderIf>

          {data.map((item, index) => (
            <tr
              key={index}
              className="hover:bg-[#252525] transition-colors cursor-pointer"
              onClick={() => {
                setSingleCopyTrade(item);
              }}
            >
              <td className="py-4 px-1 text-xs tracking-[-0.4%] leading-[16px] whitespace-nowrap text-[#FAFAFA] bordr-r border-[#2D2D2D]">
                {shortenString(item?.copyTradeName)}
              </td>
              <td className="py-4 px-1 text-xs tracking-[-0.4%] leading-[16px] whitespace-nowrap font-medium text-[#FAFAFA]">
                <div className="flex items-center gap-2">
                  {shortenAddress(item?.traderWallet)}
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigator.clipboard.writeText(item?.traderWallet);
                        toast("Copied!!!");
                      }}
                    >
                      <Copy />
                    </button>

                    <a
                      href={`https://app.hyperliquid.xyz/explorer/address/${item?.traderWallet}`}
                      target="_blank"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <ExternalLink />
                    </a>
                  </div>
                </div>
              </td>
              <td className="py-4 px-1 text-xs tracking-[-0.4%] leading-[16px] whitespace-nowrap font-medium text-[#FAFAFA]">
                <StatusPill status={item?.isActive} />
              </td>

              <td className={cn("py-4 px-1 text-xs tracking-[-0.4%] leading-[16px] whitespace-nowrap font-medium")}>
                {formatDateMMDDYYFromUnix(item?.createdAt || 0)}
              </td>

              <td
                className={cn(
                  "py-4 px-1 text-xs tracking-[-0.4%] leading-[16px] whitespace-nowrap font-medium",
                  item?.totalPnl >= 0 ? "text-[#00AF58]" : "text-[#DC2626]",
                )}
              >
                {CryptoUtils.formatLargeNumber(CryptoUtils.formatPercentage(item?.totalPnl))}%
              </td>

              <td className="py-4 px-1 text-xs tracking-[-0.4%] leading-[16px] whitespace-nowrap font-medium text-[#FAFAFA]">
                ${CryptoUtils.formatLargeNumber(item?.totalVolumes)}
              </td>

              <td>
                <button
                  type="button"
                  className="text-[##FAFAFA] text-xs tracking-[-0.4%] leading-[16px] font-medium px-2 py-[6px] bg-[#202020] rounded-2xl whitespace-nowrap"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSingleCopyTrade(item);
                    toggleShowEditCopyTrade(true);
                  }}
                >
                  Edit Trade
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
