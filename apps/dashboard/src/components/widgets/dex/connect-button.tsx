import { ConnectButton as RainbowConnectButton } from "@rainbow-me/rainbowkit";
import Image from "next/image";
import { useAccount } from "wagmi";
import { shortenAddress } from "@/lib/utils";
import dashboard from "@/lib/assets/dashboard";

const ConnectButton = () => {
  const account = useAccount();
  return (
    <div className="flex  items-center gap-3 lg:gap-[0.625rem]">
      {/* {account.status === "connected" ? (
        <div>
          <ChainSwitcher />
        </div>
      ) : null} */}
      <RainbowConnectButton.Custom>
        {({
          account,
          chain,
          openAccountModal,
          openChainModal,
          openConnectModal,
          mounted,
        }) => {
          const ready = mounted;
          const connected = ready && account && chain;
          return (
            <div
              className="flex items-center h-auto lg:h-10"
              {...(!ready && {
                "aria-hidden": true,
                style: {
                  opacity: 0,
                  pointerEvents: "none",
                  userSelect: "none",
                },
              })}
            >
              {(() => {
                if (!connected) {
                  return (
                    <button
                      className="text-[#A6A6A6] text-xxs border border-[#202020] px-2 h-8 rounded-[6px]"
                      onClick={openConnectModal}
                    >
                      Connect Wallet
                    </button>
                  );
                }
                if (chain.unsupported) {
                  return (
                    <button
                      className="text-[#A6A6A6] text-xxs border border-[#202020] px-2 h-8 rounded-[6px]"
                      onClick={openChainModal}
                    >
                      Wrong Wallet
                    </button>
                  );
                }
                return (
                  <>
                    <button
                      onClick={openAccountModal}
                      className="flex items-center gap-1 bg-[#121212] border border-[#141414] px-2 h-8 rounded-[6px]"
                    >
                      <div>
                        <Image
                          src={dashboard.token}
                          alt="Wallet Icon"
                          // width={40}
                          // height={40}
                          priority
                        />
                      </div>
                      <p className="text-[#A6A6A6] font-medium text-xxs ">
                        {shortenAddress(account.address)}
                      </p>
                    </button>
                    <button
                      onClick={openAccountModal}
                      className="block h-8 rounded-[0.375rem] border border-[#131415] px-[0.625rem] lg:hidden"
                    >
                      <p className="font-geist-medium text-neutral text-[#CDCDCD]">
                        {shortenAddress(account.address)}
                      </p>
                    </button>
                  </>
                );
              })()}
            </div>
          );
        }}
      </RainbowConnectButton.Custom>
    </div>
  );
};

export default ConnectButton;
