import { AppRoutes } from "@/lib/routes";
import {
  createSupabaseServerClient,
  createSupabaseServiceClient,
  createSupabaseServerComponentClient,
  createSupabaseServerWithAnonKey,
} from "@/lib/utils/supabase/server-client";
import { SupabaseClient, User } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { track } from "@vercel/analytics/server";
import { customAlphabet } from "nanoid";
import { v4 as uuidv4 } from "uuid";

interface IUserInsert {
  email: string;
  username: string;
  user_id: string;
  referral_code: string;
}

interface IUser extends IUserInsert {
  id: number;
  created_at: string; // ! These will be strings that need to be converted to date
  updated_at: string | null; // ! These will be strings that need to be converted to date
  has_valid_sub: boolean;
  has_had_free_trial: boolean;
  has_trial_active: boolean;
}

async function linkAuthIdToEmail(email: string, authId: string) {
  const supabase = await createSupabaseServerComponentClient();

  const updateRes = await supabase
    .from("users")
    .update({ user_id: authId, email: email.toLowerCase() })
    .ilike("email", email);

  if (updateRes.error) {
    throw new Error(`Failed update auth id for email ${email} to id ${authId}`);
  }
}

// async function getUserByEmail(email: string) {
//   const supabase = await createSupabaseServerComponentClient();

//   const user = await supabase.from("users").select().ilike("email", email).limit(1).single();

//   return user.data;
// }

async function createOrLinkUserFromOAuth(user: User, referralCode: string | null): Promise<string | undefined> {
  console.log("createOrLinkUserFromOAuth called with:", {
    userEmail: user.email,
    userId: user.id,
    referralCode,
  });

  const supabase = await createSupabaseServerWithAnonKey();
  if (!user.email) {
    throw new Error("User does not have an email address");
  }

  // Get user by user_id (not email) to check their current state
  const { data: existingUser } = await supabase.from("users").select("*").eq("user_id", user.id).single();

  console.log("User check:", {
    existingUser: !!existingUser,
    hasReferralCode: existingUser?.referral_code ? true : false,
    userReferralCode: existingUser?.referral_code,
  });

  // If user doesn't exist at all, something went wrong with the trigger
  if (!existingUser) {
    console.error("User should have been created by trigger but wasn't found");

    // Fallback: create the user manually
    const ALPHANUMERIC_CHARS = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const generateRandomPart = customAlphabet(ALPHANUMERIC_CHARS, 10);
    const newUserReferralCode = `U${generateRandomPart()}`;

    const newUserData: IUserInsert = {
      email: user.email.toLowerCase(),
      username: user.email?.split("@")[0],
      user_id: user.id,
      referral_code: newUserReferralCode,
    };

    await supabase.from("users").insert(newUserData);

    // Process referral for this new user
    if (referralCode) {
      await processReferral(supabase, referralCode, user.id);
    }

    await track("signup", {
      username: newUserData.username,
      email: newUserData.email,
    });

    return;
  }

  // User exists - check if they need a referral code (new user) or just auth linking (returning user)
  if (!existingUser.referral_code) {
    console.log("User exists but has no referral code - treating as new user");

    // Generate referral code for this user
    const ALPHANUMERIC_CHARS = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const generateRandomPart = customAlphabet(ALPHANUMERIC_CHARS, 10);
    const newUserReferralCode = `U${generateRandomPart()}`;

    // Update user with referral code
    await supabase.from("users").update({ referral_code: newUserReferralCode }).eq("user_id", user.id);

    console.log("Generated referral code for user:", newUserReferralCode);

    // Process referral if one was provided
    if (referralCode) {
      await processReferral(supabase, referralCode, user.id);
    }

    // Track as signup since this is their first time
    await track("signup", {
      username: existingUser.username,
      email: existingUser.email,
    });
    return "new-user";
  } else {
    console.log("User has referral code - treating as returning user");
    // User already has a referral code, just ensure auth linking
    await linkAuthIdToEmail(user.email, user.id);
  }
}

async function processReferral(supabase: any, referralCode: string, newUserId: string): Promise<void> {
  console.log("Processing referral code:", referralCode);

  const { data: referrer, error: referrerError } = await supabase
    .from("users")
    .select("user_id")
    .eq("referral_code", referralCode)
    .single();

  console.log("Referrer lookup result:", { referrer, referrerError });

  if (referrer) {
    const referralData = {
      referral_id: uuidv4(),
      referrer_user_id: referrer.user_id,
      referred_user_id: newUserId,
      status: "Pending",
    };

    console.log("Inserting referral:", referralData);

    const { error: referralError } = await supabase.from("referrals").insert(referralData);

    if (referralError) {
      console.error("Failed to create referral:", referralError);
    } else {
      console.log("Referral created successfully");
    }
  } else {
    console.warn(`OAuth Callback: Invalid referral code was used: ${referralCode}`);
  }
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);

  const code = searchParams.get("code");

  // if "next" is in param, use it in the redirect URL
  const next = searchParams.get("next") ?? "/";
  const from = searchParams.get("from") ?? "/";
  const referralCode = searchParams.get("referral");

  if (code) {
    const supabase = await createSupabaseServerClient();

    const { error, data } = await supabase.auth.exchangeCodeForSession(code);
    console.log("Exchange code for session:", { error, data });

    if (!data.user) {
      return NextResponse.redirect(
        `${origin}${AppRoutes.auth.authError.path}?code=${error?.code}&message=${error?.message}`,
      );
    }

    const isNewUser = await createOrLinkUserFromOAuth(data.user, referralCode);

    if (!error) {
      if (from === "marketing") {
        const marketingUrl = process.env.NEXT_PUBLIC_MARKETING_APP_URL;
        return NextResponse.redirect(marketingUrl || "https://marketing.fomoed.io");
      } else if (next) {
        return NextResponse.redirect(`${origin}/${next}`);
      } else {
        if (isNewUser === "new-user") {
          return NextResponse.redirect(`${origin}/waitlist`);
        } else {
          return NextResponse.redirect(`${origin}/dashboard`);
        }
        // return NextResponse.redirect(`${origin}${next}`);
      }
    }
  }

  // TODO: Create this page
  // return the user to an error page with instructions
  return NextResponse.redirect(
    `${origin}${AppRoutes.auth.authError.path}?code=400&message=Login%20attempt%20failed.%20Please%20try%20again.`,
  );
}
