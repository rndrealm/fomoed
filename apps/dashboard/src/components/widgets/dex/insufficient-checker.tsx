import React from "react";

interface IProps {
  toggleReviewModal: () => void;
  fromSymbol: string;
  toSymbol?: string;
  balance?: string;
  amount?: string;
}

const InsufficientChecker = (props: IProps) => {
  const { toggleReviewModal, fromSymbol, toSymbol, balance, amount } = props;
  const isInSufficient = parseFloat(balance || "0") < parseFloat(amount || "0");

  return isInSufficient ? (
    <button className="w-full h-10 text-xs font-medium bg-[#202020] rounded-[6px]">
      Insufficient Funds
    </button>
  ) : (
    <button
      className="w-full h-10 text-xs font-medium bg-[#FF3B10] rounded-[6px]"
      onClick={toggleReviewModal}
    >
      Swap {fromSymbol} for {toSymbol}
    </button>
  );
};

export default InsufficientChecker;
