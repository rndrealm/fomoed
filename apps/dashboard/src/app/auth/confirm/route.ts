import { type EmailOtpType } from "@supabase/supabase-js";
import { type NextRequest } from "next/server";

import { redirect } from "next/navigation";
import { NextResponse } from "next/server";
import { createSupabaseServiceClient } from "@/lib/utils/supabase/server-client";
import { AppRoutes } from "@/lib/routes";
import { v4 as uuidv4 } from "uuid";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = searchParams.get("next") ?? "/";
  const fromUrl = searchParams.get("fromUrl");
  const referralCode = searchParams.get("referralCode");

  console.log("type:", type);
  console.log("token:", token_hash);
  console.log("fromurl:", fromUrl);
  console.log("referralCode:", referralCode);

  if (token_hash && type) {
    const supabase = await createSupabaseServiceClient();
    console.log("PRIVATE_SUPABASE_SECRET available?", !!process.env.PRIVATE_SUPABASE_SECRET);

    const { data: debugUsers, error: debugError } = await supabase
      .from("users")
      .select("user_id, referral_code")
      .not("referral_code", "is", null)
      .limit(5);

    console.log("DEBUG: non-null referral_code users", { debugUsers, debugError });

    const { data: debugExact, error: debugExactError } = await supabase
      .from("users")
      .select("user_id, referral_code")
      .eq("referral_code", "U50PBRQ9WTO");

    console.log("DEBUG: lookup for U50PBRQ9WTO", { debugExact, debugExactError });
    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    });
    if (!error) {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user && referralCode) {
        const { data: referrer, error: referrerError } = await supabase
          .from("users")
          .select("user_id")
          .eq("referral_code", referralCode)
          .maybeSingle();

        console.log("Referral lookup debug:", { referrer, referrerError, referralCode });

        if (referrer && !referrerError) {
          const newReferralId = uuidv4();
          const { error: referralInsertError } = await supabase.from("referrals").insert({
            referral_id: newReferralId,
            referrer_user_id: referrer.user_id,
            referred_user_id: user.id,
            status: "Pending",
          });

          if (referralInsertError) {
            console.error("Failed to create referral link:", referralInsertError);
          }
        } else {
          console.warn(`Invalid referral code used during confirmation: ${referralCode}`);
        }
      }
      // redirect user to specified redirect URL or root of app
      if (fromUrl === "marketing") {
        const marketingUrl = process.env.NEXT_PUBLIC_MARKETING_APP_URL;
        return NextResponse.redirect(marketingUrl || "https://marketing.fomoed.io");
      } else {
        redirect(next);
      }
    }
    console.log(error);
    redirect(`${AppRoutes.auth.authError.path}?code=400&message=${error.message}.`);
  }

  // redirect the user to an error page with some instructions
  redirect(`${AppRoutes.auth.authError.path}?code=400&message=Invalid token or type provided.`);
}
