import React, { Fragment, useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ConnectWalletModal } from "./connect-wallet-modal";
import { useAccount, useDisconnect, useSignMessage } from "wagmi";
import { FundWallet } from "./fund-wallet";
import { useGemachLogin, useGemachNonce, useReadGemachUser } from "@/services/queries/gemach";
import { arbitrum } from "viem/chains";
import { getFromLocalStorage, isTokenExpired, removeFromLocalStorage } from "@/lib/utils";
import { LOCAL_STORAGE_KEYS } from "@/lib/constants";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import {
  gemachUserLoggedInAtom,
  showCreateCopyTradeAtom,
  showEditCopyTradeAtom,
  showFundGdexAtom,
  showStatsAtom,
  showWithdrawAtom,
  singleCopyTradeAtom,
  toggleCreateCopyTradeAtom,
  toggleEditCopyTradeAtom,
  toggleGemachUserLoggedInAtom,
  toggleShowFundGdexAtom,
  toggleShowStatsAtom,
  toggleWithdrawAtom,
} from "@/lib/atoms/gemach";
import { useSupabaseAuth } from "@/components/providers";
import { Withdraw } from "./withdraw";
import { CreateCopyTrade } from "./create-copy-trade";
import { CopyTradeDetails } from "./copy-trade-details";
import { Stats } from "./stats";

const sheetVariants = {
  hidden: {
    y: "100%",
    transition: {
      // ease: [0.4, 0.0, 0.2, 1], // standard material-like ease
      duration: 0.15,
    },
  },
  visible: {
    y: 0,
    transition: {
      ease: [0.4, 0.0, 0.2, 1],
      duration: 0.4,
    },
  },
};

export function Modals() {
  const { address, isConnected } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const { disconnect } = useDisconnect();
  const { session } = useSupabaseAuth();

  const showFundGdex = useAtomValue(showFundGdexAtom);
  const showWithdraw = useAtomValue(showWithdrawAtom);
  const showCreateCopyTrade = useAtomValue(showCreateCopyTradeAtom);
  const showEditCopyTrade = useAtomValue(showEditCopyTradeAtom);
  const showStats = useAtomValue(showStatsAtom);

  const gemachUserLoggedIn = useAtomValue(gemachUserLoggedInAtom);

  const toggleShowFundex = useSetAtom(toggleShowFundGdexAtom);
  const toggleGemachUserLoggedIn = useSetAtom(toggleGemachUserLoggedInAtom);
  const toggleShowWithdraw = useSetAtom(toggleWithdrawAtom);
  const toggleShowCreateCopyTrade = useSetAtom(toggleCreateCopyTradeAtom);
  const toggleShowEditCopyTrade = useSetAtom(toggleEditCopyTradeAtom);
  const toggleShowStats = useSetAtom(toggleShowStatsAtom);

  const [singleCopyTrade, setSingleCopyTrade] = useAtom(singleCopyTradeAtom);

  const gemachLogin = useGemachLogin(session?.access_token);
  const gemachNonce = useGemachNonce(session?.access_token);

  useEffect(() => {
    let isCancelled = false;

    const login = async () => {
      try {
        if (!address) return;

        const savedNonceData = getFromLocalStorage(LOCAL_STORAGE_KEYS.GEMACH_NONCE);
        const isExpired = isTokenExpired(savedNonceData?.expiresAt);

        if (!isExpired) {
          toggleGemachUserLoggedIn(true);
          return;
        }

        const data = await gemachNonce.mutateAsync(address);
        const nonce = data?.nonce;
        const publicKeyCompressed = data?.publicKeyCompressed;
        const addressInLowerCase = address.toLowerCase();

        const message = `By signing, you agree to GDEX Trading Terms of Use and Privacy Policy. Your GDEX log in message: ${addressInLowerCase} ${nonce} ${publicKeyCompressed}`;
        const signature = await signMessageAsync({ message });

        const body = {
          address,
          nonce,
          publicKeyCompressedWith0x: `0x${publicKeyCompressed}`,
          signature,
          chainId: arbitrum.id,
        };

        gemachLogin.mutate(body);
      } catch (error) {
        console.error("Error logging in:", error);

        // disconnect();
      }
    };

    if (isConnected && !isCancelled) {
      login();
    }
    if (!isConnected) {
      toggleGemachUserLoggedIn(false);
      removeFromLocalStorage(LOCAL_STORAGE_KEYS.GEMACH_NONCE);
      removeFromLocalStorage(LOCAL_STORAGE_KEYS.GEMACH_USER_DATA);
    }

    return () => {
      isCancelled = true;
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConnected]);

  useEffect(() => {
    if (gemachLogin.isSuccess) {
      toggleGemachUserLoggedIn(true);
    }
  }, [gemachLogin.isSuccess, toggleGemachUserLoggedIn]);

  return (
    <Fragment>
      <AnimatePresence>
        {!isConnected && (
          <motion.div
            className="absolute top-[60px] left-0 right-0 bottom-0 bg-[rgba(0,0,0,0.5)] z-[10] pt-[10px] mx-4 mb-3"
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={sheetVariants}
          >
            <ConnectWalletModal />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showFundGdex && (
          <motion.div
            className="absolute top-0 left-0 right-0 bottom-0 bg-[rgba(0,0,0,0.5)] z-[9] p-4"
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={sheetVariants}
            onClick={() => {
              toggleShowFundex(false);
            }}
          >
            <div
              className="h-full w-full"
              onClick={(e) => {
                e.stopPropagation();
              }}
            >
              <FundWallet
                handleClose={() => {
                  toggleShowFundex(false);
                }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showWithdraw && (
          <motion.div
            className="absolute top-0 left-0 right-0 bottom-0 bg-[rgba(0,0,0,0.5)] z-[9] p-4"
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={sheetVariants}
            onClick={() => {
              toggleShowWithdraw(false);
            }}
          >
            <div
              className="h-full w-full"
              onClick={(e) => {
                e.stopPropagation();
              }}
            >
              <Withdraw
                handleClose={() => {
                  toggleShowWithdraw(false);
                }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {(showCreateCopyTrade || showEditCopyTrade) && (
          <motion.div
            className="absolute top-0 left-0 right-0 bottom-0 bg-[rgba(0,0,0,0.5)] z-[9] p-4"
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={sheetVariants}
            onClick={() => {
              toggleShowCreateCopyTrade(false);
              toggleShowEditCopyTrade(false);
              setSingleCopyTrade(null);
            }}
          >
            <div
              className="h-full w-full"
              onClick={(e) => {
                e.stopPropagation();
              }}
            >
              <CreateCopyTrade
                handleClose={() => {
                  toggleShowCreateCopyTrade(false);
                  toggleShowEditCopyTrade(false);
                  setSingleCopyTrade(null);
                }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {!!singleCopyTrade && !showEditCopyTrade && (
          <motion.div
            className="absolute top-0 left-0 right-0 bottom-0 bg-[rgba(0,0,0,0.5)] z-[9] p-4"
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={sheetVariants}
            onClick={() => {
              setSingleCopyTrade(null);
            }}
          >
            <div
              className="h-full w-full"
              onClick={(e) => {
                e.stopPropagation();
              }}
            >
              <CopyTradeDetails
                handleClose={() => {
                  setSingleCopyTrade(null);
                }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showStats && (
          <motion.div
            className="absolute top-0 left-0 right-0 bottom-0 bg-[rgba(0,0,0,0.5)] z-[9] p-4"
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={sheetVariants}
            onClick={() => {
              toggleShowStats(false);
            }}
          >
            <div
              className="h-full w-full"
              onClick={(e) => {
                e.stopPropagation();
              }}
            >
              <Stats
                handleClose={() => {
                  toggleShowStats(false);
                }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Fragment>
  );
}
