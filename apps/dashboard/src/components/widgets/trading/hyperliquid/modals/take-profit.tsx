import React, { Fragment } from "react";
import { Formik } from "formik";
import * as Yup from "yup";
import { SubmitButton, TextInput } from "@/components/auth";
import Checkbox from "@/components/ui/checkbox";
import { RenderIf } from "@/components/shared";
import { Slider } from "@/components/ui/slider";
import { ITpSlOrder } from "../trading-panel/position-tab";
import { PERP_MAX_DECIMALS, SPOT_MAX_DECIMALS } from "../../utils/constants";
import { formatHlPrice, formatHlPriceInput, formatHlSize, formatHlSizeInput } from "../../utils";
import { calculateLossPercent, calculateSLFromLoss, calculateTpGain, cn, reverseCalculateTpGain } from "@/lib/utils";
import { useTicker } from "../../chart/trading-view/hyperliquid/use-ticker";
import { toast } from "sonner";
import { OrderEnum, TradeExecutionPayload } from "@/services/queries/trading/types";
import { useAccount } from "wagmi";
import { useSupabaseAuth } from "@/components/providers";
import { useExecuteTrade } from "@/services/queries/trading";
import { CustomTextInput } from "@/components/shared/custom-text-input";

const validationSchema = Yup.object().shape({
  tpPrice: Yup.number(),
  gain: Yup.number(),
  slPrice: Yup.number(),
  loss: Yup.number(),
  configureAmount: Yup.boolean(),
  customAmpunt: Yup.number(),
  limitPrice: Yup.boolean(),
  tpLimitPrice: Yup.number(),
  slLimitPrice: Yup.number(),
});

const initialValues = {
  tpPrice: "",
  gain: "",
  slPrice: "",
  loss: "",
  configureAmount: false,
  customAmount: "",
  limitPrice: false,
  tpLimitPrice: "",
  slLimitPrice: "",
};

type InitialValues = ReturnType<() => typeof initialValues>;

interface IProps {
  order: ITpSlOrder;
  toggleModal: () => void;
}

export function TakeProfit(props: IProps) {
  const { order, toggleModal } = props;
  const { coin, positionSize, entryPrice, markPrice, selectedToken, isSpot, isLong, leverage } = order;

  const account = useAccount();
  const walletAddress = account?.address || "";

  const { session } = useSupabaseAuth();

  const onSuccessCallback = () => {
    toggleModal();
  };

  const { mutate, isPending } = useExecuteTrade(session?.access_token, onSuccessCallback);

  const decimals = selectedToken.szDecimals;
  const maxDecimal = (isSpot ? SPOT_MAX_DECIMALS : PERP_MAX_DECIMALS) - decimals;

  const multiplier = 1; // to be replaced with actual multiplier logic

  const { ticker } = useTicker(coin);
  const currentPrice = ticker ? Number(ticker.ctx.midPx) : 0;

  function validateTpSl(values: InitialValues, isLong: boolean): boolean {
    const orderPrice = Number(currentPrice);

    const tpPrice = Number(values.tpPrice);
    const slPrice = Number(values.slPrice);

    // Check if TP and SL are greater than 0
    if (tpPrice && tpPrice <= 0) {
      toast.error("Take Profit price must be greater than 0");
      return false;
    }
    if (slPrice && slPrice <= 0) {
      toast.error("Stop Loss price must be greater than 0");
      return false;
    }

    if (isLong) {
      // For long positions: TP must be higher than order price, SL must be lower
      if (tpPrice && tpPrice <= orderPrice) {
        toast.error("Take Profit price must be greater than order price for long positions");
        return false;
      }
      if (slPrice && slPrice >= orderPrice) {
        toast.error("Stop Loss price must be lower than order price for long positions");
        return false;
      }
    } else {
      // For short positions: TP must be lower than order price, SL must be higher
      if (tpPrice && tpPrice >= orderPrice) {
        toast.error("Take Profit price must be lower than order price for short positions");
        return false;
      }
      if (slPrice && slPrice <= orderPrice) {
        toast.error("Stop Loss price must be greater than order price for short positions");
        return false;
      }
    }

    return true;
  }

  const onSubmit = async (_values: InitialValues) => {
    const toDecimal = selectedToken.szDecimals;

    if (!validateTpSl(_values, isLong)) {
      return;
    }
    const assetIndex = isSpot ? selectedToken.index + 10000 : selectedToken.index;
    const hasTP = _values.tpPrice && Number(_values.tpPrice) > 0;
    const hasSL = _values.slPrice && Number(_values.slPrice) > 0;

    if (!hasTP && !hasSL) {
      toast.error("Please set at least a Take Profit or Stop Loss price.");
      return;
    }

    const orders: OrderEnum[] = [];

    const customOrderSize = _values.configureAmount ? _values.customAmount : positionSize;

    // Add TP order if exists
    if (hasTP) {
      const calculatedPrice = Number(_values.tpPrice) * (1 - 0.036);
      const decimalPlaces = _values.tpPrice.includes(".") ? _values.tpPrice.split(".")[1].length : 0;
      orders.push({
        type: "trigger",
        asset: assetIndex,
        side: isLong ? "sell" : "buy", // Opposite side to close position
        triggerPrice: _values.tpPrice.toString(),
        price:
          _values.limitPrice && _values.tpLimitPrice
            ? Number(_values.tpLimitPrice).toFixed(toDecimal)
            : calculatedPrice.toFixed(toDecimal),
        size: customOrderSize,
        isMarket: true,
        reduceOnly: true,
        tpsl: "tp",
      });
    }

    // Add SL order if exists
    if (hasSL) {
      const calculatedPrice = Number(_values.slPrice) * (1 - 0.036);
      const decimalPlaces = _values.slPrice.includes(".") ? _values.slPrice.split(".")[1].length : 0;
      orders.push({
        type: "trigger",
        asset: assetIndex,
        side: isLong ? "sell" : "buy", // Opposite side to close position
        triggerPrice: _values.slPrice.toString(),
        price:
          _values.limitPrice && _values.slLimitPrice
            ? Number(_values.slLimitPrice).toFixed(toDecimal)
            : calculatedPrice.toFixed(toDecimal),
        size: customOrderSize,
        isMarket: true,
        reduceOnly: true,
        tpsl: "sl",
      });
    }

    const orderPayload = {
      provider: "hyperliquid",
      wallet_address: walletAddress,
      grouping: "normalTpsl",
      orders,
    } as TradeExecutionPayload;

    mutate(orderPayload);
  };

  return (
    <div className="flex flex-col gap-8 pt-8">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <p className="text-xs leading-[18px] text-[#D1D1D1]">Coin</p>
            <p className="text-xs leading-[18px] text-[#D1D1D1] font-medium">{coin}</p>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-xs leading-[18px] text-[#D1D1D1]">Position</p>
            <p
              className={cn(
                "text-xs leading-[18px] text-[#FFF0D3] font-medium",
                isLong ? "text-[#4ADE80]" : "text-[#FF7A7A]",
              )}
            >
              {positionSize} {coin}
            </p>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-xs leading-[18px] text-[#D1D1D1]">Entry Price</p>
            <p className="text-xs leading-[18px] text-[#D1D1D1] font-medium">
              ${formatHlPrice(Number(entryPrice), maxDecimal)}
            </p>
          </div>

          <div className="flex items-center justify-between">
            <p className="text-xs leading-[18px] text-[#D1D1D1]">Mark Price</p>
            <p className="text-xs leading-[18px] text-[#D1D1D1] font-medium">
              ${formatHlPrice(Number(markPrice), maxDecimal)}
            </p>
          </div>
        </div>

        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={onSubmit}
          validateOnBlur={false}
          validateOnMount={false}
          validateOnChange={false}
        >
          {(props) => {
            const { values, handleChange, handleBlur, handleSubmit, setFieldValue, errors } = props;
            const sliderPercentage = Math.round(
              Math.min(
                Number(positionSize) ? ((Number(values.customAmount) * multiplier) / Number(positionSize)) * 100 : 0,
                100,
              ),
            );
            // console.log(sliderPercentage);
            return (
              <form onSubmit={handleSubmit} className="">
                <div className="flex flex-col gap-8">
                  <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-1">
                        <div className="flex-1">
                          <CustomTextInput
                            aria-label="TP Price"
                            name="tpPrice"
                            type="number"
                            id="tpPrice"
                            placeholder="TP Price"
                            value={values.tpPrice}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                              setFieldValue("tpPrice", formatHlPriceInput(e.target.value, maxDecimal));
                              setFieldValue(
                                "gain",
                                e.target.value
                                  ? calculateTpGain(
                                      Number(e.target.value),
                                      Number(currentPrice),
                                      leverage,
                                      isLong ? "long" : "short",
                                    ).toFixed(2)
                                  : "",
                              );
                            }}
                            onBlur={handleBlur}
                            className="bg-[#1B1B1D] h-[40px] rounded-lg text-sm text-white"
                          />
                        </div>
                        <div className="flex-1">
                          <CustomTextInput
                            aria-label="Gain"
                            name="gain"
                            type="number"
                            id="gain"
                            placeholder="Gain"
                            value={values.gain}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                              const tp = reverseCalculateTpGain(
                                Number(e.target.value),
                                Number(currentPrice),
                                leverage,
                                isLong ? "long" : "short",
                              );
                              setFieldValue("gain", e.target.value);
                              setFieldValue(
                                "tpPrice",
                                e.target.value ? formatHlPriceInput(tp.toString(), maxDecimal) : "",
                              );
                            }}
                            onBlur={handleBlur}
                            className="bg-[#1B1B1D] h-[40px] rounded-lg text-sm text-white"
                            rightPlaceholder="%"
                            rightPlaceholderClassName="text-sm top-[28%] text-[#6D6D6D]"
                          />
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <div className="flex-1">
                          <CustomTextInput
                            aria-label="SL Price"
                            name="slPrice"
                            type="number"
                            id="slPrice"
                            placeholder="SL Price"
                            value={values.slPrice}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                              setFieldValue("slPrice", formatHlPriceInput(e.target.value, maxDecimal));
                              setFieldValue(
                                "loss",
                                e.target.value
                                  ? calculateLossPercent(
                                      Number(e.target.value),
                                      Number(currentPrice),
                                      leverage,
                                      isLong ? "long" : "short",
                                    ).toFixed(2)
                                  : "",
                              );
                            }}
                            onBlur={handleBlur}
                            className="bg-[#1B1B1D] h-[40px] rounded-lg text-sm text-white"
                          />
                        </div>
                        <div className="flex-1">
                          <CustomTextInput
                            aria-label="Loss"
                            name="loss"
                            type="number"
                            id="loss"
                            placeholder="Loss"
                            value={values.loss}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                              const sl = calculateSLFromLoss(
                                Number(e.target.value),
                                Number(currentPrice),
                                leverage,
                                isLong ? "long" : "short",
                              );
                              setFieldValue("loss", e.target.value);
                              setFieldValue(
                                "slPrice",
                                e.target.value ? formatHlPriceInput(sl.toString(), maxDecimal) : "",
                              );
                            }}
                            onBlur={handleBlur}
                            className="bg-[#1B1B1D] h-[40px] rounded-lg text-sm text-white"
                            rightPlaceholder="%"
                            rightPlaceholderClassName="text-sm top-[28%] text-[#6D6D6D]"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <div className="">
                        <Checkbox
                          label="Configure Amount"
                          checked={values.configureAmount}
                          onCheckedChange={(val) => setFieldValue("configureAmount", val)}
                          labelClassName="text-xs lwading-[18px] text-white"
                        />
                      </div>

                      <RenderIf condition={values.configureAmount}>
                        <div className="flex items-center gap-4">
                          <Slider
                            value={[sliderPercentage]}
                            onValueChange={(value: number[]) => {
                              const percentage = value[0];
                              const orderValue = (Number(positionSize) * percentage) / multiplier / 100;
                              setFieldValue("customAmount", formatHlSizeInput(orderValue.toString(), decimals));
                            }}
                            min={0}
                            max={100}
                            step={1}
                            showDots
                          />
                          <CustomTextInput
                            className="h-12 !pr-4.5 w-28 border-none outline-none text-[#D7D7D7] !text-sm tracking-[-0.4%] leading-[14px] px-2.5 rounded-[10px] focus-visible:ring-0 bg-[#222329]"
                            value={values.customAmount}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                              setFieldValue("customAmount", formatHlSizeInput(e.target.value, decimals));
                            }}
                            disableFormikError
                            name="percentage"
                            rightPlaceholder={coin}
                            rightPlaceholderClassName="text-sm top-[30%]"
                            type="number"
                          />
                        </div>
                      </RenderIf>
                    </div>

                    <div className="flex flex-col gap-2">
                      <div className="">
                        <Checkbox
                          label="Limit Price"
                          checked={values.limitPrice}
                          onCheckedChange={(val) => setFieldValue("limitPrice", val)}
                          labelClassName="text-xs lwading-[18px] text-white"
                        />
                      </div>
                      <RenderIf condition={values.limitPrice}>
                        <div className="flex items-center gap-1">
                          <div className="flex-1">
                            <CustomTextInput
                              aria-label="TP Limit Price"
                              name="tpLimitPrice"
                              type="number"
                              id="tpLimitPrice"
                              placeholder="TP Limit Price"
                              value={values.tpLimitPrice}
                              onChange={handleChange}
                              onBlur={handleBlur}
                              className="bg-[#1B1B1D] h-[40px] rounded-lg text-sm text-white"
                            />
                          </div>
                          <div className="flex-1">
                            <CustomTextInput
                              aria-label="SL Limit Price"
                              name="slLimitPrice"
                              type="number"
                              id="slLimitPrice"
                              placeholder="SL Limit Price"
                              value={values.slLimitPrice}
                              onChange={handleChange}
                              onBlur={handleBlur}
                              className="bg-[#1B1B1D] h-[40px] rounded-lg text-sm text-white"
                              rightPlaceholder="%"
                              rightPlaceholderClassName="text-sm top-[28%] text-[#6D6D6D]"
                            />
                          </div>
                        </div>
                      </RenderIf>
                    </div>
                  </div>

                  <div className="flex flex-col gap-4">
                    <SubmitButton isLoading={isPending} disabled={false}>
                      Submit
                    </SubmitButton>

                    <div className="w-full border-t border-[#1E1E20] border-dashed"></div>

                    <div className="flex gap-2 flex-col">
                      <p className="text-[#B0B0B0] text-xs leading-[18px] text-center">
                        By default take-profit and stop-loss orders apply to the entire position. Take-profit and
                        stop-loss automatically cancel after closing the position. A market order is triggered when the
                        stop loss or take profit price is reached.
                      </p>

                      <p className="text-[#B0B0B0] text-xs leading-[18px] text-center">
                        If the order size is configured above, the TP/SL order will be for that size no matter how the
                        position changes in the future.
                      </p>
                    </div>
                  </div>
                </div>
              </form>
            );
          }}
        </Formik>
      </div>
    </div>
  );
}
