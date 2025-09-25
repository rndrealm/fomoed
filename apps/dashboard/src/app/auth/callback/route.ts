import { AppRoutes } from "@/lib/routes";
import {
  createSupabaseServerClient,
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

async function getUserByEmail(email: string) {
  const supabase = await createSupabaseServerComponentClient();

  const user = await supabase.from("users").select().ilike("email", email).limit(1).single();

  return user.data;
}

async function createOrLinkUserFromOAuth(user: User, referralCode: string | null): Promise<void> {
  console.log("createOrLinkUserFromOAuth called with:", {
    userEmail: user.email,
    userId: user.id,
    referralCode
  });

  const supabase = await createSupabaseServerWithAnonKey();
  if (!user.email) {
    throw new Error("User does not have an email address");
  }

  const existingUser = await getUserByEmail(user.email);
  console.log("Existing user check:", { existingUser: !!existingUser });

  // If the user exists, link the ID from oauth to the existing user
  if (existingUser) {
    await linkAuthIdToEmail(user.email, user.id); // Added missing await
    console.info(`Linked email ${user.email} to auth id ${user.id} when logging in with OAuth.`);
    return;
  }

  const ALPHANUMERIC_CHARS = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const generateRandomPart = customAlphabet(ALPHANUMERIC_CHARS, 10);
  const newUserReferralCode = `U${generateRandomPart()}`; // Added missing semicolon

  console.log("Creating new user with referral code:", newUserReferralCode);

  // Otherwise insert a new user
  const newUserData: IUserInsert = {
    email: user.email.toLowerCase(),
    username: user.email?.split("@")[0],
    user_id: user.id,
    referral_code: newUserReferralCode
  };

  console.log("Inserting new user data:", newUserData);

  const { data: newUser, error: insertError } = await supabase
    .from("users")
    .insert(newUserData)
    .select("user_id") 
    .single();

  if (insertError) {
    console.error("OAuth profile creation failed:", insertError);
    throw new Error(insertError.message);
  }

  console.log("New user created:", newUser);

  await track("signup", {
    username: newUserData.username,
    email: newUserData.email,
  });

  if (referralCode && newUser) {
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
        referred_user_id: newUser.user_id,
        status: 'Pending'
      };
      
      console.log("Inserting referral:", referralData);
      
      const { error: referralError } = await supabase
        .from("referrals")
        .insert(referralData);
      
      if (referralError) {
        console.error("Failed to create referral:", referralError);
      } else {
        console.log("Referral created successfully");
      }
    } else {
      console.warn(`OAuth Callback: Invalid referral code was used: ${referralCode}`);
    }
  } else {
    console.log("No referral processing needed:", { referralCode, newUser: !!newUser });
  }
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);

  const code = searchParams.get("code");

  // if "next" is in param, use it in the redirect URL
  const next = searchParams.get("next") ?? "/";
  const from = searchParams.get("from") ?? "/";
  const referralCode = searchParams.get("referral")

  if (code) {
    const supabase = await createSupabaseServerClient();

    const { error, data } = await supabase.auth.exchangeCodeForSession(code);
    console.log("Exchange code for session:", { error, data });

    if (!data.user) {
      return NextResponse.redirect(
        `${origin}${AppRoutes.auth.authError.path}?code=${error?.code}&message=${error?.message}`,
      );
    }

    await createOrLinkUserFromOAuth(data.user, referralCode);

    if (!error) {
      if (from === "marketing") {
        const marketingUrl = process.env.NEXT_PUBLIC_MARKETING_APP_URL;
        return NextResponse.redirect(marketingUrl || "https://marketing.fomoed.io");
      } else {
        return NextResponse.redirect(`${origin}/dashboard`);
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
