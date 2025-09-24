import React, { Fragment, useEffect, useMemo, useState } from "react";
import { useAtomValue, useSetAtom } from "jotai";
import { useHotkeys } from "react-hotkeys-hook";
import { ModalContainer } from "@/components/shared";
import { IShortcutIcon, ShortcutItem } from "./shortcut-item";
import { spotlightVisibleAtom, toggleQuickWidgetsAtom, toggleSpotlightAtom } from "@/lib/atoms/shortcuts";
import {
  deleteAllWidgetsAtom,
  deleteLayoutAtom,
  editLayoutNameAtom,
  layoutAtom,
  addWidgetToExistingLayoutAtom,
  addWidgetToNewLayoutAtom,
} from "@/lib/atoms/layoutAtom";
import { ConfirmationModal, NameLayout } from "@/components/modals";
import { activeTabAtom, addNewTabAtom, deleteAllTabsAtom, deleteTabAtom } from "@/lib/atoms/tabsAtom";
import { CommandIcon, SpotlightSearch } from "@/components/icons/icons";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { KeyboardSheet } from "./keyboard-sheet";
import { useRouter } from "next/navigation";
import { AppRoutes } from "@/lib/routes";
import { layoutOptionsMap, widgetPropsDefaults } from "@/lib/static";
import SearchIcon from "@/components/icons/SearchIcon";
import { track } from "@vercel/analytics";

import { getGridPosition } from "@/charts/helpers";
import { settingAtom } from "@/lib/atoms/settingsAtom";
import { cn, joinWidgetSlug, maxTabsByPlan } from "@/lib/utils";
import { useGetUserPlans } from "@/services/queries/subscriptions";
import { v4 as uuidv4 } from "uuid";

const WindIcon = () => {
  return (
    <svg width="16" height="14" viewBox="0 0 16 14" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M7.50008 13.3915C7.08397 13.3915 6.70161 13.2756 6.353 13.0438C6.00453 12.8118 5.74744 12.5003 5.58175 12.1094C5.5455 12.0228 5.56126 11.9371 5.62904 11.8521C5.69696 11.7672 5.77418 11.7248 5.86071 11.7248C5.9589 11.7248 6.0323 11.7344 6.08091 11.7535C6.12953 11.7728 6.18432 11.8476 6.24529 11.9779C6.3764 12.2056 6.55182 12.3869 6.77154 12.5221C6.99126 12.6572 7.23411 12.7248 7.50008 12.7248C7.89022 12.7248 8.2239 12.5863 8.50112 12.3092C8.77821 12.0319 8.91675 11.6983 8.91675 11.3081C8.91675 10.918 8.77821 10.5843 8.50112 10.3071C8.2239 10.03 7.89022 9.89146 7.50008 9.89146H0.750081C0.655081 9.89146 0.575776 9.86007 0.512165 9.79729C0.448554 9.73451 0.416748 9.65625 0.416748 9.5625C0.416748 9.46875 0.448554 9.38903 0.512165 9.32333C0.575776 9.25764 0.655081 9.22479 0.750081 9.22479H7.50008C8.07703 9.22479 8.56849 9.42778 8.97446 9.83375C9.38043 10.2397 9.58342 10.7312 9.58342 11.3081C9.58342 11.8851 9.38043 12.3765 8.97446 12.7825C8.56849 13.1885 8.07703 13.3915 7.50008 13.3915ZM0.750081 5.27604C0.655081 5.27604 0.575776 5.24465 0.512165 5.18188C0.448554 5.1191 0.416748 5.04083 0.416748 4.94708C0.416748 4.85333 0.448554 4.77361 0.512165 4.70792C0.575776 4.64222 0.655081 4.60938 0.750081 4.60938H11.2461C11.7028 4.60938 12.0954 4.44514 12.424 4.11667C12.7525 3.78806 12.9167 3.39674 12.9167 2.94271C12.9167 2.48868 12.7525 2.09736 12.424 1.76875C12.0954 1.44028 11.7016 1.27604 11.2426 1.27604C10.9102 1.27604 10.6054 1.37326 10.328 1.56771C10.0506 1.76215 9.84571 2.01694 9.71321 2.33208C9.66946 2.44111 9.60855 2.50069 9.5305 2.51083C9.45258 2.52097 9.3698 2.52604 9.28216 2.52604C9.18814 2.52604 9.11869 2.48382 9.07383 2.39938C9.02897 2.31507 9.02522 2.20292 9.06258 2.06292C9.21536 1.64194 9.49904 1.29445 9.91362 1.02042C10.3281 0.74639 10.7758 0.609375 11.2567 0.609375C11.9076 0.609375 12.4581 0.835556 12.9082 1.28792C13.3583 1.74028 13.5834 2.2934 13.5834 2.94729C13.5834 3.60132 13.3577 4.15292 12.9063 4.60208C12.4548 5.05139 11.9027 5.27604 11.2501 5.27604H0.750081ZM14.0786 11.4812C13.9429 11.5004 13.8334 11.4788 13.7501 11.4163C13.6667 11.3538 13.6251 11.2792 13.6251 11.1927C13.6251 11.0992 13.6336 11.0192 13.6507 10.9527C13.6678 10.8862 13.7297 10.8375 13.8365 10.8067C14.1678 10.689 14.4306 10.4894 14.6251 10.2079C14.8195 9.92639 14.9167 9.60722 14.9167 9.25042C14.9167 8.79639 14.7525 8.40507 14.424 8.07646C14.0954 7.74799 13.7041 7.58375 13.2501 7.58375H0.750081C0.655081 7.58375 0.575776 7.55236 0.512165 7.48958C0.448554 7.42681 0.416748 7.34854 0.416748 7.25479C0.416748 7.16104 0.448554 7.08132 0.512165 7.01563C0.575776 6.94993 0.655081 6.91708 0.750081 6.91708H13.2501C13.9027 6.91708 14.4548 7.14278 14.9063 7.59417C15.3577 8.0457 15.5834 8.59778 15.5834 9.25042C15.5834 9.78681 15.4486 10.259 15.1788 10.6671C14.909 11.0751 14.5422 11.3465 14.0786 11.4812Z"
        fill="white"
      />
    </svg>
  );
};

type ShortcutAction = {
  id: number;
  label: string;
  icon: IShortcutIcon;
  shortcutKeys: string[];
  onClick: () => void;
};

type ShortcutGroup = {
  id: number;
  title: string;
  actions: ShortcutAction[];
};

export function KeyboardShortcuts() {
  const router = useRouter();
  const [searchValue, setSearchValue] = useState("");

  //show delete widgets confirmation
  const [showDeleteWidgetsConfirmation, setShowDeleteWidgetsConfirmation] = useState(false);
  //show delete tabs confirmation
  const [showDeleteTabsConfirmation, setShowDeleteTabsConfirmation] = useState(false);

  const [showDeleteSingleTabConfirmation, setShowDeleteSingleTabConfirmation] = useState(false);

  // show edit layout name modal
  const [showNameModal, setShowNameModal] = useState(false);
  const [layoutName, setLayoutName] = useState("");

  // toggle to show shortcut
  const toggleSpotlight = useSetAtom(toggleSpotlightAtom);
  const showSpotlight = useAtomValue(spotlightVisibleAtom);

  // toggle to add widgets
  const setShowWidgetsModal = useSetAtom(toggleQuickWidgetsAtom);

  // Delete all widgets
  const deleteAllWidgets = useSetAtom(deleteAllWidgetsAtom);

  // Add new tab
  const addNewTab = useSetAtom(addNewTabAtom);

  const deleteAllTabs = useSetAtom(deleteAllTabsAtom);

  // edit layout name
  const editLayoutName = useSetAtom(editLayoutNameAtom);

  const layouts = useAtomValue(layoutAtom);
  const activeTab = useAtomValue(activeTabAtom);

  const deleteSingleTab = useSetAtom(deleteTabAtom);
  const deleteLayout = useSetAtom(deleteLayoutAtom);

  const currentLayout = layouts.find((item) => item.id === activeTab?.layout_id);

  const addWidgetToNewLayout = useSetAtom(addWidgetToNewLayoutAtom);
  const dashboardSetting = useAtomValue(settingAtom);
  const addWidgetToExistingLayout = useSetAtom(addWidgetToExistingLayoutAtom);

  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const { data } = useGetUserPlans();

  const addWidgetToLayout = (widget: any) => {
    const currLayoutId = activeTab.layout_id;
    const currLayout = layouts.find((item) => item.id === currLayoutId);

    const { x, y } = getGridPosition(currLayout?.widgets.length || 0);
    const newId = uuidv4();
    const widgetDefaults = widgetPropsDefaults[widget.slug as keyof typeof widgetPropsDefaults];
    const defaultWAndH = widgetDefaults.meta || { w: 3, h: 2 };
    const newWidget = {
      id: newId,
      props: widgetDefaults,
      meta: {
        i: joinWidgetSlug(newId, widget.slug),
        x,
        y,
        ...defaultWAndH,
      },
    };

    // Check if the current layout id on active tab is null or undefined
    const syncCondition = dashboardSetting.auto_save || currLayout?.draft;

    console.log("syncCondition", newWidget);

    if (currLayoutId) {
      addWidgetToExistingLayout({
        widget: newWidget,
        layoutId: currLayoutId,
        sync: syncCondition,
      });
    } else {
      const planType = data?.planType || "FREE"; // Default to FREE if not set
      const maxTabs = maxTabsByPlan[planType] || 3;
      if (layouts.length >= maxTabs) {
        setShowUpgradeModal(true);
        return;
      }
      addWidgetToNewLayout({ newWidget });
    }
    track("widget_added", {
      widget: widget.slug,
      planType: data?.planType || "FREE",
    });
  };

  useHotkeys("metaKey+x, ctrl+x", () => {
    const widget = layoutOptionsMap.find((item) => item.name === "Price Chart Widget");

    addWidgetToLayout(widget);
  });

  //Shortcut key combinations
  useHotkeys(
    "metaKey+k, ctrl+k",
    () => {
      toggleSpotlight();
    },
    {
      enableOnFormTags: true,
    },
  );

  useHotkeys("c", (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowWidgetsModal(true);
  });

  useHotkeys("t", () => {
    addNewTab();
  });

  useHotkeys("g>n", () => {
    router.push(AppRoutes.news.path);
  });

  useHotkeys("shift+c", () => {
    setShowDeleteWidgetsConfirmation(true);
  });

  useHotkeys("metaKey+backspace, metaKey+delete", () => {
    setShowDeleteSingleTabConfirmation(true);
  });

  useHotkeys("metaKey+ctrl+backspace, metaKey+ctrl+delete", () => {
    setShowDeleteTabsConfirmation(true);
  });

  useHotkeys("alt+shift+Q", () => {
    router.push(AppRoutes.logout.path);
  });

  const handleCloseShortCut = () => {
    toggleSpotlight(false);
  };

  const options: ShortcutGroup[] = useMemo(() => {
    return [
      {
        id: 0,
        title: "Price Charts",
        actions: [
          {
            id: 1,
            label: "Price History Chart",
            icon: "addPriceHistoryWidget",
            shortcutKeys: ["Command", "A"],
            onClick: () => {
              const widget = layoutOptionsMap.find((item) => item.name === "Price Chart Widget");
              addWidgetToLayout(widget);

              handleCloseShortCut();
            },
          },
          {
            id: 2,
            label: "Price History Chart w/ Smart Signals",
            icon: "addPriceHistoryWidget",
            shortcutKeys: ["Command", "K"],
            onClick: () => {
              const widget = layoutOptionsMap.find((item) => item.name === "Price Chart Widget");
              addWidgetToLayout(widget);

              handleCloseShortCut();
            },
          },
        ],
      },

      {
        id: 1,
        title: "Widgets",
        actions: [
          {
            id: 1,
            label: "Add Widget",
            icon: "addNewWidget",
            shortcutKeys: ["C"],
            onClick: () => {
              setShowWidgetsModal(true);
              handleCloseShortCut();
            },
          },
          {
            id: 2,
            label: "Clear All Widgets",
            icon: "clear",
            shortcutKeys: ["Shift", "C"],
            onClick: () => {
              setShowDeleteWidgetsConfirmation(true);
              handleCloseShortCut();
            },
          },
        ],
      },

      {
        id: 2,
        title: "Tabs",
        actions: [
          {
            id: 1,
            label: "Add new tab",
            icon: "add",
            shortcutKeys: ["T"],
            onClick: () => {
              addNewTab();
              handleCloseShortCut();
            },
          },

          {
            id: 2,
            label: "Remove current tab",
            icon: "removeOne",
            shortcutKeys: ["Cmd", "Del"],
            onClick: () => {
              setShowDeleteSingleTabConfirmation(true);
              handleCloseShortCut();
            },
          },

          {
            id: 3,
            label: "Remove all tabs",
            icon: "clear",
            shortcutKeys: ["Cmd", "Ctrl", "Del"],
            onClick: () => {
              setShowDeleteTabsConfirmation(true);
              handleCloseShortCut();
            },
          },
        ],
      },

      // {
      //   id: 3,
      //   title: "Draft",
      //   actions: [
      //     {
      //       id: 1,
      //       label: "Save Draft",
      //       icon: "add",
      //       shortcutKeys: ["A"],
      //       onClick: () => {},
      //     },
      //   ],
      // },

      // {
      //   id: 4,
      //   title: "Layout",
      //   actions: [
      //     {
      //       id: 1,
      //       label: "Create New Layout",
      //       icon: "add",
      //       shortcutKeys: ["A"],
      //       onClick: () => {},
      //     },
      //     {
      //       id: 2,
      //       label: "Clear All Layouts",
      //       icon: "clear",
      //       shortcutKeys: ["A"],
      //       onClick: () => {},
      //     },
      //   ],
      // },
      {
        id: 4,
        title: "Navigation",
        actions: [
          {
            id: 1,
            label: "Go to News",
            icon: "rename",
            shortcutKeys: ["G", "then", "N"],
            onClick: () => {
              router?.push(AppRoutes.news.path);
              handleCloseShortCut();
            },
          },
        ],
      },

      {
        id: 5,
        title: "Account",
        actions: [
          {
            id: 1,
            label: "Sign Out",
            icon: "signOut",
            shortcutKeys: ["Alt|Option", "Shift", "Q"],
            onClick: () => {
              router?.push(AppRoutes.logout.path);
              handleCloseShortCut();
            },
          },
        ],
      },
    ];
    // eslint-disable-next-line
  }, [activeTab]);

  // useEffect(() => {
  //   window.addEventListener("keydown", (e) => {
  //     console.log(e);
  //   });

  //   return () => {
  //     window.removeEventListener("keydown", () => {});
  //   };
  // }, []);

  return (
    <Fragment>
      {/* <div className="">
        <p></p>
      </div> */}
      <ModalContainer
        open={showSpotlight}
        handleClose={() => {
          toggleSpotlight(false);
        }}
        noHeader
        className="top-0 !mt-[15vh] !max-h-[unset] w-full !max-w-[720px] translate-y-[0] overflow-hidden !rounded-[10px] !border-none bg-[#1C1D1F] !p-0 outline-none"
        bgBlur={false}
      >
        <Command className="rounded-[12px] border-[1px] border-[#242424] bg-[#131313]">
          {/* top search layer */}
          <div className="pointer-events-none absolute top-0 left-0 w-full h-[58px] px-5 flex flex-row justify-between items-center">
            <SearchIcon />

            <div className="flex flex-row gap-2">
              <span className="h-[22px] aspect-square flex items-center justify-center rounded-[4px] bg-[#1A1A1A] border-[1px] border-[#242424]">
                <CommandIcon fill="#A6AEB2" />
              </span>
              <span className="h-[22px] text-[13px] leading-[18px] font-normal text-[#BEBEBE] aspect-square flex items-center justify-center rounded-[4px] bg-[#1A1A1A] border-[1px] border-[#242424]">
                K
              </span>
            </div>
          </div>

          {/* command input */}

          <CommandInput
            value={searchValue}
            onValueChange={setSearchValue}
            placeholder="Search or type / for commands"
            className="h-[56px] ml-[26px] w-full rounded-[4px] border-b border-[#262626] bg-transparent px-4 py-[1px] text-[14px] font-medium text-white transition-all placeholder:text-white/40 focus:shadow-none focus:ring-0 focus:ring-offset-0 focus:outline-none focus-visible:ring-0 [&:focus]:outline-none [&:focus-visible]:outline-none"
          />

          <CommandList className="scrollbar pt-2 max-h-[330px]">
            <CommandEmpty className="px-0 py-0">
              <div className="flex flex-col px-2 py-2 gap-0 items-start justify-between bg-[#141414]">
                <p className="px-3 pt-2 pb-3 text-xs text-[#A4A4A4]">Search results for {`"` + searchValue + `"`}</p>
                <div className="relative h-[40px] flex w-full px-3 items-center gap-1 bg-[#1A1A1A] border-[1px] border-[#242424] rounded-[8px]">
                  <div className="flex flex-row gap-3 items-center">
                    <WindIcon />

                    <p className="text-[14px] leading-[18px] font-normal text-white">
                      No result found
                      <span className="ml-1.5 text-xs text-[#A4A4A4]">Make a widget suggestion to us</span>
                    </p>
                  </div>

                  {/* right suggestion */}
                  <div className="absolute right-1.5 top-1/2 -translate-y-1/2 cursor-not-allowed px-1.5 py-1 bg-[#1A1A1A] border-[1px] border-[#242424] rounded-[6px]">
                    <p className="text-xs leading-[18px] font-normal text-[#A6AEB2]">Make Widget Suggestion</p>
                  </div>
                </div>

                <div className="flex items-center gap-1"></div>
              </div>
            </CommandEmpty>
            {options?.map((item) => {
              return (
                <CommandGroup
                  key={item.id}
                  className="flex flex-col gap-0 px-2 pb-2 [&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:py-3 [&_[cmdk-group-heading]]:leading-[16px] [&_[cmdk-group-heading]]:text-[#A4A4A4]"
                  heading={item?.title}
                >
                  {/* tab item */}
                  {item?.actions?.map((action) => {
                    return (
                      <CommandItem
                        key={action.id}
                        className="group cursor-pointer p-0 max-h-[40px] rounded-[8px] data-[selected=true]:bg-[#1A1A1A] data-[selected=true]:border-[0px] data-[selected=true]:border-[#242424]"
                        onSelect={action.onClick}
                      >
                        <ShortcutItem icon={action.icon} label={action.label} shortcutKeys={action.shortcutKeys} />
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              );
            })}
          </CommandList>
        </Command>
      </ModalContainer>

      {/* Confirmation Modal for deleting all widgets */}
      <ConfirmationModal
        handleCloseModal={() => {
          setShowDeleteWidgetsConfirmation(false);
        }}
        open={showDeleteWidgetsConfirmation}
        title={`Delete All Widgets?`}
        details="You can always add new widgets to your dashboard after widgets are deleted"
        cancelBtnText="Cancel"
        confirmBtnText="Delete Widgets"
        handleConfirm={() => {
          deleteAllWidgets();
          setShowDeleteWidgetsConfirmation(false);
          handleCloseShortCut();
        }}
      />

      {/* Confirmation Modal for deleting all tabs */}
      <ConfirmationModal
        handleCloseModal={() => {
          setShowDeleteTabsConfirmation(false);
        }}
        open={showDeleteTabsConfirmation}
        title={`Delete All Tabs?`}
        details="Tabs will be lost forever and cannot be recovered"
        cancelBtnText="Cancel"
        confirmBtnText="Delete Tabs"
        handleConfirm={() => {
          deleteAllTabs();
          setShowDeleteTabsConfirmation(false);
          handleCloseShortCut();
        }}
      />

      <ConfirmationModal
        handleCloseModal={() => {
          setShowDeleteSingleTabConfirmation(false);
        }}
        open={showDeleteSingleTabConfirmation}
        // title={`Close "${deleteTab?.name}" Tab`}
        title={`Close Tab`}
        details={
          currentLayout?.draft
            ? "Unsaved Draft and Tab will be lost forever and cannot be recovered"
            : "Tab will be lost forever and cannot be recovered"
        }
        cancelBtnText="Cancel"
        confirmBtnText="Confirm"
        handleConfirm={() => {
          if (!activeTab?.id) return;
          deleteSingleTab(activeTab.id);
          if (currentLayout?.draft) {
            deleteLayout({ layoutId: currentLayout.id });
          }
          setShowDeleteSingleTabConfirmation(false);
          handleCloseShortCut();
        }}
      />

      {/* Rename layout modal */}
      <NameLayout
        open={showNameModal}
        handleCloseModal={() => {
          setShowNameModal(false);
        }}
        value={layoutName}
        onChange={(name) => {
          setLayoutName(name);
        }}
        handleSave={() => {
          // console.log({ layoutId: layoutRef.current, newName: layoutName });
          // editLayoutName({ layoutId: layoutRef.current, newName: layoutName });
          setShowNameModal(false);
        }}
        title="Rename Layout"
        details="Rename your layout"
      />

      <KeyboardSheet />
    </Fragment>
  );
}
