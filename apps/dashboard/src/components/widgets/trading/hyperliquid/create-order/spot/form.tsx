/* eslint-disable react-hooks/exhaustive-deps */
import React, { Dispatch, SetStateAction, useEffect } from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import { ErrorMsg, TextInput } from "@/components/auth/text-input";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { useFormikContext } from "formik";
import { TradingFormInitialValues } from ".";
import { OrderType } from "@/services/queries/trading/types";
import { AppSelect, SelectOption } from "@/components/ui/app-select";
import { InputWithSelect } from "@/components/shared/input-with-select";
import OrderCheckLayout from "../order-check-layout";
import { PerpUniverse, SpotsUniverse } from "@/services/queries/hyperliquid/types";
import { SPOT_MAX_DECIMALS } from "../../../utils/constants";
import { countLeadingZeros, formatHlPrice, formatHlPriceInput, formatHlSizeInput } from "../../../utils";
import { CustomTextInput } from "@/components/shared/custom-text-input";

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

interface FormContentProps {
  balance: number;
  orderType: OrderType;
  setOrderType: Dispatch<SetStateAction<OrderType>>;
  isLong: boolean;
  setIsLong: Dispatch<SetStateAction<boolean>>;
  isPending: boolean;
  marketPrice: string;
  orderBy: string;
  setOrderBy: Dispatch<SetStateAction<string>>;
  selectOptions: SelectOption[];
  selectedToken: PerpUniverse | SpotsUniverse;
}

export function SpotFormContent(props: FormContentProps) {
  const {
    balance,
    orderType,
    setOrderType,
    isLong,
    setIsLong,
    isPending,
    marketPrice = 1,
    orderBy,
    setOrderBy,
    selectOptions,
    selectedToken,
  } = props;

  const { values, handleChange, handleBlur, setFieldValue } = useFormikContext<TradingFormInitialValues>();
  const decimals = selectedToken.szDecimals;
  const maxDecimal = SPOT_MAX_DECIMALS - decimals;
  const multiplier =
    orderBy === selectOptions[0].value && isLong
      ? Number(marketPrice)
      : orderBy === selectOptions[1].value && !isLong
        ? 1 / Number(marketPrice)
        : 1;

  const handleSliderChange = (value: number[]) => {
    const percentage = value[0];
    const orderValue = (balance * percentage) / multiplier / 100;
    const formattedSize = formatHlSizeInput(orderValue.toString(), orderBy === selectOptions[0].value ? decimals : 2);
    setFieldValue("quantity", formattedSize);
  };

  const balanceOverMultiplier = balance / multiplier;
  const leadingZeros = countLeadingZeros(balanceOverMultiplier);
  const isSliderDisabled = leadingZeros >= decimals;

  const sliderPercentage = Math.round(
    Math.min(balance ? ((Number(values.quantity) * multiplier) / balance) * 100 : 0, 100),
  );

  useEffect(() => {
    if (marketPrice || !values.price) {
      setFieldValue("price", formatHlPrice(Number(marketPrice), maxDecimal));
    }
  }, []);
  const balanceInOrderByCurrency = orderBy === selectOptions[1].value ? balance : balance * Number(marketPrice);
  const insufficientBalanceCheck = !Number(balance) || Number(values.quantity) > balanceInOrderByCurrency;
  return (
    <>
      <div className="flex flex-col gap-3">
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
          </div>
          <div className="flex items-center justify-between">
            <p className="text-[#A6AEB2] text-[8px] font-medium leading-[10px] tracking-[-0.4%]">Available Equity</p>

            <p className="text-white text-[8px] font-semibold leading-[10px] tracking-[-0.4%]">
              {isLong ? "$" : ""}
              {balance.toFixed(decimals)} {isLong ? "" : selectedToken.baseTokenName}
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
              <CustomTextInput
                className="h-[24px] w-full border-none outline-none text-[#D7D7D7] !text-[10px] tracking-[-0.4%] leading-[14px] px-1 rounded-sm focus-visible:ring-0 bg-[#222329]"
                type="number"
                value={values.price}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  const val = e.target.value;
                  setFieldValue("price", formatHlPriceInput(val, maxDecimal));
                }}
                onBlur={handleBlur}
                name="price"
                // rightPlaceholder="USDC"
                rightComponent={
                  <button
                    onClick={() => setFieldValue("price", formatHlPrice(Number(marketPrice), maxDecimal))}
                    type="button"
                    className="absolute right-2 top-[20%] text-xxs font-medium text-[#FF9D32] underline"
                  >
                    Mid
                  </button>
                }
                placeholder="Price (USDC)"
              />

              <ErrorMsg name="price" className="text-[8px] tracking-[-0.4%]" />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <p className="text-[#A6AEB2] text-[8px] font-medium leading-[10px] tracking-[-0.4%]">Quantity</p>

            <div className="flex flex-col">
              <InputWithSelect
                className="h-[24px] w-full border-none outline-none text-[#D7D7D7] !text-[10px] tracking-[-0.4%] leading-[14px] px-1 rounded-sm focus-visible:ring-0 bg-[#222329]"
                type="number"
                value={values.quantity}
                // onChange={handleChange}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  const val = e.target.value;
                  setFieldValue("quantity", formatHlSizeInput(val, orderBy === selectOptions[0].value ? decimals : 2));
                }}
                onBlur={handleBlur}
                name="quantity"
                placeholder="Quantity"
                rightPlaceholder="USDC"
                selectOptions={selectOptions}
                selectValue={orderBy}
                onChangeSelect={(val) => {
                  if (val === orderBy) return;
                  if (val === selectOptions[0].value) {
                    setFieldValue(
                      "quantity",
                      formatHlSizeInput((Number(values.quantity) / Number(marketPrice)).toString(), decimals),
                    );
                  } else {
                    setFieldValue("quantity", (Number(values.quantity) * Number(marketPrice)).toFixed(2));
                  }
                  setOrderBy(val);
                }}
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
              disabled={isSliderDisabled}
            />
            <CustomTextInput
              className="h-[1.5rem] !pr-4.5 w-[3rem] border-none outline-none text-[#D7D7D7] !text-[10px] tracking-[-0.4%] leading-[14px] px-1 rounded-sm focus-visible:ring-0 bg-[#222329]"
              value={sliderPercentage}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleSliderChange([Number(e.target.value)])}
              onBlur={handleBlur}
              name="percentage"
              rightPlaceholder="%"
              type="number"
              disabled={isSliderDisabled}
            />
          </div>
        </div>

        <div className="flex items-center justify-between">
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

        <div className="">
          <OrderCheckLayout>
            <Button
              disabled={!Number(values.quantity) || insufficientBalanceCheck || isPending}
              type="submit"
              isLoading={isPending}
              className="w-full bg-[#7637BA] hover:bg-[#7637BA] text-white font-medium text-[10px] leading-[14px] h-[28px]"
            >
              {insufficientBalanceCheck ? "Insufficient Balance" : "Create Order"}
            </Button>
          </OrderCheckLayout>
        </div>
      </div>
    </>
  );
}
