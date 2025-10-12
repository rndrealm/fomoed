import React from "react";
import Image from "next/image";
import { Formik } from "formik";
import * as Yup from "yup";
import { Input } from "@/components/ui/input";
import dashboard from "@/lib/assets/dashboard";
import { Button } from "@/components/ui/button";
import { ErrorMsg } from "@/components/auth/text-input";
import { Arbitrum, Close, Learn } from "@/components/icons/icons";

const validationSchema = Yup.object().shape({
  amount: Yup.number().min(10, "Amount must be greater than 10").required("Please enter amount"),
});

const initialValues = {
  amount: 0,
};

type InitialValues = ReturnType<() => typeof initialValues>;

// max-w-[460px] mx-auto

export function FundTrading() {
  const onSubmit = (_values: InitialValues) => {
    console.log(_values);
  };

  return (
    <div className="w-full h-full bg-[rgb(26,26,26,0.5)] border border-[#222222] rounded-[20px] backdrop-blur-2xl">
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={onSubmit}
        // validateOnBlur={false}
        // validateOnMount={false}
        // validateOnChange={false}
      >
        {(props) => {
          const { values, handleChange, handleBlur, handleSubmit } = props;
          return (
            <form onSubmit={handleSubmit} className="w-full h-full block px-2">
              <div className="flex flex-col gap-6 pt-6 pb-4 px-4 h-full w-full items-center justify-between">
                <div className="flex justify-between items-center w-full">
                  <div className="w-[20px] h-[20px] bg-[red] invisible"></div>
                  <h3 className="text-white text-sm font-bold">Fund Trading Wallet</h3>
                  <button className="w-[20px] h-[20px] flex justify-center items-center">
                    <Close />
                  </button>
                </div>

                <div className="flex flex-col gap-6 max-w-[460px] mx-auto w-full">
                  <div className="flex flex-col gap-2 w-full">
                    <div className="flex flex-col w-full">
                      <div className="flex gap-2">
                        <div className="flex flex-col bg-[#0C0C0C] border border-[#181818] rounded-[20px] overflow-hidden w-full flex-5">
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

                                <p className="text-[#A6AEB2] text-[10px] leading-[14px] tracking-[-0.4%]">0.00 USDC</p>
                              </div>
                            </div>

                            <button
                              type="button"
                              className="text-white font-semibold text-xs leading-[16px] tracking-[-0.4%] bg-[#141414] px-2 py-[6px] rounded-[28px]"
                            >
                              Use Max
                            </button>
                          </div>
                          <div className="h-[1px] bg-[#181818]"></div>
                          <div className="flex flex-col py-3 px-4">
                            <div className="">
                              <Input
                                className="h-[30px] w-full border-none outline-none text-[#D7D7D7] text-2xl tracking-[-0.4%] leading-[28px] p-0 focus-visible:ring-0"
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
                                  $0.00
                                </p>
                              </div>

                              <p className="text-[#A6AEB2] text-[10px] leading-[14px] tracking-[-0.4%] ">
                                Gas fees ~ <span className="text-white font-medium">0.000001ETH</span>
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col bg-[#0C0C0C] border border-[#181818] rounded-[20px] overflow-hidden w-full flex-3">
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

                                <p className="text-[#A6AEB2] text-[10px] leading-[14px] tracking-[-0.4%]">0.00 USDC</p>
                              </div>
                            </div>
                          </div>
                          <div className="h-[1px] bg-[#181818]"></div>
                          <div className="flex flex-col py-3 px-4">
                            <div className="">
                              <Input
                                className="h-[30px] w-full border-none outline-none text-[#D7D7D7] text-2xl tracking-[-0.4%] leading-[28px] p-0 focus-visible:ring-0"
                                type="number"
                                value={values.amount}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                name="amount"
                              />
                            </div>
                            <div className="flex items-center gap-1">
                              <div className="w-[16px] h-[16px] flex justify-center items-center rounded-full bg-[#232323]">
                                <p className="text-[#A6AEB2] text-[10px] leading-[10px] tracking-[-0.4%] font-medium">
                                  ~
                                </p>
                              </div>

                              <p className="text-[#A6AEB2] text-[10px] leading-[14px] tracking-[-0.4%] font-medium">
                                $0.00
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <ErrorMsg name="amount" className="text-[10px] tracking-[-0.4%]" />
                    </div>

                    <p className="text-[#A6AEB2] font-medium leading-[16px] text-[10px]">
                      Min Deposit Amount: <span className="text-white">10 USDC</span>, Deposits take 1-2 minutes to
                      appear in your account.
                    </p>
                  </div>

                  <Button
                    type="submit"
                    className="bg-[#406AC5] hover:bg-[#406AC5] text-white font-semibold text-xs leading-[16px] tracking-[-0.4%] p-3 rounded-[28px] w-full"
                  >
                    Fund Hyperliquid Wallet
                  </Button>
                </div>

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
              </div>
            </form>
          );
        }}
      </Formik>
    </div>
  );
}
