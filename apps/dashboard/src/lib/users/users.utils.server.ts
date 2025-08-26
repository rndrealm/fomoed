import { Database } from "../database/supabase";
import { makeErrorOrData, ErrorOrData, ErrorWrapper, makeErrorWrapper } from "../utils/server.utils";
import { createSupabaseServerClient, createSupabaseServerWithAnonKey } from "../utils/supabase/server-client";

export async function setHasHadFreeTrial(authId: string, value: boolean) {
  const supabase = await createSupabaseServerWithAnonKey();

  const { error, count } = await supabase.from("users").update({ has_had_free_trial: true }).eq("user_id", authId);

  if (error) {
    return { error };
  }

  if (!count || count < 1) {
    return { error: { message: `Could not update has_had_free_trial for user with auth ID ${authId}}`, status: 500 } };
  }

  return { ok: true };
}

export async function getUsersTableRowUsingAuth(): Promise<ErrorOrData<Database["public"]["Tables"]["users"]["Row"]>> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (!user) {
    return makeErrorOrData("Unauthorized", 401);
  }

  if (authError) {
    return makeErrorOrData("Auth error", 500);
  }

  const { data: userData, error: userError } = await supabase.from("users").select("*").eq("user_id", user.id).single();

  if (userError) {
    return makeErrorOrData("Failed to retrieve user", 500);
  }

  if (!userData) {
    return makeErrorOrData("User not found", 404);
  }

  return { data: userData };
}
