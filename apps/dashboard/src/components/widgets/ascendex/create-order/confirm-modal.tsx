import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Checkbox from "@/components/ui/checkbox";

interface IProps {
  toggle: () => void;
  orderData: {
    action: boolean;
    size: string;
    price: string;
    liqPrice: string;
  };
  onConfirm: () => void;
  isLoading: boolean;
}

const ConfirmModal = (props: IProps) => {
  const { toggle, orderData, onConfirm, isLoading } = props;

  return (
    <div className="flex flex-col">
      <div className="flex-1 pt-8">
        <div className="flex flex-col gap-1 ">
          <div className="text-ideal flex items-center justify-between py-0.5">
            <p className="text-[#B0B0B0] ">Action</p>
            <p className={cn("text-[#00AF58] font-medium", { "text-[#DC2626]": !orderData.action })}>
              {orderData.action ? "Buy" : "Short"}
            </p>
          </div>
          <div className="text-ideal flex items-center justify-between py-0.5">
            <p className="text-[#B0B0B0] ">Size</p>
            <p className={cn("text-[#00AF58] font-medium ", { "text-[#DC2626]": !orderData.action })}>
              {orderData.size}
            </p>
          </div>
          <div className="text-ideal flex items-center justify-between py-0.5">
            <p className="text-[#B0B0B0] ">Price</p>
            <p className={"text-white font-medium "}>{orderData.price}</p>
          </div>
          <div className="text-ideal flex items-center justify-between py-0.5">
            <p className="text-[#B0B0B0] ">Estimated Liquidation Price</p>
            <p className={"text-white font-medium "}>{orderData.liqPrice}</p>
          </div>
        </div>
        <p className="text-[#B0B0B0] text-ideal pt-4">
          You Pay no gas. The order will be confirmed within a few seconds.
        </p>
        <div className="hidden pt-4">
          <Checkbox label="Don’t show this again" labelClassName="!text-ideal text-[#B0B0B0]" />
        </div>
      </div>
      <div className="flex items-center gap-2 pt-8">
        <Button
          onClick={onConfirm}
          isLoading={isLoading}
          className="flex-1 bg-[#171717] hover:opacity-90  text-white font-medium text-sm h-11"
        >
          Submit
        </Button>
      </div>
    </div>
  );
};

export default ConfirmModal;
