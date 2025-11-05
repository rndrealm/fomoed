"use server"
import { createSupabaseServerClient } from "@/lib/utils/supabase/server-client";

export async function getUserOnboardingStatus() {
  const supabase = await createSupabaseServerClient();
  
  const {
    data: { user },
  } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error("User not authenticated");
  }

  const { data, error } = await supabase
    .from("users")
    .select("onboarded")
    .eq("user_id", user.id)
    .single();
  

  if (error) {
    console.error("Error fetching user onboarding status:", error);
    throw error;
  }

  return data?.onboarded ?? false;
}

export async function updateUserOnboardingStatus() {
  const supabase = await createSupabaseServerClient();
  
  const {
    data: { user },
  } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error("User not authenticated");
  }

  const { error } = await supabase
    .from("users")
    .update({ onboarded: true })
    .eq("user_id", user.id);

  if (error) {
    console.error("Error updating user onboarding status:", error);
    throw error;
  }

  return true;
}