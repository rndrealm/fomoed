"use client";

import { useState } from "react";
import { ExternalLink, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { getStripeConnectAccountLink, getStripeConnectStatus } from "@/services/queries/stripe-connect/server-action";

interface StripeConnectBannerProps {
  initialStatus?: {
    status: string;
    onboarding_completed: boolean;
    payouts_enabled: boolean;
  } | null;
}

export default function StripeConnectBanner({ initialStatus }: StripeConnectBannerProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState(
    initialStatus || {
      status: "not_connected",
      onboarding_completed: false,
      payouts_enabled: false,
    },
  );

  const handleConnect = async () => {
    setLoading(true);
    setError("");

    try {
      const result = await getStripeConnectAccountLink();

      if (!result) {
        setError("No response from server");
        setLoading(false);
        return;
      }

      if (result.success && result.url) {
        window.location.href = result.url;
      } else {
        setError(result.message || "Failed to connect Stripe");
        setLoading(false);
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setLoading(true);
    setError("");

    try {
      const result = await getStripeConnectStatus();

      if (!result) {
        setError("No response from server");
        setLoading(false);
        return;
      }

      if (result.success && result.data) {
        setStatus({
          status: result.data.status ?? "not_connected",
          onboarding_completed: result.data.onboarding_completed ?? false,
          payouts_enabled: result.data.payouts_enabled ?? false,
        });
      } else {
        setError(result.message || "Failed to fetch status");
      }
      setLoading(false);
    } catch (err) {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  // Don't show banner if fully connected
  if (status.status === "connected" && status.payouts_enabled) {
    return (
      <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 mb-4 flex items-center gap-3">
        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
        <div className="flex-1">
          <p className="text-sm text-green-400 font-medium">Stripe Connected</p>
          <p className="text-xs text-zinc-400 mt-1">Your payouts are enabled and ready to process</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 mb-4">
      {error && (
        <div className="mb-3 p-3 bg-red-500/10 border border-red-500/20 rounded flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      <div className="flex items-start gap-3">
        <ExternalLink className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h3 className="text-sm font-medium text-white mb-1">
            {status.status === "not_connected" ? "Connect Stripe to Receive Payouts" : "Complete Stripe Setup"}
          </h3>
          <p className="text-xs text-zinc-400 mb-3">
            {status.status === "not_connected"
              ? "Link your Stripe account to receive commission payments directly to your bank account."
              : "Complete your Stripe onboarding to enable payouts."}
          </p>
          <div className="flex gap-2">
            <button
              onClick={handleConnect}
              disabled={loading}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <ExternalLink className="w-4 h-4" />
                  {status.status === "not_connected" ? "Connect Stripe" : "Continue Setup"}
                </>
              )}
            </button>
            {status.status !== "not_connected" && (
              <button
                onClick={handleRefresh}
                disabled={loading}
                className="px-4 py-2 bg-zinc-700 hover:bg-zinc-600 text-white text-sm rounded-lg transition-colors"
              >
                Refresh Status
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
