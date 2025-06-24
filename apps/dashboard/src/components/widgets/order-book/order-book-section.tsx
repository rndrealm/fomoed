import React from "react";
import { motion } from "motion/react";
import { cn, formatPriceSignificant } from "@/lib/utils";

interface IOrderWithWidth {
  price: string;
  quantity: string;
  width: number; // 0 to 1
}

interface IOrderBookSection {
  variant?: "sell" | "buy";
  data: IOrderWithWidth[];
  token: string;
}

export function OrderBookSection(props: IOrderBookSection) {
  const { variant = "sell", data, token } = props;

  const textColor = variant === "sell" ? "text-[#FF8970]" : "text-[#1FC16B]";
  const bgColor =
    variant === "sell" ? "bg-[rgba(255,137,112,0.3)]" : "bg-[#1e4f35]";

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <p className="text-[#878787] text-sm font-semibold leading-[1.35] select-none">
          Price (USDT)
        </p>

        <p className="text-[#878787] text-sm font-semibold leading-[1.35] select-none">
          Amount ({token})
        </p>
      </div>

      <div className="flex flex-col gap-[3px]">
        {data?.map((item, index) => {
          return (
            <div
              key={index}
              className="flex justify-between items-center px-[3px] relative"
            >
              <p
                className={cn(
                  "text-sm font-semibold leading-[1.35] relative z-9",
                  textColor
                )}
              >
                {formatPriceSignificant(item?.price)}
              </p>

              <p className="text-[#b9b9b9] text-sm font-semibold leading-[1.35] relative z-9">
                {Number(item.quantity).toFixed(6)}
              </p>

              <motion.div
                className={cn(
                  "absolute top-[0] right-[0] bottom-[0]  h-full rounded-[3px]",
                  bgColor
                )}
                animate={{
                  width: `${item.width * 100}%`,
                }}
              ></motion.div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
