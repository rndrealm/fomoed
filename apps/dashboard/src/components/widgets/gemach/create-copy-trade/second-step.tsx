import React from "react";
import { Formik } from "formik";
import * as Yup from "yup";
import { Close, Info } from "@/components/icons/icons";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { RenderIf } from "@/components/shared";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { ErrorMsg } from "@/components/auth/text-input";
import CaretDown from "@/components/icons/CaretDown";

const validationSchema = Yup.object().shape({
  copyMode: Yup.number().oneOf([1, 2], "Please select a copy mode").required("Please select a copy mode"),
  fixedAmountCostPerOrder: Yup.number().when("copyMode", {
    is: 1,
    then: (schema) => schema.min(0.1, "Amount must be greater than 0.1").required("Please enter margin amount"),
    otherwise: (schema) => schema.notRequired(),
  }),
});

const initialValues = {
  copyMode: 1,
  fixedAmountCostPerOrder: 0,
};

type InitialValues = ReturnType<() => typeof initialValues>;

interface IProps {
  handleClose: () => void;
  handleNext: (_values: InitialValues) => void;
  handleGoBack: () => void;
  initialValues: InitialValues;
}

function InverseCopyTradeInfo() {
  return (
    <Popover>
      <PopoverTrigger>
        <div className="w-[14px] h-[14px] flex justify-center items-center">
          <Info />
        </div>
      </PopoverTrigger>
      <PopoverContent
        side="right"
        align="end"
        className="w-[200px] p-3 bg-[rgb(26,26,26,0.9)] backdrop-blur-2xl rounded-md border border-[#2C2C2C] flex flex-col gap-2"
      >
        <div className="flex flex-col gap-1">
          <p className="text-white text-[10px] leading-[1.25] tracking-[-0.4%]">Inverse Copy Trade</p>
          <p className="text-[#A6AEB2] font-light text-[10px] leading-[1.25] tracking-[-0.4%]">
            When enabled, your bot will do the opposite trade
          </p>
        </div>

        <div className="w-full bg-[#2B2B2B] h-[1px]"></div>

        <p className="text-[#A6AEB2] font-light text-[10px] leading-[1.25] tracking-[-0.4%]">
          This allows you to profit when the copied trader loses.
        </p>
      </PopoverContent>
    </Popover>
  );
}

export function SecondStep(props: IProps) {
  const { handleClose, handleNext, handleGoBack, initialValues } = props;
  const onSubmit = (_values: InitialValues) => {
    handleNext(_values);
  };

  return (
    <div className="h-full w-full flex flex-col gap-7 px-4 pb-5 pt-4">
      <div className="h-[40px] flex items-center justify-between">
        <button type="button" className="w-[20px] h-[20px] flex justify-center items-center" onClick={handleGoBack}>
          <CaretDown className="rotate-90" stroke="#fff" />
        </button>
        <div className="text-white text-sm font-semibold leading-[1.25]">Futures Settings</div>
        <button type="button" className="w-[20px] h-[20px] flex justify-center items-center" onClick={handleClose}>
          <Close />
        </button>
      </div>

      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={onSubmit}
        // validateOnBlur={false}
        // validateOnMount={false}
        // validateOnChange={false}
      >
        {(props) => {
          const { values, handleChange, handleBlur, handleSubmit, setFieldValue } = props;
          return (
            <form onSubmit={handleSubmit} className="flex-1 flex flex-col gap-10 block max-w-[420px] mx-auto w-full">
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-1">
                      <p className="text-white text-xs leading-[16px] tracking-[-0.4%]">Position Type</p>

                      <InverseCopyTradeInfo />
                    </div>

                    <div className="flex gap-4 items-center">
                      <button
                        type="button"
                        className="flex items-center gap-1"
                        onClick={() => {
                          setFieldValue("copyMode", 1);
                        }}
                      >
                        <div
                          className={cn(
                            "w-[10px] h-[10px] bg-white rounded-sm border border-[transparent] flex justify-center items-center",
                            values.copyMode === 1 && "border-[#0077FF]",
                          )}
                        >
                          <RenderIf condition={values.copyMode === 1}>
                            <div className="w-[6px] h-[6px] bg-[#0077FF] rounded-sm"></div>
                          </RenderIf>
                        </div>

                        <p className="text-[#A6AEB2] text-xs leading-[16px] tracking-[-0.4%]">Fixed Amount</p>
                      </button>

                      <button
                        type="button"
                        className="flex items-center gap-1"
                        onClick={() => {
                          setFieldValue("copyMode", 2);
                        }}
                      >
                        <div
                          className={cn(
                            "w-[10px] h-[10px] bg-white rounded-sm border border-[transparent] flex justify-center items-center",
                            values.copyMode === 2 && "border-[#0077FF]",
                          )}
                        >
                          <RenderIf condition={values.copyMode === 2}>
                            <div className="w-[6px] h-[6px] bg-[#0077FF] rounded-sm"></div>
                          </RenderIf>
                        </div>

                        <p className="text-[#A6AEB2] text-xs leading-[16px] tracking-[-0.4%]">Fixed Ratio</p>
                      </button>
                    </div>

                    <p className="text-[#A6AEB2] text-[10px] leading-[13px] tracking-[-0.4%]">
                      Each order will be opened with a fixed margin amount.
                    </p>
                  </div>

                  <div className="flex flex-col gap-2">
                    <p className="text-white text-xs leading-[16px] tracking-[-0.4%]">Margin per order (USDC)</p>

                    <div className="flex flex-col">
                      <Input
                        className="h-[40px] w-full border border-[#404040] focus:border-[#404040] outline-none text-[#D7D7D7] !text-xs tracking-[-0.4%] leading-[20px] p-[10px] focus-visible:ring-0"
                        type="number"
                        value={values?.copyMode === 1 ? values.fixedAmountCostPerOrder : ""}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        name="fixedAmountCostPerOrder"
                        placeholder=""
                        disabled={values.copyMode !== 1}
                      />
                      <ErrorMsg name="fixedAmountCostPerOrder" className="text-[10px] tracking-[-0.4%]" />
                    </div>
                    <p className="text-[#A6AEB2] text-[10px] leading-[13px] tracking-[-0.4%]">
                      Each order will be opened with a fixed margin amount.
                    </p>
                  </div>
                </div>
              </div>
              <Button
                type="submit"
                className="bg-white hover:bg-white text-xs leading-[16px] font-semibold text-[#0C0C0C] p-3 rounded-[28px] w-full"
              >
                Continue
              </Button>
            </form>
          );
        }}
      </Formik>
    </div>
  );
}
