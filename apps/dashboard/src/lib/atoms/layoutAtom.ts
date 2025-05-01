import { atom } from "jotai";
import { layoutOptions } from "../static";
import { getGridPosition } from "@/charts/helpers";
import { v4 as uuidv4 } from "uuid";

export interface LayoutType {
  id: string;
  widgets: {
    id: string;
    meta: ReactGridLayout.Layout;
    token: string;
  }[];
}

interface TabType {
  id: string;
  label: string;
  name: string;
  editMode: boolean;
  layout_id: string;
}

const initialLayout = {
  id: uuidv4(),
  widgets: [],
};

const initialTab = {
  id: uuidv4(),
  label: "untitled layout",
  name: "Untitled Layout",
  editMode: false,
  layout_id: initialLayout.id,
};

export const layoutAtom = atom<LayoutType[]>([initialLayout]);
// export const layoutAtom = atom<string[]>([]);
// export const layoutAtom = atom<string[]>([
//   "detailed-cfgi",
//   "simple-cfgi",
//   "detailed-cfgi",
//   "simple-cfgi",
// ]);

export const tabsAtom = atom<TabType[]>([initialTab]);

export const activeTabAtom = atom<TabType>(initialTab);

export const syncActiveTabAtom = atom(
  null,
  (get, set, newActiveTab: TabType) => {
    // Set active tab state
    set(activeTabAtom, newActiveTab);

    // Update tab inside the array
    const tabs = get(tabsAtom);
    const updatedTabs = tabs.map((tab) =>
      tab.id === newActiveTab.id ? { ...tab, ...newActiveTab } : tab
    );
    set(tabsAtom, updatedTabs);
  }
);

type WidgetsData = {
  [key: string]: {
    id: string | number;
    name: string;
  }[];
};

export const widgetsAtom = atom<WidgetsData>({});

export const deleteTabAtom = atom(null, (get, set, idToDelete: string) => {
  // 🔸 Remove layout
  const layouts = get(layoutAtom);
  const updatedLayouts = layouts.filter(
    (layout) => layout.id !== idToDelete.toString()
  );
  set(layoutAtom, updatedLayouts);

  // 🔸 Update tabs
  const tabs = get(tabsAtom);
  const updatedTabs = tabs.filter((tab) => tab.id !== idToDelete);
  set(tabsAtom, updatedTabs);

  // 🔸 Update activeTab if needed
  const activeTab = get(activeTabAtom);
  if (activeTab?.id === idToDelete) {
    const newActive = updatedTabs[updatedTabs.length - 1] ?? null;
    if (newActive) {
      set(activeTabAtom, newActive);
    }
  }
});

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
  }
);

export const updateWidgetTokenAtom = atom(
  null,
  (
    get,
    set,
    {
      tabId,
      widgetId,
      token,
    }: {
      tabId: string;
      widgetId: string;
      token: string;
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
      token,
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
  }
);
export const renameTabAtom = atom(
  null,
  (get, set, { id, name }: { id: string; name: string }) => {
    // 🔸 Update the tab in tabsAtom
    const tabs = get(tabsAtom);
    const updatedTabs = tabs.map((tab) =>
      tab.id === id ? { ...tab, name, label: name } : tab
    );
    set(tabsAtom, updatedTabs);

    // 🔸 Update activeTabAtom if it's the one being renamed
    const activeTab = get(activeTabAtom);
    if (activeTab?.id === id) {
      set(activeTabAtom, { ...activeTab, name, label: name });
    }
  }
);
