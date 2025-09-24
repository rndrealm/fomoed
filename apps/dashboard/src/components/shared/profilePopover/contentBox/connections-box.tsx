import React from "react";
import { ProfileIcon } from "../../profile-icon";
import PlusIcon from "@/components/icons/PlusIcon";
import { Question } from "@/components/icons/icons";

const ConnectionsBox = () => {
  return (
    <div className="scrollbar flex-1 w-full flex flex-col gap-8 bg-[#131313] px-6 md:px-10 pb-6 pt-13 overflow-y-auto">
      <div className="h-full flex flex-col items-start gap-6 text-white text-[14px] font-normal">
        <div className="w-full flex flex-col gap-2">
          <p className="font-medium">Connections</p>
          <div className="w-full h-[90px] rounded-[8px] p-4 bg-white text-black">
            {/*  */}
            <span className="underline cursor-pointer">Learn More</span>
          </div>
        </div>
        <div className="w-full flex flex-col gap-2">
          <p className="font-medium">Permissions</p>
          <div className="w-full h-[90px] rounded-[8px] p-4 bg-white text-black">
            {/*  */}
            <span className="underline cursor-pointer">Learn More</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConnectionsBox;
