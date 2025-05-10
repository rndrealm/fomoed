// atoms/tabs.ts

import { atom } from "jotai";
import { v4 as uuidv4 } from "uuid";
import { replaceUserTabsAction } from "@/services/queries/tabs/actions";

export interface TabType {
  id: string;
  name: string;
  layout_id: string | null;
}

export const initialTab: TabType = {
  id: uuidv4(),
  name: "Untitled Layout",
  layout_id: uuidv4(), // This will be updated once the layout is created
};

export const tabsAtom = atom<TabType[]>([initialTab]);

export const activeTabAtom = atom<TabType>(initialTab);

export const syncActiveTabAtom = atom(
  null,
  (get, set, newActiveTab: TabType) => {
    set(activeTabAtom, newActiveTab);

    const tabs = get(tabsAtom);
    const updatedTabs = tabs.map((tab) =>
      tab.id === newActiveTab.id ? { ...tab, ...newActiveTab } : tab
    );
    set(tabsAtom, updatedTabs);
  }
);

export const renameTabAtom = atom(
  null,
  (get, set, { id, name }: { id: string; name: string }) => {
    const tabs = get(tabsAtom);
    const updatedTabs = tabs.map((tab) =>
      tab.id === id ? { ...tab, name } : tab
    );
    set(tabsAtom, updatedTabs);

    const activeTab = get(activeTabAtom);
    if (activeTab?.id === id) {
      set(activeTabAtom, { ...activeTab, name });
    }

    set(syncTabsWithDbAtom);
  }
);

export const deleteTabAtom = atom(null, (get, set, idToDelete: string) => {
  const tabs = get(tabsAtom);
  const updatedTabs = tabs.filter((tab) => tab.id !== idToDelete);
  set(tabsAtom, updatedTabs);

  const activeTab = get(activeTabAtom);
  if (activeTab?.id === idToDelete) {
    const newActive = updatedTabs[updatedTabs.length - 1] ?? null;
    if (newActive) {
      set(activeTabAtom, newActive);
    }
  }

  set(syncTabsWithDbAtom);
});

export const addNewTabAtom = atom(null, (get, set) => {
  // 🔹 Create a new layout
  const newLayout = {
    id: uuidv4(),
    name: "Untitled Layout",
    draft: true,
    widgets: [],
  };

  // 🔹 Create a new tab referencing the new layout
  const newTab = {
    id: uuidv4(),
    name: "New Tab",
    layout_id: null,
  };

  // 🔹 Add tab to tabsAtom
  const currentTabs = get(tabsAtom);
  set(tabsAtom, [...currentTabs, newTab]);

  // 🔹 Set as active tab
  set(activeTabAtom, newTab);

  // 🔹 Add layout to layoutAtom
  // const currentLayouts = get(layoutAtom);
  // set(layoutAtom, [...currentLayouts, newLayout]);

  set(syncTabsWithDbAtom);
});

export const loadTabsFromApiAtom = atom(
  null,
  (
    get,
    set,
    tabsFromApi: {
      id: string;
      name: string;
      layout_id: string;
      // Any other tab fields can go here (like label/editMode if needed)
    }[]
  ) => {
    // Update tabs state directly
    set(tabsAtom, tabsFromApi);

    // Optionally set the first tab as active
    if (tabsFromApi.length > 0) {
      set(activeTabAtom, tabsFromApi[0]);
    }
  }
);

let currentAbortController: AbortController | null = null;
export const syncTabsWithDbAtom = atom(null, async (get) => {
  // Abort the previous request if still pending
  if (currentAbortController) {
    currentAbortController.abort();
  }

  // Create a new controller for this request
  currentAbortController = new AbortController();
  const signal = currentAbortController.signal;

  const localTabs = get(tabsAtom);

  try {
    await replaceUserTabsAction(localTabs, signal);
  } catch (error) {
    console.log("Failed to sync tabs with DB:", error);
  }
});
