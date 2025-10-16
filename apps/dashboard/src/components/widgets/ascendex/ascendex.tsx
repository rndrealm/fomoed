// "use client";
// import React from "react";
// import { LayoutType } from "@/lib/atoms/layoutAtom";
// import { cn } from "@/lib/utils";
// import AscendexHeader from "./header";
// import CreateOrder from "./create-order";
// import OrderBookAndTrade from "./order-book-and-trade";

// interface IProps {
//   widget: LayoutType["widgets"][0];
// }

// export default function Ascendex({ widget }: IProps) {
//   return (
//     <div className="relative flex h-full w-full justify-center items-center">
//       <div
//         className={cn("relative flex h-full w-full flex-col gap-2 overflow-hidden rounded-2xl", "px-0 pb-0 bg-[#000]")}
//       >
//         {/* Header */}
//         <AscendexHeader widget={widget} />

//         {/* Content */}
//         <div className="flex h-full w-full flex-1 overflow-hidden gap-3 px-2 pb-2">
//           <div className="flex-1">
//             <p className="text-white">HELLO FROM ASCENDEX</p>
//           </div>

//           {/* Order Book and Trades Component */}
//           <OrderBookAndTrade />

//           {/* Create Order Component */}
//           <CreateOrder />
//         </div>
//       </div>
//     </div>
//   );
// }

"use client";
import React, { useState, useEffect } from "react";
import { LayoutType } from "@/lib/atoms/layoutAtom";
import { cn } from "@/lib/utils";
import AscendexHeader from "./header";
import CreateOrder from "./create-order";
import OrderBookAndTrade from "./order-book-and-trade";
import InitialScreen from "./initial-screen";
import ExchangePicker from "./exchange-picker";
import LoadingScreen from "./loading-screen";

interface IProps {
  widget: LayoutType["widgets"][0];
}

type WidgetState = "initial" | "exchange-picker" | "loading" | "active";
type ExchangeType = "ascendex" | "backpack" | "hyperliquid" | "coinw" | "bybit" | "binance" | null;

export default function Ascendex({ widget }: IProps) {
  const [state, setState] = useState<WidgetState>("initial");
  const [selectedExchange, setSelectedExchange] = useState<ExchangeType>(null);

  useEffect(() => {
    if (state === "loading") {
      const timer = setTimeout(() => {
        setState("active");
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [state]);

  const handleTradeNowClick = () => {
    setState("exchange-picker");
  };

  const handleExchangeSelect = (exchange: ExchangeType) => {
    setSelectedExchange(exchange);
    setState("loading");
  };

  if (state === "initial") {
    return <InitialScreen onTradeNowClick={handleTradeNowClick} />;
  }

  if (state === "exchange-picker") {
    return <ExchangePicker onExchangeSelect={handleExchangeSelect} />;
  }

  if (state === "loading" && selectedExchange === "ascendex") {
    return <LoadingScreen  />;
  }

  if (state === "active") {
    return (
      <div className="relative flex h-full w-full justify-center items-center">
        <div
          className={cn(
            "relative flex h-full w-full flex-col gap-2 overflow-hidden rounded-2xl",
            "px-0 pb-0 bg-[#000]"
          )}
        >
          {/* Header */}
          <AscendexHeader widget={widget} />

          {/* Content */}
          <div className="flex h-full w-full flex-1 overflow-hidden gap-3 px-2 pb-2">
            <div className="flex-1">
              <p className="text-white">HELLO FROM ASCENDEX</p>
            </div>

            {/* Order Book and Trades Component */}
            <OrderBookAndTrade />

            {/* Create Order Component */}
            <CreateOrder />
          </div>
        </div>
      </div>
    );
  }

  return null;
}