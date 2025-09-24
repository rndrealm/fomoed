import React, { FC } from "react";
import type { TabName } from "./ReferralPageContent"; // Adjust import if needed
import SubscribersList from "./SubscribersList"; 

// --- Type Definitions for Props ---
interface StatsData {
  estimatedTotalCommission: number;
  activeSubscribers: number;
  inactiveSubscribers: number;
  pending: number;
  numberOfReferrals: number;
  acceptedReferrals: number;
}

interface ReferralStatsProps {
  stats: StatsData;
  activeTab: TabName;
  setActiveTab: React.Dispatch<React.SetStateAction<TabName>>;
}

// This component is updated to use Flexbox for a more robust horizontal layout.
const AllReferralsStats: FC<{ stats: StatsData }> = ({ stats }) => (
    <div className="bg-[#121212] border-[#121212] rounded-xl">
        {/* --- Header Row --- */}
        <div className="flex w-full gap-4 p-4 text-sm text-zinc-400 border-b border-zinc-700">
            <span className="w-1/5">Estimated Total Commission</span>
            <span className="w-1/5">Active Subscribers</span>
            <span className="w-1/5">Inactive Subscribers</span>
            <span className="w-1/5">Number of Referrals</span>
            <span className="w-1/5">Accepted Referrals</span>
        </div>
        {/* --- Value Row --- */}
        <div className="flex w-full gap-4 p-6 text-xl font-bold items-center">
            <span className="w-1/5">{stats.estimatedTotalCommission} USDT</span>
            <span className="w-1/5">-</span>
            <span className="w-1/5">-</span>
            <span className="w-1/5">-</span>
            <span className="w-1/5">-</span>
        </div>
    </div>
);

const ReferralStats: FC<ReferralStatsProps> = ({ stats, activeTab, setActiveTab }) => {
  const tabs: TabName[] = ["All Referrals", "Subscribers", "Invitation History"];

  return (
    <div className="bg-[#0A0A0A]  border-[#0A0A0A] rounded-xl p-8">
      <h3 className="text-2xl font-bold mb-6">Referral Data</h3>
      
      <div className="flex mb-3">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 mr-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === tab
                ? "bg-[#121212] text-white"
                : "bg-transparent text-zinc-400 hover:text-white"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>


      {/* --- Conditionally Render Tab Content --- */}
      <div>
        {activeTab === 'All Referrals' && <AllReferralsStats stats={stats} />}
        {activeTab === 'Subscribers' && <SubscribersList />}
        {activeTab === 'Invitation History' && <div className="text-zinc-400">Invitation history will be shown here.</div>}
      </div>
    </div>
  );
};

export default ReferralStats;

