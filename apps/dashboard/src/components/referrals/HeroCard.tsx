import React, { FC, useEffect, useState } from "react";
import Image from "next/image";
import dashboard from "@/lib/assets/dashboard";

interface HeroCardProps {
  referralCode: string;
  copied: boolean;
  handleCopy: (arg0: string) => void;
  onReferralCodeChange?: (newCode: string) => Promise<void>;
}

const HeroCard: FC<HeroCardProps> = ({ 
  referralCode, 
  copied, 
  handleCopy,
  onReferralCodeChange 
}) => {
  const [referralLink, setReferralLink] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [newReferralCode, setNewReferralCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setReferralLink(`${window.location.origin}/auth?referral=${referralCode}`);
  }, [referralCode]);

  const handleModalOpen = () => {
    setNewReferralCode(referralCode);
    setError("");
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
    setNewReferralCode("");
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newReferralCode.trim()) {
      setError("Referral code cannot be empty");
      return;
    }

    if (newReferralCode === referralCode) {
      setError("This is already your current referral code");
      return;
    }

    // Validate format (alphanumeric, 3-20 chars)
    if (!/^[a-zA-Z0-9_-]{3,20}$/.test(newReferralCode)) {
      setError("Code must be 3-20 characters (letters, numbers, dash, underscore only)");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      if (onReferralCodeChange) {
        await onReferralCodeChange(newReferralCode);
        handleModalClose();
      }
    } catch (err: any) {
      setError(err.message || "Failed to update referral code");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="bg-[#0A0A0A] border-[#0A0A0A] rounded-xl p-8 flex justify-between items-center mb-16">
        {/* --- Left Content --- */}
        <div className="flex-1">
          <h2 className="text-4xl font-bold leading-tight max-w-md mb-4">
            Receive a $9.99 per month on every referral
          </h2>
          <p className="text-zinc-400 mb-16 max-w-md">
            Know someone who could benefit from Fomoed? Send them an Invite
          </p>
          <div className="max-w-md">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm text-zinc-400">Share Referral Link</label>
              <button
                onClick={handleModalOpen}
                className="text-xs text-zinc-400 hover:text-white transition-colors underline"
              >
                Change Code
              </button>
            </div>
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

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#0A0A0A] border border-zinc-700 rounded-xl p-6 max-w-md w-full">
            <h3 className="text-2xl font-bold mb-2">Change Referral Code</h3>
            <p className="text-zinc-400 text-sm mb-6">
              Choose a unique code for your referral link. This will update your shareable link.
            </p>

            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm text-zinc-400 mb-2">
                  New Referral Code
                </label>
                <input
                  type="text"
                  value={newReferralCode}
                  onChange={(e) => setNewReferralCode(e.target.value)}
                  placeholder="Enter new code"
                  className="w-full bg-[#161616] border border-zinc-700 rounded-md text-white px-4 py-2 focus:outline-none focus:border-zinc-500"
                  disabled={isSubmitting}
                />
                <p className="text-xs text-zinc-500 mt-1">
                  3-20 characters: letters, numbers, dash, underscore
                </p>
                {error && (
                  <p className="text-xs text-red-500 mt-2">{error}</p>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleModalClose}
                  className="flex-1 bg-zinc-800 text-white font-medium px-4 py-2 rounded-md hover:bg-zinc-700 transition-colors"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-white text-black font-bold px-4 py-2 rounded-md hover:bg-zinc-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default HeroCard;