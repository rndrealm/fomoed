"use client";
import dashboard from "@/lib/assets/dashboard";
import Image from "next/image";
import {
  useFetchSupportedChains,
  useGetQuote,
  useTokenBalanceRead,
} from "@/services/queries/dex";
import { useEffect, useState } from "react";
import { ChainType, SingleTokenType } from "@/services/queries/dex/types";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import ConnectButton from "./connect-button";
import { useAccount, useBalance, useEstimateGas } from "wagmi";
import { appendDecimal, formatNumber, removeDecimal } from "@/lib/utils";
import PriceSummary from "./shared/price-summary";
import ReviewModal from "./review/review-modal";
import SettingsModal from "./settings-modal";
import { useDebounce } from "@/hooks/useDebounce";
import InsufficientChecker from "./insufficient-checker";
import TokenSelect from "./token-select";
import AmountInput from "./amount-input";
import { parseEther } from "viem";
import { ChevronDown } from "lucide-react";
import { Favourite } from "@/components/icons/icons";
import DexHeader from "./dex-header";
import { SettingsDropdown } from "./settings-dropdown";

interface SwapData {
  from: {
    token: SingleTokenType | null;
    network: ChainType | null;
  };
  to: {
    token: SingleTokenType | null;
    network: ChainType | null;
  };
}

const initialSwapData = {
  from: {
    token: null,
    network: null,
  },
  to: {
    token: null,
    network: null,
  },
};

const DexWidget = () => {
  useFetchSupportedChains();
  const [swapData, setSwapData] = useState<SwapData>(initialSwapData);

  //! This state is used to track the current network selected in the widget (I created this state because the widget can only swap on the same netowrk for now).
  //! The bridging state still remains in the swapData object.
  const [currentNetwork, setCurrentNetwork] = useState<ChainType | null>(null);

  const updateCurrentNetwork = (network: ChainType | null) => {
    setCurrentNetwork(network);
  };

  const { data: networkList } = useFetchSupportedChains();

  useEffect(() => {
    if (networkList && !currentNetwork) {
      updateCurrentNetwork(networkList[0]);
    }
  }, [networkList, currentNetwork]);

  const updateSwapData = (
    type: "from" | "to",
    slug: "token" | "network",
    value: SingleTokenType | ChainType | null
  ) => {
    if (type === "from" && slug === "token" && value && "balance" in value) {
      setLocalBalance(
        parseFloat(removeDecimal(value.balance, value.decimals)).toFixed(3)
      );
    }
    setSwapData((prevData) => ({
      ...prevData,
      [type]: {
        ...prevData[type],
        [slug]: value,
      },
    }));
  };

  const [inputValue, setInputValue] = useState("");
  const debouncedInputValue = useDebounce(inputValue, 500);
  const { openConnectModal } = useConnectModal();
  const { address, isConnected } = useAccount();
  const [localBalance, setLocalBalance] = useState("0.00");

  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const toggleReviewModal = () => {
    setIsReviewModalOpen(!isReviewModalOpen);
  };

  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const toggleSettingsModal = () => {
    setIsSettingsModalOpen(!isSettingsModalOpen);
  };

  const [slippage, setSlippage] = useState({ value: 0.5, custom: true });
  const updateSlippage = (value: number, custom: boolean) => {
    setSlippage({ value, custom });
  };

  const debouncedSlippage = useDebounce(slippage.value, 500);

  const { data: tokenBalance } = useTokenBalanceRead(
    currentNetwork?.chainId.toString(),
    address,
    swapData.from.token?.address
  );

  const parsedBalance = tokenBalance
    ? parseFloat(
        removeDecimal(tokenBalance.balance, tokenBalance.decimals)
      ).toFixed(3)
    : "0.00";

  const { data, isLoading, isSuccess, isError } = useGetQuote({
    userAddress: address,
    receiverAddress: address,
    originChainId: currentNetwork?.chainId.toString(),
    destinationChainId: currentNetwork?.chainId.toString(),
    inputToken: swapData.from.token?.address,
    outputToken: swapData.to.token?.address,
    inputAmount: appendDecimal(
      debouncedInputValue,
      swapData.from.token?.decimals
    ),
    slippage: debouncedSlippage.toString(),
  });

  const completeFn = () => {
    toggleReviewModal();
    setSwapData(initialSwapData);
    setInputValue("");
  };

  const setMax = () => {
    if (!swapData.from.token || !tokenBalance) return;
    const maxAmount = parseFloat(
      removeDecimal(tokenBalance.balance, swapData.from.token.decimals)
    ).toFixed(5);
    setInputValue(maxAmount);
  };

  return (
    <div className="text-white border border-[#1E1E1E] rounded-2xl pt-3 px-1 font-inter font-semibold bg-[#0C0C0C] h-full relative">
      {data && data.manualRoutes && data.manualRoutes.length > 0 ? (
        <ReviewModal
          isOpen={isReviewModalOpen}
          toggle={toggleReviewModal}
          quoteData={data}
          chainExplorer={swapData.to.network?.explorers[0]}
          completeFn={completeFn}
        />
      ) : null}

      <SettingsModal
        isOpen={isSettingsModalOpen}
        toggle={toggleSettingsModal}
        slippage={slippage}
        updateSlippage={updateSlippage}
      />

      {/* Header */}
      <DexHeader />

      <div className="flex items-center justify-between px-3 mb-2">
        {isConnected ? (
          <div className="flex items-center justify-between ">
            <ConnectButton />
          </div>
        ) : (
          <div />
        )}
        <div className="flex items-center gap-2">
          {/* <button className="" onClick={toggleSettingsModal}>
            <Image
              src={dashboard.refresh}
              alt="Settings icon"
              width={20}
              height={20}
            />
          </button> */}
          <SettingsDropdown
            slippage={slippage}
            updateSlippage={updateSlippage}
          />
        </div>
      </div>

      {/* Main */}
      <div className="">
        {/* Transfer section */}
        <div className="flex flex-col gap-1">
          {/* From */}
          <div className="bg-[#111111] rounded-[10px] p-3 ">
            <div className="flex items-center justify-between text-xs font-medium text-[#878787] mb-1">
              <p className="">You Send:</p>
              <p className="">Available: {parsedBalance}</p>
            </div>
            <div className="flex items-center justify-between ">
              <AmountInput
                inputValue={formatNumber(inputValue)}
                updateInputValue={(val) => setInputValue(val)}
              />
              {currentNetwork ? (
                <TokenSelect
                  tokenData={swapData.from}
                  otherTokenData={swapData.to}
                  updateSwapData={updateSwapData}
                  slug="from"
                  currentNetwork={currentNetwork}
                  updateCurrentNetwork={updateCurrentNetwork}
                  key={currentNetwork?.chainId}
                />
              ) : (
                <div className="w-[6.875rem] rounded-full h-7 animate-pulse bg-[#242323] " />
              )}
            </div>
            <div className="flex items-center justify-between mt-1">
              <div>
                <p className="font-medium text-xs text-[#878787]">= 0.00</p>
              </div>
              <div>
                <button
                  className="flex items-center justify-center h-6 font-medium text-xs bg-[#0D0D0D] rounded-[8px] px-[0.375rem]"
                  onClick={setMax}
                >
                  Use Max
                </button>
              </div>
            </div>
          </div>
          {/* <div className="absolute -bottom-3 left-[50%] translate-x-[-50%] flex items-center justify-center "> */}
          <div className="flex z-[9] items-center justify-center -my-3 ">
            <div className="w-5 h-5 flex items-center justify-center rounded-[6px] bg-[#111111] border border-[#252525] ">
              <ChevronDown className="text-[#5F5F5F] w-3" />
            </div>
          </div>

          {/* To */}
          <div className="bg-[#111111] rounded-[10px] p-3 ">
            <div className="flex items-center justify-between text-xs font-medium text-[#878787] mb-1">
              <p className="">You Receive:</p>
              <p className="">Choose Asset</p>
            </div>
            <div className="flex items-center justify-between ">
              <p className="text-xl font-bold">0.00</p>
              {currentNetwork ? (
                <TokenSelect
                  tokenData={swapData.to}
                  otherTokenData={swapData.from}
                  updateSwapData={updateSwapData}
                  slug="to"
                  currentNetwork={currentNetwork}
                  updateCurrentNetwork={updateCurrentNetwork}
                  key={currentNetwork?.chainId}
                />
              ) : (
                <div className="w-[6.875rem] rounded-full h-7 animate-pulse bg-[#242323] " />
              )}
            </div>
          </div>
        </div>

        {/* <div className="relative flex justify-center mt-4">
          <div className="absolute left-0 bottom-1/2 transform-y-[-50%] w-full h-[1px] bg-[#161616]" />
          <p className="text-ideal font-semibold text-[#878787] text-center relative inline-block bg-[#0C0C0C] px-[2px]">
            Carefully review the details above{" "}
          </p>
        </div>

        {isConnected ? (
          <div className="flex items-center justify-between px-5 my-3">
            <p className="text-[#878787] font-medium text-sm">Wallet</p>
            <ConnectButton />
          </div>
        ) : null} */}

        {/* Summary section */}
        <div className="flex flex-col justify-between ">
          {/* Connect button */}
          <div className="px-0 mt-6">
            {/* If wallet has not been conncted */}
            {!isConnected ? (
              <button
                className="w-full h-16 text-base text-[#0C0C0C] font-semibold bg-white !backdrop-opacity-10 rounded-[24px]"
                onClick={openConnectModal}
              >
                Connect Wallet
              </button>
            ) : null}
            {/* Wallet has been connected but quote is being fetched */}
            {isConnected && isLoading ? (
              <button className="w-full h-16 text-base text-white font-semibold bg-[#111111] !backdrop-opacity-10 rounded-[24px]">
                Fetching best routes...
              </button>
            ) : null}
            {/* Wallet has been connected and quote has been fetched successfully */}
            {isConnected &&
            isSuccess &&
            data?.manualRoutes &&
            data?.manualRoutes.length > 0 ? (
              <InsufficientChecker
                toggleReviewModal={toggleReviewModal}
                fromSymbol={data?.input?.token?.symbol}
                toSymbol={swapData.to.token?.symbol}
                balance={tokenBalance?.balance}
                amount={data?.input?.amount}
              />
            ) : null}

            {/* Wallet has been connected but there is an error or no quote found */}
            {(isConnected && isError) ||
            (isConnected && data?.manualRoutes.length === 0) ? (
              <button className="w-full h-16 text-base text-[#0C0C0C] font-semibold bg-white !backdrop-opacity-10 rounded-[24px]">
                No Quote Found
              </button>
            ) : null}

            {/* Wallet has been connected, no error, no loading, but no success (rest state) */}
            {isConnected && !isError && !isLoading && !isSuccess ? (
              <button className="w-full h-16 text-base text-[#0C0C0C] font-semibold bg-white !backdrop-opacity-10 rounded-[24px]">
                Swap
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DexWidget;
