import React, { Fragment, useEffect, useRef, useState } from "react";
import { AddTab, CloseTab, MenuIconClosed, TabLayout } from "../../icons/icons";
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
import { deleteLayoutAtom, layoutAtom } from "@/lib/atoms/layoutAtom";
import { MobileTab } from "./mobile-tab";
import { isSidebarOpenAtom } from "@/lib/atoms/utilsAtom";
import useSubscription from "@/hooks/subscription";

import { motion } from "motion/react";

const SvgInactive = () => {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M4.58692 4.00001H11.4079C11.953 3.99988 12.3245 3.99978 12.6477 4.06407C13.97 4.3271 15.0037 5.36075 15.2667 6.68306C15.331 7.00625 15.3309 7.37777 15.3308 7.92282V8.07721C15.3309 8.62226 15.331 8.9938 15.2667 9.31699C15.0037 10.6393 13.97 11.673 12.6477 11.936C12.3245 12.0003 11.953 12.0002 11.4079 12H4.58691C4.04185 12.0002 3.67032 12.0003 3.34712 11.936C2.02482 11.673 0.991159 10.6393 0.728136 9.31699C0.663847 8.99379 0.66394 8.62227 0.664075 8.0772V7.92285C0.66394 7.37778 0.663847 7.00626 0.728136 6.68306C0.991159 5.36076 2.02482 4.3271 3.34712 4.06407C3.67032 3.99978 4.04185 3.99988 4.58692 4.00001ZM4.5153 6.66666C4.43589 6.66663 4.34105 6.6666 4.25751 6.67342C4.1607 6.68133 4.02204 6.70163 3.87674 6.77566C3.68858 6.87153 3.5356 7.02451 3.43972 7.21268C3.36569 7.35797 3.34539 7.49663 3.33748 7.59345C3.33066 7.67699 3.33069 7.77183 3.33072 7.85124V8.14876C3.33069 8.22817 3.33066 8.32301 3.33748 8.40655C3.34539 8.50337 3.36569 8.64203 3.43972 8.78732C3.5356 8.97549 3.68858 9.12847 3.87674 9.22434C4.02204 9.29837 4.1607 9.31867 4.25751 9.32658C4.34105 9.3334 4.43589 9.33337 4.5153 9.33334H4.81282C4.89223 9.33337 4.98707 9.3334 5.07062 9.32658C5.16743 9.31867 5.30609 9.29837 5.45139 9.22434C5.63955 9.12847 5.79253 8.97549 5.8884 8.78732C5.96243 8.64203 5.98273 8.50337 5.99064 8.40655C5.99747 8.32301 5.99743 8.22817 5.9974 8.14876V7.85124C5.99743 7.77183 5.99747 7.67699 5.99064 7.59345C5.98273 7.49663 5.96243 7.35797 5.8884 7.21268C5.79253 7.02451 5.63955 6.87153 5.45139 6.77566C5.30609 6.70163 5.16743 6.68133 5.07062 6.67342C4.98707 6.6666 4.89223 6.66663 4.81282 6.66666H4.5153ZM7.84864 6.66666C7.76923 6.66663 7.67439 6.6666 7.59084 6.67342C7.49403 6.68133 7.35537 6.70163 7.21007 6.77566C7.02191 6.87153 6.86893 7.02451 6.77306 7.21268C6.69902 7.35797 6.67873 7.49663 6.67082 7.59345C6.66399 7.67699 6.66403 7.77183 6.66406 7.85124V8.14876C6.66403 8.22817 6.66399 8.32301 6.67082 8.40655C6.67873 8.50337 6.69902 8.64203 6.77306 8.78732C6.86893 8.97549 7.02191 9.12847 7.21007 9.22434C7.35537 9.29837 7.49403 9.31867 7.59084 9.32658C7.67439 9.3334 7.76923 9.33337 7.84864 9.33334H8.14615C8.22556 9.33337 8.3204 9.3334 8.40395 9.32658C8.50076 9.31867 8.63942 9.29837 8.78472 9.22434C8.97288 9.12847 9.12586 8.97549 9.22174 8.78732C9.29577 8.64203 9.31606 8.50337 9.32397 8.40655C9.3308 8.32301 9.33076 8.22816 9.33073 8.14875V7.85125C9.33076 7.77184 9.3308 7.677 9.32397 7.59345C9.31606 7.49663 9.29577 7.35797 9.22174 7.21268C9.12586 7.02451 8.97288 6.87153 8.78472 6.77566C8.63942 6.70163 8.50076 6.68133 8.40395 6.67342C8.3204 6.6666 8.22556 6.66663 8.14615 6.66666H7.84864ZM11.182 6.66666C11.1026 6.66663 11.0077 6.6666 10.9242 6.67342C10.8274 6.68133 10.6887 6.70163 10.5434 6.77566C10.3552 6.87153 10.2023 7.02451 10.1064 7.21268C10.0324 7.35797 10.0121 7.49663 10.0042 7.59345C9.99732 7.677 9.99736 7.77184 9.99739 7.85125V8.14875C9.99736 8.22816 9.99732 8.32301 10.0042 8.40655C10.0121 8.50337 10.0324 8.64203 10.1064 8.78732C10.2023 8.97549 10.3552 9.12847 10.5434 9.22434C10.6887 9.29837 10.8274 9.31867 10.9242 9.32658C11.0077 9.3334 11.1026 9.33337 11.182 9.33334H11.4795C11.5589 9.33337 11.6537 9.3334 11.7373 9.32658C11.8341 9.31867 11.9728 9.29837 12.1181 9.22434C12.3062 9.12847 12.4592 8.97549 12.5551 8.78732C12.6291 8.64203 12.6494 8.50337 12.6573 8.40655C12.6641 8.32301 12.6641 8.22818 12.6641 8.14877V7.85125C12.6641 7.77184 12.6641 7.67699 12.6573 7.59345C12.6494 7.49663 12.6291 7.35797 12.5551 7.21268C12.4592 7.02451 12.3062 6.87153 12.1181 6.77566C11.9728 6.70163 11.8341 6.68133 11.7373 6.67342C11.6537 6.6666 11.5589 6.66663 11.4795 6.66666H11.182Z"
        fill="#5D5D5D"
      />
    </svg>
  );
};

const SvgActive = () => {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M3.00194 3.60039C2.83294 3.60039 2.6901 3.54322 2.57344 3.42889C2.45677 3.31456 2.39844 3.17289 2.39844 3.00389C2.39844 2.83489 2.4556 2.69206 2.56994 2.57539C2.68427 2.45872 2.82594 2.40039 2.99494 2.40039C3.16394 2.40039 3.30677 2.45756 3.42344 2.57189C3.5401 2.68622 3.59844 2.82789 3.59844 2.99689C3.59844 3.16589 3.54127 3.30872 3.42694 3.42539C3.3126 3.54206 3.17094 3.60039 3.00194 3.60039ZM5.50194 3.60039C5.33294 3.60039 5.1901 3.54322 5.07344 3.42889C4.95677 3.31456 4.89844 3.17289 4.89844 3.00389C4.89844 2.83489 4.9556 2.69206 5.06994 2.57539C5.18427 2.45872 5.32594 2.40039 5.49494 2.40039C5.66394 2.40039 5.80677 2.45756 5.92344 2.57189C6.0401 2.68622 6.09844 2.82789 6.09844 2.99689C6.09844 3.16589 6.04127 3.30872 5.92694 3.42539C5.8126 3.54206 5.67094 3.60039 5.50194 3.60039ZM3.00194 6.10039C2.83294 6.10039 2.6901 6.04322 2.57344 5.92889C2.45677 5.81456 2.39844 5.67289 2.39844 5.50389C2.39844 5.33489 2.4556 5.19206 2.56994 5.07539C2.68427 4.95872 2.82594 4.90039 2.99494 4.90039C3.16394 4.90039 3.30677 4.95756 3.42344 5.07189C3.5401 5.18622 3.59844 5.32789 3.59844 5.49689C3.59844 5.66589 3.54127 5.80872 3.42694 5.92539C3.3126 6.04206 3.17094 6.10039 3.00194 6.10039ZM3.00194 8.60039C2.83294 8.60039 2.6901 8.54322 2.57344 8.42889C2.45677 8.31456 2.39844 8.17289 2.39844 8.00389C2.39844 7.83489 2.4556 7.69206 2.56994 7.57539C2.68427 7.45872 2.82594 7.40039 2.99494 7.40039C3.16394 7.40039 3.30677 7.45756 3.42344 7.57189C3.5401 7.68622 3.59844 7.82789 3.59844 7.99689C3.59844 8.16589 3.54127 8.30872 3.42694 8.42539C3.3126 8.54206 3.17094 8.60039 3.00194 8.60039ZM3.00194 11.1004C2.83294 11.1004 2.6901 11.0432 2.57344 10.9289C2.45677 10.8146 2.39844 10.6729 2.39844 10.5039C2.39844 10.3349 2.4556 10.1921 2.56994 10.0754C2.68427 9.95872 2.82594 9.90039 2.99494 9.90039C3.16394 9.90039 3.30677 9.95756 3.42344 10.0719C3.5401 10.1862 3.59844 10.3279 3.59844 10.4969C3.59844 10.6659 3.54127 10.8087 3.42694 10.9254C3.3126 11.0421 3.17094 11.1004 3.00194 11.1004ZM13.0019 11.1004C12.8329 11.1004 12.6901 11.0432 12.5734 10.9289C12.4568 10.8146 12.3984 10.6729 12.3984 10.5039C12.3984 10.3349 12.4556 10.1921 12.5699 10.0754C12.6843 9.95872 12.8259 9.90039 12.9949 9.90039C13.1639 9.90039 13.3068 9.95756 13.4234 10.0719C13.5401 10.1862 13.5984 10.3279 13.5984 10.4969C13.5984 10.6659 13.5413 10.8087 13.4269 10.9254C13.3126 11.0421 13.1709 11.1004 13.0019 11.1004ZM3.00194 13.6004C2.83294 13.6004 2.6901 13.5432 2.57344 13.4289C2.45677 13.3146 2.39844 13.1729 2.39844 13.0039C2.39844 12.8349 2.4556 12.6921 2.56994 12.5754C2.68427 12.4587 2.82594 12.4004 2.99494 12.4004C3.16394 12.4004 3.30677 12.4576 3.42344 12.5719C3.5401 12.6862 3.59844 12.8279 3.59844 12.9969C3.59844 13.1659 3.54127 13.3087 3.42694 13.4254C3.3126 13.5421 3.17094 13.6004 3.00194 13.6004ZM5.50194 13.6004C5.33294 13.6004 5.1901 13.5432 5.07344 13.4289C4.95677 13.3146 4.89844 13.1729 4.89844 13.0039C4.89844 12.8349 4.9556 12.6921 5.06994 12.5754C5.18427 12.4587 5.32594 12.4004 5.49494 12.4004C5.66394 12.4004 5.80677 12.4576 5.92344 12.5719C6.0401 12.6862 6.09844 12.8279 6.09844 12.9969C6.09844 13.1659 6.04127 13.3087 5.92694 13.4254C5.8126 13.5421 5.67094 13.6004 5.50194 13.6004ZM8.00194 13.6004C7.83294 13.6004 7.6901 13.5432 7.57344 13.4289C7.45677 13.3146 7.39844 13.1729 7.39844 13.0039C7.39844 12.8349 7.4556 12.6921 7.56994 12.5754C7.68427 12.4587 7.82594 12.4004 7.99494 12.4004C8.16394 12.4004 8.30677 12.4576 8.42344 12.5719C8.5401 12.6862 8.59844 12.8279 8.59844 12.9969C8.59844 13.1659 8.54127 13.3087 8.42694 13.4254C8.3126 13.5421 8.17094 13.6004 8.00194 13.6004ZM10.5019 13.6004C10.3329 13.6004 10.1901 13.5432 10.0734 13.4289C9.95677 13.3146 9.89844 13.1729 9.89844 13.0039C9.89844 12.8349 9.9556 12.6921 10.0699 12.5754C10.1843 12.4587 10.3259 12.4004 10.4949 12.4004C10.6639 12.4004 10.8068 12.4576 10.9234 12.5719C11.0401 12.6862 11.0984 12.8279 11.0984 12.9969C11.0984 13.1659 11.0413 13.3087 10.9269 13.4254C10.8126 13.5421 10.6709 13.6004 10.5019 13.6004ZM13.0019 13.6004C12.8329 13.6004 12.6901 13.5432 12.5734 13.4289C12.4568 13.3146 12.3984 13.1729 12.3984 13.0039C12.3984 12.8349 12.4556 12.6921 12.5699 12.5754C12.6843 12.4587 12.8259 12.4004 12.9949 12.4004C13.1639 12.4004 13.3068 12.4576 13.4234 12.5719C13.5401 12.6862 13.5984 12.8279 13.5984 12.9969C13.5984 13.1659 13.5413 13.3087 13.4269 13.4254C13.3126 13.5421 13.1709 13.6004 13.0019 13.6004ZM12.3984 8.06706V5.50206C12.3984 4.96761 12.2137 4.51706 11.8443 4.15039C11.4748 3.78372 11.0262 3.60039 10.4984 3.60039H7.99844C7.82844 3.60039 7.68594 3.54322 7.57094 3.42889C7.45594 3.31456 7.39844 3.17289 7.39844 3.00389C7.39844 2.83489 7.45594 2.69206 7.57094 2.57539C7.68594 2.45872 7.82844 2.40039 7.99844 2.40039H10.5004C11.3658 2.40039 12.0984 2.70039 12.6984 3.30039C13.2984 3.90039 13.5984 4.63372 13.5984 5.50039V8.06706C13.5984 8.23706 13.5413 8.37956 13.4269 8.49456C13.3126 8.60956 13.1709 8.66706 13.0019 8.66706C12.8329 8.66706 12.6901 8.60956 12.5734 8.49456C12.4568 8.37956 12.3984 8.23706 12.3984 8.06706Z"
        fill="#8E8E8E"
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
        <motion.div
          animate={{ width: isActive ? "200px" : "126px" }}
          transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
          className={cn(
            "flex h-[64px] max-h-[63px] w-[200px] max-w-[200px] items-center justify-between gap-2 rounded-none bordets border-r-[1px] border-[#181818] px-5",
            isActive ? "bg-[#171717]" : "bg-[#0A0A0A]",
          )}
        >
          <div className="flex w-full flex-1 items-center justify-center gap-2">
            {/* <TabLayout active={isActive} /> */}

            <div className="flex h-[16px] w-[16px] items-center justify-center">
              {isActive ? <SvgActive /> : <SvgInactive />}
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
  const {activePlan} = useSubscription();

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
          <p className="text-xs leading-[18px] font-medium text-[#7A7A7A]">
            {tabs?.length}
          </p>
        </button>
      </div>
      <div className="hidden max-w-fit flex-1 items-center justify-center gap-0 overflow-hidden md:flex">
        {/* <div className="h-[18px] w-[1px] bg-[#141414]"></div> */}

        <div className="no-scrollbar flex items-center gap-0 overflow-x-auto border-l border-[#111111]">
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
