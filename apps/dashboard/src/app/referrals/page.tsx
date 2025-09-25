import GenerateCodeComponent from "@/components/referrals/GenerateCodeComponent";
import ReferralPageContent from "@/components/referrals/ReferralPageContent";
import { createSupabaseServerClient } from "@/lib/utils/supabase/server-client";
import { redirect } from "next/navigation";
import { Suspense } from "react";

export default async function Page() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  console.log(user?.id);

  if (!user) {
    redirect("/login");
  }

  const { data: userProfile } = await supabase.from("users").select("referral_code").eq("user_id", user.id).single();

  if (!userProfile?.referral_code) {
    return <GenerateCodeComponent />;
  }

  const referralLink = `https://dashboard.fomoed.io/auth?referral=${userProfile.referral_code}`;

  return (
    <Suspense fallback={<div className="text-center text-white">Loading...</div>}>
      <ReferralPageContent referralLink={referralLink} />
    </Suspense>
  );
}
