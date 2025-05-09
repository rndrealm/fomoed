import { LayoutType } from "@/lib/atoms/layoutAtom";
import { createSupabaseBrowserClient } from "@/lib/utils/supabase/browser-client";

export const createLayoutAndAttachToTabAction = async ({
  layoutData,
  widgetData,
  tabId,
}: {
  layoutData: { id: string; name: string; draft: boolean };
  widgetData: LayoutType["widgets"][0]; // Single widget
  tabId: string;
}) => {
  const supabase = createSupabaseBrowserClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Please login to add widgets.");
  }

  // Create new layout
  const { data: savedLayout, error: layoutError } = await supabase
    .from("layouts")
    .insert({ ...layoutData, user_id: user.id })
    .select()
    .single();

  if (layoutError) {
    console.log("Error creating layout:", layoutError);
    throw new Error(layoutError.message);
  }

  // Save the widget with the new layout ID
  const widgetToSave = {
    ...widgetData,
    layout_id: savedLayout.id,
    user_id: user.id,
  };

  const { error: widgetError } = await supabase
    .from("widgets")
    .insert(widgetToSave);

  if (widgetError) {
    console.log("Error saving widget:", widgetError);
    throw new Error(widgetError.message);
  }

  // Update the tab with the new layout ID
  const { data: updatedTab, error: tabError } = await supabase
    .from("tabs")
    .update({ layout_id: savedLayout.id })
    .eq("id", tabId)
    .select()
    .single();

  if (tabError) {
    console.log("Error updating tab:", tabError);
    throw new Error(tabError.message);
  }

  return {
    layout: savedLayout,
    tab: updatedTab,
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
    draft,
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

export const deleteLayoutAction = async (layoutId: string) => {
  const supabase = createSupabaseBrowserClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Please login to delete a layout.");
  }

  // Delete widgets linked to the layout
  const { error: widgetDeleteError } = await supabase
    .from("widgets")
    .delete()
    .match({ layout_id: layoutId });

  if (widgetDeleteError) {
    console.error("Error deleting widgets:", widgetDeleteError);
    throw new Error(widgetDeleteError.message);
  }

  // Unlink layout from any associated tabs
  const { error: tabUpdateError } = await supabase
    .from("tabs")
    .update({ layout_id: null })
    .match({ layout_id: layoutId, user_id: user.id });

  if (tabUpdateError) {
    console.error("Error updating tabs:", tabUpdateError);
    throw new Error(tabUpdateError.message);
  }

  // Delete the layout itself
  const { error: layoutDeleteError } = await supabase
    .from("layouts")
    .delete()
    .match({ id: layoutId, user_id: user.id });

  if (layoutDeleteError) {
    console.error("Error deleting layout:", layoutDeleteError);
    throw new Error(layoutDeleteError.message);
  }
};

export const updateLayoutNameAction = async ({
  layoutId,
  newName,
}: {
  layoutId: string;
  newName: string;
}) => {
  const supabase = createSupabaseBrowserClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Please login to update a layout.");
  }

  const { data, error } = await supabase
    .from("layouts")
    .update({ name: newName })
    .match({ id: layoutId, user_id: user.id })
    .select()
    .single();

  if (error) {
    console.error("Error updating layout name:", error);
    throw new Error(error.message);
  }

  return data;
};
