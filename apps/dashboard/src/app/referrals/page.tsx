import GenerateCodeComponent from "@/components/referrals/GenerateCodeComponent";
import ReferralPageContent from "@/components/referrals/ReferralPageContent";
import { createSupabaseServerClient } from "@/lib/utils/supabase/server-client";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import {
  getReferralDashboardStats,
  getUserSubscribers,
  getFreeUsers,
  getReferralChartData,
  getUserPayouts,
} from "@/services/queries/referral/server-actions";
import { 
  StatsData, 
  ChartData, 
  SubscriberItem, 
  PayoutItem,
  FreeUserItem 
} from "@/services/queries/referral/types";
import { getStripeConnectStatus } from "@/services/queries/stripe-connect/server-action";

export default async function Page() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: userProfile } = await supabase
    .from("users")
    .select("referral_code")
    .eq("user_id", user.id)
    .single();

  if (!userProfile?.referral_code) {
    return <GenerateCodeComponent />;
  }

  let stats = null;
  let subscribers: SubscriberItem[] = [];
  let freeUsers: FreeUserItem[] = [];
  let payouts: PayoutItem[] = [];
  let chartData = null;
  let stripeStatus = null;

  try {
    const [
      statsData,
      subscribersData,
      freeUsersData,
      payoutsData,
      chartDataResult,
      stripeStatusResult,
    ] = await Promise.all([
      getReferralDashboardStats(),
      getUserSubscribers(),
      getFreeUsers(),
      getUserPayouts(),
      getReferralChartData("7D"),
      getStripeConnectStatus(),
    ]);

    stats = statsData;
    subscribers = subscribersData || [];
    freeUsers = freeUsersData || [];
    payouts = payoutsData || [];
    chartData = chartDataResult;
    stripeStatus =
      stripeStatusResult?.success && stripeStatusResult.data
        ? {
            status: stripeStatusResult.data.status ?? "not_connected",
            onboarding_completed:
              stripeStatusResult.data.onboarding_completed ?? false,
            payouts_enabled: stripeStatusResult.data.payouts_enabled ?? false,
          }
        : null;
  } catch (error) {
    console.error("Failed to fetch referral dashboard data:", error);
  }

  return (
    <Suspense fallback={<div className="text-center text-white">Loading...</div>}>
      <ReferralPageContent
        referralCode={userProfile.referral_code}
        stats={stats}
        subscribers={subscribers}
        freeUsers={freeUsers}
        payouts={payouts}
        initialChartData={chartData}
        stripeStatus={stripeStatus}
      />
    </Suspense>
  );
}