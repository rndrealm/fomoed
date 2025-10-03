import React, { FC, useEffect, useState } from "react";
import Image from "next/image";
import dashboard from "@/lib/assets/dashboard";

interface HeroCardProps {
  referralCode: string;
  copied: boolean;
  handleCopy: (arg0: string) => void;
}

const HeroCard: FC<HeroCardProps> = ({ referralCode, copied, handleCopy }) => {
  const [referralLink, setReferralLink] = useState("");

  useEffect(() => {
    setReferralLink(`${window.location.origin}/auth?referral=${referralCode}`);
  }, [referralCode]);

  return (
    <div className="bg-[#0A0A0A]  border-[#0A0A0A] rounded-xl p-8 flex justify-between items-center mb-16">
      {/* --- Left Content --- */}
      <div className="flex-1">
        <h2 className="text-4xl font-bold leading-tight max-w-md mb-4">Receive a $9.99 per month on every referral</h2>
        <p className="text-zinc-400 mb-16 max-w-md">Know someone who could benefit from Fomoed? Send them an Invite</p>
        <div className="max-w-md">
          <label className="block text-sm mb-2 text-zinc-400">Share Referral Link</label>
          <div className="flex">
            <input
              type="text"
              value={referralLink}
              readOnly
              className="bg-[#161616] border border-zinc-700 rounded-l-md text-white px-4 py-2 flex-grow focus:outline-none text-[#e6e6e6]"
            />
            <button
              onClick={() => handleCopy(referralLink)}
              className="bg-white text-black font-bold px-6 py-2 rounded-r-md whitespace-nowrap hover:bg-zinc-200 transition-colors"
            >
              {copied ? "Copied!" : "Copy Link"}
            </button>
          </div>
        </div>
      </div>

      <div className="hidden md:block ml-8">
        <Image
          src={dashboard.referralHero}
          alt="Fomoed Referral Logo"
          width={220}
          height={220}
          className="object-contain"
        />
      </div>
    </div>
  );
};

export default HeroCard;
