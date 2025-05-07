import { createSupabaseBrowserClient } from "@/lib/utils/supabase/browser-client";
import { PostgrestSingleResponse } from "@supabase/supabase-js";
import { ISubscription } from "./types";

export const getActivePlan = async () => {
  const supabase = createSupabaseBrowserClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Please login.");
  }

  const {
    data: subscriptions,
    error: sub_error,
  }: PostgrestSingleResponse<ISubscription[]> = await supabase
    .from("subscriptions")
    .select()
    .eq("user_id", user.id);

  if (sub_error) {
    console.log("Error retrieving subscriptions!");

    throw new Error(sub_error.message);
  }

  const subs = subscriptions.filter(
    (sub) => new Date(sub.end_timestamp).getTime() > Date.now()
  );

  if (subs.find((i) => i.plan_name === "plus")) {
    return { plan: "plus", hasPlan: subs.length > 0 };
  }

  if (subs.find((i) => i.plan_name === "pro")) {
    return { plan: "pro", hasPlan: subs.length > 0 };
  }

  return { plan: null, hasPlan: subs.length > 0 };
};
