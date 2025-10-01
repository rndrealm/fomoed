import React, { Fragment, useState } from "react";
import { Tabs } from "./tabs";
import { LeaderboardTable } from "./leaderboard-table";
import { Info } from "./info";
import { RenderIf } from "@/components/shared";
import { CopyTradeTable } from "./copy-trade-table";
import { useReadGemachCopyTrades, useReadHyperLiquidLeaderboard } from "@/services/queries/gemach";
import { useSupabaseAuth } from "@/components/providers";
import { useAccount } from "wagmi";
import { TimeWindow } from "@/services/queries/gemach/types";
import { gemachUserLoggedInAtom } from "@/lib/atoms/gemach";
import { useAtomValue } from "jotai";
import { Activity } from "./activity";
import { OpenPositions } from "./open-positions";

export default function Content() {
  const { session } = useSupabaseAuth();

  const { address } = useAccount();

  const [activeTab, setActiveTab] = useState("leaderboard");
  const [timeWindow, setTimeWindow] = useState<TimeWindow>("week");

  const gemachUserLoggedIn = useAtomValue(gemachUserLoggedInAtom);

  useReadHyperLiquidLeaderboard({
    authToken: session?.access_token,
  });

  useReadGemachCopyTrades(address, gemachUserLoggedIn, session?.access_token);

  return (
    <div className="flex flex-col gap-3 flex-1 overflow-y-scroll scrollbar">
      <Info />
      <Tabs
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
        }}
        timeWindow={timeWindow}
        setTimeWindow={(timeWindow) => {
          setTimeWindow(timeWindow);
        }}
      />

      <RenderIf condition={activeTab === "leaderboard"}>
        <LeaderboardTable timeWindow={timeWindow} />
      </RenderIf>

      <RenderIf condition={activeTab === "copy_trade"}>
        <CopyTradeTable />
      </RenderIf>

      <RenderIf condition={activeTab === "open_positions"}>
        <OpenPositions />
      </RenderIf>

      <RenderIf condition={activeTab === "activity"}>
        <Activity />
      </RenderIf>
    </div>
  );
}
