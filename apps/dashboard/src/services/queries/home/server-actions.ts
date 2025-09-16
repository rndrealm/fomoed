import { v4 as uuidv4 } from "uuid";
import { createSupabaseBrowserClient } from "@/lib/utils/supabase/browser-client";
import { widgetPropsDefaults } from "@/lib/static"; 

const createDefaultWidgets = () => {
  const priceChartSlug = "new-price-history";
  const tradingEconomicSlug = "trading-economics";
  const whaleTransactionSlug = "whale-transaction-tracker";
  const cfgiSlug = "cfgi";
  const newsSlug = "token-news";

  const priceChartDefaults = widgetPropsDefaults[priceChartSlug];
  const tradingEconomicDefaults = widgetPropsDefaults[tradingEconomicSlug];
  const whaleTransactionDefaults = widgetPropsDefaults[whaleTransactionSlug];
  const cfgiDefaults = widgetPropsDefaults[cfgiSlug];
  const newsDefaults = widgetPropsDefaults[newsSlug];

  const priceChartId = uuidv4();
  const tradingEconomicId = uuidv4();
  const whaleTransactionId = uuidv4();
  const cfgiId = uuidv4();
  const newsId = uuidv4();

  const widgetIdJoin = "@/$";

  return [
    {
      id: priceChartId,
      token: priceChartSlug,
      props: priceChartDefaults,
      meta: {
        i: `${priceChartId}${widgetIdJoin}${priceChartSlug}`,
        x: 0, y: 0, 
        ...priceChartDefaults.meta,
      },
    },
    {
      id: tradingEconomicId,
      token: tradingEconomicSlug,
      props: tradingEconomicDefaults,
      meta: {
        i: `${tradingEconomicId}${widgetIdJoin}${tradingEconomicSlug}`,
        x: 8, y: 0, 
        ...tradingEconomicDefaults.meta,
      },
    },
    {
      id: whaleTransactionId,
      token: whaleTransactionSlug,
      props: whaleTransactionDefaults,
      meta: {
        i: `${whaleTransactionId}${widgetIdJoin}${whaleTransactionSlug}`,
        x: 0, y: 4,
        ...whaleTransactionDefaults.meta,
      },
    },
    {
      id: cfgiId,
      token: cfgiSlug,
      props: cfgiDefaults,
      meta: {
        i: `${cfgiId}${widgetIdJoin}${cfgiSlug}`,
        x: 8, y: 4, 
        ...cfgiDefaults.meta,
      },
    },
    {
      id: newsId,
      token: newsSlug,
      props: newsDefaults,
      meta: {
        i: `${newsId}${widgetIdJoin}${newsSlug}`,
        x: 12, y: 4, 
        ...newsDefaults.meta,
      },
    },    
  ];
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
    .select("id, user_id, auto_save, active_tab_id, favorite_widgets, favorite_tokens")
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

  console.log("ONBOARDED KAH MAIIEESS " + user.onboarded);
  console.log("USER MANIEZ" + user);
  console.log("DATA LENGTH MANIEZ " + layoutData);
  console.log("DATA LENGTH MANIMANIEZ " + layoutData.length);

  if (user && !user.onboarded && layoutData && layoutData.length===0) {
    const { data: newLayout, error: newLayoutError } = await supabase
      .from("layouts")
      .insert({ user_id: userId, name: "Default Dashboard" })
      .select("id, name, draft")
      .single();
    
    console.log("MAAAAAAAAAASSSSSSSSUUUUUUUUUUUUUUUUUUUUKKKKKKKKKKKKKKKKkkkk")

    if (newLayoutError) {
      console.error("Error creating default layout:", newLayoutError);
      throw new Error(newLayoutError.message);
    }

    const widgetsToInsert = createDefaultWidgets().map((widget) => ({
      ...widget,
      layout_id: newLayout.id,
      user_id: userId
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

  const { data: existingTabs, error: tabsError } = await supabase
    .from("tabs")
    .select("id, name, layout_id, layouts (id, name, draft, widgets (id, meta, props, layout_id))")
    .eq("user_id", userId);

  if (tabsError) {
    throw new Error(tabsError.message);
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
