import React, { Fragment } from "react";
import { Formik } from "formik";
import * as Yup from "yup";
import { SubmitButton, TextInput } from "@/components/auth";
import Checkbox from "@/components/ui/checkbox";
import { RenderIf } from "@/components/shared";
import { Slider } from "@/components/ui/slider";
import { ITpSlOrder } from "../trading-panel/position-tab";
import { PERP_MAX_DECIMALS, SPOT_MAX_DECIMALS } from "../../utils/constants";
import { formatHlPrice } from "../../utils";
import { cn } from "@/lib/utils";

const validationSchema = Yup.object().shape({
  tpPrice: Yup.number(),
  gain: Yup.number(),
  slPrice: Yup.number(),
  loss: Yup.number(),
  configureAmount: Yup.boolean(),
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
  limitPrice: false,
  tpLimitPrice: "",
  slLimitPrice: "",
};

type InitialValues = ReturnType<() => typeof initialValues>;

interface IProps {
  order: ITpSlOrder;
}

export function TakeProfit(props: IProps) {
  const { order } = props;
  const { coin, positionSize, entryPrice, markPrice, selectedToken, isSpot, isLong } = order;
  const decimals = selectedToken.szDecimals;
  const maxDecimal = (isSpot ? SPOT_MAX_DECIMALS : PERP_MAX_DECIMALS) - decimals;
  const onSubmit = async (_values: InitialValues) => {
    console.log("Submit values:", _values);
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
            console.log("Formik errors:", errors);
            return (
              <form onSubmit={handleSubmit} className="">
                <div className="flex flex-col gap-8">
                  <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-1">
                        <div className="flex-1">
                          <TextInput
                            aria-label="TP Price"
                            name="tpPrice"
                            type="number"
                            id="tpPrice"
                            placeholder="TP Price"
                            value={values.tpPrice}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            className="bg-[#1B1B1D] h-[40px] rounded-lg text-sm text-white"
                          />
                        </div>
                        <div className="flex-1">
                          <TextInput
                            aria-label="Gain"
                            name="gain"
                            type="number"
                            id="gain"
                            placeholder="Gain"
                            value={values.gain}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            className="bg-[#1B1B1D] h-[40px] rounded-lg text-sm text-white"
                            rightPlaceholder="%"
                            rightPlaceholderClassName="text-sm top-[28%] text-[#6D6D6D]"
                          />
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <div className="flex-1">
                          <TextInput
                            aria-label="SL Price"
                            name="slPrice"
                            type="number"
                            id="slPrice"
                            placeholder="SL Price"
                            value={values.slPrice}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            className="bg-[#1B1B1D] h-[40px] rounded-lg text-sm text-white"
                          />
                        </div>
                        <div className="flex-1">
                          <TextInput
                            aria-label="Loss"
                            name="loss"
                            type="number"
                            id="loss"
                            placeholder="Loss"
                            value={values.loss}
                            onChange={handleChange}
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
                          <Slider value={[0]} onValueChange={() => {}} min={0} max={100} step={1} showDots />
                          <TextInput
                            className="h-10 !pr-4.5 w-14 border-none outline-none text-[#D7D7D7] !text-sm tracking-[-0.4%] leading-[14px] px-2.5 rounded-[10px] focus-visible:ring-0 bg-[#222329]"
                            value={0}
                            // onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleSliderChange([Number(e.target.value)])}
                            disableFormikError
                            name="percentage"
                            rightPlaceholder="%"
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
                            <TextInput
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
                            <TextInput
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
                    <SubmitButton isLoading={false} disabled={false}>
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
