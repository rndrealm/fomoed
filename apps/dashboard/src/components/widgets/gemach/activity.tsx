import React from "react";
import { useAccount } from "wagmi";
import { useSupabaseAuth } from "@/components/providers";
import { RenderIf } from "@/components/shared";
import { Spinner } from "@/components/ui/shadcn-io/spinner";
import { useReadGemachTradeHistory } from "@/services/queries/gemach";
import { cn, CryptoUtils } from "@/lib/utils";

function formatTimestamp(ts: number) {
  if (!ts) return "";
  const date = new Date(ts);

  const month = date.getMonth() + 1; // 0-based
  const day = date.getDate();
  const year = date.getFullYear().toString().slice(-2);

  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  const seconds = date.getSeconds().toString().padStart(2, "0");

  return `${month}/${day}/${year} - ${hours}:${minutes}:${seconds}`;
}

export function Activity() {
  const { session } = useSupabaseAuth();
  const { address, isConnected } = useAccount();

  const { data, isLoading } = useReadGemachTradeHistory(address, session?.access_token);

  return (
    <div className="flex-1 mb-4 w-full h-full scrollbar">
      <table className="w-full table-auto rounded-lg borde border-[#262626] border-separate border-spacing-0">
        <thead className="sticky top-0 z-[3] bg-[#1C1C1C]">
          <tr>
            <th className="px-2 py-3 text-left text-xs leading-[16px] tracking-[-0.4%] whitespace-nowrap text-[#A6AEB2] bg-[#1C1C1C] rounded-tl-lg bordr-r border-[#262626]">
              Time
            </th>

            <th className="px-2 py-3 text-left text-xs leading-[16px] tracking-[-0.4%] whitespace-nowrap text-[#A6AEB2] bg-[#1C1C1C]">
              Coin
            </th>
            <th className="px-2 py-3 text-left text-xs leading-[16px] tracking-[-0.4%] whitespace-nowrap text-[#A6AEB2] bg-[#1C1C1C]">
              Direction
            </th>
            <th className="px-2 py-3 text-left text-xs leading-[16px] tracking-[-0.4%] whitespace-nowrap text-[#A6AEB2] bg-[#1C1C1C]">
              Price
            </th>
            <th className="px-2 py-3 text-left text-xs leading-[16px] tracking-[-0.4%] whitespace-nowrap text-[#A6AEB2] bg-[#1C1C1C]">
              Your Size
            </th>

            <th className="px-2 py-3 text-left text-xs leading-[16px] tracking-[-0.4%] whitespace-nowrap text-[#A6AEB2] bg-[#1C1C1C]">
              Trader Size
            </th>

            <th className="px-2 py-3 text-left text-xs leading-[16px] tracking-[-0.4%] whitespace-nowrap text-[#A6AEB2] bg-[#1C1C1C]">
              Trade Value
            </th>

            <th className="px-2 py-3 text-left text-xs leading-[16px] tracking-[-0.4%] whitespace-nowrap text-[#A6AEB2] bg-[#1C1C1C] rounded-tr-lg">
              PnL
            </th>
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

          <RenderIf condition={!isLoading && data?.fills?.length === 0}>
            <tr>
              <td
                className="py-4 px-1 text-xs tracking-[-0.4%] leading-[16px] whitespace-nowrap font-medium text-[#FAFAFA] text-center"
                colSpan={8}
              >
                No data found.
              </td>
            </tr>
          </RenderIf>

          {data?.fills?.map((item, index) => {
            const isClose = item?.dir.toLowerCase().indexOf("close") >= 0;
            const direction = item?.dir?.split(" ")?.[1] || "";

            const closedPnl = Number(item?.closedPnl) || 0;
            const isPositivePnl = closedPnl > 0;

            return (
              <tr key={item?._id} className="hover:bg-[#252525] transition-colors">
                <td className="py-4 px-1 text-xs tracking-[-0.4%] leading-[16px] whitespace-nowrap text-[#FAFAFA] bordr-r border-[#2D2D2D]">
                  {formatTimestamp(item?.time)}
                </td>

                <td className="py-4 px-1 text-xs tracking-[-0.4%] leading-[16px] whitespace-nowrap font-medium text-[#FAFAFA]">
                  {item?.coin}
                </td>
                <td
                  className={cn(
                    "py-4 px-1 text-xs tracking-[-0.4%] leading-[16px] whitespace-nowrap font-medium",
                    isClose ? "text-[#DC2626]" : "text-[#00AF58]",
                  )}
                >
                  {isClose ? `C/${direction}` : `O/${direction}`}
                </td>

                <td className="py-4 px-1 text-xs tracking-[-0.4%] leading-[16px] whitespace-nowrap font-medium text-[#FAFAFA]">
                  {Number(item?.px)?.toFixed(3)}
                </td>

                <td className="py-4 px-1 text-xs tracking-[-0.4%] leading-[16px] whitespace-nowrap font-medium text-[#FAFAFA]">
                  {item?.sz}
                </td>

                <td className="py-4 px-1 text-xs tracking-[-0.4%] leading-[16px] whitespace-nowrap font-medium text-[#FAFAFA]">
                  {item?.traderSize}
                </td>

                <td className="py-4 px-1 text-xs tracking-[-0.4%] leading-[16px] whitespace-nowrap font-medium text-[#FAFAFA]">
                  ${CryptoUtils.formatLargeNumber(Number(item?.px) * Number(item?.sz))}
                </td>

                <td
                  className={cn(
                    "py-4 px-1 text-xs tracking-[-0.4%] leading-[16px] whitespace-nowrap font-medium text-[#FAFAFA]",
                    isPositivePnl ? "text-[#00AF58]" : "text-[#DC2626]",
                    closedPnl === 0 && "text-[#FAFAFA]",
                  )}
                >
                  {closedPnl >= 0 ? "+" : "-"}${CryptoUtils.formatLargeNumber(Math.abs(Number(item?.closedPnl)) || 0)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
