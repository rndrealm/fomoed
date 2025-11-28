import React, { Fragment, ReactNode } from "react";
import { useAccount } from "wagmi";
import ConnectButton from "../../dex/connect-button";
import { cn } from "@/lib/utils";

interface IProps {
  children: ReactNode;
  buttonClassName?: string;
  buttonContainerClassName?: string;
}

const OrderCheckLayout = (props: IProps) => {
  const { children, buttonClassName, buttonContainerClassName } = props;
  const account = useAccount();

  if (!account.isConnected) {
    return (
      <ConnectButton
        dropdownClassName="bg-[#1E1E20] rounded-[8px]"
        dropdownTextClassName="text-[#B0B0B0]"
        buttonClassName={cn(
          "bg-[#51D2C1] w-full cursor-pointer py-0 px-3.5 rounded-md text-[#010101] font-medium text-xxs h-7",
          buttonClassName,
        )}
        buttonContainerClassName={cn("w-full", buttonContainerClassName)}
      />
    );
  }
  return <Fragment>{children}</Fragment>;
};

export default OrderCheckLayout;
