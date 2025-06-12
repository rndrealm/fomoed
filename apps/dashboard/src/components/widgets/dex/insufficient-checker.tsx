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
    <button className="w-full h-16 text-base text-[#0C0C0C] font-semibold bg-white !backdrop-opacity-10 rounded-[24px]">
      Insufficient Funds
    </button>
  ) : (
    <button
      className="w-full h-16 text-base text-white font-semibold bg-[#FF3B10] !backdrop-opacity-10 rounded-[24px]"
      onClick={toggleReviewModal}
    >
      Swap {fromSymbol} for {toSymbol}
    </button>
  );
};

export default InsufficientChecker;
