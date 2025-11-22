/* eslint-disable react-hooks/exhaustive-deps */
import React, { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import {
  calcMargin,
  calculateLossPercent,
  calculateSLFromLoss,
  calculateTpGain,
  cn,
  estimateLiqPrice,
  reverseCalculateTpGain,
  validateReduceOnly,
} from "@/lib/utils";
import { ErrorMsg, TextInput } from "@/components/auth/text-input";
import { Slider } from "@/components/ui/slider";
import Checkbox from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { useFormikContext } from "formik";
import { TradingFormInitialValues } from ".";
import { AppSelect } from "@/components/ui/app-select";
import { OrderType } from "@/services/queries/trading/types";
import { RenderIf } from "@/components/shared";

interface IOrderTypeButtonProps {
  isActive: boolean;
  label: string;
  onClick?: () => void;
}

const TifOptions = [
  {
    label: "GTC",
    value: "Gtc",
  },
  {
    label: "IOC",
    value: "Ioc",
  },
  {
    label: "ALO",
    value: "Alo",
  },
];

function OrderTypeButton(props: IOrderTypeButtonProps) {
  const { isActive = false, label, onClick } = props;
  return (
    <button type="button" onClick={onClick}>
      <div className="relative px-2 py-1 ">
        <p
          className={cn("text-[#84858C] text-[10px] font-medium leading-[14px] relative z-1", isActive && "text-white")}
        >
          {label}
        </p>
        {isActive && (
          <motion.div
            layoutId="app_ascendex_order_type"
            className="absolute top-0 right-0 w-full h-full bg-[#2B2C32] rounded-sm"
          ></motion.div>
        )}
      </div>
    </button>
  );
}

function LongShortButton(props: IOrderTypeButtonProps) {
  const { isActive, label, onClick } = props;

  return (
    <button type="button" onClick={onClick}>
      <div className="relative py-1 px-2">
        <p
          className={cn("text-[#84858C] text-[10px] font-medium leading-[14px] relative z-1", isActive && "text-white")}
        >
          {label}
        </p>
        {isActive && (
          <motion.div
            layoutId="app_ascendex_long_short_toggle"
            className="absolute top-0 right-0 w-full h-full bg-[#2B2C32] rounded-sm"
          ></motion.div>
        )}
      </div>
    </button>
  );
}

const MyComponent = () => {
  const constraintsRef = useRef(null);

  return (
    <motion.div className="w-full" ref={constraintsRef}>
      <motion.div
        className="w-[16px] h-[16px] bg-[red]"
        drag="x"
        dragConstraints={constraintsRef}
        dragElastic={0.2}
        dragMomentum={false}
      />
    </motion.div>
  );
};

interface FormContentProps {
  balance: number;
  orderType: OrderType;
  setOrderType: Dispatch<SetStateAction<OrderType>>;
  isLong: boolean;
  setIsLong: Dispatch<SetStateAction<boolean>>;
  leverage: number;
  toggleLeverageModal: () => void;
  isPending: boolean;
  currentPosition: string;
  marketPrice: string;
}

export function FormContent(props: FormContentProps) {
  const {
    balance,
    orderType,
    setOrderType,
    isLong,
    setIsLong,
    leverage,
    toggleLeverageModal,
    isPending,
    currentPosition,
    marketPrice,
  } = props;

  const { values, handleChange, handleBlur, setFieldValue, errors, touched } =
    useFormikContext<TradingFormInitialValues>();

  const handleSliderChange = (value: number[]) => {
    const percentage = value[0];
    const orderValue = ((balance * percentage) / 100) * leverage;
    setFieldValue("quantity", orderValue.toFixed(2));
  };

  const sliderPercentage = Math.round(
    Math.min(balance ? (Number(values.quantity) / leverage / balance) * 100 : 0, 100),
  );

  const marginRequired = calcMargin({
    positionSize: Number(values.quantity),
    leverage,
  });
  const liqPrice = estimateLiqPrice({
    entryPrice: Number(values.price),
    maintenanceRate: 0.005,
    leverage,
    side: isLong ? "long" : "short",
  });

  const validateReduceOnlyResponse = validateReduceOnly(
    Number(currentPosition),
    isLong ? "buy" : "sell",
    Number(values.quantity),
  );

  useEffect(() => {
    // if (marketPrice && (!values.price || values.price === "0") && !touched.price) {
    //   setFieldValue("price", marketPrice);
    // }
    if (marketPrice) {
      setFieldValue("price", marketPrice);
    }
  }, [marketPrice]);

  return (
    <>
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <button type="button" className="bg-[#1E2025] text-white text-xxxs px-2 py-1 rounded-[4px]">
            Isolated
          </button>
          <button
            onClick={toggleLeverageModal}
            type="button"
            className="bg-[#1E2025] text-white text-xxxs px-2 py-1 rounded-[4px]"
          >
            {leverage}x
          </button>
          <button type="button" className="bg-[#1E2025] text-white text-xxxs px-2 py-1 rounded-[4px]">
            One Way
          </button>
        </div>
        <div className="flex items-center justify-center">
          <div className="flex bg-[#222329] rounded-md items-center">
            <LongShortButton isActive={isLong} label="Buy / Long" onClick={() => setIsLong(true)} />

            <LongShortButton isActive={!isLong} label="Sell / Short" onClick={() => setIsLong(false)} />
          </div>
        </div>

        <div className="flex flex-col gap-2 mt-1">
          <div className="flex items-center justify-center">
            <OrderTypeButton isActive={orderType === "limit"} label="Limit" onClick={() => setOrderType("limit")} />
            <OrderTypeButton isActive={orderType === "market"} label="Market" onClick={() => setOrderType("market")} />
            {/* <OrderTypeButton
                    isActive={orderType === "conditional"}
                    label="Conditional"
                    onClick={() => setOrderType("conditional")}
                  /> */}
          </div>
          <div className="flex items-center justify-between">
            <p className="text-[#A6AEB2] text-[8px] font-medium leading-[10px] tracking-[-0.4%]">Available Equity</p>

            <p className="text-white text-[8px] font-semibold leading-[10px] tracking-[-0.4%]">${balance.toFixed(2)}</p>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-[#A6AEB2] text-[8px] font-medium leading-[10px] tracking-[-0.4%]">Current Position</p>

            <p
              className={cn("text-[8px] font-semibold leading-[10px] tracking-[-0.4%]", {
                "text-red-500": Number(currentPosition) < 0,
                "text-white": Number(currentPosition) === 0,
                "text-[#00AF58]": Number(currentPosition) > 0,
              })}
            >
              ${Math.abs(Number(currentPosition))}
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <div
            className={cn("flex flex-col gap-1", {
              hidden: orderType === "market",
            })}
          >
            <p className="text-[#A6AEB2] text-[8px] font-medium leading-[10px] tracking-[-0.4%]">Price</p>

            <div className="flex flex-col">
              <TextInput
                className="h-[24px] w-full border-none outline-none text-[#D7D7D7] !text-[10px] tracking-[-0.4%] leading-[14px] px-1 rounded-sm focus-visible:ring-0 bg-[#222329]"
                type="number"
                value={values.price}
                onChange={handleChange}
                onBlur={handleBlur}
                name="price"
                rightPlaceholder="USDC"
                placeholder="Price (USDC)"
              />

              <ErrorMsg name="price" className="text-[8px] tracking-[-0.4%]" />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <p className="text-[#A6AEB2] text-[8px] font-medium leading-[10px] tracking-[-0.4%]">Quantity</p>

            <div className="flex flex-col">
              <TextInput
                className="h-[24px] w-full border-none outline-none text-[#D7D7D7] !text-[10px] tracking-[-0.4%] leading-[14px] px-1 rounded-sm focus-visible:ring-0 bg-[#222329]"
                type="number"
                value={values.quantity}
                onChange={handleChange}
                onBlur={handleBlur}
                name="quantity"
                rightPlaceholder="USDC"
              />

              <ErrorMsg name="quantity" className="text-[8px] tracking-[-0.4%]" />
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <Slider
              value={[sliderPercentage]}
              onValueChange={handleSliderChange}
              min={0}
              max={100}
              step={1}
              showDots
              dotPositions={[0, 25, 50, 75, 100]}
            />
            <TextInput
              className="h-[1.5rem] !pr-4.5 w-[3rem] border-none outline-none text-[#D7D7D7] !text-[10px] tracking-[-0.4%] leading-[14px] px-1 rounded-sm focus-visible:ring-0 bg-[#222329]"
              value={sliderPercentage}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleSliderChange([Number(e.target.value)])}
              onBlur={handleBlur}
              name="percentage"
              rightPlaceholder="%"
              type="number"
            />
          </div>

          <div className="flex flex-col gap-1">
            {/* <p className="text-[#A6AEB2] text-[8px] font-medium leading-[10px] tracking-[-0.4%]">Order Value</p>

            <div className="flex flex-col">
              <TextInput
                className="h-[24px] w-full border-none outline-none text-[#D7D7D7] !text-[10px] tracking-[-0.4%] leading-[14px] px-1 rounded-sm focus-visible:ring-0 bg-[#222329]"
                type="number"
                value={orderValueUSDC.toFixed(2)}
                onChange={handleOrderValueChange}
                onBlur={handleBlur}
                name="orderValue"
                rightPlaceholder="USDC"
              />

              <ErrorMsg name="orderValue" className="text-[8px] tracking-[-0.4%]" />
            </div> */}

            <div className="flex items-center justify-between">
              <p className="text-[#A6AEB2] text-[8px] font-medium leading-[10px] tracking-[-0.4%]">Margin Required</p>

              <p className="text-white text-[8px] font-semibold leading-[10px] tracking-[-0.4%]">
                {marginRequired ? `$${marginRequired.toFixed(2)}` : "N/A"}
              </p>
            </div>

            <div className="flex items-center justify-between">
              <p className="text-[#A6AEB2] text-[8px] font-medium leading-[10px] tracking-[-0.4%]">
                Est. Liquidation Price
              </p>

              <p className="text-white text-[8px] font-semibold leading-[10px] tracking-[-0.4%]">
                {liqPrice ? `${liqPrice.toFixed(2)}` : "N/A"}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <Checkbox label="Post Only" />
            {/* <Checkbox label="IOC" /> */}
            <Checkbox
              label="Reduce Only"
              checked={values.reduceOnly}
              onCheckedChange={(val) => setFieldValue("reduceOnly", val)}
            />
            <div
              className={cn("flex items-center text-[#626262] text-xxs gap-1", {
                hidden: orderType === "market",
              })}
            >
              <AppSelect
                name="TIF"
                options={TifOptions}
                value={values.tif}
                onValueChange={(val) => setFieldValue("tif", val)}
                triggerClassName="border-none w-9.5 p-0 text-xxs gap-0 !text-[#A6AEB2]"
                contentClassName="min-w-0 !bg-[#141416] w-12"
                itemClassName="font-medium !text-[#A6AEB2] text-xxs focus:bg-[#222329]"
                hideIndicator
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <Checkbox label="TP/SL" checked={values.tpSl} onCheckedChange={(val) => setFieldValue("tpSl", val)} />
          </div>
          <RenderIf condition={values.tpSl}>
            <div>
              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <label className="text-[#A6AEB2] text-xxxs font-medium" htmlFor="tp">
                    TP Price
                  </label>
                  <TextInput
                    value={values.tp}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      setFieldValue("tp", e.target.value);
                      setFieldValue(
                        "gain",
                        e.target.value
                          ? calculateTpGain(
                              Number(values.tp),
                              Number(marketPrice),
                              leverage,
                              isLong ? "long" : "short",
                            ).toFixed(2)
                          : "",
                      );
                    }}
                    onBlur={handleChange}
                    name="tp"
                    type="number"
                    className="h-[1.5rem] !pr-4.5 w-full border-[0.5px] border-[#384044] outline-none text-[#D7D7D7] !text-[10px] tracking-[-0.4%] leading-[14px] px-1 rounded-[4px] focus-visible:ring-0 bg-[#222329]"
                  />
                </div>
                <div className="flex-1">
                  <label className="text-[#A6AEB2] text-xxxs font-medium" htmlFor="tpRoi">
                    ROI
                  </label>
                  <TextInput
                    value={values.gain}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      const tp = reverseCalculateTpGain(
                        Number(e.target.value),
                        Number(marketPrice),
                        leverage,
                        isLong ? "long" : "short",
                      );
                      setFieldValue("gain", e.target.value);
                      setFieldValue("tp", e.target.value ? tp : "");
                    }}
                    rightPlaceholder="%"
                    onBlur={handleChange}
                    name="tpRoi"
                    className="h-[1.5rem] !pr-4.5 w-full border-[0.5px] border-[#384044] outline-none text-[#D7D7D7] !text-[10px] tracking-[-0.4%] leading-[14px] px-1 rounded-[4px] focus-visible:ring-0 bg-[#222329]"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <label className="text-[#A6AEB2] text-xxxs font-medium" htmlFor="sl">
                    SL Price
                  </label>
                  <TextInput
                    value={values.sl}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      setFieldValue("sl", e.target.value);
                      setFieldValue(
                        "loss",
                        e.target.value
                          ? calculateLossPercent(
                              Number(values.sl),
                              Number(marketPrice),
                              leverage,
                              isLong ? "long" : "short",
                            ).toFixed(2)
                          : "",
                      );
                    }}
                    onBlur={handleChange}
                    name="sl"
                    type="number"
                    className="h-[1.5rem] !pr-4.5 w-full border-[0.5px] border-[#384044] outline-none text-[#D7D7D7] !text-[10px] tracking-[-0.4%] leading-[14px] px-1 rounded-[4px] focus-visible:ring-0 bg-[#222329]"
                  />
                </div>
                <div className="flex-1">
                  <label className="text-[#A6AEB2] text-xxxs font-medium" htmlFor="slRoi">
                    ROI
                  </label>
                  <TextInput
                    value={values.loss}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      const sl = calculateSLFromLoss(
                        Number(e.target.value),
                        Number(marketPrice),
                        leverage,
                        isLong ? "long" : "short",
                      );
                      setFieldValue("loss", e.target.value);
                      setFieldValue("sl", e.target.value ? sl.toFixed() : "");
                    }}
                    rightPlaceholder="%"
                    onBlur={handleChange}
                    name="slRoi"
                    className="h-[1.5rem] !pr-4.5 w-full border-[0.5px] border-[#384044] outline-none text-[#D7D7D7] !text-[10px] tracking-[-0.4%] leading-[14px] px-1 rounded-[4px] focus-visible:ring-0 bg-[#222329]"
                  />
                </div>
              </div>
            </div>
          </RenderIf>
        </div>

        <div className="">
          <Button
            disabled={!values.quantity || (values.reduceOnly && !validateReduceOnlyResponse.ok)}
            type="submit"
            isLoading={isPending}
            className="w-full bg-[#7637BA] hover:bg-[#7637BA] text-white font-medium text-[10px] leading-[14px] h-[28px]"
          >
            {values.reduceOnly && validateReduceOnlyResponse.reason
              ? validateReduceOnlyResponse.reason
              : "Create Order"}
          </Button>
        </div>
      </div>
    </>
  );
}
