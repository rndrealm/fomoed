import { DexQuoteResult } from "@/services/queries/dex/types";
import React, { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
import dashboard from "@/lib/assets/dashboard";
import RemoteImage from "../../shared/remote-image";
import { cn } from "@/lib/utils";
import PriceSummary from "../price-summary";
import { useBuildTransaction } from "@/services/queries/dex";
import {
  useChainId,
  useChains,
  useSendTransaction,
  useSwitchChain,
} from "wagmi";
import { toast } from "sonner";
import SuccessContent from "./success-content";
import SummaryPriceAndEstimate from "./summary-price-and-estmate";

interface IProps {
  isOpen: boolean;
  toggle: () => void;
  completeFn: () => void;
  quoteData: DexQuoteResult;
  chainExplorer?: string;
}

const ReviewModal = (props: IProps) => {
  const { isOpen, toggle, quoteData, chainExplorer, completeFn } = props;
  const [isSuccess, setIsSuccess] = useState(false);
  const input = quoteData.input;
  const output = quoteData.manualRoutes[0].output;

  const { data: buildData, isPending } = useBuildTransaction(
    quoteData.manualRoutes[0].quoteId
  );

  const chainId = useChainId();
  const chains = useChains();
  const transactionRequiredChainId = buildData?.txData.chainId;
  const isRightChain = transactionRequiredChainId === chainId;
  const fromChain = chains.find(
    (chain) => chain.id === transactionRequiredChainId
  );
  const { switchChain } = useSwitchChain();

  const {
    data: hash,
    sendTransaction,
    isPending: isPendingTransaction,
  } = useSendTransaction({
    mutation: {
      onSuccess: (successData) => {
        setIsSuccess(true);
      },
      onError: (err) => {
        console.error("Error sending transaction:", err);
        if (err?.message?.includes("User rejected the request")) {
          toast.error("You rejected the transaction!");
        } else {
          toast.error(err?.message || "Something went wrong!");
        }
      },
    },
  });

  console.log("build data:", buildData);

  const handleSwap = () => {
    if (!buildData) return;
    if (!isRightChain && transactionRequiredChainId) {
      switchChain({ chainId: transactionRequiredChainId });
    } else {
      sendTransaction({
        to: buildData.txData.to as `0x${string}`,
        value: buildData.txData.value
          ? BigInt(buildData.txData.value)
          : BigInt(0),
        data: buildData.txData.data as `0x${string}`,
      });
    }
  };

  return (
    <AnimatePresence>
      {isOpen ? (
        // Dropdown content
        <motion.div
          className="absolute top-0 left-0 w-full h-full bg-[#080808] p-3 rounded-[15px] flex flex-col"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
        >
          <div className="flex items-center justify-between pb-2">
            <h1 className="font-semibold text-mid">
              {isSuccess ? "Successful" : "Estimated Summary"}
            </h1>
            <button
              className="bg-[#121212] border border-[#141414] rounded-[6px] w-7 h-7 flex items-center justify-center"
              onClick={() => {
                toggle();
                // setIsSuccess(false);
                // completeFn();
              }}
            >
              <Image src={dashboard.x} alt="Cancel icon" />
            </button>
          </div>
          {/* If transaction is not successful */}
          {!isSuccess ? (
            <div className="bg-[#121212] px-3 py-4 rounded-t-[16px]">
              <div className="">
                <h3 className="text-[#A5A5A5] font-normal text-xs">From:</h3>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 p-1 bg-[#202020] rounded-[20px]">
                    <div>
                      <RemoteImage
                        src={input.token.logoURI}
                        alt={input.token.symbol}
                        width={24}
                        height={24}
                      />
                    </div>
                    <p className="text-xs font-semibold">
                      {input.token.symbol}
                    </p>
                  </div>
                  {/* <div className="flex flex-col items-end">
                    <p className="pb-1 text-xl tracking-normal font-lg">
                      {parseFloat(
                        removeDecimal(input.amount, input.token.decimals)
                      ).toFixed(3)}
                      {input.token.symbol}
                    </p>
                    <p className="text-[#A5A5A5] text-xs">
                      ≈${input.priceInUsd}
                    </p>
                  </div> */}

                  <SummaryPriceAndEstimate value={input} />
                </div>
              </div>

              <div className="flex justify-end w-full">
                <div className="bg-[#202020] rounded-full h-6 w-6 flex items-center justify-center my-sm">
                  <Image
                    src={dashboard.chevronDown}
                    alt="Arrow down icon"
                    width={8}
                    height={9}
                    className="mx-auto my-2"
                  />
                </div>
              </div>

              <div className="">
                <h3 className="text-[#A5A5A5] font-normal text-xs">To:</h3>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 p-1 bg-[#202020] rounded-[20px]">
                    <div>
                      <RemoteImage
                        src={output.token.logoURI}
                        alt={output.token.symbol}
                        width={24}
                        height={24}
                      />
                    </div>
                    <p className="text-xs font-semibold">
                      {output.token.symbol}
                    </p>
                  </div>
                  <SummaryPriceAndEstimate value={output} />
                </div>
              </div>
            </div>
          ) : null}

          {/* If transaction is successful */}
          {isSuccess ? (
            <SuccessContent
              completeFn={() => {
                setIsSuccess(false);
                completeFn();
              }}
              explorerLink={`${chainExplorer}/tx/${hash}`}
            />
          ) : (
            <div className="bg-[#121212] px-3 py-4 rounded-b-[16px] mt-[2px] flex flex-col justify-between gap-8">
              <PriceSummary quoteData={quoteData} />

              <button
                className={cn(
                  "w-full h-10 text-xs font-medium bg-[#FF3B10] rounded-[6px]",
                  {
                    "opacity-90 cursor-not-allowed":
                      isPending || isPendingTransaction,
                  }
                )}
                onClick={() => {
                  if (isPending || !buildData || isPendingTransaction) return;
                  handleSwap();
                }}
              >
                {isPendingTransaction
                  ? "Swapping..."
                  : isRightChain
                    ? "Confirm Swap"
                    : `Switch Chain to ${fromChain?.name}`}
              </button>
            </div>
          )}
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
};

export default ReviewModal;
