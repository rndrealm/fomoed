"use client";
import dashboard from "@/lib/assets/dashboard";
import Image from "next/image";
import {
  useFetchSupportedChains,
  useGetQuote,
  useTokenBalanceRead,
} from "@/services/queries/dex";
import { useState } from "react";
import { ChainType, SingleTokenType } from "@/services/queries/dex/types";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import ConnectButton from "./connect-button";
import { useAccount, useBalance, useEstimateGas } from "wagmi";
import { appendDecimal, formatNumber, removeDecimal } from "@/lib/utils";
import PriceSummary from "./price-summary";
import ReviewModal from "./review/review-modal";
import SettingsModal from "./settings-modal";
import { useDebounce } from "@/hooks/useDebounce";
import InsufficientChecker from "./insufficient-checker";
import TokenSelect from "./token-select";
import AmountInput from "./amount-input";
import { parseEther } from "viem";

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
  const debouncedSearchValue = useDebounce(inputValue, 500);
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

  const [slippage, setSlippage] = useState({ value: 0.5, custom: false });
  const updateSlippage = (value: number, custom: boolean) => {
    setSlippage({ value, custom });
  };

  const { data: tokenBalance } = useTokenBalanceRead(
    swapData.from.network?.chainId.toString(),
    address,
    swapData.from.token?.address
  );

  const parsedBalance = parseFloat(
    removeDecimal(tokenBalance?.balance || 0, tokenBalance?.decimals || 0)
  ).toFixed(5);

  const { data, isLoading, isSuccess, isError } = useGetQuote({
    userAddress: address,
    receiverAddress: address,
    originChainId: swapData.from.network?.chainId.toString(),
    destinationChainId: swapData.to.network?.chainId.toString(),
    inputToken: swapData.from.token?.address,
    outputToken: swapData.to.token?.address,
    inputAmount: appendDecimal(
      debouncedSearchValue,
      swapData.from.token?.decimals
    ),
    slippage: slippage.value.toString(),
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

  const result = useEstimateGas({
    account: address,
    to: address,
    value: parseEther("0.07633"),
  });

  return (
    <div className="text-white border border-[#1E1E1E] rounded-[15px] p-3 font-inter font-semibold bg-[#080808] h-full relative">
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
      <div className="flex items-center justify-between ">
        <h1 className="text-mid">Swap</h1>
        <div className="flex items-center gap-2">
          <ConnectButton />
          <button
            className="bg-[#121212] px-2 h-8 border border-[#141414] rounded-[6px]"
            onClick={toggleSettingsModal}
          >
            <Image src={dashboard.settings} alt="Settings icon" />
          </button>
        </div>
      </div>

      {/* Main */}
      <div className="bg-[#121212] rounded-[16px]  py-4 mt-2">
        {/* Transfer section */}
        <div className="px-3 pb-4">
          {/* From */}
          <div>
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium">From:</p>
              <p className="font-normal text-xxs">Balance: {parsedBalance}</p>
            </div>
            <div className="flex items-center justify-between mt-1 rounded-[8px] bg-[#080808] px-3 py-sm">
              <AmountInput
                inputValue={formatNumber(inputValue)}
                updateInputValue={(val) => setInputValue(val)}
                setMax={setMax}
              />
              <TokenSelect
                tokenData={swapData.from}
                otherTokenData={swapData.to}
                updateSwapData={updateSwapData}
                slug="from"
              />
            </div>
          </div>

          <div className="flex items-center justify-center my-sm">
            <div className="w-8 h-8 flex items-center justify-center rounded-full bg-[#202020] ">
              <Image src={dashboard.swap} alt="Swap icon" />
            </div>
          </div>

          {/* To */}
          <div>
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium">To:</p>
              {/* <p className="font-normal text-xxs">Balance: 0:00</p> */}
            </div>
            <div className="flex items-center justify-between mt-1 rounded-[8px] bg-[#080808] px-3 py-sm">
              <p className="text-xs font-medium">0.0</p>
              <TokenSelect
                tokenData={swapData.to}
                otherTokenData={swapData.from}
                updateSwapData={updateSwapData}
                slug="to"
              />
            </div>
          </div>
        </div>

        {/* Summary section */}
        <div className="border-t border-[#1E1E1E] pt-4 flex flex-col justify-between">
          <PriceSummary quoteData={data} />

          {/* Connect button */}
          <div className="px-3 mt-6">
            {/* If wallet has not been conncted */}
            {!isConnected ? (
              <button
                className="w-full h-10 text-xs font-medium bg-[#202020] rounded-[6px]"
                onClick={openConnectModal}
              >
                Connect Wallet
              </button>
            ) : null}
            {/* Wallet has been connected but quote is being fetched */}
            {isConnected && isLoading ? (
              <button className="w-full h-10 text-xs font-medium bg-[#202020] rounded-[6px]">
                Fetching Quote...
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
              <button className="w-full h-10 text-xs font-medium bg-[#202020] rounded-[6px]">
                No Quote Found
              </button>
            ) : null}

            {/* Wallet has been connected, no error, no loading, but no success (rest state) */}
            {isConnected && !isError && !isLoading && !isSuccess ? (
              <button className="w-full h-10 text-xs font-medium bg-[#202020] rounded-[6px]">
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
