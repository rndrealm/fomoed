import React, { useRef, useState } from "react";
import { motion } from "motion/react";
import { calcMargin, cn, estimateLiqPrice } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { ErrorMsg, TextInput } from "@/components/auth/text-input";
import Slider from "./slider";
import Checkbox from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { useFormikContext } from "formik";
import { TradingFormInitialValues } from ".";
import { AppSelect } from "@/components/ui/app-select";

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

export function FormContent() {
  const [isLong, setIsLong] = useState(true);
  const [orderType, setOrderType] = useState<"limit" | "market" | "conditional">("limit");

  const { values, handleChange, handleBlur, setFieldValue } = useFormikContext<TradingFormInitialValues>();

  const balance = 988.32; // Todo: replace this with actual balance (in USDC)
  const leverage = 10; // Todo: replace this with actual leverage selected

  const handleSliderChange = (value: number) => {
    const orderValue = ((balance * value) / 100) * leverage;
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
            {/* <OrderTypeButton
                    isActive={orderType === "conditional"}
                    label="Conditional"
                    onClick={() => setOrderType("conditional")}
                  /> */}
          </div>
          <div className="flex items-center justify-between">
            <p className="text-[#A6AEB2] text-[8px] font-medium leading-[10px] tracking-[-0.4%]">Available Equity</p>

            <p className="text-white text-[8px] font-semibold leading-[10px] tracking-[-0.4%]">${balance}</p>
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
              <Input
                className="h-[24px] w-full border-none outline-none text-[#D7D7D7] !text-[10px] tracking-[-0.4%] leading-[14px] px-1 rounded-sm focus-visible:ring-0 bg-[#222329]"
                type="number"
                value={values.price}
                onChange={handleChange}
                onBlur={handleBlur}
                name="price"
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
            <Slider value={sliderPercentage} onChange={handleSliderChange} />
            <TextInput
              className="h-[1.5rem] !pr-4.5 w-[3rem] border-none outline-none text-[#D7D7D7] !text-[10px] tracking-[-0.4%] leading-[14px] px-1 rounded-sm focus-visible:ring-0 bg-[#222329]"
              value={sliderPercentage}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleSliderChange(Number(e.target.value))}
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
                {marginRequired ? `${marginRequired.toFixed(2)}` : "N/A"}
              </p>
            </div>

            <div className="flex items-center justify-between">
              <p className="text-[#A6AEB2] text-[8px] font-medium leading-[10px] tracking-[-0.4%]">
                Est. Liquidation Price
              </p>

              <p className="text-white text-[8px] font-semibold leading-[10px] tracking-[-0.4%]">
                {liqPrice ? `$${liqPrice.toFixed(2)}` : "N/A"}
              </p>
            </div>
          </div>

          <Checkbox label="Post Only" />
          <div className="flex items-center justify-between">
            {/* <Checkbox label="IOC" /> */}
            <Checkbox
              label="Reduce Only"
              checked={values.reduceOnly}
              onCheckedChange={(val) => setFieldValue("reduceOnly", val)}
            />
            <div className="flex items-center text-[#626262] text-xxs hidden gap-1">
              <p>TIF</p>

              <AppSelect
                name="TIF"
                options={TifOptions}
                value={values.tif}
                onValueChange={(val) => setFieldValue("tif", val)}
                triggerClassName="border-none w-[3rem] p-0 text-xxs gap-0"
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <Checkbox label="TP/SL" />
          </div>
        </div>

        <div className="">
          <Button
            type="submit"
            className="w-full bg-[#7637BA] hover:bg-[#7637BA] text-white font-medium text-[10px] leading-[14px] h-[28px]"
          >
            Create Order
          </Button>
        </div>
      </div>
    </>
  );
}
