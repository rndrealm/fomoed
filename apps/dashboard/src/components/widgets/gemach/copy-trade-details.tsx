import React from "react";
import { Close, Copy, Info } from "@/components/icons/icons";
import { Button } from "@/components/ui/button";
import { StatusPill } from "./copy-trade-table";
import { toast } from "sonner";
import { singleCopyTradeAtom, toggleEditCopyTradeAtom } from "@/lib/atoms/gemach";
import { useAtom, useSetAtom } from "jotai";
import { shortenAddress } from "@/lib/utils";
import { useGemachUpdateHyperliquidCopyTrade } from "@/services/queries/gemach";
import { useSupabaseAuth } from "@/components/providers";
import { useAccount } from "wagmi";

function formatDateTime(timestamp?: string | number) {
  if (!timestamp) return "";

  const date = new Date(Number(timestamp) * 1000);
  const dateString = date.toLocaleDateString();
  const timeString = date.toLocaleTimeString();

  return `${dateString} ${timeString}`;
}

interface IProps {
  handleClose: () => void;
}

export function CopyTradeDetails(props: IProps) {
  const { handleClose } = props;

  const { session } = useSupabaseAuth();

  const { address } = useAccount();

  const [singleCopyTrade, setSingleCopyTrade] = useAtom(singleCopyTradeAtom);

  const toggleShowEditCopyTrade = useSetAtom(toggleEditCopyTradeAtom);

  const updateCopyTrade = useGemachUpdateHyperliquidCopyTrade(session?.access_token);

  return (
    <div className="w-full h-full bg-[rgb(26,26,26,0.5)] backdrop-blur-2xl border border-[#222222] rounded-[20px]">
      <div className="flex flex-col gap-6 pt-6 px-4 pb-4 h-full w-full items-center justify-between">
        <div className="flex justify-between items-center w-full">
          <div className="w-[20px] h-[20px] bg-[red] invisible"></div>
          <h3 className="text-white text-sm font-bold">Copy Trade Details</h3>
          <button type="button" className="w-[20px] h-[20px] flex justify-center items-center" onClick={handleClose}>
            <Close />
          </button>
        </div>

        <div className="w-full h-full flex flex-col gap-4">
          <div className="max-w-[400px] w-full rounded-[20px] mx-auto bg-[#1F1F1F] border border-[#2B2B2B] p-2 flex flex-col gap-3">
            <div className="flex justify-center items-center gap-1">
              <div className="w-[14px] h-[14px] flex justify-center items-center">
                <Info />
              </div>
              <p className="text-[13px] font-medium text-white leading-[1.25] tracking-[0]">Trade Details</p>
            </div>

            <div className="p-4 rounded-xl bg-[#2A2A2A] flex flex-col gap-3">
              <div className="flex justify-end">
                <StatusPill status={singleCopyTrade?.isActive || false} />
              </div>

              <div className="flex justify-between items-center">
                <p className="text-xs text-[#A6AEB2] leading-[1.25] tracking-[0]">Label</p>

                <p className="text-xs text-white leading-[1.25] tracking-[0]">{singleCopyTrade?.copyTradeName}</p>
              </div>

              <div className="flex justify-between items-center">
                <p className="text-xs text-[#A6AEB2] leading-[1.25] tracking-[0]">Target Address</p>

                <div className="flex gap-1 items-center">
                  <a
                    href={`https://app.hyperliquid.xyz/explorer/address/${singleCopyTrade?.traderWallet}`}
                    target="_blank"
                    onClick={(e) => e.stopPropagation()}
                    className="cursor-pointer"
                  >
                    <p className="text-xs text-white leading-[1.25] tracking-[0] underline">
                      {shortenAddress(singleCopyTrade?.traderWallet || "", 7, 7)}
                    </p>
                  </a>
                  <button
                    type="button"
                    className="w-[14px] h-[14px] flex justify-center items-center"
                    onClick={() => {
                      navigator.clipboard.writeText(singleCopyTrade?.traderWallet || "");
                      toast("Copied!!!");
                    }}
                  >
                    <Copy />
                  </button>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <p className="text-xs text-[#A6AEB2] leading-[1.25] tracking-[0]">Date Created</p>

                <p className="text-xs text-white leading-[1.25] tracking-[0]">
                  {formatDateTime(singleCopyTrade?.createdAt)}
                </p>
              </div>

              <div className="flex justify-between items-center">
                <p className="text-xs text-[#A6AEB2] leading-[1.25] tracking-[0]">Total Trades</p>

                <p className="text-xs text-white leading-[1.25] tracking-[0]">{singleCopyTrade?.totalTrades}</p>
              </div>

              <div className="flex justify-between items-center">
                <p className="text-xs text-[#A6AEB2] leading-[1.25] tracking-[0]">Total Volume</p>

                <p className="text-xs text-white leading-[1.25] tracking-[0]">${singleCopyTrade?.totalVolumes}</p>
              </div>

              <div className="flex justify-between items-center">
                <p className="text-xs text-[#A6AEB2] leading-[1.25] tracking-[0]">PnL</p>

                <p className="text-xs text-white leading-[1.25] tracking-[0]">${singleCopyTrade?.totalPnl}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 justify-center">
            <Button
              className="p-2 rounded-lg bg-[transparent] hover:bg-[transparent]"
              isLoading={updateCopyTrade.isPending}
              onClick={() => {
                updateCopyTrade.mutate(
                  {
                    address: address || "",
                    profitPercent: String(singleCopyTrade?.profitPercent || 0),
                    lossPercent: String(singleCopyTrade?.lossPercent || 0),
                    traderWallet: singleCopyTrade?.traderWallet || "",
                    copyMode: singleCopyTrade?.copyMode?.toString() || "1",
                    copyTradeId: singleCopyTrade?.copyTradeId || "",
                    copyTradeName: singleCopyTrade?.copyTradeName || "",
                    fixedAmountCostPerOrder: String(singleCopyTrade?.fixedAmountCostPerOrder || 0),
                    oppositeCopy: `${singleCopyTrade?.oppositeCopy}` || "false",
                    isChangeStatus: true,
                    isDelete: false,
                  },
                  {
                    onError() {
                      toast.error("Failed to update trade. Please try again.");
                    },
                    onSuccess: () => {
                      toast.success("Trade updated successfully.");
                      handleClose();
                    },
                  },
                );
              }}
            >
              <p className="text-xs font-semibold text-white leading-[16px] tracking-[-0.4%]">
                {singleCopyTrade?.isActive ? "Pause" : "Resume"} Trade
              </p>
            </Button>

            <Button
              className="p-2 rounded-lg bg-[#2B2B2B] hover:bg-[#2B2B2B]"
              isLoading={updateCopyTrade.isPending}
              onClick={() => {
                updateCopyTrade.mutate(
                  {
                    address: address || "",
                    profitPercent: String(singleCopyTrade?.profitPercent || 0),
                    lossPercent: String(singleCopyTrade?.lossPercent || 0),
                    traderWallet: singleCopyTrade?.traderWallet || "",
                    copyMode: singleCopyTrade?.copyMode?.toString() || "1",
                    copyTradeId: singleCopyTrade?.copyTradeId || "",
                    copyTradeName: singleCopyTrade?.copyTradeName || "",
                    fixedAmountCostPerOrder: String(singleCopyTrade?.fixedAmountCostPerOrder || 0),
                    oppositeCopy: `${singleCopyTrade?.oppositeCopy}` || "false",
                    isChangeStatus: false,
                    isDelete: true,
                  },
                  {
                    onError() {
                      toast.error("Failed to delete trade. Please try again.");
                    },
                    onSuccess: () => {
                      toast.success("Trade deleted successfully.");
                      handleClose();
                    },
                  },
                );
              }}
            >
              <p className="text-xs font-semibold text-white leading-[16px] tracking-[-0.4%]">Delete Trade</p>
            </Button>

            <Button
              className="p-2 rounded-lg bg-[#406AC5] hover:bg-[#406AC5]"
              disabled={updateCopyTrade.isPending}
              onClick={() => {
                handleClose();
                setSingleCopyTrade(singleCopyTrade);
                toggleShowEditCopyTrade(true);
              }}
            >
              <p className="text-xs font-semibold text-white leading-[16px] tracking-[-0.4%]">Edit Copy Trade</p>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
