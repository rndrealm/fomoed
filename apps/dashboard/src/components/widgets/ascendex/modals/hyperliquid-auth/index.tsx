import React, { useState } from "react";
import AuthorizeModal from "./authorize";
import DepositModal from "./deposit";

interface IProps {
  toggle: () => void;
  onConfirm: () => void;
}

const HyperliquidAuthModals = (props: IProps) => {
  const { toggle, onConfirm } = props;
  const [step, setStep] = useState(1);

  return (
    <div className="flex flex-col">
      {step === 1 ? <AuthorizeModal updateStep={setStep} toggleModal={toggle} /> : null}
      {step === 2 ? <DepositModal updateStep={setStep} toggleModal={toggle} /> : null}
    </div>
  );
};

export default HyperliquidAuthModals;
