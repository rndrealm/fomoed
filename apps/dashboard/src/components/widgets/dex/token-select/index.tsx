import { ChevronDown } from "lucide-react";
import React, { Fragment, useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
import dashboard from "@/lib/assets/dashboard";
import {
  useFetchSupportedChains,
  useFetchTokenList,
  useSearchTokenList,
} from "@/services/queries/dex";
import { useDebounce } from "@/hooks/useDebounce";
import { ChainType, SingleTokenType } from "@/services/queries/dex/types";
import TokenList from "./token-list";
import { useAccount } from "wagmi";
import TokenTrigger from "./token-trigger";
import NetworkSelect from "./network-select";
import { swapFromTo } from "@/lib/utils";

interface IProps {
  tokenData: {
    token: SingleTokenType | null;
    network: ChainType | null;
  };
  otherTokenData: {
    token: SingleTokenType | null;
    network: ChainType | null;
  };
  updateSwapData: (
    type: "from" | "to",
    slug: "token" | "network",
    value: SingleTokenType | ChainType | null
  ) => void;
  slug: "from" | "to";

  currentNetwork: ChainType | null;
  updateCurrentNetwork: (network: ChainType | null) => void;
}

const TokenSelect = (props: IProps) => {
  const {
    tokenData,
    otherTokenData,
    updateSwapData,
    slug,
    currentNetwork,
    updateCurrentNetwork,
  } = props;

  const [isOpen, setIsOpen] = useState(false);
  const [networkValue, setNetworkValue] = useState<ChainType | null>(
    currentNetwork
  );

  const updateNetworkValue = (network: ChainType) => {
    setNetworkValue(network);
  };
  const updateTokenValue = (token: SingleTokenType) => {
    // updateSwapData(slug, "network", networkValue);
    updateCurrentNetwork(networkValue);

    // Todo: improve the ux when the user selects the same token and network
    if (
      networkValue?.chainId === otherTokenData?.network?.chainId &&
      token.symbol === otherTokenData?.token?.symbol
    ) {
      setIsOpen(false);
      return;
    }

    if (networkValue?.chainId !== currentNetwork?.chainId) {
      updateSwapData(swapFromTo(slug), "token", null);
    }

    updateSwapData(slug, "token", token);

    setIsOpen(false);
  };
  const networkValueWithFallback = networkValue?.chainId.toString() || "1";
  const [searchValue, setSearchValue] = useState("");
  const debouncedSearchValue = useDebounce(searchValue, 500);
  const { address } = useAccount();
  const { data: tokenList } = useFetchTokenList(
    networkValueWithFallback,
    address
  );
  const { data: searchTokenList } = useSearchTokenList(debouncedSearchValue);
  return (
    <Fragment>
      {/* Dropdown trigger */}
      <TokenTrigger value={tokenData.token} toggle={() => setIsOpen(!isOpen)} />
      <AnimatePresence>
        {isOpen ? (
          // Dropdown content
          <motion.div
            className="absolute top-0 left-0 w-full h-full  z-[10] flex justify-center items-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
          >
            <div className="bg-[#111111] border border-[#1E1E1E] w-[98%] h-[98%] py-8 px-3  flex flex-col  rounded-[15px]">
              <div className="px-2">
                <div className="flex items-center justify-between ">
                  <h1 className="text-base font-semibold">
                    {slug === "from" ? "Send" : "Receive"}
                  </h1>
                  <button
                    className="bg-[#1D1D1D] rounded-full w-6 h-6 flex items-center justify-center"
                    onClick={() => {
                      setNetworkValue(currentNetwork);
                      setIsOpen(false);
                    }}
                  >
                    <Image src={dashboard.x} alt="Cancel icon" />
                  </button>
                </div>

                <div className="relative my-3  bg-[#161616] rounded-[10px]">
                  <div className="absolute left-3 top-[30%]">
                    <Image src={dashboard.search} alt="Search icon" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search Token"
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    className="w-full h-11 pl-9 text-xs font-medium text-[#D4D4D4]"
                  />
                  <div className="absolute right-3 top-[20%]">
                    <NetworkSelect
                      networkValue={networkValue}
                      updateNetworkValue={updateNetworkValue}
                    />
                  </div>
                </div>
              </div>

              {!!searchValue && searchTokenList ? (
                <div className="pt-0 overflow-y-auto scrollbar">
                  {searchTokenList?.[networkValueWithFallback]?.length > 0 ? (
                    <>
                      <p className="text-left text-xs text-[#A5A5A5]">
                        {searchTokenList?.[networkValueWithFallback]?.length}{" "}
                        results found
                      </p>
                      <TokenList
                        value={tokenData.token}
                        list={searchTokenList?.[networkValueWithFallback] || []}
                        updateTokenValue={updateTokenValue}
                        className=""
                        // disabedTokens={
                        //   networkValue?.chainId ===
                        //   otherTokenData?.network?.chainId
                        //     ? [
                        //         tokenData.token?.symbol,
                        //         otherTokenData.token?.symbol,
                        //       ]
                        //     : []
                        // }
                      />
                    </>
                  ) : (
                    <p className="text-left text-xs text-[#A5A5A5]">
                      No tokens found
                    </p>
                  )}
                </div>
              ) : (
                <div className="px-1 overflow-y-auto scrollbar">
                  {/* <TokenListSummary
                  value={tokenData.token}
                  list={
                    tokenList?.[networkValueWithFallback]?.slice(0, 4) || []
                  }
                  updateTokenValue={updateTokenValue}
                /> */}
                  <TokenList
                    value={tokenData.token}
                    list={tokenList?.[networkValueWithFallback] || []}
                    updateTokenValue={updateTokenValue}
                  />
                </div>
              )}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </Fragment>
  );
};

export default TokenSelect;
