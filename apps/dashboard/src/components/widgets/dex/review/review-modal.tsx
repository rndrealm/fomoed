import { DexQuoteResult } from "@/services/queries/dex/types";
import React, { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
import dashboard from "@/lib/assets/dashboard";
import RemoteImage from "../../shared/remote-image";
import { cn } from "@/lib/utils";
import PriceSummary from "../shared/price-summary";
import { useBuildTransaction } from "@/services/queries/dex";
import { useChainId, useChains, useSendTransaction, useSwitchChain } from "wagmi";
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

  const { data: buildData, isPending } = useBuildTransaction(quoteData.manualRoutes[0].quoteId);

  const chainId = useChainId();
  const chains = useChains();
  const transactionRequiredChainId = buildData?.txData.chainId;
  const isRightChain = transactionRequiredChainId === chainId;
  const fromChain = chains.find((chain) => chain.id === transactionRequiredChainId);
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
        value: buildData.txData.value ? BigInt(buildData.txData.value) : BigInt(0),
        data: buildData.txData.data as `0x${string}`,
      });
    }
  };

  return (
    <AnimatePresence>
      {isOpen ? (
        // Dropdown content
        <motion.div
          className="absolute top-0 left-0 z-[10] flex h-full w-full flex-col rounded-[15px] bg-[#080808] pt-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
        >
          <div className="flex items-center justify-between px-3 pb-3">
            <h1 className="text-mid font-semibold">{isSuccess ? "Successful" : "Swap Details"}</h1>
            <button
              className="flex h-6 w-6 items-center justify-center rounded-full bg-[#1D1D1D]"
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
            <div className="mt-[2px] flex flex-1 flex-col justify-between gap-8 rounded-b-[16px] py-0">
              <div className="px-4">
                <div className="mb-3 flex items-center gap-2">
                  <p className="text-ideal font-semibold text-[#878787]">
                    You’re about to Swap <span className="text-white">{input.token.symbol}</span> for{" "}
                    <span className="text-white">{output.token.symbol}</span>
                  </p>
                  <div className="flex items-center">
                    <div>
                      <RemoteImage src={input.token.logoURI} width={24} height={24} alt={input.token.name} />
                    </div>
                    <div className="-ml-3.5">
                      <RemoteImage src={output.token.logoURI} width={24} height={24} alt={output.token.name} />
                    </div>
                  </div>
                </div>

                <PriceSummary quoteData={quoteData} />
              </div>

              <button
                className={cn(
                  "h-16 w-full rounded-[24px] bg-[#FF3B10] text-base font-semibold text-[white] !backdrop-opacity-10",
                  {
                    "cursor-not-allowed opacity-90": isPending || isPendingTransaction,
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
