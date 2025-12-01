import { createSupabaseBrowserClient } from "@/lib/utils/supabase/browser-client";

export interface UpdateExchangePayload {
  exchange: string;
}

export const updateExchangeAction = async (payload: UpdateExchangePayload) => {
  const supabase = createSupabaseBrowserClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.user) {
    throw new Error("Please login to update exchange.");
  }

  const { data, error } = await supabase
    .from("dashboard_settings")
    .update({ exchange: payload.exchange })
    .match({ user_id: session?.user?.id })
    .select()
    .single();

  if (error) {
    console.log("Error updating exchange:", error);
    throw new Error(error.message);
  }

  return data;
};
