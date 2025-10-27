import React, { ReactNode } from "react";
import { Activity, Copy, DollarSign, Leaderboard } from "@/components/icons/icons";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import { TimeWindow } from "@/services/queries/gemach/types";
import { RenderIf } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { useGemachCloseAllPositions, useReadGemachOpenPositions } from "@/services/queries/gemach";
import { useSupabaseAuth } from "@/components/providers";
import { useAccount } from "wagmi";
import { toast } from "sonner";

const options = [
  {
    id: 1,
    label: "Leaderboard",
    icon: <Leaderboard />,
    value: "leaderboard",
  },
  {
    id: 2,
    label: "Copy Trade",
    icon: <Copy />,
    value: "copy_trade",
  },
  {
    id: 3,
    label: "Open Positions",
    icon: <DollarSign fill="#A6AEB2" />,
    value: "open_positions",
  },
  {
    id: 4,
    label: "Activity",
    icon: <Activity fill="#A6AEB2" />,
    value: "activity",
  },
];

const leaderboardTimeOptions = [
  {
    id: 1,
    label: "All",
    value: "allTime",
  },
  {
    id: 2,
    label: "24H",
    value: "day",
  },
  {
    id: 3,
    label: "7D",
    value: "week",
  },
  {
    id: 4,
    label: "30D",
    value: "month",
  },
];

interface ITabItemProps {
  active: boolean;
  icon: ReactNode;
  label: string;
  onClick?: () => void;
}

function TabItem(props: ITabItemProps) {
  const { active, icon, label, onClick } = props;

  return (
    <button type="button" onClick={onClick}>
      <div className="flex items-center gap-1 py-1 px-[6px] rounded-sm relative">
        {/* <div className="w-[14px] h-[14px] flex items-center justify-center relative z-[2]">{icon}</div> */}

        <p
          className={cn(
            "text-xs leading-[16px] text-white tracking-[-0.4%] relative z-[2] transition-all duration-500",
            active && "text-[#0C0C0C]",
          )}
        >
          {label}
        </p>
        {active && (
          <motion.div
            layoutId="app_gemach_table_tab"
            className="absolute top-0 left-0 right-0 bottom-0 rounded-sm bg-white"
          ></motion.div>
        )}
      </div>
    </button>
  );
}

interface ILeaderboardTabItem {
  active: boolean;
  label: string;
  onClick?: () => void;
}

function LeaderboardTabItem(props: ILeaderboardTabItem) {
  const { active, label, onClick } = props;

  return (
    <button type="button" className="px-[6px] py-1 rounded-sm relative" onClick={onClick}>
      <p
        className={cn(
          "text-xs text-[#FAFAFA] leading-[16px] tracking-[-0.4%] relative z-[1]  transition-all duration-500",
          active && "text-[#0C0C0C]",
        )}
      >
        {label}
      </p>
      {active && (
        <motion.div
          layoutId="app_gemach_timewindow"
          className="absolute top-0 left-0 right-0 bottom-0 rounded-sm bg-white"
        ></motion.div>
      )}
    </button>
  );
}

interface IProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  timeWindow: TimeWindow;
  setTimeWindow: (timeWindow: TimeWindow) => void;
}

export function Tabs(props: IProps) {
  const { activeTab, setActiveTab, timeWindow, setTimeWindow } = props;
  const { session } = useSupabaseAuth();

  const { address } = useAccount();

  const closeAllPositions = useGemachCloseAllPositions(session?.access_token);

  const { data: openPositions, isLoading: openPositionsLoading } = useReadGemachOpenPositions(session?.access_token);

  function handleCloseAllPositions() {
    const body = {
      address: address || "",
    };
    closeAllPositions.mutate(body, {
      onSuccess: () => {
        toast.success("Successfully initiated closing all positions.");
      },
      onError: () => {
        toast.error("Failed to initiate closing all positions. Please try again.");
      },
    });
  }

  return (
    <div className="flex items-center justify-between">
      <div className="flex gap-[2px] items-center">
        {options.map((option) => (
          <TabItem
            key={option.id}
            active={activeTab === option.value}
            label={option.label}
            icon={option.icon}
            onClick={() => setActiveTab(option.value)}
            // onClick={() => setActiveTab(option.value)}
          />
        ))}
      </div>

      <div
        className={cn(
          "flex items-center gap-[2px] border border-[#181818] rounded-sm p-[2px]",
          activeTab === "leaderboard" ? "visible opacity-100" : "invisible opacity-0",
        )}
      >
        {leaderboardTimeOptions.map((option) => (
          <LeaderboardTabItem
            key={option.id}
            active={timeWindow === option.value}
            label={option.label}
            onClick={() => {
              setTimeWindow(option.value as TimeWindow);
            }}
          />
        ))}
      </div>

      <RenderIf condition={activeTab === "open_positions"}>
        <div className={activeTab === "open_positions" ? "visible opacity-100" : "invisible opacity-0"}>
          <Button
            onClick={handleCloseAllPositions}
            type="button"
            className="text-xs h-[unset] text-[#FAFAFA] tracking-[-0.4%] leading-[16px] px-2 py-[6px] bg-[#101010] rounded-sm border border-[#181818]"
            isLoading={closeAllPositions.isPending}
            disabled={openPositionsLoading || (openPositions?.assetPositions?.length || 0) === 0}
          >
            Close All
          </Button>
        </div>
      </RenderIf>
    </div>
  );
}
