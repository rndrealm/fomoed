"use client";
import dashboard from "@/lib/assets/dashboard";
import { useFetchSupportedChains, useGetQuote, useTokenBalanceRead } from "@/services/queries/dex";
import { useEffect, useState } from "react";
import { ChainType, SingleTokenType } from "@/services/queries/dex/types";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import ConnectButton from "./connect-button";
import { useAccount, useBalance, useEstimateGas } from "wagmi";
import { appendDecimal, formatNumber, modalSlide, removeDecimal } from "@/lib/utils";
import PriceSummary from "./shared/price-summary";
import ReviewModal from "./review/review-modal";
import SettingsModal from "./settings-modal";
import { useDebounce } from "@/hooks/useDebounce";
import InsufficientChecker from "./insufficient-checker";
import TokenSelect from "./token-select";
import NumberFlow from "@number-flow/react";
import AmountInput from "./amount-input";
import { parseEther } from "viem";
import { ChevronDown } from "lucide-react";
import { Favourite, Close } from "@/components/icons/icons";
import DexHeader from "./dex-header";
import { SettingsDropdown } from "./settings-dropdown";
import SuccessContent from "./review/success-content";
import { WidgetWrapper } from "../shared";
import { LayoutType } from "@/lib/atoms/layoutAtom";
import { AnimatePresence, motion } from "motion/react";

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

interface IProps {
  widget: LayoutType["widgets"][0];
}

const DexWidget = (props: IProps) => {
  const { widget } = props;
  const [swapData, setSwapData] = useState<SwapData>(initialSwapData);

  const [isSuccessState, setIsSuccessState] = useState(false);
  const updateSuccess = (success: boolean) => {
    setIsSuccessState(success);
  };

  const [showInfo, setShowInfo] = useState(false);

  const [hash, setHash] = useState<string | null>(null);
  const updateHash = (newHash: string) => {
    setHash(newHash);
  };

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
      setLocalBalance(parseFloat(removeDecimal(value.balance, value.decimals)).toFixed(3));
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
    ? parseFloat(removeDecimal(tokenBalance.balance, tokenBalance.decimals)).toFixed(3)
    : "0.00";

  const { data, isLoading, isSuccess, isError } = useGetQuote({
    userAddress: address,
    receiverAddress: address,
    originChainId: currentNetwork?.chainId.toString(),
    destinationChainId: currentNetwork?.chainId.toString(),
    inputToken: swapData.from.token?.address,
    outputToken: swapData.to.token?.address,
    inputAmount: appendDecimal(debouncedInputValue, swapData.from.token?.decimals),
    slippage: debouncedSlippage.toString(),
  });

  const completeFn = () => {
    setSwapData(initialSwapData);
    setIsSuccessState(false);
    setInputValue("");
    setHash(null);
  };

  const setMax = () => {
    if (!swapData.from.token || !tokenBalance) return;
    const maxAmount = parseFloat(removeDecimal(tokenBalance.balance, swapData.from.token.decimals)).toFixed(5);
    setInputValue(maxAmount);
  };

  const toValue = data
    ? removeDecimal(data.manualRoutes[0]?.output.amount, data.manualRoutes[0]?.output.token.decimals)
    : "0.0";

  return (
    <WidgetWrapper
      title="Exchange"
      widget={widget}
      className="relative justify-between gap-3 px-0 sm:px-0 sm:pb-1"
      headerClassName="px-4"
      titleIcon="exchange"
      handleLearnMore={() => setShowInfo(true)}
    >
      <div className="font-inter flex h-full flex-col rounded-2xl bg-[#000] px-1 pt-1 font-semibold text-white">
        {data && data.manualRoutes && data.manualRoutes.length > 0 ? (
          <ReviewModal
            isOpen={isReviewModalOpen}
            toggle={toggleReviewModal}
            quoteData={data}
            // chainExplorer={swapData.to.network?.explorers[0]}
            // completeFn={completeFn}
            isSuccess={isSuccessState}
            updateSuccess={updateSuccess}
            updateHash={updateHash}
          />
        ) : null}

        <SettingsModal
          isOpen={isSettingsModalOpen}
          toggle={toggleSettingsModal}
          slippage={slippage}
          updateSlippage={updateSlippage}
        />

        {/* Header */}
        {/* <DexHeader /> */}

        {isSuccessState ? (
          <SuccessContent completeFn={completeFn} explorerLink={`${currentNetwork?.explorers[0]}/tx/${hash}`} />
        ) : (
          <>
            <div className="mb-2 flex items-center justify-between px-3">
              {isConnected ? (
                <div className="flex items-center justify-between">
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
                <SettingsDropdown slippage={slippage} updateSlippage={updateSlippage} />
              </div>
            </div>

            {/* Main */}
            <div className="flex flex-1 flex-col justify-between">
              {/* Transfer section */}
              <div className="flex flex-col gap-1">
                {/* From */}
                <div className="rounded-[10px] bg-[#111111] p-3">
                  <div className="mb-1 flex items-center justify-between text-xs font-medium text-[#878787]">
                    <p className="select-none">You Send:</p>
                    <p className="">Available: {parsedBalance}</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <AmountInput inputValue={formatNumber(inputValue)} updateInputValue={(val) => setInputValue(val)} />
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
                      <div className="h-7 w-[6.875rem] animate-pulse rounded-full bg-[#242323]" />
                    )}
                  </div>
                  <div className="mt-1 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-[#878787]">
                        = ${data?.input.priceInUsd.toFixed(4) || "0.0"}
                      </p>
                    </div>
                    <div>
                      <button
                        className="flex h-6 items-center justify-center rounded-[8px] bg-[#0D0D0D] px-[0.375rem] text-xs font-medium select-none"
                        onClick={setMax}
                      >
                        Use Max
                      </button>
                    </div>
                  </div>
                </div>
                <div className="z-[9] -my-3 flex items-center justify-center">
                  <div className="flex h-5 w-5 items-center justify-center rounded-[6px] border border-[#252525] bg-[#111111]">
                    <ChevronDown className="w-3 text-[#5F5F5F]" />
                  </div>
                </div>

                {/* To */}
                <div className="rounded-[10px] bg-[#111111] p-3">
                  <div className="mb-1 flex items-center justify-between text-xs font-medium text-[#878787]">
                    <p className="">You Receive:</p>
                    <p className="">Choose Asset</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-xl font-bold">
                      <NumberFlow
                        value={parseFloat(toValue)}
                        format={{
                          notation: "standard",
                          maximumFractionDigits: 4,
                        }} // Intl.NumberFormat options
                        locales="en-US" // Intl.NumberFormat locales
                        className="font-geist-medium text-grey-300 text-2xl"
                      />
                    </p>
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
                      <div className="h-7 w-[6.875rem] animate-pulse rounded-full bg-[#242323]" />
                    )}
                  </div>
                </div>
              </div>

              <div className="flex flex-col justify-between select-none">
                {/* Connect button */}
                <div className="mt-6 px-0">
                  {/* If wallet has not been conncted */}
                  {!isConnected ? (
                    <button
                      className="h-16 w-full rounded-[24px] bg-white text-base font-semibold text-[#0C0C0C] !backdrop-opacity-10"
                      onClick={openConnectModal}
                    >
                      Connect Wallet
                    </button>
                  ) : null}
                  {/* Wallet has been connected but quote is being fetched */}
                  {isConnected && isLoading ? (
                    <button className="h-16 w-full rounded-[24px] bg-[#111111] text-base font-semibold text-white !backdrop-opacity-10">
                      Fetching best routes...
                    </button>
                  ) : null}
                  {/* Wallet has been connected and quote has been fetched successfully */}
                  {isConnected && isSuccess && data?.manualRoutes && data?.manualRoutes.length > 0 ? (
                    <InsufficientChecker
                      toggleReviewModal={toggleReviewModal}
                      fromSymbol={data?.input?.token?.symbol}
                      toSymbol={swapData.to.token?.symbol}
                      balance={tokenBalance?.balance}
                      amount={data?.input?.amount}
                    />
                  ) : null}

                  {/* Wallet has been connected but there is an error or no quote found */}
                  {(isConnected && isError) || (isConnected && data?.manualRoutes.length === 0) ? (
                    <button className="h-16 w-full rounded-[24px] bg-white text-base font-semibold text-[#0C0C0C] !backdrop-opacity-10">
                      No Quote Found
                    </button>
                  ) : null}

                  {/* Wallet has been connected, no error, no loading, but no success (rest state) */}
                  {isConnected && !isError && !isLoading && !isSuccess ? (
                    <button className="h-16 w-full rounded-[24px] bg-white text-base font-semibold text-[#0C0C0C] !backdrop-opacity-10">
                      Swap
                    </button>
                  ) : null}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
      <AnimatePresence>
        {showInfo && (
          <div className="absolute top-[10px] right-[10px] bottom-[10px] left-[10px] z-[19] flex items-end">
            <motion.div
              className="scrollbar h-full overflow-auto rounded-[22px] bg-[#111] px-5 py-4 flex-1 text-white"
              variants={modalSlide}
              initial="hidden"
              animate="visible"
              exit="hidden"
            >
              <div className="flex flex-col gap-4 justify-between flex-1 h-full">
                <div className="flex flex-col gap-3">
                  <div className="flex flex-col">
                    <h3 className="text-base leading-[1.35] font-semibold">About the DEX</h3>
                    <p className="text-[13px] leading-[1.25] font-light text-[#878787]">
                      Learn about Decentralized Exchanges
                    </p>
                  </div>
                  <p className="text-[13px] leading-[1.35] font-medium">
                    A Decentralized Exchange (DEX) allows you to trade cryptocurrency directly with other users
                    (peer-to-peer) without needing a central company to hold your funds. This widget finds the best
                    exchange rates from various DEX aggregators.
                  </p>
                  <p className="text-[13px] leading-[1.35] font-medium">
                    <strong>Slippage:</strong> This is the expected percentage difference between the price you see and
                    the price at which the trade is executed. A small amount of slippage is normal in fast-moving
                    markets.
                  </p>
                </div>

                <div className="flex justify-center mt-4">
                  <button
                    type="button"
                    className="app_widget_button flex h-[26px] items-center justify-center gap-1 rounded-[40px] bg-[#272727]"
                    onClick={() => {
                      setShowInfo(false);
                    }}
                  >
                    <p className="app_widget_button__text text-[13px] font-medium whitespace-nowrap text-white">
                      Close
                    </p>
                    <div className="app_widget_button__icon">
                      <Close fill="#878787" />
                    </div>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </WidgetWrapper>
  );
};

export default DexWidget;
