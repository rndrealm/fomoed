import { Button } from "@/components/ui/button";
import React from "react";

interface IProps {
  updateStep: (step: number) => void;
  toggleModal: () => void;
}

const AuthorizeModal = (props: IProps) => {
  const { updateStep, toggleModal } = props;
  return (
    <div>
      <h1 className="text-center text-white font-medium text-lg pt-5 pb-9">Authorize API Access</h1>
      <p className="text-[#B0B0B0] font-medium  text-xs">
        Allow this agent wallet to execute trades, read balances, and automate actions securely. It operates with
        restricted privileges and does not have the ability to move or withdraw assets.
      </p>

      <div className="flex items-center gap-2 pt-8">
        <Button
          className="flex-1 bg-[#171717] hover:opacity-90 border-[#1F1F1F] border  text-white font-medium text-sm h-11"
          onClick={toggleModal}
        >
          Decline
        </Button>
        <Button
          className="flex-1 bg-[#51D2C1] hover:opacity-90 hover:bg-[#51D2C1]  text-[#010101] font-medium text-sm h-11"
          onClick={() => updateStep(2)}
        >
          Grant Permission
        </Button>
      </div>
    </div>
  );
};

export default AuthorizeModal;
