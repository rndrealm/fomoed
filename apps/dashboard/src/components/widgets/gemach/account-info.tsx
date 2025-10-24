import React, { ReactNode, useEffect } from "react";
import { cn, CryptoUtils, shortenAddress } from "@/lib/utils";
import Image from "next/image";
import dashboard from "@/lib/assets/dashboard";
import { Activity, Arbitrum, DollarSign, Followers, Wallet } from "@/components/icons/icons";
import { RenderIf } from "@/components/shared";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  useReadGemachBalance,
  useReadGemachCopyTrades,
  useReadGemachOpenPositions,
  useReadGemachTradeHistory,
  useReadGemachUser,
} from "@/services/queries/gemach";
import { useSupabaseAuth } from "@/components/providers";
import { useAccount, useDisconnect } from "wagmi";
import { useAtomValue } from "jotai";
import { gemachUserLoggedInAtom } from "@/lib/atoms/gemach";
import { toast } from "sonner";

interface IAccountInfoItem {
  label?: string;
  value?: string;
  isFirst?: boolean;
  iconBg?: string;
  icon?: ReactNode;
  isBalance?: boolean;
}

function AccountInfoItem(props: IAccountInfoItem) {
  const { isFirst = false, label, value = "-", iconBg = "#E8E4FD", icon, isBalance = false } = props;

  return (
    <div className={cn("flex gap-2 p-4 flex-1 items-center", isFirst ? "" : "border-l border-[#262626]")}>
      <div
        className="w-[24px] h-[24px] rounded-full bg-[#E8E4FD] flex items-center justify-center"
        style={{ backgroundColor: iconBg }}
      >
        {icon}
      </div>

      <div className="flex flex-col justify-between">
        <p className="text-xs font-medium text-[#A4A4A4] leading-[16px] tracking-[-0.4%] line-clamp-1">{label}</p>

        <div className="flex gap-1 items-center">
          <p className="text-xs font-semibold text-white leading-[16px] tracking-[-0.4%] line-clamp-1">{value}</p>

          <RenderIf condition={isBalance}>
            <div className="w-[16px] h-[16px]">
              <Image src={dashboard.usdc} alt="usdc" />
            </div>
          </RenderIf>
        </div>
      </div>
    </div>
  );
}

function Balance() {
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { session } = useSupabaseAuth();

  const gemachUserLoggedIn = useAtomValue(gemachUserLoggedInAtom);

  const { data: balanceData } = useReadGemachBalance(session?.access_token);
  const { data: userData, isError } = useReadGemachUser(address || "", gemachUserLoggedIn, session?.access_token);

  const dgexBalance = balanceData?.gdexBalance || 0.0;
  const hyperliquidBalance = balanceData?.hyperliquidBalance || 0.0;

  useEffect(() => {
    if (isError) {
      disconnect();
    }
  }, [isError, disconnect]);

  return (
    <div className={cn("flex gap-2 p-4 flex-1 items-center border-l border-[#262626]")}>
      <div
        className="w-[24px] h-[24px] rounded-full bg-[#E8E4FD] flex items-center justify-center"
        style={{ backgroundColor: "#E8E4FD" }}
      >
        <Wallet />
      </div>

      <div className="flex flex-col justify-between">
        <p className="text-xs font-medium text-[#A4A4A4] leading-[16px] tracking-[-0.4%]">Balance</p>

        <Popover>
          <PopoverTrigger>
            <div className="flex gap-1 items-center">
              <p className="text-xs font-semibold text-white leading-[16px] tracking-[-0.4%] underline underline-offset-4 decoration-dashed">
                ${(dgexBalance + hyperliquidBalance).toFixed(2)}
              </p>

              <div className="w-[16px] h-[16px]">
                <Image src={dashboard.usdc} alt="usdc" />
              </div>
            </div>
          </PopoverTrigger>
          <PopoverContent
            align="start"
            className="max-w-[220px] w-full p-3 rounded-md !bg-[rgb(26,26,26,0.5)] backdrop-blur-2xl border border-[#181818]"
          >
            <div className="flex flex-col gap-2">
              <div className="flex flex-col gap-1">
                <div className="flex items-center">
                  <div className="w-[16px] h-[16px]">
                    <Image src={dashboard.usdc} alt="usdc" className="" />
                  </div>
                  <div className="w-[16px] h-[16px]" style={{ marginLeft: -4 }}>
                    <Arbitrum />
                  </div>
                </div>
                <p className="text-[10px] text-[#C3C3C3] leading-[1.25]">
                  USDC (Arb) Deposits are made to your copy trading wallet <br />
                  <button
                    type="button"
                    className="text-white underline"
                    onClick={async () => {
                      await navigator.clipboard.writeText(userData?.address || "");
                      toast("Copied!!!");
                    }}
                  >
                    {shortenAddress(userData?.address || "")}
                  </button>
                </p>
              </div>
              <div className="w-full h-[1px] bg-[#2B2B2B]"></div>
              <p className="text-[10px] text-[#C3C3C3] leading-[1.25]">
                USDC (HYPERLIQUID) - <span className="font-semibold text-white">${hyperliquidBalance.toFixed(2)}</span>
              </p>
              <p className="text-[10px] text-[#C3C3C3] leading-[1.25]">
                USDC (GDEX) - <span className="font-semibold text-white">${dgexBalance.toFixed(2)}</span>
              </p>
              <p className="text-[10px] text-[#C3C3C3] leading-[1.25]">
                ETH (GAS FEE) - <span className="font-semibold text-white">{userData?.balance || 0} ETH</span>
              </p>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}

export function AccountInfo() {
  const { session } = useSupabaseAuth();

  const { address } = useAccount();

  const gemachUserLoggedIn = useAtomValue(gemachUserLoggedInAtom);

  const { data } = useReadGemachCopyTrades(address, gemachUserLoggedIn, session?.access_token);
  const { data: activityData } = useReadGemachTradeHistory(address, session?.access_token);

  const { data: openPositions } = useReadGemachOpenPositions(session?.access_token);

  const activityCount = activityData?.pagination?.totalRecords || 0;

  return (
    <div className="flex items-center border border-[#262626] rounded-md bg-[#1C1C1C]">
      <Balance />
      <AccountInfoItem iconBg="#EDF3FF" icon={<Followers />} label="Following" value={data?.length.toString()} />
      <AccountInfoItem
        iconBg="#FFEDE3"
        icon={<DollarSign />}
        label="Open Positions"
        value={openPositions?.assetPositions?.length.toString()}
      />
      <AccountInfoItem
        iconBg="#EBFAF3"
        icon={<Activity />}
        label="Activity"
        value={CryptoUtils.formatLargeNumber(activityCount || 0, activityCount > 1000 ? 2 : 0)}
      />
    </div>
  );
}
