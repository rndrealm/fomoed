import { atom } from "jotai";
import { layoutOptions } from "../static";
import { getGridPosition } from "@/charts/helpers";
import { v4 as uuidv4 } from "uuid";

const initialTab = {
  id: uuidv4(),
  label: "untitled layout",
  name: "Untitled Layout",
  editMode: false,
};

// type LayoutType = Record<string | number, { widget: ReactGridLayout.Layout[] }>;
interface LayoutType {
  id: string;
  widget: {
    id: string;
    meta: ReactGridLayout.Layout;
  }[];
}

export const layoutAtom = atom<LayoutType[]>([
  {
    id: initialTab.id,
    widget: [],
  },
]);
// export const layoutAtom = atom<string[]>([]);
// export const layoutAtom = atom<string[]>([
//   "detailed-cfgi",
//   "simple-cfgi",
//   "detailed-cfgi",
//   "simple-cfgi",
// ]);

export const tabsAtom = atom([initialTab]);

export const activeTabAtom = atom(initialTab);

export const syncActiveTabAtom = atom(
  null,
  (get, set, newActiveTab: typeof initialTab) => {
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

export const deleteTabAtom = atom(
  null,
  (get, set, idToDelete: string | number) => {
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
  }
);

export const deleteWidgetAtom = atom(
  null,
  (
    get,
    set,
    { tabId, widgetId }: { tabId: string | number; widgetId: string | number }
  ) => {
    // Get current layouts
    const layouts = get(layoutAtom);

    // Find the layout with matching tabId
    const layoutIndex = layouts.findIndex(
      (layout) => layout.id === tabId.toString()
    );

    // Check if the tab exists in layouts
    if (layoutIndex === -1) {
      return; // Nothing to delete
    }

    // Get the current layout
    const currentLayout = layouts[layoutIndex];

    // Filter out the widget to remove
    const updatedWidgets = currentLayout.widget.filter(
      (widget) => widget.meta.i !== widgetId.toString()
    );

    // Rearrange the remaining widgets using getGridPosition
    const rearrangedWidgets = updatedWidgets.map((widget, index) => {
      const { x, y } = getGridPosition(index);
      return {
        ...widget,
        x,
        y,
      };
    });

    // Create updated layouts array
    const updatedLayouts = [...layouts];
    updatedLayouts[layoutIndex] = {
      ...currentLayout,
      widget: rearrangedWidgets,
    };

    // Update layouts with the updated widget list
    set(layoutAtom, updatedLayouts);
  }
);
