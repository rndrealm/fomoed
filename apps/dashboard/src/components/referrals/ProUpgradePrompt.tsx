import Link from "next/link";
import { Lock } from "lucide-react";

interface ProUpgradePromptProps {
  referralCount: number;
}

export const ProUpgradePrompt = ({ referralCount }: ProUpgradePromptProps) => {
  return (
    <div className="bg-gradient-to-br from-orange-500/10 to-orange-600/5 border border-orange-500/20 rounded-xl p-8 text-center mb-6">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-orange-500/20 mb-4">
        <Lock className="w-8 h-8 text-orange-400" />
      </div>
      
      <h3 className="text-2xl font-bold mb-2">Unlock Referral Earnings</h3>
      <p className="text-zinc-400 mb-1">
        You have <span className="text-white font-semibold">{referralCount} referral{referralCount !== 1 ? 's' : ''}</span>
      </p>
      <p className="text-zinc-400 mb-6">
        Upgrade to Pro to start earning commissions from your referrals
      </p>

      <Link 
        href="/pricing"
        className="inline-block bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
      >
        Upgrade to Pro
      </Link>

      <div className="mt-6 pt-6 border-t border-zinc-800">
        <p className="text-sm text-zinc-500">
          Pro members earn <span className="text-orange-400 font-semibold">$9.99 per month</span>  per user for each active referred subscriber to Fomoed&apos;s $29.99/month plan
        </p>
      </div>
    </div>
  );
};