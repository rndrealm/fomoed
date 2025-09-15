import { createSupabaseBrowserClient } from "@/lib/utils/supabase/browser-client";
import { AddTabPayload, SyncTabsPayload } from "./types";

// Db action to get all tabs for a user
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

// Db action to add a new tab
export const addTabAction = async (body: AddTabPayload) => {
  const supabase = createSupabaseBrowserClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.user) {
    throw new Error("Please login to add a tab.");
  }

  const newTab = {
    id: body.id,
    name: body.name,
    user_id: session?.user?.id,
    layout_id: null,
  };

  const { data: addedTab, error: addTabError } = await supabase
    .from("tabs")
    .insert(newTab)
    .select(
      `
      id,
      name,
      layout_id,
      layouts (
        id,
        name,
        draft,
        widgets (id, meta, props, layout_id)
      )
    `,
    )
    .single();

  if (addTabError) {
    console.log("Error creating new tab:", addTabError);
    throw new Error(addTabError.message);
  }

  return addedTab;
};

// Db action to rename a tab
export const deleteTabAction = async (tabId: string) => {
  const supabase = createSupabaseBrowserClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.user) {
    throw new Error("Please login to delete a tab.");
  }

  // Verify the tab belongs to the user before deleting
  const { error: deleteError } = await supabase.from("tabs").delete().match({ id: tabId, user_id: session?.user?.id });

  if (deleteError) {
    console.log("Error deleting tab:", deleteError);
    throw new Error(deleteError.message);
  }

  return { success: true, deletedId: tabId };
};

export const replaceUserTabsAction = async (localTabs: SyncTabsPayload, signal?: AbortSignal) => {
  const supabase = createSupabaseBrowserClient();

  if (signal?.aborted) {
    return;
    // throw new DOMException("Aborted", "AbortError");
  }

  const {
    data: { session },
    error: userError,
  } = await supabase.auth.getSession();

  if (!session?.user) {
    throw new Error("Please login to replace tabs.");
  }

  if (signal?.aborted) {
    return;
    // throw new DOMException("Aborted", "AbortError");
  }

  const { error: deleteError } = await supabase.from("tabs").delete().match({ user_id: session?.user?.id });

  if (deleteError) {
    throw new Error(deleteError.message);
  }

  if (signal?.aborted) {
    return;
    // throw new DOMException("Aborted", "AbortError");
  }

  const tabsToInsert = localTabs.map((tab) => ({
    id: tab.id,
    name: tab.name,
    user_id: session?.user?.id,
    layout_id: tab.layout_id ?? null,
  }));

  const { data: insertedTabs, error: insertError } = await supabase
    .from("tabs")
    .upsert(tabsToInsert, { onConflict: "id" });

  if (insertError) {
    throw new Error(insertError.message);
  }

  return {
    tabs: insertedTabs,
  };
};

export const replaceUsername = async ({ username }: { username: string }) => {
  const supabase = createSupabaseBrowserClient();

  const {
    data: { session },
    error: userError,
  } = await supabase.auth.getSession();

  if (!session?.user) {
    throw new Error("Please login to update username.");
  }

  if (userError) {
    throw new Error(userError.message);
  }

  const { data: newUsername, error: renameError } = await supabase
    .from("users")
    .update({ username })
    .eq("user_id", session.user.id)
    .select()
    .single();

  if (renameError) {
    throw new Error(renameError.message);
  }

  return newUsername;
};
