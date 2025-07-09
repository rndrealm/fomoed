import { createSupabaseServerComponentClient } from "@/lib/utils/supabase/server-client";
// import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import { redirect } from "next/navigation";
import { AppRoutes } from "@/lib/routes";
// import { UserGeoLocation } from "../geolocation/types";

export const getDashboardData = async () => {
  // const res: UserGeoLocation = (await axios.get("https://ipinfo.io/json")).data;
  const supabase = await createSupabaseServerComponentClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(AppRoutes.auth.login.path);
  }

  // Try to fetch existing layouts for the user
  const { data: layoutData, error: layoutError } = await supabase
    .from("layouts")
    .select(
      `
        id,
        name,
        draft,
        widgets ( id,  token, meta, props, layout_id )
    `
    )
    .eq("user_id", user.id);

  if (layoutError) {
    console.log("Error getting Layouts:", layoutError);
    throw new Error(layoutError.message);
  }
  let returnSettings;
  //   Try to fetch existing user settings
  const { data: settingsData, error: settingsError } = await supabase
    .from("dashboard_settings")
    .select(
      `
        id,
        user_id,
        auto_save,
        active_tab_id,
        favorite_widgets,
        favorite_tokens
      `
    )
    .eq("user_id", user.id);

  if (settingsError) {
    console.log("Error getting dashboard settings:", settingsError);
    throw new Error(settingsError.message);
  }
  if (settingsData.length === 0) {
    // Create default settings if none exist
    const defaultSettings = {
      id: uuidv4(),
      user_id: user.id,
      auto_save: true,
      active_tab_id: null,
      favorite_widgets: [],
      favorite_tokens: [],
    };

    const { error: insertError } = await supabase.from("dashboard_settings").insert(defaultSettings);

    if (insertError) {
      console.log("Error creating default settings:", insertError);
      throw new Error(insertError.message);
    }
    returnSettings = defaultSettings;
  } else {
    returnSettings = settingsData[0];
  }

  // Try to fetch existing tabs for the user
  const { data: existingTabs, error: tabsError } = await supabase
    .from("tabs")
    .select(
      `
      id,
      name,
      layout_id,
      layouts (
        id,
        name,
        draft,
        widgets (id,  meta, props, layout_id)
      )
    `
    )
    .eq("user_id", user.id);

  if (tabsError) {
    console.log("Error fetching tabs:", tabsError);
    throw new Error(tabsError.message);
  }

  // If user has tabs, return them
  if (existingTabs && existingTabs.length > 0) {
    return {
      tabs: existingTabs.map((tb) => ({
        ...tb,
        name: tb.name || "",
      })),
      layouts: layoutData,
      settings: returnSettings,
      // location: res,
    };
  }

  // Create a default tab linked to the new layout
  const defaultTab = {
    name: "Untitled Layout",
    user_id: user.id,
    layout_id: null,
  };

  const { data: newTab, error: newTabError } = await supabase
    .from("tabs")
    .insert(defaultTab)
    .select(
      `
      id,
      name,
      layout_id,
      layouts (
        id,
        name,
        draft,
        widgets (id, props, meta, layout_id)
      )
    `
    )
    .single();

  if (newTabError) {
    console.log("Error creating default tab:", newTabError);
    throw new Error(newTabError.message);
  }

  return {
    tabs: [{ ...newTab, name: newTab.name || "" }],
    layouts: layoutData,
    settings: returnSettings,
    // location: res,
  };
};
