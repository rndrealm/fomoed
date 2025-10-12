"use client";

import { useState, useTransition } from "react";
import { generateUserReferralCode } from "@/services/queries/referral/server-actions";

export default function GenerateCodeComponent() {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleGenerateCode = () => {
    startTransition(async () => {
      setError(null);
      const result = await generateUserReferralCode();
      if (!result.success) {
        setError(result.message);
      }
    });
  };

  return (
    <div className="max-w-2xl mx-auto my-10 p-8 text-white text-center rounded-lg bg-zinc-800">
      <h2 className="text-2xl font-bold mb-2">Activate Your Referral Code</h2>
      <p className="text-zinc-400 mb-6">
        Generate your unique code to start referring friends and earning rewards!
      </p>
      <button
        onClick={handleGenerateCode}
        disabled={isPending}
        className="px-6 py-3 bg-[#F7984B] text-black font-bold rounded-lg hover:opacity-90 disabled:opacity-50"
      >
        {isPending ? "Generating..." : "Get My Code"}
      </button>
      {error && <p className="mt-4 text-sm text-red-400">{error}</p>}
    </div>
  );
}