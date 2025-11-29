import React from "react";
import { useSupabaseAuth } from "@/components/providers";
import { useGemachCloseSinglePosition, useReadGemachOpenPositions } from "@/services/queries/gemach";
import { RenderIf } from "@/components/shared";
import { Spinner } from "@/components/ui/shadcn-io/spinner";
import { cn, CryptoUtils } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Close } from "@/components/icons/icons";
import { useAccount } from "wagmi";
import { toast } from "sonner";

export function OpenPositions() {
  const { session } = useSupabaseAuth();

  const { address } = useAccount();

  const { data, isLoading } = useReadGemachOpenPositions(session?.access_token);

  const closePosition = useGemachCloseSinglePosition(session?.access_token);

  return (
    <div className="flex-1 mb-4 w-full h-full scrollbar">
      <table className="w-full table-auto rounded-lg borde border-[#262626] border-separate border-spacing-0">
        <thead className="sticky top-0 z-[3] bg-[#1C1C1C]">
          <tr>
            <th className="px-2 py-3 text-left text-xs leading-[16px] tracking-[-0.4%] whitespace-nowrap text-[#A6AEB2] bg-[#1C1C1C] rounded-tl-lg bordr-r border-[#262626]">
              Coin
            </th>

            <th className="px-2 py-3 text-left text-xs leading-[16px] tracking-[-0.4%] whitespace-nowrap text-[#A6AEB2] bg-[#1C1C1C]">
              Size
            </th>
            <th className="px-2 py-3 text-left text-xs leading-[16px] tracking-[-0.4%] whitespace-nowrap text-[#A6AEB2] bg-[#1C1C1C]">
              Pos. Value
            </th>
            <th className="px-2 py-3 text-left text-xs leading-[16px] tracking-[-0.4%] whitespace-nowrap text-[#A6AEB2] bg-[#1C1C1C]">
              Entry Price
            </th>
            <th className="px-2 py-3 text-left text-xs leading-[16px] tracking-[-0.4%] whitespace-nowrap text-[#A6AEB2] bg-[#1C1C1C]">
              Mkt. Price
            </th>

            <th className="px-2 py-3 text-left text-xs leading-[16px] tracking-[-0.4%] whitespace-nowrap text-[#A6AEB2] bg-[#1C1C1C]">
              PnL
            </th>

            <th className="px-2 py-3 text-left text-xs leading-[16px] tracking-[-0.4%] whitespace-nowrap text-[#A6AEB2] bg-[#1C1C1C]">
              Margin
            </th>

            <th className="px-2 py-3 text-left text-xs leading-[16px] tracking-[-0.4%] whitespace-nowrap text-[#A6AEB2] bg-[#1C1C1C]">
              Liq. Price
            </th>

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

          <RenderIf condition={!isLoading && data?.assetPositions?.length === 0}>
            <tr>
              <td
                className="py-4 px-1 text-xs tracking-[-0.4%] leading-[16px] whitespace-nowrap font-medium text-[#FAFAFA] text-center"
                colSpan={8}
              >
                No data found.
              </td>
            </tr>
          </RenderIf>

          {data?.assetPositions?.map((item, index) => {
            const size = Number(item?.position?.szi || 0);
            const isLong = size > 0;
            const unrealizedPnl = Number(item?.position?.unrealizedPnl) || 0;

            return (
              <tr key={index} className="hover:bg-[#252525] transition-colors">
                <td
                  className={cn(
                    "py-4 px-1 text-xs tracking-[-0.4%] leading-[16px] whitespace-nowrap text-[#FAFAFA] bordr-r border-[#2D2D2D]",
                    isLong ? "text-[#00AF58]" : "text-[#DC2626]",
                  )}
                >
                  {item?.position?.coin} <span className="">{item?.position?.maxLeverage}x</span>
                </td>

                <td
                  className={cn(
                    "py-4 px-1 text-xs tracking-[-0.4%] leading-[16px] whitespace-nowrap font-medium text-[#FAFAFA]",
                    isLong ? "text-[#00AF58]" : "text-[#DC2626]",
                  )}
                >
                  {Math.abs(size)}
                </td>
                <td className={cn("py-4 px-1 text-xs tracking-[-0.4%] leading-[16px] whitespace-nowrap font-medium")}>
                  {CryptoUtils.formatCurrency(item?.position?.positionValue)}
                </td>

                <td className="py-4 px-1 text-xs tracking-[-0.4%] leading-[16px] whitespace-nowrap font-medium text-[#FAFAFA]">
                  {CryptoUtils.formatCurrency(item?.position?.entryPx)}
                </td>

                <td className="py-4 px-1 text-xs tracking-[-0.4%] leading-[16px] whitespace-nowrap font-medium text-[#FAFAFA]"></td>

                <td
                  className={cn(
                    "py-4 px-1 text-xs tracking-[-0.4%] leading-[16px] whitespace-nowrap font-medium text-[#FAFAFA]",
                    unrealizedPnl > 0 ? "text-[#00AF58]" : "text-[#DC2626]",
                  )}
                >
                  {unrealizedPnl > 0 ? "+" : "-"}${Math.abs(unrealizedPnl)?.toFixed(2)}
                </td>

                <td className="py-4 px-1 text-xs tracking-[-0.4%] leading-[16px] whitespace-nowrap font-medium text-[#FAFAFA]">
                  {CryptoUtils.formatCurrency(item?.position?.marginUsed)} ({item?.position?.leverage?.type})
                </td>

                <td className="py-4 px-1 text-xs tracking-[-0.4%] leading-[16px] whitespace-nowrap font-medium text-[#FAFAFA]">
                  {CryptoUtils.formatCurrency(item?.position?.liquidationPx)}
                </td>

                <td
                  className={cn(
                    "py-4 px-1 text-xs tracking-[-0.4%] leading-[16px] whitespace-nowrap font-medium text-[#FAFAFA]",
                  )}
                >
                  <Button
                    className="w-[30px] h-[30px] flex justify-center items-center bg-[transparent]"
                    isLoading={closePosition.isPending}
                    onClick={() => {
                      const body = {
                        address: address || "",
                        coin: item?.position?.coin || "",
                        size: item?.position?.szi || "0",
                        isLongPosition: isLong,
                      };
                      closePosition.mutate(body, {
                        onSuccess: () => {
                          toast.success("Successfully initiated closing position.");
                        },
                        onError: () => {
                          toast.error("Failed to initiate closing position. Please try again.");
                        },
                      });
                    }}
                  >
                    <RenderIf condition={!closePosition.isPending}>
                      <Close />
                    </RenderIf>
                  </Button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
