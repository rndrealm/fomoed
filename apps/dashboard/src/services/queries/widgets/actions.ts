import { createSupabaseBrowserClient } from "@/lib/utils/supabase/browser-client";
import { SaveLayoutPayload } from "./types";

export const syncLayoutAction = async (
  payload: SaveLayoutPayload,
  signal?: AbortSignal,
) => {
  const supabase = createSupabaseBrowserClient();

  if (signal?.aborted) {
    return;
  }

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.user) {
    throw new Error("Please login to view your tabs.");
  }
  const { layoutData, widgetData } = payload;
  // Upsert layout - update if exists, insert if not

  if (signal?.aborted) {
    return;
  }

  const { data: savedLayout, error: layoutError } = await supabase
    .from("layouts")
    .upsert({ ...layoutData, user_id: session?.user?.id })
    .select()
    .single();

  if (layoutError) {
    console.log("Error saving layout:", layoutError);
    throw new Error(layoutError.message);
  }

  if (signal?.aborted) {
    return;
  }

  // Fetch existing widgets for this layout
  const { data: existingWidgets } = await supabase
    .from("widgets")
    .select("id")
    .eq("layout_id", savedLayout.id);

  // Get current widget IDs from the payload
  const currentWidgetIds = widgetData.map((widget) => widget.id);

  // Find widgets to delete (widgets that exist in DB but not in current state)
  const widgetsToDeleteIds =
    existingWidgets
      ?.filter((widget) => !currentWidgetIds.includes(widget.id))
      .map((widget) => widget.id) || [];

  // Delete widgets that were removed on the frontend
  if (widgetsToDeleteIds.length > 0) {
    await supabase.from("widgets").delete().in("id", widgetsToDeleteIds);
  }

  // Ensure all widgets reference the correct layout
  const widgetsToSave = payload.widgetData.map((widget) => ({
    ...widget,
    layout_id: savedLayout.id,
    user_id: session?.user?.id,
  }));

  if (signal?.aborted) {
    return;
  }

  // Upsert widget - update if exists, insert if not
  const { data: savedWidget, error: widgetError } = await supabase
    .from("widgets")
    .upsert(widgetsToSave)
    .select();

  if (widgetError) {
    console.log("Error saving widget:", layoutError);
    throw new Error(widgetError.message);
  }
  return {
    layout: savedLayout,
    widget: savedWidget,
  };
};
export const saveLayoutAction = async (
  payload: SaveLayoutPayload,
  signal?: AbortSignal,
) => {
  const supabase = createSupabaseBrowserClient();

  if (signal?.aborted) {
    return;
  }

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.user) {
    throw new Error("Please login to view your tabs.");
  }
  const { layoutData, widgetData } = payload;
  // Upsert layout - update if exists, insert if not

  if (signal?.aborted) {
    return;
  }

  const { data: savedLayout, error: layoutError } = await supabase
    .from("layouts")
    .upsert({ ...layoutData, user_id: session?.user?.id, draft: false })
    .select()
    .single();

  if (layoutError) {
    console.log("Error saving layout:", layoutError);
    throw new Error(layoutError.message);
  }

  if (signal?.aborted) {
    return;
  }

  // Fetch existing widgets for this layout
  const { data: existingWidgets } = await supabase
    .from("widgets")
    .select("id")
    .eq("layout_id", savedLayout.id);

  // Get current widget IDs from the payload
  const currentWidgetIds = widgetData.map((widget) => widget.id);

  // Find widgets to delete (widgets that exist in DB but not in current state)
  const widgetsToDeleteIds =
    existingWidgets
      ?.filter((widget) => !currentWidgetIds.includes(widget.id))
      .map((widget) => widget.id) || [];

  // Delete widgets that were removed on the frontend
  if (widgetsToDeleteIds.length > 0) {
    await supabase.from("widgets").delete().in("id", widgetsToDeleteIds);
  }

  // Ensure all widgets reference the correct layout
  const widgetsToSave = payload.widgetData.map((widget) => ({
    ...widget,
    layout_id: savedLayout.id,
    user_id: session?.user?.id,
  }));

  if (signal?.aborted) {
    return;
  }

  // Upsert widget - update if exists, insert if not
  const { data: savedWidget, error: widgetError } = await supabase
    .from("widgets")
    .upsert(widgetsToSave)
    .select();

  if (widgetError) {
    console.log("Error saving widget:", layoutError);
    throw new Error(widgetError.message);
  }
  return {
    layout: savedLayout,
    widget: savedWidget,
  };
};

export const getUserTabsAction = async () => {
  const supabase = createSupabaseBrowserClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.user) {
    throw new Error("Please login to view your tabs.");
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
    `,
    )
    .eq("user_id", session?.user?.id);

  if (tabsError) {
    console.log("Error fetching tabs:", tabsError);
    throw new Error(tabsError.message);
  }

  // If user has tabs, return them
  if (existingTabs && existingTabs.length > 0) {
    return {
      tabs: existingTabs,
    };
  }

  // // User has no tabs, create a default tab and layout
  // const defaultLayout = {
  //   name: "Default Layout",
  //   user_id: user.id,
  //   draft: true,
  // };

  // // Insert the default layout
  // const { data: newLayout, error: layoutError } = await supabase
  //   .from("layouts")
  //   .insert(defaultLayout)
  //   .select()
  //   .single();

  // if (layoutError) {
  //   console.log("Error creating default layout:", layoutError);
  //   throw new Error(layoutError.message);
  // }

  // Create a default tab linked to the new layout
  const defaultTab = {
    name: "Untitled Layout",
    user_id: session?.user?.id,
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
    `,
    )
    .single();

  if (newTabError) {
    console.log("Error creating default tab:", newTabError);
    throw new Error(newTabError.message);
  }

  return {
    tabs: [newTab],
  };
};

export const attachLayoutToTabAction = async (
  tabId: string,
  layoutId: string,
  signal?: AbortSignal,
) => {
  const supabase = createSupabaseBrowserClient();

  if (signal?.aborted) {
    return;
  }

  // Get the current user
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.user) {
    throw new Error("Please login to attach a layout to a tab.");
  }

  if (signal?.aborted) {
    return;
  }

  // Update the tab to reference the provided layout
  const { data: updatedTab, error: updateError } = await supabase
    .from("tabs")
    .update({ layout_id: layoutId })
    .eq("id", tabId)
    .eq("user_id", session?.user?.id)
    .select()
    .single();

  if (updateError) {
    console.log("Error attaching layout to tab:", updateError);
    throw new Error(updateError.message);
  }

  return {
    tab: updatedTab,
  };
};
