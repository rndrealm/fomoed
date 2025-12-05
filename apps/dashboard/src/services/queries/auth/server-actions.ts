"use server";
import { LoginUserFunctionResponse, RegisterUserPayload } from "./types";
import { createSupabaseServerClient, createSupabaseServiceClient } from "@/lib/utils/supabase/server-client";
import { headers } from "next/headers";
import { v4 as uuidv4 } from "uuid";
import { customAlphabet } from "nanoid";

export async function signUpNewUser(
  body: RegisterUserPayload,
  fromUrl?: string | null,
  nextUrl?: string | null,
): Promise<LoginUserFunctionResponse> {
  const supabase = await createSupabaseServiceClient();

  const headersList = await headers();
  const protocol = headersList.get("x-forwarded-proto") || "http";
  const host = headersList.get("host") || "localhost";

  const baseConfirmUrl = `${protocol}://${host}/auth/confirm?type=email`;

  const { email, password, referralCode } = body;

  // Always pass referralCode and fromUrl forward if they exist
  const confirmUrlParams = new URLSearchParams();
  if (fromUrl) confirmUrlParams.set("fromUrl", fromUrl);
  if (referralCode) confirmUrlParams.set("referralCode", referralCode);
  if (nextUrl) confirmUrlParams.set("nextUrl", nextUrl);

  const emailRedirectTo =
    confirmUrlParams.toString().length > 0 ? `${baseConfirmUrl}&${confirmUrlParams.toString()}` : baseConfirmUrl;

  const authRes = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo,
    },
  });

  if (authRes.data.user && authRes.data.user.identities && authRes.data.user.identities.length === 0) {
    return {
      success: false,
      message: "User with this email already exists",
    };
  }

  if (authRes.error) {
    return {
      success: false,
      message: authRes.error.message || "Failed to create user account",
    };
  }

  if (!authRes.data.user) {
    return {
      success: false,
      message: "User creation failed unexpectedly. Please try again.",
    };
  }

  const newUserId = authRes.data.user.id;

  const ALPHANUMERIC_CHARS = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const generateRandomPart = customAlphabet(ALPHANUMERIC_CHARS, 10);
  const newUserReferralCode = `U${generateRandomPart()}`;

  const { error: profileError } = await supabase
    .from("users")
    .update({
      referral_code: newUserReferralCode,
    })
    .eq("user_id", newUserId);

  if (profileError) {
    console.error("Failed to create user profile:", profileError);
    return {
      success: false,
      message: "Your account was created, but your profile could not be set up. Please contact support.",
    };
  }

  // if (referralCode) {
  //   const { data: referrer, error: referrerError } = await supabase
  //     .from("users")
  //     .select("user_id")
  //     .eq("referral_code", referralCode)
  //     .single();

  //   if (referrer && !referrerError) {
  //     const newReferralId = uuidv4();
  //     const { error: referralInsertError } = await supabase.from("referrals").insert({
  //       referral_id: newReferralId,
  //       referrer_user_id: referrer.user_id,
  //       referred_user_id: newUserId,
  //       status: "Pending",
  //     });

  //     if (referralInsertError) {
  //       console.error("Failed to create referral link:", referralInsertError);
  //     }
  //   } else {
  //     console.warn(`Invalid referral code used during sign-up: ${referralCode}`);
  //   }
  // }

  return {
    success: true,
    message: "Successfully created user account",
    email,
  };
}

export async function loginUser(body: Omit<RegisterUserPayload, "username">): Promise<LoginUserFunctionResponse> {
  const supabase = await createSupabaseServerClient();
  try {
    const { email, password } = body;
    const { error, data } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return {
        success: false,
        message: error.message,
      };
    }

    return {
      email,
      success: true,
      message: "Successfully logged in",
    };
  } catch (error) {
    return {
      success: false,
      message: "Something went wrong",
    };
  }
}

export async function forgotPassword(body: { email: string }): Promise<LoginUserFunctionResponse> {
  const { email } = body;
  const supabase = await createSupabaseServerClient();

  try {
    const headersList = await headers();
    const protocol = headersList.get("x-forwarded-proto") || "http";
    const host = headersList.get("host") || "localhost";

    const origin = `${protocol}://${host}`;
    const redirectTo = `${origin}`;

    const resSupabase = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo,
    });

    if (resSupabase.error) {
      return {
        success: false,
        message: resSupabase.error.message || "Failed to send password reset email",
      };
    }

    return {
      email,
      success: true,
      message: "Successfully sent password reset email",
    };
  } catch (error) {
    console.log(error);
    return {
      success: false,
      message: "Something went wrong",
    };
  }
}

export async function signInWithTokenHash(token_hash: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.verifyOtp({
    token_hash: token_hash,
    type: "recovery",
  });

  if (error) {
    return {
      success: false,
      message: error.message,
    };
  }
}

export async function setNewPassword(body: { password: string }): Promise<LoginUserFunctionResponse> {
  const { password } = body;
  const supabase = await createSupabaseServerClient();

  try {
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      return {
        success: false,
        message: error.message,
      };
    }

    return {
      success: true,
      message: "Successfully sent password reset email",
    };
  } catch (error) {
    console.log(error);
    return {
      success: false,
      message: "Something went wrong",
    };
  }
}

export async function deleteUser(user_id: string): Promise<LoginUserFunctionResponse> {
  const supabase = await createSupabaseServiceClient();

  try {
    const response = await supabase.from("users").delete().eq("user_id", user_id);

    if (response.error) {
      return {
        success: false,
        message: response.error.message,
      };
    }

    const { error } = await supabase.auth.admin.deleteUser(user_id);
    if (error) {
      return {
        success: false,
        message: error.message,
      };
    }

    return {
      success: true,
      message: "Successfully deleted user account",
    };
  } catch (error) {
    console.log(error);
    return {
      success: false,
      message: "Something went wrong",
    };
  }
}
