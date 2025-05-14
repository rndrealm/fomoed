import dashboard from "@/lib/assets/dashboard";
import Image from "next/image";
import React from "react";
import { Button } from "../ui/button";
import { AddTab } from "../icons/icons";

interface IProps {
  handleAddWidget?: () => void;
}

export function AddWidget(props: IProps) {
  const { handleAddWidget } = props;

  return (
    <div className="w-full h-full flex justify-center items-center">
      <div className="flex flex-col gap-7 max-w-[260px]">
        <div className="">
          <Image src={dashboard.layout} alt="layout" />
        </div>
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-[6px]">
            <h3 className="text-white leading-[1.5] font-medium text-base text-center">
              Add Widget
            </h3>
            <p className="text-[#9a9e9e] text-sm text-center">
              Add a new widget to your dashboard or select from your saved
              layouts
            </p>
          </div>

          <div className="flex justify-center">
            <Button
              onClick={handleAddWidget}
              className="bg-[#ff3b10] hover:bg-[#ff3b10] hover:opacity-[0.8] text-xs leading-[1.5] font-medium p-2"
            >
              <AddTab />
              Add Widget
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
