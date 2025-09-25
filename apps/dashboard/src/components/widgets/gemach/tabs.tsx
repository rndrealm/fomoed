import React, { ReactNode } from "react";
import { Activity, Copy, DollarSign, Leaderboard } from "@/components/icons/icons";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import { TimeWindow } from "@/services/queries/gemach/types";

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

      <div className="flex items-center gap-[2px] border border-[#181818] rounded-sm p-[2px]">
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
    </div>
  );
}
