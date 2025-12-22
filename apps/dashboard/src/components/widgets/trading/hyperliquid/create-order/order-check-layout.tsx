import React, { Fragment, ReactNode, useState } from "react";
import { useAccount } from "wagmi";
import ConnectButton from "../../../dex/connect-button";
import { cn } from "@/lib/utils";
import { useCheckAccess } from "../../chart/trading-view/hyperliquid/use-check-access";
import ApproveAgentButton from "./approve-agent-button";
import CreateAgentButton from "./create-agent-button";
import { useGetBuilderFee } from "@/services/queries/hyperliquid";
import { Button } from "@/components/ui/button";
import { ModalContainer } from "@/components/shared";
import ApproveBuilderModal from "../modals/approve-builder-modal";

interface IProps {
  children: ReactNode;
  buttonClassName?: string;
  buttonContainerClassName?: string;
  buttonWrapperClassName?: string;
  approveClassName?: string;
}

const OrderCheckLayout = (props: IProps) => {
  const { children, buttonClassName, buttonWrapperClassName, buttonContainerClassName, approveClassName } = props;
  const account = useAccount();
  const tradeAccess = useCheckAccess();
  const { data: builderData } = useGetBuilderFee(account.address);

  const [isOpen, setIsOpen] = useState(false);
  const toggleModal = () => {
    setIsOpen(!isOpen);
  };

  if (tradeAccess.blocker === "wallet") {
    return (
      <ConnectButton
        dropdownClassName="bg-[#1E1E20] rounded-[8px]"
        dropdownTextClassName="text-[#B0B0B0]"
        buttonClassName={cn(
          "bg-[#51D2C1] w-full cursor-pointer py-0 px-3.5 rounded-md text-[#010101] font-medium text-xxs h-7",
          buttonClassName,
        )}
        buttonContainerClassName={cn("w-full", buttonContainerClassName)}
        buttonWrapperClassName={cn("w-full", buttonWrapperClassName)}
      />
    );
  }
  if (tradeAccess.blocker === "auth") {
    return <CreateAgentButton className={approveClassName} />;
  }
  if (tradeAccess.blocker === "api") {
    return <ApproveAgentButton className={approveClassName} />;
  }
  // if (builderData === 0) {
  //   return (
  //     <>
  //       <div className={buttonWrapperClassName}>
  //         <Button
  //           onClick={toggleModal}
  //           type="button"
  //           className={cn(
  //             "w-full bg-[#7637BA] hover:bg-[#7637BA] text-white font-medium text-[10px] leading-[14px] h-[28px]",
  //             approveClassName,
  //           )}
  //         >
  //           Confirm Trading Preferences
  //         </Button>
  //       </div>
  //       <ModalContainer
  //         open={isOpen}
  //         handleClose={toggleModal}
  //         title="Confirm Trading Preferences"
  //         headerClassName=" w-full text-lg text-center font-medium"
  //         className="!max-w-[462px] px-6 py-6 bg-[#141416] gap-0"
  //         hideX
  //       >
  //         <ApproveBuilderModal toggleModal={toggleModal} />
  //       </ModalContainer>
  //     </>
  //   );
  // }
  return <Fragment>{children}</Fragment>;
};

export default OrderCheckLayout;
