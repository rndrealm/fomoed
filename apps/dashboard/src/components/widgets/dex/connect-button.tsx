import { ConnectButton as RainbowConnectButton } from "@rainbow-me/rainbowkit";
import AccountDropdown from "./account-dropdown";
import { cn } from "@/lib/utils";

interface IProps {
  buttonClassName?: string;
  buttonContainerClassName?: string;
  dropdownClassName?: string;
  dropdownTextClassName?: string;
}

const ConnectButton = (props: IProps) => {
  const { buttonClassName, buttonContainerClassName, dropdownClassName, dropdownTextClassName } = props;
  return (
    <div className={cn("flex  items-center gap-3 lg:gap-[0.625rem]")}>
      <RainbowConnectButton.Custom>
        {({ account, chain, openAccountModal, openChainModal, openConnectModal, mounted }) => {
          const ready = mounted;
          const connected = ready && account && chain;
          return (
            <div
              className={cn("flex items-center h-auto lg:h-10", buttonContainerClassName)}
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
                      className={cn(
                        "text-[#A6A6A6] text-xxs border border-[#202020] px-2 h-8 rounded-[6px]",
                        buttonClassName,
                      )}
                      onClick={openConnectModal}
                    >
                      Connect Wallet
                    </button>
                  );
                }
                if (chain.unsupported) {
                  return (
                    <button
                      className={cn(
                        "text-[#A6A6A6] text-xxs border border-[#202020] px-2 h-8 rounded-[6px]",
                        buttonClassName,
                      )}
                      onClick={openChainModal}
                    >
                      Wrong Wallet
                    </button>
                  );
                }

                return (
                  <AccountDropdown
                    account={account}
                    dropdownClassName={dropdownClassName}
                    dropdownTextClassName={dropdownTextClassName}
                  />
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
