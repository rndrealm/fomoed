"use client";

import React, { FC, useState, useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import Image from "next/image";
import dashboard from "@/lib/assets/dashboard";

interface HowReferralsWorkModalProps {
  showModal: boolean;
  setShowModal: (show: boolean) => void;
  referralCode: string;
  copied: boolean;
  handleCopy: (link: string) => void;
}

const HowReferralsWorkModal: FC<HowReferralsWorkModalProps> = ({
  showModal,
  setShowModal,
  referralCode,
  copied,
  handleCopy,
}) => {
  const [referralLink, setReferralLink] = useState("");

  useEffect(() => {
    setReferralLink(`${window.location.origin}/auth?referral=${referralCode}`);
  }, [referralCode]);

  if (!showModal) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-zinc-900 rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto p-8 relative text-white scrollbar overflow-auto">
        <button
          onClick={() => setShowModal(false)}
          className="absolute top-6 left-6 w-10 h-10 rounded-full bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="mt-8">
          <h2 className="text-2xl font-semibold mb-4">How Referrals work</h2>

          <p className="text-sm leading-relaxed mb-8">
            Fomoed&apos;s referral program lets you earn a monthly commission for every subscriber you bring to the
            platform. By sharing your unique referral link, you can earn $9.99 per month for each active referred
            subscriber to Fomoed&apos;s $29.99/month plan.
          </p>

          <div className="space-y-6">
            {/* Section 1 */}
            <div>
              <h3 className="text-base font-medium mb-3">1. Your Referral Code</h3>
              <ul className="space-y-2 text-sm ml-6">
                <li className="list-disc">
                  Every Fomoed account automatically generates a unique referral code when you sign up.
                </li>
                <li className="list-disc">
                  You&apos;ll find your code and link in the Referral tab of your dashboard or in the main navigation
                  menu.
                </li>
                <li className="list-disc">
                  Tap Copy Link to share it anywhere—social media, email, or direct messages.
                </li>
              </ul>

              {/* Referral Link Card */}
              <div className="mt-4 bg-black rounded-lg p-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-12 h-12 flex items-center justify-center flex-shrink-0">
                    <Image src={dashboard.referralAsset} alt="Referral Icon" width={40} height={40} />
                  </div>
                  <span className="text-sm text-white truncate">{referralLink}</span>
                </div>
                <button
                  onClick={() => handleCopy(referralLink)}
                  className="px-6 py-2 bg-[#FF6B4A] hover:bg-[#FF5533] text-white rounded-md text-sm font-medium transition-colors flex-shrink-0"
                >
                  {copied ? "Copied!" : "Copy Link"}
                </button>
              </div>
            </div>

            {/* Section 2 */}
            <div>
              <h3 className="text-base font-medium mb-3">2. How it Works</h3>
              <ul className="space-y-2 text-sm ml-6">
                <li className="list-disc">
                  <strong>Share Your Link</strong> – Send your referral link to friends or followers.
                </li>
                <li className="list-disc">
                  <strong>They Subscribe</strong> – When they sign up for Fomoed using your link, they&apos;re
                  automatically tracked as your referral.
                </li>
                <li className="list-disc">
                  <strong>You Earn</strong> – For each active subscriber, you earn $9.99 per month after the 30-day
                  payment confirmation period.
                </li>
                <li className="list-disc">
                  <strong>Automatic Payouts</strong> – Once the payment window clears, payouts are handled automatically
                  via Stripe Connect.
                </li>
              </ul>
            </div>

            {/* Section 3 */}
            <div>
              <h3 className="text-base font-medium mb-3">
                3. Inside your Referral tab, you&apos;ll see a real-time dashboard with:
              </h3>
              <ul className="space-y-2 text-sm ml-6">
                <li className="list-disc">
                  <strong>Active Subscribers</strong> – Number of paying subscribers linked to you.
                </li>
                <li className="list-disc">
                  <strong>Inactive Subscribers</strong> – People who canceled or didn&apos;t complete payment.
                </li>
                <li className="list-disc">
                  <strong>Invitation History</strong> – Track who joined and when.
                </li>
                <li className="list-disc">
                  <strong>Estimated Monthly Earnings</strong> – Projected payout for the current month.
                </li>
                <li className="list-disc">
                  <strong>Year-to-Date Statements</strong> – Annual summaries of your referral earnings.
                </li>
              </ul>
            </div>

            {/* Section 4 */}
            <div>
              <h3 className="text-base font-medium mb-3">
                4. Inside your Referral tab, you&apos;ll see a real-time dashboard with:
              </h3>
              <ul className="space-y-2 text-sm ml-6">
                <li className="list-disc">
                  <strong>Active Subscribers</strong> – Number of paying subscribers linked to you.
                </li>
                <li className="list-disc">
                  <strong>Inactive Subscribers</strong> – People who canceled or didn&apos;t complete payment.
                </li>
                <li className="list-disc">
                  <strong>Invitation History</strong> – Track who joined and when.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HowReferralsWorkModal;
