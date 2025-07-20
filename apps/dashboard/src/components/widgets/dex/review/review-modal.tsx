import { DexQuoteResult } from "@/services/queries/dex/types";
import React, { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
import dashboard from "@/lib/assets/dashboard";
import RemoteImage from "../../shared/remote-image";
import { cn } from "@/lib/utils";
import PriceSummary from "../shared/price-summary";
import { useBuildTransaction } from "@/services/queries/dex";
import {
  useChainId,
  useChains,
  useSendTransaction,
  useSwitchChain,
} from "wagmi";
import { toast } from "sonner";

interface IProps {
  isOpen: boolean;
  toggle: () => void;
  quoteData: DexQuoteResult;
  isSuccess: boolean;
  updateSuccess: (success: boolean) => void;
  updateHash: (hash: string) => void;
}

const ReviewModal = (props: IProps) => {
  const { isOpen, toggle, quoteData, isSuccess, updateSuccess, updateHash } =
    props;

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
        updateSuccess(true);
        updateHash(successData);
        toggle();
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

  const handleSwap = () => {
    if (!buildData) return;
    if (!transactionRequiredChainId) return;
    if (!isRightChain) {
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
          className="absolute w-full h-full top-0 left-0 flex items-center justify-center z-[10] "
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
        >
          <div className="w-[98%] h-[98%] bg-[#111111] pt-8 rounded-2xl flex flex-col">
            <div className="flex items-center justify-between px-4 pb-3">
              <h1 className="font-semibold text-mid">
                {isSuccess ? "Successful" : "Swap Details"}
              </h1>
              <button
                className="bg-[#1D1D1D]  rounded-full w-6 h-6 flex items-center justify-center"
                onClick={() => {
                  toggle();
                }}
              >
                <Image src={dashboard.x} alt="Cancel icon" />
              </button>
            </div>

            <div className=" py-0 rounded-b-[16px] mt-[2px] flex flex-col justify-between gap-8 flex-1">
              <div className="px-4 ">
                <div className="flex items-center gap-2 mb-3">
                  <p className="text-[#878787] font-semibold text-ideal">
                    You’re about to Swap{" "}
                    <span className="text-white">{input.token.symbol}</span> for{" "}
                    <span className="text-white">{output.token.symbol}</span>
                  </p>
                  <div className="flex items-center">
                    <div>
                      <RemoteImage
                        src={input.token.logoURI}
                        width={24}
                        height={24}
                        alt={input.token.name}
                      />
                    </div>
                    <div className="-ml-3.5">
                      <RemoteImage
                        src={output.token.logoURI}
                        width={24}
                        height={24}
                        alt={output.token.name}
                      />
                    </div>
                  </div>
                </div>

                <PriceSummary quoteData={quoteData} />
              </div>

              <button
                className={cn(
                  "w-full h-16 text-base text-[#0C0C0C] font-semibold bg-[rgba(255,255,255,0.7)] !backdrop-opacity-10 rounded-[24px] mx-0",
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
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
};

export default ReviewModal;
