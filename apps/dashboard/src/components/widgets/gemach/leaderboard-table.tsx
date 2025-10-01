import React from "react";
import { toast } from "sonner";
import { useSetAtom } from "jotai";
import { Copy, ExternalLink } from "@/components/icons/icons";
import { RenderIf } from "@/components/shared";
import { Spinner } from "@/components/ui/shadcn-io/spinner";
import { cn, CryptoUtils, shortenAddress } from "@/lib/utils";
import { useReadHyperLiquidLeaderboard } from "@/services/queries/gemach";
import { useSupabaseAuth } from "@/components/providers";
import { copyTradeTraderWalletAtom, toggleCreateCopyTradeAtom } from "@/lib/atoms/gemach";
import { TimeWindow } from "@/services/queries/gemach/types";

interface ITableHeaderProps {
  onClick?: () => void;
  title?: string;
  isActive?: boolean;
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

interface IProps {
  timeWindow: TimeWindow;
}

const timeWindowMap = {
  day: 0,
  week: 1,
  month: 2,
  allTime: 3,
};

export function LeaderboardTable(props: IProps) {
  const { timeWindow } = props;

  const { session } = useSupabaseAuth();

  const toggleShowCreateCopyTrade = useSetAtom(toggleCreateCopyTradeAtom);
  const setTraderWallet = useSetAtom(copyTradeTraderWalletAtom);

  const { data, isLoading } = useReadHyperLiquidLeaderboard({
    authToken: session?.access_token,
    timeWindow: timeWindow,
  });

  return (
    <div className="flex-1 mb-4 w-full h-full scrollbar">
      <table className="w-full table-auto rounded-lg borde border-[#262626] border-separate border-spacing-0">
        <thead className="sticky top-0 z-[3] bg-[#1C1C1C]">
          <tr>
            <th className="px-2 py-3 text-left text-xs leading-[16px] tracking-[-0.4%] whitespace-nowrap text-[#A6AEB2] bg-[#1C1C1C] rounded-tl-lg bordr-r border-[#262626]">
              Rank
            </th>

            <th className="px-2 py-3 text-left text-xs leading-[16px] tracking-[-0.4%] whitespace-nowrap text-[#A6AEB2] bg-[#1C1C1C]">
              Traders
            </th>
            <TableHeader title="Acct Value" />
            <TableHeader title="PnL" />
            <TableHeader title="ROI" />
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
            <tr key={index} className="hover:bg-[#252525] transition-colors">
              <td className="py-4 px-1 text-xs tracking-[-0.4%] leading-[16px] whitespace-nowrap text-[#FAFAFA] bordr-r border-[#2D2D2D]">
                {index + 1}
              </td>
              <td className="py-4 px-1 text-xs tracking-[-0.4%] leading-[16px] whitespace-nowrap font-medium text-[#FAFAFA]">
                <div className="flex items-center gap-2">
                  {item?.displayName || shortenAddress(item?.ethAddress)}
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(item?.ethAddress);
                        toast("Copied!!!");
                      }}
                    >
                      <Copy />
                    </button>
                    <a
                      href={`https://app.hyperliquid.xyz/explorer/address/${item?.ethAddress}`}
                      type="button"
                      target="_blank"
                    >
                      <ExternalLink />
                    </a>
                  </div>
                </div>
              </td>
              <td className="py-4 px-1 text-xs tracking-[-0.4%] leading-[16px] whitespace-nowrap font-medium text-[#FAFAFA]">
                ${CryptoUtils.formatLargeNumber(item?.accountValue)}
              </td>

              <td
                className={cn(
                  "py-4 px-1 text-xs tracking-[-0.4%] leading-[16px] whitespace-nowrap font-medium",
                  Number(item?.windowPerformances?.[timeWindowMap[timeWindow]]?.[1]?.pnl) >= 0
                    ? "text-[#00AF58]"
                    : "text-[#DC2626]",
                )}
              >
                ${CryptoUtils.formatLargeNumber(item?.windowPerformances?.[timeWindowMap[timeWindow]]?.[1]?.pnl)}
              </td>

              <td
                className={cn(
                  "py-4 px-1 text-xs tracking-[-0.4%] leading-[16px] whitespace-nowrap font-medium",
                  Number(item?.windowPerformances?.[timeWindowMap[timeWindow]]?.[1]?.roi) >= 0
                    ? "text-[#00AF58]"
                    : "text-[#DC2626]",
                )}
              >
                {CryptoUtils.formatLargeNumber(
                  CryptoUtils.formatPercentage(item?.windowPerformances?.[timeWindowMap[timeWindow]]?.[1]?.roi),
                )}
                %
              </td>

              <td className="py-4 px-1 text-xs tracking-[-0.4%] leading-[16px] whitespace-nowrap font-medium text-[#FAFAFA]">
                ${CryptoUtils.formatLargeNumber(item?.windowPerformances?.[timeWindowMap[timeWindow]]?.[1]?.vlm)}
              </td>

              <td>
                <button
                  type="button"
                  className="text-[##FAFAFA] text-xs tracking-[-0.4%] leading-[16px] font-medium px-2 py-[6px] bg-[#202020] rounded-2xl whitespace-nowrap"
                  onClick={() => {
                    setTraderWallet(item?.ethAddress || "");
                    toggleShowCreateCopyTrade(true);
                  }}
                >
                  Copy Trade
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
