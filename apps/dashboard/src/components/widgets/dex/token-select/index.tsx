import { Loader2 } from "lucide-react";
import React, { Fragment, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
import dashboard from "@/lib/assets/dashboard";
import { useFetchTokenList, useSearchTokenList } from "@/services/queries/dex";
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
  updateSwapData: (type: "from" | "to", slug: "token" | "network", value: SingleTokenType | ChainType | null) => void;
  slug: "from" | "to";

  currentNetwork: ChainType | null;
  updateCurrentNetwork: (network: ChainType | null) => void;
}

const TokenSelect = (props: IProps) => {
  const { tokenData, otherTokenData, updateSwapData, slug, currentNetwork, updateCurrentNetwork } = props;

  const [isOpen, setIsOpen] = useState(false);
  const [networkValue, setNetworkValue] = useState<ChainType | null>(currentNetwork);

  const updateNetworkValue = (network: ChainType) => {
    setNetworkValue(network);
  };
  const updateTokenValue = (token: SingleTokenType) => {
    // updateSwapData(slug, "network", networkValue);
    updateCurrentNetwork(networkValue);

    // Todo: improve the ux when the user selects the same token and network
    if (token.symbol === otherTokenData?.token?.symbol) {
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
  const { data: tokenList, isPending: isTokenListLoading } = useFetchTokenList(networkValueWithFallback, address);
  const { data: searchTokenList, isPending: isSearchLoading } = useSearchTokenList(debouncedSearchValue);

  const LoadingComponent = () => (
    <div className="flex flex-col items-center justify-center py-8">
      <Loader2 className="h-6 w-6 animate-spin text-[#A5A5A5]" />
      <p className="mt-2 text-xs text-[#A5A5A5]">Loading tokens...</p>
    </div>
  );

  return (
    <Fragment>
      {/* Dropdown trigger */}
      <TokenTrigger value={tokenData.token} toggle={() => setIsOpen(!isOpen)} />
      <AnimatePresence>
        {isOpen ? (
          // Dropdown content
          <motion.div
            className="absolute top-0 left-0 z-[10] flex h-full w-full items-center justify-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
          >
            <div className="flex h-[98%] w-[98%] flex-col rounded-[15px] border border-[#1E1E1E] bg-[#111111] px-3 py-8">
              <div className="px-2">
                <div className="flex items-center justify-between">
                  <h1 className="text-base font-semibold">{slug === "from" ? "Send" : "Receive"}</h1>
                  <button
                    className="flex h-6 w-6 items-center justify-center rounded-full bg-[#1D1D1D]"
                    onClick={() => {
                      setNetworkValue(currentNetwork);
                      setIsOpen(false);
                    }}
                  >
                    <Image src={dashboard.x} alt="Cancel icon" />
                  </button>
                </div>

                <div className="relative my-3 rounded-[10px] bg-[#161616]">
                  <div className="absolute top-[30%] left-3">
                    <Image src={dashboard.search} alt="Search icon" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search Token"
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    className="h-11 w-full pl-9 text-xs font-medium text-[#D4D4D4]"
                  />
                  <div className="absolute top-[20%] right-3">
                    <NetworkSelect networkValue={networkValue} updateNetworkValue={updateNetworkValue} />
                  </div>
                </div>
              </div>

              {!!searchValue && searchTokenList ? (
                <div className="scrollbar overflow-y-auto pt-0">
                  {isSearchLoading ? (
                    <LoadingComponent />
                  ) : searchTokenList?.[networkValueWithFallback]?.length > 0 ? (
                    <>
                      <p className="text-left text-xs text-[#A5A5A5]">
                        {searchTokenList?.[networkValueWithFallback]?.length} results found
                      </p>
                      <TokenList
                        value={tokenData.token}
                        list={searchTokenList?.[networkValueWithFallback] || []}
                        updateTokenValue={updateTokenValue}
                        className=""
                      />
                    </>
                  ) : (
                    <p className="text-left text-xs text-[#A5A5A5]">No tokens found</p>
                  )}
                </div>
              ) : !!searchValue && isSearchLoading ? (
                <div className="scrollbar overflow-y-auto pt-0">
                  <LoadingComponent />
                </div>
              ) : (
                <div className="scrollbar overflow-y-auto px-1">
                  {isTokenListLoading ? (
                    <LoadingComponent />
                  ) : (
                    <TokenList
                      value={tokenData.token}
                      list={tokenList?.[networkValueWithFallback] || []}
                      updateTokenValue={updateTokenValue}
                    />
                  )}
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
