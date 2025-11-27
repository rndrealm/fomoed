"use client";
import React, { useState } from "react";
import ExchangeButton from "./exchange-button";
import dashboard from "@/lib/assets/dashboard";
import { ModalContainer } from "@/components/shared";
import HyperliquidAuthModals from "../modals/hyperliquid-auth";

type ExchangeType = "ascendex" | "backpack" | "hyperliquid" | "coinw" | "bybit" | "binance";

interface ExchangePickerProps {
  onExchangeSelect: (exchange: ExchangeType) => void;
}

const exchanges = [
  { id: "ascendex" as const, logoSrc: dashboard.ascendexLogo, alt: "AscendEX", width: 96, height: 14 },
  { id: "bybit" as const, logoSrc: dashboard.bybitLogo, alt: "BYBIT", width: 41, height: 16 },
  { id: "coinw" as const, logoSrc: dashboard.coinwLogo, alt: "CoinW", width: 60, height: 16 },
  { id: "backpack" as const, logoSrc: dashboard.backpackLogo, alt: "Backpack", width: 78, height: 16 },
  { id: "hyperliquid" as const, logoSrc: dashboard.hyperliquidLogo2, alt: "Hyperliquid", width: 102, height: 19 },
  { id: "binance" as const, logoSrc: dashboard.binanceLogo, alt: "Binance", width: 80, height: 16 },
];

export default function HyperliquidAuth(props: ExchangePickerProps) {
  const { onExchangeSelect } = props;
  const [isOpen, setIsOpen] = useState(false);
  const toggleModal = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      <div className="relative flex h-full w-full justify-center items-center bg-[#0A1215] rounded-2xl p-8"></div>

      <ModalContainer
        open={isOpen}
        handleClose={toggleModal}
        preventOutsideClick
        hideX
        headerClassName=" w-full text-lg font-medium"
        className="!max-w-[462px] px-6 pb-6 bg-[#141416] gap-0"
      >
        <HyperliquidAuthModals toggle={toggleModal} onConfirm={() => {}} />
      </ModalContainer>
    </>
  );
}
