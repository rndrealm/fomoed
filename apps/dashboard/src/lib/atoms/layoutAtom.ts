import { atom } from "jotai";
import { getGridPosition } from "@/charts/helpers";
import { v4 as uuidv4 } from "uuid";
import { splitWidgetSlug } from "../utils";
import { activeTabAtom, tabsAtom } from "./tabsAtom";
import { createLayoutAndAttachToTabAction } from "@/services/queries/layouts/actions";
import { syncLayoutAction } from "@/services/queries/widgets/actions";
import { SaveLayoutPayload } from "@/services/queries/widgets/types";
import { settingAtom } from "./settingsAtom";

export interface LayoutType {
  id: string;
  draft: boolean;
  name: string;
  widgets: {
    id: string;
    meta: ReactGridLayout.Layout;
    props: {
      token?: string;
      period?: string;
      exchange_token?: string;
      sentiment_tab?: string;
    };
  }[];
}

export const layoutAtom = atom<LayoutType[]>([]);

// This function creates a new layout, adds a new widget to it, saves it to the local state and sends it to the db
export const addWidgetToNewLayoutAtom = atom(
  null,
  (get, set, { newWidget }: { newWidget: LayoutType["widgets"][0] }) => {
    // Get active tab and update its layout_id
    const activeTab = get(activeTabAtom);
    const tabs = get(tabsAtom);

    if (activeTab) {
      // Create a new layout with a unique ID
      const layoutName = activeTab.name;
      const layoutId = uuidv4();
      const newLayout: LayoutType = {
        id: layoutId,
        draft: true,
        name: layoutName,
        widgets: [newWidget],
      };

      const sendLayout = {
        id: layoutId,
        draft: true,
        name: layoutName,
      };

      // Get current layouts and add the new one
      const currentLayouts = get(layoutAtom);
      const updatedLayouts = [...currentLayouts, newLayout];

      // Update layouts atom
      set(layoutAtom, updatedLayouts);

      const updatedActiveTab = {
        ...activeTab,
        layout_id: newLayout.id,
      };

      // Update active tab
      set(activeTabAtom, updatedActiveTab);

      // Update tab in the tabs array
      const updatedTabs = tabs.map((tab) =>
        tab.id === activeTab.id ? updatedActiveTab : tab
      );

      set(tabsAtom, updatedTabs);

      set(saveNewLayoutToDb, {
        layoutData: sendLayout,
        widgetData: newWidget,
        tabId: activeTab.id,
      });
    }
  }
);

// This function saves the new layout to the database
// It is called when a new layout is created and a widget is added to it
export const saveNewLayoutToDb = atom(
  null,
  async (
    get,
    set,
    {
      layoutData,
      widgetData,
      tabId,
    }: { layoutData: any; widgetData: any; tabId: string }
  ) => {
    try {
      await createLayoutAndAttachToTabAction({ layoutData, widgetData, tabId });
    } catch (error) {
      console.log("Failed to sync tabs with DB:", error);
    }
  }
);

// This function loads the layouts from the API and updates the local state
export const loadLayoutsFromApiAtom = atom(
  null,
  (get, set, layoutsFromApi: LayoutType[]) => {
    // Update tabs state directly
    set(layoutAtom, layoutsFromApi);
  }
);

// This function adds a widget to an existing layout
export const addWidgetToExistingLayoutAtom = atom(
  null,
  (
    get,
    set,
    {
      widget,
      layoutId,
      sync,
    }: { widget: LayoutType["widgets"][0]; layoutId: string; sync: boolean }
  ) => {
    // Get the current layouts
    const layouts = get(layoutAtom);

    // Find the layout with the specified ID
    const layoutIndex = layouts.findIndex((layout) => layout.id === layoutId);

    // If layout doesn't exist, return
    if (layoutIndex === -1) {
      console.log(`Layout with ID ${layoutId} not found.`);
      return;
    }

    // Get the current layout
    const currentLayout = layouts[layoutIndex];

    // Add the new widget to the layout's widgets array
    const updatedWidgets = [...currentLayout.widgets, widget];

    // Create updated layouts array
    const updatedLayouts = [...layouts];
    updatedLayouts[layoutIndex] = {
      ...currentLayout,
      widgets: updatedWidgets,
    };

    // Update the layouts atom with the new state
    set(layoutAtom, updatedLayouts);
    if (sync) {
      set(syncWidgetsToDb, {
        layoutData: {
          id: currentLayout.id,
          name: currentLayout.name,
        },
        widgetData: updatedWidgets,
      });
    }
  }
);

// This function syncs the layout changes to the database
// It is called when the layout position is changed in the dashboard
export const syncOnLayoutChange = atom(
  null,
  (
    get,
    set,
    {
      newLayouts,
      sync,
    }: { newLayouts: ReactGridLayout.Layout[]; sync: boolean }
  ) => {
    // Get the active tab
    const activeTab = get(activeTabAtom);

    // If no active tab, return early
    if (!activeTab) {
      return;
    }

    // Get the layout_id from the active tab
    const layoutId = activeTab.layout_id;

    // Get current layouts
    const layouts = get(layoutAtom);

    // Find the layout with matching layout_id
    const layoutIndex = layouts.findIndex((layout) => layout.id === layoutId);

    // If layout doesn't exist, return
    if (layoutIndex === -1) {
      return;
    }

    // Get the current layout
    const currentLayout = layouts[layoutIndex];

    // Update widgets meta with the new layout data
    const updatedWidgets = currentLayout.widgets.map((widget) => {
      // Find the corresponding layout from newLayouts
      const newLayoutData = newLayouts.find(
        (layout) => splitWidgetSlug(layout.i).widgetId === widget.id
      );
      console.log("newLayoutData check:", newLayoutData);
      // If we found matching layout data, update the widget's meta
      if (newLayoutData) {
        return {
          ...widget,
          meta: {
            ...widget.meta,
            ...newLayoutData, // Updates x, y, w, h, etc.
          },
        };
      }

      // Otherwise return the widget unchanged
      return widget;
    });

    // Create updated layouts array
    const updatedLayouts = [...layouts];
    updatedLayouts[layoutIndex] = {
      ...currentLayout,
      widgets: updatedWidgets,
    };
    // Update layouts with the updated widgets
    set(layoutAtom, updatedLayouts);

    if (sync) {
      set(syncWidgetsToDb, {
        layoutData: {
          id: currentLayout.id,
          name: currentLayout.name,
        },
        widgetData: updatedWidgets,
      });
    }
  }
);

// This function deletes a widget from the layout
// It is called when a widget is removed from the dashboard
export const deleteWidgetAtom = atom(
  null,
  (get, set, { tabId, widgetId }: { tabId: string; widgetId: string }) => {
    // Get current tabs and layouts
    const tabs = get(tabsAtom);
    const layouts = get(layoutAtom);

    // Find the tab with matching tabId
    const tab = tabs.find((tab) => tab.id === tabId);

    // If tab doesn't exist, return
    if (!tab) {
      return;
    }

    // Get the layout_id from the tab
    const layoutId = tab.layout_id;

    // Find the layout with matching layout_id
    const layoutIndex = layouts.findIndex((layout) => layout.id === layoutId);

    // If layout doesn't exist, return
    if (layoutIndex === -1) {
      return;
    }

    // Get the current layout
    const currentLayout = layouts[layoutIndex];

    // Filter out the widget to remove
    const updatedWidgets = currentLayout.widgets.filter(
      (widget) => widget.id !== widgetId
    );

    // Rearrange the remaining widgets using getGridPosition
    const rearrangedWidgets = updatedWidgets.map((widget, index) => {
      const { x, y } = getGridPosition(index);
      return {
        ...widget,
        meta: {
          ...widget.meta,
          x,
          y,
        },
      };
    });

    // Create updated layouts array
    const updatedLayouts = [...layouts];
    updatedLayouts[layoutIndex] = {
      ...currentLayout,
      widgets: rearrangedWidgets,
    };

    // Update layouts with the updated widget list
    set(layoutAtom, updatedLayouts);
    const dashboardSetting = get(settingAtom);
    const syncCondition = dashboardSetting.auto_save || currentLayout?.draft;

    if (syncCondition) {
      set(syncWidgetsToDb, {
        layoutData: {
          id: currentLayout.id,
          name: currentLayout.name,
        },
        widgetData: updatedWidgets,
      });
    }
  }
);

// This function updates the props of a widget in the layout including the token, period etc
export const updateWidgetPropsAtom = atom(
  null,
  (
    get,
    set,
    {
      tabId,
      widgetId,
      widgetProps,
    }: {
      tabId: string;
      widgetId: string;
      widgetProps: LayoutType["widgets"][0]["props"];
    }
  ) => {
    // Get current tabs and layouts
    const tabs = get(tabsAtom);
    const layouts = get(layoutAtom);

    // Find the tab with matching tabId
    const tab = tabs.find((tab) => tab.id === tabId);

    // If tab doesn't exist, return
    if (!tab) {
      return;
    }

    // Get the layout_id from the tab
    const layoutId = tab.layout_id;

    // Find the layout with matching layout_id
    const layoutIndex = layouts.findIndex((layout) => layout.id === layoutId);

    // If layout doesn't exist, return
    if (layoutIndex === -1) {
      return;
    }

    // Get the current layout
    const currentLayout = layouts[layoutIndex];

    // Find the widget to update
    const widgetIndex = currentLayout.widgets.findIndex(
      (widget) => widget.id === widgetId
    );

    // Check if the widget exists
    if (widgetIndex === -1) {
      return; // Widget not found
    }

    // Create updated widget with new token
    const updatedWidget = {
      ...currentLayout.widgets[widgetIndex],
      props: widgetProps,
    };

    // Create updated widgets array
    const updatedWidgets = [...currentLayout.widgets];
    updatedWidgets[widgetIndex] = updatedWidget;

    // Create updated layouts array
    const updatedLayouts = [...layouts];
    updatedLayouts[layoutIndex] = {
      ...currentLayout,
      widgets: updatedWidgets,
    };

    // Update layouts with the updated widget
    set(layoutAtom, updatedLayouts);
    const dashboardSetting = get(settingAtom);
    const syncCondition = dashboardSetting.auto_save || currentLayout?.draft;

    if (syncCondition) {
      set(syncWidgetsToDb, {
        layoutData: {
          id: currentLayout.id,
          name: currentLayout.name,
        },
        widgetData: updatedWidgets,
      });
    }
  }
);

// This function saves the new layout to the database
// It is called when a new layout is created and a widget is added to it
let currentAbortController: AbortController | null = null;
export const syncWidgetsToDb = atom(
  null,
  async (get, set, { layoutData, widgetData }: SaveLayoutPayload) => {
    // Abort the previous request if still pending
    if (currentAbortController) {
      currentAbortController.abort();
    }

    // Create a new controller for this request
    currentAbortController = new AbortController();
    const signal = currentAbortController.signal;
    try {
      await syncLayoutAction({ layoutData, widgetData }, signal);
    } catch (error) {
      console.log("Failed to sync widgets with DV:", error);
    }
  }
);

export const syncLayoutOnSelectAtom = atom(
  null,
  (
    get,
    set,
    layout: {
      id: string;
      name: string;
      draft: boolean;
      widgets: {
        id: string;
        token: string;
        meta: ReactGridLayout.Layout;
        layout_id: string;
      }[];
    }
  ) => {
    // Get current state
    const currentLayouts = get(layoutAtom);
    const tabs = get(tabsAtom);
    const activeTab = get(activeTabAtom);

    // Format the layout to match LayoutType structure
    const formattedLayout: LayoutType = {
      id: layout.id,
      name: layout.name,
      draft: layout.draft,
      widgets: layout.widgets.map((widget) => ({
        id: widget.id,
        props: {
          token: widget.token,
        },
        meta: widget.meta,
      })),
    };

    // Add or update the layout in layouts array
    const layoutExists = currentLayouts.some((l) => l.id === layout.id);
    let updatedLayouts = [...currentLayouts];

    if (layoutExists) {
      updatedLayouts = currentLayouts.map((l) =>
        l.id === layout.id ? formattedLayout : l
      );
    } else {
      updatedLayouts = [...currentLayouts, formattedLayout];
    }

    // Update the layouts state
    set(layoutAtom, updatedLayouts);

    // Update the active tab with the new layout_id and name
    const updatedActiveTab = {
      ...activeTab,
      layout_id: layout.id,
      name: layout.name,
      label: layout.name,
    };

    // Update both active tab and tabs array
    set(activeTabAtom, updatedActiveTab);

    // Update tab in tabs array
    const updatedTabs = tabs.map((tab) =>
      tab.id === activeTab.id ? updatedActiveTab : tab
    );

    set(tabsAtom, updatedTabs);
  }
);
