import React, { Fragment, useEffect, useRef, useState } from "react";
import { AddTab, CloseTab, MenuIconClosed, TabIconActive, TabIconInactive, TabLayout } from "../../icons/icons";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
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
import { deleteLayoutAtom, editLayoutNameAtom, layoutAtom } from "@/lib/atoms/layoutAtom";
import { MobileTab } from "./mobile-tab";
import { isSidebarOpenAtom } from "@/lib/atoms/utilsAtom";
import useSubscription from "@/hooks/subscription";

import { motion } from "motion/react";

const SvgInactive = () => {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M4.58692 4.00001H11.4079C11.953 3.99988 12.3245 3.99978 12.6477 4.06407C13.97 4.3271 15.0037 5.36075 15.2667 6.68306C15.331 7.00625 15.3309 7.37777 15.3308 7.92282V8.07721C15.3309 8.62226 15.331 8.9938 15.2667 9.31699C15.0037 10.6393 13.97 11.673 12.6477 11.936C12.3245 12.0003 11.953 12.0002 11.4079 12H4.58691C4.04185 12.0002 3.67032 12.0003 3.34712 11.936C2.02482 11.673 0.991159 10.6393 0.728136 9.31699C0.663847 8.99379 0.66394 8.62227 0.664075 8.0772V7.92285C0.66394 7.37778 0.663847 7.00626 0.728136 6.68306C0.991159 5.36076 2.02482 4.3271 3.34712 4.06407C3.67032 3.99978 4.04185 3.99988 4.58692 4.00001ZM4.5153 6.66666C4.43589 6.66663 4.34105 6.6666 4.25751 6.67342C4.1607 6.68133 4.02204 6.70163 3.87674 6.77566C3.68858 6.87153 3.5356 7.02451 3.43972 7.21268C3.36569 7.35797 3.34539 7.49663 3.33748 7.59345C3.33066 7.67699 3.33069 7.77183 3.33072 7.85124V8.14876C3.33069 8.22817 3.33066 8.32301 3.33748 8.40655C3.34539 8.50337 3.36569 8.64203 3.43972 8.78732C3.5356 8.97549 3.68858 9.12847 3.87674 9.22434C4.02204 9.29837 4.1607 9.31867 4.25751 9.32658C4.34105 9.3334 4.43589 9.33337 4.5153 9.33334H4.81282C4.89223 9.33337 4.98707 9.3334 5.07062 9.32658C5.16743 9.31867 5.30609 9.29837 5.45139 9.22434C5.63955 9.12847 5.79253 8.97549 5.8884 8.78732C5.96243 8.64203 5.98273 8.50337 5.99064 8.40655C5.99747 8.32301 5.99743 8.22817 5.9974 8.14876V7.85124C5.99743 7.77183 5.99747 7.67699 5.99064 7.59345C5.98273 7.49663 5.96243 7.35797 5.8884 7.21268C5.79253 7.02451 5.63955 6.87153 5.45139 6.77566C5.30609 6.70163 5.16743 6.68133 5.07062 6.67342C4.98707 6.6666 4.89223 6.66663 4.81282 6.66666H4.5153ZM7.84864 6.66666C7.76923 6.66663 7.67439 6.6666 7.59084 6.67342C7.49403 6.68133 7.35537 6.70163 7.21007 6.77566C7.02191 6.87153 6.86893 7.02451 6.77306 7.21268C6.69902 7.35797 6.67873 7.49663 6.67082 7.59345C6.66399 7.67699 6.66403 7.77183 6.66406 7.85124V8.14876C6.66403 8.22817 6.66399 8.32301 6.67082 8.40655C6.67873 8.50337 6.69902 8.64203 6.77306 8.78732C6.86893 8.97549 7.02191 9.12847 7.21007 9.22434C7.35537 9.29837 7.49403 9.31867 7.59084 9.32658C7.67439 9.3334 7.76923 9.33337 7.84864 9.33334H8.14615C8.22556 9.33337 8.3204 9.3334 8.40395 9.32658C8.50076 9.31867 8.63942 9.29837 8.78472 9.22434C8.97288 9.12847 9.12586 8.97549 9.22174 8.78732C9.29577 8.64203 9.31606 8.50337 9.32397 8.40655C9.3308 8.32301 9.33076 8.22816 9.33073 8.14875V7.85125C9.33076 7.77184 9.3308 7.677 9.32397 7.59345C9.31606 7.49663 9.29577 7.35797 9.22174 7.21268C9.12586 7.02451 8.97288 6.87153 8.78472 6.77566C8.63942 6.70163 8.50076 6.68133 8.40395 6.67342C8.3204 6.6666 8.22556 6.66663 8.14615 6.66666H7.84864ZM11.182 6.66666C11.1026 6.66663 11.0077 6.6666 10.9242 6.67342C10.8274 6.68133 10.6887 6.70163 10.5434 6.77566C10.3552 6.87153 10.2023 7.02451 10.1064 7.21268C10.0324 7.35797 10.0121 7.49663 10.0042 7.59345C9.99732 7.677 9.99736 7.77184 9.99739 7.85125V8.14875C9.99736 8.22816 9.99732 8.32301 10.0042 8.40655C10.0121 8.50337 10.0324 8.64203 10.1064 8.78732C10.2023 8.97549 10.3552 9.12847 10.5434 9.22434C10.6887 9.29837 10.8274 9.31867 10.9242 9.32658C11.0077 9.3334 11.1026 9.33337 11.182 9.33334H11.4795C11.5589 9.33337 11.6537 9.3334 11.7373 9.32658C11.8341 9.31867 11.9728 9.29837 12.1181 9.22434C12.3062 9.12847 12.4592 8.97549 12.5551 8.78732C12.6291 8.64203 12.6494 8.50337 12.6573 8.40655C12.6641 8.32301 12.6641 8.22818 12.6641 8.14877V7.85125C12.6641 7.77184 12.6641 7.67699 12.6573 7.59345C12.6494 7.49663 12.6291 7.35797 12.5551 7.21268C12.4592 7.02451 12.3062 6.87153 12.1181 6.77566C11.9728 6.70163 11.8341 6.68133 11.7373 6.67342C11.6537 6.6666 11.5589 6.66663 11.4795 6.66666H11.182Z"
        fill="#5D5D5D"
      />
    </svg>
  );
};

interface ITabButton {
  handleClick?: () => void;
  handleClose?: () => void;
  handleNameChange: (name: string) => void;
  isActive?: boolean;
  name: string;
  showCloseBtn: boolean;
}

export function TabButton(props: ITabButton) {
  const { handleClick, handleClose, isActive, name, showCloseBtn, handleNameChange } = props;
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
        <motion.div
          animate={{ width: isActive ? "200px" : "126px" }}
          transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
          className={cn(
            "flex h-[64px] max-h-[63px] w-[200px] max-w-[200px] items-center justify-between gap-2 rounded-none bordets border-r-[1px] border-[#181818] px-5",
            isActive ? "bg-[#171717]" : "bg-[#0A0A0A]",
          )}
        >
          <div className="flex w-full flex-1 items-center justify-center gap-2">
            <div className="flex h-[16px] w-[16px] items-center justify-center">
              {isActive ? <TabIconActive /> : <TabIconInactive />}
            </div>

            <div className="relative flex flex-1 pb-[1px]">
              {/* linear bg for non-active tabs */}
              <motion.div
                animate={{ opacity: isActive ? 0 : 1 }}
                className="pointer-events-none absolute z-[0] bg-gradient-to-r from-transparent to-[#0a0a0a] inset-0 w-full h-full"
              ></motion.div>
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
                    " pointer-events-none h-full w-full flex-1 truncate text-[14px] font-medium focus:shadow-none focus:ring-0 focus:ring-offset-0 focus-visible:ring-0 [&:focus]:outline-none [&:focus-visible]:outline-none",
                    isActive ? "text-[#D1D1D1]" : "text-[#919191]",
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
          </div>
        </motion.div>
      </button>

      <div className="absolute right-4 top-1/2 translate-y-[-50%] flex h-[16px] w-[16px] items-center justify-center">
        <RenderIf condition={showCloseBtn && (isActive || hover)}>
          <button type="button" className="scale-[0.825]" onClick={handleClose}>
            <CloseTab fill="#BFBFBF" />
          </button>
        </RenderIf>
      </div>
    </div>
  );
}

export function NewTabs() {
  const { activePlan } = useSubscription();

  const tabs = useAtomValue(tabsAtom);
  const layouts = useAtomValue(layoutAtom);
  const [activeTab, setActiveTab] = useAtom(activeTabAtom);
  const updateActiveTab = useSetAtom(updateActiveTabAtom);
  const deleteTabFromAtom = useSetAtom(deleteTabAtom);
  const deleteLayout = useSetAtom(deleteLayoutAtom);
  const renameTab = useSetAtom(renameTabAtom);
  const addNewTab = useSetAtom(addNewTabAtom);
  const editLayoutName = useSetAtom(editLayoutNameAtom);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [deleteTab, setDeleteTab] = useState<typeof activeTab>();
  const [showTabsModal, setShowTabsModal] = useState(false);

  const setIsSideMenuOpen = useSetAtom(isSidebarOpenAtom);

  const currentLayout = layouts.find((item) => item.id === deleteTab?.layout_id);

  const { data } = useGetUserPlans();

  const handleAddNewTab = () => {
    const planType = data?.hasActivePlans || "FREE"; // Default to FREE if not set
    const maxTabs = maxTabsByPlan[planType] || 3;

    if (tabs.length >= maxTabs) {
      setShowUpgradeModal(true);
      return;
    }

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
          <p className="text-xs leading-[18px] font-medium text-[#7A7A7A]">{tabs?.length}</p>
        </button>
      </div>
      <div className="hidden max-w-fit flex-1 items-center justify-center gap-0 overflow-hidden md:flex">
        {/* <div className="h-[18px] w-[1px] bg-[#141414]"></div> */}

        <div className="no-scrollbar flex items-center gap-0 overflow-x-auto border-l border-[#222222]">
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
                  if (item?.layout_id) {
                    editLayoutName({ layoutId: item.layout_id || "", newName: name });
                  } else {
                    renameTab({ id: item.id, name });
                  }
                }}
              />
            );
          })}
        </div>

        <button
          type="button"
          className="flex h-full w-[64px] min-w-[48px] items-center justify-center rounded-none"
          onClick={handleAddNewTab}
        >
          <div className="scale-[0.8]">
            <AddTab fill="#FFFFFF" />
          </div>

          {/* <button
            className="bg-[#131313] border-[1px] border-[#181818] rounded-[6px] h-10 w-10 flex items-center justify-center"
          >
            <AddTab fill="#fff" />
          </button> */}
        </button>
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
          plan={activePlan}
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
