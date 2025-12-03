import { TransferIcon } from "@/components/icons/icon2";
import { ModalContainer } from "@/components/shared";
import { Button } from "@/components/ui/button";
import React, { useState } from "react";
import PerpSpotTransferModal from "../modals/perp-spot-transfer-modal";
import { useAccount } from "wagmi";
import WithdrawalModal from "../modals/withdrawal-modal";
import DepositModal from "../modals/deposit-modal";

interface IProps {
  toPerp: boolean;
}

const TransferButtons = ({ toPerp }: IProps) => {
  const [isOpenTransfer, setIsOpenTransfer] = useState(false);
  const toggleModalTransfer = () => {
    setIsOpenTransfer(!isOpenTransfer);
  };
  const [isOpenDeposit, setIsOpenDeposit] = useState(false);
  const toggleModalDeposit = () => {
    setIsOpenDeposit(!isOpenDeposit);
  };
  const [isOpen, setIsOpen] = useState(false);
  const account = useAccount();
  const toggleModal = () => {
    setIsOpen(!isOpen);
  };
  const [currToPerp, setCurrToPerp] = useState(toPerp);
  return (
    <>
      <div className="mt-11">
        <Button
          type="button"
          disabled={!account.isConnected}
          onClick={toggleModalDeposit}
          className="w-full bg-white hover:bg-white  text-[#1E1E1E] font-medium text-[10px] leading-[14px] h-[28px]"
        >
          Deposit
        </Button>
        <div className="flex items-center gap-1 pt-2">
          <Button
            type="button"
            onClick={toggleModal}
            disabled={!account.isConnected}
            className=" w-6/12 bg-[#1F1F21]  text-white font-medium text-[10px] leading-[14px] h-[28px]"
          >
            <span>Perps</span>
            <TransferIcon className="size-2.5" />
            <span>Spot</span>
          </Button>
          <Button
            onClick={toggleModalTransfer}
            type="button"
            disabled={!account.isConnected}
            className=" w-6/12 bg-[#1F1F21]  text-white font-medium text-[10px] leading-[14px] h-[28px]"
          >
            Withdraw
          </Button>
        </div>
      </div>

      <ModalContainer
        open={isOpen}
        handleClose={toggleModal}
        title="Transfer USDC"
        headerClassName="text-center w-full text-lg font-medium"
        hideX
        className="!max-w-[462px] px-6 py-8 bg-[#141416] gap-0"
      >
        <PerpSpotTransferModal
          toPerp={currToPerp}
          toggleToPerp={() => setCurrToPerp(!currToPerp)}
          toggleModal={toggleModal}
        />
      </ModalContainer>
      <ModalContainer
        open={isOpenTransfer}
        handleClose={toggleModalTransfer}
        headerClassName="text-center w-full text-lg font-medium"
        hideX
        className="!max-w-[462px] px-6 py-8 bg-[#141416] gap-0"
      >
        <WithdrawalModal toggleModal={toggleModalTransfer} />
      </ModalContainer>
      <ModalContainer
        open={isOpenDeposit}
        handleClose={toggleModalDeposit}
        headerClassName="text-center w-full text-lg font-medium"
        hideX
        className="!max-w-[462px] px-6 py-8 bg-[#141416] gap-0"
      >
        <DepositModal toggleModal={toggleModalDeposit} />
      </ModalContainer>
    </>
  );
};

export default TransferButtons;
