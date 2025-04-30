import { atom } from "jotai";
import { layoutOptions } from "../static";

const initialTab = {
  id: 1 as number | string,
  label: "untitled layout",
  name: "Untitled Layout",
  editMode: false,
};

export const layoutAtom = atom(layoutOptions[3].options[2]);

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
