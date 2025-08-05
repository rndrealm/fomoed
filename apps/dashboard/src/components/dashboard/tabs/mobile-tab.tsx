import React from "react";
import mixpanel from "mixpanel-browser";
import { Navbar } from "@/components/shared";
import { AddTab, Delete } from "@/components/icons/icons";
import { useAtomValue } from "jotai";
import { tabsAtom, TabType } from "@/lib/atoms/tabsAtom";
import { layoutAtom } from "@/lib/atoms/layoutAtom";

interface IMobileTabItem {
  name: string;
  handleClick: () => void;
  handleClose: () => void;
}

function MobileTabItem(props: IMobileTabItem) {
  const { name, handleClick, handleClose } = props;

  return (
    <div
      className="flex h-[200px] w-full cursor-pointer flex-col overflow-hidden rounded-[8px] border border-[#333333]"
      onClick={handleClick}
    >
      <div className="flex justify-between bg-[#131313] p-2">
        <p className="line-clamp-1 flex-1 text-xs leading-[18px] font-medium text-[#7A7A7A]">
          {name}
        </p>

        <button
          type="button"
          className="flex h-[20px] w-[20px] items-center justify-center"
          onClick={(e) => {
            e.stopPropagation();
            handleClose();
          }}
        >
          <Delete fill="#5B5B5B" />
        </button>
      </div>
      <div className="flex flex-1 p-[10px]">
        <div className="flex flex-col flex-1 gap-1">
          <div className="flex-1 rounded-[5px] bg-[#131313]"></div>
          <div className="flex flex-1 gap-1">
            <div className="flex-1 rounded-[5px] bg-[#131313]"></div>
            <div className="flex-1 rounded-[5px] bg-[#131313]"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface IProps {
  handleAddNewTab: () => void;
  handleClick: (tab: TabType) => void;
  handleCloseTab: (tab: TabType) => void;
  handleCloseModal: () => void;
}

export function MobileTab(props: IProps) {
  const { handleAddNewTab, handleClick, handleCloseTab, handleCloseModal } =
    props;

  const tabs = useAtomValue(tabsAtom);
  const layouts = useAtomValue(layoutAtom);

  return (
    <div className="flex h-[100%] w-full flex-col gap-2 overflow-hidden bg-[#0A0A0A] pt-4">
      {/* <Navbar /> */}
      <div className="flex flex-col flex-1 gap-4 px-2 overflow-hidden sm:px-4">
        <p className="text-base leading-[24px] font-medium text-[#9A9E9E]">
          Your Workspaces
        </p>
        <div className="scrollbar h-[full] flex-1 overflow-auto pb-2">
          <div className="grid grid-cols-2 gap-4">
            {tabs.map((item) => {
              const tabLayout = layouts.find(
                (tab) => tab.id === item?.layout_id,
              );

              return (
                <MobileTabItem
                  key={item.id}
                  name={tabLayout?.name || item.name}
                  handleClick={() => {
                    handleClick(item);
                    handleCloseModal();
                  }}
                  handleClose={() => {
                    handleCloseTab(item);
                    handleCloseModal();
                  }}
                />
              );
            })}
          </div>
        </div>
      </div>

      <div className="flex justify-center border-t border-[#1C1C1C] py-4">
        <button
          type="button"
          className="flex h-[40px] w-[40px] items-center justify-center rounded-md border border-[#121212]"
          onClick={() => {
            handleAddNewTab();
            mixpanel.track("Tab Added", {
              from: "toolbar",
              // plan: planType, Todo: Uncomment when planType is available
            });
            handleCloseModal();
          }}
        >
          <AddTab />
        </button>
      </div>
    </div>
  );
}
