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
import { showEditCopyTradeAtom } from "@/lib/atoms/gemach";
import { useAtomValue } from "jotai";

const validationSchema = Yup.object().shape({
  oppositeCopy: Yup.boolean().required("Please select a copy mode"),
  copyTradeName: Yup.string().required("Please enter a label"),
  traderWallet: Yup.string()
    .matches(/^0x[a-fA-F0-9]{40}$/, "Please enter a valid evm address")
    .required("Please enter the targeted wallet address"),
});

const initialValues = {
  oppositeCopy: false,
  copyTradeName: "",
  traderWallet: "",
};

type InitialValues = ReturnType<() => typeof initialValues>;

interface IProps {
  handleClose: () => void;
  handleNext: (_values: InitialValues) => void;
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

export function FirstStep(props: IProps) {
  const { handleClose, handleNext, initialValues } = props;
  const showEditCopyTrade = useAtomValue(showEditCopyTradeAtom);

  const onSubmit = (_values: InitialValues) => {
    handleNext(_values);
  };

  console.log("initialValues", initialValues);

  return (
    <div className="h-full w-full flex flex-col gap-4 px-4 pb-5 pt-4">
      <div className="h-[40px] flex items-center justify-between">
        <div className="w-[20px] h-[20px] invisible"></div>
        <div className="text-white text-sm font-semibold leading-[1.25]">
          {showEditCopyTrade ? "Edit" : "Create"} Copy Trade
        </div>
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
            <form onSubmit={handleSubmit} className="flex-1 flex flex-col gap-5 block max-w-[420px] mx-auto w-full">
              <div className="flex flex-col gap-4">
                <p className="text-[#A6AEB2] text-[11px] leading-[13px] tracking-[-0.4%] pb-2 border-b border-[#373737]">
                  <RenderIf condition={!showEditCopyTrade}>
                    Create a new perp copy-trade bot, track and mimic professional perp traders in real-time, automating
                    your leverage trading.
                  </RenderIf>

                  <RenderIf condition={showEditCopyTrade}>
                    Update your perp copy-trade bot, track and mimic professional perp traders in real-time, automating
                    your leverage trading.
                  </RenderIf>
                </p>

                <p className="text-white text-xs leading-[16px] tracking-[-0.4%]">Basic Settings</p>

                <div className="flex flex-col gap-3">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-1">
                      <p className="text-white text-xs leading-[16px] tracking-[-0.4%]">Inverse copy trade</p>

                      <InverseCopyTradeInfo />
                    </div>

                    <div className="flex gap-4 items-center">
                      <button
                        type="button"
                        className="flex items-center gap-1"
                        onClick={() => {
                          setFieldValue("oppositeCopy", false);
                        }}
                      >
                        <div
                          className={cn(
                            "w-[10px] h-[10px] bg-white rounded-sm border border-[transparent] flex justify-center items-center",
                            !values.oppositeCopy && "border-[#0077FF]",
                          )}
                        >
                          <RenderIf condition={!values.oppositeCopy}>
                            <div className="w-[6px] h-[6px] bg-[#0077FF] rounded-sm"></div>
                          </RenderIf>
                        </div>

                        <p className="text-[#A6AEB2] text-xs leading-[16px] tracking-[-0.4%]">No</p>
                      </button>

                      <button
                        type="button"
                        className="flex items-center gap-1"
                        onClick={() => {
                          setFieldValue("oppositeCopy", true);
                        }}
                      >
                        <div
                          className={cn(
                            "w-[10px] h-[10px] bg-white rounded-sm border border-[transparent] flex justify-center items-center",
                            values.oppositeCopy && "border-[#0077FF]",
                          )}
                        >
                          <RenderIf condition={values.oppositeCopy}>
                            <div className="w-[6px] h-[6px] bg-[#0077FF] rounded-sm"></div>
                          </RenderIf>
                        </div>

                        <p className="text-[#A6AEB2] text-xs leading-[16px] tracking-[-0.4%]">Yes</p>
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col">
                    <div className="flex flex-col gap-2">
                      <p className="text-white text-xs leading-[16px] tracking-[-0.4%]">Leader (Targeted Wallet)</p>

                      <Input
                        className="h-[40px] w-full border border-[#404040] focus:border-[#404040] outline-none text-[#D7D7D7] !text-xs tracking-[-0.4%] leading-[20px] p-[10px] focus-visible:ring-0"
                        type="text"
                        value={values.traderWallet}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        name="traderWallet"
                        placeholder="0x1234567890abcdef1234567890abcdef12345678"
                      />
                    </div>
                    <ErrorMsg name="traderWallet" className="text-[10px] tracking-[-0.4%]" />
                  </div>

                  <div className="flex flex-col">
                    <div className="flex flex-col gap-2">
                      <p className="text-white text-xs leading-[16px] tracking-[-0.4%]">Label</p>

                      <Input
                        className="h-[40px] w-full border border-[#404040] focus:border-[#404040] outline-none text-[#D7D7D7] !text-xs tracking-[-0.4%] leading-[20px] p-[10px] focus-visible:ring-0"
                        type="text"
                        value={values.copyTradeName}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        name="copyTradeName"
                        placeholder="Label"
                      />
                    </div>
                    <ErrorMsg name="copyTradeName" className="text-[10px] tracking-[-0.4%]" />
                  </div>
                </div>
              </div>
              <Button
                type="submit"
                className="bg-white hover:bg-white text-xs leading-[16px] font-semibold text-[#0C0C0C] p-3 rounded-[28px] w-full"
              >
                Next
              </Button>
            </form>
          );
        }}
      </Formik>
    </div>
  );
}
