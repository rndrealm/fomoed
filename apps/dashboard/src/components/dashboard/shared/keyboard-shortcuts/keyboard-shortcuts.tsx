import React, { Fragment, useMemo, useState } from "react";
import { useAtomValue, useSetAtom } from "jotai";
import { useHotkeys } from "react-hotkeys-hook";
import { ModalContainer } from "@/components/shared";
import { IShortcutIcon, ShortcutItem } from "./shortcut-item";
import {
  quickWidgetsVisibleAtom,
  spotlightVisibleAtom,
  toggleQuickWidgetsAtom,
  toggleSpotlightAtom,
} from "@/lib/atoms/shortcuts";
import {
  deleteAllWidgetsAtom,
  deleteLayoutAtom,
  editLayoutNameAtom,
  layoutAtom,
} from "@/lib/atoms/layoutAtom";
import { ConfirmationModal, NameLayout } from "@/components/modals";
import {
  activeTabAtom,
  addNewTabAtom,
  deleteAllTabsAtom,
  deleteTabAtom,
} from "@/lib/atoms/tabsAtom";
import { SpotlightSearch } from "@/components/icons/icons";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

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
  //show delete widgets confirmation
  const [showDeleteWidgetsConfirmation, setShowDeleteWidgetsConfirmation] =
    useState(false);
  //show delete tabs confirmation
  const [showDeleteTabsConfirmation, setShowDeleteTabsConfirmation] =
    useState(false);

  const [showDeleteSingleTabConfirmation, setShowDeleteSingleTabConfirmation] =
    useState(false);

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

  const currentLayout = layouts.find(
    (item) => item.id === activeTab?.layout_id
  );

  useHotkeys(
    "metaKey+k",
    () => {
      toggleSpotlight();
    },
    {
      enableOnFormTags: true,
    }
  );

  const handleCloseShortCut = () => {
    toggleSpotlight(false);
  };

  const options: ShortcutGroup[] = useMemo(() => {
    return [
      {
        id: 1,
        title: "Widgets",
        actions: [
          {
            id: 1,
            label: "Add Widget",
            icon: "add",
            shortcutKeys: ["A"],
            onClick: () => {
              setShowWidgetsModal(true);
              handleCloseShortCut();
            },
          },
          {
            id: 2,
            label: "Clear All Widgets",
            icon: "clear",
            shortcutKeys: ["Cmd", "T"],
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
            shortcutKeys: ["A"],
            onClick: () => {
              addNewTab();
              handleCloseShortCut();
            },
          },

          {
            id: 2,
            label: "Remove current tab",
            icon: "clear",
            shortcutKeys: ["A"],
            onClick: () => {
              setShowDeleteSingleTabConfirmation(true);
              handleCloseShortCut();
            },
          },

          {
            id: 3,
            label: "Remove all tabs",
            icon: "clear",
            shortcutKeys: ["Cmd", "T"],
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
        id: 5,
        title: "Account",
        actions: [
          {
            id: 1,
            label: "Logout",
            icon: "rename",
            shortcutKeys: ["A"],
            onClick: () => {},
          },
        ],
      },
    ];
    // eslint-disable-next-line
  }, [activeTab]);

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
        className="!p-0 !max-w-[720px] w-full !max-h-[unset] overflow-hidden bg-[#1C1D1F] !rounded-[20px] !border-none outline-none !mt-[15vh] top-0 translate-y-[0]"
        bgBlur={false}
      >
        {/* <div className="w-full !max-h-[406px] text-white border-2 border-[#2B2B2B] rounded-[20px] flex flex-col">
          <div className="border-b border-[#353535] px-2">
            <Input
              placeholder="Describe what you’re looking for or type / for suggestions"
              className="h-[56px] px-4 py-[1px] rounded-[4px] border border-white/10 text-base placeholder:text-white/40 bg-transparent text-white focus:outline-none focus:ring-0 focus:ring-offset-0 focus:shadow-none [&:focus-visible]:outline-none [&:focus]:outline-none transition-all w-full border-none focus-visible:ring-0"
              onChange={(e) => setSearchValue(e.target.value)}
            />
          </div>
          <div className="overflow-auto flex-1 scrollbar px-2 py-[10px] flex flex-col gap-1">
            {filteredOptions.map((item) => {
              return (
                <Fragment key={item.id}>
                  <RenderIf condition={searchValue.trim() === ""}>
                    <ShortcutTitle title={item.title} />
                  </RenderIf>
                  {item.actions.map((action) => {
                    const flattenedKey = `${item.id}-${action.id}`;
                    const isFocused =
                      flattenedActions[focusedIndex]?.key === flattenedKey;

                    return (
                      <ShortcutItem
                        key={action.id}
                        label={action.label}
                        icon={action.icon}
                        shortcutKeys={action.shortcutKeys}
                        onClick={action?.onClick}
                        isFocused={isFocused}
                        ref={isFocused ? focusedItemRef : null}
                        onMouseEnter={
                          !isUsingKeyboard
                            ? () => {
                                const index = flattenedActions.findIndex(
                                  (item) => item.key === flattenedKey
                                );
                                if (index === -1) return;
                                if (!isUsingKeyboard) setFocusedIndex(index);
                              }
                            : undefined
                        }
                      />
                    );
                  })}
                </Fragment>
              );
            })}
            <RenderIf condition={filteredOptions.length === 0}>
              <div className="flex justify-between flex-1 px-4 py-3 items-center bg-[#141414] rounded-sm">
                <div className="flex gap-1 items-center">
                  <div className="">
                    <SpotlightSearch />
                  </div>
                  <p className="text-[13px] font-semibold leading-[18px]">
                    No result found
                  </p>
                </div>

                <div className="flex items-center gap-1"></div>
              </div>
            </RenderIf>
          </div>
        </div> */}

        <Command className="bg-[#1C1D1F] rounded-[20px] border-2 border-[#2B2B2B]">
          <CommandInput
            placeholder="Type a command or search..."
            className="h-[56px] px-4 py-[1px] rounded-[4px] border border-white/10 text-base placeholder:text-white/40 bg-transparent text-white focus:outline-none focus:ring-0 focus:ring-offset-0 focus:shadow-none [&:focus-visible]:outline-none [&:focus]:outline-none transition-all w-full border-none focus-visible:ring-0"
          />
          <CommandList className="max-h-[330px]">
            <CommandEmpty className="py-3 px-2">
              <div className="flex justify-between flex-1 px-4 py-3 items-center bg-[#141414] rounded-sm">
                <div className="flex gap-1 items-center">
                  <div className="">
                    <SpotlightSearch />
                  </div>
                  <p className="text-[13px] font-semibold leading-[18px] text-white">
                    No result found
                  </p>
                </div>

                <div className="flex items-center gap-1"></div>
              </div>
            </CommandEmpty>
            {options?.map((item) => {
              return (
                <CommandGroup
                  key={item.id}
                  className="px-2 [&_[cmdk-group-heading]]:text-[red] [&_[cmdk-group-heading]]:py-3 [&_[cmdk-group-heading]]:px-4 [&_[cmdk-group-heading]]:text-[#A4A4A4] [&_[cmdk-group-heading]]:leading-[16px] flex flex-col gap-1"
                  heading={item?.title}
                >
                  {item?.actions?.map((action) => {
                    return (
                      <CommandItem
                        key={action.id}
                        className="data-[selected=true]:bg-[#27292E] p-0"
                        onSelect={action.onClick}
                      >
                        <ShortcutItem
                          icon={action.icon}
                          label={action.label}
                          shortcutKeys={action.shortcutKeys}
                        />
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
    </Fragment>
  );
}
