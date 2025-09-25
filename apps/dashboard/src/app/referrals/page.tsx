import GenerateCodeComponent from "@/components/referrals/GenerateCodeComponent";
import ReferralPageContent from "@/components/referrals/ReferralPageContent";
import { createSupabaseServerClient } from "@/lib/utils/supabase/server-client";
import { redirect } from "next/navigation";
import { Suspense } from "react";

export default async function Page() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  console.log(user?.id)

  if (!user) {
    redirect("/login");
  }

  // Fetch only the user's referral code
  const { data: userProfile } = await supabase
    .from("users")
    .select("referral_code")
    .eq("user_id", user.id)
    .single();

  // If the user has no code, show the generation component
  if (!userProfile?.referral_code) {
    return <GenerateCodeComponent />;
  }

  // If they have a code, construct the link and show the main dashboard
  const referralLink = `https://dashboard.fomoed.io/referral/${userProfile.referral_code}`;

  return (
    <Suspense fallback={<div className="text-center text-white">Loading...</div>}>
      <ReferralPageContent referralLink={referralLink} />
    </Suspense>
  );
}