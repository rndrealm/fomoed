import { v4 as uuidv4 } from "uuid";
import { createSupabaseBrowserClient } from "@/lib/utils/supabase/browser-client";
import { widgetPropsDefaults } from "@/lib/static";

const createGuestDefaultWidgets = () => {
  return createDefaultDashboardWidgets();
};

const createDefaultDashboardWidgets = () => {
  const widgetIdJoin = "@/$";

  const widgets = [
    { slug: "order-book", x: 0, y: 0 },
    { slug: "cfgi", x: 4, y: 0 },
    { slug: "coin-stats", x: 8, y: 0 },
    { slug: "btc-dominance", x: 12, y: 0 },
    { slug: "new-price-history", x: 0, y: 4 },
    { slug: "summary", x: 8, y: 4 },
  ];

  return widgets.map(({ slug, x, y }) => {
    const id = uuidv4();
    const defaults = widgetPropsDefaults[slug as keyof typeof widgetPropsDefaults];
    return {
      id,
      token: slug,
      props: defaults,
      meta: {
        ...defaults.meta,
        i: `${id}${widgetIdJoin}${slug}`,
        x,
        y,
      },
    };
  });
};

const createDefaultWidgets = () => {
  return createDefaultDashboardWidgets();
};

// Guest dashboard data for unauthenticated users
export const getGuestDashboardData = () => {
  const guestLayoutId = "guest-layout";
  const guestTabId = "guest-tab";
  const widgets = createGuestDefaultWidgets();

  const layout = {
    id: guestLayoutId,
    name: "Guest Dashboard",
    draft: false,
    widgets: widgets.map((w) => ({
      ...w,
      layout_id: guestLayoutId,
    })),
  };

  const tab = {
    id: guestTabId,
    name: "Main",
    layout_id: guestLayoutId,
    layouts: {
      ...layout,
      widgets: widgets.map((w) => ({
        id: w.id,
        meta: w.meta,
        props: w.props,
        layout_id: guestLayoutId,
      })),
    },
  };

  const settings = {
    id: "guest-settings",
    user_id: null,
    auto_save: false,
    active_tab_id: guestTabId,
    favorite_widgets: [],
    favorite_tokens: [],
    exchange: null,
  };

  return {
    tabs: [tab],
    layouts: [layout],
    settings,
  };
};

export const getDashboardDataClient = async (userId: string) => {
  const supabase = createSupabaseBrowserClient();

  const { data: user, error: userError } = await supabase
    .from("users")
    .select("onboarded")
    .eq("user_id", userId)
    .single();

  if (userError) {
    console.error("Error fetching user:", userError);
    throw new Error(userError.message);
  }

  const { data: layoutData, error: layoutError } = await supabase
    .from("layouts")
    .select("id, name, draft, widgets ( id, token, meta, props, layout_id )")
    .eq("user_id", userId);

  if (layoutError) {
    console.error("Error getting Layouts:", layoutError);
    throw new Error(layoutError.message);
  }

  let returnSettings;
  const { data: settingsData, error: settingsError } = await supabase
    .from("dashboard_settings")
    .select("id, user_id, auto_save, active_tab_id, favorite_widgets, favorite_tokens, exchange")
    .eq("user_id", userId);

  if (settingsError) {
    console.error("Error getting dashboard settings:", settingsError);
    throw new Error(settingsError.message);
  }

  if (settingsData.length === 0) {
    const defaultSettings = {
      id: uuidv4(),
      user_id: userId,
      auto_save: true,
      active_tab_id: null,
      favorite_widgets: [],
      favorite_tokens: [],
    };
    const { error: insertError } = await supabase.from("dashboard_settings").insert(defaultSettings);
    if (insertError) {
      console.error("Error creating default settings:", insertError);
      throw new Error(insertError.message);
    }
    returnSettings = defaultSettings;
  } else {
    returnSettings = settingsData[0];
  }

  const { data: existingTabs, error: tabsError } = await supabase
    .from("tabs")
    .select("id, name, layout_id, layouts (id, name, draft, widgets (id, meta, props, layout_id))")
    .eq("user_id", userId);

  if (tabsError) {
    throw new Error(tabsError.message);
  }

  if (user && !user.onboarded && layoutData && layoutData.length === 0 && existingTabs.length === 0) {
    const { data: newLayout, error: newLayoutError } = await supabase
      .from("layouts")
      .insert({ user_id: userId, name: "Default Dashboard" })
      .select("id, name, draft")
      .single();

    if (newLayoutError) {
      console.error("Error creating default layout:", newLayoutError);
      throw new Error(newLayoutError.message);
    }

    const widgetsToInsert = createDefaultWidgets().map((widget) => ({
      ...widget,
      layout_id: newLayout.id,
      user_id: userId,
    }));

    const { data: newWidgetsFromDb, error: newWidgetsError } = await supabase
      .from("widgets")
      .insert(widgetsToInsert)
      .select();

    if (newWidgetsError) {
      console.error("Error creating default widgets:", newWidgetsError);
      throw new Error(newWidgetsError.message);
    }

    const { data: newTab, error: newTabError } = await supabase
      .from("tabs")
      .insert({ name: "Main", user_id: userId, layout_id: newLayout.id })
      .select()
      .single();

    if (newTabError) {
      console.error("Error creating default tab:", newTabError);
      throw new Error(newTabError.message);
    }

    const widgetsForTab = newWidgetsFromDb.map((w) => ({
      id: w.id,
      meta: w.meta,
      props: w.props,
      layout_id: w.layout_id,
    }));

    const widgetsForTopLevelLayout = newWidgetsFromDb.map((w) => ({
      id: w.id,
      token: w.token,
      meta: w.meta,
      props: w.props,
      layout_id: w.layout_id,
    }));

    const layoutForTab = { ...newLayout, widgets: widgetsForTab };
    const finalLayout = { ...newLayout, widgets: widgetsForTopLevelLayout };

    const finalTab = { ...newTab, layouts: layoutForTab };

    return {
      tabs: [{ ...finalTab, name: finalTab.name || "" }],
      layouts: [finalLayout],
      settings: returnSettings,
    };
  }

  if (existingTabs && existingTabs.length > 0) {
    return {
      tabs: existingTabs.map((tb) => ({ ...tb, name: tb.name || "" })),
      layouts: layoutData,
      settings: returnSettings,
    };
  }

  const { data: newBlankTab, error: newTabError } = await supabase
    .from("tabs")
    .insert({ name: "Untitled Layout", user_id: userId, layout_id: null })
    .select("id, name, layout_id, layouts(*, widgets(*))")
    .single();

  if (newTabError) {
    throw new Error(newTabError.message);
  }

  return {
    tabs: [{ ...newBlankTab, name: newBlankTab.name || "" }],
    layouts: layoutData,
    settings: returnSettings,
  };
};
