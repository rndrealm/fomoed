import React, { useRef, useState } from "react";
import { Formik } from "formik";
import * as Yup from "yup";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { ErrorMsg } from "@/components/auth/text-input";
import Slider from "./slider";
import Checkbox from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";

const validationSchema = Yup.object().shape({
  price: Yup.number().min(0.01, "Price must be greater than 0").required("Please enter price"),
  quantity: Yup.number().min(0, "Quantity must be a positive number").required("Please enter quantity"),
  orderValue: Yup.number().min(0, "Order value must be a positive number").required("Please enter order value"),
});

const initialValues = {
  price: 0,
  quantity: 0,
  orderValue: 0,
};

type InitialValues = ReturnType<() => typeof initialValues>;

interface IOrderTypeButtonProps {
  isActive: boolean;
  label: string;
  onClick?: () => void;
}

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

export function Form() {
  const [isLong, setIsLong] = useState(true);
  const [orderType, setOrderType] = useState<"limit" | "market" | "conditional">("limit");

  function onSubmit(_values: InitialValues) {
    console.log("submit", _values);
  }

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={onSubmit}
      validateOnBlur={false}
      validateOnMount={false}
      validateOnChange={false}
    >
      {(props) => {
        const { values, handleChange, handleBlur, handleSubmit } = props;
        return (
          <form onSubmit={handleSubmit} className="w-full h-full block">
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-center">
                <div className="flex bg-[#222329] rounded-md items-center">
                  <LongShortButton isActive={isLong} label="Buy / Long" onClick={() => setIsLong(true)} />

                  <LongShortButton isActive={!isLong} label="Sell / Short" onClick={() => setIsLong(false)} />
                </div>
              </div>

              <div className="flex flex-col gap-2 mt-1">
                <div className="flex items-center justify-center">
                  <OrderTypeButton
                    isActive={orderType === "limit"}
                    label="Limit"
                    onClick={() => setOrderType("limit")}
                  />
                  <OrderTypeButton
                    isActive={orderType === "market"}
                    label="Market"
                    onClick={() => setOrderType("market")}
                  />
                  <OrderTypeButton
                    isActive={orderType === "conditional"}
                    label="Conditional"
                    onClick={() => setOrderType("conditional")}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-[#A6AEB2] text-[8px] font-medium leading-[10px] tracking-[-0.4%]">
                    Available Equity
                  </p>

                  <p className="text-white text-[8px] font-semibold leading-[10px] tracking-[-0.4%]">$0.00</p>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex flex-col gap-1">
                  <p className="text-[#A6AEB2] text-[8px] font-medium leading-[10px] tracking-[-0.4%]">Price</p>

                  <div className="flex flex-col">
                    <Input
                      className="h-[24px] w-full border-none outline-none text-[#D7D7D7] !text-[10px] tracking-[-0.4%] leading-[14px] px-1 rounded-sm focus-visible:ring-0 bg-[#222329]"
                      type="number"
                      value={values.price}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      name="price"
                    />

                    <ErrorMsg name="price" className="text-[8px] tracking-[-0.4%]" />
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <p className="text-[#A6AEB2] text-[8px] font-medium leading-[10px] tracking-[-0.4%]">Quantity</p>

                  <div className="flex flex-col">
                    <Input
                      className="h-[24px] w-full border-none outline-none text-[#D7D7D7] !text-[10px] tracking-[-0.4%] leading-[14px] px-1 rounded-sm focus-visible:ring-0 bg-[#222329]"
                      type="number"
                      value={values.quantity}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      name="quantity"
                    />

                    <ErrorMsg name="quantity" className="text-[8px] tracking-[-0.4%]" />
                  </div>
                </div>

                <Slider />

                <div className="flex flex-col gap-1">
                  <p className="text-[#A6AEB2] text-[8px] font-medium leading-[10px] tracking-[-0.4%]">Order Value</p>

                  <div className="flex flex-col">
                    <Input
                      className="h-[24px] w-full border-none outline-none text-[#D7D7D7] !text-[10px] tracking-[-0.4%] leading-[14px] px-1 rounded-sm focus-visible:ring-0 bg-[#222329]"
                      type="number"
                      value={values.orderValue}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      name="orderValue"
                    />

                    <ErrorMsg name="orderValue" className="text-[8px] tracking-[-0.4%]" />
                  </div>

                  <div className="flex items-center justify-between">
                    <p className="text-[#A6AEB2] text-[8px] font-medium leading-[10px] tracking-[-0.4%]">
                      Margin Required
                    </p>

                    <p className="text-white text-[8px] font-semibold leading-[10px] tracking-[-0.4%]">$0.00</p>
                  </div>

                  <div className="flex items-center justify-between">
                    <p className="text-[#A6AEB2] text-[8px] font-medium leading-[10px] tracking-[-0.4%]">
                      Est. Liquidation Price
                    </p>

                    <p className="text-white text-[8px] font-semibold leading-[10px] tracking-[-0.4%]">-</p>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <Checkbox label="Post Only" />
                  <Checkbox label="IOC" />
                  <Checkbox label="Reduce Only" />
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
          </form>
        );
      }}
    </Formik>
  );
}
