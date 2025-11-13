import React, { useState } from "react";
import { Formik } from "formik";
import * as Yup from "yup";
import { SubmitButton } from "../auth";
import { CrownWinnerKing } from "../icons/icons";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import CaretDown from "../icons/CaretDown";
import { ErrorMsg } from "../auth/text-input";
import { RenderIf } from "../shared";

const validationSchema = Yup.object().shape({
  platform: Yup.string().required("Please select your trading platform"),
});

const initialValues = {
  platform: "",
};

type InitialValues = ReturnType<() => typeof initialValues>;

interface IProps {
  handleSubmit: (values: InitialValues) => void;
  initialValues: InitialValues;
}

export default function Step3(props: IProps) {
  const { handleSubmit, initialValues } = props;

  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  const onSubmit = (_values: InitialValues) => {
    handleSubmit(_values);
  };

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={onSubmit}
      // validateOnBlur={false}
      // validateOnMount={false}
      // validateOnChange={false}
    >
      {(props) => {
        const { values, handleSubmit, setFieldValue } = props;

        return (
          <form onSubmit={handleSubmit} className="">
            <div className="flex flex-col gap-9">
              <div className="flex flex-col gap-4">
                <p className="text-white leading-[24px] text-base tracking-[-0.6%]">
                  What trading platforms do you trade on?
                </p>
                <div className="flex flex-col gap-1">
                  <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
                    <PopoverTrigger>
                      <div className="h-[48px] rounded-xl bg-[#1A1A1A] border border-[#333333] flex items-center px-3 justify-between cursor-pointer w-full">
                        <div className="flex gap-2 items-center">
                          <p className="text-sm leading-[20px] tracking-[-0.6%] text-white">
                            {values?.platform || "Select an option"}
                          </p>
                          <RenderIf condition={values?.platform === "Fomoed"}>
                            <CrownWinnerKing />
                          </RenderIf>
                        </div>

                        <CaretDown />
                      </div>
                    </PopoverTrigger>
                    <PopoverContent className="w-[var(--radix-popover-trigger-width)] bg-[#131313] border border-[#232323] p-2 mt-2 rounded-[10px]">
                      <div className="flex flex-col gap-2">
                        <button
                          type="button"
                          className="text-left p-2 hover:bg-[#262626] rounded-md"
                          onClick={() => {
                            setFieldValue("platform", "Fomoed");
                            setIsPopoverOpen(false);
                          }}
                        >
                          <div className="flex items-center gap-2">
                            <p className="text-xs leading-[16px] tracking-[-0.4%] text-[#A4A4A4]">Fomoed</p>
                            <CrownWinnerKing />
                          </div>
                        </button>

                        <button
                          type="button"
                          className="text-left p-2 hover:bg-[#262626] rounded-md"
                          onClick={() => {
                            setFieldValue("platform", "CEX (Centralised Exchanges)");
                            setIsPopoverOpen(false);
                          }}
                        >
                          <p className="text-xs leading-[16px] tracking-[-0.4%] text-[#A4A4A4]">
                            CEX (Centralised Exchanges)
                          </p>
                        </button>

                        <button
                          type="button"
                          className="text-left p-2 hover:bg-[#262626] rounded-md"
                          onClick={() => {
                            setFieldValue("platform", "DEX (Decentralised Exchanges)");
                            setIsPopoverOpen(false);
                          }}
                        >
                          <p className="text-xs leading-[16px] tracking-[-0.4%] text-[#A4A4A4]">
                            DEX (Decentralised Exchanges)
                          </p>
                        </button>
                      </div>
                    </PopoverContent>
                  </Popover>

                  <ErrorMsg name="platform" />
                </div>

                <div className="flex items-center justify-center gap-1">
                  {/* <p className="font-light text-xs leading-[20px] tracking-[-0.6%] text-white">press enter</p>
                  <Enter /> */}
                </div>
              </div>

              <div className="">
                <SubmitButton
                  isLoading={false}
                  disabled={false}
                  className="text-xs font-medium leading-[16px] tracking-[-0.4%] text-[#000] rounded-lg"
                >
                  Continue
                </SubmitButton>
              </div>
            </div>
          </form>
        );
      }}
    </Formik>
  );
}
