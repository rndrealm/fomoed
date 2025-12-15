import { TextInput } from "@/components/auth";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import dashboard from "@/lib/assets/dashboard";
import { IPositionOrder } from "../position-tab";
import { Slider } from "@/components/ui/slider";
import { useTicker } from "../../../chart/trading-view/hyperliquid/use-ticker";
import { InputWithSelect } from "@/components/shared/input-with-select";
import { useSupabaseAuth } from "@/components/providers";
import { useExecuteTrade } from "@/services/queries/trading";
import { useAccount } from "wagmi";
import { OrderEnum } from "@/services/queries/trading/types";
import { useQueryClient } from "@tanstack/react-query";
import OrderCheckLayout from "../../create-order/order-check-layout";
import { formatHlPriceInput, formatHlSizeInput } from "../../../utils";
import { PERP_MAX_DECIMALS, SPOT_MAX_DECIMALS } from "../../../utils/constants";
import { CustomTextInput } from "@/components/shared/custom-text-input";

interface IProps {
  toggleModal: () => void;
  isMarket: boolean;
  order: IPositionOrder;
}

const marketDesc = "This will attempt to immediately close the position.";
const limitDesc = "This will send an order to close your position at the limit price.";

const CloseOrder = (props: IProps) => {
  const { toggleModal, isMarket, order } = props;
  const { size: orderSize, isLong, leverage, coin, selectedToken, isSpot } = order;

  const decimals = selectedToken.szDecimals;
  const maxDecimal = (isSpot ? SPOT_MAX_DECIMALS : PERP_MAX_DECIMALS) - decimals;

  const queryClient = useQueryClient();
  const account = useAccount();
  const [size, setSize] = useState(order.size);
  const [price, setPrice] = useState("");
  const { ticker } = useTicker(coin);
  const currentPrice = ticker ? Number(ticker.ctx.midPx) : 0;
  const multiplier = 1; // to be replaced with actual multiplier logic

  const handleSliderChange = (value: number[]) => {
    const percentage = value[0];
    const orderValue = (Number(orderSize) * percentage) / multiplier / 100;
    setSize(formatHlSizeInput(orderValue.toString(), decimals));
  };

  const sliderPercentage = Math.round(
    Math.min(Number(orderSize) ? ((Number(size) * multiplier) / Number(orderSize)) * 100 : 0, 100),
  );

  const onSuccessCallback = () => {
    queryClient.invalidateQueries({ queryKey: ["hyper-liquid-balance"] });
    queryClient.invalidateQueries({ queryKey: ["hyper-liquid-balance-spot"] });
    toggleModal();
  };

  const { session } = useSupabaseAuth();

  const { mutate, isPending } = useExecuteTrade(session?.access_token, onSuccessCallback);

  const handleSubmit = () => {
    const orderData = [] as OrderEnum[];
    const assetIndex = isSpot ? selectedToken.index + 10000 : selectedToken.index;
    const toDecimal = selectedToken.szDecimals;
    if (isMarket) {
      orderData.push({
        asset: assetIndex,
        side: isLong ? "sell" : "buy",
        size: Number(size).toFixed(toDecimal),
        type: "market",
        reduceOnly: true,
        isSpot,
      });
    } else {
      orderData.push({
        asset: assetIndex,
        side: isLong ? "sell" : "buy",
        size: Number(size).toFixed(toDecimal),
        type: "limit",
        reduceOnly: true,
        price: Number(price).toFixed(toDecimal),
      });
    }
    mutate({
      provider: "hyperliquid",
      wallet_address: account.address || "",
      grouping: "na",
      orders: orderData,
    });
  };
  return (
    <div className="flex flex-col ">
      <p className=" font-medium text-[#B0B0B0] text-center text-xs pt-4">{isMarket ? marketDesc : limitDesc}</p>

      {isMarket ? (
        <div className="pt-8 flex flex-col gap-1">
          <div className=" text-[#D1D1D1] text-ideal flex items-center justify-between font-medium">
            <p>Size</p>
            <p className={cn(!isLong ? "text-[#4ADE80]" : "text-[#FF6B6B]")}>
              {orderSize} {coin.toUpperCase()}
            </p>
          </div>
          <div className=" text-[#D1D1D1] text-ideal flex items-center justify-between font-medium">
            <p>Price</p>
            <p>Market</p>
          </div>
        </div>
      ) : (
        <div className="pt-8">
          <CustomTextInput
            type="number"
            className={cn(
              "h-10 w-full rounded-[10px] border-none bg-[#1E1E20] px-2 pr-4 text-sm text-white placeholder:text-[#5F5F5F] focus:outline-none focus:border-[#f4f4f4]",
            )}
            placeholder="Price"
            value={price}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              const val = e.target.value;
              setPrice(formatHlPriceInput(val, maxDecimal));
            }}
            min="5"
            step="0.1"
            disableFormikError
            rightComponent={
              <button
                onClick={() => setPrice(currentPrice.toString())}
                className="absolute right-2 top-[25%] text-sm text-[#FFDCA5]"
              >
                Mid
              </button>
            }
          />
        </div>
      )}

      <div className="py-4">
        <CustomTextInput
          type="number"
          className={cn(
            "h-10 w-full rounded-[10px] border-none bg-[#1E1E20] px-2 pr-4 text-sm text-white placeholder:text-[#5F5F5F] focus:outline-none focus:border-[#f4f4f4]",
          )}
          placeholder="Size"
          value={size}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            const val = e.target.value;
            setSize(formatHlSizeInput(val, decimals));
          }}
          min="5"
          step="0.1"
          rightPlaceholder={coin.toUpperCase()}
          rightPlaceholderClassName="text-sm top-[28%] text-[#FFDCA5]"
          disableFormikError
        />
      </div>

      <div className="flex items-center pb-8 gap-4">
        <Slider value={[sliderPercentage]} onValueChange={handleSliderChange} min={0} max={100} step={1} showDots />
        <CustomTextInput
          className="h-12 !pr-4.5 w-14 border-none outline-none text-[#D7D7D7] !text-sm tracking-[-0.4%] leading-[14px] px-2.5 rounded-[10px] focus-visible:ring-0 bg-[#222329]"
          value={sliderPercentage}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleSliderChange([Number(e.target.value)])}
          disableFormikError
          name="percentage"
          rightPlaceholder="%"
          rightPlaceholderClassName="text-sm top-[30%]"
          type="number"
        />
      </div>
      <div>
        <OrderCheckLayout
          buttonClassName="w-full bg-[#E7E7E7]  hover:bg-[#E7E7E7]  text-[#010101] font-medium text-sm h-11 "
          buttonContainerClassName="w-full"
          buttonWrapperClassName="w-full"
          approveClassName="h-11 !text-[0.875rem]"
        >
          <Button
            type="button"
            disabled={!size || Number(size) <= 0 || (!isMarket && !price)}
            onClick={handleSubmit}
            isLoading={isPending}
            className="w-full bg-white hover:bg-[#f4f4f4]  text-[#1E1E1E] font-medium text-[0.875rem] leading-[14px] h-12"
          >
            Submit
          </Button>
        </OrderCheckLayout>
      </div>
    </div>
  );
};

export default CloseOrder;
