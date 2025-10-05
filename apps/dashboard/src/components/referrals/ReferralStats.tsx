import React, { FC } from "react";
import type { TabName } from "./ReferralPageContent";
import SubscribersList from "./SubscribersList";
import PayoutsList from "./PayoutsList";
import AnalyticsChart from "./AnalyticsChart";
import { StatsData, ChartData, SubscriberItem, PayoutItem } from "@/services/queries/referral/types";
import StripeConnectBanner from "./StripeConnectBanner";

interface ReferralStatsProps {
  stats: StatsData;
  activeTab: TabName;
  setActiveTab: React.Dispatch<React.SetStateAction<TabName>>;
  subscribers: SubscriberItem[];
  payouts: PayoutItem[];
  initialChartData: ChartData | null;
  stripeStatus: {
    // Add this
    status: string;
    onboarding_completed: boolean;
    payouts_enabled: boolean;
  } | null;
}

const AllReferralsStats: FC<{ stats: StatsData }> = ({ stats }) => (
  <div className="bg-[#121212] border-[#121212] rounded-xl">
    <div className="flex w-full gap-4 p-4 text-sm text-zinc-400 border-b border-zinc-700">
      <span className="w-1/5">Estimated Total Commission</span>
      <span className="w-1/5">Active Subscribers</span>
      <span className="w-1/5">Inactive Subscribers</span>
      <span className="w-1/5">Number of Referrals</span>
      <span className="w-1/5">Paid Out</span>
    </div>
    <div className="flex w-full gap-4 p-6 text-xl font-bold items-center">
      <div className="w-1/5 flex items-baseline gap-1">
        <span>{stats.estimatedTotalCommission.toFixed(2)}</span>
        <span className="text-xs font-medium text-zinc-400">USD</span>
      </div>
      <span className="w-1/5">{stats.activeSubscribers}</span>
      <span className="w-1/5">{stats.inactiveSubscribers}</span>
      <span className="w-1/5">{stats.numberOfReferrals}</span>
      <div className="w-1/5 flex items-baseline gap-1">
        <span>{stats.paidOut}</span>
        <span className="text-xs font-medium text-zinc-400">USD</span>
      </div>
    </div>
  </div>
);

const ReferralStats: FC<ReferralStatsProps> = ({
  stats,
  activeTab,
  setActiveTab,
  subscribers,
  payouts,
  initialChartData,
  stripeStatus
}) => {
  const tabs: TabName[] = ["All Referrals", "Subscribers", "Payouts"];

  return (
    <div className="bg-[#0A0A0A] border-[#0A0A0A] rounded-xl p-8">
      <h3 className="text-2xl font-bold mb-6">Referral Data</h3>

      <div className="flex mb-3">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 mr-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === tab ? "bg-[#121212] text-white" : "bg-transparent text-zinc-400 hover:text-white"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* --- Tab Content --- */}
      <div>
        {activeTab === "All Referrals" && <AllReferralsStats stats={stats} />}
        {activeTab === "Subscribers" && <SubscribersList subscribers={subscribers} />}
        {activeTab === "Payouts" && (
          <>
            {" "}
            <StripeConnectBanner initialStatus={stripeStatus} />
            <PayoutsList payouts={payouts} />
          </>
        )}
      </div>

      {/* --- Analytics Section --- */}
      <div className="mt-8">
        <h3 className="text-2xl font-bold mb-6">Analytics</h3>
        <AnalyticsChart initialData={initialChartData} />
      </div>
    </div>
  );
};

export default ReferralStats;
