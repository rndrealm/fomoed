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
import { useAtomValue } from "jotai";
import { showEditCopyTradeAtom } from "@/lib/atoms/gemach";

const validationSchema = Yup.object().shape({
  profitPercent: Yup.number().required("Please enter take profit percent"),
  lossPercent: Yup.number().required("Please enter stop loss percent"),
});

const initialValues = {
  profitPercent: 0,
  lossPercent: 0,
};

type InitialValues = ReturnType<() => typeof initialValues>;

interface IProps {
  handleClose: () => void;
  handleNext: (_values: InitialValues) => void;
  handleGoBack: () => void;
  initialValues: InitialValues;
  isLoading?: boolean;
}

export function ThirdStep(props: IProps) {
  const { handleClose, handleNext, handleGoBack, initialValues, isLoading = false } = props;

  const showEditCopyTrade = useAtomValue(showEditCopyTradeAtom);

  const onSubmit = (_values: InitialValues) => {
    handleNext(_values);
  };

  return (
    <div className="h-full w-full flex flex-col gap-7 px-4 pb-5 pt-4">
      <div className="h-[40px] flex items-center justify-between">
        <button type="button" className="w-[20px] h-[20px] flex justify-center items-center" onClick={handleGoBack}>
          <CaretDown className="rotate-90" stroke="#fff" />
        </button>
        <div className="text-white text-sm font-semibold leading-[1.25]">Risk Management</div>
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
                    <p className="text-white text-xs leading-[16px] tracking-[-0.4%]">Take Profit (%)</p>

                    <div className="flex flex-col">
                      <Input
                        className="h-[40px] w-full border border-[#404040] focus:border-[#404040] outline-none text-[#D7D7D7] !text-xs tracking-[-0.4%] leading-[20px] p-[10px] focus-visible:ring-0"
                        type="number"
                        value={values.profitPercent}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        name="profitPercent"
                        placeholder="Enter take profit percentage"
                      />
                      <ErrorMsg name="profitPercent" className="text-[10px] tracking-[-0.4%]" />
                    </div>
                    <p className="text-[#A6AEB2] text-[10px] leading-[13px] tracking-[-0.4%]">
                      Each order will be opened with a fixed margin amount.
                    </p>
                  </div>

                  <div className="flex flex-col gap-2">
                    <p className="text-white text-xs leading-[16px] tracking-[-0.4%]">Stop Loss (%)</p>

                    <div className="flex flex-col">
                      <Input
                        className="h-[40px] w-full border border-[#404040] focus:border-[#404040] outline-none text-[#D7D7D7] !text-xs tracking-[-0.4%] leading-[20px] p-[10px] focus-visible:ring-0"
                        type="number"
                        value={values.lossPercent}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        name="lossPercent"
                        placeholder="Enter stop loss percentage"
                      />
                      <ErrorMsg name="lossPercent" className="text-[10px] tracking-[-0.4%]" />
                    </div>
                    <p className="text-[#A6AEB2] text-[10px] leading-[13px] tracking-[-0.4%]">
                      Each order will be opened with a fixed margin amount.
                    </p>
                  </div>
                </div>
              </div>
              <Button
                type="submit"
                className="bg-[#406AC5] hover:bg-[#406AC5] text-xs leading-[16px] font-semibold text-white p-3 rounded-[28px] w-full"
                isLoading={isLoading}
              >
                {showEditCopyTrade ? "Update Copy Trade" : "Create Copy Trade"}
              </Button>
            </form>
          );
        }}
      </Formik>
    </div>
  );
}
