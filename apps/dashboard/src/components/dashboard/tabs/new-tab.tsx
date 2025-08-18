import React, { Fragment, useEffect, useRef, useState } from "react";
import { AddTab, CloseTab, MenuIconClosed, TabLayout } from "../../icons/icons";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
// import mixpanel from "mixpanel-browser";
import {
  activeTabAtom,
  addNewTabAtom,
  deleteTabAtom,
  renameTabAtom,
  tabsAtom,
  updateActiveTabAtom,
} from "@/lib/atoms/tabsAtom";
import { cn, maxTabsByPlan } from "@/lib/utils";
import { ConfirmationModal, Upgrade } from "../../modals";
import { ModalContainer, RenderIf } from "../../shared";
import { useGetUserPlans } from "@/services/queries/subscriptions";
import { deleteLayoutAtom, layoutAtom } from "@/lib/atoms/layoutAtom";
import { MobileTab } from "./mobile-tab";
import { isSidebarOpenAtom } from "@/lib/atoms/utilsAtom";

interface ITabButton {
  handleClick?: () => void;
  handleClose?: () => void;
  handleNameChange: (name: string) => void;
  isActive?: boolean;
  name: string;
  showCloseBtn: boolean;
}

export function TabButton(props: ITabButton) {
  const {
    handleClick,
    handleClose,
    isActive,
    name,
    showCloseBtn,
    handleNameChange,
  } = props;
  const [hover, setHover] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.value = name;
    }
  }, [name]);
  return (
    <div
      className="relative"
      onMouseEnter={() => {
        setHover(true);
      }}
      onMouseLeave={() => {
        setHover(false);
      }}
    >
      <button
        type="button"
        onClick={handleClick}
        onDoubleClick={() => {
          // inputRef.current?.focus();
          // inputRef.current?.select();
        }}
      >
        <div
          className={cn(
            "flex h-[32px] w-[170px] items-center justify-between gap-2 gap-3 rounded-md px-2",
            isActive ? "bg-[#252525]" : "bg-[#111]",
          )}
        >
          <div className="flex items-center flex-1 w-full gap-2">
            <TabLayout active={isActive} />
            <div className="flex flex-1">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                }}
              >
                <input
                  ref={inputRef}
                  type="text"
                  name="name"
                  className={cn(
                    "pointer-events-none h-full w-full flex-1 truncate text-xs font-medium focus:shadow-none focus:ring-0 focus:ring-offset-0 focus:outline-none focus-visible:ring-0 [&:focus]:outline-none [&:focus-visible]:outline-none",
                    isActive ? "text-white" : "text-[#7a7a7a]",
                  )}
                  defaultValue={name}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      (e.target as HTMLInputElement).blur();
                    }
                  }}
                  onBlur={(e) => {
                    const value = e.target.value.trim();
                    if (value === "") {
                      e.target.value = name;
                      return;
                    }
                    handleNameChange(e.target.value);
                  }}
                />
              </form>
            </div>
            {/* <p
              className={cn(
                "text-xs font-medium flex-1 truncate",
                isActive ? "text-white" : "text-[#7a7a7a]"
              )}
            >
              {name}
            </p> */}
            <div className="h-[16px] w-[16px]"></div>
          </div>
        </div>
      </button>
      <RenderIf condition={showCloseBtn && (isActive || hover)}>
        <button
          type="button"
          className="absolute top-[50%] right-[8px] translate-y-[-50%]"
          onClick={handleClose}
        >
          <CloseTab />
        </button>
      </RenderIf>
    </div>
  );
}

export function NewTabs() {
  const tabs = useAtomValue(tabsAtom);
  const layouts = useAtomValue(layoutAtom);
  const [activeTab, setActiveTab] = useAtom(activeTabAtom);
  const updateActiveTab = useSetAtom(updateActiveTabAtom);
  const deleteTabFromAtom = useSetAtom(deleteTabAtom);
  const deleteLayout = useSetAtom(deleteLayoutAtom);
  const renameTab = useSetAtom(renameTabAtom);
  const addNewTab = useSetAtom(addNewTabAtom);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [deleteTab, setDeleteTab] = useState<typeof activeTab>();
  const [showTabsModal, setShowTabsModal] = useState(false);

  const setIsSideMenuOpen = useSetAtom(isSidebarOpenAtom);

  const currentLayout = layouts.find(
    (item) => item.id === deleteTab?.layout_id,
  );

  const { data } = useGetUserPlans();

  const handleAddNewTab = () => {
    const planType = data?.planType || "FREE"; // Default to FREE if not set
    const maxTabs = maxTabsByPlan[planType] || 3;

    if (tabs.length >= maxTabs) {
      setShowUpgradeModal(true);
      return;
    }

    // mixpanel.track("Tab Added", {
    //   from: "toolbar",
    //   plan: planType,
    // });

    addNewTab();
  };

  return (
    <Fragment>
      <div className="flex flex-1 gap-3 md:hidden">
        <button className="" onClick={() => setIsSideMenuOpen(true)}>
          <span className="">
            <MenuIconClosed />
          </span>
        </button>
        <button
          type="button"
          className="flex h-[26px] w-[26px] items-center justify-center rounded-md border-2 border-[#505050]"
          onClick={() => {
            setShowTabsModal(true);
          }}
        >
          <p className="text-xs leading-[18px] font-medium text-[#7A7A7A]">
            {tabs?.length}
          </p>
        </button>
      </div>
      <div className="items-center flex-1 hidden w-full gap-2 overflow-hidden md:flex">
        <button
          type="button"
          className="flex h-[32px] w-[32px] items-center justify-center rounded-md border border-[#121212]"
          onClick={handleAddNewTab}
        >
          <AddTab />
        </button>

        <div className="h-[18px] w-[1px] bg-[#141414]"></div>

        <div className="flex items-center flex-1 gap-2 pr-2 overflow-x-auto no-scrollbar">
          {tabs?.map((item) => {
            const isActive = activeTab.id === item.id;
            const showCloseBtn = tabs.length > 1;
            const tabLayout = layouts.find((tab) => tab.id === item?.layout_id);

            return (
              <TabButton
                key={item.id}
                name={tabLayout?.name || item.name}
                isActive={isActive}
                showCloseBtn={showCloseBtn}
                handleClick={() => {
                  updateActiveTab(item);
                }}
                handleClose={() => {
                  setDeleteTab(item);
                  setShowDeleteModal(true);
                }}
                handleNameChange={(name) => {
                  renameTab({ id: item.id, name });
                }}
              />
            );
          })}
        </div>
      </div>

      <ConfirmationModal
        handleCloseModal={() => {
          setShowDeleteModal(false);
        }}
        open={showDeleteModal}
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
          if (!deleteTab?.id) return;
          deleteTabFromAtom(deleteTab.id);
          if (currentLayout?.draft) {
            deleteLayout({ layoutId: currentLayout.id });
          }
          setShowDeleteModal(false);
        }}
      />

      <ModalContainer
        open={showUpgradeModal}
        handleClose={() => {
          setShowUpgradeModal(false);
        }}
        noHeader
        className="!md:max-w-[410px] bg-[transparent] !p-0"
      >
        <Upgrade
          plan={data?.planType}
          handleClose={() => {
            setShowUpgradeModal(false);
          }}
        />
      </ModalContainer>

      <ModalContainer
        open={showTabsModal}
        handleClose={() => {
          setShowTabsModal(false);
        }}
        noHeader
        className="!sm:w-[100%] h-[100%] max-h-[100%] !w-[100%] !max-w-[100%] rounded-[0] bg-[transparent] !p-0"
      >
        <MobileTab
          handleAddNewTab={handleAddNewTab}
          handleClick={(item) => {
            updateActiveTab(item);
          }}
          handleCloseTab={(item) => {
            setDeleteTab(item);
            setShowDeleteModal(true);
          }}
          handleCloseModal={() => {
            setShowTabsModal(false);
          }}
        />
      </ModalContainer>
    </Fragment>
  );
}
