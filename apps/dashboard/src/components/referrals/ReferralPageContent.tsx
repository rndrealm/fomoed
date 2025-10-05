"use client";

import HeroCard from "@/components/referrals/HeroCard";
import ReferralStats from "@/components/referrals/ReferralStats";
import HowReferralsWorkModal from "@/components/referrals/HowReferralsWorkModal";
import React, { useState, FC } from "react";
import { StatsData, ChartData, SubscriberItem, PayoutItem } from "@/services/queries/referral/types";

interface ReferralPageContentProps {
  referralCode: string;
  stats: StatsData | null;
  subscribers: SubscriberItem[];
  payouts: PayoutItem[];
  initialChartData: ChartData | null;
  stripeStatus: { // Add this
    status: string ; 
    onboarding_completed: boolean;
    payouts_enabled: boolean;
  } | null;
}

export type TabName = "All Referrals" | "Subscribers" | "Payouts";

const ReferralPageContent: FC<ReferralPageContentProps> = ({
  referralCode,
  stats,
  subscribers,
  payouts,
  initialChartData,
  stripeStatus
}) => {
  const [copied, setCopied] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<TabName>("All Referrals");
  const [showModal, setShowModal] = useState<boolean>(false);

  const handleCopy = (link: string): void => {
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const displayStats = stats || {
    estimatedTotalCommission: 0,
    activeSubscribers: 0,
    inactiveSubscribers: 0,
    numberOfReferrals: 0,
    paidOut: 0,
  };

  return (
    <>
      <div className="max-w-6xl mx-auto my-2 p-5 text-white text-inter">
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-semibold mb-1">Referrals</h1>
            <p className="text-zinc-400 text-sm">Know someone who could benefit from Fomoed? send them an invite</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 text-sm text-zinc-300 hover:text-white transition-colors"
          >
            <span className="w-4 h-4 rounded-full border border-zinc-400 flex items-center justify-center text-xs">
              i
            </span>
            How It Works
          </button>
        </div>

        <HeroCard referralCode={referralCode} copied={copied} handleCopy={handleCopy} />

        <ReferralStats
          stats={displayStats}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          subscribers={subscribers}
          payouts={payouts}
          initialChartData={initialChartData}
          stripeStatus = {stripeStatus}
        />

        <p className="text-center text-zinc-400 text-sm mt-6">
          Please note,{" "}
          <a href="#" className="text-[#F7984B] underline">
            Terms, conditions and limits
          </a>{" "}
          may apply
        </p>
      </div>

      <HowReferralsWorkModal
        showModal={showModal}
        setShowModal={setShowModal}
        referralCode={referralCode}
        copied={copied}
        handleCopy={handleCopy}
      />
    </>
  );
};

export default ReferralPageContent;
