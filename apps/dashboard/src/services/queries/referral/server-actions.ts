"use server";

import { createSupabaseServerClient } from "@/lib/utils/supabase/server-client";
import { GenerateReferralCodeResponse } from "./types";
import { revalidatePath } from "next/cache";
import { customAlphabet } from "nanoid";

const ALPHANUMERIC_CHARS = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const generateRandomPart = customAlphabet(ALPHANUMERIC_CHARS, 10);

export async function generateUserReferralCode(): Promise<GenerateReferralCodeResponse> {
  const supabase = await createSupabaseServerClient();

  try {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return {
        success: false,
        message: "You must be logged in to generate a referral code.",
      };
    }

    const { data: userProfile, error: profileError } = await supabase
      .from("users")
      .select("referral_code")
      .eq("user_id", user.id)
      .single();

    if (profileError) {
      return {
        success: false,
        message: profileError.message || "Failed to retrieve user profile.",
      };
    }

    if (userProfile.referral_code) {
      return {
        success: true,
        message: "Referral code already exists.",
        code: userProfile.referral_code,
      };
    }

    let newCode: string | null = null;
    let isCodeUnique = false;
    let attempts = 0;
    const maxAttempts = 5; 

    while (!isCodeUnique && attempts < maxAttempts) {
      attempts++;
      const randomPart = await generateRandomPart();
      const candidateCode = `U${randomPart}`;

      const { data, error } = await supabase
        .from("users")
        .select("user_id")
        .eq("referral_code", candidateCode)
        .limit(1)
        .single();
      
      if (error && error.code !== 'PGRST116') { 
         console.error("DB error checking for referral code uniqueness:", error);
         break;
      }

      if (!data) {
        isCodeUnique = true;
        newCode = candidateCode;
      }
    }
    
    if (!newCode) {
      return {
        success: false,
        message: "Could not generate a unique referral code. Please try again later.",
      };
    }

    const { error: updateError } = await supabase
      .from("users")
      .update({ referral_code: newCode })
      .eq("user_id", user.id);

    if (updateError) {
      return {
        success: false,
        message: updateError.message || "Failed to save referral code.",
      };
    }
    
    revalidatePath('/referral');

    return {
      success: true,
      message: "Successfully generated referral code.",
      code: newCode,
    };
  } catch (error) {
    console.log("Error in generateUserReferralCode:", error);
    return {
      success: false,
      message: "Something went wrong while generating the code.",
    };
  }
}

export async function getReferralIdForUser(referredUserId: string): Promise<string | null> {
  const supabase = await createSupabaseServerClient();

  try {
    console.log("REFERRED USER ID: " + referredUserId)
    const { data, error } = await supabase
      .from("referrals")
      .select("referral_id")
      .eq("referred_user_id", referredUserId)
      .order("created_at", { ascending: false }) // In case of duplicates, get the most recent one
      .limit(1)
      .maybeSingle();

    console.log("KETEMUUUUUUU: " + data?.referral_id)
    console.log("FULL DATA: ", data);

    // If no record is found, Supabase returns an error. 
    // The code 'PGRST116' specifically means "No rows found", which is an expected outcome, not a server error.
    if (error && error.code !== 'PGRST116') {
      console.error("Database error fetching referral ID:", error.message);
      console.error("Database error:", error);
      return null;
    }

    // If data exists, return the ID. Otherwise, it will be null.
    return data ? data.referral_id : null;

  } catch (err) {
    console.error("An unexpected error occurred in getReferralIdForUser:", err);
    return null;
  }
}
