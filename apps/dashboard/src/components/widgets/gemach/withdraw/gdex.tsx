import React, { Fragment, useEffect, useMemo } from "react";
import { toast } from "sonner";
import { useAccount } from "wagmi";
import { Formik } from "formik";
import * as Yup from "yup";
import Image from "next/image";
import dashboard from "@/lib/assets/dashboard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ErrorMsg } from "@/components/auth/text-input";
import { Arbitrum, Learn } from "@/components/icons/icons";
import { useGemachWithdrawFromGdex, useReadGemachBalance } from "@/services/queries/gemach";
import { useSupabaseAuth } from "@/components/providers";

const initialValues = {
  amount: 0,
};

type InitialValues = ReturnType<() => typeof initialValues>;

interface IProps {
  handleClose: () => void;
}

export function Gdex(props: IProps) {
  const { handleClose } = props;

  const { session } = useSupabaseAuth();
  const { address } = useAccount();

  const { data: balanceData } = useReadGemachBalance(session?.access_token);
  const withdrawTokens = useGemachWithdrawFromGdex(session?.access_token);

  const validationSchema = useMemo(() => {
    const maxBalance = balanceData?.gdexBalance || 0;

    return Yup.object().shape({
      amount: Yup.number()
        .min(0, "Amount must be greater than 0")
        .max(maxBalance, `Amount cannot exceed your balance of ${maxBalance.toFixed(2)} USDC`)
        .required("Please enter amount")
        .test("decimal-places", "Amount can have maximum 1 decimal place", (value) => {
          if (value === undefined || value === null) return true;
          const decimalPlaces = (value.toString().split(".")[1] || "").length;
          return decimalPlaces <= 1;
        }),
    });
  }, [balanceData?.gdexBalance]);

  const onSubmit = (_values: InitialValues) => {
    const body = {
      amount: `${_values.amount}`,
      address: address || "",
      to: address || "",
    };

    withdrawTokens.mutate(body, {
      onError: () => {
        toast.error("Something went wrong. Please try again.");
      },
      onSuccess: (response) => {
        const txHash = response?.hash;
        toast.success(
          <>
            Withdraw request submitted successfully. <br />
            <a
              href={`https://arbiscan.io/tx/${txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 underline"
            >
              View on Arbiscan
            </a>
          </>,
          {
            duration: Infinity,
            closeButton: true,
          },
        );

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
              <div className="flex flex-col max-w-[460px] mx-auto w-full h-full gap-6 justify-center">
                <div className="flex flex-col gap-2 w-full">
                  <div className="flex flex-col w-full">
                    <div className="flex flex-col bg-[#0C0C0C] border border-[#181818] rounded-[20px] overflow-hidden w-full">
                      <div className="flex justify-between items-center py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-[30px] h-[30px] rounded-full relative">
                            <Image
                              src={dashboard.gemachLogo}
                              alt="GEMACH Logo"
                              className="w-full h-full object-cover rounded-full"
                            />
                            <div className="w-[16px] h-[16px] rounded-full overflow-hidden absolute bottom-0 right-0">
                              <Image src={dashboard.usdc} alt="usdc Icon" className="w-full h-full object-cover" />
                            </div>
                          </div>
                          <div className="flex flex-col justify-between">
                            <h4 className="text-white text-xs leading-[16px] tracking-[-0.4%]">GDEX Balance</h4>

                            <p className="text-[#A6AEB2] text-[10px] leading-[14px] tracking-[-0.4%]">
                              {balanceData?.gdexBalance?.toFixed(2) || 0.0} USDC
                            </p>
                          </div>
                        </div>

                        <button
                          type="button"
                          className="text-white font-semibold text-xs leading-[16px] tracking-[-0.4%] bg-[#141414] px-2 py-[6px] rounded-[28px]"
                          onClick={() => {
                            setFieldValue("amount", balanceData?.gdexBalance || 0);
                          }}
                        >
                          Use Max
                        </button>
                      </div>
                      <div className="h-[1px] bg-[#181818]"></div>
                      <div className="flex flex-col py-3 px-4">
                        <div className="">
                          <Input
                            className="h-[30px] w-full border-none outline-none text-[#D7D7D7] !text-2xl tracking-[-0.4%] leading-[28px] p-0 focus-visible:ring-0"
                            type="number"
                            value={values.amount}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            name="amount"
                          />
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="w-[16px] h-[16px] flex justify-center items-center rounded-full bg-[#232323]">
                            <p className="text-[#A6AEB2] text-[10px] leading-[10px] tracking-[-0.4%] font-medium">~</p>
                          </div>

                          <p className="text-[#A6AEB2] text-[10px] leading-[14px] tracking-[-0.4%] font-medium">
                            ${values?.amount ? values?.amount?.toFixed(2) : "0.00"}
                          </p>
                        </div>
                      </div>
                    </div>

                    <ErrorMsg name="amount" className="text-[10px] tracking-[-0.4%]" />
                  </div>

                  {/* <p className="text-[#A6AEB2] font-medium leading-[16px] text-[10px]">
                    A $1 fee will be deducted from the USDC withdrawn.
                  </p> */}
                </div>

                <Button
                  type="submit"
                  className="bg-[#406AC5] hover:bg-[#406AC5] text-white font-semibold text-xs leading-[16px] tracking-[-0.4%] p-3 rounded-[28px] w-full"
                  isLoading={withdrawTokens.isPending}
                >
                  Withdraw USDC
                </Button>
              </div>
            </form>
          );
        }}
      </Formik>
      <div className="flex justify-between items-center w-full gap-2">
        <div className="w-[26px] h-[26px] invisible"></div>
        <div className="flex items-center gap-2 rounded-[40px] border border-[#181818] px-[10px] py-[5px]">
          <div className="w-[16px] h-[16px]">
            <Arbitrum />
          </div>
          <p className="text-[#A6AEB2] text-[10px] leading-[16px] font-medium">
            All transactions and Gas fees are on the ARB chain
          </p>
        </div>
        <div className="w-[26px] h-[26px] flex items-center justify-center">
          <Learn />
        </div>
      </div>
    </Fragment>
  );
}
