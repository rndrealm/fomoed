"use client"
import HeroCard from "@/components/referrals/HeroCard";
import ReferralStats from "@/components/referrals/ReferralStats";
import React, { useState, FC } from "react";

// --- Type Definitions ---
interface StatsData {
  estimatedTotalCommission: number;
  activeSubscribers: number;
  pending: number;
  numberOfReferrals: number;
  acceptedReferrals: number;
  inactiveSubscribers: number;
}

interface ReferralData {
  referralLink: string;
  stats: StatsData;
}

// A specific type for our tab names to prevent typos
export type TabName = 'All Referrals' | 'Subscribers' | 'Invitation History';

// --- Dummy Data ---
const referralData: ReferralData = {
  referralLink: "https://dashboard.fomoed.io/referral/noah-shiffman",
  stats: {
    estimatedTotalCommission: 0,
    activeSubscribers: 0,
    pending: 0,
    numberOfReferrals: 0,
    acceptedReferrals: 0,
    inactiveSubscribers: 0,
  },
};

const ReferralPage: FC = () => {
  const [copied, setCopied] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<TabName>("All Referrals");

  const handleCopy = (): void => {
    navigator.clipboard.writeText(referralData.referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto my-2 p-5 text-white text-inter">
      <div className="mb-10">
        <h1 className="text-3xl font-bold mb-2">Referrals</h1>
        <p className="text-zinc-400">
          Know someone who could benefit from Fomoed? Send them an Invite
        </p>
      </div>

      <HeroCard
        referralLink={referralData.referralLink}
        copied={copied}
        handleCopy={handleCopy}
      />

      <ReferralStats
        stats={referralData.stats}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />
      
       <p className="text-center text-zinc-400 text-sm mt-6">
          Please note, <a href="#" className="text-[#F7984B] underline">Terms, conditions and limits</a> may apply
       </p>
    </div>
  );
};

export default ReferralPage;