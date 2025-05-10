import React, { Fragment, useEffect, useRef, useState } from "react";
import { AddTab, CloseTab, TabLayout } from "../../icons/icons";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import {
  activeTabAtom,
  addNewTabAtom,
  deleteTabAtom,
  renameTabAtom,
  tabsAtom,
} from "@/lib/atoms/tabsAtom";
import { cn, maxTabsByPlan } from "@/lib/utils";
import { ConfirmationModal, Upgrade } from "../../modals";
import { ModalContainer, RenderIf } from "../../shared";
import { useGetUserPlans } from "@/services/queries/subscriptions";

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
          inputRef.current?.focus();
          inputRef.current?.select();
        }}
      >
        <div
          className={cn(
            "flex items-center gap-2 w-[170px] h-[32px] px-2 rounded-md gap-3 justify-between",
            isActive ? "bg-[#252525]" : "bg-[#111]"
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
                    "text-xs font-medium truncate w-full h-full flex-1 pointer-events-none focus-visible:ring-0 focus:outline-none focus:ring-0 focus:ring-offset-0 focus:shadow-none [&:focus-visible]:outline-none [&:focus]:outline-none",
                    isActive ? "text-white" : "text-[#7a7a7a]"
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
            <div className="w-[16px] h-[16px]"></div>
          </div>
        </div>
      </button>
      <RenderIf condition={showCloseBtn && (isActive || hover)}>
        <button
          type="button"
          className="absolute right-[8px] top-[50%] translate-y-[-50%]"
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
  const [activeTab, setActiveTab] = useAtom(activeTabAtom);
  const deleteTabFromAtom = useSetAtom(deleteTabAtom);
  const renameTab = useSetAtom(renameTabAtom);
  const addNewTab = useSetAtom(addNewTabAtom);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [deleteTab, setDeleteTab] = useState<typeof activeTab>();

  const { data } = useGetUserPlans();

  const handleAddNewTab = () => {
    const planType = data?.planType || "FREE"; // Default to FREE if not set
    const maxTabs = maxTabsByPlan[planType] || 3;

    if (tabs.length >= maxTabs) {
      setShowUpgradeModal(true);
      return;
    }

    addNewTab();
  };

  return (
    <Fragment>
      <div className="flex items-center flex-1 w-full gap-2 overflow-hidden">
        <button
          type="button"
          className="h-[32px] w-[32px] flex items-center justify-center rounded-md border border-[#121212]"
          onClick={handleAddNewTab}
        >
          <AddTab />
        </button>

        <div className="h-[18px] w-[1px] bg-[#141414]"></div>

        <div className="flex items-center flex-1 gap-2 pr-2 overflow-x-auto scrollbar">
          {tabs?.map((item) => {
            const isActive = activeTab.id === item.id;
            const showCloseBtn = tabs.length > 1;

            return (
              <TabButton
                key={item.id}
                name={item.name}
                isActive={isActive}
                showCloseBtn={showCloseBtn}
                handleClick={() => {
                  setActiveTab(item);
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
        title={`Close "${deleteTab?.name}" Tab`}
        details="Unsaved Tabs will be lost forever and cannot be recovered"
        cancelBtnText="Cancel"
        confirmBtnText="Confirm"
        handleConfirm={() => {
          if (!deleteTab?.id) return;
          deleteTabFromAtom(deleteTab.id);
          setShowDeleteModal(false);
        }}
      />

      <ModalContainer
        open={showUpgradeModal}
        handleClose={() => {
          setShowUpgradeModal(false);
        }}
        noHeader
        className="!max-w-[410px] !p-0 rounded-[24px]"
      >
        <Upgrade />
      </ModalContainer>
    </Fragment>
  );
}
