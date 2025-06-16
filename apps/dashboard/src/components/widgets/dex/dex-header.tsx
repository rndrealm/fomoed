import { WidgetDropdownMenu } from "@/components/dashboard/widget-options-menu";
import { Favourite } from "@/components/icons/icons";
import dashboard from "@/lib/assets/dashboard";
import Image from "next/image";
import React from "react";

const DexHeader = () => {
  return (
    <div>
      <div className="cursor-grab flex justify-center pt-4 pb-1">
        <div className="w-[36px] h-[5px] bg-[#444] rounded-[2px]"></div>
      </div>
      <div className="flex items-center justify-between px-3 mb-4">
        <div className="flex items-center gap-4">
          <div>
            <Image src={dashboard.swapGrey} alt="Exchange icon" />
          </div>
          <h1 className="text-base font-semibold text-[#878787]">Exchange</h1>
        </div>
        <div className="flex items-center gap-2">
          <button className="">
            <Favourite />
          </button>
          <WidgetDropdownMenu
            triggerClassName="border-none"
            deleteAction={() => {
              // setDeleteWidget(widget);
              // setShowDeleteModal(true);
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default DexHeader;
