import { createSupabaseBrowserClient } from "@/lib/utils/supabase/browser-client";
import { IDashboardData } from "../home/types";

export const updateSettingsAction = async (
  newSetting: IDashboardData["settings"],
  signal?: AbortSignal
) => {
  const supabase = createSupabaseBrowserClient();

  if (signal?.aborted) {
    return;
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Please login to update settings.");
  }

  if (signal?.aborted) {
    return;
  }

  const { data, error } = await supabase
    .from("dashboard_settings")
    .update(newSetting)
    .match({ id: newSetting.id })
    .select()
    .single();

  if (error) {
    console.log("Error updating settings:", error);
    throw new Error(error.message);
  }

  return data;
};
