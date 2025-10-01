import React, { Fragment, useMemo } from "react";
import Image from "next/image";
import { Formik } from "formik";
import * as Yup from "yup";
import { Input } from "@/components/ui/input";
import dashboard from "@/lib/assets/dashboard";
import { Button } from "@/components/ui/button";
import { ErrorMsg } from "@/components/auth/text-input";
import { Learn } from "@/components/icons/icons";
import { useGemachWithdrawFromHyperliquid, useReadGemachBalance } from "@/services/queries/gemach";
import { useSupabaseAuth } from "@/components/providers";
import { useAccount } from "wagmi";
import { toast } from "sonner";
import { useAtomValue } from "jotai";

const initialValues = {
  amount: 0,
};

type InitialValues = ReturnType<() => typeof initialValues>;
interface IProps {
  handleClose: () => void;
}

export function Hyperliquid(props: IProps) {
  const { handleClose } = props;
  const { session } = useSupabaseAuth();
  const { address } = useAccount();

  const withdrawMutation = useGemachWithdrawFromHyperliquid(session?.access_token);
  const { data: balanceData } = useReadGemachBalance(session?.access_token);

  const validationSchema = useMemo(() => {
    const maxBalance = balanceData?.hyperliquidBalance || 0;

    return Yup.object().shape({
      amount: Yup.number()
        .min(1, "Amount must be greater than 1")
        .max(maxBalance, `Amount cannot exceed your balance of ${maxBalance.toFixed(2)} USDC`)
        .test("decimal-places", "Amount can have maximum 1 decimal place", (value) => {
          if (value === undefined || value === null) return true;
          const decimalPlaces = (value.toString().split(".")[1] || "").length;
          return decimalPlaces <= 1;
        })
        .required("Please enter amount"),
    });
  }, [balanceData?.hyperliquidBalance]);

  const onSubmit = (_values: InitialValues) => {
    const body = {
      amount: `${_values.amount}`,
      address: address || "",
      // address: "0x7d688d8b3b7db1571bf9319467d3082aeeb18284", // temp hardcoded address for testing
    };

    withdrawMutation.mutate(body, {
      onError: () => {
        toast.error("Something went wrong. Please try again.");
      },
      onSuccess: () => {
        toast.success("Withdraw request submitted successfully. Withdrawals may take up to 2mins to process.");
        handleClose();
      },
    });
  };

  return (
    <Fragment>
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
            <form onSubmit={handleSubmit} className="w-full h-full block">
              <div className="flex flex-col gap-6 pt-6 pb-4 px-4 h-full w-full items-center justify-between">
                <div className="flex flex-col gap-6 max-w-[460px] mx-auto w-full">
                  <div className="flex flex-col gap-2 w-full">
                    <div className="flex flex-col w-full">
                      <div className="flex gap-2">
                        <div className="flex flex-col bg-[#0C0C0C] border border-[#181818] rounded-[20px] overflow-hidden w-full flex-5">
                          <div className="flex justify-between items-center py-3 px-4">
                            <div className="flex items-center gap-2">
                              <div className="w-[30px] h-[30px] rounded-full relative bg-white flex justify-center items-center">
                                <Image src={dashboard.hyperliquidLogo} alt="Hyperliquid Logo" className="" />
                                <div className="w-[16px] h-[16px] rounded-full overflow-hidden absolute bottom-0 right-0">
                                  <Image src={dashboard.usdc} alt="usdc Icon" className="w-full h-full object-cover" />
                                </div>
                              </div>
                              <div className="flex flex-col justify-between">
                                <h4 className="text-white text-xs leading-[16px] tracking-[-0.4%]">Hyperliquid</h4>

                                <p className="text-[#A6AEB2] text-[10px] leading-[14px] tracking-[-0.4%]">
                                  {balanceData?.hyperliquidBalance?.toFixed(2) || 0.0} USDC
                                </p>
                              </div>
                            </div>

                            <button
                              type="button"
                              className="text-white font-semibold text-xs leading-[16px] tracking-[-0.4%] bg-[#141414] px-2 py-[6px] rounded-[28px]"
                              onClick={() => {
                                setFieldValue("amount", balanceData?.hyperliquidBalance || 0);
                              }}
                            >
                              Use Max
                            </button>
                          </div>
                          <div className="h-[1px] bg-[#181818]"></div>
                          <div className="flex flex-col py-3 px-4 ">
                            <div className="">
                              <Input
                                className="h-[30px] w-full border-none outline-none text-[#D7D7D7] text-2xl tracking-[-0.4%] leading-[28px] p-0 focus-visible:ring-0 !text-2xl"
                                type="number"
                                value={values.amount}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                name="amount"
                              />
                            </div>
                            <div className="flex justify-between items-center">
                              <div className="flex items-center gap-1">
                                <div className="w-[16px] h-[16px] flex justify-center items-center rounded-full bg-[#232323]">
                                  <p className="text-[#A6AEB2] text-[10px] leading-[10px] tracking-[-0.4%] font-medium">
                                    ~
                                  </p>
                                </div>

                                <p className="text-[#A6AEB2] text-[10px] leading-[14px] tracking-[-0.4%] font-medium">
                                  ${values?.amount ? values?.amount?.toFixed(2) : "0.00"}
                                </p>
                              </div>

                              <p className="text-[#A6AEB2] text-[10px] leading-[14px] tracking-[-0.4%] ">
                                Gas fees ~ <span className="text-white font-medium">0.00001ETH</span>
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col bg-[#0C0C0C] border border-[#181818] rounded-[20px] overflow-hidden w-full flex-3">
                          <div className="flex justify-between items-center py-3 px-4">
                            <div className="flex items-center gap-2">
                              <div className="w-[30px] h-[30px] rounded-full relative bg-white flex justify-center items-center">
                                <Image
                                  src={dashboard.gemachLogo}
                                  alt="GEMACH Logo"
                                  className="w-full h-full object-cover rounded-full"
                                />
                                <div className="w-[16px] h-[16px] rounded-full overflow-hidden absolute bottom-0 right-0">
                                  <Image src={dashboard.usdc} alt="usdc Icon" className="w-full h-full object-cover" />
                                </div>
                              </div>
                              <div className="flex flex-col justify-between flex-1">
                                <h4 className="text-white text-xs leading-[16px] tracking-[-0.4%]">GDEX Balance</h4>

                                <p className="text-[#A6AEB2] text-[10px] leading-[14px] tracking-[-0.4%]">
                                  {balanceData?.gdexBalance?.toFixed(2) || 0.0} USDC
                                </p>
                              </div>
                            </div>
                          </div>
                          <div className="h-[1px] bg-[#181818]"></div>
                          <div className="flex flex-col py-3 px-4">
                            <div className="">
                              <Input
                                className="h-[30px] w-full border-none outline-none text-[#D7D7D7] text-2xl tracking-[-0.4%] leading-[28px] p-0 focus-visible:ring-0 !text-2xl"
                                type="number"
                                value={values.amount}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                name="amount"
                                disabled
                              />
                            </div>
                            <div className="flex items-center gap-1">
                              <div className="w-[16px] h-[16px] flex justify-center items-center rounded-full bg-[#232323]">
                                <p className="text-[#A6AEB2] text-[10px] leading-[10px] tracking-[-0.4%] font-medium">
                                  ~
                                </p>
                              </div>

                              <p className="text-[#A6AEB2] text-[10px] leading-[14px] tracking-[-0.4%] font-medium">
                                ${values?.amount ? values?.amount?.toFixed(2) : "0.00"}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <ErrorMsg name="amount" className="text-[10px] tracking-[-0.4%]" />
                    </div>

                    <p className="text-[#A6AEB2] font-medium leading-[16px] text-[10px]">
                      A $1 fee will be deducted from the USDC withdrawn.
                    </p>
                  </div>

                  <Button
                    type="submit"
                    className="bg-[#406AC5] hover:bg-[#406AC5] text-white font-semibold text-xs leading-[16px] tracking-[-0.4%] p-3 rounded-[28px] w-full"
                    isLoading={withdrawMutation.isPending}
                  >
                    Withdraw
                  </Button>
                </div>
              </div>
            </form>
          );
        }}
      </Formik>
      <div className="flex justify-between items-center w-full gap-2">
        <div className="w-[26px] h-[26px] invisible"></div>
        <div className="flex items-center gap-2 rounded-[40px] border border-[#181818] px-[10px] py-[5px]">
          <p className="text-[#A6AEB2] text-[10px] leading-[16px] font-medium text-center">
            For best results, start with smaller position sizes and diversify across multiple traders.
          </p>
        </div>
        <div className="w-[26px] h-[26px] flex items-center justify-center">
          <Learn />
        </div>
      </div>
    </Fragment>
  );
}
