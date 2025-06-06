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
import TokenListSummary from "./token-list-summary";

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
}

const TokenSelect = (props: IProps) => {
  const { tokenData, otherTokenData, updateSwapData, slug } = props;
  const { data: networkList } = useFetchSupportedChains();
  const [isOpen, setIsOpen] = useState(false);
  const [networkValue, setNetworkValue] = useState<ChainType | null>(
    tokenData.network
  );

  const updateNetworkValue = (network: ChainType) => {
    setNetworkValue(network);
  };
  const updateTokenValue = (token: SingleTokenType) => {
    updateSwapData(slug, "network", networkValue);

    // Todo: improve the ux when the user selects the same token and network
    if (
      networkValue?.chainId === otherTokenData?.network?.chainId &&
      token.symbol === otherTokenData?.token?.symbol
    ) {
      setIsOpen(false);
      return;
    } else {
      updateSwapData(slug, "token", token);
    }

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

  // useEffect(() => {
  //   if (tokenList && !tokenData.token) {
  //     const selectedIndex = slug === "from" ? 0 : 1;
  //     updateSwapData(
  //       slug,
  //       "token",
  //       tokenList[networkValueWithFallback][selectedIndex]
  //     );
  //   }
  // }, [
  //   tokenList,
  //   tokenData.token,
  //   networkValueWithFallback,
  //   updateSwapData,
  //   slug,
  // ]);

  useEffect(() => {
    if (networkList && !networkValue) {
      updateNetworkValue(networkList[0]);
      updateSwapData(slug, "network", networkList[0]);
    }
  }, [networkList, networkValue, updateSwapData, slug]);

  return (
    <Fragment>
      {/* Dropdown trigger */}
      <TokenTrigger value={tokenData.token} toggle={() => setIsOpen(!isOpen)} />
      <AnimatePresence>
        {isOpen ? (
          // Dropdown content
          <motion.div
            className="absolute top-0 left-0 w-full h-full bg-[#080808] p-3 rounded-[15px] flex flex-col"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
          >
            <div>
              <div className="flex items-center justify-between">
                <h1 className="font-semibold text-mid">Select Token</h1>
                <button
                  className="bg-[#121212] border border-[#141414] rounded-[6px] w-7 h-7 flex items-center justify-center"
                  onClick={() => {
                    setNetworkValue(tokenData.network);
                    setIsOpen(false);
                  }}
                >
                  <Image src={dashboard.x} alt="Cancel icon" />
                </button>
              </div>

              <div className="relative my-2 bg-[#121212] rounded-[8px]">
                <div className="absolute left-3 top-[30%]">
                  <Image src={dashboard.search} alt="Search icon" />
                </div>
                <input
                  type="text"
                  placeholder="Search Token"
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  className="w-full h-10 pl-9 text-xs font-medium text-[#D4D4D4]"
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
              <div className="pt-3 overflow-y-auto scrollbar">
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
              <div className="bg-[#121212] rounded-[6px] p-sm  overflow-y-auto scrollbar mt-3">
                <TokenListSummary
                  value={tokenData.token}
                  list={
                    tokenList?.[networkValueWithFallback]?.slice(0, 4) || []
                  }
                  updateTokenValue={updateTokenValue}
                />
                <TokenList
                  value={tokenData.token}
                  list={tokenList?.[networkValueWithFallback] || []}
                  updateTokenValue={updateTokenValue}
                />
              </div>
            )}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </Fragment>
  );
};

export default TokenSelect;
