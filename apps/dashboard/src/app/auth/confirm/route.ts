import { type EmailOtpType } from "@supabase/supabase-js";
import { type NextRequest } from "next/server";

import { redirect } from "next/navigation";
import { NextResponse } from "next/server";
import { createSupabaseServiceClient } from "@/lib/utils/supabase/server-client";
import { AppRoutes } from "@/lib/routes";
import { v4 as uuidv4 } from "uuid";
import { customAlphabet } from "nanoid";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = searchParams.get("next") ?? "/";
  const fromUrl = searchParams.get("fromUrl");
  const referralCode = searchParams.get("referral");

  console.log("type:", type);
  console.log("token:", token_hash);
  console.log("fromurl:", fromUrl);
  console.log(referralCode)

  if (token_hash && type) {
    const supabase = await createSupabaseServiceClient();

    const { data: { session }, error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    });

    if (!error && session?.user) {
      const confirmedUser = session.user;

      const ALPHANUMERIC_CHARS = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
      const generateRandomPart = customAlphabet(ALPHANUMERIC_CHARS, 10);
      const newUserReferralCode = `U${generateRandomPart()}`;

      await supabase
        .from("users")
        .update({
          referral_code: newUserReferralCode,
        })
        .eq("user_id", confirmedUser.id);

      if (referralCode) {
        const decodedReferralCode = decodeURIComponent(referralCode)
        const { data: referrer } = await supabase
          .from("users")
          .select("user_id")
          .ilike("referral_code", decodedReferralCode)
          .single();
        console.log("REFERRAL CODE FOUNDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD")
        console.log("REFFFFFFFFFFFFFFFFFFFFFF:" + referrer)
        if (referrer) {
          console.log("REFERER FOUNDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDd")
          await supabase.from("referrals").insert({
            referral_id: uuidv4(),
            referrer_user_id: referrer.user_id,
            referred_user_id: confirmedUser.id,
            status: 'Pending',
          });
          console.log("ADEDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDdDDDDDDDDDDD")
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
    redirect(`${AppRoutes.auth.authError.path}?code=400&message=${error?.message}.`);
  }

  // redirect the user to an error page with some instructions
  redirect(`${AppRoutes.auth.authError.path}?code=400&message=Invalid token or type provided.`);
}
