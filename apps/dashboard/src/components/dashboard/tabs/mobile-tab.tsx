import React from "react";
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
      className="flex flex-col h-[200px] rounded-[8px] border border-[#333333] w-full overflow-hidden cursor-pointer"
      onClick={handleClick}
    >
      <div className="flex justify-between p-2 bg-[#131313]">
        <p className="text-[#7A7A7A] text-xs font-medium leading-[18px] flex-1 line-clamp-1">
          {name}
        </p>

        <button
          type="button"
          className="w-[20px] h-[20px] flex items-center justify-center"
          onClick={(e) => {
            e.stopPropagation();
            handleClose();
          }}
        >
          <Delete fill="#5B5B5B" />
        </button>
      </div>
      <div className="p-[10px] flex flex-1">
        <div className="flex flex-col gap-1 flex-1">
          <div className="bg-[#131313] rounded-[5px] flex-1"></div>
          <div className="flex flex-1 gap-1">
            <div className="bg-[#131313] rounded-[5px] flex-1"></div>
            <div className="bg-[#131313] rounded-[5px] flex-1"></div>
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
    <div className="h-[100%] w-full bg-[#0A0A0A] flex flex-col gap-2 overflow-hidden">
      <Navbar />
      <div className="px-2 sm:px-4 flex flex-col gap-4 flex-1 overflow-hidden">
        <p className="text-[#9A9E9E] font-medium text-base leading-[24px]">
          Your Workspaces
        </p>
        <div className="flex-1 scrollbar overflow-auto h-[full] pb-2">
          <div className="grid grid-cols-2 gap-4">
            {tabs.map((item) => {
              const tabLayout = layouts.find(
                (tab) => tab.id === item?.layout_id
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

      <div className="flex justify-center py-4 border-[#1C1C1C] border-t">
        <button
          type="button"
          className="h-[40px] w-[40px] flex items-center justify-center rounded-md border border-[#121212]"
          onClick={() => {
            handleAddNewTab();
            handleCloseModal();
          }}
        >
          <AddTab />
        </button>
      </div>
    </div>
  );
}
