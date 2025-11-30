"use client";
import React, { useState } from "react";
import { ModalContainer, RenderIf } from "@/components/shared";
import Image from "next/image";
import tradingAssets from "@/lib/assets/dashboard/trading";
import { Button } from "@/components/ui/button";
import { HyperliquidIcon, LeftIcon } from "@/components/icons/icon2";
import ConnectButton from "../../dex/connect-button";
import { useAccount } from "wagmi";
import { useCreateApiAgent } from "@/services/queries/hyperliquid";
import { useSupabaseAuth } from "@/components/providers";
import HyperliquidAuthModals from "../hyperliquid/modals/hyperliquid-auth";

type ExchangeType = "ascendex" | "backpack" | "hyperliquid" | "hyperliquid-end" | "coinw" | "bybit" | "binance";

interface ExchangePickerProps {
  onExchangeSelect: (exchange: ExchangeType) => void;
  onBack: () => void;
}

export default function HyperliquidAuth(props: ExchangePickerProps) {
  const { onBack, onExchangeSelect } = props;
  const account = useAccount();
  const [isOpen, setIsOpen] = useState(false);
  const toggleModal = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      <div className="relative  h-full w-full  bg-[#0A1215] border border-[#222222] overflow-hidden rounded-2xl p-8">
        <div className="absolute -bottom-30 -right-35">
          <Image src={tradingAssets.hyperliquidMask} width={1008} height={747} alt="Hyperliquid mask" />
        </div>
        <div className="absolute bottom-35 -right-0">
          <Image src={tradingAssets.hyperliquidCats} width={1151} height={493} alt="Hyperliquid cats images" />
        </div>

        <div className="relative ">
          <div>
            <button
              type="button"
              className="text-white cursor-pointer font-medium text-[0.625rem] border border-[#2A2A2A] rounded-sm pl-1 pr-2 py-0 h-[1.375rem]"
              onClick={onBack}
            >
              <div className="flex items-center gap-1">
                <LeftIcon className="size-3" />
                <p>Back</p>
              </div>
            </button>
          </div>

          <div className="pt-10 max-w-[21.375rem]">
            <h3 className="flex items-center font-medium text-[2rem] text-white gap-2.5">
              <span>Welcome to</span>
              <span className="pt-2">
                <HyperliquidIcon />
              </span>
            </h3>
            <p className="text-[#888888] pt-2 leading-5 text-sm">
              Connect your wallet to experience fast trading with low gas fees and instant execution.
            </p>

            <div className="pt-6">
              <ConnectButton
                dropdownClassName="bg-[#1E1E20] rounded-[8px]"
                dropdownTextClassName="text-[#B0B0B0]"
                buttonClassName="bg-[#51D2C1] cursor-pointer py-2 px-3.5 rounded-md text-[#010101] font-medium text-xs h-fit"
              />

              {account.isConnected && account.address ? (
                <ProceedButton toggleModal={toggleModal} address={account.address} />
              ) : null}
            </div>
          </div>
        </div>
      </div>

      <ModalContainer
        open={isOpen}
        handleClose={toggleModal}
        preventOutsideClick
        hideX
        headerClassName=" w-full text-lg font-medium"
        className="!max-w-[462px] px-6 pb-6 bg-[#141416] gap-0"
      >
        <HyperliquidAuthModals toggle={toggleModal} onConfirm={() => onExchangeSelect("hyperliquid-end")} />
      </ModalContainer>
    </>
  );
}

interface ProceedButtonProps {
  toggleModal: () => void;
  address: string;
}

const ProceedButton = (props: ProceedButtonProps) => {
  const { toggleModal, address } = props;

  const { session } = useSupabaseAuth();

  const { mutate, isPending } = useCreateApiAgent(session?.access_token, toggleModal);

  const handleProceed = () => {
    mutate({ wallet_address: address });
  };

  return (
    <div className="pt-6">
      <Button
        className="bg-[#51D2C1] cursor-pointer hover:bg-[#51D2C1]  py-2 px-3.5 rounded-md text-[#010101] font-medium text-xs"
        onClick={handleProceed}
        isLoading={isPending}
      >
        Proceed to Deposit
      </Button>
    </div>
  );
};
