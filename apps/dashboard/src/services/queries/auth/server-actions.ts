"use server";
import { LoginUserFunctionResponse, RegisterUserPayload } from "./types";
import { createSupabaseServerClient, createSupabaseServiceClient } from "@/lib/utils/supabase/server-client";
import { headers } from "next/headers";

export async function signUpNewUser(
  body: RegisterUserPayload,
  fromUrl?: string | null,
): Promise<LoginUserFunctionResponse> {
  const supabase = await createSupabaseServiceClient();
const { email, password, username, referralCode } = body;
  const headersList = await headers();
  const protocol = headersList.get("x-forwarded-proto") || "http";
  const host = headersList.get("host") || "localhost";

  let origin = `${protocol}://${host}/auth/confirm?type=signup`;
  if (referralCode) {
    origin += `&referral=${encodeURIComponent(referralCode)}`;
  }

  const authRes = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: fromUrl ? `${origin}&fromUrl=${fromUrl}` : `${origin}`,
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
