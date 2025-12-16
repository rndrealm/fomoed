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
      {step === 1 ? <DepositModal toggleModal={toggle} updateStep={setStep} onConfirm={onConfirm} /> : null}
      {step === 2 ? <AuthorizeModal updateStep={setStep} toggleModal={toggle} onConfirm={onConfirm} /> : null}
    </div>
  );
};

export default HyperliquidAuthModals;
