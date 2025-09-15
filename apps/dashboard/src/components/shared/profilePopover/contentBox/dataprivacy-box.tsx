import React from "react";
import { ProfileIcon } from "../../profile-icon";
import PlusIcon from "@/components/icons/PlusIcon";
import { Question } from "@/components/icons/icons";

const DataPrivacyBox = () => {
  return (
    <div className="max-w-[600px] scrollbar flex-1 w-full flex flex-col gap-8 bg-[#131313] px-6 md:px-10 pb-6 pt-13 overflow-y-auto">
      <div className="h-full flex flex-col items-start gap-6 text-white text-xs font-normal">
        <div className="flex flex-col gap-2">
          <p className="font-semibold">Use data to improve Fomoed</p>
          <p>
            Allow us to use and process your data to understand your services.{" "}
            <span className="underline cursor-not-allowed">Learn More</span>
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <p className="font-semibold">Use data to make Fomoed work</p>
          <p>
            We need to store and process your data in order to provide you with the basic Fomoed service. By using
            Fomoed you allow us to provide this basic service you can stop this by{" "}
            <span className="underline cursor-not-allowed">deleting or disabling your account.</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default DataPrivacyBox;
