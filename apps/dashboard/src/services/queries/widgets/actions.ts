import { createSupabaseBrowserClient } from "@/lib/utils/supabase/browser-client";
import { SaveLayoutPayload } from "./types";

export const syncLayoutAction = async (payload: SaveLayoutPayload) => {
  const supabase = createSupabaseBrowserClient();
  const { layoutData, widgetData } = payload;
  // Upsert layout - update if exists, insert if not

  const { data: savedLayout, error: layoutError } = await supabase
    .from("layouts")
    .upsert(layoutData)
    .select()
    .single();

  if (layoutError) {
    console.log("Error saving layout:", layoutError);
    throw new Error(layoutError.message);
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
  }));

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

export const getLayoutsAction = async () => {
  const supabase = createSupabaseBrowserClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Please login to view your layouts.");
  }

  const { data, error } = await supabase
    .from("layouts")
    .select(
      `
    id,
    name,
    widgets ( id,  token, meta, props, layout_id )
  `
    )
    .eq("user_id", user.id);

  if (error) {
    console.log("Error getting Layouts:", error);
    throw new Error(error.message);
  }

  return {
    layouts: data,
  };
};
