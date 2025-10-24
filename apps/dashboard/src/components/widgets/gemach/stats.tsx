import React from "react";
import { Close } from "@/components/icons/icons";
import { cn, CryptoUtils } from "@/lib/utils";
import { useReadUserStats } from "@/services/queries/gemach";
import { useSupabaseAuth } from "@/components/providers";
import { useAccount } from "wagmi";

interface IStatsItemProps {
  title: string;
  value?: number;
  change?: number;
}

interface IProps {
  handleClose: () => void;
}

function StatsItem(props: IStatsItemProps) {
  const { title, value = 0, change = 0 } = props;
  const isPositive = change > 0;

  return (
    <div className="flex flex-col gap-1">
      <p className="text-[#A6AEB2] text-[11px] tracking-[-0.4%] leading-[16px]">{title}</p>
      <p className="text-white text-sm tracking-[-0.4%] leading-[24px]">
        {value >= 0 ? "+" : "-"}${CryptoUtils.formatLargeNumber(Math.abs(value))}
      </p>
      <p
        className={cn(
          "text-xs tracking-[-0.4%] leading-[16px]",
          isPositive ? "text-[#00AF58]" : "text-[#dc2626]",
          value === 0 && "text-white",
        )}
      >
        {isPositive ? "+" : ""}
        {CryptoUtils.formatPercentage(change)}%
      </p>
    </div>
  );
}

function StatsItemMute(props: IStatsItemProps) {
  const { title, value = 0, change = 0 } = props;
  const isPositive = change > 0;

  return (
    <div className="flex flex-col gap-1">
      <p className="text-[#A6AEB2] text-[11px] tracking-[-0.4%] leading-[16px]">{title}</p>
      <p className="text-white text-sm tracking-[-0.4%] leading-[24px]">
        {value >= 0 ? "+" : "-"}${CryptoUtils.formatLargeNumber(Math.abs(value))} USDC
      </p>
    </div>
  );
}

export function Stats(props: IProps) {
  const { handleClose } = props;
  const { address } = useAccount();
  const { session } = useSupabaseAuth();

  const { data } = useReadUserStats(session?.access_token);

  console.log(data);

  return (
    <div className="w-full h-full bg-[rgb(26,26,26,0.5)] backdrop-blur-2xl border border-[#222222] rounded-[20px]">
      <div className="flex flex-col gap-9 pt-6 px-4 pb-4 h-full w-full items-center">
        <div className="flex justify-between items-center w-full">
          <div className="w-[20px] h-[20px] bg-[red] invisible"></div>
          <h3 className="text-white text-sm font-bold">PnL Data</h3>
          <button type="button" className="w-[20px] h-[20px] flex justify-center items-center" onClick={handleClose}>
            <Close />
          </button>
        </div>

        <div className="flex flex-col gap-6 w-full">
          <div className="rounded-2xl px-4 py-6 bg-[#0C0C0C] flex justify-between">
            <StatsItem title="Todays PnL" value={data?.["24h"]} change={data?.percentagePnl?.["24h"]} />
            <StatsItem title="7 Day PnL" value={data?.["7d"]} change={data?.percentagePnl?.["7d"]} />
            <StatsItem title="30 Day PnL" value={data?.["30d"]} change={data?.percentagePnl?.["30d"]} />
            <StatsItem title="All time PnL" value={data?.allTime?.pnl} change={data?.allTime?.pnlPercentage} />
            {/* <StatsItem title="All time PnL" value={9999} change={-100} /> */}
          </div>
        </div>

        <div className="flex items-center justify-center gap-6">
          <div className="flex flex-col gap-4 py-2">
            <StatsItemMute title="24 hours PnL" value={data?.["24h"]} />
            <StatsItemMute title="7 Day PnL" value={data?.["7d"]} />
          </div>
          <div className="h-full w-[1px] bg-[#373737]"></div>
          <div className="flex flex-col gap-4 py-2">
            <StatsItemMute title="30 Day PnL" value={data?.["30d"]} />

            <StatsItemMute title="All time PnL" value={data?.allTime?.pnl} />
          </div>
        </div>
      </div>
    </div>
  );
}
